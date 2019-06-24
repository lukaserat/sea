export default {
  $id: '$Person',
  type: 'object',
  required: ['firstName', 'lastName'],
  errorMessage: {
    required: {
      firstName: 'First name is required.',
      lastName: 'Last name is required.',
    },
    properties: {
      firstName: 'firstName must be string.',
      lastName: 'lastName must be string.',
      middleName: 'middleName must be string'
    }
  },
  properties: {
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    middleName: {
      type: 'string'
    }
  }
}