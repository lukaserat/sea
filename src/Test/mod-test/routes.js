/** @type {SSC_APP.RouteConfig[]} */
const routeConfig = [
  {
    method: 'get',
    path: '/',
    tags: ['app'],
    middleware: [],
    summary: 'App Inddex Page',
    handler(req, res, next) {
      res.send({ message: 'App Level Index Route' })
    },
    overwrite: true,
    responses: [
      {
        statusCode: 200,
        modelName: 'OkResponse',
        description: 'Successful Response'
      }
    ]
  },
  {
    method: 'get',
    path: '/with-supress',
    tags: ['app'],
    middleware: [
      (req, res) => res.json({ message: 'Modified response' })
    ],
    summary: 'Sample Endpoint',
    handler(req, res, next) {
      res.send({ message: 'Original Response' })
    },
    responses: [
      {
        statusCode: 200,
        modelName: 'OkResponse',
        description: 'Successful Response'
      }
    ]
  }
]


export default routeConfig