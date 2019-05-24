import { versionHealthcheck, expressHealthCheck } from './handler'

/**
 * App Level routes here. Only add routes here that related to the core or routes
 * that can be share down to modules
 */

/** @type {SSC_APP.RouteConfig[]} */
const routeConfig = [
  {
    method: 'get',
    path: '/version',
    middleware: [],
    handler: versionHealthcheck,
    tags: ['system'],
    summary: 'Version health check',
    responses: [
      {
        statusCode: 200,
        modelName: 'VersionHealthCheck',
        description: 'Successful Response'
      }
    ]
  },
  {
    method: 'get',
    path: '/healthcheck',
    middleware: [],
    handler: expressHealthCheck,
    tags: ['system'],
    summary: 'Version health check',
    responses: [
      {
        statusCode: 200,
        modelName: 'ExpressHealthCheck',
        description: 'Successful Response'
      }
    ]
  }
]
export default routeConfig