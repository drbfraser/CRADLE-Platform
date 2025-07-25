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

data_catalouge: Dict[str, Callable] = {
        "$patient.name": partial(query_data, m.PatientOrm, lambda id_val: m.PatientOrm.id == id_val),                    
        "$patient.sex": partial(query_data, m.PatientOrm, lambda id_val: m.PatientOrm.id == id_val),                     
        "$patient.date_of_birth" : partial(query_data, m.PatientOrm, lambda id_val: m.PatientOrm.id == id_val),           
        "$patient.is_pregnant" : partial(query_data, m.PatientOrm, lambda id_val: m.PatientOrm.id == id_val),            
        "$reading.systolic_blood_pressure": partial(query_data, m.ReadingOrm, lambda id_val: m.ReadingOrm.patient_id == id_val), 
        "$reading.traffic_light_status": partial(query_data, m.ReadingOrm, lambda id_val: m.ReadingOrm.patient_id == id_val),
    }
