import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { FaceTesterComponent } from './face-tester/face-tester.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FaceApiService } from './services/face-api-service.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InputBoxComponent } from './input-box/input-box.component';
import { InputBoxService } from './input-box/input-box.service';
import { LoadingModule } from 'ngx-loading';
import { ToasterModule } from 'angular2-toaster';
import { FaceGroupingComponent } from './face-grouping/face-grouping.component';
import { FindSimilarComponent } from './find-similar/find-similar.component';
import { HttpModule } from '@angular/http';
import { AngularFireModule } from 'angularfire2';
import { AngularFireStorageModule } from 'angularfire2/storage';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    ConfigurationComponent,
    FaceTesterComponent,
    InputBoxComponent,
    FaceGroupingComponent,
    FindSimilarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    LoadingModule,
    NgbModule.forRoot(),
    ToasterModule.forRoot(),
    HttpModule,
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyAmMbYcwPldgXVAvZB5i5HvBdQ7OIfjy1g",
      authDomain: "my-project-1562601873566.firebaseapp.com",
      storageBucket: "my-project-1562601873566.appspot.com",
      projectId: "my-project-1562601873566",
    }),
    AngularFireStorageModule
  ],
  providers: [
    FaceApiService,
    InputBoxService
    ],
  bootstrap: [AppComponent],
  entryComponents: [
    InputBoxComponent
  ]
})
export class AppModule { }
