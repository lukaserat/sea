const allowedMethod = [
  'get', 'post', 'put', 'delete'
]

export default {
  $id: '$Path',
  type: 'object',
  required: ['path', 'method', 'summary', 'responses'],
  errorMessage: {
    required: {
      path: 'Path must have endpoint/path.',
      method: '${/path} Path must have method.',
      summary: '${/path} Path must have summary of what it is doing.',
      responses: '${/path} Path must have responses.',
    },
    properties: {
      path: 'Path must be in the format URL path.',
      tags: 'Expecting tags of ${/path} to be array of string.',
      method: `Method of \${/path} should be one of the allowed values [${allowedMethod.join(', ')}]`,
      summary: 'Summary of ${/path} must be string that should not be less than 5 characters.',
      responses: 'Responses of ${/path} must be array of object.',
      uniqueness: 'Combination path ${/path} and method ${/method} already exists.'
    }
  },
  additionalProperties: true,
  properties: {
    path: {
      type: 'string',
      pattern: '^\\/(.+)?$'
    },
    summary: {
      type: 'string',
      minLength: 5
    },
    responses: {
      type: 'array',
      need200: true,
      minItems: 1,
      items: {
        type: 'object',
        errorMessage: {
          required: {
            modelName: 'Path response object must have modelName.',
            statusCode: 'Path response object must have statusCode.',
            description: 'Path response object must have description.',
          },
          properties: {
            modelName: '${0} Expecting modelName of Path ${/path} response object must be a valid model.',
            statusCode: '${0} Expecting statusCode of Path ${/path} response object must be a valid http status code.',
          }
        },
        required: ['modelName', 'statusCode', 'description'],
        properties: {
          modelName: {
            type: 'string',
            minLength: 3,
            validModel: true,
          },
          statusCode: {
            type: 'number',
            validStatusCode: true,
          },
          description: {
            type: 'string',
            minLength: 5
          },
        }
      }
    },
    method: {
      type: 'string',
      enum: allowedMethod.concat(allowedMethod.map(x => x.toUpperCase())),
    },
    uniqueness: {
      type: 'string',
      uniquePath: true
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    parameters: {
      type: 'array',
      items: {
        type: 'object',
        required: ['in', 'name', 'description', 'schema'],
        properties: {
          in: {
            type: 'string',
            'enum': ['query', 'path', 'header']
          },
          name: {
            type: 'string',
            minLength: 2,
          },
          description: {
            type: 'string',
            minLength: 5
          },
          required: {
            type: 'boolean'
          },
          schema: {
            type: 'object'
          },
        },
        additionalProperties: true
      }
    },
    requestBody: {
      type: 'object',
      required: ['modelName'],
      errorMessage: {
        required: {
          modelName: 'Model name is required when defining the request body.'
        },
        properties: {
          modelName: '${0} Expecting modelName of Path ${/path} response object must be a valid model.',
        },
      },
      properties: {
        required: {
          type: 'boolean'
        },
        modelName: {
          type: 'string',
          minLength: 3,
          validModel: true,
        },
        description: {
          type: 'string',
          minLength: 5
        }
      },
      additionalProperties: true
    },
    errorMessage: {
      type: 'object',
      required: ['required', 'properties'],
      errorMessage: {
        required: {
          required: 'errorMessage must have required property.',
          properties: 'errorMessage must have properties property.',
        },
        properties: {
          required: 'Expecting required as array of required properties.',
          properties: 'Expecting properties as an object.',
        }
      }
    }
  }
}