# Flow Tests

Tests in this package emulate specific user flows. Note that since the initial database
state is unknown when running these tests, any flows which involve a global list of
entities cannot be tested deterministically.

## Writing Flow Tests

Flow tests should be self contained, relying on no pre-existing data in the database and
should cleanup after themselves regardless of whether they pass or fail. This means that
flow tests should create any users, facilities, or other required models themselves and
delete any new models that they insert into the database.

Fixtures are available for supplying flow tests with managed facilities and users in
order to streamline this process:

* `single_facility_actors` provides a managed health facility, as well as Admin, HCW,
CHO, VHT users who are all a part of said facility
* *More fixtures to come as needed*

> Note that all users created by "actors" fixtures have the password `ftest`.

### Example

The following is a full, heavily annotated, example on how to create a simple flow test:

```python
import data.crud as crud
from models import Patient

def test_creating_a_patient(single_facility_actors, api, make_patient):
    # Unpack actors, any that aren't needed can be named '_'
    facility, admin, hcw, cho, vht = single_facility_actors

    # For reproducibility, use of static ids is preferred over 
    # randomly generating new ones for each test run
    patient_id = "452365675221"
    
    # If any new data will be inserted into the database during this
    # test, the main test body must be wrapped in a `try` block with
    # any created data being deleted in the `finally` block. Note 
    # that we don't want a `catch` block as any assertion failures
    # should be propagated back to the testing framework.
    try:
        # `make_patient` is a convenience fixture which creates a 
        # sample patient dictionary
        patient_dict = make_patient(patient_id=patient_id)
        
        # `api` is a fixture which provides an object capable of
        # performing HTTP requests against the active server instance
        response = api.post(
            endpoint="/api/patients",
            payload=patient_dict,
            email=vht.email,
            password="ftest"
        )
        assert response.status_code == 201

    finally:
        # Any data inserted into the database during this test must 
        # be cleaned up. `crud.delete_by` is perfect for this task as
        # if the object being deleted doesn't exist (e.g., in the 
        # case the test fails before the object is inserted), it will
        # do nothing.
        crud.delete_by(Patient, patientId=patient_id)
```
