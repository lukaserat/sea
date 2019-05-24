import _ from 'lodash'

import { runThrough } from '../utils'

/**
 * @param {SSC_APP.Validator} validator
 * @param {object} keywords
 */
export function addKeywords(validator, keywords = {}) {
  if (validator && _.isPlainObject(keywords) && !_.isEmpty(keywords)) {
    const iteratee = (value, keyword) => {
      validator.addKeyword(keyword, value)
    }

    // additional keywords - validation core level
    runThrough(keywords, iteratee)
  }
}

/**
 * @param {SSC_APP.Validator} validator
 * @param {object} schemas
 */
export function addSchema(validator, schemas = {}) {
  if (validator && _.isPlainObject(schemas) && !_.isEmpty(schemas)) {
    runThrough(schemas, (v, k) => validator.addSchema(v, k))
  }
}