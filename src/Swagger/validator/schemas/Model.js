export default {
  $id: '$Model',
  type: 'object',
  required: ['name', 'properties'],
  errorMessage: {
    required: {
      name: 'Model name is required.',
      properties: 'Model must have properties.'
    },
    properties: {
      name: 'Model name must be a string of more than 3 characters.',
    }
  },
  additionalProperties: true,
  properties: {
    name: {
      type: 'string',
      minLength: 3
    },
    properties: {
      type: 'object',
      minProperties: 1,
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