Ext.define('CouchDB.data.Reader', {
    extend: 'Ext.data.reader.Json',
    alias: 'reader.couchdb',
    root: 'rows',
    record: 'doc',
    idProperty: "_id",
    successProperty: 'ok',
    totalProperty: 'total_rows'

});
