/** @type {SSC_APP.RouteConfig[]} */
const routeConfig = [
  {
    method: 'get',
    path: '/',
    middleware: [],
    tags: ['tshirt'],
    summary: 'Get endpoint from the product',
    handler(req, res) {
      return res.json({
        size: 'S',
        printed: false,
        cost: 100,
        tax: 85
      })
    },
    responses: [
      {
        statusCode: 200,
        modelName: 'TShirtModel',
        description: 'Successful Response'
      }
    ]
  },
  {
    method: 'post',
    path: '/add',
    middleware: [],
    tags: ['tshirt'],
    summary: 'Add endpoint from the product',
    handler(req, res) {
      return res.json(req.body)
    },
    responses: [
      {
        statusCode: 200,
        modelName: 'TShirtModel',
        description: 'Successful Response'
      }
    ],
    requestBody: {
      modelName: 'TShirtModel',
      required: true
    },
  },
  {
    method: 'get',
    path: '/id/:id',
    middleware: [],
    tags: ['tshirt'],
    summary: 'Get endpoint from the product',
    handler(req, res) {
      return res.json({
        id: req.params.id
      })
    },
    responses: [
      {
        statusCode: 200,
        modelName: 'TShirtModel',
        description: 'Successful Response'
      }
    ],
    parameters: [
      {
        required: true,
        in: 'path',
        name: 'id',
        description: 'the id',
        schema: {
          type: 'number'
        }
      }
    ],
  }
]
export default routeConfig