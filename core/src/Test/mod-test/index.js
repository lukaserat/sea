import { addAppKeywords, addAppSchemas } from './validator'
import definition from './definition'
import App from '../../App'

const app = App.initialize(definition)

// add some customization for the app
addAppSchemas(app)
addAppKeywords(app)

export const logger = app.logger

export default app
