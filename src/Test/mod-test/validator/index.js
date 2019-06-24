import { addSchema, addKeywords } from '../../../Validator/utils'
import schemas from './schemas'
import keywords from './keywords'

/**
 * @param {SSC_APP.App} modInstance
 */
export function addAppSchemas(modInstance) {
  addSchema(modInstance.validator, schemas)
}

/**
 * @param {SSC_APP.App} modInstance
 */
export function addAppKeywords(modInstance) {
  addKeywords(modInstance.validator, keywords)
}
