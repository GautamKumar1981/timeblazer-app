import os
import smtplib
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def _send(msg_dict: dict):
    host = os.environ.get('SMTP_HOST', '')
    port = int(os.environ.get('SMTP_PORT', 587))
    user = os.environ.get('SMTP_USER', '')
    password = os.environ.get('SMTP_PASS', '')

    if not host or not user:
        print('[email] SMTP not configured — skipping send')
        return

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = msg_dict['subject']
        msg['From']    = msg_dict['from_addr']
        msg['To']      = msg_dict['to_addr']
        msg.attach(MIMEText(msg_dict['text'], 'plain'))
        msg.attach(MIMEText(msg_dict['html'], 'html'))

        with smtplib.SMTP(host, port) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(user, password)
            smtp.sendmail(msg_dict['from_addr'], msg_dict['to_addr'], msg.as_string())

        print(f'[email] Sent "{msg_dict["subject"]}" to {msg_dict["to_addr"]}')
    except Exception as e:
        print(f'[email] Failed to send to {msg_dict["to_addr"]}: {e}')


def send_async(msg_dict: dict):
    threading.Thread(target=_send, args=(msg_dict,), daemon=True).start()


def send_welcome_email(to_addr: str, username: str):
    from_addr = os.environ.get('FROM_EMAIL') or os.environ.get('SMTP_USER', '')
    app_url   = os.environ.get('APP_URL', 'https://dragonhour.app')

    text = f"""Hi {username},

Welcome to DragonHour! Your account is ready.

To get your personalised Bazi readings, set up your birth chart (takes ~2 minutes):
{app_url}/profile

Once set up you'll unlock:
  • Your Day Master element and its strengths
  • Daily energy forecasts tailored to you
  • Auspicious hours for work, decisions, and rest
  • 10-year Luck Pillar cycle

See you inside,
The DragonHour Team
"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:20px;background:#f8f6ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(124,58,237,.10);">
    <div style="background:linear-gradient(135deg,#7c3aed,#5b21b6);padding:36px;text-align:center;">
      <div style="font-size:52px;line-height:1;margin-bottom:12px;">🐉</div>
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-.3px;">Welcome to DragonHour</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin-top:0;color:#3b0764;font-size:16px;">Hi <strong>{username}</strong>,</p>
      <p style="color:#4b5563;line-height:1.7;font-size:15px;">
        Your account is ready. To unlock your personalised Bazi readings,
        set up your birth chart — it only takes about 2 minutes.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="{app_url}/profile"
           style="background:#7c3aed;color:#fff;text-decoration:none;padding:14px 36px;
                  border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
          Set Up My Bazi Profile &rarr;
        </a>
      </div>
      <p style="color:#6b7280;font-size:14px;margin-bottom:8px;">Once set up you'll get:</p>
      <ul style="color:#4b5563;font-size:14px;line-height:2;padding-left:20px;margin-top:0;">
        <li>Your Day Master element and its strengths</li>
        <li>Daily energy forecasts tailored to you</li>
        <li>Auspicious hours for work, decisions &amp; rest</li>
        <li>10-year Luck Pillar cycle</li>
      </ul>
      <p style="color:#9ca3af;font-size:13px;margin-bottom:0;">
        See you inside,<br>
        <strong style="color:#7c3aed;">The DragonHour Team</strong>
      </p>
    </div>
  </div>
</body>
</html>"""

    send_async({
        'subject':   'Welcome to DragonHour 🐉',
        'from_addr': from_addr,
        'to_addr':   to_addr,
        'text':      text,
        'html':      html,
    })
