# Forms API Reference

V1 is the old API, V2 is the new one. V1 gets deleted once mobile moves to V2. Each section shows V1 first then V2.

---

## Form Submissions

### V1 — POST /api/forms/responses

| Field | Type | Required |
|---|---|---|
| `id` | string | no |
| `lang` | string | yes |
| `patient_id` | string | yes |
| `form_template_id` | string | no |
| `form_classification_id` | string | no |
| `date_created` | integer | yes |
| `last_edited` | integer | no |
| `last_edited_by` | integer | no |
| `archived` | boolean | no |
| `questions` | FormQuestion array | yes |

FormQuestion fields:

| Field | Type | Required |
|---|---|---|
| `id` | string | no |
| `question_index` | integer | no |
| `question_type` | string | yes |
| `question_text` | string | yes |
| `required` | boolean | no |
| `answers` | AnswerValue | no |
| `mc_options` | array of `{ mc_id: int, opt: string }` | no |
| `num_min` | float | no |
| `num_max` | float | no |
| `string_max_length` | integer | no |
| `string_max_lines` | integer | no |
| `units` | string | no |
| `visible_condition` | VisibleCondition array | no |
| `allow_future_dates` | boolean | no |
| `allow_past_dates` | boolean | no |
| `has_comment_attached` | boolean | no |
| `form_template_id` | string | no |

Returns: 201 with shallow FormModel, 400 if classification mismatch, 404 if patient/template/user not found, 409 if ID already exists.

---

### V1 — GET /api/forms/responses/{form_id}

Returns full FormModel with all questions and answers. 404 if not found.

---

### V1 — PUT /api/forms/responses/{form_id}

Update answers. Only send the questions being changed. Also updates `last_edited` and `last_edited_by`.

| Field | Type | Required |
|---|---|---|
| `questions` | array | yes |

Each question: `id` (string, required), `answers` (AnswerValue, required).

Returns: 201 with full FormModel, 404 if form or question not found.

---

### V2 — POST /api/forms/v2/submissions

| Field | Type | Required |
|---|---|---|
| `id` | string | no |
| `form_template_id` | string | yes |
| `patient_id` | string | yes |
| `user_id` | integer | no |
| `lang` | string | no |
| `answers` | FormAnswer array | yes |

FormAnswer fields:

| Field | Type | Required |
|---|---|---|
| `id` | string | no |
| `question_id` | string | yes |
| `form_submission_id` | string | no |
| `answer` | AnswerValue | yes |

Response body (FormSubmission):

| Field | Type |
|---|---|
| `id` | string |
| `form_template_id` | string |
| `patient_id` | string |
| `user_id` | integer |
| `date_submitted` | integer |
| `last_edited` | integer |
| `lang` | string |
| `archived` | boolean |

Returns: 201, 404 if patient/template/user not found, 409 if ID exists, 422 if required answers missing.

---

### V2 — GET /api/forms/v2/submissions

List all submissions for a patient.

Query: `patient_id` (string, required)

Returns: 200 array of FormSubmission, 404 if patient not found.

---

### V2 — GET /api/forms/v2/submissions/{form_submission_id}

Returns FormSubmission plus an `answers` array:

| Field | Type |
|---|---|
| `id` | string |
| `question_id` | string |
| `question_type` | string |
| `question_text` | string |
| `mc_options` | string array |
| `order` | integer |
| `answer` | AnswerValue |

Returns: 200, 404 if not found.

---

### V2 — PATCH /api/forms/v2/submissions/{form_submission_id}

Unlike V1's PUT, only send the answers you want to change by answer `id`. Also updates `last_edited` and `user_id`.

| Field | Type | Required |
|---|---|---|
| `answers` | FormAnswer array | yes |

Each answer: `id` (required), `question_id` (required), `answer` (required).

Returns: 200, 404 if submission or answer not found.

---

## Form Templates

### V1 — GET /api/forms/templates

List all templates without questions.

Query: `include_archived` (boolean, default false)

Returns: 200 array of FormTemplateModel.

---

### V1 — POST /api/forms/templates

Upload from file. Requires ADMIN. Content-Type: multipart/form-data.

Field: `file` (JSON or CSV, required)

Returns: 201, 409 if version exists, 415 invalid content type, 422 invalid format.

---

### V1 — POST /api/forms/templates/body

Upload from request body. Requires ADMIN. Previous active version is auto-archived.

| Field | Type | Required |
|---|---|---|
| `id` | string | no |
| `version` | string | yes |
| `form_classification_id` | string | no |
| `classification` | `{ id?, name: string }` | yes |
| `questions` | TemplateQuestion array | yes |
| `date_created` | integer | no |
| `archived` | boolean | no |

TemplateQuestion fields:

| Field | Type | Required |
|---|---|---|
| `id` | string | no |
| `question_index` | integer | no |
| `question_type` | string | yes |
| `lang_versions` | array of `{ lang, question_text, mc_options? }` | yes |
| `required` | boolean | no |
| `has_comment_attached` | boolean | no |
| `visible_condition` | VisibleCondition array | no |
| `num_min` / `num_max` | float | no |
| `string_max_length` / `string_max_lines` | integer | no |
| `units` | string | no |
| `allow_future_dates` / `allow_past_dates` | boolean | no |

Returns: 201, 409 if version exists, 422 validation error.

---

### V1 — GET /api/forms/templates/{form_template_id}

Query: `lang` (optional). If provided, returns single-language version. If omitted, returns all languages.

