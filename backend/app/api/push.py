from flask import request, jsonify
from app.api import api_bp
from app.api.utils import get_current_user, admin_required
from app import db
from app.models.push_subscription import PushSubscription


@api_bp.route('/push/subscribe', methods=['POST'])
def push_subscribe():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    data     = request.get_json() or {}
    endpoint = data.get('endpoint', '')
    keys     = data.get('keys') or {}
    p256dh   = keys.get('p256dh', '')
    auth     = keys.get('auth', '')

    if not all([endpoint, p256dh, auth]):
        return jsonify({'error': 'endpoint, keys.p256dh and keys.auth are required'}), 400

    existing = PushSubscription.query.filter_by(endpoint=endpoint).first()
    if existing:
        existing.user_id = user.id
        existing.p256dh  = p256dh
        existing.auth    = auth
    else:
        db.session.add(PushSubscription(
            user_id=user.id, endpoint=endpoint, p256dh=p256dh, auth=auth
        ))
    db.session.commit()
    return jsonify({'message': 'Subscribed'}), 200


@api_bp.route('/push/unsubscribe', methods=['POST'])
def push_unsubscribe():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    data     = request.get_json() or {}
    endpoint = data.get('endpoint', '')

    if endpoint:
        PushSubscription.query.filter_by(user_id=user.id, endpoint=endpoint).delete()
    else:
        PushSubscription.query.filter_by(user_id=user.id).delete()
    db.session.commit()
    return jsonify({'message': 'Unsubscribed'}), 200


@api_bp.route('/push/status', methods=['GET'])
def push_status():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    count = PushSubscription.query.filter_by(user_id=user.id).count()
    return jsonify({'subscribed': count > 0, 'count': count}), 200


@api_bp.route('/push/send-test', methods=['POST'])
def push_send_test():
    import os
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    if not os.environ.get('VAPID_PRIVATE_KEY'):
        return jsonify({'error': 'VAPID_PRIVATE_KEY not set in Railway Variables'}), 400

    from app.models.push_subscription import PushSubscription
    subs = PushSubscription.query.filter_by(user_id=user.id).all()
    if not subs:
        return jsonify({'error': 'No push subscription found — toggle notifications on first'}), 400

    from app.services.push_service import send_push_to_user
    sent = send_push_to_user(user.id, 'DragonHour 🐉', 'Push notifications are working!', '/dashboard')
    if sent:
        return jsonify({'message': f'Test notification sent to {sent} device(s)'}), 200
    return jsonify({'error': 'Send failed — check Railway logs for details'}), 500


@api_bp.route('/push/send-all', methods=['POST'])
@admin_required
def push_send_all(current_admin):
    data  = request.get_json() or {}
    title = data.get('title', 'DragonHour')
    body  = data.get('body', '')
    url   = data.get('url', '/dashboard')

    if not body:
        return jsonify({'error': 'body is required'}), 400

    from app.services.push_service import send_push_to_all
    sent, failed = send_push_to_all(title, body, url)
    return jsonify({'sent': sent, 'failed': failed}), 200
