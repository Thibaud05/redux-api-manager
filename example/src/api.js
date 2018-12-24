import API from 'redux-api-manager';
let api = new API({url: process.env.REACT_APP_API_URL})

let userEndpoint = api.endpoint('users')
export {userEndpoint}