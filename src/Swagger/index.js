import _ from 'lodash'
import fs from 'fs-extra'
import SwaggerUiDist from 'swagger-ui-dist'

import Validator from '../Validator'
import { logger } from '../utils'
import { addAppKeywords, addAppSchemas } from './validator'
import apiDefinition from './definition'
import template from './template'

class Swagger {
  /**
   * @this {SSC_Swagger.Swag}
   * @param {SSC_Swagger.Definition} definition
   */
  constructor(definition = {}) {
    this.definition = definition
    this.validator = new Validator({ throwException: true })
    this.validator.app = this

    // add app-specific schemas
    addAppSchemas(this)

    // add useful keywords
    addAppKeywords(this)

    this.logger = logger

    this.validator.validate('Swagger', this.definition)

    /** @type {SSC_Swagger.Server[]} */
    this._servers = Array()

    /** @type {SSC_Swagger.Tag[]} */
    this._tags = Array()

    /** @type {SSC_Swagger.Path[]} */
    this._paths = []

    /** @type {SSC_Swagger.Model[]} */
    this._models = []
  }

  get swaggerJSON() {
    const { version, title, description } = this.definition;
    const swagger = apiDefinition({
      title,
      description,
      version,
      servers: this.servers,
      tags: this.tags,
      paths: this.paths,
      modelSchemas: this.models,
    });

    return swagger;
  }

  get servers() {
    if (_.isEmpty(this._servers)) {
      return [ { url: `${this.definition.baseUrl}/` } ]
    }
    return this._servers
  }

  get tags() {
    return this._tags
  }

  get models() {
    return _.reduce(this._models, (j, v) => {
      j[v.name] = _.merge({
        type: 'object',
      }, _.omit(v, 'name', 'errorMessage'))
      return j
    }, {})
  }

  get paths() {
    return _.reduce(this._paths, (j, v) => {
      const x = _.merge(_.omit(v, ['path', 'method', 'responses', 'uniqueness']), {
        responses: this.constructRequestResponses(v.responses),
      })


      const p = this.constructRequestPath(v.path)

      if (v.parameters) {
        x.parameters = v.parameters
      }
      if (v.requestBody) {
        x.requestBody = this.constructRequestBody(v.requestBody)
      }

      j[p] = _.merge(j[p] || {}, {
        [v.method]: x
      })

      return j
    }, {})
  }

  get explorerUri() {
    const { baseUrl, explorerPath } = this.definition;
    return `${baseUrl}${explorerPath}/swagger.json`;
  }

  get publicDir() {
    return this.definition.publicDir;
  }

  /**
   * Updating the models by validating items and getting all unique items
   * based on $id
   *
   * @param {SSC_Swagger.Model[]} items
   */
  set models(items = []) {
    let x = items
    if (!Array.isArray(items)) {
      x = [items]
    }

    _.map(x, modelDef => {
      const { name, overwrite = false } = modelDef
      const indexAt = _.findIndex(this._models, { name })
      if (indexAt > 0) {
        if (!overwrite) {
          throw new Error(`Model ${name} already exists.
            Use overwrite if you intentionally do it.`)
        }
      }

      this.validator.validate('Model', modelDef)
      this.logger.info(`Adding Model ${name}`)
      if (overwrite && indexAt > 0) {
        this.logger.info(`Overwriting model ${name} which at index ${indexAt}`)
        this._models.splice(indexAt, 1, modelDef)
      } else {
        this._models.push(modelDef)
      }
    })
  }

  /**
   * @param {SSC_Swagger.Tag[]} items
   */
  set tags(items) {
    let x = items
    if (!Array.isArray(items)) {
      x = [items]
    }

    const iteratee = (item) => {
      this.validator.validate('Tag', item)
      if (_.findIndex(this._tags, item) === -1) {
        this._tags.push(item)
      }
    }
    _.map(x, iteratee)
  }

  /**
   * @param {SSC_Swagger.Server[]} items
   */
  set servers(items) {
    let x = items
    if (!Array.isArray(items)) {
      x = [items]
    }

    const iteratee = (item) => {
      this.validator.validate('Server', item)
      if (_.findIndex(this._servers, item) === -1) {
        this._servers.push(item)
      }
    }
    _.map(x, iteratee)
  }

  /**
   * @param {SSC_Swagger.Path[]} items
   */
  set paths(items) {
    let x = items
    if (!Array.isArray(items)) {
      x = [items]
    }

    /** @param {SSC_Swagger.Path} item */
    const iteratee = (item) => {
      // prepare the item
      const i = _.merge(item, {
        method: (item.method || '').toLowerCase(),
        uniqueness: 'xxx'
      })

      this.validator.validate('Path', i)
      this._paths.push(i)
    }
    _.map(x, iteratee)
  }

  constructRequestPath(path = '') {
    const regex = /(:([^\W]+))/gm;
    const subst = '{$2}';

    // The substituted value will be contained in the result variable
    return path.replace(regex, subst)
  }

  /**
   *
   * @param {SSC_Swagger.RequestResponse[]} responses
   */
  constructRequestResponses(responses) {
    return _.reduce(responses, (j, x) => {
      j[x.statusCode] = _.merge(_.omit(x, ['statusCode', 'modelName']), {
        content: {
          'application/json': {
            schema: {
              $ref: `#/components/schemas/${x.modelName}`
            }
          }
        }
      })
      return j
    }, {})
  }

  /**
   *
   * @param {SSC_Swagger.RequestBody} requestBody
   */
  constructRequestBody(requestBody) {
    return _.merge(_.omit(requestBody, ['modelName']), {
      content: {
        'application/json': {
          schema: {
            $ref: `#/components/schemas/${requestBody.modelName}`
          }
        }
      }
    })
  }

  deployPublicAssets() {
    const { publicDir } = this;
    fs.ensureDirSync(publicDir)
    fs.emptyDirSync(publicDir)

    fs.copySync(`${SwaggerUiDist.absolutePath()}/`, publicDir)

    const url = this.explorerUri;
    fs.outputFile(`${publicDir}/index.html`, template({ url }))

    return true
  }

  /**
   * Express/Connect middleware for handling swagger ui explorer
   * @param {import('../../swagger').Request} req
   * @param {import('../../swagger').Response} res
   * @param {Function} next
   */
  middleware(req, res, next) {
    const { explorerPath } = this.definition;
    if (req.path.indexOf(explorerPath) === 0) {
      if (req.path === explorerPath) {
        return res.sendFile(`${this.publicDir}/index.html`);
      }
      if (req.path === `${explorerPath}/swagger.json`) {
        return res.json(this.swaggerJSON);
      }
      return res.sendFile(`${this.publicDir}${req.path}`);
    }
    return next();
  }
}

Swagger.prototype._responses = {}

export default Swagger