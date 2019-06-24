import _ from 'lodash'
import path from 'path'
import fs from 'fs-extra'

import Validator from '../Validator'
import Swagger from '../Swagger'
import { addAppKeywords, addAppSchemas } from './validator'
import server from './express'
import { loadModule, createSingleton, runThrough, logger } from '../utils'


export const STATE_SHUTTING_DOWN = 'SHUTTING DOWN'

export const STATE_STALE = 'STALE'

export const STATE_BOOTING = 'BOOTING'

export const STATE_RUNNING = 'RUNNING'

class App {
  /**
   * @param {SSC_APP.Definition} definition
   */
  constructor(definition = {}) {
    this.definition = _.merge({ hooks: {} }, definition)
    this.validator = new Validator({ throwException: true })
    this.validator.app = this
    this.app = null
    this.swagger = null
    this.logger = logger
    this.logger.debug('Initializing the instance.')

    this._state = STATE_STALE
    this._routes = []

    this.beforeBoot()
    this.boot()

    // safe quit
    process.on('SIGINT', this.shutdown.bind(this))
    process.on('SIGTERM', this.shutdown.bind(this))
  }

  /**
   * Configure and start express server
   */
  _expressRunServer() {
    if (this.withExpress) {
      this.app = server(this)
    }
  }

  /**
   * @throws {SSC_Validator.ValidatorException}
   */
  _validateAppDefinition() {
    this.logger.debug('Validating instance\'s definition', this.definition)
    const x = this.validator.validate('App', this.definition)
    this.logger.debug(`Validating instance\'s definition: ${x ? 'passed' : 'failed'}`)
  }

  /**
   * @throws {SSC_Validator.ValidatorException}
   */
  _prepareDefinition() {
    // prepare swagger instance
    if (this.withExpress) {

      this.logger.debug('Preparing instance routes..')
      // prepare routes
      this._prepareRotues()

      // prepare swagger information
      this.logger.debug('Preparing instance swagger..')
      this._prepareSwagger()
    }
  }

  /**
   * @throws {SSC_Validator.ValidatorException}
   */
  _prepareSwagger() {
    const { appDir, products, swagger, express: { host, port } } = this.definition

    // ensure swagger asset folder
    const swaggerDir = path.join(this.publicDir, 'docs')
    fs.ensureDirSync(swaggerDir)

    // swagger definition
    const swaggerDef = _.merge({
      explorerPath: '/swagger-ui',
      publicDir: swaggerDir,
      baseUrl: `http://${host}:${port}`,
    }, swagger)
    this.logger.debug('Setting up swagger', swaggerDef)
    this.swagger = new Swagger(swaggerDef)

    const corePath = path.join(__dirname, 'swagger')
    const appPath = path.join(appDir, 'swagger')

    this.logger.info('Deploying/Updating swagger public assets.')
    this.swagger.deployPublicAssets()

    const iteratee = (value, key) => {
      this.swagger[key] = value
    }

    // core level
    this.logger.info('Core level swagger -->.')
    let def = loadModule(corePath, true)
    runThrough(def, iteratee)

    // read application level swagger
    if (!this.skipApp) {
      this.logger.info('App level swagger -->.')
      def = loadModule(appPath, true)
      runThrough(def, iteratee)

      // read product level swagger
      this.logger.info('Product level swagger -->.')
      runThrough(products, product => {
        this.logger.debug(`${product} swagger`)
        def = loadModule(path.join(appDir, 'products', product, 'swagger'), true)
        runThrough(def, iteratee)
      })
    }

    // paths
    this.swagger.paths = this._routes.map(x => {
      const y = _.pick(x, ['path', 'method', 'summary', 'responses'])
      if (x.requestBody) {
        y.requestBody = x.requestBody
      }
      if (x.parameters) {
        y.parameters = x.parameters
      }
      if (!_.isEmpty(x.tags)) {
        y.tags = x.tags
      }
      return y
    })

    // swagger schema
    this.logger.debug('Final swagger schema', { schema: this.swaggerSchema })
    this.validator.addSwaggerSchema(this.swaggerSchema)
  }

