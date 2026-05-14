import os
import json
from pywebpush import webpush, WebPushException
from app import db
from app.models.push_subscription import PushSubscription


def _vapid_claims():
    email = os.environ.get('VAPID_EMAIL', 'noreply@dragonhour.app')
    if '<' in email:
        email = email.split('<')[-1].rstrip('>')
    return {'sub': f'mailto:{email}'}


def _send_one(sub: PushSubscription, title: str, body: str, url: str) -> bool:
    private_key = os.environ.get('VAPID_PRIVATE_KEY', '')
    if not private_key:
        print('[push] VAPID_PRIVATE_KEY not set in Railway Variables', flush=True)
        return False
    try:
        webpush(
            subscription_info={
                'endpoint': sub.endpoint,
                'keys': {'p256dh': sub.p256dh, 'auth': sub.auth},
            },
            data=json.dumps({'title': title, 'body': body, 'url': url}),
            vapid_private_key=private_key,
            vapid_claims=_vapid_claims(),
            content_encoding='aes128gcm',
            ttl=86400,
        )
        print(f'[push] sent to sub {sub.id}', flush=True)
        return True
    except WebPushException as e:
        resp = getattr(e, 'response', None)
        resp_text = resp.text if resp else ''
        print(f'[push] WebPushException sub {sub.id}: {e} body={resp_text}', flush=True)
        if hasattr(e, 'response') and e.response and e.response.status_code in (404, 410):
            db.session.delete(sub)
            db.session.commit()
        return False
    except Exception as e:
        print(f'[push] unexpected error sub {sub.id}: {type(e).__name__}: {e}', flush=True)
        return False


def send_push_to_user(user_id: int, title: str, body: str, url: str = '/dashboard') -> int:
    subs = PushSubscription.query.filter_by(user_id=user_id).all()
    return sum(_send_one(s, title, body, url) for s in subs)


def send_push_to_all(title: str, body: str, url: str = '/dashboard'):
    subs  = PushSubscription.query.all()
    sent  = sum(_send_one(s, title, body, url) for s in subs)
    failed = len(subs) - sent
    return sent, failed
