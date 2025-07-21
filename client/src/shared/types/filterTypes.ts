export type FilterRequestBody = {
  referrals: boolean;
  readings: boolean;
  assessments: boolean;
  forms: boolean;
};

export type FilterRequestKey = keyof FilterRequestBody;

export type Filter = {
  //parameter is for net request;display_title is for UI display
  parameter: FilterRequestKey;
  display_title: string;
};
