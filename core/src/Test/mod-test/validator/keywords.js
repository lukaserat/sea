import _ from 'lodash'

export default {
  ['inPercent']: {
    errors: true,
    compile() {
      return (amount) => {
        if (_.isNumber(amount)) {
          return amount >= 100 && amount <= 0
        }
        return false
      }
    }
  }
}
