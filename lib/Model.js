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
    idProperty: '_id',

    //We have to add all the original inheritableStatics so we can fix a bug in the load method. Apparently there is no way to override an
    //single inheritable static method....
    //
    inheritableStatics: {
        /**
         * Sets the Proxy to use for this model. Accepts any options that can be accepted by
         * {@link Ext#createByAlias Ext.createByAlias}.
         * @param {String/Object/Ext.data.proxy.Proxy} proxy The proxy
         * @return {Ext.data.proxy.Proxy}
         * @static
         * @inheritable
         */
        setProxy: function(proxy) {
            //make sure we have an Ext.data.proxy.Proxy object
            if (!proxy.isProxy) {
                if (typeof proxy == "string") {
                    proxy = {
                        type: proxy
                    };
                }
                proxy = Ext.createByAlias("proxy." + proxy.type, proxy);
            }
            proxy.setModel(this);
            this.proxy = this.prototype.proxy = proxy;

            return proxy;
        },

        /**
         * Returns the configured Proxy for this Model
         * @return {Ext.data.proxy.Proxy} The proxy
         * @static
         * @inheritable
         */
        getProxy: function() {

            var proxy = this.proxy;

            // Not yet been created wither from prototype property set in onClassExtended, or by cloning superclass's Proxy...
            if (!proxy) {
                proxy = this.prototype.proxy;

                // If we inherited an instantiated Propxy, we can't share it, so clone it.
                if (proxy.isProxy) {
                    proxy = proxy.clone()
                }

                return this.setProxy(proxy);
            }

            return proxy;
        },

        /**
         * Apply a new set of field and/or property definitions to the existing model. This will replace any existing
         * fields, including fields inherited from superclasses. Mainly for reconfiguring the
         * model based on changes in meta data (called from Reader's onMetaChange method).
         * @static
         * @inheritable
         */
        setFields: function(fields, idProperty, clientIdProperty) {
            var me = this,
                newField,
                idField,
                idFieldDefined = false,
                proto = me.prototype,
                prototypeFields = proto.fields,
                superFields = proto.superclass.fields,
                len,
                i;

            if (idProperty) {
                proto.idProperty = idProperty;
                idField = idProperty.isField ? idProperty : new Ext.data.Field(idProperty);

            }
            if (clientIdProperty) {
                proto.clientIdProperty = clientIdProperty;
            }

            if (prototypeFields) {
                prototypeFields.clear();
            }
            else {
                prototypeFields = me.prototype.fields = new Ext.util.MixedCollection(false, function(field) {
                    return field.name;
                });
            }

            // Merge the fields of the superclass and the passed in fields
            if (superFields) {
                fields = superFields.items.concat(fields);
            }

            for (i = 0, len = fields.length; i < len; i++) {
                newField = new Ext.data.Field(fields[i]);

                // If a defined Field encapsulates the idProperty, then we do not have to create a separate identifying field.
                // Also, this field must never have a default value set if no value arrives from the server side.
                // So override any possible prototype-provided defaultValue with undefined which will inhibit generation of defaulting code in Reader.buildRecordDataExtractor
                if (idField && ((newField.mapping && (newField.mapping === idField.mapping)) || (newField.name === idField.name))) {
                    idFieldDefined = true;
                    newField.defaultValue = undefined;
                }
                prototypeFields.add(newField);
            }

            // If there was an idProperty specified, and there has *not* been a field defined which encapsulates that property,
            // then create a field which encapsulates that property.
            // This must never provide a default value.
            if (idField && !idFieldDefined) {
                idField.defaultValue = undefined;
                prototypeFields.add(idField);
            }

            me.fields = prototypeFields;

            return prototypeFields;
        },

        /**
         * Returns an Array of {@link Ext.data.Field Field} definitions which define this Model's structure
         *
         * Fields are sorted upon Model class definition. Fields with custom {@link Ext.data.Field#convert convert} functions
         * are moved to *after* fields with no convert functions. This is so that convert functions which rely on existing
         * field values will be able to read those field values.
         *
         * @return {Ext.data.Field[]} The defined Fields for this Model.
         *
         */
        getFields: function() {
            return this.prototype.fields.items;
        },

        /**
         * Asynchronously loads a model instance by id. Sample usage:
         *
         *     Ext.define('MyApp.User', {
         *         extend: 'Ext.data.Model',
         *         fields: [
         *             {name: 'id', type: 'int'},
         *             {name: 'name', type: 'string'}
         *         ]
         *     });
         *
         *     MyApp.User.load(10, {
         *         scope: this,
         *         failure: function(record, operation) {
         *             //do something if the load failed
         *             //record is null
         *         },
         *         success: function(record, operation) {
         *             //do something if the load succeeded
         *         },
         *         callback: function(record, operation, success) {
         *             //do something whether the load succeeded or failed
         *             //if operation is unsuccessful, record is null
         *         }
         *     });
         *
         * @param {Number/String} id The id of the model to load
         * @param {Object} config (optional) config object containing success, failure and callback functions, plus
         * optional scope
         * @static
         * @inheritable
         */
        load: function(id, config) {
            config = Ext.apply({}, config);
            config = Ext.applyIf(config, {
                action: 'read',
                id    : id
            });

            var operation  = new Ext.data.Operation(config),
                scope      = config.scope || this,
                callback;

            callback = function(operation) {
                var record = null,
                    success = operation.wasSuccessful();


                if (success) {
                    record = operation.getRecords()[0];

                    //CouchDB returns success with no record so we need to make sure we have a record first
                    // If the server didn't set the id, do it here
                    if (record && !record.hasId()) {
                        record.setId(id);
                    }
                    Ext.callback(config.success, scope, [record, operation]);
                } else {
                    Ext.callback(config.failure, scope, [record, operation]);
                }
                Ext.callback(config.callback, scope, [record, operation, success]);
            };

            this.getProxy().read(operation, callback, this);
        }
    }




});