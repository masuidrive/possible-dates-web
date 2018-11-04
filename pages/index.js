// store.js
import { observable, action, computed } from "mobx"
// MyComponent.js
import React from "react"
import { inject, observer, Provider } from "mobx-react"
import { SessionSignedIn, SessionSignedOut, SessionNotReady } from "../src/components/SessionComponents"
import stores from '../src/stores'

const App = inject("counterStore", "sessionStore")(observer(({counterStore, sessionStore}) => (
  <div>
    <SessionNotReady>
      Loading
    </SessionNotReady>

    <SessionSignedIn>
      <div>
        <button onClick={() => counterStore.increment()}>+1</button>
        <span>{counterStore.counter}</span>
        <button onClick={() => counterStore.decrement()}>-1</button>
        <div>
          {" "}
          <button onClick={() => counterStore.doTest1()}>Test1</button>
          {counterStore.test1[0].msg}
        </div>
        <div>{sessionStore.status}</div>
      </div>
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

//export default observer(Counter);
/*
import _ from "lodash";
import React, { ReactNode, SyntheticEvent } from "react";
import { render } from "react-dom";
import moment from "moment-timezone";
import ApiCalendar from "./components/thirdparty/ApiCalendar.js";
import { CalendarLoaderComponent, CalendarLoaderRequest } from "./components/CalendarLoaderComponent.js";
import CalendarComponent from "./components/CalendarComponent.js";
import { Container, Grid, Label, Checkbox } from "semantic-ui-react";
import CalendarStore from "./CalendarStore";
import "semantic-ui-css/semantic.min.css";
import "./styles.scss";

moment.tz.setDefault("Asia/Tokyo");

export default class GoogleCalendarAPIComponent extends React.Component {
  constructor(props) {
    super(props);
    const calendarType = "week";
    this.state = {
      calendarLoaderState: "Unknow",
      date: moment().startOf(calendarType),
      calendarType: calendarType,
      events: {}
    };
  }

  updateCalendarLoadState(calendarLoaderState) {
    if(calendarLoaderState != this.state.calendarLoaderState) {
      if(calendarLoaderState == "Ready") {
        var startAt = moment().startOf("day");
        var endAt = moment(startAt).add(4, "weeks");
        var request = new CalendarLoaderRequest(startAt, endAt);
        loader.loadActiveCalendarEvents(request);
      }
    }
    this.setState({calendarLoaderState: state});
  }

  componentDidMount() {
  }

  renderNotAuthorized() {
    return (
      <div>
        <div>{this.state.gapiAuthorizeStatus}</div>
        <button
          onClick={e => ApiCalendar.grantOfflineAccess()} // handleAuthClick()
        >
          Sign-in
        </button>
      </div>
    );
  }

  renderAuthorizing() {
    return <div>In progress...</div>;
  }

  rednerAuthorized() {
    return (
      <Container style={{ height: "100vh" }}>
        <Grid columns={16} style={{ minHeight: "100%" }}>
          <Grid.Row>
            {/*
            <Grid.Column width={4} style={{ display: "hidden" }}>
              <button onClick={e => ApiCalendar.handleSignoutClick()}>
                sign-out
              </button>
              <div>
                {this.state.calendars.map(calendar => (
                  <Label
                    style={{ background: calendar.backgroundColor }}
                    key={calendar.id}
                  >
                    <Checkbox label={calendar.summary} />
                  </Label>
                ))}
              </div>
            </Grid.Column>
            *-/}
            <Grid.Column width={16}>
              <CalendarComponent
                events={this.state.events}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }

  render() {
    var mainComponent;
    switch (this.state.calendarLoaderState) {
      case "Ready":
        mainComponent = this.rednerAuthorized();
      case "Unknow":
      case "Loading":
        mainComponent = this.renderAuthorizing();
      case "Unauthorized":
        mainComponent = this.renderNotAuthorized();
      default:
        mainComponent = (
          <div>
            Unknow authorization error. {this.state.calendarLoaderState}
          </div>
        );
    }
    return(
      <div>
        <CalendarLoaderComponent
          onChangeState={ state => this.updateCalendarLoadState(state) }
          onLoadEvents={ (date, events) => this.eventsOfDay(date, events) }
        />
        { mainComponent }
      </div>
    )
  }
}

render(<GoogleCalendarAPIComponent />, document.getElementById("root"));
*/
