import _ from "lodash";
import React, { ReactNode, SyntheticEvent } from "react";
import moment from "moment-timezone";
import BigCalendar from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
//import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button, Icon, Grid, Segment } from "semantic-ui-react";
import BigCalendarToolbar from "./BigCalendar/Toolbar.js";
import TimeGrid from "./BigCalendar/TimeGrid.js";
import "./calendar.scss";

export default class CalendarComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Google CalendarのデータをBigCalendarにマッピング
  events() {
    return _.flatten(
      _.values(this.props.events).map(e =>
        e.items
          .filter(
            i =>
              ["confirmed"].indexOf(i.status) >= 0 &&
              !_.find(
                i.attendees,
                a => a.self && a.responseStatus == "declined"
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
    );
  }

  eventsOfDay(date) {
    const startAt = moment(date).startOf("day");
    const endAt = moment(startAt).endOf("day");
    return this.events().filter(
      e => e.start.isSameOrBefore(endAt) && startAt.isSameOrBefore(e.end)
    );
  }

  eventIndent(events) {
    var processedEvents = [];
    return events
      .filter(e => !e.isAllDay)
      .sort((a, b) => {
        var result = a.start.diff(b.start);
        return result === 0 ? a.id.localeCompare(b.id) : result;
      })
      .map(e => {
        var level = 0;
        var overlay = _.findLast(
          processedEvents,
          pe =>
            e.start.isSameOrBefore(pe[1].end) &&
            pe[1].start.isSameOrBefore(e.end)
        );
        if (overlay) {
          level = overlay[0] + 1;
        }

        processedEvents.push([level, e]);
        return [level, e];
      });
  }

  componentDidMount() {}

  // https://css-tricks.com/snippets/javascript/lighten-darken-color/
  lightenDarkenColor(color, amt) {
    var usePound = false;

    if (color[0] == "#") {
      color = color.slice(1);
      usePound = true;
    }

    var num = parseInt(color, 16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00ff) + amt;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000ff) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  }

  render() {
    const startAt = moment().startOf("day");
    var eventsOfWeek = _.times(7, i =>
      this.eventIndent(this.eventsOfDay(moment(startAt).add(i, "day")))
    );

    return (
      <Grid columns="equal" className="calendar">
        <Grid.Row>
          <Grid.Column>
            {_.times(22, i => (
              <div
                className="time-label"
                style={{ top: (i + 1) * 64 - 8 }}
                key={`time-label:${i}`}
              >
                {i + 1}:00
              </div>
            ))}
          </Grid.Column>
          {_.times(7, i => {
            const date = moment(startAt).add(i, "days");
            return (
              <Grid.Column
                className="day"
                key={`calendar:${i}`}
                onClick={e => {
                  console.log(i, e.offsetX, e.offsetY, e.target);
                  e.preventDefault();
                }}
              >
                <div className="vertical-line" />
                {eventsOfWeek[i].map(event => {
                  const startPos = Math.max(
                    event[1].start.diff(date) / (60 * 1000),
                    0
                  );
                  const endPos = Math.min(
                    event[1].end.diff(date) / (60 * 1000),
                    24 * 60
                  );

                  return event[1].isAllDay ? (
                    undefined
                  ) : (
                    <div
                      key={event[1].id}
                      className={`event level-${event[0] + 1}`}
                      style={{
                        backgroundColor: this.lightenDarkenColor(
                          event[1].backgroundColor,
                          -30
                        ),
                        color: "white",
                        top: startPos * (64 / 60),
                        height: (endPos - startPos) * (64 / 60)
                      }}
                    >
                      {event[1].title}
                    </div>
                  );
                })}
                {_.times(23, i2 => (
                  <div
                    className="horizontal-line"
                    style={{ top: (i2 + 1) * 64 }}
                    key={`line:${i2}`}
                  />
                ))}
              </Grid.Column>
            );
          })}
        </Grid.Row>
      </Grid>
    );
  }
}
