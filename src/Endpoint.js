import 'whatwg-fetch'

import Actions from './Actions'

class Endpoint {
  /**
   * Create a resource
   * @param  {string} resourceName - The name of the REST resource
   * @param  {object} config - The API configuration
   * @param  {string} config.url - The API url
   * @param  {string} config.version - The API version
   */
  constructor (resourceName, config) {
    this.resourceName = resourceName
    this.useJWT = false

    // Build base url
    this.url = config.url + '/' + config.version
    this.ressourceUrl = this.url + resourceName + '/'

    // Build actions
    this.actions = new Actions(resourceName)
  }

  /**
   * Active the JWT authentication
   * Add token in the header when api make request
   * @return {object} Endpoint
   */
  auth () {
    this.useJWT = true
    return this
  }

  /**
   * Rename the Redux action
   *  @param  {string} actionName - the name of the Redux action
   *  @return {object} Endpoint
   */
  renameAction (actionName) {
    this.actions = new Actions(actionName)
    return this
  }

  /**
   * Create a nested resource
   * @param  {string} resourceName - the name of the REST resource
   * @param  {number} resourceId - the id of the REST resource
   * @return {object} Endpoint
   */
  nested (resourceName, resourceId) {
    this.ressourceUrl = this.url + resourceName + '/'
    if (resourceId) {
      this.ressourceUrl += resourceId + '/'
    }
    this.ressourceUrl += this.resourceName + '/'

    this.resourceName = resourceName + '_' + this.resourceName

    // Re-build actions
    this.actions = new Actions(this.resourceName)
    return this
  }

  /**
   * Get and store the auth token
   * @param  {object} credential - User credential
   * @param  {string} credential.email - User email
   * @param  {string} credential.password - User password
   * @return {object} a redux action
   */
  login (credential) {
    return (dispatch) => {
      dispatch(this.actions.requestResource())
      return fetch(this.ressourceUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(credential)
      }).then(response => response.json()).then(json => {
        if (json.token) {
          dispatch(this.actions.receiveResource({isLogged: true}))
          Endpoint.setToken(json.token)
        } else {
          dispatch(this.actions.errorResource(json[0]))
        }
      }).catch(ex => console.log('parsing failed', ex))
    }
  }

  /**
   * Get all items for a resource or get an item resource by id
   * @param  {string} id - the resource id
   * @return {object} a redux action
   */
  read (id = '') {
    return (dispatch) => {
      dispatch(this.actions.requestResource())
      let param = this.getParam('GET')
      return fetch(this.ressourceUrl + id, param).then(
        response => response.json(),
        error => console.log('An error occurred.', error)
      ).then(json =>
        dispatch(this.actions.receiveResource(json))
      )
    }
  }

  /**
   * Get all items for a resource or get an item resource by id
   * @param  {object} resource - An object representing the resource
   * @param  {boolean} useJson - For use json format in the request
   * @return {object} a redux action
   */
  create (resource, useJson = true) {
    return (dispatch) => {
      let param = this.getParam('POST', useJson, resource)
      return fetch(this.ressourceUrl, param)
        .then(response => response.json())
        .then(json => { dispatch(this.actions.addResourceSuccess(json)) })
        .catch(ex => console.log('parsing failed', ex))
    }
  }

  /**
   * Update a resource by id
   * @param  {object} resource - An object representing the resource
   * @param  {number} resource.id - resource id
   * @param  {boolean} useJson - For use json format in the request
   */
  update (resource, useJson = true) {
    return (dispatch) => {
      let param = this.getParam('PUT', useJson, resource)
      return fetch(this.ressourceUrl + resource.id, param)
        .then(response => response.json())
        .then(json => { dispatch(this.actions.updateResourceSuccess(json)) })
        .catch(ex => console.log('parsing failed', ex))
    }
  }

  /**
   * Delete the resource item by id
   * @param  {number} id - the resource id
   * @return {object} a redux action
   */
  delete (id) {
    return (dispatch) => {
      const param = this.getParam('DELETE')
      return fetch(this.ressourceUrl + id, param)
        .then(response => response.json())
        .then(json => { dispatch(this.actions.deleteResourceSuccess(id)) })
        .catch(ex => console.log('parsing failed', ex))
    }
  }

  /**
   * Create the parameters for http request
   * @param  {string} method - HTTP request method
   * @param  {boolean} useJson - For use json format in the request
   * @param  {object} resource - An object representing the resource
   * @return {object} fetch param
   */
  getParam (method, useJson = true, resource = null) {
    let param = {method: method, headers: {}}
    if (useJson) {
      param.headers['Content-Type'] = 'application/json'
      if (resource) {
        param.body = JSON.stringify(resource)
      }
    } else {
      if (resource) {
        param.body = Endpoint.objToFormData(resource)
      }
    }
    if (this.useJWT) {
      param.headers['Authorization'] = Endpoint.getToken()
    }

    return param
  }

  /**
   * Set the authenticate token
   * @param  {object} obj - form data
   * @return {object} FormData
   */
  static objToFormData (obj) {
    let formData = new FormData()
    for (let props in obj) {
      if (obj.hasOwnProperty(props)) {
        formData.append(props, obj[props])
      }
    }
    return formData
  }

  /**
   * Get the authenticate token
   * @return {string} Token
   */
  static getToken () {
    return 'Bearer ' + localStorage.getItem('token')
  }

  /**
   * Set the authenticate token
   * @param  {string} token - JWT token
   */
  static setToken (token) {
    localStorage.setItem('token', token)
  }
}

export default Endpoint
