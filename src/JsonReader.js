Ext.define('CouchDB.data.Reader', {
    extend: 'Ext.data.reader.Json',
    alias: 'reader.couchdb',
    rootProperty: 'rows',
    record: 'doc',
    idProperty: "_id",
    successProperty: 'ok',
    totalProperty: 'total_rows',

    readRecords: function(data, readOptions) {
        var me = this,
            meta;
          
        console.log(data);  
        //this has to be before the call to super because we use the meta data in the superclass readRecords
        if (me.getMeta) {
            meta = me.getMeta(data);
            if (meta) {
                me.onMetaChange(meta);
            }
        } else if (data.metaData) {
            me.onMetaChange(data.metaData);
        }
        return this.callParent(arguments);
    },
    // transform: {
    //     fn: function(data) {
    //         console.log('hi');
    //         data = data[0];
    //         debugger;
    //         // do some manipulation of the unserialized data object
    //         if (!Ext.isDefined(data.rows)) {
    //             var wrappedData = {
    //                 rows: [{ doc: data }]
    //             };
    //             return wrappedData;
    //         } else {
    //             return data
    //         }
    //     },
    //     scope: this
    // },
    // read: function(response, readOptions) {
    //     var data, result;
    //     if (response) {
    //         if (response.responseText) {
    //             result = this.getResponseData(response);
    //             if (result && result.__$isError) {
    //                 return new Ext.data.ResultSet({
    //                     total  : 0,
    //                     count  : 0,
    //                     records: [],
    //                     success: false,
    //                     message: result.msg
    //                 });
    //             } else {
                    
    //                 delete response.request.options.jsonData._rev
    //                 result._id = result.id
    //                 result._rev = result.rev
    //                 delete result.id
    //                 delete result.rev
    //                 result = Ext.apply(result, response.request.options.jsonData);

    //                 data = this.readRecords(result, readOptions);
    //             }
    //         } else {
                
    //             data = this.readRecords(response, readOptions);
    //         }
    //     }

    //     return data || this.nullResultSet;
    // },
    // extractData: function(root, readOptions) {
    //     var recordName = this.getRecord(),
    //         data = [],
    //         length, i;

    //     if (recordName) {
    //         length = root.length;
            
    //         if (!length && Ext.isObject(root)) {
    //             length = 1;
    //             root = [root];
    //         }

    //         for (i = 0; i < length; i++) {
    //             data[i] = root[i][recordName];
    //         }
    //     } else {
    //         data = root;
    //     }
    //     return this.extractCouchData(data, readOptions);
    // }
    // extractCouchData: function(root, readOptions) {
    //     var me = this,
    //         entityType = readOptions && readOptions.model ? Ext.data.schema.Schema.lookupEntity(readOptions.model) : me.getModel(),
    //         schema = entityType.schema,
    //         includes = schema.hasAssociations(entityType) && me.getImplicitIncludes(),
    //         fieldExtractorInfo = me.getFieldExtractorInfo(entityType.fieldExtractors),
    //         length = root.length,
    //         records = new Array(length),
    //         typeProperty = me.getTypeProperty(),
    //         reader, node, nodeType, record, i;
            
    //     if (!length && Ext.isObject(root)) {
    //         root = [root];
    //         length = 1;
    //     }

    //     for (i = 0; i < length; i++) {
    //         record = root[i];
    //         if (!record.isModel) {
    //             // If we're given a model instance in the data, just push it on
    //             // without doing any conversion. Otherwise, create a record.
    //             node = record;

    //             // This Reader may be configured to produce different model types based on
    //             // a differentiator field in the incoming data:
    //             // typeProperty name be a string, a function which yields the child type, or an object: {
    //             //     name: 'mtype',
    //             //     namespace: 'MyApp'
    //             // }
    //             if (typeProperty && (nodeType = me.getChildType(schema, node, typeProperty))) {

    //                 reader = nodeType.getProxy().getReader();

    //                 record = reader.extractRecord(node, readOptions, nodeType,
    //                             schema.hasAssociations(nodeType) && reader.getImplicitIncludes(),
    //                             reader.getFieldExtractorInfo(nodeType.fieldExtractors));
    //             } else {
    //                 record = me.extractRecord(node, readOptions, entityType, includes,
    //                                           fieldExtractorInfo);
    //             }
    //         }
    //         if (record.onLoad) {
    //             record.onLoad();
    //         }
    //         records[i] = record;
    //     }

    //     return records;
    // },
    // readCouchRecords: function(data, readOptions) {
    //     var me = this,
    //         success,
    //         recordCount,
    //         records,
    //         root,
    //         total,
    //         value,
    //         message,
    //         transform;
        
    //     transform = this.getTransform();
    //     if (transform) {
    //         data = transform(data);
    //     }
          
    //     me.buildExtractors();
    //     /**
    //      * @property {Object} rawData
    //      * The raw data object that was last passed to {@link #readRecords}. Stored for further processing if needed.
    //      */
    //     me.rawData = data;

    //     data = me.getData(data);
        
    //     success = true;
    //     recordCount = 0;
    //     records = [];
            
    //     if (me.getSuccessProperty()) {
    //         value = me.getSuccess(data);
    //         if (value === false || value === 'false') {
    //             success = false;
    //         }
    //     }
        
    //     if (me.getMessageProperty()) {
    //         message = me.getMessage(data);
    //     }

        
    //     // Only try and extract other data if call was successful
    //     if (me.getReadRecordsOnFailure() || success) {
    //         // If we pass an array as the data, we dont use getRoot on the data.
    //         // Instead the root equals to the data.
    //         root = Ext.isArray(data) ? data : me.getRoot(data);
            
    //         if (root) {
    //             total = root.length;
    //         }

    //       if (me.getTotalProperty()) {
    //             value = parseInt(me.getTotal(data), 10);
    //             if (!isNaN(value)) {
    //                 total = value;
    //             }
    //         }

    //        if (root) {
    //             records = me.extractData(root, readOptions);
    //             recordCount = records.length;
    //         }
    //     }


    //     return new Ext.data.ResultSet({
    //         total  : total || recordCount,
    //         count  : recordCount,
    //         records: records,
    //         success: success,
    //         message: message,
    //         readRoot: !!root
    //     });

    // }
    // readRecords: function(data) {
    //     //handle single document queries
    //     debugger;
    //     if (!Ext.isDefined(data.rows)) {
    //         var wrappedData = {
    //             rows: [{ doc: data }]
    //         };
    //         return this.callParent([wrappedData]);
    //     } else {
    //         return this.callParent([data]);
    //     }
    // }
});
