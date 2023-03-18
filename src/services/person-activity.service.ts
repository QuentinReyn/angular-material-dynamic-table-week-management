import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class PersonActivityService {

  constructor(private http: HttpClient) { }

  getData(week: number, year: number) {
    return this.http.get('assets/data.json').pipe(
      map((data: { week: number, year: number, data: Person[] }[]) => {
        let tt = data.find(m => m.week == week && m.year == year)?.data;
        if(!tt){
          return [
            {
              name: 'John',
              activities: [
                { title: 'infra', value: 0 },
                { title: 'dev', value: 0 },
                { title: 'reseau', value: 0 }
              ]
            },
            {
              name: 'Jane',
              activities: [
                { title: 'infra', value: 0 },
                { title: 'dev', value: 0 },
                { title: 'reseau', value: 0 }
              ]
            },
            {
              name: 'Bob',
              activities: [
                { title: 'infra', value: 0},
                { title: 'dev', value: 0 },
                { title: 'reseau', value: 0 }
              ]
            }
          ];
        }
        else{
        return tt;
        }
      })
    );
  }

  saveUserData(formData: FormGroup) {
    const weeks = formData.value.weeks;
    const years = formData.value.years;
    const userData = formData.value.persons;
    const persons: Person[] = [];

    for (const name in userData) {
      if (userData.hasOwnProperty(name)) {
        const activities: Activity[] = [];
        for (const title in userData[name]) {
          if (userData[name].hasOwnProperty(title)) {
            const value = userData[name][title];
            const activity = { title, value };
            activities.push(activity);
          }
        }
        const person = { name, activities };
        persons.push(person);
      }
    }

    const data = { week: weeks, year: years, data: persons };
    const url = 'http://example.com/api/persons';
    const options = { headers: { 'Content-Type': 'application/json' } };
    return this.http.post(url, data, options);
  }
}
