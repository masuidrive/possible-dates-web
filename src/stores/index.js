import { configure } from 'mobx'
import SessionStore from './SessionStore'
import CalendarStore from './CalendarStore'

class RootStore {
  constructor() {
    this.sessionStore = new SessionStore(this)
    this.calendarStore = new CalendarStore(this)
  }
}

const rootStore = new RootStore()
export default rootStore