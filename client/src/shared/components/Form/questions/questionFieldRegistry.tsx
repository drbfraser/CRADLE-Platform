import { ComponentType } from 'react';
import { QuestionTypeEnum } from 'src/shared/enums';
import { CategoryField } from './CategoryField';
import { DateField } from './DateField';
import { DateTimeField } from './DateTimeField';
import { IntegerField } from './IntegerField';
import { MultipleChoiceField } from './MultipleChoiceField';
import { MultipleSelectField } from './MultipleSelectField';
import { StringField } from './StringField';
import { QuestionFieldProps } from './types';

export const questionFieldRegistry: Partial<
  Record<QuestionTypeEnum, ComponentType<QuestionFieldProps>>
> = {
  [QuestionTypeEnum.CATEGORY]: CategoryField,
  [QuestionTypeEnum.MULTIPLE_CHOICE]: MultipleChoiceField,
  [QuestionTypeEnum.MULTIPLE_SELECT]: MultipleSelectField,
  [QuestionTypeEnum.INTEGER]: IntegerField,
  [QuestionTypeEnum.STRING]: StringField,
  [QuestionTypeEnum.DATE]: DateField,
  [QuestionTypeEnum.DATETIME]: DateTimeField,
};
