import os
import stripe
from datetime import datetime, timedelta
from flask import jsonify, request
from app.api import api_bp
from app.api.utils import get_current_user
from app import db
from app.models.subscription import UserSubscription

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')

PRICE_IDS = {
    'monthly': os.environ.get('STRIPE_PRICE_MONTHLY', ''),
    'annual':  os.environ.get('STRIPE_PRICE_ANNUAL', ''),
}

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

    data = request.get_json() or {}
    plan = data.get('plan', 'monthly')
    if plan not in PRICE_IDS:
        return jsonify({'error': 'Invalid plan. Use "monthly" or "annual".'}), 400

    price_id = PRICE_IDS[plan]
    if not price_id:
        return jsonify({'error': 'Stripe price not configured for this plan.'}), 500

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
        session            = event['data']['object']
        user_id            = session.get('metadata', {}).get('user_id')
        plan               = session.get('metadata', {}).get('plan', 'monthly')
        stripe_sub_id      = session.get('subscription')
        stripe_customer_id = session.get('customer')

        if user_id:
            sub = UserSubscription.query.filter_by(user_id=int(user_id)).first()
            if not sub:
                sub = UserSubscription(user_id=int(user_id))
                db.session.add(sub)

            days = PLAN_DAYS.get(plan, 31)
            sub.subscribed_until       = datetime.utcnow() + timedelta(days=days)
            sub.stripe_subscription_id = stripe_sub_id
            sub.stripe_customer_id     = stripe_customer_id
            sub.plan                   = plan
            sub.is_cancelled           = False
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
