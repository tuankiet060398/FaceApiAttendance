import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {DayPilot, DayPilotSchedulerComponent} from 'daypilot-pro-angular';
import {DataService} from './data.service';

@Component({
  selector: 'scheduler-component',
  template: `<daypilot-scheduler [config]="config" [events]="events" #scheduler></daypilot-scheduler>`
})
export class SchedulerComponent implements AfterViewInit {
  ngOnInit() { }

  @ViewChild('scheduler')
  scheduler: DayPilotSchedulerComponent;

  events: any[] = [];

  config: DayPilot.SchedulerConfig = {
    timeHeaders: [{groupBy: 'Month'}, {groupBy: 'Day', format: 'd'}],
    scale: 'Day',
    days: DayPilot.Date.today().daysInMonth(),
    startDate: DayPilot.Date.today().firstDayOfMonth(),
    timeRangeSelectedHandling: 'Enabled',
    visible: true,
    onTimeRangeSelected(args) {
      const dp = this;
      DayPilot.Modal.prompt('Create a new event:', 'Event 1').then((modal) => {
        dp.clearSelection();
        if (!modal.result) { return; }
        dp.events.add(new DayPilot.Event({
          start: args.start,
          end: args.end,
          id: DayPilot.guid(),
          resource: args.resource,
          text: modal.result
        }));
      });
    },
    treeEnabled: true,
  };

  constructor(private ds: DataService) {
  }
  show(): void {
    this.config.visible = false;
  }
  ngAfterViewInit(): void {
    this.ds.getResources().subscribe(result => this.config.resources = result);

    if (this.scheduler) {
      const from = this.scheduler.control.visibleStart();
      const to = this.scheduler.control.visibleEnd();
      this.ds.getEvents(from, to).subscribe(result => {
        this.events = result;
      });
    }
  }

}
