from datetime import datetime, timedelta
from flask import request, jsonify
from app.api import api_bp
from app.api.utils import admin_required
from app import db
from app.models.user import User
from app.models.subscription import UserSubscription


def _sub_detail(sub):
    """Serialize subscription with extra fields useful for admin."""
    if not sub:
        return None
    d = sub.to_dict()
    d['plan']                   = sub.plan
    d['stripe_customer_id']     = sub.stripe_customer_id
    d['stripe_subscription_id'] = sub.stripe_subscription_id
    d['id']                     = sub.id
    return d


def _user_with_sub(user):
    d = user.to_dict()
    sub = UserSubscription.query.filter_by(user_id=user.id).first()
    d['subscription'] = _sub_detail(sub)
    return d


# ── Stats ─────────────────────────────────────────────────────────────────────

@api_bp.route('/admin/stats', methods=['GET'])
@admin_required
def admin_stats(current_admin):
    total_users   = User.query.count()
    total_admins  = User.query.filter_by(is_admin=True).count()
    now = datetime.utcnow()

    active_subs   = UserSubscription.query.filter(
        UserSubscription.subscribed_until > now,
        UserSubscription.is_cancelled == False,
    ).count()
    active_trials = UserSubscription.query.filter(
        UserSubscription.trial_end > now,
        UserSubscription.subscribed_until == None,
    ).count()
    expired       = UserSubscription.query.filter(
        UserSubscription.trial_end <= now,
        UserSubscription.subscribed_until == None,
    ).count()

    return jsonify({
        'total_users':   total_users,
        'total_admins':  total_admins,
        'active_subs':   active_subs,
        'active_trials': active_trials,
        'expired':       expired,
    }), 200


# ── User list ─────────────────────────────────────────────────────────────────

@api_bp.route('/admin/users', methods=['GET'])
@admin_required
def admin_list_users(current_admin):
    try:
        search = (request.args.get('search') or '').strip()
        page   = max(1, int(request.args.get('page', 1)))
        limit  = min(100, int(request.args.get('limit', 50)))

        query = User.query
        if search:
            like  = f'%{search}%'
            query = query.filter(
                (User.email.ilike(like)) | (User.username.ilike(like))
            )
        query = query.order_by(User.id.asc())

        total = query.count()
        users = query.offset((page - 1) * limit).limit(limit).all()

        return jsonify({
            'users':  [_user_with_sub(u) for u in users],
            'total':  total,
            'page':   page,
            'pages':  (total + limit - 1) // limit,
        }), 200
    except Exception as e:
        print(f'[admin/users] error: {e}')
        return jsonify({'error': str(e)}), 500


# ── Single user ───────────────────────────────────────────────────────────────

@api_bp.route('/admin/users/<int:user_id>', methods=['GET'])
@admin_required
def admin_get_user(current_admin, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': _user_with_sub(user)}), 200


@api_bp.route('/admin/users/<int:user_id>', methods=['PATCH'])
@admin_required
def admin_update_user(current_admin, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Prevent stripping your own admin rights
    if user.id == current_admin.id and 'is_admin' in (request.get_json() or {}):
        data = request.get_json()
        if not data.get('is_admin', True):
            return jsonify({'error': 'Cannot remove your own admin rights'}), 400

    data = request.get_json() or {}
    if 'username' in data:
        user.username = data['username'].strip()
    if 'email' in data:
        new_email = data['email'].strip().lower()
        if new_email != user.email and User.query.filter_by(email=new_email).first():
            return jsonify({'error': 'Email already in use'}), 409
        user.email = new_email
    if 'is_admin' in data:
        user.is_admin = bool(data['is_admin'])

    db.session.commit()
    return jsonify({'user': _user_with_sub(user)}), 200


@api_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def admin_delete_user(current_admin, user_id):
    if user_id == current_admin.id:
        return jsonify({'error': 'Cannot delete your own account'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': f'User {user.email} deleted'}), 200


# ── Subscription override ─────────────────────────────────────────────────────

@api_bp.route('/admin/users/<int:user_id>/subscription', methods=['PATCH'])
@admin_required
def admin_override_subscription(current_admin, user_id):
    """
    Actions:
      grant        – set subscribed_until = now + days (default 31)
      revoke       – clear subscribed_until, mark cancelled
      extend_trial – push trial_end forward by days (default 7)
      reset_trial  – restart a fresh 7-day trial from now
      set_plan     – change plan field only ('monthly' | 'annual')
      direct       – set raw ISO date fields (subscribed_until, trial_end)
    """
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    sub = UserSubscription.query.filter_by(user_id=user_id).first()
    if not sub:
        sub = UserSubscription(user_id=user_id)
        db.session.add(sub)

    data   = request.get_json() or {}
    action = data.get('action', 'direct')
    now    = datetime.utcnow()

    if action == 'grant':
        days = int(data.get('days', 31))
        sub.subscribed_until = now + timedelta(days=days)
        sub.is_cancelled     = False
        if 'plan' in data:
            sub.plan = data['plan']

    elif action == 'revoke':
        sub.subscribed_until = None
        sub.is_cancelled     = True

    elif action == 'extend_trial':
        days = int(data.get('days', 7))
        base = sub.trial_end if sub.trial_end and sub.trial_end > now else now
        sub.trial_end = base + timedelta(days=days)

    elif action == 'reset_trial':
        sub.trial_start = now
        sub.trial_end   = now + timedelta(days=UserSubscription.TRIAL_DAYS)

    elif action == 'set_plan':
        if data.get('plan') in ('monthly', 'annual'):
            sub.plan = data['plan']

    elif action == 'direct':
        if 'subscribed_until' in data:
            sub.subscribed_until = datetime.fromisoformat(data['subscribed_until']) if data['subscribed_until'] else None
        if 'trial_end' in data:
            sub.trial_end = datetime.fromisoformat(data['trial_end']) if data['trial_end'] else None
        if 'trial_start' in data:
            sub.trial_start = datetime.fromisoformat(data['trial_start']) if data['trial_start'] else None
        if 'is_cancelled' in data:
            sub.is_cancelled = bool(data['is_cancelled'])
        if 'plan' in data:
            sub.plan = data['plan']

    else:
        return jsonify({'error': f'Unknown action: {action}'}), 400

    db.session.commit()
    return jsonify({'subscription': _sub_detail(sub)}), 200
