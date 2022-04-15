import * as Yup from 'yup';
// import { Question } from 'src/shared/types';
// import { Answer } from 'src/shared/types';
// export type Answer = {
//   value: OrNull<number>;
//   text: OrNull<string>;
//   mc: OrNull<string | undefined>[];
//   comment: OrNull<string>;
// };
// export type Question = {
//   id: number;
//   isBlank: boolean;
//   questionIndex: number;
//   questionText: string;
//   questionType: string;
//   category: string;
//   required: boolean;

//   mcOptions?: OrNull<string>[];
//   numMin?: OrNull<number>;
//   numMax?: OrNull<number>;
//   stringMaxLength?: OrNull<number>;
//   units?: OrNull<string>;
//   answers?: OrNull<Answer>;
//   visibleCondition?: QCondition[] | undefined;
//   shouldHidden?: OrNull<boolean> | undefined;
//   dependencies?: OrNull<[]> | undefined;
// };


// field names here match POST /api/referrals
export enum ReferralField {
  comment = 'comment',
  healthFacility = 'referralHealthFacilityName',
}

export const initialState = {
  // [ReferralField.comment]: '',
  // [ReferralField.healthFacility]: null as string | null,
};

export type ReferralState = typeof initialState;

export const validationSchema = Yup.object().shape({
  // [ReferralField.healthFacility]: Yup.string()
  //   .label('Health Facility')
  //   .required()
  //   .nullable(),
  // [Answer.value]:Yup.string()

});

// .test({
//   // name:"hello",
//   // test: function(values){
//   //   console.log(values.key);
//   //   console.log(values);
//   // }
// })
