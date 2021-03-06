
import {getCurrencyConfig} from '../lib/CurrencyConfig'
let allConfigs = []

expect.extend({
  toHaveSameLength (received: *, argument: *, location: *): * {
    const pass = Object.keys(getCurrencyConfig(received)).length === argument
    if (pass)
      return {
        message: () => (`expected ${received} not to be divisible by ${argument}`),
        pass: true
      }
    else
      return {
        message: () => (`expect all config to have the same amount of keys ${location.x} and ${location.y} ?`),
        pass: false
      }
  }
})

describe('Config', () => {
  test('it should be able to get config ', () => {
    allConfigs.forEach((currencyCode) => expect(getCurrencyConfig(currencyCode)).toBeDefined())
  })

  test('all supported configs should have same number of keys', () => {
    allConfigs.forEach((x) =>
      allConfigs.forEach(y =>
        Object.keys(getCurrencyConfig(x)).forEach(xKey =>
          Object.keys(getCurrencyConfig(y)).forEach(yKey => expect(getCurrencyConfig(x)[yKey]).not.toEqual(undefined, `Have you configured ${yKey} on currecy ${x}?`))
        )
      )
    )
  })

  test('all configs should have same number of keys', () => {
    allConfigs.forEach((x) => {
      allConfigs.forEach((y) => {
        expect(Object.keys(getCurrencyConfig(x)).length).toHaveSameLength(Object.keys(getCurrencyConfig(y)).length, {x, y})
      })
    })
  })
})
