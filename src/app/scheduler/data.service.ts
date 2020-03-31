import {Injectable} from '@angular/core';
import {DayPilot} from 'daypilot-pro-angular';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FaceApiService } from '../services/face-api-service.service';
import { parse } from 'querystring';

@Injectable()
export class DataService  implements OnInit {
  public loading = false;
  public personFaces = [];
  public personGroups = [];
  public personList = [];
  public selectedGroupId = 'khmt-12-a';
  public selectedPerson: any;
  ngOnInit() {
    this.loading = true;
    this.faceApi.getPersonGroups().subscribe(data => {
      this.personGroups = data;
      this.loading = false;
    });
  }
  onGroupsChange() {
    if (this.selectedGroupId) {
      this.loading = true;
      this.faceApi.getPersonsByGroup(this.selectedGroupId).subscribe(data => {
        this.personList = data;
        this.selectedPerson = null;
        this.personFaces = [];
        this.loading = false;
         
      });
    }
  }
  resources: any[] = [
    {name : this.personList.push(this.onGroupsChange()[0].name)}
  ];

  events: any[] = [
    {
      id: '1',
      resource: 'R1',
      start: '2018-05-03',
      end: '2018-05-08',
      text: 'Scheduler Event 1',
      color: '#e69138'
    },
    {
      id: '2',
      resource: 'R2',
      start: '2018-05-02',
      end: '2018-05-05',
      text: 'Scheduler Event 2',
      color: '#6aa84f'
    },
    {
      id: '3',
      resource: 'R2',
      start: '2018-05-06',
      end: '2018-05-09',
      text: 'Scheduler Event 3',
      color: '#3c78d8'
    }
  ];

  constructor(private http: HttpClient, private faceApi: FaceApiService) {
  }

  getEvents(from: DayPilot.Date, to: DayPilot.Date): Observable<any[]> {

    // simulating an HTTP request
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(this.events);
      }, 200);
    });

    // return this.http.get("/api/events?from=" + from.toString() + "&to=" + to.toString());
  }

  getResources(): Observable<any[]> {

    // simulating an HTTP request
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(this.resources);
      }, 200);
    });

    // return this.http.get("/api/resources");
  }

}
