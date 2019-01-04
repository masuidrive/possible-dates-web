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
import stores from "../../stores"
import isOverlapped from "../../lib/isOverlapped"
import { DateTime } from "luxon"
import AvailableEntry from "../../stores/entries/AvailableEntry"
import _ from "lodash"
import stores from "../../stores"
import { observer, inject } from "mobx-react"
import { DateTime } from "luxon"

@inject("calendarStore")
@inject("availabilityEditorStore")
@observer
export default class SelectTimeComponent extends React.Component {
  render() {
    return (
      <Modal
        size="mini"
        open={!!this.state.timeSelector}
        onClose={() => this.closeTimeSelector()}
        closeIcon={true}
      >
        <Modal.Header>
          Select time at {moment(this.state.timeSelector).format("MM/DD")}
        </Modal.Header>
        <div className="time-select-wrap">
          {_.times(6, i => {
            const startAt = moment(this.state.timeSelector).add(
              (i - 2) * 15,
              "minutes"
            )
            const endAt = moment(startAt).add(1, "hour")
            const overlap = !!_.find(
              this.props.events,
              e =>
                e.start.isBefore(endAt) &&
                startAt.isSameOrBefore(moment(e.end)) &&
                !e.isAllDay(startAt)
            )
            const active = !!_.find(this.state.availables, e =>
              e.start.isSame(startAt)
            )

            return (
              <div
                key={`time:${i}`}
                className={startAt.minutes() == 0 && i > 0 ? "divider" : ""}
              >
                <Button
                  className="time-select"
                  basic={overlap && !active}
                  primary={active}
                  onClick={() => this.toggleTime(startAt)}
                >
                  {startAt.format("HH:mm")}
                </Button>
              </div>
            )
          })}
        </div>
      </Modal>
    )
  }
}
