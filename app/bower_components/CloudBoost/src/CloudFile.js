/*
 CloudFiles
 */

CB.CloudFile = CB.CloudFile || function(file,data,type) {

    if (Object.prototype.toString.call(file) === '[object File]' || Object.prototype.toString.call(file) === '[object Blob]' ) {

        this.fileObj = file;
        this.document = {
            _id: null,
            _type: 'file',
            ACL: new CB.ACL(),
            name: (file && file.name && file.name !== "") ? file.name : 'unknown',
            size: file.size,
            url: null,
            expires: null,
            contentType : (typeof file.type !== "undefined" && file.type !== "") ? file.type : 'unknown'
        };

    } else if(typeof file === "string") {
        var regexp = RegExp("https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,}");
        if (regexp.test(file)) {
            this.document = {
                _id: null,
                _type: 'file',
                ACL: new CB.ACL(),
                name: '',
                size: '',
                url: file,
                expires: null,
                contentType : ''
            };
        } else{
            if(data){
                this.data = data;
                if(!type){
                    type = file.split('.')[file.split('.').length-1];
                }
                this.document = {
                    _id: null,
                    _type: 'file',
                    ACL: new CB.ACL(),
                    name: file,
                    size: '',
                    url: null,
                    expires: null,
                    contentType : type
                };
            }else{
                this.document = {
                    _id: file,
                    _type: 'file'
                }
            }
        }
    } 
};

CB.CloudFile.prototype = Object.create(CB.CloudObject.prototype);

Object.defineProperty(CB.CloudFile.prototype, 'type', {
    get: function() {
        return this.document.contentType;
    },
    set: function(type) {
        this.document.contentType = type;
    }
});

Object.defineProperty(CB.CloudFile.prototype, 'url', {
    get: function() {
        return this.document.url;
    },
    set: function(url) {
        this.document.url = url;
    }
});

Object.defineProperty(CB.CloudFile.prototype, 'size', {
    get: function() {
        return this.document.size;
    },
    set: function(size) {
        this.document.size = size;
    }
});

Object.defineProperty(CB.CloudFile.prototype, 'name', {
    get: function() {
        return this.document.name;
    },
    set: function(name) {
        this.document.name = name;
    }
});

/**
 * Uploads File
 *
 * @param callback
 * @returns {*}
 */

CB.CloudFile.prototype.save = function(callback) {

    var def;

    if (!callback) {
        def = new CB.Promise();
    }

    var thisObj = this;

    if(!this.fileObj && !this.data)
        throw "You cannot save a file which is null";

    if(!this.data) {
        var params = new FormData();
        params.append("fileToUpload", this.fileObj);
        params.append("key", CB.appKey);
        params.append("fileObj",JSON.stringify(CB.toJSON(thisObj)));
        var url = CB.serverUrl + '/file/' + CB.appId;
        CB._request('POST',url,params,false,true).then(function(response){
            thisObj.document = JSON.parse(response);
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
    }else{
        var data = this.data;
        var params=JSON.stringify({
            data: data,
            fileObj:CB.toJSON(this),
            key: CB.appKey
        });
        url = CB.serverUrl + '/file/' + CB.appId ;
        CB._request('POST',url,params).then(function(response){
            thisObj.document = JSON.parse(response);
            delete thisObj.data;
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
    }


    if (!callback) {
        return def;
    }
};

/**
 * Removes a file from Database.
 *
 * @param callback
 * @returns {*}
 */


CB.CloudFile.prototype.delete = function(callback) {
    var def;

    if(!this.url) {
        throw "You cannot delete a file which does not have an URL";
    }
    if (!callback) {
        def = new CB.Promise();
    }
    var thisObj = this;

    var params=JSON.stringify({
        fileObj: CB.toJSON(thisObj),
        key: CB.appKey
    });
    var url = CB.serverUrl+'/file/' + CB.appId + '/' + this.document._id ;

    CB._request('DELETE',url,params).then(function(response){
        thisObj.url = null;
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


CB.CloudFile.prototype.getFileContent = function(callback){

    var def;

    if(!this.url) {
        throw "Url is Null";
    }
    if (!callback) {
        def = new CB.Promise();
    }

    var params=JSON.stringify({
        key: CB.appKey
    });
    var url = CB.serverUrl+'/file/' + CB.appId + '/' + this.document._id  ;

    CB._request('POST',url,params).then(function(response){
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
