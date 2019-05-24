import { express } from '../../express/middleware.mapping'

const availableMiddlewares = Object.keys(express)

export default {
  $id: '$App',
  type: 'object',
  required: ['name', 'appDir', 'products'],
  errorMessage: {
    required: {
      name: 'Application needs a name.',
      appDir: 'We cannot determine app directory unless you will tell.',
      products: 'Application is expecting a product.',
    },
    properties: {
      name: 'Name must be a string that should not be less than 3 characters.',
      products: 'Expecting to have at least one product.',
    }
  },
  properties: {
    name: {
      type: 'string',
      minLength: 3
    },
    products: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'string',
        uniqueItems: true,
        minLength: 3,
        minItems: 1
      }
    },
    appDir: {
      type: 'string',
      file: true
    },
    express: {
      type: 'object',
      errorMessage: {
        required: {
          middleware: 'Middleware definition is missing. Refer to App Schema for more details.',
          port: 'Application port is required.',
          host: 'Application host is required.',
        },
        properties: {
          middleware: 'Expecting middleware to be a object with before and after properties.'
        }
      },
      required: ['middleware', 'port', 'host'],
      properties: {
        middleware: {
          type: 'object',
          errorMessage: {
            properties: {
              before: [
                '${/express/middleware}',
                `Expecting before middleware to be one of the allowed values: ${availableMiddlewares.join(', ')}.`,
                'It can be an express middleware function.',
                'It can be in a format { name: <allowed middleware>, params: [] }'
              ].join(' '),
              after: [
                '${/express/middleware}',
                `Expecting after middleware to be one of the allowed values: ${availableMiddlewares.join(', ')}.`,
                'It can be an express middleware function.',
                'It can be in a format { name: <allowed middleware>, params: [] }'
              ].join(' ')
            }
          },
          properties: {
            before: {
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
            after: {
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
            }
          }
        },
        port: {
          type: 'number',
          minimum: 1000,
          maximum: 65535
        },
        host: {
          type: 'string',
          pattern: '(\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b|localhost)'
        }
      }
    },
    swagger: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          minLength: 3
        },
        version: {
          type: 'string',
          minLength: 3
        },
        description: {
          type: 'string',
          minLength: 5
        }
      }
    },
    hooks: {
      type: 'object',
      errorMessage: {
        properties: {
          onBoot: 'Expecting a function in onBoot.',
          onBeforeBoot: 'Expecting a function in onBeforeBoot.'
        }
      },
      properties: {
        onBoot: {
          function: true
        },
        onBeforeBoot: {
          function: true
        }
      }
    }
  }
}