  /**
   * @throws {SSC_Validator.ValidatorException}
   */
  _prepareRotues() {
    const { appDir, products } = this.definition

    // read core level routes
    this.logger.debug('Core level routes -->')
    this.routes = loadModule(path.join(__dirname, 'routes'), true)

    // read application level routes
    if (!this.skipApp) {
      this.logger.debug('App level routes -->')
      this.routes = loadModule(path.join(appDir, 'routes'), true)

      // read product level routes
      this.logger.debug('Product level routes -->')
      runThrough(products, product => {
        this.logger.debug(`${product} routes`)
        this.routes = _.map(loadModule(path.join(appDir, 'products', product, 'routes'), true), x => {
          return _.merge(x, {
            originalPath: x.path,
            path: `/${product}${x.path}`
          })
        })
      })
    }
  }

  /**
   * Updating the routes by validating items and getting all unique items
   * based on path and method
   *
   * @param {SSC_APP.RouteConfig[]} items
   */
  set routes(items = []) {
    if (!Array.isArray(items)) {
      throw Error('Expecting array of RouteConfig.')
    }

    _.map(items, x => {
      const routeConfig = Object.assign({}, x)
      const { method, path, overwrite } = routeConfig
      const indexAt = _.findIndex(this._routes, { method, path })
      if (indexAt >= 0) {
        if (!overwrite) {
          throw new Error(`Route ${method} ${path} already exists.
            Use overwrite if you intentionally do it.`)
        }
      }

      this.logger.info(`Route ${method} ${path}`)
      this.validator.validate('Route', routeConfig)

      const { prefix, originalPath } = routeConfig
      let _path = path
      if (prefix) {
        if (_.isFunction(prefix)) {
          _path = prefix.call(this, [routeConfig])
          if (!_.isString(_path)) {
            throw new Error('Expecting a string for route path.')
          }
        } else {
          _path = `${prefix}${originalPath}`
        }
      }
      routeConfig.path = _path

      if (overwrite && indexAt >= 0) {
        this.logger.info(`Overwriting route ${method} ${path} which at index ${indexAt}`)
        this._routes.splice(indexAt, 1, routeConfig)
      } else {
        this._routes.push(routeConfig)
      }
    })
  }

  get baseUrl() {
    const { express: { port, host } } = this.definition
    return `http://${host}:${port}/`
  }

  get routes() {
    return this._routes
  }

  get skipApp() {
    const { appDir } = this.definition
    return path.join(appDir) === path.join(__dirname)
  }

  get swaggerSchema() {
    return {
      components: {
        schemas: _.reduce(this.swagger._models, (j, x) => {
          j[x.name] = _.merge({
            type: 'object',
          }, _.omit(x, ['name']))
          return j
        }, {})
      }
    }
  }

  get withExpress() {
    return !_.isEmpty(this.definition.express)
  }

  get publicDir() {
    const publicDir = path.join(this.definition.appDir, 'public')
    fs.ensureDirSync(publicDir)
    return publicDir
  }

  /**
   * Use initializing singeleton of the App
   * @param {SSC_APP.Definition} definition
   * @returns {SSC_APP.App}
   */
  static initialize(definition) {
    return createSingleton('App', definition && new App(definition))
  }

  static get logger() {
    return App.initialize().logger
  }

  /**
   * Prepare configurations, validator and swagger before
   * booting the app
   */
  beforeBoot() {
    this._state = STATE_BOOTING

    this.logger.debug('Core level schemas and custom key words -->')
    // add app-specific schemas
    addAppSchemas(this)

    // add useful keywords
    addAppKeywords(this)

    // validate if app definition is valid
    this._validateAppDefinition()

    this._prepareDefinition()

    return this
  }

  /**
   * Boot the app
   */
  boot() {
    // run app beforeBoot hook
    const { onBoot = _.noop, onBeforeBoot = _.noop } = this.definition.hooks

    // run app beforeBoot hook
    onBeforeBoot.call(this)

    if (this.withExpress) {
      // prepare express
      this._expressRunServer()
    }

    onBoot.call(this)

    this._state = STATE_RUNNING

    return this
  }

  /**
   * Validate a model's data using its schema
   * @param {string} modelName
   * @param {object} data
   * @returns {bool|SSC_Validator.ValidatorException}
   */
  validateModel(modelName, data) {
    return this.validator.validateModel(`#/components/schemas/${modelName}`, data)
  }

  /** @this {SSC_APP.App} */
  shutdown() {
    if (this._state !== STATE_SHUTTING_DOWN) {
      this.logger.info('Shutting down...')
      try {
        this._state = STATE_SHUTTING_DOWN
        this.app.server.close()
      } catch (error) {
        console.dir(error.message)
      }
      // call hook for shutdown
      const { onClose = _.noop } = this.definition.hooks
      onClose.call(this)
    }
  }
}

export default App;
