export const VersionHealthCheck = {
  name: 'VersionHealthCheck',
  properties: {
    name: {
      type: 'string'
    },
    version: {
      type: 'string'
    },
  }
}

export const ExpressHealthCheck = {
  name: 'ExpressHealthCheck',
  properties: {
    uptime: {
      type: 'number'
    }
  }
}

export const ResponseBadRequest = {
  name: 'ResponseBadRequest',
  required: ['status', 'message', 'payload'],
  properties: {
    status: {
      type: 'integer',
      format: 'int64',
      description: 'Http success result code',
      default: 400
    },
    message: {
      type: 'string',
      description: 'Message regarding this status code.',
      default: 'Bad Request',
    },
    payload: {
      type: 'object',
      properties: {
        error: {
          type: 'object'
        }
      }
    }
  }
}

export const ResponseUnauthorize = {
  name: 'ResponseUnauthorize',
  required: ['status', 'message', 'payload'],
  properties: {
    status: {
      type: 'integer',
      format: 'int64',
      description: 'Http user error code',
      default: 401
    },
    message: {
      type: 'string',
      description: 'Message regarding this status code.',
      default: 'Unauthorized',
    },
    payload: {
      type: 'object',
      properties: {
        error: {
          type: 'object'
        }
      }
    }
  }
}

export const ResponseGeneralError = {
  name: 'ResponseGeneralError',
  required: ['status', 'message', 'payload'],
  properties: {
    status: {
      type: 'integer',
      format: 'int64',
      description: 'Http server error code',
      default: 503
    },
    message: {
      type: 'string',
      description: 'Message regarding this status code.',
      default: 'Server error.'
    },
    payload: {
      type: 'object',
      properties: {
        error: {
          type: 'object'
        }
      }
    }
  }
}

export default [
  VersionHealthCheck,
  ExpressHealthCheck,
  ResponseBadRequest,
  ResponseUnauthorize,
  ResponseGeneralError,
]