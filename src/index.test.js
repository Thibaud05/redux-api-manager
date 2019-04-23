import 'whatwg-fetch'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'

import API from "./index"
import LocalStorageMock from "./LocalStorageMock"

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

global.localStorage = new LocalStorageMock



const token = 'cK.Jf5L_KD6ddsd=s5'

describe('TEST REST API CRUD', () => {

    let testApi = new API({url: 'http://127.0.0.1:3333'})

    let companiesEndpoint = testApi.endpoint('companies')


    afterEach(() => {
        fetchMock.reset()
        fetchMock.restore()
    })

    it('constructor', () => {
        expect(companiesEndpoint.useJWT).toBe(false);
        expect(companiesEndpoint.ressourceUrl).toBe('http://127.0.0.1:3333/companies/');
    });

    it('read()', () => {
        fetchMock
            .getOnce(companiesEndpoint.ressourceUrl, { body: { companies: ['do something'] }, headers: { 'content-type': 'application/json' } })

        const expectedActions = [
            { type: 'REQUEST_COMPANIES', loading: true  },
            { type: 'RECEIVE_COMPANIES', data: { companies: ['do something'] }, loading: false }
        ]
        const store = mockStore()

        return store.dispatch(companiesEndpoint.read()).then(() => {

            expect(store.getActions()).toEqual(expectedActions)
        })
    })

    it('create()', () => {
        const param = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"name":"Amazon"}' }

        fetchMock
            .postOnce({
                matcher: function(url, opts) {
                    expect(opts).toEqual(param)
                    return (url === companiesEndpoint.ressourceUrl);
                },
                response: {id:1,name:'Amazon'}
            })

        const store = mockStore()

        return store.dispatch(companiesEndpoint.create({name:'Amazon'})).then(() => {

            expect(store.getActions()).toEqual([{ type: 'CREATE_COMPANIES', payload: {id:1, name:'Amazon'} }])
        })
    })

    it('update()', () => {
        const param = { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{"id":1,"name":"Google"}' }

        fetchMock
            .putOnce({
                matcher: function(url, opts) {
                    expect(opts).toEqual(param)
                    return (url === (companiesEndpoint.ressourceUrl + '1'));
                },
                response: {id:1,name:'Google'}
            })

        const store = mockStore()

        return store.dispatch(companiesEndpoint.update({id:1,name:'Google'})).then(() => {

            expect(store.getActions()).toEqual([{ type: 'UPDATE_COMPANIES', payload: {id:1, name:'Google'} }])
        })
    })

    it('delete()', () => {
        const param = { method: 'DELETE', headers: { 'Content-Type': 'application/json' }}

        fetchMock
            .deleteOnce({
                matcher: function(url, opts) {
                    expect(opts).toEqual(param)
                    return (url === (companiesEndpoint.ressourceUrl + '1'));
                },
                response: {id:1}
            })

        const store = mockStore()

        return store.dispatch(companiesEndpoint.delete(1)).then(() => {

            expect(store.getActions()).toEqual([{ type: 'REMOVE_COMPANIES', payload: 1  }])
        })
    })

    it('nested', () => {
        let leadersEndpoint = testApi.endpoint('leaders')
        leadersEndpoint.nested('companies',1)
        expect(leadersEndpoint.ressourceUrl).toBe('http://127.0.0.1:3333/companies/1/leaders/');
    });

  it('nested action', () => {
    let leadersEndpoint = testApi.endpoint('leaders')
    leadersEndpoint.nested('companies',1)

    fetchMock
    .getOnce(leadersEndpoint.ressourceUrl, { body: { companies: ['do something'] }, headers: { 'content-type': 'application/json' } })

    const expectedActions = [
      { type: 'REQUEST_COMPANIES_LEADERS', loading: true  },
      { type: 'RECEIVE_COMPANIES_LEADERS', data: { companies: ['do something'] }, loading: false }
    ]

    const store = mockStore()
    return store.dispatch(leadersEndpoint.read()).then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    })
  });


  it('nested without params', () => {
    let leadersEndpoint = testApi.endpoint('leaders')
    leadersEndpoint.nested('companies')
    expect(leadersEndpoint.ressourceUrl).toBe('http://127.0.0.1:3333/companies/leaders/');
  });


    it('auth()', () => {
        let leadersEndpoint = testApi.endpoint('leaders')
        leadersEndpoint.auth()
        expect(leadersEndpoint.useJWT).toBe(true);
    });



    it('login', () => {
        let authEndpoint = testApi.endpoint('login')
        const param = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"email":"e@mail.com","password":"secret"}' }

        fetchMock
            .postOnce({
                matcher: function(url, opts) {
                    expect(opts).toEqual(param)
                    return (url === authEndpoint.ressourceUrl);
                },
                response: {token:token}
            })

        const store = mockStore()

        return store.dispatch(authEndpoint.login({email:"e@mail.com",password:"secret"})).then(() => {

            const actions = [
                { type: 'REQUEST_LOGIN', loading: true },
                { type: 'RECEIVE_LOGIN', loading: false, data: { isLogged: true }},
            ]
            expect(store.getActions()).toEqual(actions)
        })
    })

    let withAuthEndpoint = testApi.endpoint('companies')
    withAuthEndpoint.auth()

    it('read with auth', () => {
        fetchMock
            .getOnce(withAuthEndpoint.ressourceUrl, { body: { companies: ['do something'] }, headers: { 'content-type': 'application/json' } })

        const expectedActions = [
            { type: 'REQUEST_COMPANIES', loading: true  },
            { type: 'RECEIVE_COMPANIES', data: { companies: ['do something'] }, loading: false }
        ]
        const store = mockStore()

        return store.dispatch(withAuthEndpoint.read()).then(() => {

            expect(store.getActions()).toEqual(expectedActions)
        })
    })

    it('create with auth', () => {
        const param = { method: 'POST', headers: { 'Content-Type': 'application/json',Authorization: 'Bearer ' + token }, body: '{"name":"Amazon"}' }

        fetchMock
            .postOnce({
                matcher: function(url, opts) {
                    expect(opts).toEqual(param)
                    return (url === withAuthEndpoint.ressourceUrl);
                },
                response: {id:1,name:'Amazon'}
            })

        const store = mockStore()

        return store.dispatch(withAuthEndpoint.create({name:'Amazon'})).then(() => {

            expect(store.getActions()).toEqual([{ type: 'CREATE_COMPANIES', payload: {id:1, name:'Amazon'} }])
        })
    })


    it('update() with auth', () => {
        const param = { method: 'PUT', headers: { 'Content-Type': 'application/json',Authorization: 'Bearer ' + token }, body: '{"id":1,"name":"Google"}' }

        fetchMock
            .putOnce({
                matcher: function(url, opts) {
                    expect(opts).toEqual(param)
                    return (url === (withAuthEndpoint.ressourceUrl + '1'));
                },
                response: {id:1,name:'Google'}
            })

        const store = mockStore()

        return store.dispatch(withAuthEndpoint.update({id:1,name:'Google'})).then(() => {

            expect(store.getActions()).toEqual([{ type: 'UPDATE_COMPANIES', payload: {id:1, name:'Google'} }])
        })
    })

    it('delete() with auth', () => {
        const param = { method: 'DELETE', headers: { 'Content-Type': 'application/json' ,Authorization: 'Bearer ' + token }}

        fetchMock
            .deleteOnce({
                matcher: function(url, opts) {
                    expect(opts).toEqual(param)
                    return (url === (withAuthEndpoint.ressourceUrl + '1'));
                },
                response: {id:1}
            })

        const store = mockStore()

        return store.dispatch(withAuthEndpoint.delete(1)).then(() => {

            expect(store.getActions()).toEqual([{ type: 'REMOVE_COMPANIES', payload: 1  }])
        })
    })


})

