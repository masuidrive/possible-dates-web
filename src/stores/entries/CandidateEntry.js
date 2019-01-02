import { DateTime } from "luxon"

export default class CandidateEntry {
  constructor(startAt, endAt) {
    this.startAt = startAt
    this.endAt = endAt
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
