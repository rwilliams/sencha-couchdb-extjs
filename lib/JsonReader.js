Ext.define('CouchDB.data.Reader', {
    extend: 'Ext.data.reader.Json',
    alias: 'reader.couchdb',
    root: 'rows',
    record: 'doc',
    idProperty: "_id",
    successProperty: 'ok',
    totalProperty: 'total_rows',
    readRecords: function(data) {
        //handle single document queries
        if (!Ext.isDefined(data.rows)) {
            var wrappedData = {
                rows: [{ doc: data }]
            };
            return this.callParent([wrappedData]);
        } else {
            return this.callParent([data]);
        }
    }
});
