from flask import request, session
from flask import Response
from flask_restful import Resource, abort
from flask import current_app
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse
import json
import jwt
import requests

class SMS(Resource):

    # /api/sms [POST]
    # SMS BODY SHOULD BE A JWT TOKEN
    #
    def post(self):
        req = request.form.to_dict()
        print(json.dumps(req, indent=2, sort_keys=True))

        # get the token from sms body
        jwt_token = req['Body']

        # decode jwt token
        try:
            body_json = jwt.decode(jwt_token, 'secret', algorithms=['HS256'])
            body_json = json.dumps(body_json, indent=2, sort_keys=True)
            print(body_json)
        except (KeyError, jwt.DecodeError, jwt.ExpiredSignatureError, jwt.ExpiredSignature):
            abort(400, message="Invalid Token")

        # call local endpoint
        BASE_URL = current_app.config['BASE_URL']
        req = requests.post(BASE_URL + 'api/referral', data=body_json)

        resp = MessagingResponse()
        if req.status_code == 201:
            resp.message("Referral has been sent!")
        else:
            resp.message("Error! Referral has not been sent. Please try again.")

        # Start our TwiML response
        return Response(str(resp), mimetype='text/xml')