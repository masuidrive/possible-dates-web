import _ from "lodash"
import React, { ReactNode, SyntheticEvent } from "react"
import moment from "moment-timezone"
import { Button, Icon, Grid, Segment, Modal, List, Dropdown, Divider } from "semantic-ui-react"
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
    this.state = {
      candidates: [],//{start: moment(), end:moment().add(1, "hour")},{start: moment().add(15,"minutes"),end: moment().add(1, "hour").add(15,"minutes")}],
      timeSelector: false,
      sidebarVisibilty: true
    }
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
      e => e.start.isBefore(endAt) && startAt.isSameOrBefore(e.end)
    )
  }

  candidates() {
    return this.state.candidates
    return [{start: moment(), end:moment().add(1, "hour")},{start: moment().add(15,"minutes"),end: moment().add(1, "hour").add(15,"minutes")}]
  }

  candidatesOfDay(date) {
    const startAt = moment(date).startOf("day")
    const endAt = moment(startAt).endOf("day")
    return this.candidates().filter(
      e => e.start.isBefore(endAt) && startAt.isSameOrBefore(moment(e.end))
    )
  }

  // 重なったイベントをインデントする
  eventIndent(events) {
    var processedEvents = []
    return events
      .sort((a, b) => {
        var result = a.start.diff(b.start)
        return result === 0 && a.id && b.id ? a.id.localeCompare(b.id) : result
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
          level = (overlay[0]%4 + 1)
        }

        processedEvents.push([level, e])
        return [level, e]
      })
  }

  toggleTime(time) {
    if(_.find(this.candidates(),(e)=>e.start.isSame(time))) {
      this.setState({
        candidates: _.filter(this.state.candidates,(e)=>!e.start.isSame(time))
      })
    }
    else {
      this.setState({
        candidates: _.concat(this.state.candidates, {start: time, end:moment(time).add(1, "hour")})
      })
    }
  }

  closeTimeSelector() {
    this.setState({
      timeSelector: false
    })
  }

  componentDidMount() {

  }

  render() {
    const startAt = moment().startOf("day")
    var eventsOfWeek = _.times(7, i => {
      const date = moment(startAt).add(i, "day")
      return this.eventIndent(this.eventsOfDay(date).filter(e => !e.isAllDay(date)))
    })
    var candidatesOfWeek = _.times(7, i => {
      const date = moment(startAt).add(i, "day")
      return this.eventIndent(this.candidatesOfDay(date))
    })

    return (
      <div className={this.props.className} style={this.props.style}>
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
                      var start = moment(date).add(parseInt(e.y/(64/4))/4,"hour")
                      this.setState({
                        timeSelector: start,
                        //candidates: _.concat(this.state.candidates, {start: start, end:moment(start).add(1, "hour")})
                      })
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
                          className={"event candidate"}
                          style={{
                            borderColor: "white",
                            color: "white",
                            backgroundColor: "#CE3B27",
                            top: startPos * (this.hourHeight / 60) + 1,
                            height: (endPos - startPos) * (this.hourHeight / 60) - 1
                          }}
                        >
                          {event[1].start.format("HH:mm")}
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
              )
            })}
          </Grid.Row>
        </Grid>
        <Button circular color='facebook' icon='paper plane' className="send-button" size="huge" onClick={()=>{this.setState({sendModal: true})}}/>

        <Modal
          size="mini"
          open={!!this.state.timeSelector}
          onClose={() => this.closeTimeSelector()}
          closeIcon={true}
        >
          <Modal.Header>Select time at { moment(this.state.timeSelector).format("MM/DD") }</Modal.Header>
          <div className="time-select-wrap">
          {_.times(6, i => {
            const startAt = moment(this.state.timeSelector).add((i-2)*15,"minutes")
            const endAt = moment(startAt).add(1, "hour")
            const overlap = !!_.find(this.events(),
              e => e.start.isBefore(endAt) && startAt.isSameOrBefore(moment(e.end)) && !e.isAllDay(startAt)
            )
            const active = !!_.find(this.candidates(),(e)=>e.start.isSame(startAt))

            return (
              <div key={`time:${i}`} className={startAt.minutes()==0 && i > 0? "divider" : ""}>
                <Button className="time-select" basic={overlap && !active} primary={active} onClick={() => this.toggleTime(startAt)}>
                  {startAt.format("HH:mm") }
                </Button>
              </div>
            )
          })}
          </div>
        </Modal>
        
        <Modal
          size="mini"
          open={!!this.state.sendModal}
          onClose={() => {this.setState({sendModal: false})}}
          closeIcon={true}
        >
          <Modal.Header>Send candidates</Modal.Header>
          <div className="time-select-wrap">
          <List items={ _.map(this.candidates(), (event,i) => {
            return(
              `${event.start.format("MM/DD HH:mm")} - ${moment(event.start).add(1,'hour').format("HH:mm")}`
            )
          })}/>
          </div>
        </Modal>

        </div>
    )
  }
}
