import _ from "lodash"
import React, { ReactNode, SyntheticEvent } from "react"
import moment from "moment-timezone"
import { Button, Icon, Grid, Segment,Sticky } from "semantic-ui-react"
import ReactCursorPosition from 'react-cursor-position'
import Clickable from './shared/Clickable'
import lightenDarkenColor from '../lib/lightenDarkenColor'
import "./calendar.scss"
import "semantic-ui-css/semantic.css"
import stores from '../stores'
import StickyBox from 'react-sticky-box'
import { inspect } from "util"


export default class CalendarComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.hourHeight = 64
    this.dayHeaderHeight = 64
    this.timeHeaderWidth = 1
  }

  // Google CalendarのデータをBigCalendarにマッピング
  events() {
    return _.flatten(
      this.props.events.map(e=>e.events)
    )

    return _.flatten(
      this.props.events.map(e =>
        e.events
          .filter(
            i => (
              ["confirmed"].indexOf(i.status) >= 0 &&
              !_.find(
                i.attendees,
                a => a.self && a.responseStatus == "declined"
              )
            )
          )
          .map(i => ({
            id: i.id,
            title: i.summary,
            backgroundColor: e.calendar.backgroundColor,
            popup: true,
            isAllDay: !!i["start"].date,
            start: moment(i["start"].dateTime || i["start"].date),
            end: moment(i["end"].dateTime || i["end"].date)
          }))
      )
    )
  }

  eventsOfDay(date) {
    const startAt = moment(date).startOf("day")
    const endAt = moment(startAt).endOf("day")
    return this.events().filter(
      e => e.start.isSameOrBefore(endAt) && startAt.isSameOrBefore(e.end)
    )
  }

  candidates() {
    return [{start: moment(), end:moment().add(1, "hour")},{start: moment().add(15,"minutes"),end: moment().add(1, "hour").add(15,"minutes")}]
  }

  candidatesOfDay(date) {
    const startAt = moment(date).startOf("day")
    const endAt = moment(startAt).endOf("day")
    return this.candidates().filter(
      e => e.start.isSameOrBefore(endAt) && startAt.isSameOrBefore(moment(e.end))
    )
  }

  // 重なったイベントをインデントする
  eventIndent(events) {
    var processedEvents = []
    return events
      .sort((a, b) => {
        var result = a.start.diff(b.start)
        return result === 0 ? a.id.localeCompare(b.id) : result
      })
      .map(e => {
        var level = 0
        var overlay = _.findLast(
          processedEvents,
          pe =>
            e.start.isBefore(pe[1].end) &&
            pe[1].start.isSameOrBefore(e.end)
        )
        if (overlay) {
          level = overlay[0] + 1
        }

        processedEvents.push([level, e])
        return [level, e]
      })
  }

  componentDidMount() {

  }

  render() {
    const startAt = moment().startOf("day")
    var eventsOfWeek = _.times(7, i => {
      const date = moment(startAt).add(i, "day")
      return this.eventIndent(this.eventsOfDay(date).filter(e => !e.isAllDay(date)))
    }
  )
  var candidatesOfWeek = _.times(7, i => {
    const date = moment(startAt).add(i, "day")
    return this.eventIndent(this.candidatesOfDay(date))
  }
)

    return (
      <div>
        <StickyBox>
          <div className="time-header-wrap" style={{backgroundColor: 'white'}}>
            <div className="time-header">
            </div>
          <Grid columns="equal" className="calendar-header">
            <Grid.Row>
              {_.times(7, i => {
                const date = moment(startAt).add(i, "days")
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
        </StickyBox>
        <div className="time-header" style={{zIndex: -1}}>
          {_.times(23, i => (
            <div
              className="time-label"
              style={{ top: (i + 1) * this.hourHeight - 8 }}
              key={`time-label:${i}`}
            >
              {i + 1}:00
            </div> 
          ))}
        </div>
        <Grid columns="equal" className="calendar">
          <Grid.Row>
            {_.times(7, i => {
              const date = moment(startAt).add(i, "days")
              return (
                <Grid.Column
                  className="day"
                  key={`calendar:${i}`}
                >
                  <Clickable
                    onClick={e => {
                      console.log(i, parseInt(e.y/64,10))
                      e.preventDefault()
                  }}>
                    
                    <div className="vertical-line" />

                    { eventsOfWeek[i].map(event => {
                      const startPos = Math.max(
                        event[1].start.diff(date) / (60 * 1000),
                        0
                      );
                      const endPos = Math.min(
                        event[1].end.diff(date) / (60 * 1000),
                        24 * 60
                      );

                      return event[1].isAllDay(date) ? (
                        undefined
                      ) : (
                        <div
                          key={event[1].id}
                          className={`event level-${event[0] + 1}`}
                          style={{
                            borderColor: lightenDarkenColor(
                              event[1].backgroundColor,
                              -30
                            ),
                            color: lightenDarkenColor(
                              event[1].backgroundColor,
                              -30
                            ),
                            backgroundColor: "#fafafa",
                            top: startPos * (this.hourHeight / 60) + 1,
                            height: (endPos - startPos) * (this.hourHeight / 60) - 1
                          }}
                        >
                          {event[1].title}
                        </div>
                      )
                    })}
                    
                    { candidatesOfWeek[i].map(event => {
                      const startPos = Math.max(
                        event[1].start.diff(date) / (60 * 1000),
                        0
                      )
                      const endPos = Math.min(
                        moment(event[1].end).diff(date) / (60 * 1000),
                        24 * 60
                      )

                      return (
                        <div
                          key={event[1].id}
                          className={`event level-${event[0] + 1}`}
                          style={{
                            borderColor: "white",
                            color: "white",
                            backgroundColor: "#CE3B27",
                            top: startPos * (this.hourHeight / 60) + 1,
                            height: (endPos - startPos) * (this.hourHeight / 60) - 1
                          }}
                        >
                          {event[1].start.format("hh:mm")}
                        </div>
                      )
                    })}

                    {_.times(23, i2 => (
                      <div
                        className="horizontal-line"
                        style={{ top: (i2 + 1) * this.hourHeight }}
                        key={`line:${i2}`}
                      />
                    ))}
                  </Clickable>
                </Grid.Column>
              );
            })}
          </Grid.Row>
        </Grid>
        </div>
    )
  }
}
