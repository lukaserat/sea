import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import _ from 'lodash'
import path from 'path'

chai.use(chaiAsPromised)
const { assert } = chai

import * as u from '../utils'

describe('Utils', () => {
  it('spec for runThrough', () => {
    const subjectAsArray = [1, 2, 3]
    let sum = 0
    u.runThrough(subjectAsArray, x => {
      sum += x
    })

    assert.equal(sum, _.sum(subjectAsArray))

    sum = 0
    const subjectAsObject = { x: 1, y: 2 }
    u.runThrough(subjectAsObject, (v, k) => {
      sum += v
    })
    assert.equal(sum, 3)
  })

  it('spec for createSingleton', () => {
    const api = { x: 1 };
    const NS = 'TESTING_NAMESPACE';

    const instance = u.createSingleton(NS, api);

    // return instance should be defined in global variable
    assert.equal(instance, global[Symbol.for(NS)]);

    // creating the same instance should always return the same referrence
    instance.x = 2;
    const instance2 = u.createSingleton(NS, api)
    assert.deepEqual(instance2, instance);
  })

  describe('loadModule', () => {
    it('should throw error if path does not exists and the mustThrow is set to true', () => {
      assert.throws(() => u.loadModule('/a/non-existing/module', true))
    })

    it('should be able to load existing module', () => {
      assert.doesNotThrow(() => u.loadModule(path.join(__dirname, 'utils')))
    })
  })
})