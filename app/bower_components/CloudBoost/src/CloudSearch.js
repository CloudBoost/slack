
CB.SearchFilter = function(){

    this.bool = {};
    this.bool.must = []; //and
    this.bool.should = []; //or
    this.bool.must_not = []; //not
    this.$include = []; //include
};


CB.SearchFilter.prototype.notEqualTo = function(columnName, data) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    //data can bean array too!
    var term = {};
    if (data instanceof Array) {
        term.terms = {};
        term.terms[columnName] = data;
    } else {
        term.term = {};
        term.term[columnName] = data;
    }

    this.bool.must_not.push(term);

    return this;

};

CB.SearchFilter.prototype.equalTo = function(columnName, data) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var term = {};
    if (data instanceof Array) {
        term.terms = {};
        term.terms[columnName] = data;
    } else {
        if(data !== null) {
            if (data.constructor === CB.CloudObject) {
                data = data.get('id');
                term.nested = {};
                term.nested.path = columnName;
                term.nested.filter = {};
                term.nested.filter.term = {};
                term.nested.filter.term[columnName+'._id'] = data;
            }else{
                term.term = {};
                term.term[columnName] = data;
            }
        }else{
            term.term[columnName] = data;
        }
    }

    this.bool.must.push(term);

    return this;
};

CB.SearchFilter.prototype.exists = function(columnName) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var obj = {};
    obj.exists = {};
    obj.exists.field = columnName;

    this.bool.must.push(obj);

    return this;
};

CB.SearchFilter.prototype.doesNotExist = function(columnName) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var obj = {};
    obj.missing = {};
    obj.missing.field = columnName;

    this.bool.must.push(obj);

    return this;
};

CB.SearchFilter.prototype.greaterThanOrEqual = function(columnName, data) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var obj = {};
    obj.range = {};
    obj.range[columnName] = {};
    obj.range[columnName]['gte'] = data;

    this.bool.must.push(obj);

    return this;
};

CB.SearchFilter.prototype.greaterThan = function(columnName, data) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var obj = {};
    obj.range = {};
    obj.range[columnName] = {};
    obj.range[columnName]['gt'] = data;

    this.bool.must.push(obj);

    return this;
};

CB.SearchFilter.prototype.lessThan = function(columnName, data) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var obj = {};
    obj.range = {};
    obj.range[columnName] = {};
    obj.range[columnName]['lt'] = data;

    this.bool.must.push(obj);

    return this;
};

CB.SearchFilter.prototype.lessthanOrEqual = function(columnName, data) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var obj = {};
    obj.range = {};
    obj.range[columnName] = {};
    obj.range[columnName]['lte'] = data;

    this.bool.must.push(obj);

    return this;
};

CB.SearchFilter.prototype.near = function(columnName,geoPoint,distance){

    var obj = {};
    obj.geo_distance = {};

    //distance is in meters here in accordance with what we have in Mongo

    obj.geo_distance.distance = distance.toString() + ' m';
    obj.geo_distance[columnName] = geoPoint.document.coordinates;

    this.bool.must.push(obj);
};

//And logical function. 
CB.SearchFilter.prototype.and = function(searchFilter) {

    if(searchFilter.$include.length>0){
        throw "You cannot have an include over AND. Have an CloudSearch Include over parent SearchFilter instead.";
    }

    delete searchFilter.$include;

    if(!searchFilter instanceof CB.SearchFilter){
        throw "data should be of type CB.SearchFilter";
    }

    this.bool.must.push(searchFilter);

    return this;
};

//OR Logical function
CB.SearchFilter.prototype.or = function(searchFilter) {

    if(searchFilter.$include.length>0){
        throw "You cannot have an include over OR. Have an CloudSearch Include over parent SearchFilter instead.";
    }

    delete searchFilter.$include;

    if(!searchFilter instanceof CB.SearchFilter){
        throw "data should be of type CB.SearchFilter";
    }

    this.bool.should.push(searchFilter);

    return this;
};


//NOT logical function
CB.SearchFilter.prototype.not = function(searchFilter) {

    if(searchFilter.$include.length>0){
        throw "You cannot have an include over NOT. Have an CloudSearch Include over parent SearchFilter instead.";
    }

    delete searchFilter.$include;

   if(!searchFilter instanceof CB.SearchFilter){
        throw "data should be of type CB.SearchFilter";
   }

   this.bool.must_not.push(searchFilter);

   return this;
};

