import ajv = require("ajv")

declare global {
  namespace SSC_Validator {
    declare class Validator extends ajv.Ajv {
      constructor(options: ajv.Options & Options): Validator;
      options: ajv.Options & Options;
      /**
       * Add Swagger to validator schema
       */
      addSwaggerSchema(schema: object): Validator;

      /**
       * Validate a Swagger model.
       * Throws an error if throwException is set to true.
       */
      validateModel(modelPath: string, data: object): Boolean;

      /**
       * Validate data using a schema.
       * Throws an error if throwException is set to true.
       */
      validate(schemaKeyRef: object | string | boolean, data: any): boolean | PromiseLike<any>;
    }

    interface Options {
      throwException?: boolean;
    }

    interface ValidatorException extends Error {
      validationErrors: Array<ajv.ErrorObject>;
    }
  }
}

export = SSC_Validator