import Endpoint from './Endpoint'

/** Call a REST API and get Redux action */
class API
{
    constructor(config)
    {
        this.config = {url:'',version:''}
        if(config.version){
            this.config.version = config.version
        }
        if(config.url){
            this.config.url = config.url
        }else{
            throw "The API required an url";
        }
    }

    endpoint(resourceName){
        return new Endpoint(resourceName,this.config)
    }
}


export default API
