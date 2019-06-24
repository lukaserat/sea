import _ from 'lodash'
import statuses from 'http-status'

export default {
  need200: {
    errors: true,
    compile: () => (data) => {
      if (Array.isArray(data)) {
        if (_.findIndex(data, { statusCode: statuses.OK }) >= 0) {
          return true
        }
      }
      return false
    }
  },
  validModel: {
    errors: true,
    compile() {
      return (modelName) => {
        /** @type {SSC_Swagger.Swagger} */
        const app = this.app
        return _.findIndex(app._models, { name: modelName }) !== -1
      }
    }
  },
  uniquePath: {
    errors: 'full',
    compile() {
      return function(value, path, data) {
        /** @type {SSC_Swagger.Swagger} */
        const app = this.app

        const uniq = {
          path: data.path,
          method: (data.method || '').toLowerCase(),
        }
        return _.findIndex(app._paths, uniq) < 0
      }
    }
  }
}
