const _ = require('lodash');
const path = require('path');
const prompt = require('prompt');
const program = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const shell = require('shelljs');


const pack = require('../../package');

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
const rootDir = path.join(__dirname)
const installationDir = path.join(process.cwd(), 'tmp')

const srcTemplateFile = path.join(rootDir, '..', '..', 'mod-template.tar.gz')

fs.removeSync(installationDir)
fs.ensureDirSync(installationDir)

const schema = {
  properties: {
    localCore: {
      pattern: /(yes|no)/,
      description: 'Use local @viseo/sea.',
      default: 'yes'
    },
    name: {
      pattern: /^[a-zA-Z]+$/,
      description: 'Name of the module.',
      message: 'Name must be only letters',
      required: true,
    },
    description: {
      description: 'Describe your module.',
      message: 'Module must have description',
      required: true,
    },
    products: {
      pattern: /[^,\s]{3,}[^\,]*/,
      description: 'Product separated by comma.',
      message: 'Expecting comma separated product',
      required: true,
    },
    port: {
      pattern: /^\d{4}$/,
      description: 'Application port number.',
      message: 'Expecting a port number.',
      default: 3000
    },
    host: {
      pattern: /(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b|localhost)/,
      description: 'Application host.',
      message: 'Expecting a valid ip address or "localhost".',
      default: 'localhost'
    }
  }
}

const swagger = {
  ['index.js']: `import models from './models'
import tags from './tags'

export default {
  models, tags
}`,
  ['models.js']: `export default []`,
  ['tags.js']: `export default [
  { name: '{{name}}', description: 'All about {{name}}' }
]`,
}

const routeFile = `/** @type {SSC_APP.RouteConfig[]} */
const routeConfig = [
  {
    method: 'get',
    path: '/',
    middleware: [],
    tags: ['{{name}}'],
    summary: 'Index route for product {{name}}.',
    handler(req, res) {
      return res.json({ message: 'Index endpoint for {{name}}' })
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
export default routeConfig`

const prepareNs = async function prepareNs(ns, dir) {
  fs.ensureDirSync(path.join(dir, 'swagger'))
  Object.keys(swagger).map(k => {
    const y = _.template(swagger[k])
    fs.outputFileSync(path.join(dir, 'swagger', k), y({ name: ns }))
  })
  fs.outputFileSync(path.join(dir, 'routes.js'), _.template(routeFile)({ name: ns }))
}


program.version(pack.version);
prompt.start();

prompt.get(schema, (err, result) => {
  if (err) {
    console.log(chalk.red('Something went wrong.'));
    console.log(err);
    process.exit(0);
  }

  const { name, description, products, port, host, localCore } = result;
  const namespaces = products.split(',');
  const installDir = path.join(installationDir, name);
  const templateFile = path.join(installationDir, 's.tar.gz');

  fs.copySync(srcTemplateFile, templateFile)

  console.log(chalk.green('Extracting the template..'));
  console.log(chalk.green(`tar -xvzf ${templateFile} -C ${installationDir}`));

  shell.exec(`tar -xvzf ${templateFile} -C ${installationDir}`, () => {
    fs.moveSync(path.join(installationDir, 'mod-template'), installDir)
    fs.removeSync(templateFile)

    const nsDir = path.join(installDir, 'src', 'products')
    fs.ensureDirSync(nsDir)

    const ps = namespaces.map((x) => prepareNs(x, path.join(nsDir, x)))
    Promise.all(ps).then(() => {
      console.log(chalk.green('Module is ready. Preparing package.json and env files.'));

      // update package.json
      const ppath = path.join(installDir, 'package.json')
      const pjson = fs.readJsonSync(ppath)
      fs.writeJSONSync(ppath, JSON.parse(_.template(JSON.stringify(pjson))({ name, description })), { spaces: '\t' })

      // update .env.test and .env
      let y = `PORT={{port}}
HOST={{host}}
PRODUCTS={{products}}
      `
      fs.outputFileSync(path.join(installDir, '.env'), _.template(y)({ name, port, host, products }))
      fs.outputFileSync(path.join(installDir, '.env.test'), _.template(y)({ name, port: 4000, host, products }))

      y = fs.readFileSync(path.join(installDir, 'src', 'definition.js'), { encoding: 'utf8' })
      fs.outputFileSync(path.join(installDir, 'src', 'definition.js'), _.template(y)({ name, port, host, products, description }))

      // localCore
      if (localCore === 'yes') {
        console.log(chalk.green(`Buidling local @viseo/sea.`));
        shell.cd(path.join(rootDir, '../../')).exec('npm run build', () => {
          console.log(chalk.green("Installing module's packages."));
          shell.cd(installDir).exec(`npm install ${path.join(rootDir, '../../')}`, () => {
            const p = shell.cd(installDir).exec(`npm install`, { async: true })
            p.stdout.on('data', data => {
              console.log(data)
            })
            p.on('close', () => {
              console.log(chalk.green(`Done! You can now run your module ${name}.`));
              console.log(chalk.green(`cd ${installDir} && npm run start:dev`));
              process.exit(0)
            })
          })
        })
      } else {
        console.log(chalk.green("Installing module's packages."));
        const p = shell.cd(installDir).exec(`npm install`, { async: true })
        p.stdout.on('data', data => {
          console.log(data)
        })
        p.on('close', () => {
          console.log(chalk.green(`Done! You can now run your module ${name}.`));
          console.log(chalk.green(`cd ${installDir}`));
          console.log(chalk.green('npm run start:dev'));
          process.exit(0)
        })
      }
    })
  })
})


