import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';

@Injectable()
export class FaceApiService {

  private baseUrl = 'https://webapidiemdanhlophoc.cognitiveservices.azure.com/face/v1.0';

  constructor(private http: HttpClient) {}


  // ***** Person Group *****

  getPersonGroups() {
    return this.http.get<any[]>(`${this.baseUrl}/persongroups`, httpOptions);
  }

  createPersonGroup(personGroup) {
    return this.http.put<any[]>(`${this.baseUrl}/persongroups/${personGroup.personGroupId}`, personGroup, httpOptions);
  }

  deletePersonGroup(personGroupId) {
    return this.http.delete(`${this.baseUrl}/persongroups/${personGroupId}`, httpOptions);
  }

  trainPersonGroup(personGroupId) {
    return this.http.post<any[]>(`${this.baseUrl}/persongroups/${personGroupId}/train`, null, httpOptions);
  }

  getPersonGroupTrainingStatus(personGroupId) {
    return this.http.get<any>(`${this.baseUrl}/persongroups/${personGroupId}/training`, httpOptions);
  }

  // ***** Persons Operations *****

  getPersonsByGroup(personGroupId) {
    return this.http.get<any[]>(`${this.baseUrl}/persongroups/${personGroupId}/persons`, httpOptions);    
  }

  getPerson(personGroupId, personId) {
    return this.http.get<any[]>(`${this.baseUrl}/persongroups/${personGroupId}/persons/${personId}`, httpOptions);    
  }

  // ***** Person Operations *****

  createPerson(personGroupId, person) {
    return this.http.post<any>(`${this.baseUrl}/persongroups/${personGroupId}/persons`, person, httpOptions);    
  }

  deletePerson(personGroupId, personId) {
    return this.http.delete<any[]>(`${this.baseUrl}/persongroups/${personGroupId}/persons/${personId}`, httpOptions);    
  }

  // ***** Person Face Operations *****/

  getPersonFaces(personGroupId, personId) {
    return this.http.get<any>(`${this.baseUrl}/persongroups/${personGroupId}/persons/${personId}`, httpOptions).flatMap(person => {
      let obsList = [];
      if (person.persistedFaceIds.length) {
        for (const faceId of person.persistedFaceIds) {
          obsList.push(this.getPersonFace(personGroupId, personId, faceId));
        }
        return Observable.forkJoin(obsList);
      } else {
        return Observable.of([]);
      }
    });
  }

  getPersonFace(personGroupId, personId, faceId) {
    return this.http.get(`${this.baseUrl}/persongroups/${personGroupId}/persons/${personId}/persistedfaces/${faceId}`, httpOptions);
  }

  addPersonFace(personGroupId, personId, url) {
    return this.http.post<any>(`${this.baseUrl}/persongroups/${personGroupId}/persons/${personId}/persistedfaces?userData=${url}`, { url: url}, httpOptions);
  }

  deletePersonFace(personGroupId, personId, faceId) {
    return this.http.delete(`${this.baseUrl}/persongroups/${personGroupId}/persons/${personId}/persistedfaces/${faceId}`, httpOptions);
  }

  // ***** Face List Operations *****

  createFaceList(faceListId) {
    return this.http.put(`${this.baseUrl}/facelists/${faceListId}`, { name: faceListId }, httpOptions);
  }

  addFace(faceListId, url) {
    return this.http.post(`${this.baseUrl}/facelists/${faceListId}/persistedFaces`, { url: url }, httpOptions);
  }

  // ***** Face Operations *****

  detect(url) {
    return this.http.post<any[]>(`${this.baseUrl}/detect?returnFaceLandmarks=false&returnFaceAttributes=age,gender,smile,glasses,emotion,facialHair`, { url: url }, httpOptions);
  }

  identify(personGroupId, faceIds) {
    let request = {
      personGroupId: personGroupId,
      faceIds: faceIds,
      confidenceThreshold: 0.6
    };
    return this.http.post<any[]>(`${this.baseUrl}/identify`, request, httpOptions);
  }

  group(faceIds) {
    return this.http.post<any>(`${this.baseUrl}/group`, { faceIds: faceIds }, httpOptions);
  }

  findSimilar(faceListId, faceId) {
    let request = { faceId: faceId, faceListId: faceListId };
    return this.http.post<any>(`${this.baseUrl}/findsimilars`, request, httpOptions);
  }




}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': '2e74029050564e7fbc3f0b9f711d35d7'
  })
};
