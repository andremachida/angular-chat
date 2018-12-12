import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-resources',
  templateUrl: './dashboard-resources.component.html',
  styleUrls: ['./dashboard-resources.component.scss']
})
export class DashboardResourcesComponent implements OnInit {

  resources: any[] = [
    {
      url: '/dashboard',
      icon: 'home',
      title: 'Home'
    }
  ];

  constructor() { }

  ngOnInit() {
  }



}
