import _ from 'lodash'
import express from 'express'
import http from 'http'

import { runThrough } from '../../utils'
import * as constants from '../../Constants/api'
import { express as mapping } from './middleware.mapping'

// eslint-disable-next-line no-unused-vars
export const notFound = (req, res, next) => {
  res.status(constants.MESSAGE_NOT_FOUND_CODE).json({
    status: constants.MESSAGE_NOT_FOUND_CODE,
    message: constants.MESSAGE_NOT_FOUND,
  })
}

// eslint-disable-next-line no-unused-vars
export const generalError = (err, req, res, next) => {
  const logger = req.app.modInstance.logger
  const error = {
    status: err.status || constants.MESSAGE_SERVER_ERROR_CODE,
    message: err.message || constants.MESSAGE_SERVER_ERROR,
  }

  if (err.payload) {
    error.payload = err.payload
  }

  if (process.env.NODE_ENV !== 'test') {
    logger.error(err)
    logger.error(`Sending ${error.status} response:`, {
      path: req.path,
      body: req.body,
      params: req.params
    })
  }

  res.status(error.status).json(error)
}


/**
 * @param {string|express.RequestHandler|SSC_APP.Middleware} middleware
 */
function parseMiddleware(middleware) {
  let m = null
  if (_.isFunction(middleware)) {
    m = middleware
  } else if (_.isString(middleware)) {
    m = mapping[middleware].call()
  } else if (_.isPlainObject(middleware)) {
    const { name, params } = middleware
    m = mapping[name].call(this, params)
  }

  this.use(m)
}

function requestParamHandler(parameter) {
  const { required, name, schema } = parameter
  const sourceIn = parameter.in
  const mapping = {
    header: 'headers',
    query: 'query',
    path: 'params'
  }
  return (req, res, next) => {
    const modI = req.app.modInstance
    const value = req[mapping[sourceIn]][sourceIn === 'header' ? name.toLowerCase() : name]
    const data = { [`${name}`]: value }

    try {
      if (required) {
        modI.validator.validate({
          type: 'object',
          required: [name],
          properties: {
            [`${name}`]: schema
          }
        }, data)
      }

      if (!_.isEmpty(value)) {
        modI.validator.validate({
          type: 'object',
          properties: {
            [`${name}`]: schema
          }
        }, data)
      }
    } catch (error) {
      error.payload = req.params
      return next(error)
    }

    return next()
  }
}

function requestBodyHandler({ modelName, required }) {
  return (req, res, next) => {
    const modI = req.app.modInstance

    try {
      if (required) {
        modI.validator.validate({
          type: 'object',
          required: [modelName]
        }, { [`${modelName}`]: req.body })
      }

      if (!_.isEmpty(req.body)) {
        modI.validateModel(modelName, req.body)
      }
    } catch (error) {
      error.payload = req.body
      return next(error)
    }

    return next()
  }
}

/**
 * @param {SSC_APP.App} modInstance
 */
export default function server(modInstance) {
  const { middleware, port } = modInstance.definition.express
  const app = express()
  app.server = http.createServer(app)

  // expose modInstance to express app
  app.modInstance = modInstance

  // before middleware
  runThrough(middleware.before, parseMiddleware.bind(app))

  // swagger
  if (modInstance.withExpress) {
    app.use(modInstance.swagger.middleware.bind(modInstance.swagger))
  }

  // routes
  const router = express.Router()
  runThrough(modInstance.routes, ({
    method,
    path,
    middleware = [],
    handler,
    requestBody,
    parameters
  }) => {
    if (_.isPlainObject(requestBody)) {
      // implement validator
      middleware.push(requestBodyHandler(requestBody))
    }
    if (_.isArray(parameters)) {
      parameters.forEach((param) => middleware.push(requestParamHandler(param)))
    }
    router[method](
      path,
      ...middleware,
      handler
    )
  })
  app.use(router)


  // after middleware
  runThrough(middleware.after, parseMiddleware.bind(app))

  // not found
  app.use(notFound)

  // server error
  app.use(generalError)

  app.server.listen(port, () => {
    modInstance.logger.info(`Started on port ${app.server.address().port}`)
    modInstance.logger.info(`Swagger explorer @ ${modInstance.baseUrl}swagger-ui`)
  })

  return app
}