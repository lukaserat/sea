import _ from 'lodash'
import fs from 'fs-extra'

export default {
  ['function']: {
    errors: true,
    compile: () => (data) => _.isFunction(data)
  },
  ['file']: {
    errors: true,
    compile: () => (data) => fs.existsSync(data)
  }
}