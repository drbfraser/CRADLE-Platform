from typing import Optional

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from api.decorator import patient_association_required
from api.resources.patients import api_patients
from common.api_utils import PatientIdPath, PregnancyIdPath, SearchFilterQueryParams
from data import orm_serializer
from models import PregnancyOrm
from service import view
from validation.pregnancies import (
    PregnancyList,
    PregnancyModel,
)


# /api/patients/<string:patient_id>/pregnancies [GET]
@patient_association_required()
@api_patients.get("/<string:patient_id>/pregnancies", responses={200: PregnancyList})
def get_patient_pregnancies(path: PatientIdPath, query: SearchFilterQueryParams):
    """Get Patient's Pregnancies"""
    params = query.model_dump()
    pregnancies = view.pregnancy_view(path.patient_id, **params)
    return [orm_serializer.marshal(p) for p in pregnancies]


# /api/patients/<string:patient_id>/pregnancies [POST]
@patient_association_required()
@api_patients.post("/<string:patient_id>/pregnancies", responses={200: PregnancyModel})
def create_new_pregnancy(path: PatientIdPath, body: PregnancyModel):
    """Create New Pregnancy"""
    if body.id is not None:
        pregnancy_id = body.id
        if crud.read(PregnancyOrm, id=pregnancy_id):
            return abort(
                409,
                description=f"A pregnancy record with ID {pregnancy_id} already exists.",
            )

    _check_conflicts(body.start_date, body.end_date, path.patient_id)

    body.patient_id = path.patient_id
    new_pregnancy = orm_serializer.unmarshal(PregnancyOrm, body.model_dump())
    crud.create(new_pregnancy, refresh=True)

    return orm_serializer.marshal(new_pregnancy), 201


api_pregnancies = APIBlueprint(
    name="pregnancies",
    import_name=__name__,
    url_prefix="/pregnancies",
    abp_tags=[Tag(name="Pregnancies", description="")],
    abp_security=[{"jwt": []}],
)


# /api/pregnancies/<string:pregnancy_id> [GET]
@api_pregnancies.get("/<string:pregnancy_id>", responses={200: PregnancyModel})
def get_pregnancy(path: PregnancyIdPath):
    """Get Pregnancy"""
    pregnancy = _get_pregnancy(path.pregnancy_id)
    return orm_serializer.marshal(pregnancy)


# /api/pregnancies/<string:pregnancy_id> [PUT]
@api_pregnancies.put("/<string:pregnancy_id>", responses={200: PregnancyModel})
def update_pregnancy(path: PregnancyIdPath, body: PregnancyModel):
    """Update Pregnancy"""
    pregnancy_model_dump = body.model_dump()

    pregnancy = crud.read(PregnancyOrm, id=path.pregnancy_id)
    if pregnancy is None:
        return abort(404, description="No pregnancy found.")
    if body.patient_id != pregnancy.patient_id:
        return abort(400, description="Patient ID cannot be changed.")

    _check_conflicts(
        body.start_date, body.end_date, pregnancy.patient_id, path.pregnancy_id
    )

    crud.update(PregnancyOrm, pregnancy_model_dump, id=path.pregnancy_id)
    new_pregnancy = crud.read(PregnancyOrm, id=path.pregnancy_id)

    return orm_serializer.marshal(new_pregnancy)


# /api/pregnancies/<string:pregnancy_id> [DELETE]
@api_pregnancies.delete("/<string:pregnancy_id>")
def delete_pregnancy(path: PregnancyIdPath):
    """Delete Pregnancy"""
    pregnancy = _get_pregnancy(path.pregnancy_id)
    crud.delete(pregnancy)
    return {"message": "Pregnancy record deleted"}


def _check_conflicts(
    start_date: int,
    end_date: Optional[int],
    patient_id: str,
    pregnancy_id: Optional[int] = None,
):
    if crud.has_conflicting_pregnancy_record(
        patient_id,
        start_date,
        end_date,
        pregnancy_id,
    ):
        return abort(
            409, description="A conflict with existing pregnancy records occurred."
        )


def _get_pregnancy(pregnancy_id: int):
    pregnancy = crud.read(PregnancyOrm, id=pregnancy_id)
    if pregnancy is None:
        return abort(404, description=f"No pregnancy record with ID: {pregnancy_id}")
    return pregnancy
