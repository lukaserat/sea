import path from 'path'

export function products() {
  if (!process.env.PRODUCTS) {
    throw new Error('Expecting at least one product for the module.')
  }
  return process.env.PRODUCTS.split(',')
}

const definition = {
  name: 'mod-test',
  appDir: path.join(__dirname),
  products: products(),
  express: {
    middleware: {
      before: ['compression', 'helmet', 'cors', 'bodyParser.json', 'bodyParser.urlencoded'],
      after: ['log']
    },
    port: parseInt(process.env.PORT),
    host: process.env.HOST,
  },
  swagger: {
    title: 'Test Module',
    description: `SEA Sample App. ${products().length > 0 ? `Supporting product(s): ${products().join(', ')}` : ''}`,
    version: '1.0.0'
  },
}

export default definition