export default {
  $id: '$Server',
  type: 'object',
  required: ['url'],
  errorMessage: {
    required: {
      url: 'Url is required.'
    },
    properties: {
      url: 'Url must in the correct format.'
    }
  },
  additionalProperties: true,
  properties: {
    url: {
      type: 'string',
      format: 'uri'
    }
  }
}