from twilio.rest import Client as
# account_sid = 'ACbb21e076d7e97a345e7c5b2083bbc4f0'
# auth_token = 'ba7953a3e633e214c3762162b680ea48'
# client = Client(account_sid, auth_token)

account_sid = 'AC60eabac30dace6e2901f831ed4a3f680'
auth_token = '22962056109763ee669be76fb2ebb63e'
twiClient = TwilioClient(account_sid, auth_token)

def notification(body, to):
    message = client.messages.create(
        messaging_service_sid='MGaab9adab8e650a58a5eea60e5f13984f',
        body=body,
        to='+91'+str(to)
    )
    print(message.status)

notification("hello", '8186069762')