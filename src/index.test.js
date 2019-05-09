import 'whatwg-fetch'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'

import API from './index'
import LocalStorageMock from './LocalStorageMock'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

global.localStorage = new LocalStorageMock

const token = 'cK.Jf5L_KD6ddsd=s5'

describe('TEST API', () => {
  let testApi = new API({url: 'http://127.0.0.1:3333'})
  let companiesEndpoint = testApi.endpoint('companies')

  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('constructor', () => {
    expect(companiesEndpoint.useJWT).toBe(false)
    expect(companiesEndpoint.ressourceUrl)
      .toBe('http://127.0.0.1:3333/companies/')
  })

  it('constructor need url', () => {
    expect(() => { new API({}) }).toThrowError('The API required an url');
  })

  it('read()', () => {
    fetchMock.getOnce(companiesEndpoint.ressourceUrl, {
      body: {companies: ['do something']},
      headers: {'content-type': 'application/json'}
    })

    const expectedActions = [
      {
        type: 'REQUEST_COMPANIES',
        error: false
      },
      {
        type: 'RECEIVE_COMPANIES',
        payload: {companies: ['do something']},
        error: false
      }
    ]
    const store = mockStore()

    return store.dispatch(companiesEndpoint.read()).then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    })
  })

  it('create()', () => {
    const param = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: '{"name":"Amazon"}'
    }

    fetchMock.postOnce({
      matcher: function (url, opts) {
        expect(opts).toEqual(param)
        return (url === companiesEndpoint.ressourceUrl)
      },
      response: {id: 1, name: 'Amazon'}
    })

    const store = mockStore()

    return store.dispatch(companiesEndpoint.create({name: 'Amazon'}))
      .then(() => {
        expect(store.getActions())
          .toEqual(
            [{
              type: 'CREATE_COMPANIES',
              payload: {id: 1, name: 'Amazon'},
              error: false
            }])
      })
  })

  it('update()', () => {
    const param = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: '{"id":1,"name":"Google"}'
    }

    fetchMock.putOnce({
      matcher: function (url, opts) {
        expect(opts).toEqual(param)
        return (url === (companiesEndpoint.ressourceUrl + '1'))
      },
      response: {id: 1, name: 'Google'}
    })

    const store = mockStore()

    return store.dispatch(companiesEndpoint.update({id: 1, name: 'Google'}))
      .then(() => {
        expect(store.getActions())
          .toEqual(
            [{
              type: 'UPDATE_COMPANIES',
              payload: {id: 1, name: 'Google'},
              error: false
            }])
      })
  })

  it('delete()', () => {
    const param = {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'}
    }

    fetchMock.deleteOnce({
      matcher: function (url, opts) {
        expect(opts).toEqual(param)
        return (url === (companiesEndpoint.ressourceUrl + '1'))
      },
      response: {id: 1}
    })

    const store = mockStore()

    return store.dispatch(companiesEndpoint.delete(1)).then(() => {
      expect(store.getActions())
        .toEqual([{
          type: 'REMOVE_COMPANIES',
          payload: 1,
          error: false
        }])
    })
  })

  it('nested', () => {
    let leadersEndpoint = testApi.endpoint('leaders')
    leadersEndpoint.nested('companies', 1)
    expect(leadersEndpoint.ressourceUrl)
      .toBe('http://127.0.0.1:3333/companies/1/leaders/')
  })

  it('nested action', () => {
    let leadersEndpoint = testApi.endpoint('leaders')
    leadersEndpoint.nested('companies', 1)

    fetchMock.getOnce(leadersEndpoint.ressourceUrl, {
      body: {companies: ['do something']},
      headers: {'content-type': 'application/json'}
    })

    const expectedActions = [
      {
        type: 'REQUEST_COMPANIES_LEADERS',
        error: false
      },
      {
        type: 'RECEIVE_COMPANIES_LEADERS',
        payload: {companies: ['do something']},
        error: false
      }
    ]

    const store = mockStore()
    return store.dispatch(leadersEndpoint.read()).then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    })
  })

  it('nested without params', () => {
    let leadersEndpoint = testApi.endpoint('leaders').nested('companies')
    expect(leadersEndpoint.ressourceUrl)
      .toBe('http://127.0.0.1:3333/companies/leaders/')
  })

  it('rename Redux action', () => {
    let leadersEndpoint = testApi.endpoint('leaders').renameAction('COMPANIES_DETAIS')

    fetchMock.getOnce(leadersEndpoint.ressourceUrl, {
      body: {companies: ['do something']},
      headers: {'content-type': 'application/json'}
    })

    const expectedActions = [
      {
        type: 'REQUEST_COMPANIES_DETAIS',
        error: false
      },
      {
        type: 'RECEIVE_COMPANIES_DETAIS',
        payload: {companies: ['do something']},
        error: false
      }
    ]

    const store = mockStore()
    return store.dispatch(leadersEndpoint.read()).then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})

