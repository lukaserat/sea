import {
  CONTINUE,
  SWITCHING_PROTOCOLS,
  OK,
  CREATED,
  ACCEPTED,
  NON_AUTHORITATIVE_INFORMATION,
  NO_CONTENT,
  RESET_CONTENT,
  PARTIAL_CONTENT,
  MULTI_STATUS,
  ALREADY_REPORTED,
  IM_USED,
  MULTIPLE_CHOICES,
  MOVED_PERMANENTLY,
  FOUND,
  SEE_OTHER,
  NOT_MODIFIED,
  USE_PROXY,
  SWITCH_PROXY,
  TEMPORARY_REDIRECT,
  PERMANENT_REDIRECT,
  BAD_REQUEST,
  UNAUTHORIZED,
  PAYMENT_REQUIRED,
  FORBIDDEN,
  NOT_FOUND,
  METHOD_NOT_ALLOWED,
  NOT_ACCEPTABLE,
  PROXY_AUTHENTICATION_REQUIRED,
  REQUEST_TIMEOUT,
  CONFLICT,
  GONE,
  LENGTH_REQUIRED,
  PRECONDITION_FAILED,
  REQUEST_ENTITY_TOO_LARGE,
  REQUEST_URI_TOO_LONG,
  UNSUPPORTED_MEDIA_TYPE,
  REQUESTED_RANGE_NOT_SATISFIABLE,
  EXPECTATION_FAILED,
  IM_A_TEAPOT,
  MISDIRECTED_REQUEST,
  UNPROCESSABLE_ENTITY,
  LOCKED,
  FAILED_DEPENDENCY,
  UPGRADE_REQUIRED,
  PRECONDITION_REQUIRED,
  TOO_MANY_REQUESTS,
  REQUEST_HEADER_FIELDS_TOO_LARGE,
  UNAVAILABLE_FOR_LEGAL_REASONS,
  INTERNAL_SERVER_ERROR,
  NOT_IMPLEMENTED,
  BAD_GATEWAY,
  SERVICE_UNAVAILABLE,
  GATEWAY_TIMEOUT,
  HTTP_VERSION_NOT_SUPPORTED,
  VARIANT_ALSO_NEGOTIATES,
  INSUFFICIENT_STORAGE,
  LOOP_DETECTED,
  NOT_EXTENDED,
  NETWORK_AUTHENTICATION_REQUIRED,
} from 'http-status'

declare global {
  namespace SSC_Swagger {
    declare enum StatusCodes {
      CONTINUE,
      SWITCHING_PROTOCOLS,
      OK,
      CREATED,
      ACCEPTED,
      NON_AUTHORITATIVE_INFORMATION,
      NO_CONTENT,
      RESET_CONTENT,
      PARTIAL_CONTENT,
      MULTI_STATUS,
      ALREADY_REPORTED,
      IM_USED,
      MULTIPLE_CHOICES,
      MOVED_PERMANENTLY,
      FOUND,
      SEE_OTHER,
      NOT_MODIFIED,
      USE_PROXY,
      SWITCH_PROXY,
      TEMPORARY_REDIRECT,
      PERMANENT_REDIRECT,
      BAD_REQUEST,
      UNAUTHORIZED,
      PAYMENT_REQUIRED,
      FORBIDDEN,
      NOT_FOUND,
      METHOD_NOT_ALLOWED,
      NOT_ACCEPTABLE,
      PROXY_AUTHENTICATION_REQUIRED,
      REQUEST_TIMEOUT,
      CONFLICT,
      GONE,
      LENGTH_REQUIRED,
      PRECONDITION_FAILED,
      REQUEST_ENTITY_TOO_LARGE,
      REQUEST_URI_TOO_LONG,
      UNSUPPORTED_MEDIA_TYPE,
      REQUESTED_RANGE_NOT_SATISFIABLE,
      EXPECTATION_FAILED,
      IM_A_TEAPOT,
      MISDIRECTED_REQUEST,
      UNPROCESSABLE_ENTITY,
      LOCKED,
      FAILED_DEPENDENCY,
      UPGRADE_REQUIRED,
      PRECONDITION_REQUIRED,
      TOO_MANY_REQUESTS,
      REQUEST_HEADER_FIELDS_TOO_LARGE,
      UNAVAILABLE_FOR_LEGAL_REASONS,
      INTERNAL_SERVER_ERROR,
      NOT_IMPLEMENTED,
      BAD_GATEWAY,
      SERVICE_UNAVAILABLE,
      GATEWAY_TIMEOUT,
      HTTP_VERSION_NOT_SUPPORTED,
      VARIANT_ALSO_NEGOTIATES,
      INSUFFICIENT_STORAGE,
      LOOP_DETECTED,
      NOT_EXTENDED,
      NETWORK_AUTHENTICATION_REQUIRED,
    }

    declare enum RouteMethods {
      GET = 'get', PUT = 'put', POST = 'post', DELETE = 'delete'
    }

    declare enum ParamIn {
      IN_QUERY = 'query', IN_PATH = 'path'
    }

    declare class Swagger {
      constructor(definition?: Definition);
      definition: Definition;
      validator: SSC_Validator.Validator;
    
      swaggerJSON: APIDefinition;
      explorerUri: string;
      publicDir: string;

      _servers: Server[];
      _tags: Tag[];
      _paths: Path[];
      _models: Model[];

      servers: Server[];
      tags: Tag[];
      models: object;
      paths: object;

      addSwaggerSchema(schema: object): Swagger;
      validateModel(modelPath: string, data: object): bool|SSC_Validator.ValidatorException;
    }

    export interface Definition {
      /** URL where the swagger-ui explorer will be served */
      explorerPath: string;
      /** Path where the swagger-ui assets will be placed */
      publicDir: string;
      /** Base URL of the app where the swagger-ui is attached */
      baseUrl: string;
      title?: string;
      description?: string;
      version?: string;
    }
  
    export interface Component {
      schemas: Object;
      parameters: Object;
    }
  
    export interface APIDefinition {
      openapi: string;
      info: Object;
      consumes: Array.<string>;
      produces: Array.<string>;
      servers: Array.<Object>;
      tags: Array.<Object>;
      paths: Object;
      components: Component;
    }

    export interface ErrorMessage {
      required: string[] = [];
      properties: object = {};
    }

    export interface Server {
      url: string;
    }

    export interface Tag {
      name: string;
      description: string;
    }

    export interface Model {
      $id: string;
      properties: object = {};
      overwrite?: boolean = false;
      required?: string[] = [];
      errorMessage?: ErrorMessage;
    }

    export interface RequestResponse {
      statusCode: StatusCodes;
      modelName: string;
      description?: string;
    }

    export interface RequestBody {
      modelName: string;
      required?: bool = false;
      description?: string;
    }

    export interface RequestParameter {
      in: ParamIn;
      name: string;
      required?: bool = false;
      description?: string;
    }

    export interface Path {
      path: string;
      method: RouteMethods;
      summary: string;
      tags?: string[];
      requestBody?: RequestBody;
      parameters?: RequestParameter[];
      responses: RequestResponse[];
    }
  }
}

export = SSC_Swagger