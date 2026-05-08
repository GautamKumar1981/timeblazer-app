import os
import stripe
from datetime import datetime, timedelta
from flask import jsonify, request
from app.api import api_bp
from app.api.utils import get_current_user
from app import db
from app.models.subscription import UserSubscription

PLAN_DAYS = {
    'monthly': 31,
    'annual':  366,
}



@api_bp.route('/subscription/status', methods=['GET'])
def subscription_status():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    sub = UserSubscription.query.filter_by(user_id=user.id).first()
    if not sub:
        sub = UserSubscription(user_id=user.id)
        sub.start_trial()
        db.session.add(sub)
        db.session.commit()

    return jsonify({'subscription': sub.to_dict()}), 200


@api_bp.route('/subscription/create-checkout', methods=['POST'])
def create_checkout():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    # Read at request time so Railway env var changes take effect without redeploy
    stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')
    price_ids = {
        'monthly': os.environ.get('STRIPE_PRICE_MONTHLY', ''),
        'annual':  os.environ.get('STRIPE_PRICE_ANNUAL', ''),
    }

    data = request.get_json() or {}
    plan = data.get('plan', 'monthly')
    if plan not in price_ids:
        return jsonify({'error': 'Invalid plan. Use "monthly" or "annual".'}), 400

    price_id = price_ids[plan]
    if not price_id:
        return jsonify({'error': f'Stripe price not configured for plan: {plan}. Set STRIPE_PRICE_{plan.upper()} in Railway.'}), 500

    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

    try:
        session = stripe.checkout.Session.create(
            customer_email=user.email,
            payment_method_types=['card'],
            line_items=[{'price': price_id, 'quantity': 1}],
            mode='subscription',
            success_url=frontend_url + '/settings?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=frontend_url + '/upgrade',
            metadata={'user_id': str(user.id), 'plan': plan},
        )
        return jsonify({'url': session.url}), 200
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e.user_message)}), 500


@api_bp.route('/subscription/verify-session', methods=['POST'])
def verify_session():
    """Called by frontend after Stripe redirects back — verifies payment and activates subscription."""
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')
    data       = request.get_json() or {}
    session_id = data.get('session_id', '')

    if not session_id:
        return jsonify({'error': 'Missing session_id'}), 400

    try:
        checkout_session = stripe.checkout.Session.retrieve(session_id)
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e)}), 400

    # Make sure this session was created for this user
    if str(checkout_session.get('metadata', {}).get('user_id', '')) != str(user.id):
        return jsonify({'error': 'Session does not belong to this account'}), 403

    if checkout_session.get('payment_status') != 'paid':
        return jsonify({'error': 'Payment not completed', 'payment_status': checkout_session.get('payment_status')}), 400

    plan  = checkout_session.get('metadata', {}).get('plan', 'monthly')
    days  = PLAN_DAYS.get(plan, 31)
    until = datetime.utcnow() + timedelta(days=days)

    db.session.execute(db.text(
        "INSERT INTO user_subscriptions (user_id, subscribed_until, is_cancelled) "
        "VALUES (:uid, :until, FALSE) "
        "ON CONFLICT (user_id) DO UPDATE "
        "SET subscribed_until = :until, is_cancelled = FALSE"
    ), {'uid': user.id, 'until': until})
    db.session.commit()

    sub = UserSubscription.query.filter_by(user_id=user.id).first()
    return jsonify({'subscription': sub.to_dict()}), 200


@api_bp.route('/subscription/cancel', methods=['POST'])
def cancel_subscription():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    sub = UserSubscription.query.filter_by(user_id=user.id).first()
    if not sub or not sub.is_subscribed:
        return jsonify({'error': 'No active subscription found'}), 400

    stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')

    if sub.stripe_subscription_id:
        try:
            stripe.Subscription.modify(sub.stripe_subscription_id, cancel_at_period_end=True)
        except Exception:
            pass

    # Keep subscribed_until intact so user retains access until period end
    db.session.execute(db.text(
        "UPDATE user_subscriptions SET is_cancelled = TRUE WHERE user_id = :uid"
    ), {'uid': user.id})
    db.session.commit()

    sub = UserSubscription.query.filter_by(user_id=user.id).first()
    return jsonify({'subscription': sub.to_dict()}), 200


@api_bp.route('/subscription/webhook', methods=['POST'])
def subscription_webhook():
    payload        = request.data
    sig            = request.headers.get('Stripe-Signature', '')
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

    try:
        event = stripe.Webhook.construct_event(payload, sig, webhook_secret)
    except (stripe.error.SignatureVerificationError, ValueError):
        return '', 400

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('metadata', {}).get('user_id')
        plan    = session.get('metadata', {}).get('plan', 'monthly')

        if user_id:
            uid   = int(user_id)
            days  = PLAN_DAYS.get(plan, 31)
            until = datetime.utcnow() + timedelta(days=days)

            # Raw SQL UPSERT — only touches guaranteed columns, avoids issues
            # with Stripe columns that may not exist in the DB yet
            db.session.execute(db.text(
                "INSERT INTO user_subscriptions (user_id, subscribed_until, is_cancelled) "
                "VALUES (:uid, :until, FALSE) "
                "ON CONFLICT (user_id) DO UPDATE "
                "SET subscribed_until = :until, is_cancelled = FALSE"
            ), {'uid': uid, 'until': until})
            db.session.commit()

            # Try each Stripe column via raw SQL — skips gracefully if column absent
            for col, val in [
                ('stripe_subscription_id', session.get('subscription')),
                ('stripe_customer_id',     session.get('customer')),
                ('plan',                   plan),
            ]:
                if val:
                    try:
                        db.session.execute(db.text(
                            f"UPDATE user_subscriptions SET {col} = :val WHERE user_id = :uid"
                        ), {'val': val, 'uid': uid})
                        db.session.commit()
                    except Exception:
                        db.session.rollback()

    elif event['type'] == 'customer.subscription.deleted':
        sub_obj       = event['data']['object']
        stripe_sub_id = sub_obj.get('id')
        try:
            db.session.execute(db.text(
                "UPDATE user_subscriptions "
                "SET subscribed_until = NULL, is_cancelled = TRUE "
                "WHERE stripe_subscription_id = :sid"
            ), {'sid': stripe_sub_id})
            db.session.commit()
        except Exception:
            db.session.rollback()

    return '', 200
