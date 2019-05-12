// store.js
import { observable, action, computed } from "mobx"
// MyComponent.js
import React from "react"
import { inject, observer, Provider } from "mobx-react"
import {
  SessionSignedIn,
  SessionSignedOut,
  SessionNotReady
} from "../src/components/SessionComponents"
import CalendarPage from "../src/components/CalendarPage/index"
import stores from "../src/stores"

const App = inject("sessionStore")(
  observer(({ sessionStore }) => (
    <div>
      <SessionNotReady>Loading...</SessionNotReady>

      <SessionSignedIn>
        <CalendarPage />
      </SessionSignedIn>

      <SessionSignedOut>
        <button onClick={() => sessionStore.doSignIn()}>Sign In</button>
      </SessionSignedOut>
    </div>
  ))
)

export default () => (
  <Provider {...stores}>
    <App />
  </Provider>
)
