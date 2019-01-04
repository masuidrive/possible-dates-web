import { DateTime } from "luxon"
import uuidv4 from "uuid/v4"

export default class AvailableEntry {
  constructor(startAt, endAt) {
    this.startAt = startAt
    this.endAt = endAt
    this.id = uuidv4()
  }

  get startDateTime() {
    return DateTime.fromJSDate(this.startAt)
  }

  get endDateTime() {
    return DateTime.fromJSDate(this.endAt)
  }

  isAllDay(date) {
    const date_ = DateTime.fromJSDate(date)
    return (
      this.startDateTime.valueOf() <= date.startOf("day").valueOf() &&
      date.endOf("day").valueOf() <= this.endDateTime.valueOf()
    )
  }
}
