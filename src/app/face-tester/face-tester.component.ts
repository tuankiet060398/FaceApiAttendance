import { Component, OnInit, ViewChild } from '@angular/core';
import { FaceApiService } from '../services/face-api-service.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ExcelService } from '../services/excel.service';
import * as saveAs from 'file-saver';
import { Http, Response } from '@angular/http';

declare module 'file-saver';
@Component({
  selector: 'app-face-tester',
  templateUrl: './face-tester.component.html',
  styleUrls: ['./face-tester.component.css'],
  providers: [ExcelService]
})
export class FaceTesterComponent implements OnInit {
  loading = false;
  public detectedFaces: any;
  public identifiedPersons = [];
  public imageUrl: string;
  public multiplier: number;
  public personGroups = [];
  public selectedFace: any;
  public selectedFaces: any;
  public selectedGroupId = '';
  public identifiedFace = []; 
  csvUrl: string = '../../../../assets/data.csv';
  public csvData = [];
  @ViewChild('mainImg') mainImg;

  constructor(
    private faceApi: FaceApiService,
    private excelService: ExcelService,
    private http: Http
    ) { }

  ngOnInit() {
    this.loading = true;
    this.faceApi.getPersonGroups().subscribe(data => {
      this.personGroups = data;
      this.loading = false;
    });
  }

  public async readCsvData () {
    this.loading = true;
    await this.http.get(this.csvUrl)
    .subscribe(
      data => this.extractData(data),  
      err => this.handleError(err),
    );
    this.loading = false;
  }
  public async extractData(res: Response) {
    this.loading = true;
    let csvData = res['_body'] || '';
    let allTextLines = csvData.split(/\r\n|\n/);
    let headers = allTextLines[0].split(',');
    let lines = [];

    for ( let i = 0; i < allTextLines.length; i++) {
        // split content based on comma
        let data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            let tarr = [];
            for ( let j = 0; j < headers.length; j++) {
                tarr.push(data[j]);
            }
            lines.push(tarr);
        }
    }
    await this.csvData.push(lines);
    console.log('**Data Read',this.csvData);
    this.loading = false;
  }
  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return errMsg;
  }

  detect() {
    this.loading = true;
    this.faceApi.detect(this.imageUrl).subscribe(data => {
      this.detectedFaces = data;
      console.log('**detect results', this.detectedFaces);
      this.loading = false;
    });

  }

  faceClicked(face) {
    this.selectedFace = face;
    if (this.selectedFace.identifiedPersonId) {
      let identifiedPerson = _.find(this.identifiedPersons, { 'personId': face.identifiedPersonId });
      this.selectedFace.name = identifiedPerson.name;
    }
  }

  identify() {
    this.readCsvData();
    let faceIds = _.map(this.detectedFaces, 'faceId');
    this.loading = true;
    this.faceApi.identify(this.selectedGroupId, faceIds).subscribe(identifiedFaces => {
      console.log('**identify results', identifiedFaces);
      let obsList = [];

      _.forEach(identifiedFaces, identifiedFace => {
        if (identifiedFace.candidates.length > 0) {
          let detectedFace = _.find(this.detectedFaces, { faceId: identifiedFace.faceId });
          detectedFace.identifiedPerson = true;
          detectedFace.identifiedPersonId = identifiedFace.candidates[0].personId;
          detectedFace.identifiedPersonConfidence = identifiedFace.candidates[0].confidence;
          obsList.push(this.faceApi.getPerson(this.selectedGroupId, identifiedFace.candidates[0].personId)); 
        }
      });

      forkJoin(obsList).subscribe(results => {
        this.identifiedPersons = results;
        this.loading = false;
      });
    });
  }

  imageLoaded() {
    this.selectedFace = null;
    this.detectedFaces = [];
    let img = this.mainImg.nativeElement;
    this.multiplier = img.clientWidth / img.naturalWidth;

  }
  public createTable(){
    var result = [];
    this.identifiedPersons.forEach(function(o){
      result.push(o.personId);
    });

    for (let i = 0; i < result.length; i++) {
      for(let j =0; i< this.csvData[0].length; i++){
        if(this.csvData[0][j][0] == result[i]){
          this.csvData[0][j].push("+"+"\n");
        }
      }
    }
    let file = new Blob(this.csvData[0],{ type: 'text/plain;charset=utf-8' });

    saveAs(file, 'C:\Users\DELL\Desktop\webapi\FaceAPi\Face-API\src\assets\data.csv');
  }
  exportData() {
    console.log(this.identifiedPersons);
    this.excelService.exportAsExcelFile(this.identifiedPersons, 'data');
   
    }

}

