import p from '../../package'

export default ({
  title = 'SEA App',
  description = 'Example SEA App',
  version = p.version,
  servers = [],
  tags = [],
  paths = {},
  modelSchemas = {},
}) => ({
  openapi: '3.0.1',
  info: {
    title,
    description,
    version,
  },
  servers,
  tags,
  paths,
  components: {
    schemas: modelSchemas,
  }
})