import React, { useState, useEffect,useRef } from 'react';
import { Grid, Divider } from '@material-ui/core';
import { Header } from './Header';
import { MedicalInfo } from './MedicalInfo';
import { PersonalInfo } from './PersonalInfo';

import {
  AssessmentCard,
  ReadingCard,
  ReferralAssessedCard,
  ReferralCancellationCard,
  ReferralNotAttendedCard,
  ReferralPendingCard,
} from './Cards/Cards';
import { PatientStats } from './PatientStats';
import { PregnancyInfo } from './PregnancyInfo';
import { Patient } from 'src/shared/types';
import { useRouteMatch } from 'react-router-dom';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum, SexEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
// import { Card } from 'src/shared/types';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
// import { Icon } from '@material-ui/core';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
// import LineStyleIcon from '@material-ui/icons/LineStyle';
// import { NotRequiredNullableArraySchema } from 'yup';
// import FormControl from '@material-ui/core/FormControl';
// import InputLabel from '@material-ui/core/InputLabel';
// import Grid from '@material-ui/core/Grid';
// import Select from '@material-ui/core/Select';
// import MenuItem from '@material-ui/core/MenuItem';


type RouteParams = {
  patientId: string;
};

type FilterRequestBody = {
  referrals:number;
  readings:number;
  assessments:number;
};

type Filter = {
  //parameter is for net request
  //display_title is for UI display
  parameter: string;
  display_title: string;
};

const Filters: Filter[] = [
{
  parameter: 'referrals',
  display_title: 'Referral',
},
{
  parameter: 'readings',
  display_title: 'Reading',
},
{
  parameter: "assessments",
  display_title: "Assessment",
},
];

// const FilterCheckBoxTitles: string[] = [
//  'Referral', 'Reading', 'Assessment',
// ];


// interface IProps {
//   card:Card;
// };

