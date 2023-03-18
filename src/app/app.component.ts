import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { PersonActivityService } from 'src/services/person-activity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  activities: Activity[] = [
    { title: 'infra', value: 0 },
    { title: 'dev', value: 0 },
    { title: 'reseau', value: 0 },
  ];
  userData: Person[] = [];
  persons = ["John", "Jane", "Bob"];
  selectedNames = new FormControl([]);
  formGroup!: FormGroup;
  dataSource = new MatTableDataSource<Person>(this.userData);
  firstTimeSelect = null;
  constructor(private personActivityService: PersonActivityService, private cdr: ChangeDetectorRef) { }

   ngOnInit(): void {
    this.formGroup = new FormGroup({
      weeks: new FormControl(52),
      years: new FormControl(2023)
    });
    this.getUserData();
    this.selectedNames.valueChanges.subscribe((selectedNames) => {
      this.firstTimeSelect = this.firstTimeSelect ?? true;
      const filteredUserData = this.userData.filter((user) => selectedNames.includes(user.name));
      this.dataSource.data = filteredUserData;
      this.updateForm(selectedNames);
    });

    this.formGroup.get('weeks').valueChanges.subscribe((value)=>{
      this.getUserData();
    })

    this.formGroup.get('years').valueChanges.subscribe((value)=>{
      this.getUserData();
    })
  }

  setForm(selectedNames: string[]) {
    this.formGroup.removeControl('persons');
    const userDataForm = new FormGroup({});
    this.userData.forEach((user) => {
      if (!selectedNames.includes(user.name)) {
        return; // skip this user
      }
      const userForm = new FormGroup({});
      user.activities.forEach((activity) => {
        userForm.addControl(activity.title, new FormControl(activity.value));
      });
      userDataForm.addControl(user.name, userForm);
    });
  
    this.formGroup.addControl('persons', userDataForm);
    console.log(this.userData)
    this.dataSource.data = [...this.userData.filter(m=> selectedNames.includes(m.name))]
    this.cdr.detectChanges();
  }

  getUserData() {
    const activeWeek = this.formGroup.get('weeks').value;
    const activeYear = this.formGroup.get('years').value;
    this.personActivityService.getData(activeWeek, activeYear).subscribe({
      next: (data) => {   
        this.userData = data;
        if(this.firstTimeSelect){
        this.selectedNames.setValue(data.filter(m=>this.selectedNames.value.includes(m.name)).map(m=>m.name));
        }
        else{
          this.selectedNames.setValue(this.persons)
        }
        
        this.setForm(this.selectedNames.value);
      }
    });
  }

  updateForm(selectedNames: string[]) {
    console.log(this.formGroup)
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
      if (selectedNames.includes(user.name)) {
        let userForm = userDataForm.get(user.name) as FormGroup;
        if (!userForm) {
          userForm = new FormGroup({});
          user.activities.forEach(activity => {
            userForm.addControl(activity.title, new FormControl(activity.value));
          });
          userDataForm.addControl(user.name, userForm);
        } else {
          user.activities.forEach(activity => {
            const control = userForm.get(activity.title) as FormControl;
            control.setValue(activity.value);
          });
        }
      }
    });
  }
  getActivityControl(userData: Person, activityTitle: string): FormControl {
    const userDataForm = this.formGroup.get('persons') as FormGroup;
    return (userDataForm.get(userData.name)?.get(activityTitle) as FormControl);
  }

  nextWeek() {
    const newWeekValue = this.formGroup.get('weeks').value + 1;
    if (newWeekValue > 52) {
      this.nextYear();
      this.formGroup.get('weeks').setValue(1);
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

  nextYear() {
    const newYearValue = this.formGroup.get('years').value + 1;
    this.formGroup.get('years').setValue(newYearValue);
  }

  previousYear() {
    const newYearValue = this.formGroup.get('years').value - 1;
    this.formGroup.get('years').setValue(newYearValue);
  }

  saveData(){
    this.personActivityService.saveUserData(this.formGroup).subscribe({
      next:(data)=>{

      }
    })
  }

  get displayedColumns() {
    let displayedColumns = ['name'];
    const selectedNames = this.selectedNames.value.map(name => name.toLowerCase());
    this.userData.forEach(userData => {
      if (selectedNames.includes(userData.name.toLowerCase())) {
        userData.activities.forEach(activity => {
          const activityTitle = activity.title.toLowerCase();
          if (!displayedColumns.includes(activityTitle)) {
            displayedColumns.push(activityTitle);
          }
        });
      }
    });
    return displayedColumns;
  }

}