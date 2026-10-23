export default (o, c) => {
  const proto = c.prototype
  proto.isWeekend = function () {
    const day = this.day()
    return day === 0 || day === 6
  }
}
