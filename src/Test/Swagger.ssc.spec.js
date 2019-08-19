import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import fs from 'fs-extra'
import path from 'path'
import SwaggerParser from 'swagger-parser'

chai.use(chaiAsPromised)
const { assert } = chai

import Swagger from '../Swagger'
import SwaggerSchema from '../Swagger/validator/schemas/Swagger'
import ValidationException from '../Validator/ValidationException';

const publicDir = path.join(__dirname, 'test-public')

describe('Swagger', () => {
  before(() => {
    // create public folder first
    fs.ensureDirSync(publicDir)
  })

  after(() => {
    fs.removeSync(publicDir)
  })

  it.only('Should validate instance structure', async function test() {
    let definition = {
      explorerPath: '/swagger-ui',
      publicDir,
      baseUrl: 'http://127.0.0.1:8080'
    }
    assert.doesNotThrow(() => new Swagger(definition))
    assert.throws(() => new Swagger({}), ValidationException)

    try {
      new Swagger({ ...definition, explorerPath: '' })
    } catch (error) {
      assert.include(error.message, SwaggerSchema.errorMessage.properties.explorerPath)
    }

    try {
      new Swagger({ ...definition, publicDir: '' })
    } catch (error) {
      assert.include(error.message, SwaggerSchema.errorMessage.properties.publicDir)
    }

    try {
      new Swagger({ ...definition, baseUrl: '' })
    } catch (error) {
      assert.include(error.message, SwaggerSchema.errorMessage.properties.baseUrl)
    }

    let instance = new Swagger(definition)
    assert.deepEqual(
      await SwaggerParser.validate(instance.swaggerJSON),
      instance.swaggerJSON
    )

    // base url
    assert.throws(() => new Swagger({ ...definition, baseUrl: '' }), ValidationException)
    assert.throws(() => new Swagger({ ...definition, baseUrl: null }), ValidationException)
    assert.throws(() => new Swagger({ ...definition, baseUrl: '0.0.0.0' }), ValidationException)
    assert.throws(() => new Swagger({ ...definition, baseUrl: 'localhost' }), ValidationException)
    assert.doesNotThrow(() => new Swagger({ ...definition, baseUrl: 'http://127.0.0.1' }), ValidationException)
    assert.doesNotThrow(() => new Swagger({ ...definition, baseUrl: 'http://localhost:3000' }), ValidationException)
    assert.doesNotThrow(() => new Swagger({ ...definition, baseUrl: 'http://127.0.0.1:8080' }), ValidationException)
    assert.doesNotThrow(() => new Swagger({ ...definition, baseUrl: 'https://example.com' }), ValidationException)

    // security
    assert.doesNotThrow(() => new Swagger({
      ...definition,
      security: { bearerAuth: {} }
    }), ValidationException)

    definition = {
      ...definition,
      title: 'Swagger Test',
      description: 'Swagger Test',
      version: '2.0.0'
    }
    instance = new Swagger(definition)
    assert.deepEqual(instance.swaggerJSON.info, {
      title: definition.title,
      description: definition.description,
      version: definition.version,
    })

    // Adding Server
    assert.throws(() => {
      instance.servers = {}
    }, ValidationException)
    assert.throws(() => {
      instance.servers = { url: 123 }
    }, ValidationException)
    assert.throws(() => {
      instance.servers = { url: '127.0.0.1' }
    }, ValidationException)

    assert.doesNotThrow(() => {
      instance.servers = { url: 'http://127.0.0.1:3000/' }
    }, ValidationException)
    assert.equal(instance._servers.length, 1)

    // Adding Model
    assert.throws(() => {
      instance.models = {}
    }, ValidationException)
    assert.throws(() => {
      instance.models = { name: 'TestModel' }
    }, ValidationException)
    assert.throws(() => {
      instance.models = { name: 'TestModel', properties: {} }
    }, ValidationException)

    assert.doesNotThrow(() => {
      instance.models = { name: 'TestModel', properties: { a: { type: 'string' } } }
    }, ValidationException)
    assert.equal(instance._models.length, 1)

    // Adding Path
    assert.throws(() => {
      instance.paths = {}
    }, ValidationException)

    definition = {
      path: '/test/ing',
      tags: ['Test'],
      summary: 'Testing path',
      responses: [
        {
          modelName: 'TestModel',
          description: 'A sample ok response',
          statusCode: 200
        }
      ],
      method: 'get'
    }
    assert.throws(() => {
      instance.paths = { ...definition, tags: '' }
    }, ValidationException)
    assert.throws(() => {
      instance.paths = { ...definition, path: '' }
    }, ValidationException)
    assert.throws(() => {
      instance.paths = { ...definition, path: 'test' }
    }, ValidationException)
    assert.throws(() => {
      instance.paths = { ...definition, summary: '' }
    }, ValidationException)
    assert.throws(() => {
      instance.paths = { ...definition, summary: '1' }
    }, ValidationException)
    assert.throws(() => {
      instance.paths = { ...definition, responses: '' }
    }, ValidationException)
    assert.throws(() => {
      instance.paths = { ...definition, responses: [] }
    }, ValidationException)
    assert.throws(() => {
      instance.paths = { ...definition, responses: [
        {
          ...definition.responses[0],
          description: ''
        }
      ] }
    }, ValidationException)
    assert.throws(() => {
      instance.paths = { ...definition, responses: [
        {
          modelName: 'TestModel',
          statusCode: 500,
          description: 'just a description'
        }
      ] }
    }, ValidationException)
    assert.throws(() => {
      instance.paths = { ...definition, responses: [
        {
          modelName: 'NonExistingResponseModel',
          statusCode: 200,
          description: 'just a description'
        }
      ] }
    }, ValidationException)
    assert.throws(() => {
      instance.paths = { ...definition, method: '' }
    }, ValidationException)
    assert.throws(() => {
      instance.paths = { ...definition, method: 'update' }
    }, ValidationException)
    assert.throws(() => {
      instance.paths = { ...definition, requestBody: [
        { modelName: 'NonExistingModel' }
      ] }
    }, ValidationException)

    assert.doesNotThrow(() => {
      instance.paths = definition
    })
    assert.throws(() => {
      instance.paths = definition
    }, ValidationException) // inserting again
    assert.doesNotThrow(() => {
      instance.paths = { ...definition, path: '/another-path', method: 'GET' }
    })

    assert.doesNotThrow(() => {
      instance.paths = {
        path: '/with-request-body',
        tags: ['Test'],
        summary: 'Testing with request body',
        responses: [
          {
            modelName: 'TestModel',
            description: 'A sample ok response',
            statusCode: 200
          }
        ],
        requestBody: {
          modelName: 'TestModel',
          required: true
        },
        method: 'post'
      }
    })

    assert.doesNotThrow(() => {
      instance.paths = {
        path: '/with-parameter/{id}',
        tags: ['Test'],
        summary: 'Testing with parameter',
        responses: [
          {
            modelName: 'TestModel',
            description: 'A sample ok response',
            statusCode: 200
          }
        ],
        parameters: [
          {
            in: 'path',
            required: true,
            name: 'id',
            description: 'Paramater id',
            schema: {
              type: 'integer'
            }
          }
        ],
        method: 'post'
      }
    })

    // Adding Tag
    definition = {
      name: 'Test',
      description: 'Just a tag'
    }
    assert.throws(() => {
      instance.tags = { ...definition, name: '' }
    }, ValidationException)
    assert.throws(() => {
      instance.tags = { ...definition, name: '12' }
    }, ValidationException)
    assert.throws(() => {
      instance.tags = { ...definition, description: '' }
    }, ValidationException)
    assert.throws(() => {
      instance.tags = { ...definition, description: '123' }
    }, ValidationException)

    assert.doesNotThrow(() => {
      instance.tags = definition
    })

    const newInstance = new Swagger({
      explorerPath: '/swagger-ui',
      publicDir,
      baseUrl: 'http://127.0.0.1:8080'
    })
    assert.notStrictEqual(instance, newInstance)

    assert.isArray(instance.tags)
    assert.isArray(instance.servers)
    assert.isObject(instance.models)
    assert.isObject(instance.paths)
    assert.isObject(instance.swaggerJSON)
  })
})