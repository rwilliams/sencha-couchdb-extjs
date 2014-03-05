Ext.define('CouchDB.HasManyOverride', {
    override: 'Ext.data.association.HasMany',
    read: function(record, reader, associationData){
        var store = record[this.name](),
            inverse,
            items, iLen, i;

        store.add(reader.read(associationData).records);

        //now that we've added the related records to the hasMany association, set the inverse belongsTo
        //association on each of them if it exists
        inverse = this.associatedModel.prototype.associations.findBy(function(assoc){
            return assoc.type === 'belongsTo' && assoc.associatedName === record.$className;
        });

        //if the inverse association was found, set it now on each record we've just created
        if (inverse) {
            items = store.data.items;
            iLen  = items.length;

            for (i = 0; i < iLen; i++) {
                items[i][inverse.instanceName] = record;
            }
        }

        if (this.inner) {
            store.data.each(function(associatedRecord){
                associatedRecord.innerOf = record;
            });
        }
    }
});
