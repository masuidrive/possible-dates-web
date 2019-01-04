import _ from "lodash"
import { observable, action, computed } from "mobx"
import moment from "moment-timezone"
import CalendarEntry from "./entries/CalendarEntry"
import CalendarListLoader from "./loaders/CalendarListLoader"
import EventLoader from "./loaders/EventLoader"
import { DateTime } from "luxon"
import isOverlapped from "../lib/isOverlapped"
import promiseCache from "../lib/promiseCache"
import { resolve } from "any-promise"

export class FetchEventsRequest {
  constructor(startAt, endAt) {
    this.startAt = moment(startAt).startOf("day")
    this.endAt = moment(endAt).endOf("day")
    this.state = "notYet"
  }
}

export default class CalendarStore {
  @observable _calendars = undefined
  @observable activeCalendars = []
  @observable loaderPromise = undefined
  @observable events = []

  constructor(rootStore) {
    this.rootStore = rootStore
  }

  // google calendar listを読み込む
  // 最初に一回読み込むだけでいい。localStorageでcacheしてもいいかも
  @action calendarList() {
    return promiseCache(this, "_cachedCalendars", async () => {
      const gapi = this.rootStore.sessionStore.gapi
      let calendarListLoader = new CalendarListLoader(gapi)
      let calendarList = await calendarListLoader.perform()
      return calendarList.items
    })

    return new Promise((resolve, reject) => {
      if (this._calendars) return resolve(this._calendars)
      if (this.loaderPromise) {
        this.loaderPromise
          .then(loader => {
            resolve(this._calendars)
          })
          .catch(reason => {
            reject(reason)
          })
      } else {
        const gapi = this.rootStore.sessionStore.gapi
        let calendarListLoader = new CalendarListLoader(gapi)
        this.loaderPromise = calendarListLoader.perform()

        this.loaderPromise
          .then(loader => {
            if (loader.isUnauthorized) {
              console.log("loadCalendarList: 5")
            } else if (loader.hasError) {
              console.log("loadCalendarList: 6")
            } else {
              this._calendars = loader.items
            }
            this.loaderPromise = undefined
          })
          .catch(reason => {
            this.loaderPromise = undefined
            reject(reason)
          })
      }
      resolve(this._calendars)
    })
  }

  // 特定区間のカレンダーデータをAPIで呼び出す
  @action async loadEvents(startAt, endAt) {
    const gapi = this.rootStore.sessionStore.gapi
    const loader = new EventLoader(
      gapi,
      (await this.calendarList()) || [],
      startAt,
      endAt
    )
    this.events = await loader.perform()
    this.events = loader.items
  }

  //
  @action async getEvents(startAt, endAt) {
    const _startAt = DateTime.fromJSDate(startAt).valueOf()
    const _endAt = DateTime.fromJSDate(endAt).valueOf()
    await this.loadEvents(startAt, endAt)

    const events = _.flatten((this.events || []).map(e => e.events))
    return events.filter(e =>
      isOverlapped(
        _startAt,
        _endAt,
        e.startDateTime.valueOf(),
        e.endDateTime.valueOf() - 1
      )
    )
  }
}
