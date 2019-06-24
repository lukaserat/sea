import _ from 'lodash';
import statuses from 'http-status';

export default class ValidationException extends Error {
  constructor(...params) {
    super(...params);
    this.validationErrors = _.last(params);
    this.status = statuses.BAD_REQUEST;
  }
}