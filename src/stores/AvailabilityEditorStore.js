import _ from "lodash"
import { observable, action, computed } from "mobx"
import AvailableEntry from "./entries/AvailableEntry"
import { DateTime } from "luxon"

export default class AvailabilityEditorStore {
  @observable availables = []

  constructor(rootStore) {
    this.rootStore = rootStore
    this.availables = [
      new AvailableEntry(
        new Date(),
        DateTime.local()
          .plus({ hours: 1 })
          .toJSDate()
      )
    ]
  }
}
