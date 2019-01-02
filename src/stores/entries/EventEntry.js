import { observable, action } from "mobx"
import { DateTime } from "luxon"

export default class EventEntry {
  constructor(data, calendar) {
    this.id = data.id
    this.title = data.summary
    this.color = calendar.backgroundColor
    this.start = DateTime.fromISO(
      data.start.dateTime || data.start.date
    ).toJSDate()

    if (data.end.dateTime) {
      this.end = DateTime.fromISO(data.end.dateTime).toJSDate()
    } else {
      this.end = DateTime.fromISO(data.end.date)
        .plus({ days: 1 })
        .toJSDate()
    }
  }

  get startDateTime() {
    return DateTime.fromJSDate(this.start)
  }

  get endDateTime() {
    return DateTime.fromJSDate(this.end)
  }

  isAllDay(date) {
    const date_ = DateTime.fromJSDate(date)
    return (
      this.startDateTime.valueOf() <= date.startOf("day").valueOf() &&
      date.endOf("day").valueOf() <= this.endDateTime.valueOf()
    )
  }
}
