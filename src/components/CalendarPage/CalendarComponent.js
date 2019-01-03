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
import AvailableEntry from "../../stores/entries/AvailableEntry"
import _ from "lodash"

export default class CalendarComponent extends React.Component {
  static propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    events: PropTypes.arrayOf(PropTypes.instanceOf(EventEntry)).isRequired,
    availables: PropTypes.arrayOf(PropTypes.instanceOf(AvailableEntry))
      .isRequired
  }

  state = {
    timeSelector: false
  }

  static hourHeight = 64

  constructor(props) {
    super(props)
    this.date = DateTime.fromJSDate(this.props.date)
    console.log(props)
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
    if (_.find(this.state.availables, e => e.startDateTime.equals(time))) {
      let availables = _.filter(
        this.state.availables,
        e => !e.start.isSame(time)
      )
    } else {
      let availables = _.concat(this.state.availables, {
        start: time,
        end: moment(time).add(1, "hour")
      })
    }
    this.setState({ availables })
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

    const availablesOfWeek = _.times(7, i => {
      const date = startAt.plus({ days: i })
      return this.eventsOfDay(this.props.availables, date)
    })

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
                        //availables: _.concat(this.state.availables, {start: start, end:moment(start).add(1, "hour")})
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

                    {availablesOfWeek[i].map(event => {
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
          open={!!this.state.sendModal}
          onClose={() => {this.setState({sendModal: false})}}
          closeIcon={true}
        >
          <Modal.Header>Send availables</Modal.Header>
          <div className="time-select-wrap">
          <List items={ _.map(this.state.availables, (event,i) => {
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
