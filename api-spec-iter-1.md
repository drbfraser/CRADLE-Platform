# API Specification (Iteration 1)

# Operation: Create a new patient with personal information

Used by the VHT to create a new patient.

Does not include readings, referrals or fillouts.

## Request

### Method and Mapping
`POST /patient`

### JSON Body

```json
{
  "personal-info": {
    "key": string
  }
}
```

## Response

### Status Codes

HTTP Status Code | Meaning
--- | ---
`201 Created` | Created the new patient successfully
`400 Bad Request` | A field in the JSON body was missing or invalid
`500 Internal Server Error` | An unhandled error occurred

### JSON Body

```json
{
  "id": string
}
```

---



# Operation: Add or edit a patient reading, referral, or fillout

Requires the patient ID from creation.

Used:
* By the VHT to create/edit a reading,
* By the VHT to create/edit a referral, or
* By the HCW to create/edit a fillout.

## Request

### Method and Mapping

`PUT /patient/{id}`

### JSON Body

```json
{
  "referral": {
    "key": string
  },
  "reading": {
    "key": string
  },
  "fillout": {
    "key": string
  }
}
```

## Response

### Status Codes

HTTP Status Code | Meaning
--- | ---
`200 OK` | Updated the patient information correctly
`400 Bad Request` | A field in the JSON body was missing or invalid
`404 Not Found` | The given patient ID was invalid
`500 Internal Server Error` | An unhandled error occurred

---



# Operation: Get data of all patients

Used by the VHT or the HCW.

## Request

### Method and Mapping

`GET /patient`

## Response

### Status Codes

HTTP Status Code | Meaning
--- | ---
`200 OK` | Retrieved the patient data successfully
`500 Internal Server Error` | An unhandled error occurred

### JSON Body

```json
[
  {
    "id": string,
    "referral": {
      "key": string
    },
    "reading": {
      "key": string
    },
    "fillout": {
      "key": string
    }
  },
  ...
}
```

---



# Operation: Get data of a specific patient

## Request

### Method and Mapping

`GET /patient/{id}`

## Response

### Status Codes

HTTP Status Code | Meaning
--- | ---
`200 OK` | Retrieved the patient data successfully
`404 Not Found` | The given patient ID was invalid
`500 Internal Server Error` | An unhandled error occurred

### JSON Body

```json
{
  "referral": {
    "key": string
  },
  "reading": {
    "key": string
  },
  "fillout": {
    "key": string
  }
}
```