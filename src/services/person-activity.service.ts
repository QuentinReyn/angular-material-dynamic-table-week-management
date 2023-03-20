import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Activity } from 'src/app/models/activity.model';
import { Person } from 'src/app/models/person.model';
import { PersonActivity } from 'src/app/models/personActivity.model';
@Injectable({
  providedIn: 'root'
})
export class PersonActivityService {

  constructor(private http: HttpClient) { }

  getData(week: number, year: number) : Observable<Person[]> {
    let params = new HttpParams();
    params = params.append('week',week.toString())
    params = params.append('year',year.toString())
    return this.http.get<Person[]>('http://localhost:61851/api/Persons',{params:params});
  }

  getActivities():Observable<Activity[]>{
    return this.http.get<Activity[]>('http://localhost:61851/api/Persons/GetActivities');
  }

  getPersons() : Observable<Person[]>{
    return this.http.get<Person[]>('http://localhost:61851/api/Persons/List');
  }

  saveUserData(formData: FormGroup) {
    const weeks = formData.value.weeks;
    const years = formData.value.years;
    const userData = formData.value.persons;
    console.log(userData);
    const persons: Person[] = [];

    for (const Name in userData) {
      let StatusId = 0;
      if (userData.hasOwnProperty(Name)) {
        const PersonActivities: PersonActivity[] = [];
        for (const Title in userData[Name]) {
          if (userData[Name].hasOwnProperty(Title)) {
            const Value = userData[Name][Title];
            StatusId = parseInt(userData[Name]["StatusId"]);
            const Activity = { Title };
            const PersonActivity = { Value, Activity };
            PersonActivities.push(PersonActivity);
          }
        }
        const person = { Name, PersonActivities,StatusId };
        persons.push(person);
      }
    }

    const data = { week: weeks, year: years, data: persons };
    const url = 'http://localhost:61851/api/Persons/UpdateOrCreatePersonActivities';
    const options = { headers: { 'Content-Type': 'application/json' } };
    return this.http.post(url, data, options);
  }
}
