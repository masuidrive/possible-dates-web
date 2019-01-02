import { observable, action, computed } from "mobx"
import { inject, observer, Provider } from "mobx-react"
import React from "react"
import { Icon, Grid, Segment, Checkbox, Header } from "semantic-ui-react"
import moment from "moment-timezone"
import _ from "lodash"
import { DateTime } from "luxon"

import stores from "../../stores"
import SidebarComponent from "./SidebarComponent"
import DaysHeaderComponent from "./DaysHeaderComponent"
import CalendarComponent from "./CalendarComponent"
import "./index.scss"
import "semantic-ui-css/semantic.css"

import CandidateEntry from "../../stores/entries/CandidateEntry"

@inject("calendarStore")
@inject("sessionStore")
@observer
export default class extends React.Component {
  state = {
    sidebarVisibilty: false,
    currentDate: moment().startOf("week")
  }

  constructor(props) {
    super(props)
    this.handleHideSidebar = this.hideSidebar.bind(this)
    this.handleShowSidebar = this.showSidebar.bind(this)
  }

  componentDidMount() {
    this.props.calendarStore.loadCalendarList()

    // ロード時に8AMぐらいまでページ位置
    if (window.scrollY == 0) {
      window.scroll(0, 500)
    }
  }

  hideSidebar(e) {
    this.setState({
      sidebarVisibilty: false
    })
    if (e) e.stopPropagation()
  }

  showSidebar(e) {
    this.setState({
      sidebarVisibilty: true
    })
    if (e) e.stopPropagation()
  }

  render() {
    const calendars = this.props.calendarStore.calendars
    const events = _.flatten(
      (this.props.calendarStore.events || []).map(e => e.events)
    )

    return (
      <div>
        <DaysHeaderComponent
          date={this.state.currentDate.toDate()}
          onShowMenu={this.handleShowSidebar}
        />
        <CalendarComponent
          date={this.state.currentDate.toDate()}
          events={events}
          candidates={[
            new CandidateEntry(
              new Date(),
              DateTime.local()
                .plus({ hours: 1 })
                .toJSDate()
            )
          ]}
          onOpenMenu={this.handleShowSidebar}
          className="calendar-component"
        />
        <SidebarComponent
          calendars={calendars}
          visibility={this.state.sidebarVisibilty}
          onHide={this.handleHideSidebar}
        />
      </div>
    )
  }
}
