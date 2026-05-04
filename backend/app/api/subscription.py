from flask import jsonify
from app.api import api_bp
from app.api.utils import get_current_user
from app import db
from app.models.subscription import UserSubscription


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


@api_bp.route('/subscription/subscribe', methods=['POST'])
def subscription_subscribe():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    return jsonify({
        'message': 'Payment integration coming soon.',
        'price_gbp': 2.99,
        'redirect_url': None,
    }), 200
