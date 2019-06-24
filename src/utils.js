import _ from 'lodash'
import { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import mapSeries from 'async/mapSeries'

/* istanbul ignore next */
export function runInSeries(items, cb) {
  return mapSeries(items, cb || _.noop)
}

/**
 * Load a module path dynamically
 * @param {string} modulePath module file path
 * @param {bool} mustThrow if true, will throw an exception
 */
export function loadModule(modulePath = '', mustThrow = false) {
  try {
    return require(modulePath).default
  } catch (error) {
    if (mustThrow) {
      throw error
    }
  }

  return {}
}

export function base64encode(data) {
  const a = new Buffer(data)
  return a.toString('base64')
}

export function base64decode(base64String) {
  const a = new Buffer(base64String, 'base64')
  return a.toString('ascii')
}

export function runThrough(subject, iteratee) {
  if (Array.isArray(subject)) {
    _.forEach(subject, iteratee);
  }
  if (_.isPlainObject(subject)) {
    _.forIn(subject, iteratee);
  }
}

export function t(body = '') {
  return _.template(body, { interpolate: /{{([\s\S]+?)}}/g })
}

export function createSingleton(namespace, api) {
  // create a referrence
  const KEY = Symbol.for(namespace);

  // check availability in global scope
  const globalSymbols = Object.getOwnPropertySymbols(global);
  const exists = (globalSymbols.indexOf(KEY) > -1);

  if (!exists) {
    global[KEY] = api;
  }

  // wrapper
  const wrapper = {};
  Object.defineProperty(wrapper, 'instance', {
    get() {
      return global[KEY]
    }
  });
  // freeze
  Object.freeze(wrapper);

  return wrapper.instance;
}


export const logger = (() => {
  const { combine, timestamp, prettyPrint, simple, splat, colorize, printf, json } = format

  const handleError = format(info => {
    if (info.message instanceof Error) {
      info.message = Object.assign({
        message: info.message.message,
        stack: info.message.stack
      }, info.message)
    }
    if (info instanceof Error) {
      return Object.assign({
        message: info.message,
        stack: info.stack
      }, info)
    }
    return info
  })

  const customFormat = (info) => {
    const { message, timestamp, level } = info
    const others = _.omit(info, 'message,timestamp,level'.split(','))
    return `${timestamp} ${level}: ${message} ${!_.isEmpty(others) ? JSON.stringify(others) : ''}`
  }

  const formatFn = ({ isJSON, isColorize }) => {
    let args = [handleError(), timestamp(), simple(), splat(), prettyPrint(), printf(customFormat)]
    if (isJSON) args = [json()].concat(args)
    if (isColorize) args = [colorize()].concat(args)

    return combine(...args)
  }

  const options = {
    level: 'debug',
    format: formatFn({ isJSON: true }),
    transports: [
      new DailyRotateFile({
        filename: 'logs/app-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d'
      })
    ]
  }
  const logger = createLogger(options)
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({ format: formatFn({ isColorize: true }) }));
  }
  return logger
})()