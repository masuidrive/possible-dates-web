import { observable, action } from 'mobx';
import moment from "moment-timezone";

export default class EventEntry {
  constructor(data, calendar){
    // data is google calendar format
    this.id = data.id
    this.title = data.summary
    this.backgroundColor = calendar.backgroundColor
    this.start = moment(data.start.dateTime || data.start.date)
    if(data.end.dateTime) {
      this.end = moment(data.end.dateTime)
    }
    else {
      this.end = moment(data.end.date).add(1, 'days')
    }
  }

  isAllDay(date) {
    const date_ = moment(date)
    return this.start.isSameOrBefore(date_.startOf('day')) && date_.endOf('day').isSameOrBefore(this.end)
  }
}
