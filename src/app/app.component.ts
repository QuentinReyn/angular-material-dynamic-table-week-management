import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { PersonActivityService } from 'src/services/person-activity.service';
import { Activity } from './models/activity.model';
import { Person } from './models/person.model';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  activities: Activity[] = [
    { Title: 'infra', Value: 0 },
    { Title: 'dev', Value: 0 },
    { Title: 'reseau', Value: 0 },
  ];
  userData: Person[] = [];
  persons: Person[] = [];
  selectedNames = new FormControl([]);
  formGroup!: FormGroup;
  dataSource = new MatTableDataSource<Person>(this.userData);
  firstTimeSelect = null;
  constructor(private personActivityService: PersonActivityService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      weeks: new FormControl(parseInt(moment().format('w'))),
      months: new FormControl(parseInt(moment().format('M'))),
      years: new FormControl(parseInt(moment().format('y')))
    });

    this.getActivities();
    this.getPersons();
    this.selectedNames.valueChanges.subscribe((selectedNames) => {
      this.firstTimeSelect = this.firstTimeSelect ?? true;
      const filteredUserData = this.userData.filter((user) => selectedNames.includes(user.Name));
      this.dataSource.data = filteredUserData;
      this.updateForm(selectedNames);
    });

    this.formGroup.get('weeks').valueChanges.subscribe((value) => {
      let month = moment().day("Monday").week(value).month();
      this.formGroup.get('months').setValue(month+1,{emitEvent: false})
      this.getUserData();
    })

    this.formGroup.get('months').valueChanges.subscribe((value) => {
      let week = moment(value+"/"+this.formGroup.get('years').value,"M/YYYY").week();
      this.formGroup.get('weeks').setValue(week,{emitEvent: false})
      this.getUserData();
    })

    this.formGroup.get('years').valueChanges.subscribe((value) => {
      this.getUserData();
    })
  }

  ngAfterViewInit(): void {
  }

  getPersons() {
    this.personActivityService.getPersons().subscribe({
      next: (data: Person[]) => {
        this.persons = data;
        this.getUserData();
      }
    })
  }

  getActivities() {
    this.personActivityService.getActivities().subscribe({
      next: (data: Activity[]) => {
        this.activities = data;
      }
    })
  }

  setForm(selectedNames: string[]) {
    this.formGroup.removeControl('persons');
    const userDataForm = new FormGroup({});
    this.userData.forEach((user) => {
      if (!selectedNames.includes(user.Name)) {
        return; // skip this user
      }
      const userForm = new FormGroup({});
      user.PersonActivities.forEach((personActivity) => {
        userForm.addControl(personActivity.Activity.Title, new FormControl(personActivity.Value));
      });
      userForm.addControl("StatusId", new FormControl(user.StatusId.toString()))
      userDataForm.addControl(user.Name, userForm);
    });
    this.formGroup.addControl('persons', userDataForm);
    this.dataSource.data = [...this.userData.filter(m => selectedNames.includes(m.Name))]
    this.cdr.detectChanges();
  }

  getUserData() {
    const activeWeek = this.formGroup.get('weeks').value;
    const activeYear = this.formGroup.get('years').value;
    this.personActivityService.getData(activeWeek, activeYear).subscribe({
      next: (data) => {
        this.userData = data;
        if (this.firstTimeSelect) {
          this.selectedNames.setValue(data.filter(m => this.selectedNames.value.includes(m.Name)).map(m => m.Name));
        }
        else {
          this.selectedNames.setValue(this.persons.map(m => m.Name))
        }

        this.setForm(this.selectedNames.value);
      }
    });
  }

  updateForm(selectedNames: string[]) {
    const userDataForm = this.formGroup.get('persons') as FormGroup;
    if (!userDataForm) {
      return;
    }
    Object.keys(userDataForm.controls).forEach(key => {
      if (!selectedNames.includes(key)) {
        userDataForm.removeControl(key);
      }
    });
    this.userData.forEach(user => {
      if (selectedNames.includes(user.Name)) {
        let userForm = userDataForm.get(user.Name) as FormGroup;
        if (!userForm) {
          userForm = new FormGroup({});
          user.PersonActivities.forEach(personActivity => {
            userForm.addControl(personActivity.Activity.Title, new FormControl(personActivity.Value));
          });
          userForm.addControl("StatusId", new FormControl(user.StatusId.toString()))
          userDataForm.addControl(user.Name, userForm);
        } else {
          user.PersonActivities.forEach(personActivity => {
            const control = userForm.get(personActivity.Activity.Title) as FormControl;
            control.setValue(personActivity.Value);
          });
        }
      }
    });
  }

  getActivityControl(userData: Person, activityTitle: string): FormControl {
    const userDataForm = this.formGroup.get('persons') as FormGroup;
    return (userDataForm.get(userData.Name)?.get(activityTitle) as FormControl);
  }

  nextWeek() {
    const newWeekValue = this.formGroup.get('weeks').value + 1;
    if (newWeekValue > 52) {
      this.formGroup.get('weeks').setValue(1,{emitEvent: false});
      this.nextYear();
    }
    else {
      this.formGroup.get('weeks').setValue(newWeekValue);
    }
  }

  previousWeek() {
    const newWeekValue = this.formGroup.get('weeks').value - 1;
    if (newWeekValue < 1) {
      this.previousYear();
      this.formGroup.get('weeks').setValue(52);
    }
    else {
      this.formGroup.get('weeks').setValue(newWeekValue);
    }
  }


  nextMonth() {
    const newMonthValue = this.formGroup.get('months').value + 1;
    if (newMonthValue > 12) {
      this.formGroup.get('months').setValue(1);
      this.formGroup.get('weeks').setValue(1,{emitEvent: false});
      this.nextYear()
    }
    else{
      this.formGroup.get('weeks').setValue(moment(newMonthValue+"/"+this.formGroup.get('years').value,"M/YYYY").week(),{emitEvent: false})
      this.formGroup.get('months').setValue(newMonthValue);
    }
  }

  previousMonth() {
    const newMonthValue = this.formGroup.get('months').value - 1;
    if (newMonthValue < 1) {
      this.formGroup.get('months').setValue(12);
      this.formGroup.get('weeks').setValue(52,{emitEvent: false});
      this.previousYear();
    }
    else{
      this.formGroup.get('weeks').setValue(moment(newMonthValue+"/"+this.formGroup.get('years').value,"M/YYYY").week(),{emitEvent: false})
      this.formGroup.get('months').setValue(newMonthValue);
    }
  }


  nextYear() {
    const newYearValue = this.formGroup.get('years').value + 1;
    this.formGroup.get('years').setValue(newYearValue);
  }

  previousYear() {
    const newYearValue = this.formGroup.get('years').value - 1;
    this.formGroup.get('years').setValue(newYearValue);
  }

  saveData() {
    this.personActivityService.saveUserData(this.formGroup).subscribe({
      next: (data) => {
        this.nextWeek();
      },
      complete: () => {

      }
    })
  }

  get displayedColumns() {
    let displayedColumns = ['name'];
    this.activities.forEach((activity) => {
      displayedColumns.push(activity.Title);
    })
    return displayedColumns;
  }

}