// store.js
import { observable, action, computed } from "mobx"
// MyComponent.js
import React from "react"
import { inject, observer, Provider } from "mobx-react"
import CalendarComponent from  "./CalendarComponent"
import stores from '../stores'
import { Button, Icon, Grid, Segment,Sticky } from "semantic-ui-react"

@inject("calendarStore")
@observer
export default class extends React.Component {
  componentDidMount() {
    this.props.calendarStore.loadCalendarList()
  }

  render() {
    const calendars = this.props.calendarStore.calendars
    return (
      <div>
        {/*
          calendars ? calendars.map((c) => c.name).join(", ") : "empty"
        */}
        <CalendarComponent events={ this.props.calendarStore.events || [] }/>
      </div>
    )
  }
}