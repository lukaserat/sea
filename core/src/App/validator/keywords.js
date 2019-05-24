import _ from 'lodash'
import statuses from 'http-status'

export default {
  ['validStatusCode']: {
    errors: true,
    compile: () => (statusCode) => {
      const code = statuses[statusCode]
      return ! _.isEmpty(code)
    }
  }
}
