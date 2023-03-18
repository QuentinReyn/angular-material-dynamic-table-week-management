import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class PersonActivityService {

  constructor(private http: HttpClient) { }

  getData(week: number, year: number) {
    return this.http.get('assets/data.json').pipe(
      map((data: { week: number, year: number, data: UserData[] }[]) => {
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
}