CB.SearchFilter.prototype.include = function (columnName) {
    if (columnName === 'id')
        columnName = '_' + columnName;

    this.$include.push(columnName);

    return this;
};


/* This is Search Query*/

CB.SearchQuery = function(){
    this.bool = {};
    this.bool.must = []; //and
    this.bool.should = []; //or
    this.bool.must_not = []; //not
};

CB.SearchQuery.prototype._buildSearchPhrase = function(columns, query, slop, boost) {

    var obj = this._buildSearchOn(columns, query, null, null,null,boost);

     if (columns instanceof Array) {
        obj.multi_match.type = 'phrase';
        if(slop){
            obj.multi_match.slop = slop;
        }
     } else {
        obj.match[columns].type = 'phrase';
        if(slop){
            obj.match[columns].slop = slop;
        }
     }

     return obj;

}


CB.SearchQuery.prototype._buildBestColumns = function(columns, query, fuzziness, operator, match_percent, boost) {

    var obj = this._buildSearchOn(columns, query, fuzziness, operator, match_percent, boost);

     if (columns instanceof Array) {
        obj.multi_match.type = 'best_fields';
     } else {
        obj.match[columns].type = 'best_fields';
     }

     return obj;
};

CB.SearchQuery.prototype._buildMostColumns = function(columns, query, fuzziness,  operator, match_percent, boost) {

    var obj = this._buildSearchOn(columns, query, fuzziness, operator, match_percent, boost);

     if (columns instanceof Array) {
        obj.multi_match.type = 'most_fields';
     } else {
        obj.match[columns].type = 'most_fields';
     }

     return obj;
};

CB.SearchQuery.prototype._buildSearchOn = function(columns, query, fuzziness, operator, match_percent, boost) {

    var obj = {};

        if (columns instanceof Array) {
            //if columns is an array.
            obj.multi_match = {};
            obj.multi_match.query = query;
            obj.multi_match.fields = columns;
            
            if (operator) {
                obj.multi_match.operator = operator;
            } 

            if(match_percent){
                obj.multi_match.minimum_should_match = match_percent;
            }
            
            if(boost){
                obj.multi_match.boost = boost;
            }

            if(fuzziness){
                obj.multi_match.fuzziness = fuzziness;
            }

        } else {

            obj.match = {};
            obj.match[columns] = {};
            obj.match[columns].query = query;
            
            if (operator) {
                obj.match[columns].operator = operator;
            }

            if(match_percent){
                obj.match[columns].minimum_should_match = match_percent;
            }

            if(boost){
                obj.match[columns].boost = boost;
            }

            if(fuzziness){
                obj.match[columns].fuzziness = fuzziness;
            }
        }

        return obj;

}

CB.SearchQuery.prototype.searchOn = function(columns, query, fuzziness, all_words, match_percent, priority) {

    //this is actually 'operator'
    if(all_words){
        all_words='and';
    }
        
    var obj = this._buildSearchOn(columns,query, fuzziness,all_words,match_percent,priority);
    //save in query 'and' clause.
    this.bool.should.push(obj); 

    return this;
    
};

CB.SearchQuery.prototype.phrase = function(columns, query,fuzziness, priority) {

        
    var obj = this._buildSearchPhrase(columns, query,fuzziness, priority);
    //save in query 'and' clause.
    this.bool.should.push(obj); 

    return this;
};

CB.SearchQuery.prototype.bestColumns = function(columns, query, fuzziness, all_words, match_percent, priority) {

    if(!columns instanceof Array || columns.length<2)
           throw "There should be more than one columns in-order to use this function";

    if(all_words){
        all_words='and';
    }

    var obj = this._buildBestColumns(columns, query, fuzziness, all_words, match_percent, priority);
    //save in query 'and' clause.
    this.bool.should.push(obj); 

    return this;
};

CB.SearchQuery.prototype.mostColumns = function(columns, query, fuzziness, all_words, match_percent, priority) {

    if(!columns instanceof Array || columns.length<2)
           throw "There should be more than one columns in-order to use this function";

    if(all_words){
        all_words='and';
    }

    var obj = this._buildMostColumns(columns, query, fuzziness, all_words, match_percent, priority);
    //save in query 'and' clause.
    this.bool.should.push(obj); 

    return this;
};

