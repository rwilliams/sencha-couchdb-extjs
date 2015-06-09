describe("CRUD Operations", function () {
    var store,
        dbUrl,
        dbName;

    //Set your database and database url here
    //
    dbUrl = 'http://localhost:3000';
    dbName = 'sencha_couch_test';

    Ext.define('Person', {
        extend: 'CouchDB.data.NestedModel',
        fields: [
            {
                name: 'name',
                type: 'string',
                mapping: 'first_name'
            },
            {
                name: 'age',
                type: 'int'
            },
            {
                name: '_id',
                type: 'string'
            },{
                name: '_rev',
                type: 'string'
            }
        ],
        idProperty: '_id',
        hasMany: ['Dog'],
        proxy: {
            type: 'couchdb',
            databaseUrl: dbUrl,
            databaseName: dbName,
            designName: 'test',
            viewName: 'people'
        }

    });

    Ext.define('Dog', {
        extend: 'Ext.data.Model',
        validators: [{type: 'presence', field: 'name'}],
        fields: [
            {
                name: 'name',
                type: 'string',
                mapping: 'first_name'
            },
            {
                name: 'color',
                type: 'string'
            }
        ],
        belongsTo: ['Person']
    });

    store = Ext.create('Ext.data.Store', {
        storeId: 'testStore',
        model: 'Person'
    });

    beforeEach(function (done) {
        var myDbName = dbName,
            myDbUrl = dbUrl;

        PouchDB.destroy(myDbUrl + myDbName, function (err, info) {
            var db = new PouchDB(myDbUrl + myDbName);
            db.put({
                "_id": "_design/test",
                "language": "javascript",
                "views": {
                    "people": {
                        "map": "function(doc) { emit(doc._id, null); };"
                    }
                }
            }, function (err, response) {
                expect(err).toBeNull();
                done();
            });
        });
    });

    afterEach(function (done) {
        PouchDB.destroy(dbUrl + dbName, function (err, info) {
            expect(err).toBeNull();
            done();
        });
    });

    // it('can create and load a new Model object', function (done) {
    //     var id,
    //         rev;

    //     var person = new Person({ name: 'Ralph', age: 30 });
    //     id = person.getId();

    //     //expect(id).toBe('');
    //     person.save({
    //         callback: function (records,operation,success) {
                
    //             console.log('I was 1st.');
    //             id = person.getId();
    //             rev = person.get('_rev');
    //             expect(id).toBeDefined();
    //             expect(person.get('_id')).toBe(id);
    //             expect(rev).toBeDefined();
    //             expect(person.get('name')).toBe('Ralph');
    //             expect(person.get('age')).toBe(30);
    //             person = null;
    //             done();

    //             // Person.load(id, {
    //             //     callback: function (person, operation) {
    //             //         expect(person).toBeDefined();
    //             //         expect(person.getId()).toBe(id);
    //             //         expect(person.get('_id')).toBe(id);
    //             //         expect(person.get('_rev')).toBe(rev);
    //             //         expect(person.get('name')).toBe('Ralph');
    //             //         expect(person.get('age')).toBe(30);
    //             //         done();
    //             //     }
    //             // });
    //         }
    //     });
    // });

    it('can update an existing Model object', function (done) {
        var id;
        var rev;

        var person = new Person({ name: 'Ralph', age: 31 });
        id = person.getId();
        person.save({
            callback: function (records,operation,success) {
                id = person.getId();
                rev = person.get('_rev');
                person = null;
                expect(person).toBeNull();
                Person.load(id, {
                    callback: function (record, operation) {
                        done();
                        person = record;
                        person.set('name', 'Fred');
                        person.set('age', 21);
                        person.save({
                            callback: function () {
                                person = null;
                                Person.load(id, {
                                    callback: function (record, operation) {
                                        person = record;
                                        expect(person).toBeDefined();
                                        expect(person.getId()).toBe(id);
                                        expect(person.get('_rev')).toBeDefined();
                                        expect(person.get('_rev')).not.toBe(rev);
                                        expect(person.get('name')).toBe('Fred');
                                        expect(person.get('age')).toBe(21);
                                        done();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
// //
    // it('can delete a Model object', function (done) {
    //     var id,
    //         person = new Person({ name: 'Ralph', age: 32 });

    //     person.save({
    //         callback: function () {
    //             id = person.getId();
    //             person = null;
    //             Person.load(id, {
    //                 success: function (record, operation) {
    //                     person = record;
    //                     person.destroy({
    //                         callback: function () {
    //                             Person.load(id, {
    //                                 callback: function (record, operation) {
    //                                     expect(record).toBe(null);
    //                                     done();
    //                                 }
    //                             });
    //                         }
    //                     });
    //                 }
    //             });
    //         }
    //     });
    // });
// //
//     it('can load all Model objects using a Store', function (done) {
//         var person1 = new Person({ name: 'Ralph', age: 33 }),
//             person2 = Ext.create('Person', { name: 'Jane', age: 43 }),
//             person3 = Ext.create('Person', { name: 'David', age: 53 }),
//             allPeople = 0,
//             addPerson;

//         person1.save({
//             callback: function (person, request) {
//                 store.add(person);
//                 addPerson();
//             }
//         });

//         person2.save({
//             callback: function (person, request) {
//                 store.add(person);
//                 addPerson();
//             }
//         });

//         person3.save({
//             callback: function (person, request) {
//                 store.add(person);
//                 addPerson();
//             }
//         });

//         addPerson = function () {
//             allPeople++;
//             if (allPeople === 3) {
//                 expect(store.getRange().length).toBe(3);
//                 done();
//             }
//         };
//     });

//     it('can read and write nested data', function (done) {
//         var person = new Person({ name: 'Ralph', age: 30 }),
//             dog = new Dog({color: 'Yellow', name: 'Fido'});
//         person.dogs().add(dog);
//         person.save({
//             callback: function (person, request) {
//                 Person.load(person.getId(), {
//                     callback: function (person, operation) {
//                         //debugger;
//                         expect(person.dogs().first().get('color')).toBe('Yellow');
//                         expect(person.dogs().first().get('name')).toBe('Fido');
//                         done();
//                     }
//                 });
//                 //done();
//             }
//         });
//     });
// //
//     it('can have parent document be saved by calling save on a new(phantom) nested object', function (done) {
//         var person = new Person({ name: 'Ralph', age: 30 }),
//             dog = new Dog({color: 'Yellow', name: 'Fido'});

//         person.dogs().add(dog);

//         //in order to save a phantom record innerOf must be set manually. I can't figure out a good way to do this in the lib itself.
//         dog.innerOf = person;
//         dog.save({
//             callback: function (person, request) {
//                 Person.load(person.getId(), {
//                     callback: function (person, operation) {
//                         //debugger;
//                         expect(person.dogs().first().get('color')).toBe('Yellow');
//                         expect(person.dogs().first().get('name')).toBe('Fido');
//                         done();
//                     }
//                 });
//                 //done();
//             }
//         });
//     });
// //
//     it('can have parent document be saved by calling nested object', function (done) {
//         var person = new Person({ name: 'Ralph', age: 30 }),
//             dog = new Dog({color: 'Yellow', name: 'Fido'});

//         person.dogs().add(dog);

//         person.save({
//             callback: function (person, request) {
//                 Person.load(person.getId(), {
//                     callback: function (person, operation) {
//                         dog = person.dogs().first();
//                         dog.save({
//                             callback: function(person, operation){
//                                 expect(person.dogs().first().get('color')).toBe('Yellow');
//                                 expect(person.dogs().first().get('name')).toBe('Fido');
//                                 done();
//                             }
//                         });

//                     }
//                 });
//             }
//         });
//     });
// //
//     it('will be marked invalid if nested data is invalid and valid if the nested data is valid', function (done) {
//         var personInvalid = new Person({ name: 'InValid', age: 35 }),
//             personValid = new Person({ name: 'Valid', age: 30 }),
//             dogValid = new Dog({color: 'Yellow',name:'valid'}),
//             dogInvalid = new Dog({color: 'Yellow',name:''});

//         personInvalid.dogs().add(dogInvalid);
//         personValid.dogs().add(dogValid);
//         expect(personInvalid.isValid()).toBeFalsy();
//         expect(personValid.isValid()).toBeTruthy();
//         done();
//     });
});