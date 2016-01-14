/*
 CloudRole
 */
CB.CloudRole = CB.CloudRole || function(roleName) { //calling the constructor.
    if (!this.document) this.document = {};
    this.document._tableName = 'Role';
    this.document._type = 'role';
    this.document.name = roleName;
    this.document.expires = null;
    this.document.ACL = new CB.ACL();
    this.document.expires = null;
    this.document._isModified = true;
    this.document._modifiedColumns = ['createdAt','updatedAt','ACL','name','expires'];
};

CB.CloudRole.prototype = Object.create(CB.CloudObject.prototype);

Object.defineProperty(CB.CloudRole.prototype, 'name', {
    get: function() {
        return this.document.name;
    },
    set: function(name) {
        this.document.name = name;
        CB._modified(this,name);
    }
});
