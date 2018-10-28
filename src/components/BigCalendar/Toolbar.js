import PropTypes from "prop-types";
import React from "react";
import { Button, Icon } from "semantic-ui-react";

export default class Toolbar extends React.Component {
  static propTypes = {
    view: PropTypes.string.isRequired,
    views: PropTypes.arrayOf(PropTypes.string).isRequired,
    label: PropTypes.node.isRequired,
    localizer: PropTypes.object,
    onNavigate: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired
  };

  render() {
    return (
      <div>
        <Button.Group size="mini" compact floated="left">
          <Button
            content="Day"
            onClick={() => this.props.onViewChange("day")}
            color={this.props.view === "day" ? "teal" : undefined}
          />
          <Button
            content="Week"
            onClick={() => this.props.onViewChange("week")}
            color={this.props.view === "week" ? "teal" : undefined}
          />
          <Button
            content="Month"
            onClick={() => this.props.onViewChange("month")}
            color={this.props.view === "month" ? "teal" : undefined}
          />
        </Button.Group>
        <Button.Group size="mini" compact floated="right">
          <Button icon>
            <Icon
              name="left chevron"
              onClick={() => this.props.onNavigate("PREV")}
            />
          </Button>
          <Button
            content="Today"
            onClick={() => this.props.onNavigate("TODAY")}
          />
          <Button icon>
            <Icon
              name="right chevron"
              onClick={() => this.props.onNavigate("NEXT")}
            />
          </Button>
        </Button.Group>
      </div>
    );
  }
}
