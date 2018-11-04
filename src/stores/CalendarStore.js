import _ from "lodash"
import { observable, action, computed } from 'mobx'
import CalendarEntry from "./entries/CalendarEntry"
import CalendarListLoader from "./loaders/CalendarListLoader"

export class FetchEventsRequest {
  constructor(startAt, endAt) {
    this.startAt = moment(startAt).startOf("day")
    this.endAt = moment(endAt).endOf("day")
    this.state = "notYet"
  }
}

export default class CalendarStore {
  @observable calendars = undefined
  @observable eventsOfDay = {}
  @observable activeCalendars = []
  @observable calendarListLoader = undefined

  // google calendar listを読み込む
  // 最初に一回読み込むだけでいい。localStorageでcacheしてもいいかも
  @action async loadCalendarList() {
    if (this.calendarListLoader !== undefined) return

    this.calendarListLoader = new CalendarListLoader()
    var loader = await this.calendarListLoader.perform()
    if(loader.isUnauthorized()) {

      this.calendarListLoader = undefined
    }
    else if(loader.hasError()) {
      

      this.calendarListLoader = undefined
    }
    this.calendars = loader.items
    this.calendarListLoader = undefined

    ApiCalendar.gapi.client.calendar.calendarList
      .list({
        showHidden: false,
        showDeleted: false,
        minAccessRole: "reader",
        maxResults: 250
      })
      .then(({ result }) => {
        this.calendars = _.fromPairs(
          result.items.map(calData => new CalendarEntry(calData)),
          cal => [cal.id, cal]
        )
        // TODO: とりあえず全部active
        this.activeCalendars = _.keys(this.calendars)
      })
      .catch(e => {
        if (e.status === 401) {
          this._raiseUnauthorized()
        } else {
          console.error(e)
          this._raiseAPIError()
        }
      })
  }

  // eventを読み込む
}
