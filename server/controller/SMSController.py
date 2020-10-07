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
    # SMS BODY SHOULD BE A REFERRAL JSON STRING
    #
    def post(self):
        req = request.form.to_dict()
        print(json.dumps(req, indent=2, sort_keys=True))

        # get json string from sms body
        body = req["Body"]

        try:
            body_json = json.loads(body)
        except ValueError as e:
            abort(400, message="Invalid JSON string received")

        body_json = json.dumps(body_json, indent=2, sort_keys=True)

        # call local endpoint
        req = requests.post("http://localhost:8080/api/referral", data=body_json)

        resp = MessagingResponse()
        if req.status_code == 201:
            print("Referral Success")
            resp.message("Referral has been sent!")
        else:
            print("Referral Error")
            resp.message("Error! Referral has not been sent. Please try again.")

        # Start our TwiML response
        return Response(str(resp), mimetype="text/xml")
