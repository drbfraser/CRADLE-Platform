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

const SampleTemplateLink = () => {
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
      Sample Template
    </Link>
  );

  const template_json = {
    classification: {
      name: 'Ping Pong Survey - 2022',
    },
    questions: [
      {
        categoryIndex: null,
        numMax: null,
        numMin: null,
        questionId: 'pingpong-by-name01',
        questionIndex: 0,
        questionLangVersions: [
          {
            lang: 'english',
            mcOptions: [
              {
                mcid: 0,
                opt: 'very much',
              },
              {
                mcid: 1,
                opt: 'a little',
              },
              {
                mcid: 2,
                opt: 'no idea',
              },
              {
                mcid: 3,
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
