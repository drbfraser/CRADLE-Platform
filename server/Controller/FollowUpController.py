import logging
import json

from flask import request
from flask_restful import Resource, abort
from flask_jwt_extended import (jwt_required, get_jwt_identity)
from Controller.Helpers import _get_request_body

# Project modules
from Manager.FollowUpManager import FollowUpManager

followUpManager = FollowUpManager()

# URI: /followup
class FollowUp(Resource):

    # Get all followups
    # Get all followups with an ID
    # Get all followups, for a specific referral
    @jwt_required
    def get(self, id=None):      
        args = request.args  
        if id:
            logging.debug('Received request: GET /follow_up/<id>')
            follow_up = followUpManager.read("id", id)
            if follow_up is None: 
                abort(400, message=f'No FollowUp exists with id "{id}"')
            return follow_up
        elif args:
            logging.debug('Received request: GET /follow_up')
            print("args: " + json.dumps(args, indent=2, sort_keys=True))
            follow_ups = followUpManager.search(args)
            if not follow_ups:
                abort(400, message="No FollowUps found with given query params.")
            return follow_ups
        else:
            logging.debug('Received request: GET /follow_up')
            follow_ups = followUpManager.read_all()
            if not follow_ups:
                abort(404, message="No FollowUps currently exist.")
            return follow_ups

    # Create a new follow up
    @jwt_required
    def post(self):
        logging.debug('Received request: POST /follow_up')
        current_user = get_jwt_identity()
        follow_up_data = _get_request_body()
        response_body = followUpManager.create(follow_up_data, current_user)
        return response_body, 201
    
    @jwt_required
    def put(self, id=None):
        logging.debug('Received request: PUT /follow_up/<id>')
        current_user = get_jwt_identity()
        # validate inputs
        if not id:
            abort(400, message="id is required")
    
        new_follow_up = _get_request_body()
        update_res = followUpManager.update("id", id, new_follow_up, current_user)

        if not update_res:
            abort(400, message=f'No FollowUp exists with id "{id}"')
        else:
            return update_res

    @jwt_required
    def delete(self, id=None):
        # validate inputs
        if id:
            logging.debug('Received request: DELETE /follow_up/<id>')
            del_res = followUpManager.delete("id", id)
            if not del_res:
                abort(400, message=f'No FollowUp exists with id "{id}"')
        else:
            logging.debug('Received request: DELETE /follow_up')
            followUpManager.delete_all()
        return {}


class FollowUpMobile(Resource):
    @jwt_required
    def get(self, id=None):      
        args = request.args  
        if id:
            logging.debug('Received request: GET /mobile/follow_up/<id>')
            follow_up = followUpManager.mobile_read("id", id)
            if follow_up is None: 
                abort(400, message=f'No FollowUp exists with id "{id}"')
            return follow_up
        elif args:
            logging.debug('Received request: GET /mobile/follow_up')
            print("args: " + json.dumps(args, indent=2, sort_keys=True))
            follow_ups = followUpManager.mobile_search(args)
            if not follow_ups:
                abort(400, message="No FollowUps found with given query params.")
            return follow_ups
        else:
            logging.debug('Received request: GET /mobile/follow_up')
            follow_ups = followUpManager.mobile_read_all()
            if not follow_ups:
                abort(404, message="No FollowUps currently exist.")
            return follow_ups

class FollowUpMobileSummarized(Resource):

    @jwt_required
    def get(self, id=None):      
        args = request.args  
        if id:
            logging.debug('Received request: GET /mobile/follow_up/<id>')
            follow_up = followUpManager.mobile_read_summarized("id", id)
            if follow_up is None: 
                abort(400, message=f'No FollowUp exists with id "{id}"')
            return follow_up
        elif args:
            logging.debug('Received request: GET /mobile/follow_up')
            print("args: " + json.dumps(args, indent=2, sort_keys=True))
            follow_ups = followUpManager.mobile_search_summarized(args)
            if not follow_ups:
                abort(400, message="No FollowUps found with given query params.")
            return follow_ups
        else:
            logging.debug('Received request: GET /mobile/follow_up')
            follow_ups = followUpManager.mobile_read_all_summarized()
            if not follow_ups:
                abort(404, message="No FollowUps currently exist.")
            return follow_ups