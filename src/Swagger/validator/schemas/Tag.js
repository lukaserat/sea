export default {
  $id: '$Tag',
  type: 'object',
  required: ['name'],
  errorMessage: {
    required: {
      name: 'Tag must have name.'
    },
    properties: {
      name: 'Name must be a string and should not be less than 3 characters.',
      description: 'Description must be a string and should not be less than 5 characters.',
    }
  },
  properties: {
    name: {
      type: 'string',
      minLength: 3
    },
    description: {
      type: 'string',
      minLength: 5
    },
  }
}