/*
 CloudObject
 */

CB.CloudObject = function(tableName, id) { //object for documents

    this.document = {};
    this.document._tableName = tableName; //the document object
    this.document.ACL = new CB.ACL(); //ACL(s) of the document
    this.document._type = 'custom';
    this.document.expires = null;
    this.document._hash = CB._generateHash();

    if(!id){
        this.document._modifiedColumns = ['createdAt','updatedAt','ACL','expires'];
        this.document._isModified = true;
    }
    else{
        this.document._modifiedColumns = [];
        this.document._isModified = false;
        this.document._id = id;
    }   
};

Object.defineProperty(CB.CloudObject.prototype, 'ACL', {
    get: function() {
        return this.document.ACL;
    },
    set: function(ACL) {
        this.document.ACL = ACL;
        this.document.ACL.parent = this;
        CB._modified(this,'ACL');
    }
});

Object.defineProperty(CB.CloudObject.prototype, 'id', {
    get: function() {
        return this.document._id;
    }
});

Object.defineProperty(CB.CloudObject.prototype, 'createdAt', {
    get: function() {
        return this.document.createdAt;
    },
    set: function(createdAt) {
        this.document.createdAt = createdAt;
        CB._modified(this,'createdAt');
    }
});

Object.defineProperty(CB.CloudObject.prototype, 'updatedAt', {
    get: function() {
        return this.document.updatedAt;
    },
    set: function(updatedAt) {
        this.document.updatedAt = updatedAt;
        CB._modified(this,'updatedAt');
    }
});


/* For Expire of objects */
Object.defineProperty(CB.CloudObject.prototype, 'expires', {
    get: function() {
        return this.document.expires;
    },
    set: function(expires) {
        this.document.expires = expires;
        CB._modified(this,'expires');
    }
});

/* This is Real time implementation of CloudObjects */
CB.CloudObject.on = function(tableName, eventType, cloudQuery, callback, done) {

    var def;

    //shift variables.
    if(cloudQuery && !(cloudQuery instanceof CB.CloudQuery)){
        //this is a function.
        if(callback !== null && typeof callback === 'object'){
            //callback is actually done.
            done = callback;
            callback = null;
        }
        callback = cloudQuery;
        cloudQuery = null;
    }

    if (!done) {
        def = new CB.Promise();
    }

    //validate query.
    if(cloudQuery && cloudQuery instanceof CB.CloudQuery){

        if(cloudQuery.tableName!== tableName){
            throw "CloudQuery TableName and CloudNotification TableName should be same.";
        }

        if(cloudQuery.query){
            if(cloudQuery.query.$include.length>0){
                throw "Include with CloudNotificaitons is not supported right now.";
            }
        }

        if(Object.keys(cloudQuery.select).length > 0){
            throw "You cannot pass the query with select in CloudNotifications.";
        }
    }

    tableName = tableName.toLowerCase();

    if (eventType instanceof Array) {
        //if event type is an array.
        for(var i=0;i<eventType.length;i++){
            CB.CloudObject.on(tableName, eventType[i], cloudQuery, callback);
            if(done && done.success)
                done.success();
            else
                def.resolve();
        }
    } else {
        eventType = eventType.toLowerCase();
        if(eventType==='created' || eventType === 'updated' || eventType === 'deleted'){

            var payload = {
                room :(CB.appId+'table'+tableName+eventType).toLowerCase(),
                sessionId : CB._getSessionId()
            };

            CB.Socket.emit('join-object-channel',payload);
            CB.Socket.on((CB.appId+'table'+tableName+eventType).toLowerCase(), function(data){ //listen to events in custom channel.
                data = CB.fromJSON(data);
                if(cloudQuery && cloudQuery instanceof CB.CloudQuery && CB.CloudObject._validateNotificationQuery(data, cloudQuery))
                    callback(data);
                else if(!cloudQuery)
                    callback(data);
            });

            if(done && done.success)
                done.success();
            else
                def.resolve();
        }else{
            throw 'created, updated, deleted are supported notification types.';
        }
    }

    if (!done) {
        return def;
    }
};

CB.CloudObject.off = function(tableName, eventType, done) {

    var def;

    if (!done) {
        def = new CB.Promise();
    }

    tableName = tableName.toLowerCase();

    if (eventType instanceof Array) {
        //if event type is an array.
        for(var i=0;i<eventType.length;i++){
            CB.CloudObject.off(tableName, eventType[i]);
            if(done && done.success)
                done.success();
            else
                def.resolve();
        }
    } else {

        eventType = eventType.toLowerCase();

        if(eventType==='created' || eventType === 'updated' || eventType === 'deleted'){
            CB.Socket.emit('leave-object-channel',(CB.appId+'table'+tableName+eventType).toLowerCase());
            CB.Socket.removeAllListeners((CB.appId+'table'+tableName+eventType).toLowerCase());
            if(done && done.success)
                done.success();
            else
                def.resolve();
        }else{
            throw 'created, updated, deleted are supported notification types.';
        }
    }

    if (!done) {
        return def;
    }
};

/* RealTime implementation ends here.  */

CB.CloudObject.prototype.set = function(columnName, data) { //for setting data for a particular column

    var keywords = ['_tableName', '_type', 'operator'];

    if(columnName=== 'id' || columnName === '_id')
        throw "You cannot set the id of a CloudObject";

    if (columnName === 'id')
        columnName = '_' + columnName;

    if (keywords.indexOf(columnName) > -1) {
        throw columnName + " is a keyword. Please choose a different column name.";
    }
    this.document[columnName] = data;
    CB._modified(this,columnName);
};


