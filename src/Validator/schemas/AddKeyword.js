export default {
  type: 'object',
  required: ['keyword', 'definition'],
  properties: {
    keyword: {
      type: 'string'
    },
    errors: {
      type: 'boolean'
    },
    definition: {
      type: 'object',
      properties: {
        validate: {
          function: true
        },
        compile: {
          function: true
        }
      }
    }
  }
}