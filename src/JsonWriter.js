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

            Ext.Object.each(request._records[0].getAssociatedData(), function(key, value, myself) {
                data[key] = value;
            });

            return data;
        },
        scope: this
    },
});