/*
 Column.js
 */

 CB.Column = function(columnName, dataType, required, unique){
   this.document = {};
   if(columnName){
     CB._columnNameValidation(columnName);
     this.document.name = columnName;
     this.document._type = 'column';
   }

   if(dataType){
     CB._columnDataTypeValidation(dataType);
     this.document.dataType = dataType;
   }else{
     this.document.dataType = "Text";
   }

   if(typeof(required) === 'boolean')
     this.document.required = required;
   else
     this.document.required = false;

   if(typeof(unique) === 'boolean')
     this.document.unique = unique;
   else
     this.document.unique = false;
   this.document.relatedTo = null;
   this.document.relationType = null;

   this.document.isDeletable = true;
   this.document.isEditable = true;
   this.document.isRenamable = false;

};

Object.defineProperty(CB.Column.prototype,'name',{
    get: function() {
        return this.document.name;
    },
    set: function(name) {
        this.document.name = name;
    }
});

Object.defineProperty(CB.Column.prototype,'dataType',{
    get: function() {
        return this.document.dataType;
    },
    set: function(dataType) {
        this.document.dataType = dataType;
    }
});


Object.defineProperty(CB.Column.prototype,'unique',{
    get: function() {
        return this.document.unique;
    },
    set: function(unique) {
        this.document.unique = unique;
    }
});


Object.defineProperty(CB.Column.prototype,'relatedTo',{
    get: function() {
        return this.document.relatedTo;
    },
    set: function(relatedTo) {
        this.document.relatedTo = relatedTo;
    }
});

Object.defineProperty(CB.Column.prototype,'required',{
    get: function() {
        return this.document.required;
    },
    set: function(required) {
        this.document.required = required;
    }
});
