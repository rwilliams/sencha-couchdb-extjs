Ext.define('CouchDB.data.Proxy', {
    extend: 'Ext.data.proxy.Rest',
    alias : 'proxy.couchdb',

    constructor: function(config) {
        var databaseUrl = config.databaseUrl || '/';
        var databaseName = config.databaseName || 'your_database';

        this.restUrl = config.databaseUrl + '/' + databaseName;

        Ext.apply(config, {
            url: databaseUrl,
            api: {
                create: this.restUrl,
                read: this.restUrl,
                update: this.restUrl,
                destroy: this.restUrl
            },
            appendId: true,
            reader: {
                type: 'couchdb'
            },
            writer: {
                type: 'couchdb'
            }
        });

        this.callParent(arguments);
    },

    // This method is overridden to switch between loading a single object or executing a query using
    // a CouchDB view.
    read: function(operation) {
        var extraParams = {
            'include_docs': true
        };
        try {

            // CouchDB will include the entire document with the 'include_docs' parameter.
            if (operation._id) {
                this.api.read = this.restUrl;
                this.appendId = true;
            }

            Ext.apply(this.extraParams, extraParams);

            this.callParent(arguments);
        } finally {
            this.appendId = true;
            this.api.read = this.restUrl;
            // The proxy should not keep the 'include_docs' parameter around for subsequent requests.
            Ext.destroyMembers(this.extraParams, 'include_docs');
        }
    },

    // This method is overridden to support CouchDB's requirement to specify a revision of the object
    // to delete.
    destroy: function(operation) {
        try {
            // CouchDB expects a specific revision to be defined as the 'rev' parameter.
            Ext.apply(this.extraParams, { 'rev': operation.getRecords()[0].get('_rev') });
            this.callParent(arguments);
        } finally {
            // The proxy should not keep the 'rev' parameter around for subsequent requests.
            Ext.destroyMembers(this.extraParams, 'rev');
        }
    }
});