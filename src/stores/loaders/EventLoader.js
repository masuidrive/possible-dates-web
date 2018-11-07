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

      Promise.all(promises).then(items => (this.items = items)).catch(err => reject(this))
      this.status = "loaded"
      console.log("items",this.status , this.items)

      resolve(this.items)
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
        console.log(result.items)
        const events = result.items.map((event) => new EventEntry(event))
        resolve([calendar, events])
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


/*
  // Google CalendarのデータをBigCalendarにマッピング
  events() {
    return _.flatten(
      _.values(this.props.events).map(e =>
        e.items
          .filter(
            i =>
              ["confirmed"].indexOf(i.status) >= 0 &&
              !_.find(
                i.attendees,
                a => a.self && a.responseStatus == "declined"
              )
          )
          .map(i => ({
            id: i.id,
            title: i.summary,
            backgroundColor: e.calendar.backgroundColor,
            popup: true,
            isAllDay: !!i["start"].date,
            start: moment(i["start"].dateTime || i["start"].date),
            end: moment(i["end"].dateTime || i["end"].date)
          }))
      )
    );
  }

  eventsOfDay(date) {
    const startAt = moment(date).startOf("day");
    const endAt = moment(startAt).endOf("day");
    return this.events().filter(
      e => e.start.isSameOrBefore(endAt) && startAt.isSameOrBefore(e.end)
    );
  }
*/