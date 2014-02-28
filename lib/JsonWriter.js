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
            if (clientIdProperty && operation && operation.records.length > 1) {
                // include clientId for phantom records, if multiple records are being written to the server in one operation.
                // The server can then return the clientId with each record so the operation can match the server records with the client records
                data[clientIdProperty] = record.internalId;
            }
        } else if (this.writeRecordId) {
            // Make sure that if a mapping is in place the mapped id name is used instead of the default field name.
            mappedIdProperty = fields.get(record.idProperty)[this.nameProperty] || record.idProperty;
            data[mappedIdProperty] = record.getId();
        }

        return data;
    }
});