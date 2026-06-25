import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { TrafficLightEnum } from 'src/shared/enums';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { FilterDialogState } from './types';

const VITAL_SIGNS = [
  { name: 'Green', vitalSign: TrafficLightEnum.GREEN },
  { name: 'Yellow Up', vitalSign: TrafficLightEnum.YELLOW_UP },
  { name: 'Yellow Down', vitalSign: TrafficLightEnum.YELLOW_DOWN },
  { name: 'Red Up', vitalSign: TrafficLightEnum.RED_UP },
  { name: 'Red Down', vitalSign: TrafficLightEnum.RED_DOWN },
  { name: 'None', vitalSign: TrafficLightEnum.NONE },
] as const;

type Props = Pick<FilterDialogState, 'selectedVitalSign' | 'setSelectedVitalSign'>;

export const VitalSignsFilterGroup = ({
  selectedVitalSign,
  setSelectedVitalSign,
}: Props) => (
  <Grid size={12}>
    <Typography variant="h4" component="h3">
      Cradle Readings
    </Typography>
    {VITAL_SIGNS.map((vitalSign, index) => (
      <FormControlLabel
        key={index}
        control={
          <Checkbox
            checked={selectedVitalSign.includes(vitalSign.vitalSign)}
            onChange={(event, checked) => {
              if (checked) {
                setSelectedVitalSign(
                  [
                    ...selectedVitalSign,
                    TrafficLightEnum[
                      event.target.value as keyof typeof TrafficLightEnum
                    ],
                  ].sort()
                );
              } else {
                const newVitalSigns = [...selectedVitalSign];
                const i = newVitalSigns.indexOf(
                  TrafficLightEnum[
                    event.target.value as keyof typeof TrafficLightEnum
                  ]
                );
                if (i > -1) {
                  newVitalSigns.splice(i, 1);
                }
                setSelectedVitalSign(newVitalSigns);
              }
            }}
            value={vitalSign.vitalSign}
          />
        }
        label={
          <>
            <TrafficLight status={vitalSign.vitalSign} /> {vitalSign.name}
          </>
        }
      />
    ))}
  </Grid>
);