describe('TEST API WITH AUTH', () => {
  let testApi = new API({url: 'http://127.0.0.1:3333'})

  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('auth()', () => {
    let leadersEndpoint = testApi.endpoint('leaders').auth()
    expect(leadersEndpoint.useJWT).toBe(true)
  })

  it('login', () => {
    let authEndpoint = testApi.endpoint('login')
    const param = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: '{"email":"e@mail.com","password":"secret"}'
    }

    fetchMock.postOnce({
      matcher: function (url, opts) {
        expect(opts).toEqual(param)
        return (url === authEndpoint.ressourceUrl)
      },
      response: {token: token}
    })

    const store = mockStore()

    return store.dispatch(
      authEndpoint.login({email: 'e@mail.com', password: 'secret'}))
      .then(() => {
        const actions = [
          {type: 'REQUEST_LOGIN', error: false},
          {type: 'RECEIVE_LOGIN', payload: {isLogged: true}, error: false}
        ]
        expect(store.getActions()).toEqual(actions)
      })
  })

  it('login with error 401', () => {
    let authEndpoint = testApi.endpoint('login')

    fetchMock.postOnce(authEndpoint.ressourceUrl, {
      body: [{'field': 'password','message': 'Invalid user password'}],
      headers: {'content-type': 'application/json'},
      status: 404
    })

    const store = mockStore()

    return store.dispatch(
      authEndpoint.login({email: 'e@mail.com', password: 'secret'}))
      .then(() => {
        const actions = [
          {type: 'REQUEST_LOGIN', error: false},
          {type: 'ERROR_LOGIN', payload: {'field': 'password','message': 'Invalid user password'}, error: true}
        ]
        expect(store.getActions()).toEqual(actions)
      })
  })

  let withAuthEndpoint = testApi.endpoint('companies')
  withAuthEndpoint.auth()

  it('read with auth', () => {
    fetchMock.getOnce(withAuthEndpoint.ressourceUrl, {
      body: {companies: ['do something']},
      headers: {'content-type': 'application/json'}
    })

    const expectedActions = [
      {
        type: 'REQUEST_COMPANIES',
        error: false
      },
      {
        type: 'RECEIVE_COMPANIES',
        payload: {companies: ['do something']},
        error: false
      }
    ]
    const store = mockStore()

    return store.dispatch(withAuthEndpoint.read()).then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    })
  })

  it('create with auth', () => {
    const param = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: '{"name":"Amazon"}'
    }

    fetchMock.postOnce({
      matcher: function (url, opts) {
        expect(opts).toEqual(param)
        return (url === withAuthEndpoint.ressourceUrl)
      },
      response: {id: 1, name: 'Amazon'}
    })

    const store = mockStore()

    return store.dispatch(withAuthEndpoint.create({name: 'Amazon'}))
      .then(() => {
        expect(store.getActions()).toEqual([{
          type: 'CREATE_COMPANIES',
          payload: {id: 1, name: 'Amazon'},
          error: false
        }])
      })
  })

  it('update() with auth', () => {
    const param = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: '{"id":1,"name":"Google"}'
    }

    fetchMock.putOnce({
      matcher: function (url, opts) {
        expect(opts).toEqual(param)
        return (url === (withAuthEndpoint.ressourceUrl + '1'))
      },
      response: {id: 1, name: 'Google'}
    })

    const store = mockStore()

    return store.dispatch(withAuthEndpoint.update({id: 1, name: 'Google'}))
      .then(() => {
        expect(store.getActions()).toEqual([{
          type: 'UPDATE_COMPANIES',
          payload: {id: 1, name: 'Google'},
          error: false
        }])
      })
  })

  it('delete() with auth', () => {
    const param = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    }

    fetchMock.deleteOnce({
      matcher: function (url, opts) {
        expect(opts).toEqual(param)
        return (url === (withAuthEndpoint.ressourceUrl + '1'))
      },
      response: {id: 1}
    })

    const store = mockStore()

    return store.dispatch(withAuthEndpoint.delete(1)).then(() => {
      expect(store.getActions()).toEqual([{
        type: 'REMOVE_COMPANIES',
        payload: 1,
        error: false
      }])
    })
  })
})
