import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Typography,
  Collapse,
} from '@mui/material';
import { WorkflowNextStepOption } from 'src/shared/types/workflow/workflowUiTypes';
import { useState } from 'react';
import {
  Cancel,
  CheckCircle,
  KeyboardArrowDown,
  WarningAmber,
} from '@mui/icons-material';
import { WorkflowBranchEvaluationStatus } from 'src/shared/types/workflow/workflowEnums';

interface IProps {
  selectedId: string;
  setSelectedId: React.Dispatch<React.SetStateAction<string>>;
  options: WorkflowNextStepOption[];
}

export default function NextStepSelector({
  selectedId,
  setSelectedId,
  options,
}: IProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [technicalDetailsId, setTechnicalDetailsId] = useState<string | null>(
    null
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getEvaluationIcon = (status: string) => {
    switch (status) {
      case WorkflowBranchEvaluationStatus.TRUE:
        return (
          <CheckCircle
            fontSize="inherit"
            sx={{ color: 'success.main', mr: 0.5 }}
          />
        );
      case WorkflowBranchEvaluationStatus.FALSE:
        return (
          <Cancel fontSize="inherit" sx={{ color: 'text.disabled', mr: 0.5 }} />
        );
      case WorkflowBranchEvaluationStatus.NOT_ENOUGH_DATA:
      default:
        return (
          <WarningAmber
            fontSize="inherit"
            sx={{ color: 'warning.main', mr: 0.5 }}
          />
        );
    }
  };

  const getEvaluationColor = (status: string) => {
    switch (status) {
      case WorkflowBranchEvaluationStatus.TRUE:
        return 'success.main';
      case WorkflowBranchEvaluationStatus.FALSE:
        return 'text.disabled';
      case WorkflowBranchEvaluationStatus.NOT_ENOUGH_DATA:
      default:
        return 'warning.main';
    }
  };

  const getFriendlyResolutionMessage = (
    variable: string,
    status: string
  ): JSX.Element | null => {
    if (status !== 'OBJECT_NOT_FOUND') {
      return null;
    }

    const match = variable.match(/^vitals\[-(\d+)\]\./);

    if (!match) {
      return null;
    }

    const readingNumber = Number(match[1]);

    return (
      <>
        <Typography
          variant="body2"
          sx={{
            color: 'warning.main',
            fontWeight: 700,
          }}>
          ⚠ Additional Readings Required
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'warning.main',
          }}>
          This condition requires {readingNumber} readings, but the requested
          reading is not available for this patient.
        </Typography>
      </>
    );
  };

  return (
    <Box sx={{ width: '35vw' }}>
      <RadioGroup
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}>
        {options.map((opt) => {
          const isExpanded = expandedId === opt.templateStepId;
          const isNotEnoughData =
            opt.ruleStatus === WorkflowBranchEvaluationStatus.NOT_ENOUGH_DATA; // Variable resolution failed due to missing data
          return (
            <Box
              key={opt.templateStepId}
              sx={{
                border: '1px solid #ddd',
                mb: 2,
                borderRadius: 1,
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  cursor: 'pointer',
                }}
                onClick={() => toggleExpand(opt.templateStepId)}>
                {/* Main Next Step Details */}
                <FormControlLabel
                  value={opt.templateStepId}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>{opt.title}</Typography>

                      {isNotEnoughData && (
                        <WarningAmber
                          fontSize="small"
                          sx={{
                            color: 'warning.main',
                            ml: 1,
                          }}
                        />
                      )}

                      {opt.isRecommended && (
                        <Typography
                          sx={{ ml: 1, color: 'primary.main', fontSize: 12 }}>
                          {'(Recommended)'}
                        </Typography>
                      )}
                    </Box>
                  }
                  onClick={(e) => e.stopPropagation()} // prevent expanding when only selecting the radio option
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(opt.templateStepId);
                  }}
                  sx={{
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}>
                  <KeyboardArrowDown fontSize="small" />
                </IconButton>
              </Box>

              {/* Expandable Rule Details */}
              <Collapse in={isExpanded}>
                <Box
                  sx={{
                    py: 1,
                    px: 2,
                    pb: 2,
                    borderTop: '1px solid #eee',
                  }}>
                  {!isNotEnoughData && (
                    <>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', mt: 0.5 }}>
                        Rule Evaluation:
                      </Typography>

                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        {getEvaluationIcon(opt.ruleStatus)}

                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          <Box
                            component="span"
                            sx={{ color: getEvaluationColor(opt.ruleStatus) }}>
                            {opt.ruleStatus}
                          </Box>
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', mt: 0.5 }}>
                        Rule:
                      </Typography>

                      <Typography variant="body2">{opt.rule}</Typography>
                    </>
                  )}
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', mt: 0.5 }}>
                    Data Evaluated:
                  </Typography>
                  {opt.varResolutions.length === 0 ? (
                    <Typography variant="body2">No data found</Typography>
                  ) : (
                    <>
                      {opt.varResolutions.map((res, i) => {
                        const friendlyMessage = getFriendlyResolutionMessage(
                          res.var,
                          res.status
                        );

                        return (
                          <Typography key={i} variant="body2" sx={{}}>
                            {friendlyMessage ??
                              `${res.var} = ${res.value ?? 'N/A'} (${res.status})`}
                          </Typography>
                        );
                      })}
                    </>
                  )}
                  {isNotEnoughData && (
                    <>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          color: 'primary.main',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                        onClick={() =>
                          setTechnicalDetailsId(
                            technicalDetailsId === opt.templateStepId
                              ? null
                              : opt.templateStepId
                          )
                        }>
                        {technicalDetailsId === opt.templateStepId
                          ? 'Hide technical details'
                          : 'Show technical details'}
                      </Typography>

                      <Collapse in={technicalDetailsId === opt.templateStepId}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 'bold', mt: 1 }}>
                          Rule Evaluation:
                        </Typography>

                        <Typography variant="body2">
                          {opt.ruleStatus}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 'bold', mt: 1 }}>
                          Rule:
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            wordBreak: 'break-all',
                          }}>
                          {opt.rule}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 'bold', mt: 1 }}>
                          Resolution:
                        </Typography>

                        {opt.varResolutions.map((res, i) => (
                          <Typography key={i} variant="body2" sx={{}}>
                            {res.var} = {res.value ?? 'N/A'} ({res.status})
                          </Typography>
                        ))}
                      </Collapse>
                    </>
                  )}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </RadioGroup>
    </Box>
  );
}
