/*
 CloudUser
 */
CB.CloudUser = CB.CloudUser || function() {
    if (!this.document) this.document = {};
    this.document._tableName = 'User';
    this.document.expires = null;
    this.document._type = 'user';
    this.document.expires = null;
    this.document.ACL = new CB.ACL();
    this.document._isModified = true;
    this.document._modifiedColumns = ['createdAt','updatedAt','ACL','expires'];
};

CB.CloudUser.prototype = Object.create(CB.CloudObject.prototype);

Object.defineProperty(CB.CloudUser.prototype, 'username', {
    get: function() {
        return this.document.username;
    },
    set: function(username) {
        this.document.username = username;
        CB._modified(this,'username');
    }
});
Object.defineProperty(CB.CloudUser.prototype, 'password', {
    get: function() {
        return this.document.password;
    },
    set: function(password) {
        this.document.password = password;
        CB._modified(this,'password');
    }
});
Object.defineProperty(CB.CloudUser.prototype, 'email', {
    get: function() {
        return this.document.email;
    },
    set: function(email) {
        this.document.email = email;
        CB._modified(this,'email');
    }
});

CB.CloudUser.current = new CB.CloudUser();

CB.CloudUser.prototype.signUp = function(callback) {

    if(CB._isNode){
        throw "Error : You cannot signup the user on the server. Use CloudUser.save() instead.";
    }

    if (!this.document.username) {
        throw "Username is not set.";
    }
    if (!this.document.password) {
        throw "Password is not set.";
    }
    if (!this.document.email) {
        throw "Email is not set.";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the signup API.
    var params=JSON.stringify({
        document: CB.toJSON(thisObj),
        key: CB.appKey
    });
    url = CB.apiUrl + "/user/" + CB.appId + "/signup" ;

    CB._request('POST',url,params).then(function(response){
        CB.fromJSON(JSON.parse(response),thisObj);
        CB.CloudUser.current = thisObj;
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
CB.CloudUser.prototype.logIn = function(callback) {

    if(CB._isNode){
        throw "Error : You cannot login the user on the server.";
    }

    if (!this.document.username) {
        throw "Username is not set.";
    }
    if (!this.document.password) {
        throw "Password is not set.";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the signup API.
    var params=JSON.stringify({
        document: CB.toJSON(thisObj),
        key: CB.appKey
    });
    url = CB.apiUrl + "/user/" + CB.appId + "/login" ;

    CB._request('POST',url,params).then(function(response){
        thisObj = CB.fromJSON(JSON.parse(response),thisObj);
        CB.CloudUser.current = thisObj;
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
CB.CloudUser.prototype.logOut = function(callback) {

    if(CB._isNode){
        throw "Error : You cannot logOut the user on the server.";
    }

    if (!this.document.username) {
        throw "Username is not set.";
    }
    if (!this.document.password) {
        throw "Password is not set.";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the logout API.
    var params=JSON.stringify({
        document: CB.toJSON(thisObj),
        key: CB.appKey
    });
    url = CB.apiUrl + "/user/" + CB.appId + "/logout" ;

    CB._request('POST',url,params).then(function(response){
        CB.fromJSON(JSON.parse(response),thisObj);
        CB.CloudUser.current = null;
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
CB.CloudUser.prototype.addToRole = function(role, callback) {
    if (!role) {
        throw "Role is null";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //Call the addToRole API
    var params=JSON.stringify({
        user: CB.toJSON(thisObj),
        role: CB.toJSON(role),
        key: CB.appKey
    });
    url = CB.apiUrl + "/user/" + CB.appId + "/addToRole" ;

    CB._request('PUT',url,params).then(function(response){
        CB.fromJSON(JSON.parse(response),thisObj);
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
CB.CloudUser.prototype.isInRole = function(role) {
    if (!role) {
        throw "role is null";
    }
    return (this.get('roles').indexOf(role.document._id) >= 0);
};
CB.CloudUser.prototype.removeFromRole = function(role, callback) {
    if (!role) {
        throw "Role is null";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the removeFromRole API.
    var params=JSON.stringify({
        user: CB.toJSON(thisObj),
        role: CB.toJSON(role),
        key: CB.appKey
    });
    url = CB.apiUrl + "/user/" + CB.appId + "/removeFromRole" ;

    CB._request('PUT',url,params).then(function(response){
        CB.fromJSON(JSON.parse(response),thisObj);
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