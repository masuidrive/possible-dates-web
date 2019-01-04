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

import AvailableEntry from "../../stores/entries/AvailableEntry"

@inject("calendarStore")
@inject("sessionStore")
@inject("availabilityEditorStore")
@observer
export default class extends React.Component {
  state = {
    sidebarVisibilty: false,
    currentDate: DateTime.local().startOf("week")
  }

  constructor(props) {
    super(props)
    this.handleHideSidebar = this.hideSidebar.bind(this)
    this.handleShowSidebar = this.showSidebar.bind(this)
  }

  async componentDidMount() {
    // ロード時に8AMぐらいまでページ位置
    if (window.scrollY == 0) {
      window.scroll(0, 500)
    }

    this.setState({
      calendars: await this.props.calendarStore.calendarList(),
      events: _.flatten(
        (
          (await this.props.calendarStore.getEvents(
            this.state.currentDate.toJSDate(),
            this.state.currentDate.plus({ weeks: 1 }).toJSDate()
          )) || []
        ).map(e => e.events)
      )
    })
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
    return (
      <div>
        <DaysHeaderComponent
          date={this.state.currentDate.toJSDate()}
          onShowMenu={this.handleShowSidebar}
        />
        <CalendarComponent
          date={this.state.currentDate.toJSDate()}
          events={this.state.events || []}
          availables={this.props.availabilityEditorStore.availables}
          onOpenMenu={this.handleShowSidebar}
          className="calendar-component"
        />
        <SidebarComponent
          calendars={this.state.calendars}
          visibility={this.state.sidebarVisibilty}
          onHide={this.handleHideSidebar}
        />
      </div>
    )
  }
}
