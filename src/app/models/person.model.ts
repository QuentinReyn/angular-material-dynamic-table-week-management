import { Activity } from "./activity.model";
import { PersonActivity } from "./personActivity.model";

export interface Person {
    Id?:number;
    Name: string;
    PersonActivities: PersonActivity[];
  }