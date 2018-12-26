// store.js
import { observable, action, computed } from "mobx"
// MyComponent.js
import React from "react"
import { inject, observer, Provider } from "mobx-react"
import CalendarComponent from  "./CalendarComponent"
import stores from '../stores'
import { Button, Icon, Grid, Segment,Sidebar, Menu, Header, Image } from "semantic-ui-react"

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
        <Sidebar.Pushable as={Segment}>
          <Sidebar
            as={Menu}
            animation='overlay'
            icon='labeled'
            inverted
            onHide={(e) => this.handleSidebarHide(e)}
            vertical
            visible={this.state.sidebarVisibilty}
            width='wide'
          >
            <Menu.Item as='a'>
              <Icon name='home' />
              Home
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='gamepad' />
              Games
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='camera' />
              Channels
            </Menu.Item>
          </Sidebar>
          <Sidebar.Pusher dimmed={this.state.sidebarVisibilty}>
            <CalendarComponent events={ this.props.calendarStore.events || [] } onOpenMenu={() => this.openMenu()}/>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
        {/*
          calendars ? calendars.map((c) => c.name).join(", ") : "empty"
        */}
      </div>
    )
  }
}