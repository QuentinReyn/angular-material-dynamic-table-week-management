import { Activity } from "./activity.model";
import { ListValue } from "./listValue.model";
import { PersonActivity } from "./personActivity.model";

export interface Person {
    Id?:number;
    Name: string;
    StatusId:number;
    Status?:ListValue;
    GenderId?:number;
    PersonActivities: PersonActivity[];
  }