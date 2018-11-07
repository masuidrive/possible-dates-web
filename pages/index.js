// store.js
import { observable, action, computed } from "mobx"
// MyComponent.js
import React from "react"
import { inject, observer, Provider } from "mobx-react"
import { SessionSignedIn, SessionSignedOut, SessionNotReady } from "../src/components/SessionComponents"
import CalendarComponent from  "../src/components/CalendarComponent"
import stores from '../src/stores'

@inject("calendarStore")
@observer
class Cal extends React.Component {
  componentDidMount() {
    this.props.calendarStore.loadCalendarList()
  }

  render() {
    const calendars = this.props.calendarStore.calendars
    return (
      <div>
        {
          calendars ? calendars.map((c) => c.name).join(", ") : "empty"
        }
      </div>
    )
  }
}

const App = inject("sessionStore")(observer(({sessionStore}) => (
  <div>
    <SessionNotReady>
      Loading
    </SessionNotReady>

    <SessionSignedIn>
      <Cal/>
    </SessionSignedIn>
    
    <SessionSignedOut>
      <button onClick={() => sessionStore.doSignIn()}>Sign In</button>
    </SessionSignedOut>
  </div>
)))

export default () => (
  <Provider { ...stores }>
    <App />
  </Provider>
)
