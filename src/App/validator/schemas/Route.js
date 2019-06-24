import PathSchema from '../../../Swagger/validator/schemas/Path'
import { express } from '../../express/middleware.mapping';
const allowedMethod = [
  'get', 'post', 'put', 'delete'
]
const availableMiddlewares = Object.keys(express);

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
      middleware: [
        '${/express/middleware}',
        `Expecting before middleware to be one of the allowed values: ${availableMiddlewares.join(', ')}.`,
        'It can be an express middleware function.',
        'It can be in a format { name: <allowed middleware>, params: [] }'
      ].join(' '),
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
        oneOf: [
          {
            type: 'string',
            'enum': availableMiddlewares
          },
          {
            type: 'object',
            required: ['name'],
            properties: {
              name: {
                type: 'string',
                'enum': availableMiddlewares
              },
              params: {
                type: ['string', 'array', 'object'],
              }
            }
          },
          {
            function: true
          }
        ]
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