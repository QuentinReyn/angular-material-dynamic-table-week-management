import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as ApexCharts from 'apexcharts';
import * as moment from 'moment';
import { ApexOptions, ChartComponent } from 'ng-apexcharts';
import { PersonActivityService } from 'src/services/person-activity.service';
import { Person } from '../models/person.model';
import * as _ from 'lodash';
import { PersonActivity } from '../models/personActivity.model';

@Component({
  selector: 'app-gender-charts',
  templateUrl: './gender-charts.component.html',
  styleUrls: ['./gender-charts.component.scss']
})
export class GenderChartsComponent implements OnInit {

  constructor(private personActivityService: PersonActivityService) { }
  weekNumber: number;
  month: number;
  year: number;
  startDate: Date;
  endDate: Date;
  userData: Person[] = [];
  periodType = new FormControl("week");
  chart: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      id: '1',
    },
    series: [0, 0],
    labels: ["Hommes", "Femmes"],
    colors: ["#008FFB", "#FF4560"],
    title: {
      text: "Répartition hommes/femmes",
      align: "center",
      margin: 10,
      offsetY: 20,
      style: {
        fontSize: "25px",
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
            },
            value: {
              show: true,
              formatter: function (val: any) {
                return val + " (" + Math.round(val / this.chart.series[0].data.reduce((a: number, b: number) => a + b) * 100) + "%)";
              },
            },
            total: {
              show: true,
              formatter: function (val: any) {
                return Math.round(val / this.series[0].data.reduce((a: number, b: number) => a + b) * 100) + "%";
              },
            },
          },
        },
      },
    },
  };
  ranges: string[] = Array.from(Array(52), (_, i) => `Semaine ${i + 1}`);
  weekRangeFormGroup: FormGroup;
  startWeek: Date;
  endWeek: Date;
  startDateControl = new FormControl();
  endDateControl = new FormControl();
  @ViewChild('chartComponent') chartComponent: ChartComponent;
  @ViewChild('chartComponent1') chartComponent1: ChartComponent;
  @ViewChild('chartComponent2') chartComponent2: ChartComponent;
  @ViewChild('chartComponent3') chartComponent3: ChartComponent;


  options: Partial<ApexOptions> = {
    chart: {
      type: 'pie',
    },
    labels: [],
    series: [],
  };

  chartOptions = {
    chart: {
      type: 'pie',
      height: 350
    },
    colors: ['#6A1B9A', '#FF4081'],
    legend: {
      position: 'bottom'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    labels: ['Hommes', 'Femmes']
  };

  chartOptions1 = {
    colors: ['#6A1B9A', '#FF4081'],
    legend: {
      position: 'bottom'
    },
    labels: [],
  };

  chartOptions2 = {
    colors: ['#6A1B9A', '#FF4081'],
    legend: {
      position: 'bottom'
    },
    labels: [],
  };

  chartOptions3 = {
    chart: {
      type: 'line',
    },
    xaxis: {
      categories: [],
    },
  };

  series1 = [];
  series2 = [];
  series = [0, 0];
  data = [
    {
      name: "activité 1",
      data: [
        { x: "11-23", y: 11.3 },
        { x: "12-23", y: 12.3 },
        { x: "13-23", y: 13.3 },
      ]
    },
    {
      name: "activité 2",
      data: [
        { x: "11-23", y: 1.6 },
        { x: "12-23", y: 9.3 },
        { x: "13-23", y: 6.3 },
      ]
    }
  ];

  chartOptions4 = {
    series: [
      {
        name: 'activite 1',
        data: [
          { x: '11-23', y: 11.3 },
          { x: '12-23', y: 12.3 },
          { x: '13-23', y: 13.3 },
        ]
      },
      {
        name: 'activite 2',
        data: [
          { x: '11-23', y: 1.6 },
          { x: '12-23', y: 9.3 },
          { x: '13-23', y: 6.3 },
        ]
      }
    ],
    chart: {
      height: 350,
      type: "line",
      zoom:{
        enabled:false
      }
    }
  };

  ngOnInit(): void {
    this.weekRangeFormGroup = new FormGroup({
      start: new FormControl(),
      end: new FormControl(),
      selectedRange: new FormControl(),
    });
    this.periodType.setValue("range");
    this.year = parseInt(moment().format("y"));
    this.month = parseInt(moment().format("M"));
    this.weekNumber = parseInt(moment().format("w"));
    this.startDate = new Date(this.year, this.month);
    this.endDate = new Date();

    this.weekRangeFormGroup.get('selectedRange').valueChanges.subscribe(range => {
      const [startWeek, endWeek] = range.split('-').map(Number);
      console.log(`Plage de semaines sélectionnée : ${startWeek} à ${endWeek}`);
    })
    // initialisation du graphique
  }

  onEndDateSelected() {
    let startDate = this.startDateControl.value
    let endDate = this.endDateControl.value;
    let startWeekNumber = moment(startDate).week() ? moment(startDate).week() : 0;
    let endWeekNumber = moment(endDate).week() ? moment(endDate).week() : 0;
    let startYear = moment(startDate).year() ? moment(startDate).year() : 0;
    let endYear = moment(endDate).year() ? moment(endDate).year() : 0;
    this.getUserData(startWeekNumber, endWeekNumber, startYear, endYear);
  }

  chosenYearHandler(normalizedYear: Date) {
    const ctrlValue = this.startWeek || new Date();
    ctrlValue.setFullYear(normalizedYear.getFullYear());
    this.startWeek = ctrlValue;
    this.endWeek = null;
  }

  chosenMonthHandler(normalizedMonth: Date) {
    const ctrlValue = this.startWeek || new Date();
    ctrlValue.setMonth(normalizedMonth.getMonth());
    this.startWeek = ctrlValue;
    this.endWeek = null;
  }

  submit() {
    console.log(`Plage de semaines sélectionnée : ${this.startWeek} à ${this.endWeek}`);
  }

  getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  getUserData(weekStart, weekEnd, yearStart, yearEnd) {
    this.personActivityService.getDataByDate(weekStart, weekEnd, yearStart, yearEnd).subscribe({
      next: (data) => {
        this.userData = data;
        this.updateChart();
        this.updateChartType();
        this.updateChartActivity();
        this.updateChartActivities();
      }
    });
  }

  // initData() {
  //   const series1 = [];
  //   const series2 = [];
 
  //   this.data = [series1, series2];
 
  //   for (const item of data) {
  //     if (item.name === 'activité 1') {
  //       for (const dataItem of item.data) {
  //         series1.push({ x: new Date(dataItem.x), y: dataItem.y });
  //       }
  //     } else if (item.name === 'activité 2') {
  //       for (const dataItem of item.data) {
  //         series2.push({ x: new Date(dataItem.x), y: dataItem.y });
  //       }
  //     }
  //   }
  // }

  groupActivitiesByWeekYear(): Map<string, PersonActivity[]> {
    const activityMap = new Map<string, PersonActivity[]>();

    this.userData.forEach((car) => {
      const activityData = car.PersonActivities;

      activityData.forEach((activity) => {
        const key = `${activity.Week}-${activity.Year}`;
        if (!activityMap.has(key)) {
          activityMap.set(key, []);
        }
        activityMap.get(key).push(activity);
      });
    });

    return activityMap;
  }

  updateChartActivities(): void {
    const activityMap = new Map<string, Array<{ week: number, year: number, value: number }>>();
    for (const voiture of this.userData) {
      for (const activity of voiture.PersonActivities) {
        const key = activity.Activity.Title;
        if (!activityMap.has(key)) {
          activityMap.set(key, []);
        }
        activityMap.get(key).push({ week: activity.Week, year: activity.Year, value: activity.Value });
      }
    }

    const chartData = [];
    for (const [activityName, activityValues] of activityMap.entries()) {
      const chartDataItem = {
        name: activityName,
        data: []
      };
      for (const activityValue of activityValues) {
        const xValue = `${activityValue.week}-${activityValue.year}`;
        chartDataItem.data.push({ x: xValue, y: activityValue.value });
      }
      chartData.push(chartDataItem);
    }

    this.chartOptions3 = {
      chart: {
        type: 'line'
      },
      xaxis: {
        categories:[],
      }
    };

    console.log(chartData)
    this.chartComponent3.updateOptions({
      series: chartData,
      xaxis: {
        categories:chartData.map((d) => d.name),
      }
    });
  }


  updateChart() {
    let chartComponent = this.chartComponent
    let men = this.userData.map(m => m.GenderId).filter(m => m == 1).length;
    let women = this.userData.map(m => m.GenderId).filter(m => m == 2).length;
    chartComponent.updateOptions({
      series: [men, women]
    });
  }

  updateChartType() {
    const groupedVoitures = _.groupBy(this.userData, 'Status.Value');
    const series = [];
    const labels = [];
    const totalCount = this.userData.length;
    Object.keys(groupedVoitures).forEach((key) => {
      const count = groupedVoitures[key].length;
      const percentage = Math.round((count / totalCount) * 100);
      series.push(count);
      labels.push(`${key} (${percentage}%)`);
    });
    this.chartComponent1.updateOptions({
      series: series,
      labels: labels,
    });
  }

  updateChartActivity(): void {
    const chartData = Object.values(
      this.userData.reduce((acc, voiture) => {
        voiture.PersonActivities.forEach((activite) => {
          if (!acc[activite.Activity.Title]) {
            acc[activite.Activity.Title] = 0;
          }
          acc[activite.Activity.Title] += activite.Value;
        });
        return acc;
      }, {})
    );

    const chartLabels = Object.keys(
      this.userData.reduce((acc, voiture) => {
        voiture.PersonActivities.forEach((activite) => {
          if (!acc[activite.Activity.Title]) {
            acc[activite.Activity.Title] = 0;
          }
          acc[activite.Activity.Title] += 1;
        });
        return acc;
      }, {})
    );

    this.chartComponent2.updateOptions({
      series: chartData,
      labels: chartLabels,
    });
  }
}