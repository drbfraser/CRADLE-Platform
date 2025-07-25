from typing import TypeVar, Callable, Dict
from data import crud, marshal
import models as m
from functools import partial

M = TypeVar("M")

# `id` and `column` are partially applied
def query_data(model: type[M], predicate, id: str, column: str) -> Callable:
    """
    handles fetching system data
    """
    pred = predicate(id)
    instance = marshal.marshal(crud.read(model, pred))

    if instance is None:
        return None

    return instance.get(column)

# can probably make more efficient by query down by tables -> columns
data_catalouge: Dict[str, Callable] = {
        "$patient.name": partial(query_data, m.PatientOrm, lambda _id: m.PatientOrm.id == _id),                    
        "$patient.sex": partial(query_data, m.PatientOrm, lambda _id: m.PatientOrm.id == _id),                     
        "$patient.date_of_birth" : partial(query_data, m.PatientOrm, lambda _id: m.PatientOrm.id == _id),           
        "$patient.is_pregnant" : partial(query_data, m.PatientOrm, lambda _id: m.PatientOrm.id == _id),            
        "$reading.systolic_blood_pressure": partial(query_data, m.ReadingOrm, lambda _id: m.ReadingOrm.patient_id == _id), 
        "$reading.traffic_light_status": partial(query_data, m.ReadingOrm, lambda _id: m.ReadingOrm.patient_id == _id),
    }
