const utils = {

  // 1日単位でstartAtからendAtまで列挙してfuncを読み出す
  _enumMomentDays: function(startAt, endAt, func) {
    var date = moment(startAt).startOf("day");
    while(date.isSameOrBefore(endAt)) {
      if(func(date) === false) break;
      date.add(1, "day");
    }
  },

  // 日付が被っているか判定
  _isOverrappedMoment: function(beginA, endA, beginB, endB) {
    return beginA.isSameOrBefore(endB) && beginB.isSameOrBefore(endA)
  }
};

export default utils;