export const PatientPage = () => {
  const { patientId } = useRouteMatch<RouteParams>().params;
  const [patient, setPatient] = useState<Patient>();
  //we will need to send 2 request, the second is specifically for the cards data array
  const [cards, setCards] = useState([]);
  // var has_more_than_one_cards_originally = false;
  // const [has_more_than_one_cards_originally] = useState(0);
  let original_cards_ref = useRef<boolean>(false);
  // let has_more_than_one_cards_originally = 0;
  const [errorLoading, setErrorLoading] = useState(false);
  const classes = useStyles();
  // const selectedFilters = useState<Filters>();
  const [selectedParameter, setSelectedParameter] =useState<string[]> (['referrals','readings','assessments']);
  const [filterRequestBody] = useState<FilterRequestBody>({referrals:1, readings:1,assessments:1});

  // const [startDate, setStartDate] = useState<Moment | null>(null);



  useEffect(() => {
    /*eslint no-useless-concat: "error"*/
    apiFetch(API_URL + EndpointEnum.PATIENTS + `/${patientId}`)
      .then((resp) => resp.json())
      .then((patient) => {
        // console.log(patient);
        setPatient(patient);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId]);

  useEffect(() => {
    // apiFetch(API_URL + EndpointEnum.PATIENTS + `/${patientId}`)
    apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}/get_all_records?readings=${filterRequestBody.readings}&referrals=${filterRequestBody.referrals}&assessments=${filterRequestBody.assessments}`
    )
      .then((resp) => resp.json())
      .then((cards_data) => {
        // console.log(cards_data);
        if(cards_data.length>0){
          original_cards_ref.current = true;

        }
        console.log(original_cards_ref);//object--property:current
        console.log(original_cards_ref.current);//boolean 值
        /////////////////////////////
        handleAssess(cards_data);

        ////////////////////
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId,original_cards_ref]);

  const handleAssess = (cards_data: any) => {
    const cards_elements = [] as any;
    var index;
    for (index = 0; index < cards_data.length; index++) {
      var card_item = cards_data[index];
      console.log(card_item);

      if (card_item.type === 'reading') {
        cards_elements.push(
          <React.Fragment key={index}>
            <ReadingCard reading={card_item} />
            <br />
          </React.Fragment>
        );
      } else if (card_item.type === 'assessment') {
        cards_elements.push(
          <React.Fragment key={index}>
            <AssessmentCard followUp={card_item} />
            <br />
          </React.Fragment>
        );
      } else if (card_item.type === 'referral') {
        if (card_item.isAssessed) {
          cards_elements.push(
            <React.Fragment key={index}>
              <ReferralAssessedCard referral={card_item} />
              <br />
            </React.Fragment>
          );
        } else if (card_item.isCancelled) {
          cards_elements.push(
            <React.Fragment key={index}>
              <ReferralCancellationCard referral={card_item} />
              <br />
            </React.Fragment>
          );
        } else if (card_item.notAttended) {
          cards_elements.push(
            <React.Fragment key={index}>
              <ReferralNotAttendedCard referral={card_item} />
              <br />
            </React.Fragment>
          );
        } else {
          //pending
          cards_elements.push(
            <React.Fragment key={index}>
              <ReferralPendingCard referral={card_item} />
              <br />
            </React.Fragment>
          );
        }
      } else {
        console.log('error!');
      }
    }
    setCards(cards_elements);
  };


  // const clearFilter = () => {
  //   setSelectedParameter(['referrals','readings','assessments']);
  // };

  const handleChangeFilters = (newFilters:any) => {
    console.log(original_cards_ref);
    console.log(original_cards_ref.current);
    //setSelectedParameter(['referrals','readings','assessments']);
    filterRequestBody!.referrals = 0;
    filterRequestBody!.readings = 0;
    filterRequestBody!.assessments = 0;
    var i;
    for(i=0; i<newFilters.length; i++){
      if(newFilters[i] === 'referrals'){
        filterRequestBody!.referrals = 1;
      }else if(newFilters[i] === 'readings'){
        filterRequestBody!.readings = 1;
      }else if(newFilters[i] === 'assessments'){
        filterRequestBody!.assessments = 1;
      }else {
        //illegal type, not handling
      }

    }

    //request parameters have been ready, now sent request and get new data
    apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}/get_all_records?readings=${filterRequestBody.readings}&referrals=${filterRequestBody.referrals}&assessments=${filterRequestBody.assessments}`
    )
      .then((resp) => resp.json())
      .then((cards_data) => {
        //console.log(cards_data);

        /////////////////////////////
        handleAssess(cards_data);

        ////////////////////

        //after getting the data, render the view
        setSelectedParameter(newFilters);
      })
      .catch(() => {
        setErrorLoading(true);
      });


  };
 

  return (
    <>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <Header patient={patient} />
      <br />
      <Divider />
      <br />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <PersonalInfo patient={patient} />
          <br />
          {patient?.patientSex === SexEnum.FEMALE ? (
            <PregnancyInfo
              patientId={patientId}
              patientName={patient?.patientName}
            />
          ) : (
            <MedicalInfo patient={patient} patientId={patientId} />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <PatientStats patientId={patientId} />
          <br />
          {patient?.patientSex === SexEnum.FEMALE && (
            <MedicalInfo patient={patient} patientId={patientId} />
          )}
        </Grid>
      </Grid>

      {/* 这边看一下要不要用current属性！！！ */}
      {Boolean(original_cards_ref.current) && (
        <>
        {/* <br />
        <Divider />
        <br /> */}
        <br />
        <br />
        <Grid container direction="row" justifyContent="flex-end" alignItems="center">
        <Grid item container justifyContent="flex-end" spacing={2}>
        {/* <Grid item md={12} sm={12} xs={12}> */}
        <Grid item alignItems="center">
          <>
          <HourglassEmptyIcon className={classes.filterIcon}/>
          </>
        
        </Grid>

        <Grid item>
        {/* <Grid item md={6} sm={6} xs={6}> */}
        {Filters.map((filter_checkbox, index) => (<FormControlLabel
                control={
                  <Checkbox
                    checked={selectedParameter.includes(filter_checkbox.parameter)}
                    
                    onChange={(event, checked) => { 
                      // console.log(checked);
                      // console.log(selectedParameter);
                      // console.log(selectedParameter.includes(filter_checkbox.parameter));
                      // console.log(filter_checkbox.parameter);
                      
                      //if the original state is 'selected', now the 'check operation' is to remove this item from the selected array
                      if (checked) {
                        // console.log(event.target.value);
                        const newFilters = [
                          ...selectedParameter,
                          event.target.value, 
                        ];
                        // const arr = [...selectedParameter,
                        //   event.target.value];
                        
                        handleChangeFilters(newFilters);
                        // console.log(selectedParameter);
                        // console.log(arr);
                      } 
                      //if the original state is 'not selected', now the 'check operation' is to add this item to the selected array
                      else {
                        const newParameters = [...selectedParameter];
                        const i = newParameters.indexOf(event.target.value);
                        if (i > -1) {
                          //https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
                          newParameters.splice(i, 1);
                        }
                        handleChangeFilters(newParameters);
                        //selectedParameter = newParameters;
                        // console.log(selectedParameter);
                        // console.log(i);
                      }
                      // console.log(selectedParameter);
                    }}
                    value={filter_checkbox.parameter}
                  />
                }
                label={
                  <>
                    {filter_checkbox.display_title}
                  </>
                }
                key={index}
              />
        ))}
</Grid>
        </Grid>
        </Grid>
        
        










        </>






      )}
      




      {/* {patient?.readings
        ? patient?.readings
            .sort((r1, r2) => (r2.dateTimeTaken ?? 0) - (r1.dateTimeTaken ?? 0))
            .map((r) => (
              <React.Fragment key={r.readingId}>
                <ReadingCard reading={r} />
                <br />
              </React.Fragment>
            ))
        : null} */}

      <br />
      <Divider />
      <br />
      {/* {console.log(cards)} */}

      {cards ? cards.map((card) => <>{card}</>) : null}
    </>
  );
};



export const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    margin: 0,
    height: '100%',
    position: 'relative',
    resize: 'both',
  },
  filterIcon: {
    height: 30,
    width: 30,
    color: '#00b8e6',
    display: `flex`,
    flexDirection: `column`,
    alignItems: `center`,
  },
  content: {
    maxHeight: 600,
  },
  formControl: {
    margin: '4px 8px',
    minWidth: 180,
  },
  inputLabel: {
    fontSize: '50',
  },
  container: {
    margin: 'auto',
  },
  center: {
    display: `flex`,
    flexDirection: `column`,
    alignItems: `center`,
  },
  red: {
    color: '#f44336',
    padding: '2px',
  },
  green: {
    color: '#4caf50',
    padding: '2px',
  },
}));
