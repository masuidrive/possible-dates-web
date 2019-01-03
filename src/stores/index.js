import { configure } from "mobx"
import SessionStore from "./SessionStore"
import CalendarStore from "./CalendarStore"
import AvailabilityEditorStore from "./AvailabilityEditorStore"

class RootStore {
  constructor() {
    this.sessionStore = new SessionStore(this)
    this.calendarStore = new CalendarStore(this)
    this.availabilityEditorStore = new AvailabilityEditorStore(this)
  }
}

const rootStore = new RootStore()
export default rootStore
