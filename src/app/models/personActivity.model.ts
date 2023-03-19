import { Activity } from "./activity.model";
import { Person } from "./person.model";

export interface PersonActivity {
    Id?: number;
    PersonId?: number;
    ActivityId?: number;
    Week?: number;
    Year?: number;
    Value?: number;
    Person?: Person
    Activity?: Activity
}