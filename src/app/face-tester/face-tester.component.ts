import { Component, OnInit, ViewChild } from '@angular/core';
import { FaceApiService } from '../services/face-api-service.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ExcelService } from '../services/excel.service';
import * as saveAs from 'file-saver';
import { Http, Response } from '@angular/http';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare module 'file-saver';
@Component({
  selector: 'app-face-tester',
  templateUrl: './face-tester.component.html',
  styleUrls: ['./face-tester.component.css'],
  providers: [ExcelService]
})
export class FaceTesterComponent implements OnInit {
  loading = false;
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  uploadState: Observable<string>;
  uploadProgress: Observable<number>;
  downloadURL: Observable<string>;
  
  public detectedFaces: any;
  public identifiedPersons = [];
  public imageUrl: string;
  public multiplier: number;
  public personGroups = [];
  public selectedFace: any;
  public selectedFaces: any;
  public selectedGroupId = '';
  public identifiedFace = []; 
  csvUrl: string = 'https://console.firebase.google.com/u/0/project/my-project-1562601873566/storage/my-project-1562601873566.appspot.com/files/';//'../../../../assets/data.csv';
  public csvData = [];
  @ViewChild('mainImg') mainImg;
  profileUrl: Observable<any>;

  constructor(
    private faceApi: FaceApiService,
    private excelService: ExcelService,
    private http: Http,
    private http1: HttpClient,
    private afStorage: AngularFireStorage
    ) { }

  ngOnInit() {
    this.loading = true;
    this.faceApi.getPersonGroups().subscribe(data => {
      this.personGroups = data;
      this.loading = false;
    });
  }
  public readCsvData () {
    this.loading = true;
    const ref = this.afStorage.ref(`${this.selectedGroupId}.csv`);
    console.log('**profile',ref);

  this.profileUrl;
  ref.getDownloadURL().subscribe(
    data => this.profileUrl = data,  
    err => this.handleError(err),
  );;
  console.log('**profile',this.profileUrl);


  this.http.get(`${this.profileUrl}`)
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
      for(let j =0; j < this.csvData[0].length; j++){
        if(this.csvData[0][j][0] == result[i]){
          this.csvData[0][j].push("+"+"\n");
        }else{
          this.csvData[0][j].push("-"+"\n");
        }
      }
    }
    console.log('**Danh Sach Diem Danh', this.csvData[0]);
    // const filePath = `${'/data'}/${'data.csv'}`;
    // const storageRef = this.afStorage.ref(filePath);
    // const uploadTask = this.afStorage.upload(filePath, this.csvData[0].file);
    // Create storage ref
    let newName = `${this.selectedGroupId}.csv`;
    let file1 = new Blob(this.csvData[0], {type: "text/csv"});

    // upload file
    this.afStorage.ref(`${newName}`).put(file1);
    // console.log('**Danh Sach Diem Danh',this.afStorage.keepUnstableUntilFirst);

  }
  exportData() {
    console.log(this.identifiedPersons);
    this.excelService.exportAsExcelFile(this.identifiedPersons, 'data');
   
    }
}
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods': 'DELETE, POST, GET, OPTIONS'
  })
};

