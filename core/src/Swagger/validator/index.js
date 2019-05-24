import { addSchema, addKeywords } from '../../Validator/utils'
import schemas from './schemas'
import keywords from './keywords'

/**
 * @param {SSC_Swagger.Swagger} swaggerInstance
 */
export function addAppSchemas(swaggerInstance) {
  addSchema(swaggerInstance.validator, schemas)
}

/**
 * @param {SSC_Swagger.Swagger} swaggerInstance
 */
export function addAppKeywords(swaggerInstance) {
  addKeywords(swaggerInstance.validator, keywords)
}
