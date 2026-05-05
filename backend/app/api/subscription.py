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


@api_bp.route('/subscription/migrate', methods=['POST'])
def subscription_migrate():
    """One-time migration: add Stripe columns and reset subscriptions for re-testing."""
    try:
        db.session.execute(db.text(
            "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)"
        ))
        db.session.execute(db.text(
            "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255)"
        ))
        db.session.execute(db.text(
            "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS plan VARCHAR(20)"
        ))
        db.session.execute(db.text(
            "UPDATE user_subscriptions SET subscribed_until = NULL, is_cancelled = FALSE"
        ))
        db.session.commit()
        return jsonify({'status': 'ok', 'message': 'Migration complete. Subscriptions reset.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


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
            success_url=frontend_url + '/settings?subscribed=true',
            cancel_url=frontend_url + '/upgrade',
            metadata={'user_id': str(user.id), 'plan': plan},
        )
        return jsonify({'url': session.url}), 200
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e.user_message)}), 500


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
            sub = UserSubscription.query.filter_by(user_id=int(user_id)).first()
            if not sub:
                sub = UserSubscription(user_id=int(user_id))
                db.session.add(sub)

            days = PLAN_DAYS.get(plan, 31)
            sub.subscribed_until = datetime.utcnow() + timedelta(days=days)
            sub.is_cancelled     = False

            # Store Stripe IDs if the columns exist (added in later migration)
            for col, val in [
                ('stripe_subscription_id', session.get('subscription')),
                ('stripe_customer_id',     session.get('customer')),
                ('plan',                   plan),
            ]:
                try:
                    setattr(sub, col, val)
                except Exception:
                    pass

            db.session.commit()

    elif event['type'] == 'customer.subscription.deleted':
        sub_obj       = event['data']['object']
        stripe_sub_id = sub_obj.get('id')
        sub = UserSubscription.query.filter_by(
            stripe_subscription_id=stripe_sub_id
        ).first()
        if sub:
            sub.subscribed_until = None
            sub.is_cancelled     = True
            db.session.commit()

    return '', 200