Returns: 200 FormTemplateLang, 404 not found.

---

### V1 — GET /api/forms/templates/{form_template_id}/versions

Returns: `{ "lang_versions": ["English", "French", ...] }`

---

### V1 — GET /api/forms/templates/{form_template_id}/versions/{version}/csv

Returns: CSV file.

---

### V1 — PUT /api/forms/templates/{form_template_id}

Archive or unarchive. Body: `{ archived: boolean }`.

Returns: 201, 404 not found.

---

### V1 — GET /api/forms/templates/blank/{form_template_id}

Returns template with all answer fields cleared. No V2 equivalent.

Query: `lang` (optional)

---

### V2 — GET /api/forms/v2/templates

Same as V1 but adds `lang` query param to localize template names in the response.

Query: `include_archived` (boolean, default false), `lang` (string, default "English")

Response example:
```json
{
  "templates": [
    {
      "id": "...",
      "form_classification_id": "...",
      "version": 1,
      "archived": false,
      "name": "Antenatal",
      "date_created": 1729123456
    }
  ]
}
```

---

### V2 — POST /api/forms/v2/templates

Upload from file. Requires ADMIN. JSON only, CSV not accepted.

Content-Type: multipart/form-data. Field: `file` (required)

Returns: 201, 409 version exists, 422 validation error.

---

### V2 — POST /api/forms/v2/templates/body

Upload from request body. Requires ADMIN. Previous active version is auto-archived.

| Field | Type | Required |
|---|---|---|
| `id` | string | no |
| `version` | integer | no |
| `archived` | boolean | no |
| `classification` | object | yes |
| `questions` | FormTemplateUploadQuestion array | yes |
| `date_created` | integer | no |

Classification object:

| Field | Type | Required |
|---|---|---|
| `id` | string | no |
| `name` | `{ [langCode]: string }` | yes |
| `name_string_id` | string | no |

FormTemplateUploadQuestion fields:

| Field | Type | Required |
|---|---|---|
| `id` | string | no |
| `form_template_id` | string | no |
| `order` | integer | yes |
| `question_type` | string | yes |
| `question_text` | `{ [langCode]: string }` | yes |
| `question_string_id` | string | no |
| `required` | boolean | no |
| `has_comment_attached` | boolean | no |
| `visible_condition` | VisibleCondition array | no |
| `category_index` | integer | no |
| `mc_options` | MCOption array | no |
| `num_min` / `num_max` | float | no |
| `string_max_length` / `string_max_lines` | integer | no |
| `units` | string | no |
| `allow_future_dates` / `allow_past_dates` | boolean | no |
| `user_question_id` | string | no |

MCOption (V2 only):

| Field | Type |
|---|---|
| `string_id` | string |
| `translations` | `{ [langCode]: string }` |

Returns: 201, 409 version exists, 422 validation error.

---

### V2 — GET /api/forms/v2/templates/{form_template_id}

Query: `lang` (optional). Same behavior as V1.

Returns: 200 FormTemplate, 404 not found.

---

### V2 — GET /api/forms/v2/templates/{form_template_id}/languages

Same as V1's /versions but renamed.

Returns: `{ "langVersions": ["English", "French"] }`, 404 not found.

---

### V2 — GET /api/forms/v2/templates/{form_template_id}/versions/{version}/csv

Same as V1. Returns CSV file.

---

### V2 — PUT /api/forms/v2/templates/{form_template_id}

Archive or unarchive. In V2, `archived` is a query param not a body field.

Query: `archived` (boolean, required)

Returns: 201, 404 not found.

---

## Form Classifications

### V1 — GET /api/forms/classifications

Returns: array of `{ id, name }`.

---

### V1 — POST /api/forms/classifications

Requires ADMIN.

| Field | Type | Required |
|---|---|---|
| `id` | string | no |
| `name` | string | yes |

Returns: 201, 409 name already exists.

---

### V1 — GET /api/forms/classifications/{form_classification_id}

Returns: `{ id, name }`, 400 not found.

---

### V1 — PUT /api/forms/classifications/{form_classification_id}

| Field | Type | Required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |

Returns: 201, 400 if trying to change ID, 404 not found.

---

### V1 — GET /api/forms/classifications/summary

Returns the most recent active template per classification.

---

### V1 — GET /api/forms/classifications/{form_classification_id}/templates

Returns all template versions for a classification.

---

### V2 — GET /api/forms/v2/classifications

Same as V1 but names are multilingual.

Response example:
```json
{
  "classifications": [
    {
      "id": "...",
      "name": { "english": "Antenatal", "french": "Prénatal" },
      "name_string_id": "..."
    }
  ]
}
```

---

### V2 — POST /api/forms/v2/classifications

Requires ADMIN.

| Field | Type | Required |
|---|---|---|
| `id` | string | no |
| `name` | `{ [langCode]: string }` | yes |
| `name_string_id` | string | no |

Returns: 201, 400 if english key missing, 409 name exists.

---

### V2 — GET /api/forms/v2/classifications/{form_classification_id}

Returns classification with all language names. 404 not found.

---

### V2 — PUT /api/forms/v2/classifications/{form_classification_id}

Requires ADMIN.

| Field | Type | Required |
|---|---|---|
| `id` | string | yes |
| `name` | `{ [langCode]: string }` | yes |
| `name_string_id` | string | yes |

Returns: 200, 400 if english missing or ID mismatch, 404 not found.

---