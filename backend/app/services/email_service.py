import os
import requests as _requests


def _send_brevo(to_addr: str, subject: str, html: str) -> tuple[bool, str]:
    api_key   = os.environ.get('BREVO_API_KEY', '')
    from_email = os.environ.get('FROM_EMAIL', 'gautammunna1981@gmail.com')
    from_name  = os.environ.get('FROM_NAME', 'DragonHour')

    if not api_key:
        print('[email] BREVO_API_KEY not set — skipping')
        return False, 'BREVO_API_KEY not set'

    try:
        resp = _requests.post(
            'https://api.brevo.com/v3/smtp/email',
            headers={'api-key': api_key, 'Content-Type': 'application/json'},
            json={
                'sender':      {'name': from_name, 'email': from_email},
                'to':          [{'email': to_addr}],
                'subject':     subject,
                'htmlContent': html,
            },
            timeout=30,
        )
        if resp.ok:
            print(f'[email] Sent "{subject}" to {to_addr}')
            return True, 'ok'
        print(f'[email] {resp.status_code} sending to {to_addr}: {resp.text}')
        return False, f'HTTP {resp.status_code}: {resp.text}'
    except Exception as e:
        print(f'[email] Error sending to {to_addr}: {e}')
        return False, str(e)


def send_welcome_email(to_addr: str, username: str):
    app_url = os.environ.get('APP_URL', 'https://dragonhour.app')

    html = f"""<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:20px;background:#f8f6ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(124,58,237,.10);">
    <div style="background:linear-gradient(135deg,#7c3aed,#5b21b6);padding:36px;text-align:center;">
      <div style="font-size:52px;line-height:1;margin-bottom:12px;">🐉</div>
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Welcome to DragonHour</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin-top:0;color:#3b0764;font-size:16px;">Hi <strong>{username}</strong>,</p>
      <p style="color:#4b5563;line-height:1.7;font-size:15px;">
        Your account is ready. Set up your Bazi birth chart to unlock personalised readings — takes about 2 minutes.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{app_url}/profile"
           style="background:#7c3aed;color:#fff;text-decoration:none;padding:14px 36px;
                  border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
          Set Up My Bazi Profile &rarr;
        </a>
      </div>
      <ul style="color:#4b5563;font-size:14px;line-height:2;padding-left:20px;margin-top:0;">
        <li>Your Day Master element and its strengths</li>
        <li>Daily energy forecasts tailored to you</li>
        <li>Auspicious hours for work, decisions &amp; rest</li>
        <li>10-year Luck Pillar cycle</li>
      </ul>
      <p style="color:#9ca3af;font-size:13px;margin-bottom:0;">
        See you inside,<br><strong style="color:#7c3aed;">The DragonHour Team</strong>
      </p>
    </div>
  </div>
</body>
</html>"""

    _send_brevo(to_addr, 'Welcome to DragonHour 🐉', html)


def send_reset_email(to_addr: str, username: str, reset_url: str):
    html = f"""<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:20px;background:#f8f6ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(124,58,237,.10);">
    <div style="background:linear-gradient(135deg,#7c3aed,#5b21b6);padding:32px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">🔑</div>
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Password Reset</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin-top:0;color:#3b0764;font-size:15px;">Hi <strong>{username}</strong>,</p>
      <p style="color:#4b5563;line-height:1.7;font-size:14px;">
        We received a request to reset your DragonHour password. Click the button below — this link expires in <strong>1 hour</strong>.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{reset_url}"
           style="background:#7c3aed;color:#fff;text-decoration:none;padding:14px 36px;
                  border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
          Reset My Password &rarr;
        </a>
      </div>
      <p style="color:#9ca3af;font-size:12px;line-height:1.6;">
        If you didn't request this, you can safely ignore this email — your password won't change.<br><br>
        Or copy this link: <span style="color:#7c3aed;word-break:break-all;">{reset_url}</span>
      </p>
    </div>
  </div>
</body>
</html>"""
    _send_brevo(to_addr, 'Reset your DragonHour password', html)


def send_test_email(to_addr: str) -> tuple[bool, str]:
    return _send_brevo(
        to_addr,
        'DragonHour — test email',
        '<p>Test email from DragonHour admin panel ✓</p>',
    )
