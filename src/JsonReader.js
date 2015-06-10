Ext.define('CouchDB.data.Reader', {
    extend: 'Ext.data.reader.Json',
    alias: 'reader.couchdb',
    rootProperty: 'rows',
    record: 'doc',
    idProperty: "_id",
    successProperty: 'ok',
    totalProperty: 'total_rows',

     transform: {
         fn: function(data) {
             if (Ext.isDefined(data) && !Ext.isDefined(data.rows)) {
                 var wrappedData = {
                     rows: [{ doc: data }]
                 };
                 return wrappedData;
             } else {
                 return data
             }
         },
         scope: this
     },
});