CB.SearchQuery.prototype.startsWith = function(column, value, priority) {

    var obj = {};
    obj.prefix = {};
    obj.prefix[column] = {};
    obj.prefix[column].value = value;
    
    if(priority){
        obj.prefix[column].boost = priority;
    }

    this.bool.must.push(obj);
};

CB.SearchQuery.prototype.wildcard = function(column, value, priority) {

    var obj = {};
    obj.wildcard = {};
    obj.wildcard[column] = {};
    obj.wildcard[column].value = value;
    
    if(priority){
        obj.wildcard[column].boost = priority;
    }

    this.bool.should.push(obj);
};



CB.SearchQuery.prototype.regexp = function(column, value, priority) {

    var obj = {};
    obj.regexp = {};
    obj.regexp[column] = {};
    obj.regexp[column].value = value;
    
    if(priority){
        obj.regexp[column].boost = priority;
    }

    this.bool.must.push(obj);
};

//And logical function. 
CB.SearchQuery.prototype.and = function(searchQuery) {

    if(!searchQuery instanceof CB.SearchQuery){
        throw "data should be of type CB.SearchQuery";
    }

    this.bool.must.push(searchQuery);
};

//OR Logical function
CB.SearchQuery.prototype.or = function(searchQuery) {

    if(!searchQuery instanceof CB.SearchQuery){
        throw "data should be of type CB.SearchQuery";
    }

    this.bool.should.push(searchQuery);
};


//NOT logical function
CB.SearchQuery.prototype.not = function(searchQuery) {

    if(!searchQuery instanceof CB.SearchQuery){
        throw "data should be of type CB.SearchQuery";
    }

    this.bool.must_not.push(searchQuery);
};


/* This is CloudSearch Function, 

Params : 
CollectionNames : string or string[] of collection names. (Required)
SearchQuery : CB.SearchQuery Object (optional)
SearchFilter : CB.SearchFilter Object (optional)
*/

CB.CloudSearch = function(collectionNames, searchQuery, searchFilter) {

    this.collectionNames = collectionNames;
    //make a filterd query in elastic search.

    this.query = {};
    this.query.filtered = {};
    
    
    if(searchQuery){
        this.query.filtered.query = searchQuery;
    }else{
        this.query.filtered.query = {};
    }

    if(searchFilter){
        this.query.filtered.filter = searchFilter;
    }else{
        this.query.filtered.filter = {};
    }

    this.from = 0; //this is skip in usual terms.
    this.size = 10; //this is take in usual terms.
    this.sort = [];
};

Object.defineProperty(CB.CloudSearch.prototype, 'searchFilter', {
    get: function() {
        return this.query.filtered.filter;
    },
    set: function(searchFilter) {
        this.query.filtered.filter = searchFilter;
    }
});


Object.defineProperty(CB.CloudSearch.prototype, 'searchQuery', {
    get: function() {
        return this.query.filtered.query;
    },
    set: function(searchQuery) {
        this.query.filtered.query = searchQuery;
    }
});

CB.CloudSearch.prototype.setSkip = function(data) {
    this.from = data;
    return this;
};

CB.CloudSearch.prototype.setLimit = function(data) {
    this.size = data;
    return this;
};

CB.CloudSearch.prototype.orderByAsc = function(columnName) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;

    var obj = {};
    obj[columnName] = {};
    obj[columnName]['order'] = 'asc';
    this.sort.push(obj);

    return this;
};

CB.CloudSearch.prototype.orderByDesc = function(columnName) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;

    var obj = {};
    obj[columnName] = {};
    obj[columnName]['order'] = 'desc';
    this.sort.push(obj);

    return this;
};


CB.CloudSearch.prototype.search = function(callback) {

    CB._validate();

    var collectionName = null;

    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    if (this.collectionNames instanceof Array) {
        collectionName = this.collectionNames.join(',');
    } else {
        collectionName = this.collectionNames;
    }


    var params=JSON.stringify({
        collectionName: collectionName,
        query: this.query,
        sort: this.sort,
        limit: this.size,
        skip: this.from,
        key: CB.appKey
    });

    var url = CB.apiUrl + "/data/" + CB.appId +'/'+ collectionName + "/search" ;

    CB._request('POST',url,params).then(function(response){
        var object = CB.fromJSON(JSON.parse(response));
        if (callback) {
            callback.success(object);
        } else {
            def.resolve(object);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
    if(!callback) {
        return def;
    }
};
