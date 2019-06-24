import path from 'path'
import dotenv from 'dotenv'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import request from 'supertest'
import statuses from 'http-status'

chai.use(chaiAsPromised)
const { assert } = chai

import App from '../../App'
import ValidationException from '../../Validator/ValidationException';

describe('App', () => {
  /** @type {SSC_APP.App} */
  let modInstance
  /** @type {SSC_Swagger.Swagger} */
  let swaggerInstance
  before(() => {
    dotenv.config({ path: path.join(__dirname, '.env.test') })
    process.env.NODE_ENV = 'test'

    modInstance = require('./').default
    swaggerInstance = modInstance.swagger
  })

  after(() => {
    modInstance.shutdown()
  })

  it('should be able to successfully construct swagger instance', () => {
    // console.log(JSON.stringify(swaggerInstance.swaggerJSON))
    assert.deepEqual(swaggerInstance.swaggerJSON, require('./data/swagger'))
  })

  it('testing integrity of the app', () => {
    // testing singleton
    const newInstance = App.initialize()
    assert.strictEqual(modInstance, newInstance)
    assert.strictEqual(modInstance.app.modInstance, modInstance)
  })

  describe('should be able to get a response from the core level routes', () => {
    it('/version', () => {
      assert.doesNotThrow(() => {
        request(modInstance.app)
          .get('/version')
          .expect(statuses.OK)
          .end((err, res) => {
            if (err) {
              throw err
            }
            assert.hasAllKeys(res.body, ['name', 'version'])
          })
      })
    })
    it('/healthcheck', () => {
      assert.doesNotThrow(() => {
        request(modInstance.app)
          .get('/healthcheck')
          .expect(statuses.OK)
          .end((err, res) => {
            if (err) {
              throw err
            }
            assert.hasAllKeys(res.body, ['uptime'])
          })
      })
    })
  })

  describe('should be able to get a response from the app level routes', () => {
    it('/', () => {
      assert.doesNotThrow(() => {
        request(modInstance.app)
          .get('/')
          .expect(statuses.OK)
          .end((err, res) => {
            if (err) {
              throw err
            }
            assert.deepEqual(res.body, { message: 'App Level Index Route' })
          })
      })
    })
  })

  describe('should be able to get a response from the product level routes', () => {
    it('/tshirt', () => {
      assert.doesNotThrow(() => {
        request(modInstance.app)
          .get('/tshirt')
          .expect(statuses.OK)
          .end((err, res) => {
            if (err) {
              throw err
            }
            assert.isTrue(modInstance.validateModel('TShirtModel', res.body))
          })
      })
      assert.doesNotThrow(() => {
        request(modInstance.app)
          .post('/tshirt/add')
          .send({
            size: 'S',
            printed: false,
            cost: 100,
            tax: 85
          })
          .expect(statuses.OK)
          .end((err, res) => {
            if (err) {
              throw err
            }
            assert.isTrue(modInstance.validateModel('TShirtModel', res.body))
          })
      })
      assert.doesNotThrow(() => {
        request(modInstance.app)
          .post('/tshirt/add')
          .send({
            size: 'Q',
            printed: false,
            cost: 100,
            tax: 85
          })
          .expect(statuses.BAD_REQUEST)
          .end((err, res) => {
            if (err) {
              throw err
            }
          })
      })
      assert.doesNotThrow(() => {
        request(modInstance.app)
          .get('/tshirt/id/1')
          .expect(statuses.OK)
          .end((err, res) => {
            if (err) {
              throw err
            }
            assert.equal(res.body.id, 1)
          })
      })
      assert.doesNotThrow(() => {
        request(modInstance.app)
          .get('/tshirt/id/xxx')
          .expect(statuses.BAD_REQUEST)
          .end((err, res) => {
            if (err) {
              throw err
            }
          })
      })
    })
  })

  it('middleware should work', () => {
    assert.doesNotThrow(() => {
      request(modInstance.app)
        .get('/with-supress')
        .expect(statuses.OK)
        .end((err, res) => {
          if (err) {
            throw err
          }
          assert.deepEqual(res.body, { message: 'Modified response' })
        })
    })
  })

})