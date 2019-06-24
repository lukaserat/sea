import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const { assert } = chai

import ValidationException from '../../Validator/ValidationException';
import Validator from '../../Validator'
import appSchemas from '../../App/validator/schemas'

const validator = new Validator({ throwException: true })
const schemaName = 'App'

describe('App Schema', () => {
  let definition = {
    name: 'sample',
    products: ['test'],
    appDir: __dirname,
    express: {
      middleware: { before: ['compression'], after: [] },
      host: '127.0.0.1',
      port: 3000
    }
  }

  before(() => {
    validator.addSchema(appSchemas.App, schemaName)
  })

  it('should not throw ValidationException for valid data.', () => {
    assert.doesNotThrow(() => validator.validate(schemaName, definition))

    // testing middleware samples
    assert.doesNotThrow(() => validator.validate(schemaName, {
      ...definition,
      express: {
        ...definition.express,
        middleware: {
          before: [
            'compression'
          ],
          after: ['log']
        }
      }
    }))
  })

  it('should throw ValidationException for invalid data.', () => {
    assert.throws(() => validator.validate(schemaName, {}), ValidationException)
    assert.throws(() => validator.validate(schemaName, { ...definition, name: '' }), ValidationException)
    assert.throws(() => validator.validate(schemaName, { ...definition, name: '12' }), ValidationException)
    assert.throws(() => validator.validate(schemaName, { ...definition, products: null }), ValidationException)
    assert.throws(() => validator.validate(schemaName, { ...definition, products: [] }), ValidationException)
    assert.throws(() => validator.validate(schemaName, { ...definition, appDir: '' }), ValidationException)
    assert.throws(() => validator.validate(schemaName, { ...definition, appDir: '/test' }), ValidationException)
    assert.throws(() => validator.validate(schemaName, { ...definition, express: {} }), ValidationException)
    assert.throws(() => validator.validate(schemaName, { ...definition, express: {
      ...definition.express,
      middleware: null
    } }), ValidationException)
    assert.throws(() => validator.validate(schemaName, { ...definition, express: {
      ...definition.express,
      middleware: [1]
    } }), ValidationException)
    assert.throws(() => validator.validate(schemaName, { ...definition, express: {
      ...definition.express,
      middleware: [{ x: 1 }]
    } }), ValidationException)
    assert.throws(() => validator.validate(schemaName, { ...definition, express: {
      ...definition.express,
      port: '1234123'
    } }), ValidationException)
    assert.throws(() => validator.validate(schemaName, { ...definition, express: {
      ...definition.express,
      host: 'abcdef'
    } }), ValidationException)
  })

})