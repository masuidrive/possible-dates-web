import _ from "lodash"
import React, { ReactNode, SyntheticEvent } from "react"

export default class Clickable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.ref = React.createRef()
  }

  handleClick(ev) {
    console.log(ev)
    if (this.props.onClick) {
      ev.preventDefault()
      const rect = this.ref.current.getBoundingClientRect()
      ev.x = ev.nativeEvent.pageX - rect.left - window.pageXOffset
      ev.y = ev.nativeEvent.pageY - rect.top - window.pageYOffset
      this.props.onClick.call(undefined, ev)
    }
  }

  render() {
    //    return <div>{this.props.children}</div>
    return (
      <div
        style={_.merge({ width: "100%", height: "100%" }, this.props.style)}
        className={this.props.className}
        ref={this.ref}
        onClick={ev => this.handleClick(ev)}
      >
        {this.props.children}
      </div>
    )
  }
}
