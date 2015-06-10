Ext.define('CouchDB.data.Writer', {
    extend: 'Ext.data.writer.Json',
    alias: 'writer.couchdb',
    allowSingle: true,
    encode: false,
    writeAllFields: true,
    root: undefined,
    clientIdProperty: '_id',
    transform: {
        fn: function(data,request) {
            request.getRecords()[0].getAssociatedData(data);
            return data;
        },
        scope: this
    },
});