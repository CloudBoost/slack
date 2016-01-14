/*
 CloudCache
 */

CB.CloudCache = function(cacheName){
  if(typeof cacheName === 'undefined' || cacheName === null || cacheName === ''){
        throw "Cannot create a cache with empty name";
    }
    this.document = {};
    this.document._tableName = "cache";
    this.document.name = cacheName;
    this.document.size = "";
    this.document.items = [];
};

Object.defineProperty(CB.CloudCache.prototype, 'name', {
    get: function() {
        return this.document.name;
    }
});

Object.defineProperty(CB.CloudCache.prototype, 'size', {
    get: function() {
        return this.document.size;
    }
});

Object.defineProperty(CB.CloudCache.prototype, 'items', {
    get: function() {
        return this.document.items;
    }
});

CB.CloudCache.prototype.set = function(key, value, callback){
  var def;
  CB._validate();

  if (!callback) {
      def = new CB.Promise();
  }

  if(typeof value === 'undefined'){
    throw "Value cannot be undefined.";
  }

  var params=JSON.stringify({
      key: CB.appKey,
      item:  value
  });

  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name+'/'+key;
  CB._request('PUT',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    
    var obj = CB.fromJSON(response);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
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

CB.CloudCache.prototype.deleteItem = function(key, callback){
  var def;
  CB._validate();

  if (!callback) {
      def = new CB.Promise();
  }


  var params=JSON.stringify({
      key: CB.appKey
  });

  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name+'/item/'+key;
  CB._request('DELETE',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    
    var obj = CB.fromJSON(response);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
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


CB.CloudCache.prototype.create = function(callback){
  var def;
  CB._validate();

  if (!callback) {
      def = new CB.Promise();
  }

  var params=JSON.stringify({
      key: CB.appKey
  });

  var thisObj= this;

  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name+'/create';
  CB._request('POST',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response,thisObj);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
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

CB.CloudCache.prototype.get = function(key, callback){

    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

  var params=JSON.stringify({
      key: CB.appKey
  });


  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name+'/'+key+'/item';
  CB._request('POST',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
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


CB.CloudCache.prototype.getInfo = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

  var params=JSON.stringify({
      key: CB.appKey
  });

  var thisObj= this;

  var url = CB.apiUrl+'/cache/'+CB.appId +'/'+this.document.name;
  CB._request('POST',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response, thisObj);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
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

CB.CloudCache.prototype.getItemsCount = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

  var params=JSON.stringify({
      key: CB.appKey
  });

  var url = CB.apiUrl+'/cache/'+CB.appId +'/'+this.document.name+'/items/count';
  CB._request('POST',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
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

CB.CloudCache.prototype.getAll = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

     var thisObj= this;

  var params=JSON.stringify({
      key: CB.appKey
  });
  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name+'/items';
  CB._request('POST',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response);
    thisObj.items = obj;
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
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


CB.CloudCache.prototype.clear = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

  var params=JSON.stringify({
      key: CB.appKey
  });

  var thisObj = this;

  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name+'/clear';
  CB._request('DELETE',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response, thisObj);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
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


CB.CloudCache.prototype.delete = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

  var params=JSON.stringify({
      key: CB.appKey
  });

  var thisObj = this;

  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name;
  CB._request('DELETE',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response, thisObj);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
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

CB.CloudCache.getAll = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

  var params=JSON.stringify({
      key: CB.appKey
  });

  var url = CB.apiUrl+'/cache/'+CB.appId;
  CB._request('POST',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
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

CB.CloudCache.deleteAll = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var params=JSON.stringify({
        key: CB.appKey
    });

    var url = CB.apiUrl+'/cache/'+CB.appId;
    CB._request('DELETE',url,params,true).then(function(response){
      if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
      var obj = CB.fromJSON(response);
      if (callback) {
          callback.success(obj);
      } else {
          def.resolve(obj);
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