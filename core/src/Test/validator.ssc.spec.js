import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const { assert } = chai

import Validator from '../Validator'
import ValidationException from '../Validator/ValidationException'

describe('Validator', () => {
  it('Should be able to do basic validation', () => {
    const schema = {
      properties: {
        name: {
          type: 'string',
          minLength: 3,
          maxLength: 7
        },
        luckyNumber: {
          type: 'number'
        },
        age: {
          type: 'integer',
          minimum: 0,
          maximum: 100
        },
        isMarried: {
          type: 'boolean'
        },
        shouldBeNull: {
          type: 'null'
        }
      }
    }

    const data = {
      name: 'joseph',
      luckyNumber: 2,
      age: 100,
      isMarried: false,
      shouldBeNull: null
    };

    const v = new Validator();
    v.addSchema(schema, 'basic');

    assert.equal(v.validate('basic', data), true);


    assert.equal(v.validate('basic', {
      ...data,
      name: 2
    }), false);

    assert.equal(v.validate('basic', {
      ...data,
      luckyNumber: 'a',
    }), false);

    assert.equal(v.validate('basic', {
      ...data,
      age: 101,
    }), false);

    assert.equal(v.validate('basic', {
      ...data,
      isMarried: 'yes',
    }), false);

    assert.equal(v.validate('basic', {
      ...data,
      shouldBeNull: 1,
    }), false);
  })

  it('Should throw ValidationException for validating falsey input', () => {
    const schema = {
      properties: {
        id: {
          type: 'number'
        }
      }
    };
    const v = new Validator({ throwException: true })
    v.addSchema(schema, 'basic')

    assert.throws(() => v.validate('basic', { id: "xxx" }), ValidationException)
  })

  it('Should be able to evaluate $ref', () => {
    const swaggerSchema = {
      components: {
        schemas: {
          STPriceRequest: {
            type: 'object',
            required: [ 'profile' ],
            properties: {
              profile: { $ref: '#/components/schemas/STProfileData' }
            }
          },
          STProfileData: {
            type: 'object',
            description: 'One of the primary request objects. Needed to get price',
            errorMessage: {
              properties: {
                coverage: 'Should be equal to one of the allowed values. [SINGLE TRIP, ANNUAL MULTITRIP]'
              }
            },
            required: ['coverage', 'numberOfAdults', 'numberOfChildren'],
            properties: {
              coverage: {
                description: 'Channel',
                example: 'Partner',
                type: 'string',
                'enum': [
                  'SINGLE TRIP',
                  'ANNUAL MULTITRIP'
                ]
              },
              numberOfAdults: {
                description: 'Number of Adults',
                type: 'number',
                minimum: 1,
                maximum: 15,
                'default': 0
              },
              numberOfChildren: {
                description: 'Number of Children',
                type: 'number',
                minimum: 0,
                maximum: 15,
                'default': 0
              }
            }
          },
        }
      }
    }

    const v = new Validator({ throwException: true })
    let profile = null
    v.addSwaggerSchema(swaggerSchema)

    // passing empty input
    assert.throws(() => v.validateModel('#/components/schemas/STPriceRequest', {}), ValidationException)
    // passing empty required field profile
    assert.throws(() => v.validateModel('#/components/schemas/STPriceRequest', { profile }), ValidationException)
    // passing profile with nulled value properties
    profile = { coverage: null, numberOfAdults: null, numberOfChildren: null }
    assert.throws(() => v.validateModel('#/components/schemas/STPriceRequest', { profile }), ValidationException)

    profile = { coverage: 'SINGLE TRIP', numberOfAdults: 2, numberOfChildren: 2 }
    assert.doesNotThrow(() => v.validateModel('#/components/schemas/STPriceRequest', { profile }), ValidationException)
  })

  it('Should be able to evaluate existing keywords', () => {
    const v = new Validator({ throwException: false })
    let errMessage = 'Should be a function'
    v.addSchema({
      errorMessage: {
        properties: {
          prop: errMessage
        }
      },
      properties: {
        prop: {
          function: true
        }
      }
    }, 'schemaWithFunction')
    v.validate('schemaWithFunction', { prop: null })
    assert.include(v.errorsText(), errMessage)

    errMessage = 'Should be an existing file path'
    v.addSchema({
      errorMessage: {
        properties: {
          prop: errMessage
        }
      },
      properties: {
        prop: {
          file: true
        }
      }
    }, 'schemaWithFilePath')
    v.validate('schemaWithFilePath', { prop: null })
    assert.include(v.errorsText(), errMessage)
  })
})