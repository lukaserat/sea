import _ from 'lodash'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'

export const express = {
  compression: (...args) => compression(...args),
  helmet: (...args) => helmet(...args),
  cors: (...args) => cors(...args),
  'bodyParser.json': (...args) => bodyParser.json(...args),
  'bodyParser.urlencoded': (opts) => bodyParser.urlencoded(opts || { extended: true }),
  log: (opts = {}) => morgan('combined', _.merge({ skip: (req, res) => res.statusCode < 400 }, opts)),
}