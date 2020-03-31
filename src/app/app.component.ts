import { Component,ComponentFactoryResolver, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { ToasterConfig } from 'angular2-toaster';
import {SchedulerComponent} from './scheduler/scheduler.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public toasterConfig: ToasterConfig =
    new ToasterConfig({
      showCloseButton: true,
      positionClass: 'toast-bottom-center'
    });

    @Input()
    schedulerComponent: SchedulerComponent; 
  
    @ViewChild('target', { read: ViewContainerRef }) target: ViewContainerRef;
    constructor(private resolver: ComponentFactoryResolver) { }
    addScheduler() {
      this.target.clear();
      const factory = this.resolver.resolveComponentFactory(SchedulerComponent);
      const componentRef = this.target.createComponent(factory);
    }
}
