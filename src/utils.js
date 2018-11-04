import _ from "lodash"

// 1日単位でstartAtからendAtまで列挙してfuncを読み出す
export function enumMomentDays(startAt, endAt, func) {
  var date = moment(startAt).startOf("day");
  while(date.isSameOrBefore(endAt)) {
    if(func(date) === false) break;
    date.add(1, "day");
  }
}

// 日付が被っているか判定
export function isOverrappedMoment(beginA, endA, beginB, endB) {
  return beginA.isSameOrBefore(endB) && beginB.isSameOrBefore(endA)
}

// Redering on Server side or Client side
export function isRenderingOn(side) {
  const current = (typeof window !== 'undefined' && window.document) ? 'client' : 'server'
  if(side === undefined) {
    return current
  }
  else {
    return _.lowerCase(side) === current
  }
}

