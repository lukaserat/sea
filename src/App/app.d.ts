import Express from 'express'

import { Logger } from 'winston'

declare global {
  namespace SSC_APP {
    declare class App {
      constructor(definition?: Definition);
      definition: Definition;
      app: Express.Application
      swagger: SSC_Swagger.Swagger|null;
      validator: SSC_Validator.Validator;
    
      withExpress: boolean;
      publicDir: string;
      swaggerSchema: object;
      logger: Logger;

      _routes:RouteConfig;
    
      beforeBoot(): App;
      boot(): App;
      validateModel(modelName: string, data: object): bool|SSC_Validator.ValidatorException;
      shutdown(): App;

      initialize(definition ?: Definition): App;
    }

    export const express = Express;
    
    export interface Middleware {
      name: string;
      params?: any
    }
    
    export interface ExpressDefinition  {
      middleware: {
        before: Array<string|Express.RequestHandler|Middleware>;
        after: Array<string|Express.RequestHandler|Middleware>;
      };
      port: number;
      host: string;
    }
    
    export interface Definition {
      name: string;
      appDir: string;
      products?: string[];
      express?: ExpressDefinition
    }
    
    export interface RouteConfig {
      method: SSC_Swagger.RouteMethods;
      path: string;
      overwrite?: boolean = false;
      handler: Express.RequestParamHandler;
      middleware: Express.RequestParamHandler[];
    }
  }
}

export = SSC_APP