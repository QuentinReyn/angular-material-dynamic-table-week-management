import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GenderChartsComponent } from './gender-charts/gender-charts.component';

const routes: Routes = [
  {
    path:'gender-chart',
    component:GenderChartsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
