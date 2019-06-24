/** @type {SSC_APP.RouteConfig[]} */
const routeConfig = [
  {
    method: 'get',
    path: '/',
    tags: ['app'],
    middleware: [],
    summary: 'App Inddex Page',
    // eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line no-unused-vars
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