import { configure } from 'mobx'
import SessionStore from './SessionStore'
import CalendarStore from './CalendarStore'
import CounterStore from './CounterStore'

//configure({ enforceActions: true })

class RootStore {
  constructor() {
    this.sessionStore = new SessionStore(this)
    this.calendarStore = new CalendarStore(this)
    this.counterStore = new CounterStore(this)
  }
}

const rootStore = new RootStore()
export default rootStore