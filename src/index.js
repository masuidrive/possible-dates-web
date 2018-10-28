import _ from "lodash";
import React, { ReactNode, SyntheticEvent } from "react";
import { render } from "react-dom";
import moment from "moment-timezone";
import ApiCalendar from "./components/thirdparty/ApiCalendar.js";
import { Container, Grid, Label, Checkbox } from "semantic-ui-react";
import CalendarComponent from "./components/CalendarComponent.js";
import "semantic-ui-css/semantic.min.css";
import "./styles.scss";

moment.tz.setDefault("Asia/Tokyo");

export default class GoogleCalendarAPIComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gapiAuthorizeStatus: "unknow"
    };
  }

  componentDidMount() {
    // API読み込んだら認証確認
    ApiCalendar.onLoadCallback = signedIn => {
      if (signedIn) {
        this.getCalendars();
      } else {
        this.setState({ gapiAuthorizeStatus: "notAuthorized" });
      }

      ApiCalendar.listenSign(signedIn => {
        if (signedIn) {
          this.getCalendars();
        } else {
          this.setState({ gapiAuthorizeStatus: "notAuthorized" });
        }
      });
    };
  }

  getCalendars() {
    ApiCalendar.gapi.client.calendar.calendarList
      .list({
        showHidden: false,
        showDeleted: false,
        minAccessRole: "reader",
        maxResults: 250
      })
      .then(({ result }) => {
        this.setState({
          gapiAuthorizeStatus: "authorized",
          calendars: result.items
        });
        this.loadEvents();
      })
      .catch(e => {
        if (e.status === 401) {
          this.setState({ gapiAuthorizeStatus: "notAuthorized" });
          this.clearEvents();
        } else {
          this.setState({ gapiAuthorizeStatus: "authError" });
          this.clearEvents();
        }
      });
  }

  clearEvents() {
    this.setState({ events: {}, eventsStatus: "cleard" });
  }

  loadEvent(calendar) {
    var today = moment().startOf("day");
    ApiCalendar.gapi.client.calendar.events
      .list({
        calendarId: calendar.id,
        timeMin: today.toISOString(),
        timeMax: moment(today)
          .add(4, "weeks")
          .toISOString(),
        showHidden: false,
        showDeleted: false,
        singleEvents: true,
        maxResults: 2500
      })
      .then(({ result }) => {
        var events = _.clone(this.state.events);
        events[calendar.id].items = result.items;
        this.setState({
          events: events
        });
      })
      .catch(e => {
        if (e.status === 401) {
          this.setState({ gapiAuthorizeStatus: "notAuthorized" });
          this.clearEvents();
        } else {
          console.log(e);
        }
      });
  }

  loadEvents() {
    var events = _.fromPairs(
      this.state.calendars.map(cal => [
        cal.id,
        { calendar: cal, items: [], status: "loading" }
      ])
    );
    this.setState({ events: events, eventsStatus: "loading" });
    this.state.calendars.forEach(cal => this.loadEvent(cal));
  }

  renderNotAuthorized() {
    return (
      <div>
        <div>{this.state.gapiAuthorizeStatus}</div>
        <button
          onClick={e => ApiCalendar.grantOfflineAccess()} // handleAuthClick()
        >
          sign-in
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
            */}
            <Grid.Column width={16}>
              <CalendarComponent
                events={this.state.events}
                calendars={this.state.calendars}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }

  render() {
    switch (this.state.gapiAuthorizeStatus) {
      case "authorized":
        return this.rednerAuthorized();
      case "unknow":
      case "authorizing":
        return this.renderAuthorizing();
      case "notAuthorized":
        return this.renderNotAuthorized();
      default:
        return (
          <div>
            Unknow authorization error. {this.state.gapiAuthorizeStatus}
          </div>
        );
    }
  }
}

render(<GoogleCalendarAPIComponent />, document.getElementById("root"));
