Ext.define('CouchDB.data.NestedModel', {
    extend: 'Ext.data.Model',
    alias: 'couchdb.nestedmodel',
    save: function(options) {
        options = Ext.apply({}, options);
        
        var me = this,
            phantom = me.phantom,
            dropped = me.dropped,
            action = dropped ? 'destroy' : (phantom ? 'create' : 'update'),
            scope  = options.scope || me,
            callback = options.callback,
            proxy = me.getProxy(),
            operation;
            
        options.records = [me];
        //changing internalCallback to callback so we can so a callback first using internalCallback 
        options.internalCallback = function(operation) {
            console.log('I was 2nd.');
            // Errors will not have a response object.
                
                if (operation.wasSuccessful()) {
                    record = operation._records[0];
                    // For create, restore the preserved data and set the ID returned from CouchDB.

                    if (operation.action == 'create') {
                        record.set('_id',Ext.JSON.decode(operation.getResponse().responseText).id);
                    }

                    record.set('_rev',Ext.JSON.decode(operation.getResponse().responseText).rev);
                    record.dirty = false;
                      //      me.dirty = false;
                    //me.editing = false;
                    record.modified = {};
                }
                
            // debugger;
            //op.callback(op);
            
        };

        options.callback = function(records,operation,success) {
            var args = [me, operation],
                success = operation.wasSuccessful();
            if (success) {
                Ext.callback(options.success, scope, args);
            } else {
                Ext.callback(options.failure, scope, args);
            }
            args.push(success);
            Ext.callback(callback, scope, args);
        };
        // // delete options.callback;
        
        operation = proxy.createOperation(action, options);

        // Not a phantom, then we must perform this operation on the remote datasource.
        // Record will be removed from the store in the callback upon a success response
        if (dropped && phantom) {
            // If it's a phantom, then call the callback directly with a dummy successful ResultSet
            operation.setResultSet(Ext.data.reader.Reader.prototype.nullResultSet);
            me.setErased();
            operation.setSuccessful(true);
        } else {
            operation.execute();
        }
        return operation;
    },
});