import PathSchema from '../../../Swagger/validator/schemas/Path'
const allowedMethod = [
  'get', 'post', 'put', 'delete'
]

export default {
  $id: '$Route',
  type: 'object',
  required: ['method', 'path', 'middleware', 'handler'],
  errorMessage: {
    required: {
      method: 'Route ${/path} must have method.',
      path: 'Route must have path.',
      handler: 'Route ${/path} must have handler.',
      responses: 'Route ${/path} must declare possible responses.'
    },
    properties: {
      method: `Method must be one of the following allowed values [${allowedMethod.join(',')}]`,
      path: 'Path must be in the format URL path, get ${/path}.',
      handler: 'Handler of ${/path} must be a function.',
      middleware: 'Expecting middleware of ${/path} to be array of functions.',
      overwrite: 'Expecting overwrite of ${/path} to be a boolean.',
      responses: 'Expecting responses of ${/path} to be in object format: { <status_code>:<model_name> }.'
    }
  },
  properties: {
    responses: {
      type: 'array',
      items: {
        type: 'object',
        required: ['modelName', 'statusCode', 'description'],
        errorMessage: {
          required: {
            modelName: 'Route response model name is required.',
            statusCode: 'Status code is required.',
          },
          properties: {
            modelName: 'Model name must be a valid model define in module instance models.',
            statusCode: 'Status code must be a valid status code define in http-status module.',
          }
        },
        properties: {
          modelName: {
            type: 'string',
          },
          statusCode: {
            type: 'number',
            validStatusCode: true,
          },
          description: {
            type: 'string',
            minLength: 5
          }
        }
      }
    },
    method: {
      type: 'string',
      enum: allowedMethod.concat(allowedMethod.map(x => x.toUpperCase()))
    },
    path: {
      type: 'string',
      pattern: '^\\/(.+)?$'
    },
    handler: {
      function: true
    },
    overwrite: {
      type: 'boolean'
    },
    middleware: {
      type: 'array',
      items: {
        function: true
      }
    },
    prefix: {
      anyOf: [
        {
          type: 'string',
          pattern: '^\\/(.+)?$'
        },
        {
          function: true
        }
      ]
    },
    parameters: PathSchema.properties.parameters,
    requestBody: PathSchema.properties.requestBody
  }
}