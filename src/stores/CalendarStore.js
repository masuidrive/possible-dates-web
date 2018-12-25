import _ from "lodash"
import { observable, action, computed } from "mobx"
import moment from "moment-timezone"
import CalendarEntry from "./entries/CalendarEntry"
import CalendarListLoader from "./loaders/CalendarListLoader"
import EventLoader from "./loaders/EventLoader"

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
  @observable events = []

  constructor(rootStore) {
    this.rootStore = rootStore
  }

  // google calendar listを読み込む
  // 最初に一回読み込むだけでいい。localStorageでcacheしてもいいかも
  @action async loadCalendarList() {
    console.log("loadCalendarList")
    if (this.calendarListLoader !== undefined) return

    const gapi = this.rootStore.sessionStore.gapi
    this.calendarListLoader = new CalendarListLoader(gapi)
    var loader = await this.calendarListLoader.perform()

    if(loader.isUnauthorized) {
      console.log("loadCalendarList: 5")
    }
    else if(loader.hasError) {
      console.log("loadCalendarList: 6")
    }
    else {
      this.calendars = loader.items
    }
    this.calendarListLoader = undefined
    this.loadEvents(moment(), moment().add(7, "days"))
  }

  @action async loadEvents(startAt, endAt) {
    const gapi = this.rootStore.sessionStore.gapi
    const loader = new EventLoader(gapi, this.calendars, startAt, endAt)
    this.events = await loader.perform()
    this.events = loader.items
/*
    console.log>(">>>>>result")
    loader.items.forEach(item => {
      item.events.forEach(event => {
        console.log(event)
      })
    })
    console.log("<<<<<result")
*/
  }
}
