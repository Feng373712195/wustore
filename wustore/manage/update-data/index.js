
class UpdateData{
    constructor(){
        this.updateMap = new Map()
        this.pageComponentsUpdateMap = new Map();
    }
    // 页面todoUpdate
    todoUpdateData(webview,todo,isComponent,component){
        const updateWebvieId = webview.data.__webviewId__

        let todoUpdate = isComponent ? 
                         this.getUpdataData(updateWebvieId, component.__wxExparserNodeId__) :
                         this.getUpdataData(updateWebvieId) 

        Object.keys(todo).forEach(key => {
            if( ( isComponent ? component : webview ).__mapstorekey.indexOf(key) != -1 ){
                !todoUpdate[key] && (todoUpdate[key] = {})
                Object.assign( todoUpdate[key],todo[key] )
            }
        })
        
    }
    clearUpdateData(webviewId){
        this.updateMap.set(webviewId,{})
        this.cleanComponentsUpdate(webviewId)
    }
    cleanComponentsUpdate(webviewId){
        const pageComponentsUpdateMap = this.pageComponentsUpdateMap.get( webviewId )
        if( !pageComponentsUpdateMap ) return;
        for( let [ componentId,componentUpdata ] of pageComponentsUpdateMap ){
            pageComponentsUpdateMap.set( componentId, {} )
        }
    }
    getUpdataData(webviewId,nodeId){

        if( nodeId ){
            if( this.pageComponentsUpdateMap.has( webviewId ) ){
                if( this.pageComponentsUpdateMap.get(webviewId).has(nodeId) ){
                   return this.pageComponentsUpdateMap.get(webviewId).get(nodeId)
                }else{
                    this.pageComponentsUpdateMap.get(webviewId).set(nodeId,{})
                    return this.pageComponentsUpdateMap.get(webviewId).get(nodeId)
                }
            }else{
                this.pageComponentsUpdateMap.set(webviewId,new Map());
                this.pageComponentsUpdateMap.get(webviewId).set(nodeId,{})
                return this.pageComponentsUpdateMap.get(webviewId).get(nodeId)
            }
            return;
        }

        // 有则返回 没有创建一个新的map 返回
        if( this.updateMap.has( webviewId ) ){
            const retUpdateMap = this.updateMap.get(webviewId)
            return retUpdateMap
        }else{
            this.updateMap.set(webviewId,{})
            return this.updateMap.get(webviewId)
        }
    }
    setUpdataData(webviewId,dataPath,dataRoot,clean,newval,nodeId){

        const todoUpdate = nodeId ? 
                           this.getUpdataData( webviewId,nodeId ) :
                           this.getUpdataData( webviewId )

        if(todoUpdate[dataRoot]){
            !todoUpdate[dataRoot] && (todoUpdate[dataRoot] = {})
            // 修改了引用类型 对之前对这个引用类型的值更新清楚 
            if(clean){
                Object.keys(todoUpdate[dataRoot]).forEach(key => {
                    // new RegExp(`^store.${dataPath}`).test(key) && delete todoUpdate[dataRoot][key]
                    new RegExp(`^${dataPath}`).test(key) && delete todoUpdate[dataRoot][key]
                })
            }
            // Object.assign( todoUpdate[dataRoot],{ [`store.${dataPath}`]:newval } )
            Object.assign( todoUpdate[dataRoot],{ [`${dataPath}`]:newval } )
        }else{
            // todoUpdate[dataRoot] = { [`store.${dataPath}`]:newval }
            todoUpdate[dataRoot] = { [`${dataPath}`]:newval }
        }
    }
    removeUpdateData(webviewId){
        this.updateMap.delete(webviewId)
         // 删除页面相关组件 update
         this.pageComponentsUpdateMap.delete(webviewId)
    }
}

export default new UpdateData()