import React from "react"
import { Icon, Grid } from "semantic-ui-react"
import { DateTime } from "luxon"

export default ({onShowMenu, date}) => (
  <div className="fixed-header">
    <div className="time-header-wrap" style={{backgroundColor: 'white'}}>
      <div className="time-header">
        <Icon name="bars" size="big" className="menu-icon" onClick={onShowMenu}/>
      </div>
      <Grid columns="equal" className="calendar-header">
        <Grid.Row>
          {_.times(7, i => {
            const datetime = DateTime.fromJSDate(date).plus({ days: i })
            return (
              <Grid.Column
                className="day-header"
                key={`day-header:${i}`}
              >
                <div className="day-wrap">
                  <div className="month-label">
                    { (i == 0 || datetime.day == 1) ? `${datetime.month}/` : '' }
                  </div>
                  <div className="day-label">
                    { datetime.day }
                  </div>
                  <div className="wday-label">
                    { datetime.weekdayShort }
                  </div>
                </div>
              </Grid.Column>
            )
          })}
        </Grid.Row>
      </Grid>
    </div>
  </div>
) 