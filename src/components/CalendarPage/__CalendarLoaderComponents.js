import _ from "lodash"
import React, { ReactNode, SyntheticEvent } from "react"
import moment from "moment-timezone"
import utils from "./utils"

export class CalendarLoaderRequest {
  constructor(startAt, endAt) {
    this.startAt = moment(startAt).startOf("day")
    this.endAt = moment(endAt).endOf("day")
    this.state = "notYet"
  }
}

export default class CalendarLoaderComponent extends React.Component {
  constructor(props) {
    super(props)
    // onChangeState() // Unauthorized, Loading, Ready, APIError
    // onLoadEvents(date)
    this.state = {
      state: "Unknown",
      eventsOfDay: {},
      calendars: {},
      activeCalendars: [],
      requestQueue: []
    }
  }

  componentDidMount() {
    // API読み込んだら認証確認
    ApiCalendar.onLoadCallback = signedIn => {
      if (signedIn) {
        this.reload()
      } else {
        this._raiseUnauthorized()
      }

      ApiCalendar.listenSign(signedIn => {
        if (signedIn) {
          this.reload()
        } else {
          this._raiseUnauthorized()
        }
      })
    }
  }

  reload() {
    this.props.onChangeState("Loading")
    this.setState({ state: "Loading" })
    this.loadCalendarList()
  }

  // google calendar listを読み込む
  loadCalendarList() {
    ApiCalendar.gapi.client.calendar.calendarList
      .list({
        showHidden: false,
        showDeleted: false,
        minAccessRole: "reader",
        maxResults: 250
      })
      .then(({ result }) => {
        this.setState({
          state: "Ready",
          calendars: _.fromPairs(result.items, cal => [
            cal.id,
            { calendar: cal, eventsOfDay: {} }
          ]),
          activeCalendars: result.items.map(cal => cal.id) // TODO: とりあえず全部active
        })
        this.props.onChangeState("Ready")
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

  // 有効なカレンダーにイベントを読み込む
  // すでに読み込まれているなら、ここでonLoadEventsを読み込む
  loadActiveCalendarEvents(request) {
    // 有効なカレンダーの読み込み状況を確認する
    var isLoaded = true
    this.state.activeCalendars.forEach(calId => {
      if (!isLoaded) return
      const events = this.state.calendars[calId].eventsOfDay
      utils._enumMomentDays(request.startAt, request.endAt, date => {
        const dateStr = date.format("YYYYMMDD")
        if (events[dateStr] === undefined) {
          isLoaded = false
        }
      })
    })

    // 全部読み込んでたらinLoadEventsを呼び出し
    // 読み込んでないものがあれば、loadCalendarEvents()
    if (isLoaded) {
      this._raiseOnLoadEvents(request)
    } else {
      request.state = "loading"
      this.state.activeCalendars.forEach(calId =>
        this.loadCalendarEvents(calId, request)
      )
    }
  }

  // state.calendars[calId].events[dateStr]にイベントを読み込む
  loadCalendarEvents(calendarId, request) {
    const calendar = this.state.calendars.calendarId
    ApiCalendar.gapi.client.calendar.events
      .list({
        calendarId: calendar.id,
        timeMin: request.startAt.toISOString(),
        timeMax: request.endAt.toISOString(),
        showHidden: false,
        showDeleted: false,
        singleEvents: true,
        maxResults: 2500
      })
      .then(({ result }) => {
        const resultEvents = this._normalizeGCalEvents(result.items)
        var calendars = _.clone(this.state.calendars)
        var events = calendars[calendarId].eventsOfDay

        // イベントを1日ずつにばらしてeventsに入れる
        utils._enumMomentDays(request.startAt, request.endAt, date => {
          const dateStr = date.format("YYYYMMDD")
          if (events[dateStr] === undefined) {
            events[dateStr] = []
          }

          const startOfDayAt = moment(date).startOf("day")
          const endOfDayAt = moment(startOfDayAt).endOf("day")
          events[dateStr] = resultEvents.filter(e =>
            utils._isOverrappedMoment(e.start, e.end, startOfDayAt, endOfDayAt)
          )
          // requestが全部読み込み終わったらonLoadEventsを呼び出す
          this._raiseOnLoadEvents(
            request,
            this.state.activeCalendars.map(calId => calendars[calId])
          )
        })

        this.setState({
          calendars: calendars
        })
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

  // 指定日のデータが全部読み込まれてたらonLoadEventsを発行する
  _raiseOnLoadEvents(request, calendars) {
    if (calendars === undefined) {
      calendars = this.state.activeCalendars.map(
        calId => this.state.calendars[calId]
      )
    }
    var isLoaded = true
    var events = []
    utils._enumMomentDays(request.startAt, request.endAt, date => {
      const dateStr = date.format("YYYYMMDD")
      const eventsOfDay = calendars.map(cal => cal.eventsOfDay[dateStr])
      if (_.includes(eventsOfDay, undefined)) {
        isLoaded = false
        return false
      } else {
        events.push(eventsOfDay)
      }
    })
    if (isLoaded) {
      request.state = "loaded"
      this.props.onLoadEvents(request, events)
    }
  }

  // 認証失敗した
  _raiseUnauthorized() {
    this.props.onChangeState("Unauthorized")
    this.setState({ state: "Unauthorized" })
  }

  // APIエラーが帰ってきたよ
  _raiseAPIError() {
    this.props.onChangeState("APIError")
    this.setState({ state: "APIError" })
  }

  // google calendar eventから余計なものを取り除く
  _normalizeGCalEvents(gCalEvent) {
    return _.flatten(
      _.values(gCalEvent).map(gce =>
        gce.items
          .filter(
            ev =>
              ["confirmed"].indexOf(ev.status) >= 0 &&
              !_.find(
                ev.attendees,
                attendee =>
                  attendee.self && attendee.responseStatus === "declined"
              )
          )
          .map(ev => ({
            id: ev.id,
            title: ev.summary,
            backgroundColor: gce.calendar.backgroundColor,
            calendarId: gce.calendar.id,
            calendarName: gce.calendar.summary,
            isAllDay: !!ev.start.date,
            start: moment(ev.start.dateTime || ev.start.date),
            end: moment(ev.end.dateTime || ev.end.date)
          }))
      )
    )
  }
}
