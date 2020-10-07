import logging
import json

from flask import request
from flask_restful import Resource, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from controller.Helpers import _get_request_body
from flasgger import swag_from

# Project modules
from manager.FollowUpManager import FollowUpManager

followUpManager = FollowUpManager()

# URI: /followup
class FollowUp(Resource):
    @jwt_required
    @swag_from(
        "../specifications/followup-put.yml", methods=["PUT"], endpoint="followup_path"
    )
    def put(self, id=None):
        logging.debug("Received request: PUT /follow_up/<id>")
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
    @swag_from(
        "../specifications/followup-delete.yml",
        methods=["DELETE"],
        endpoint="followup_path",
    )
    def delete(self, id=None):
        # validate inputs
        if id:
            logging.debug("Received request: DELETE /follow_up/<id>")
            del_res = followUpManager.delete("id", id)
            if not del_res:
                abort(400, message=f'No FollowUp exists with id "{id}"')
        else:
            logging.debug("Received request: DELETE /follow_up")
            followUpManager.delete_all()
        return {}


class FollowUpMobile(Resource):
    @jwt_required
    @swag_from("../specifications/mobile-followup.yml", methods=["GET"])
    def get(self, id=None):
        args = request.args
        if id:
            logging.debug("Received request: GET /mobile/follow_up/<id>")
            follow_up = followUpManager.mobile_read("id", id)
            if follow_up is None:
                abort(400, message=f'No FollowUp exists with id "{id}"')
            return follow_up
        elif args:
            logging.debug("Received request: GET /mobile/follow_up")
            print("args: " + json.dumps(args, indent=2, sort_keys=True))
            follow_ups = followUpManager.mobile_search(args)
            if not follow_ups:
                abort(400, message="No FollowUps found with given query params.")
            return follow_ups
        else:
            logging.debug("Received request: GET /mobile/follow_up")
            follow_ups = followUpManager.mobile_read_all()
            if not follow_ups:
                abort(404, message="No FollowUps currently exist.")
            return follow_ups


class FollowUpMobileSummarized(Resource):
    @jwt_required
    @swag_from("../specifications/mobile-followup-summarized.yml", methods=["GET"])
    def get(self, id=None):
        args = request.args
        if id:
            logging.debug("Received request: GET /mobile/follow_up/<id>")
            follow_up = followUpManager.mobile_read_summarized("id", id)
            if follow_up is None:
                abort(400, message=f'No FollowUp exists with id "{id}"')
            return follow_up
        elif args:
            logging.debug("Received request: GET /mobile/follow_up")
            print("args: " + json.dumps(args, indent=2, sort_keys=True))
            follow_ups = followUpManager.mobile_search_summarized(args)
            if not follow_ups:
                abort(400, message="No FollowUps found with given query params.")
            return follow_ups
        else:
            logging.debug("Received request: GET /mobile/follow_up")
            follow_ups = followUpManager.mobile_read_all_summarized()
            if not follow_ups:
                abort(404, message="No FollowUps currently exist.")
            return follow_ups
