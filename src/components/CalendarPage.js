import { observable, action, computed } from "mobx"
import React from "react"
import { inject, observer, Provider } from "mobx-react"
import CalendarComponent from "./CalendarComponent"
import stores from "../stores"
import {
  Button,
  Icon,
  Grid,
  Segment,
  Modal,
  Menu,
  List,
  Checkbox,
  Image,
  Sidebar,
  Header
} from "semantic-ui-react"
import { DateTime } from "luxon"
import "./CalendarSidebar.scss"

@inject("calendarStore")
@inject("sessionStore")
@observer
export default class extends React.Component {
  state = {
    sidebarVisibilty: false,
    date: DateTime.local()
      .startOf("week")
      .toJSDate()
  }

  componentDidMount() {
    this.props.calendarStore.loadCalendarList()
    if (window.scrollY == 0) {
      window.scroll(0, 500)
    }
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  handleSidebarHide(e) {
    this.setState({
      sidebarVisibilty: false
    })
    e.stopPropagation()
  }

  openMenu() {
    this.setState({
      sidebarVisibilty: true
    })
  }

  render() {
    const calendars = this.props.calendarStore.calendars
    return (
      <div>
        <div className="fixed-header">
          <div
            className="time-header-wrap"
            style={{ backgroundColor: "white" }}
          >
            <div className="time-header">
              <Icon
                name="bars"
                size="big"
                className="menu-icon"
                onClick={() => this.openMenu()}
              />
            </div>
            <Grid columns="equal" className="calendar-header">
              <Grid.Row>
                {_.times(7, i => {
                  return (
                    <Grid.Column className="day-header" key={`day-header:${i}`}>
                      <div className="day-wrap">
                        <div className="month-label">
                          {i == 0 || date.plus({ days: i }).day == 1
                            ? `${date.plus({ days: i }).month}/`
                            : ""}
                        </div>
                        <div className="day-label">{date.date()}</div>
                        <div className="wday-label">{date.format("ddd")}</div>
                      </div>
                    </Grid.Column>
                  )
                })}
              </Grid.Row>
            </Grid>
          </div>
        </div>
        <CalendarComponent
          className="calendar-component2"
          date={new Date()}
          events={this.props.calendarStore.events || []}
          availables={[]}
          onOpenMenu={() => this.openMenu()}
        />
        <Sidebar
          as={Segment}
          animation="push"
          icon="labeled"
          onHide={e => this.handleSidebarHide(e)}
          vertical
          visible={this.state.sidebarVisibilty}
          className="sidemenu"
          color="red"
        >
          <Header size="medium">Calendars</Header>
          {(calendars || []).map(c => (
            <div key={c.id} className="calendar-selector">
              <Checkbox label={c.name} />
            </div>
          ))}
        </Sidebar>
      </div>
    )
  }
}
