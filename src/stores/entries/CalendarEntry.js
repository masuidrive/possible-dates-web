import { observable, action } from 'mobx';
import moment from "moment-timezone";

export default class CalendarEntry {
  constructor(data) {
    // data is google calendar format
    this.id = data.id;
    this.backgroundColor = data.backgroundColor;
    this.name = data.summary;
  }
}
