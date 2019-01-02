import { observable, action, computed } from "mobx"
import { inject, observer, Provider } from "mobx-react"
import React from "react"
import { Icon, Grid, Segment, Checkbox, Sidebar, Header } from "semantic-ui-react"
import stores from '../../stores'

@inject("calendarStore")
@inject("sessionStore")
@observer
export default class extends React.Component {
  render() {
    return (
      <Sidebar
        as={Segment}
        animation='push'
        icon='labeled'
        onHide={ this.props.onHide }
        vertical
        visible={ this.props.visibilty }
        className="sidemenu"
        color="red"
      >
        <Header size='medium'>Calendars</Header>
        { (this.props.calendars || []).map(c => 
          <div key={c.id} className="calendar-selector"><Checkbox label={c.name}/></div>
        ) }
      </Sidebar>
    )
  }
}
