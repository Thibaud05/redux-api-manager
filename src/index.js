import Endpoint from './Endpoint'

/** Call a REST API and get Redux action */
class API {
  constructor (config) {
    this.config = {url: '', version: ''}
    if (!config || !config.url) {
      throw new Error('The API required an url')
    }
    this.config.url = config.url
    if (config.version) {
      this.config.version = config.version
    }
  }

  endpoint (resourceName) {
    return new Endpoint(resourceName, this.config)
  }
}

export default API
