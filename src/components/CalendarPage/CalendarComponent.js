import React, { ReactNode, SyntheticEvent } from "react"
import PropTypes from "prop-types"
import moment from "moment-timezone"
import {
  Button,
  Icon,
  Grid,
  Segment,
  Modal,
  List,
  Dropdown,
  Divider
} from "semantic-ui-react"
import Clickable from "../shared/Clickable"
import lightenDarkenColor from "../../lib/lightenDarkenColor"
import stores from "../../stores"
import isOverlapped from "../../lib/isOverlapped"
import { DateTime } from "luxon"
import EventEntry from "../../stores/entries/EventEntry"
import CandidateEntry from "../../stores/entries/CandidateEntry"
import _ from "lodash"

export default class CalendarComponent extends React.Component {
  static propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    events: PropTypes.arrayOf(PropTypes.instanceOf(EventEntry)).isRequired,
    candidates: PropTypes.arrayOf(PropTypes.instanceOf(CandidateEntry))
      .isRequired
  }

  state = {
    timeSelector: false
  }

  static hourHeight = 64

  constructor(props) {
    super(props)
    this.date = DateTime.fromJSDate(this.props.date)
  }

  // 指定日のデータを取り出す
  eventsOfDay(events, date) {
    return events.filter(e =>
      isOverlapped(
        date.valueOf(),
        date.endOf("day").valueOf(),
        e.startDateTime.valueOf(),
        e.endDateTime.valueOf() - 1
      )
    )
  }

  // 重なったイベントをインデントする
  eventIndent(events) {
    var processedEvents = []
    return events
      .sort((a, b) => {
        let result = a.startDateTime.valueOf() - b.startDateTime.valueOf()
        return result === 0 && a.id && b.id ? a.id.localeCompare(b.id) : result
      })
      .map(e => {
        let level = 0
        let overlap = _.findLast(processedEvents, pe =>
          isOverlapped(
            e.startDateTime.valueOf(),
            e.endDateTime.valueOf() - 1,
            pe[1].startDateTime.valueOf(),
            pe[1].endDateTime.valueOf()
          )
        )
        if (overlap) {
          level = (overlap[0] % 4) + 1
        }
        processedEvents.push([level, e])
        return { event: e, level: level }
      })
  }

  toggleTime(time) {
    if (_.find(this.state.candidates, e => e.startDateTime.equals(time))) {
      let candidates = _.filter(
        this.state.candidates,
        e => !e.start.isSame(time)
      )
    } else {
      let candidates = _.concat(this.state.candidates, {
        start: time,
        end: moment(time).add(1, "hour")
      })
    }
    this.setState({ candidates })
  }

  closeTimeSelector() {
    this.setState({
      timeSelector: false
    })
  }

  render() {
    const startAt = this.date.startOf("day")

    const eventsOfWeek = _.times(7, i => {
      const date = startAt.plus({ days: i })
      return this.eventIndent(this.eventsOfDay(this.props.events, date))
    })

    const candidatesOfWeek = _.times(7, i => {
      const date = startAt.plus({ days: i })
      return this.eventsOfDay(this.props.candidates, date)
    })
    console.log("candidatesOfWeek", this.props.candidates, candidatesOfWeek)

    const Frame = this.Frame.bind(this)
    return (
      <div className={this.props.className} style={this.props.style}>
        <div className="time-header" style={{ zIndex: -1 }}>
          {_.times(23, i => (
            <div
              className="time-label"
              style={{ top: (i + 1) * this.constructor.hourHeight - 8 }}
              key={`time-label:${i}`}
            >
              {i + 1}:00
            </div>
          ))}
        </div>
        <Grid columns="equal" className="calendar">
          <Grid.Row>
            {_.times(7, i => {
              const date = startAt.plus({ days: i })
              return (
                <Grid.Column className="day" key={`calendar:${i}`}>
                  <Clickable
                    onClick={e => {
                      var start = moment(date).add(
                        parseInt(e.y / (64 / 4)) / 4,
                        "hour"
                      )
                      this.setState({
                        timeSelector: start
                        //candidates: _.concat(this.state.candidates, {start: start, end:moment(start).add(1, "hour")})
                      })
                      e.preventDefault()
                    }}
                  >
                    <div className="vertical-line" />

                    {eventsOfWeek[i].map(({ level, event }) => {
                      let color = lightenDarkenColor(event.color, -30)
                      return event.isAllDay(date) ? (
                        undefined
                      ) : (
                        <Frame
                          key={event.id}
                          className={`event level-${level + 1}`}
                          date={date}
                          start={event.startDateTime}
                          end={event.endDateTime}
                          style={{
                            borderColor: color,
                            color: color,
                            backgroundColor: "#fafafa"
                          }}
                        >
                          {event.title}
                        </Frame>
                      )
                    })}

                    {candidatesOfWeek[i].map(event => {
                      return (
                        <Frame
                          key={event.id}
                          className={"event candidate"}
                          date={date}
                          start={event.startDateTime}
                          end={event.endDateTime}
                          style={{
                            borderColor: "white",
                            color: "white",
                            backgroundColor: "#CE3B27"
                          }}
                        >
                          {event.startDateTime.toLocaleString(
                            DateTime.TIME_24_SIMPLE
                          )}
                        </Frame>
                      )
                    })}

                    {_.times(23, i2 => (
                      <div
                        className="horizontal-line"
                        style={{ top: (i2 + 1) * this.constructor.hourHeight }}
                        key={`line:${i2}`}
                      />
                    ))}
                  </Clickable>
                </Grid.Column>
              )
            })}
          </Grid.Row>
        </Grid>

        <Button
          circular
          color="facebook"
          icon="paper plane"
          className="send-button"
          size="huge"
          onClick={() => {
            this.setState({ sendModal: true })
          }}
        />
        {/**
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
            const overlap = !!_.find(this.props.events,
              e => e.start.isBefore(endAt) && startAt.isSameOrBefore(moment(e.end)) && !e.isAllDay(startAt)
            )
            const active = !!_.find(this.state.candidates,(e)=>e.start.isSame(startAt))

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
          <List items={ _.map(this.state.candidates, (event,i) => {
            return(
              `${event.start.format("MM/DD HH:mm")} - ${moment(event.start).add(1,'hour').format("HH:mm")}`
            )
          })}/>
          </div>
        </Modal>
 */}
      </div>
    )
  }

  Frame({ date, start, end, className, style, children }) {
    const startPos = Math.max(start.diff(date, "minutes").minutes, 0)
    const endPos = Math.min(end.diff(date, "minutes").minutes, 24 * 60)
    return (
      <div
        className={className}
        style={_.defaults(style, {
          top: startPos * (this.constructor.hourHeight / 60) + 1,
          height: (endPos - startPos) * (this.constructor.hourHeight / 60) - 1
        })}
      >
        {children}
      </div>
    )
  }
}