CB.CloudObject.prototype.relate = function(columnName, objectTableName, objectId) { //for setting data for a particular column

    var keywords = ['_tableName', '_type', 'operator'];

    if(columnName=== 'id' || columnName === '_id')
        throw "You cannot set the id of a CloudObject";

    if (columnName === 'id')
        throw "You cannot link an object to this column";

    if (keywords.indexOf(columnName) > -1) {
        throw columnName + " is a keyword. Please choose a different column name.";
    }

    this.document[columnName] = new CB.CloudObject(objectTableName,objectId);
    CB._modified(this,columnName);
};


CB.CloudObject.prototype.get = function(columnName) { //for getting data of a particular column

    if (columnName === 'id')
        columnName = '_' + columnName;

    return this.document[columnName];

};

CB.CloudObject.prototype.unset = function(columnName) { //to unset the data of the column
    this.document[columnName] = null;
    CB._modified(this,columnName);
};

/**
 * Saved CloudObject in Database.
 * @param callback
 * @returns {*}
 */

CB.CloudObject.prototype.save = function(callback) { //save the document to the db
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }
    var thisObj = this;
    CB._fileCheck(this).then(function(thisObj){

        var xmlhttp = CB._loadXml();
        var params=JSON.stringify({
            document: CB.toJSON(thisObj),
            key: CB.appKey
        });
        var url = CB.apiUrl + "/data/" + CB.appId + '/'+thisObj.document._tableName;
        CB._request('PUT',url,params).then(function(response){
            thisObj = CB.fromJSON(JSON.parse(response),thisObj);
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });

    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
    if (!callback) {
        return def;
    }
};

CB.CloudObject.prototype.fetch = function(callback) { //fetch the document from the db
    if (!CB.appId) {
        throw "CB.appId is null.";
    }
    if (!this.document._id) {
        throw "Can't fetch an object which is not saved."
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    var query = null;
    if(thisObj.document._type === 'file'){
        query = new CB.CloudQuery('File');
    }else{
        query = new CB.CloudQuery(thisObj.document._tableName);
    }
    query.findById(thisObj.get('id')).then(function(res){
        if(!callback){
            def.resolve(res);
        }else{
            callback.success(res);
        }
    },function(err){
        if(!callback){
            def.reject(err);
        }else{
            callback.error(err);
        }
    });


    if (!callback) {
        return def;
    }

};

CB.CloudObject.prototype.delete = function(callback) { //delete an object matching the objectId
    if (!CB.appId) {
        throw "CB.appId is null.";
    }
    if (!this.document._id) {
        throw "You cannot delete an object which is not saved."
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    var params=JSON.stringify({
        key: CB.appKey,
        document: CB.toJSON(thisObj)
    });
    var url = CB.apiUrl + "/data/" + CB.appId +'/'+thisObj.document._tableName;

    CB._request('DELETE',url,params).then(function(response){
        if (callback) {
            callback.success(response);
        } else {
            def.resolve(response);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
};

CB.CloudObject.saveAll = function(array,callback){

    if(!array || array.constructor !== Array){
        throw "Array of CloudObjects is Null";
    }

    for(var i=0;i<array.length;i++){
        if(!(array[i] instanceof CB.CloudObject)){
            throw "Should Be an Array of CloudObjects";
        }
    }

    var def;
    if(!callback){
        def = new CB.Promise();
    }

    CB._bulkObjFileCheck(array).then(function(){
        var xmlhttp = CB._loadXml();
        var params=JSON.stringify({
            document: CB.toJSON(array),
            key: CB.appKey
        });
        var url = CB.apiUrl + "/data/" + CB.appId + '/'+array[0]._tableName;
        CB._request('PUT',url,params).then(function(response){
            var thisObj = CB.fromJSON(JSON.parse(response));
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });

    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }

};

CB.CloudObject.deleteAll = function(array,callback){

    if(!array && array.constructor !== Array){
        throw "Array of CloudObjects is Null";
    }

    for(var i=0;i<array.length;i++){
        if(!(array[i] instanceof CB.CloudObject)){
            throw "Should Be an Array of CloudObjects";
        }
    }

    var def;
    if(!callback){
        def = new CB.Promise();
    }

    var xmlhttp = CB._loadXml();
    var params=JSON.stringify({
        document: CB.toJSON(array),
        key: CB.appKey
    });
    var url = CB.apiUrl + "/data/" + CB.appId + '/'+array[0]._tableName;
    CB._request('DELETE',url,params).then(function(response){
        var thisObj = CB.fromJSON(JSON.parse(response));
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }

};

/* Private Methods */
CB.CloudObject._validateNotificationQuery = function(cloudObject, cloudQuery) { //delete an object matching the objectId

   if(!cloudQuery)
        throw "CloudQuery is null";

    if(!cloudQuery.query)
        throw "There is no query in CloudQuery";

   //validate query.
   var query = cloudQuery.query;

   if(cloudQuery.limit===0)
        return false;

   if(cloudQuery.skip>0){
        --cloudQuery.skip;
        return false;
    }


   //delete include
   delete query.$include;

   if(CB.CloudQuery._validateQuery(cloudObject, query)){
        //redice limit of CloudQuery.
       --cloudQuery.limit;
       return true;
   }else{
    return false;
   }
};

