import _ from "lodash"
import { observable, action, computed } from "mobx"
import CalendarEntry from "../entries/CalendarEntry"

export default class CalendarListLoader {
  @observable status = undefined
  @observable message = undefined
  @observable items = undefined

  constructor(gapi) {
    this.gapi = gapi
  }

  // google calendar listを読み込む
  // 最初に一回読み込むだけでいい。localStorageでcacheしてもいいかも
  @action perform() {
    return new Promise((resolve, reject) => {
      if (this.status !== undefined) return resolve(this)

      this.status = "loading"
      this.gapi.client.calendar.calendarList
        .list({
          showHidden: false,
          showDeleted: false,
          minAccessRole: "reader",
          maxResults: 250
        })
        .then(({ result }) => {
          this.items = result.items.map(calData => new CalendarEntry(calData))
          this.status = "loaded"
          return resolve(this)
        })
        .catch(e => {
          if (e.status === 401) {
            this.status = "unauthorized"
          } else {
            this.status = "error"
            this.message = `CalendarListLoader: ${e.inspect()}`
          }
          return reject(this)
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
