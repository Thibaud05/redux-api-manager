import { combineReducers } from 'redux'

function users(state = {loading:false,data:[]}, action) {
    switch (action.type) {
        case 'REQUEST_USERS':
            return {loading:true,data:[]}
        case 'RECEIVE_USERS':
            if(action.data){
                return {loading:false,data:action.data}
            }else{
                return "error"
            }
        default:
            return state
    }
}

const rootReducer = combineReducers({
    users,
})

export default rootReducer