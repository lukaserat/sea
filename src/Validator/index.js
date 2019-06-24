import Ajv from 'ajv'
import ajvErrors from 'ajv-errors'
import { merge, pick } from 'lodash'

import ValidationException from './ValidationException'
import { addKeywords, addSchema } from './utils'
import keywords from './keywords'
import schemas from './schemas'


class Validator extends Ajv {
  constructor(options = {}) {
    super(merge({}, options, {
      allErrors: true,
      removeAdditional: true,
      jsonPointers: true,
      coerceTypes: true
    }))

    ajvErrors(this)

    this.options = pick(options, ['throwException'])
    this.app = null

    // additional keywords
    addKeywords(this, keywords)

    // additional schemas
    addSchema(this, schemas)
  }

  addSchema(schema, name) {
    return super.addSchema(merge(schema, {
      $id: schema.$id || name
    }), name)
  }

  /**
   * Add Swagger Schema to validation cache
   * @param {Object} schema
   */
  addSwaggerSchema(schema) {
    this.removeSchema('swagger')
    this.addSchema(schema, 'swagger')

    return this
  }

  /**
   * Validate data against the swagger model
   * @param {string} modelPath
   * @param {Object} data
   */
  validateModel(modelPath, data) {
    const v = this.getSchema(`swagger${modelPath}`)
    const r = v(data)

    if (r === false && this.options.throwException) {
      throw new ValidationException(this.errorsText(v.errors), v.errors)
    }

    return r
  }

  validate(...args) {
    const r = super.validate(...args)

    if (r === false && this.options.throwException) {
      throw new ValidationException(this.errorsText(), this.errors)
    }

    return r
  }
}

export default Validator;