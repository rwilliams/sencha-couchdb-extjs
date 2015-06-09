Ext.define('CouchDB.data.Proxy', {
    extend: 'Ext.data.proxy.Rest',
    alias : 'proxy.couchdb',

    constructor: function(config) {
        var databaseUrl = config.databaseUrl || '/';
        var databaseName = config.databaseName || 'your_database';
        var designName = config.designName || 'your_design_name';
        var viewName = config.viewName || 'your_view_name';

        this.restUrl = config.databaseUrl + '/' + databaseName;
        this.viewUrl = config.databaseUrl + '/' + databaseName + '/_design/' + designName + '/_view/' + viewName;

        Ext.apply(config, {
            url: databaseUrl,
            api: {
                create: this.restUrl,
                read: this.viewUrl,
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
        console.log('hi');
        var extraParams ={
            'include_docs': true
        }
        try {

            // CouchDB will include the entire document with the 'include_docs' parameter.
            if (operation.id){
                this.api.read = this.restUrl;
                this.appendId = true;
            } else {
                this.api.read = this.viewUrl;
                this.appendId = false;
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