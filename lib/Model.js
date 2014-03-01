Ext.define('CouchDB.data.Model', {
    extend: 'CouchDB.data.NestedModel',
    alias: 'couchdb.model',

    fields: [{
        name: '_id',
        type: 'string'
    },{
        name: '_rev',
        type: 'string'
    }],
    idProperty: '_id'
});