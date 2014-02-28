Ext.define('CouchDB.data.NestedModel', {
    extend: 'Ext.data.Model',
    alias: 'couchdb.nestedmodel',
    constructor: function(data, id, raw, convertedData) {
        // id, raw and convertedData not documented intentionally, meant to be used internally.
        // TODO: find where "raw" is used and remove it. The first parameter, "data" is raw, unconverted data.
        //
        // The "convertedData" parameter is a converted object hash with all properties corresponding to defined Fields
        // and all values of the defined type. It is used directly as this record's data property.
        // When the convertedData parameter is used, raw data is passed in using the "raw" parameter and
        // is not processed

        var me = this,
            passedId = (id || id === 0),
            hasId,
            fields,
            length,
            field,
            name,
            value,
            newId,
            persistenceProperty,
            idProperty = me.idProperty,
            idField = me.idField,
            i;

        /**
         * @property {Object} raw The raw data used to create this model if created via a reader.
         */
        me.raw = raw || data; // If created using data in constructor, use data

        /**
         * @property {Object} modified Key: value pairs of all fields whose values have changed
         */
        me.unsetDirty();

        //<debug>
        // exclude types since it's new
        if (me.persistenceProperty !== 'data') {
            Ext.log.warn(this.$className, 'The persistenceProperty will be deprecated, all data will be stored in the underlying data property.');
        }
        //</debug>
        persistenceProperty = me[me.persistenceProperty] = convertedData || {};

        // Until persistenceProperty is deprecated, keep a reference in me.data
        me.data = me[me.persistenceProperty];

        me.mixins.observable.constructor.call(me);

        if (!convertedData) {

            if (data) {
                // If no ID passed, use the id property from the converted data
                if (!passedId && idProperty) {
                    id = data[idProperty];
                    hasId = (id || id === 0);
                }
            }
            // No data passed. Use the static empty array.
            else {
                data = me.emptyData;
            }

            //add default field values if present
            fields = me.fields.items;
            length = fields.length;
            i = 0;

            if (Ext.isArray(data)) {
                for (; i < length; i++) {
                    field = fields[i];
                    name  = field.name;

                    // Use the original ordinal position at which the Model inserted the field into its collection.
                    // Fields are sorted to place fields with a *convert* function last.
                    value = data[field.originalIndex];

                    if (value === undefined) {
                        value = field.defaultValue;
                    }
                    // Have to map array data so the values get assigned to the named fields
                    // rather than getting set as the field names with undefined values.
                    if (field.convert) {
                        value = field.convert(value, me);
                    }
                    // On instance construction, do not create data properties based on undefined input properties
                    if (value !== undefined) {
                        persistenceProperty[name] = value;
                    }
                }

            } else {
                for (; i < length; i++) {
                    field = fields[i];
                    name  = field.name;
                    value = data[name];
                    if (value === undefined) {
                        value = field.defaultValue;
                    }
                    if (field.convert) {
                        value = field.convert(value, me);
                    }
                    // On instance construction, do not create data properties based on undefined input properties
                    if (value !== undefined) {
                        persistenceProperty[name] = value;
                    }
                }
            }
        }

        /**
         * @property {Ext.data.Store[]} stores
         * The {@link Ext.data.Store Stores} to which this instance is bound.
         */
        me.stores = [];

        // Caller passed an id, put the converted value into our data object.
        // The *unconverted* value is used as the internalId.
        if (passedId) {
            hasId = true;
            persistenceProperty[idProperty] = idField && idField.convert ? idField.convert(id) : id;
        }

        // If there's no id, we are a phantom so we have to generate an id.
        else if (!hasId) {
            // Generate a key using the supplied idgen function
            newId = me.idgen.generate();
            if (newId != null) {
                me.preventInternalUpdate = true;
                me.setId(newId);
                delete me.preventInternalUpdate;
            }
        }

        /**
         * @property {Number/String} internalId
         * An internal unique ID for each Model instance, used to identify Models that don't have an ID yet
         * @private
         */
        me.internalId = hasId ? id : Ext.data.Model.id(me);
        // The Ext.data.Model.id call sets the phantom property. So it will be set now if !hasId

        if (typeof me.init == 'function') {
            me.init();
        }

        // Generate an observable ID
        me.id = me.idgen.getRecId(me);
    },
    validate: function() {
        var errors      = new Ext.data.Errors(),
            validations = this.validations,
            validators  = Ext.data.validations,
            innerFn     = function (record) {
                var errs = record.validate();
                if (!errs.isValid()) {
                    errors.addAll(errs.items);
                }
            },
            length, validation, field, valid, type, i;

        if (validations) {
            length = validations.length;

            for (i = 0; i < length; i++) {
                validation = validations[i];
                field = validation.field || validation.name;
                type  = validation.type;
                valid = validators[type](validation, this.get(field));

                if (!valid) {
                    errors.add({
                        field  : field,
                        message: validation.message || validators[type + 'Message']
                    });
                }
            }
        }

        Ext.iterate(this.associations.map, function (key, value, scope) {
            if (value.inner === true) {
                this[key]().each(innerFn);
            }
        }, this);

        return errors;
    },

    set: function (fieldName, newValue) {
        var me = this,
            data = me[me.persistenceProperty],
            fields = me.fields,
            modified = me.modified,
            single = (typeof fieldName == 'string'),
            currentValue, field, idChanged, key, modifiedFieldNames, name, oldId,
            newId, value, values;

        if (single) {
            values = me._singleProp;
            values[fieldName] = newValue;
        } else {
            values = fieldName;
        }

        for (name in values) {
            if (values.hasOwnProperty(name)) {
                value = values[name];

                if (fields && (field = fields.get(name)) && field.convert) {
                    value = field.convert(value, me);
                }

                currentValue = data[name];
                if (me.isEqual(currentValue, value)) {
                    continue; // new value is the same, so no change...
                }

                data[name] = value;
                (modifiedFieldNames || (modifiedFieldNames = [])).push(name);

                if (field && field.persist) {
                    if (modified.hasOwnProperty(name)) {
                        if (me.isEqual(modified[name], value)) {
                            // The original value in me.modified equals the new value, so
                            // the field is no longer modified:
                            delete modified[name];

                            // We might have removed the last modified field, so check to
                            // see if there are any modified fields remaining and correct
                            // me.dirty:
                            me.dirty = false;
                            for (key in modified) {
                                if (modified.hasOwnProperty(key)){
                                    me.dirty = true;
                                    break;
                                }
                            }
                        }
                    } else {
                        this.setDirty();
                    }
                }

                if (name == me.idProperty) {
                    idChanged = true;
                    oldId = currentValue;
                    newId = value;
                }
            }
        }

        if (single) {
            // cleanup our reused object for next time... important to do this before
            // we fire any events or call anyone else (like afterEdit)!
            delete values[fieldName];
        }

        if (idChanged) {
            me.changeId(oldId, newId);
        }

        if (!me.editing && modifiedFieldNames) {
            me.afterEdit(modifiedFieldNames);
        }

        return modifiedFieldNames || null;
    },
    setDirty : function() {
        var me     = this,
            fields = me.fields.items,
            fLen   = fields.length,
            field, name, f;

        me.dirty = true;

        for (f = 0; f < fLen; f++) {
            field = fields[f];

            if (field.persist) {
                name  = field.name;
                me.modified[name] = me.get(name);
            }
        }

        if (me.innerOf) {
            me.innerOf.setDirty();
        }
    },
    unsetDirty : function() {
        var me = this;

        me.dirty = false;
        me.editing = false;
        me.modified = {};

        Ext.iterate(me.associations.map, function (key, value, scope) {
            if (value.config.inner === true) {
                this[key]().each(function (record) {
                    record.unsetDirty();
                });
            }
        }, me);
    },
    reject : function(silent) {
        var me = this,
            modified = me.modified,
            field;

        for (field in modified) {
            if (modified.hasOwnProperty(field)) {
                if (typeof modified[field] != "function") {
                    me[me.persistenceProperty][field] = modified[field];
                }
            }
        }

        me.unsetDirty();

        if (silent !== true) {
            me.afterReject();
        }
    },
    commit : function(silent, modifiedFieldNames) {
        var me = this;

        me.phantom = false;
        me.unsetDirty();

        if (silent !== true) {
            me.afterCommit(modifiedFieldNames);
        }
    },
    save: function(options) {
        options = Ext.apply({}, options);

        if (this.innerOf) {
            return this.innerOf.save(options,scope);
        }

        var me     = this,
            action = me.phantom ? 'create' : 'update',
            scope  = options.scope || me,
            stores = me.stores,
            i = 0,
            storeCount,
            store,
            operation,
            callback;

        Ext.apply(options, {
            records: [me],
            action : action
        });

        operation = new Ext.data.Operation(options);

        callback = function(operation) {
            var success = operation.wasSuccessful();

            if (success) {
                for(storeCount = stores.length; i < storeCount; i++) {
                    store = stores[i];
                    store.fireEvent('write', store, operation);
                    store.fireEvent('datachanged', store);
                    // Not firing refresh here, since it's a single record
                }
                Ext.callback(options.success, scope, [me, operation]);
            }
            else {
                Ext.callback(options.failure, scope, [me, operation]);
            }

            Ext.callback(options.callback, scope, [me, operation, success]);
        };

        me.getProxy()[action](operation, callback, me);

        return me;
    }
});