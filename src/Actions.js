/** Redux action generator */
class Actions
{
    /**
     * Create an action generator
     * @param  {string} resourceName - the name of the REST resource
     */
    constructor(resourceName)
    {
        this.resourceType = '_' + resourceName.toUpperCase()
    }
    /**
     * Action dispatch when log failed
     * @param  {Object} data - description
     * @return {Object} a redux action
     */
    errorResource(data)
    {
        return {
            type: 'ERROR' + this.resourceType,
            data : data,
            loading : false
        }
    }
    /**
     * Action dispatch when a resource is fetched
     * @return {Object} a redux action
     */
    requestResource()
    {
        return {
            type: 'REQUEST' + this.resourceType,
            loading : true
        }
    }
    /**
     * Action dispatch when a resource is received
     * @param  {Array} resources - An array of received resources
     * @return {Object} a redux action
     */
    receiveResource(resources)
    {
        return {
            type: 'RECEIVE' + this.resourceType,
            data : resources,
            loading : false
        }
    }
    /**
     * Action dispatch when a resource is added
     * @param  {Object} resource - the created resource
     * @return {Object} a redux action
     */
    addResourceSuccess(resource)
    {
        return {
            type: 'CREATE' + this.resourceType,
            payload : resource
        }
    }
    /**
     * Action dispatch when a resource is updated
     * @param  {Object} resource - the updated resource
     * @return {Object} a redux action
     */
    updateResourceSuccess (resource)
    {
        return {
            type: 'UPDATE' + this.resourceType,
            payload : resource
        }
    }
    /**
     * Action dispatch when a resource is deleted
     * @param  {Number} id - id of the deleted resource
     * @return {Object} a redux action
     */
    deleteResourceSuccess(id)
    {
        return {
            type: 'REMOVE' + this.resourceType,
            payload : id
        }
    }
}
export default Actions
