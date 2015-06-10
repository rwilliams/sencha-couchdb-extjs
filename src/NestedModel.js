Ext.define('CouchDB.data.Model', {
    extend: 'Ext.data.Model',
    alias: 'couchdb.model',
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
        options.internalCallback = function(operation) {
            var args = [me, operation],
                success = operation.wasSuccessful();

            if (success) {

                //here we assign the _rev and _id response from CouchDB before any callbacks are called.
                var record = operation._records[0];
                var responseObj = Ext.util.JSON.decode(operation._response.responseText)

                if (operation.getRequest().getAction() == 'create') {
                    record.set('_id', responseObj.id);
                }

                record.set('_rev',responseObj.rev);
                record.dirty = false;
                delete record.modified;

                Ext.callback(options.success, scope, args);
            } else {
                Ext.callback(options.failure, scope, args);
            }
            args.push(success);
            Ext.callback(callback, scope, args);
        };
        delete options.callback;

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
    }
});