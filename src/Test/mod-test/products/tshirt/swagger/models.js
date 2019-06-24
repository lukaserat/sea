export const TShirtModel = {
  name: 'TShirtModel',
  errorMessage: {
    required: {
      size: 'Username is required.',
      password: 'Password is required.'
    },
    properties: {
      username: 'Username must be an email address.',
      password: [
        'Password must met the following conditions:',
        'At least one upper case letter;',
        'At least one lower case letter;',
        'At least one digit;',
        'At least one special character; and',
        'Minimum eight in lenght.'
      ].join(' ')
    }
  },
  required: ['size', 'cost'],
  properties: {
    id: {
      type: 'number',
    },
    size: {
      type: 'string',
      enum: ['S', 'M', 'L']
    },
    printed: {
      type: 'boolean',
      default: false
    },
    cost: {
      type: 'number',
      minimum: 0
    },
    tax: {
      type: 'number',
      default: 0,
      minimum: 0,
      maximum: 100
    },
  }
}

export default [
  TShirtModel
]