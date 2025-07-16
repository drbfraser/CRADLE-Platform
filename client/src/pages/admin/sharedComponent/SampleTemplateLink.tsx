import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Typography,
} from '@mui/material';
import { PrimaryButton } from 'src/shared/components/Button';
import { useState } from 'react';

//need to mod for upload template feature
const SampleTemplateLink = ({
  type = 'workflow',
}: {
  type?: 'form' | 'workflow';
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const SampleLink = () => (
    <Link
      onClick={() => {
        setDialogOpen(true);
      }}
      sx={{
        '&, &:hover': {
          color: 'blue',
          textDecoration: 'underline',
          cursor: 'pointer',
        },
      }}
      underline="hover">
      {type === 'form' ? 'Sample Form Template' : 'Sample Workflow'}
    </Link>
  );

  const template_json =
    type === 'form'
      ? {
          classification: {
            name: 'Ping Pong Survey - 2022',
          },
          questions: [
            {
              categoryIndex: null,
              numMax: null,
              numMin: null,
              id: 'pingpong-by-name01',
              questionIndex: 0,
              langVersions: [
                {
                  lang: 'english',
                  mcOptions: [
                    {
                      mcId: 0,
                      opt: 'very much',
                    },
                    {
                      mcId: 1,
                      opt: 'a little',
                    },
                    {
                      mcId: 2,
                      opt: 'no idea',
                    },
                    {
                      mcId: 3,
                      opt: 'just so so',
                    },
                  ],
                  questionText: 'Do you like playing pingpong',
                },
              ],
              questionType: 'MULTIPLE_CHOICE',
              required: true,
              stringMaxLength: null,
              units: null,
              visibleCondition: [],
            },
          ],
          version: 'V1',
        }
      : {
          id: 'workflow_2',
          name: 'workflow_example2',
          description: 'workflow_example2',
          archived: false,
          starting_step_id: 'template_step_2',
          date_created: 1009334,
          last_edited: 1009334,
          last_edited_by: 1,
          version: '0',
          initial_condition_id: null,
          initial_condition: null,
          classification_id: 'classification_2',
          classification: {
            id: 'classification_2',
            name: 'Workflow Classification example',
          },
          steps: [
            {
              id: 'template_step_2',
              name: 'Example workflow step',
              title: ' Example workflow step used in testing',
              expected_completion: '{{current_time}}',
              last_edited: '{{current_time}}',
              last_edited_by: 1,
              form_id: 'form_2',
              workflow_template_id: 'workflow_2',
              form: {
                id: 'form_2',
                version: 'V1',
                form_classification_id: 'form_classification_2',
                classification: {
                  id: 'form_classification_2',
                  name: 'Example Form Classification',
                },
                questions: [
                  {
                    id: 'question_1',
                    category_index: null,
                    question_index: 0,
                    is_blank: true,
                    question_type: 'MULTIPLE_CHOICE',
                    required: true,
                    allow_future_dates: true,
                    allow_past_dates: true,
                    num_min: null,
                    num_max: null,
                    string_max_length: null,
                    units: null,
                    visible_condition: [],
                    string_max_lines: null,
                    lang_versions: [
                      {
                        lang: 'English',
                        question_text: 'Are there signs of pregnancy?',
                        question_id: 'question_1',
                      },
                    ],
                  },
                ],
              },
              condition_id: null,
              condition: null,
              branches: [],
            },
          ],
        };

  const SampleTemplateDialog = () => (
    <Dialog open={dialogOpen}>
      <DialogTitle
        sx={{
          paddingBottom: 0,
        }}>
        Sample Template Json File
      </DialogTitle>
      <DialogContent>
        <Typography component="div">
          Each time you upload a template, please make sure the template name is
          unique. For the usage of json fields, please refer to&nbsp;
          <a href="https://docs.google.com/document/d/1vTYGwlQ_mTqr26X32r2OyDYRQ1txKpBkSpMY5zvMYEg/edit#heading=h.x99pr6bc1zsw">
            Backend Design for Form
          </a>
        </Typography>
        <Divider />
        <Typography component="div">
          <pre>{JSON.stringify(template_json, null, 2)}</pre>
        </Typography>
      </DialogContent>
      <DialogActions>
        <PrimaryButton onClick={() => setDialogOpen(false)}>
          Close
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <SampleLink />
      <SampleTemplateDialog />
    </>
  );
};

export default SampleTemplateLink;
