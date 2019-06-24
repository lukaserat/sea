import httpStatus from 'http-status'


export const MESSAGE_BAD_REQUEST_CODE = httpStatus.BAD_REQUEST
export const MESSAGE_BAD_REQUEST = 'Bad Request, data was malformed.'

export const MESSAGE_SERVER_ERROR_CODE = httpStatus.INTERNAL_SERVER_ERROR
export const MESSAGE_SERVER_ERROR = 'Server Error.'

export const MESSAGE_NOT_FOUND_CODE = httpStatus.NOT_FOUND
export const MESSAGE_NOT_FOUND = 'Request not found.'

