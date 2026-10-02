from flask_mail import Message
from app.extensions import mail

def send_task_email(recipient, task_title, body):
    message = Message(
        subject=task_title,
        recipients=recipient
    )

    message.body = body

    mail.send(message)
