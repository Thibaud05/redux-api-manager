# redux-api-manager

> Centralize API management and simplify calls

[![NPM](https://img.shields.io/npm/v/redux-api-manager.svg)](https://www.npmjs.com/package/redux-api-manager) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save redux-api-manager
```

## Usage


### create, update, read and delete a ressource

```javascript
import API from 'redux-api-manager';

let api = new API({url: 'http://api.awesome.com'})

//Create endpoint
let companyEndpoint = api.endpoint('companies')

companyEndpoint.create({name:'Amazon'})
// HTTPS POST api.awesome.com/companies and dispatch CREATE_COMPANIES

companyEndpoint.update({id:1,name:'Google'})
// HTTPS PUT api.awesome.com/companies and dispatch UPDATE_COMPANIES

companyEndpoint.read()
// HTTPS GET api.awesome.com/companies, dispatch REQUEST_COMPANIES and RECEIVE_COMPANIES

companyEndpoint.delete(1)
// HTTPS DELETE api.awesome.com/companies/1 and dispatch REMOVE_COMPANIES
```

### JWT authentification
```javascript
const credential = {email: 'e@mail.com', password: 'secure'}
let authEndpoint = api.endpoint('auth')
authEndpoint.login(credential)
// HTTPS POST api.awesome.com/login, dispatch REQUEST_AUTH and RECEIVE_AUTH
// Store the token in the localStorage

let companyEndpoint = api.endpoint('companies')
companyEndpoint.auth()
companyEndpoint.get()
// HTTPS GET api.awesome.com/companies, dispatch REQUEST_COMPANIES and RECEIVE_COMPANIES
```

### Nested route
```javascript
let companyLeaders = api.endpoint('leaders')
companyLeaders.nested('companies',1)

companyLeaders.create({name:'Larry Page'})
// HTTPS POST api.awesome.com/companies/1/leaders and dispatch CREATE_LEADERS

companyLeaders.update({id:1,name:'Sundar Pichai'})
// HTTPS PUT api.awesome.com/companies/1/leaders and dispatch UPDATE_LEADERS

companyLeaders.read()
// HTTPS GET api.awesome.com/companies/1/leaders, dispatch REQUEST_LEADERS and RECEIVE_LEADERS

companyLeaders.delete(1)
// HTTPS DELETE api.awesome.com/companies/1/leaders/1 and dispatch REMOVE_LEADERS
```

### File upload
```javascript
let companyEndpoint = api.endpoint('companies')
const useJson = false
const pictureFile = event.target.files[0]
// get the picture file with onChange on <imput type="file" onChange={onChangeFile} >
companyEndpoint.create({name:'Larry Page',picture:pictureFile},useJson)
// HTTPS POST api.awesome.com/companies/1/leaders and dispatch CREATE_LEADERS
```


## License

MIT © [Thibaud05](https://github.com/Thibaud05)


