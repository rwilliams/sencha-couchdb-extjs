Ext.define('CouchDB.data.Writer', {
    extend: 'Ext.data.writer.Json',
    alias: 'writer.couchdb',

    allowSingle: true,
    encode: false,
    writeAllFields: true,
    root: undefined,
    getRecordData: function(record, operation) {
        var isPhantom = record.phantom === true,
            writeAll = this.writeAllFields || isPhantom,
            fields = record.fields,
            fieldItems = fields.items,
            data = {},
            clientIdProperty = record.clientIdProperty,
            changes,
            field,
            key,
            mappedIdProperty,
            f, fLen;

        if (writeAll) {
            fLen = fieldItems.length;

            for (f = 0; f < fLen; f++) {
                field = fieldItems[f];
                if (field.persist) {
                    this.writeValue(data, field, record);
                }
            }

            Ext.iterate(record.associations.map, function (name, association) {
                if (association.inner === true) {
                    var innerStore = record[name]();
                    if (innerStore.getCount() > 0) {

                        data[name] = [];
                        innerStore.each(function (innerRecord) {
                            var innerData = this.getRecordData(innerRecord);
                            // Remove foreign keys that aren't needed with denormalized databases
                            innerRecord.associations.each(function (association) {
                                delete innerData[association._foreignKey];
                            });
                            data[name].push(innerData);

                        }, this);
                    }
                }
            }, this);

        } else if (operation.action === 'destroy') {
            this.writeValue(data, record.idField, record);
        } else {
            // Only write the changes
            changes = record.getChanges();
            for (key in changes) {
                if (changes.hasOwnProperty(key)) {
                    field = fields.get(key);
                    if (field.persist) {
                        this.writeValue(data, field, record);
                    }
                }
            }
        }

        if (isPhantom) {
            if (!data._id) {
                delete data._id;
            }
            if (!data._rev) {
                delete data._rev;
            }
        }

        return data;
    },
    writeValue: function(data, field, record){
        var name = field.mapping || field[this.nameProperty],
            dateFormat = this.dateFormat || field.dateWriteFormat || field.dateFormat,
            value = record.get(field.name);

        // Allow the nameProperty to yield a numeric value which may be zero.
        // For example, using a field's numeric mapping to write an array for output.
        if (name == null) {
            name = field.name;
        }

        if (field.serialize) {
            data[name] = field.serialize(value, record);
        } else if (field.type === Ext.data.Types.DATE && dateFormat && Ext.isDate(value)) {
            data[name] = Ext.Date.format(value, dateFormat);
        } else {
            data[name] = value;
        }
    }
});