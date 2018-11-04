import { observable, action } from 'mobx';
import moment from "moment-timezone";

export default class EventEntry {
  constructor(data){
    // data is google calendar format
    this.id = data.id;
    this.title = data.summary;
    this.backgroundColor = data.backgroundColor;
    this.isAllDay = !!data.start.date;
    this.start = moment(data.start.dateTime || data.start.date);
    this.end = moment(data.end.dateTime || data.end.date);
  }
}
