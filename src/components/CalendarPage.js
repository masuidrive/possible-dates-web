// store.js
import { observable, action, computed } from "mobx"
// MyComponent.js
import React from "react"
import { inject, observer, Provider } from "mobx-react"
import CalendarComponent from  "./CalendarComponent"
import stores from '../stores'
import { Button, Icon, Grid, Segment, Modal, Menu, Header, Image } from "semantic-ui-react"
import moment from "moment-timezone"

@inject("calendarStore")
@observer
export default class extends React.Component {
  componentDidMount() {
    this.props.calendarStore.loadCalendarList()
    if(window.scrollY == 0) {
      window.scroll(0, 500)
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      sidebarVisibilty: false
    }
  }

  handleSidebarHide(e) {
    e.preventDefault()
    this.setState({
      sidebarVisibilty: false
    })
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
          <div className="time-header-wrap" style={{backgroundColor: 'white'}}>
            <div className="time-header">
              <Icon name="bars" size="big" className="menu-icon" onClick={() => this.openMenu()}/>
            </div>
            <Grid columns="equal" className="calendar-header">
              <Grid.Row>
                {_.times(7, i => {
                  const date = moment().add(i, "days")
                  return (
                    <Grid.Column
                      className="day-header"
                      key={`day-header:${i}`}
                    >
                      <div className="day-wrap">
                        <div className="month-label">
                          { (i == 0 || date.date() == 1) ? `${date.month()+1}/` : '' }
                        </div>
                        <div className="day-label">
                          { date.date() }
                        </div>
                        <div className="wday-label">
                          { date.format('ddd') }
                        </div>
                      </div>
                    </Grid.Column>
                  )
                })}
              </Grid.Row>
            </Grid>
          </div>
        </div>
        <CalendarComponent className="calendar-component" events={ this.props.calendarStore.events || [] } onOpenMenu={() => this.openMenu()}/>
        {/*
        <Modal trigger={<Button>Show Modal</Button>}>
    <Modal.Header>Select a Photo</Modal.Header>
    <Modal.Content image>
      <Image wrapped size='medium' src='https://react.semantic-ui.com/images/avatar/large/rachel.png' />
      <Modal.Description>
        <Header>Default Profile Image</Header>
        <p>We've found the following gravatar image associated with your e-mail address.</p>
        <p>Is it okay to use this photo?</p>
      </Modal.Description>
    </Modal.Content>
  </Modal>
          calendars ? calendars.map((c) => c.name).join(", ") : "empty"
        */}
      </div>
    )
  }
}