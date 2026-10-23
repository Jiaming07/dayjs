import MockDate from 'mockdate'
import moment from 'moment'
import dayjs from '../../src'
import isWeekend from '../../src/plugin/isWeekend'

dayjs.extend(isWeekend)

beforeEach(() => {
  MockDate.set(new Date())
})

afterEach(() => {
  MockDate.reset()
})

it('is weekend on Saturday and Sunday', () => {
  expect(dayjs('2023-01-07').isWeekend()).toBe(true) // Saturday
  expect(dayjs('2023-01-08').isWeekend()).toBe(true) // Sunday
})

it('is not weekend on weekdays', () => {
  expect(dayjs('2023-01-02').isWeekend()).toBe(false) // Monday
  expect(dayjs('2023-01-03').isWeekend()).toBe(false) // Tuesday
  expect(dayjs('2023-01-04').isWeekend()).toBe(false) // Wednesday
  expect(dayjs('2023-01-05').isWeekend()).toBe(false) // Thursday
  expect(dayjs('2023-01-06').isWeekend()).toBe(false) // Friday
})

it('matches moment day() across a full week', () => {
  for (let i = 0; i < 7; i += 1) {
    const d = dayjs('2023-01-01').add(i, 'day')
    const m = moment('2023-01-01').add(i, 'day')
    const expected = m.day() === 0 || m.day() === 6
    expect(d.isWeekend()).toBe(expected)
  }
})

it('works with time and does not depend on now', () => {
  expect(dayjs('2023-01-07T23:59:59').isWeekend()).toBe(true)
  expect(dayjs('2023-01-09T00:00:00').isWeekend()).toBe(false)
})
