Ext.define('Ext.data.proxy.PouchDB', {
    alias : 'proxy.pouchdb',
    extend: 'Ext.data.proxy.Client',

    config: {
        /**
         * @cfg {String} id
         * The unique ID used as the database name for PouchDB.
         */
        id: undefined,

    },
    reader: {
        type: 'json',
        idProperty: '_id'
    },
    writer: {
        type: 'json',
        allowSingle: true,
        encode: false,
        writeAllFields: true,
        clientIdProperty: '_id'
    },

    /**
     * Creates the proxy, throws an error if local storage is not supported in the current browser.
     * @param {Object} config (optional) Config object.
     */
    constructor: function(config) {
        this.callParent(arguments);

        if (this.getStorageObject() === undefined) {
            Ext.raise("Pouch is not supported in this browser");
        }
    },


    create: function(operation) {
        var me = this,
            records = operation.getRecords(),
            length = records.length,
            record,
            i,
            data;


        for (i = 0; i < length; i++) {
            record = records[i];


            if (record.phantom){
                record.setId('');
            }

            data = me.getWriter().getRecordData(record);
            record.getAssociatedData(data);


            this.getStorageObject().post(data).then(function(doc){
                record.set('_rev',doc.rev);
                record.set('_id',doc.id);
                record.commit();
                operation.setSuccessful(true);
            }).catch(function(err){
                operation.setSuccessful(false);
            });
        }
    },


    read: function(operation) {
            var me = this,
                id,
                records= [],
                Model = me.getModel(),
                recordCreator = operation.getRecordCreator();

            id = operation.getId();

            me.getStorageObject().get(id).then(function(doc){
                var reader = operation.getProxy().getReader(),
                    record = recordCreator ? recordCreator(doc, Model) : new Model(doc);

                reader.readAssociated(record,doc);
                record.commit();
                records.push(record);

                operation.setResultSet(new Ext.data.ResultSet({
                    records: records,
                    total  : records.length,
                    loaded : true
                }));

                operation.setSuccessful(true);

            }).catch(function(err){
                console.log(err);
                operation.setException(err.name);
                operation.setSuccessful(false);
            });
    },


    update: function(operation) {
        var records = operation.getRecords(),
            length  = records.length,
            record,
            i,
            data;

        for (i = 0; i < length; i++) {
            record = records[i];
            data = this.getWriter().getRecordData(record);
            record.getAssociatedData(data);

            this.getStorageObject().put(data,record.getId()).then(function(doc){

                record.set('_rev',doc.rev);
                record.commit();
                operation.setSuccessful(true);
            }).catch(function(err){
                console.log(err);
                operation.setException(err.name);
                operation.setSuccessful(false);
            });
        }



    },

    erase: function(operation) {
        var me = this,
            records = operation.getRecords(),
            record;

        record = records[0];

        me.getStorageObject().get(record.getId()).then(function(doc) {
            return me.getStorageObject().remove(doc);
        }).then(function (result) {
            operation.setSuccessful(true);
        }).catch(function (err) {
            operation.setSuccessful(false);
            console.log(err);
        });


    },


    /**
     * @private
     * Abstract function which should return the storage object that data will be saved to. This must be implemented
     * in each subclass.
     * @return {Object} The storage object
     */
    getStorageObject: function() {

        return new PouchDB(this.id);
    }
});
