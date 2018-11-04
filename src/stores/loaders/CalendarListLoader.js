import _ from "lodash"
import { observable, action, computed } from 'mobx'
import CalendarEntry from '../entries/CalendarEntry'

export default class CalendarListLoader {
  @observable status = undefined;
  @observable message = undefined;
  @observable items = undefined;
  
  // google calendar listを読み込む
  // 最初に一回読み込むだけでいい。localStorageでcacheしてもいいかも
  @action perform() {
    return new Promise(resolve => {
      if(this.status !== undefined) return resolve(this)

      this.status = "loading"
      ApiCalendar.gapi.client.calendar.calendarList
        .list({
          showHidden: false,
          showDeleted: false,
          minAccessRole: "reader",
          maxResults: 250
        })
        .then(({ result }) => {
          this.items = _.fromPairs(
            result.items.map((calData) => new CalendarEntry(calData)),
            (cal) => [cal.id, cal]
          );
          this.status = "loaded"
          return resolve(this)
        })
        .catch(e => {
          if (e.status === 401) {
            this.status = "unauthorized"
          }
          else {
            this.status = "error"
            this.message = `CalendarListLoader: ${e.inspect()}`
          }
          return resolve(this)
        })
      return true
    })
  }

  @computed hasError() {
    return _.includes(["error", "unauthorized"], this.status)
  }

  @computed isUnauthorized() {
    return this.status === "unauthorized";
  }

  @computed isLoading() {
    return this.status === "loading";
  }

  @computed isLoaded() {
    return this.status === "loaded";
  }
}