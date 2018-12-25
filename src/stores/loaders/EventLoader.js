import _ from "lodash"
import { observable, action, computed } from 'mobx'
import EventEntry from '../entries/EventEntry'
import utils from "../../utils"
import moment from "moment-timezone"

export default class EventLoader {
  @observable status = undefined
  @observable message = undefined
  @observable items = undefined
  
  constructor(gapi, calendars, startAt, endAt) {
    this.gapi = gapi
    this.calendars = calendars
    this.startAt = moment(startAt).startOf("day")
    this.endAt = moment(endAt).endOf("day")
  }

  @action async perform() {
    return new Promise((resolve, reject) => {
      if(this.status !== undefined) return resolve(this.items)

      this.status = "loading"
      const promises = this.calendars.map(
        cal => this._loadCalendarEvents(cal)
      )
      console.log("promises",promises)

      Promise.all(promises).then(items => {
        console.log("items[0]",items,items[0])
        this.items = items
        this.status = "loaded"
        resolve(this.items)
      })
      .catch(err => reject(this))
    })
  }

  _loadCalendarEvents(calendar) {
    return new Promise((resolve, reject) => {
      this.gapi.client.calendar.events.list({
        calendarId: calendar.id,
        timeMin: this.startAt.toISOString(),
        timeMax: this.endAt.toISOString(),
        showHidden: false,
        showDeleted: false,
        singleEvents: true,
        maxResults: 2500
      })
      .then(({ result }) => {
        console.log("_loadCalendarEvents", result.items)
        const events = result.items.map((event) => new EventEntry(event, calendar))
        resolve({calendar: calendar, events: events})
      })
      .catch(e => {
        if (e.status === 401) {
          this.status = "unauthorized"
          reject(this)
        } else {
          console.error(e);
          this.status = "error"
          reject(this)
        }
      })
    })
  }

  @computed get hasError() {
    return _.includes(["error", "unauthorized"], this.status)
  }

  @computed get isUnauthorized() {
    return this.status === "unauthorized"
  }

  @computed get isLoading() {
    return this.status === "loading"
  }

  @computed get isLoaded() {
    return this.status === "loaded"
  }
}
