describe("CRUD Operations", function () {
    var store,
        dbUrl,
        dbName;

    //Set your database and database url here
    //
    dbUrl = 'http://localhost:3000';
    dbName = 'sencha_couch_test';

    Ext.define('Person', {
        extend: 'CouchDB.data.Model',
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
        appendId: true,
        idProperty: '_id',
        proxy: {
            type: 'couchdb',
            databaseUrl: dbUrl,
            databaseName: dbName
        }

    });

    Ext.define('Dog', {
        extend: 'CouchDB.data.Model',
        validators: [{type: 'presence', field: 'name'}],
        fields: [
            {
                name: 'name',
                type: 'string',
                mapping: 'first_name'
            },
            {
                name: 'person_id',
                reference: 'Person',
                type: 'string'
            },
            {
                name: 'color',
                type: 'string'
            },

        ]

    });
    Ext.define('Cat', {
        extend: 'CouchDB.data.Model',
        validators: [{type: 'presence', field: 'name'}],
        fields: [
            {
                name: 'name',
                type: 'string',
                mapping: 'first_name'
            },
            {
                name: 'dog_id',
                reference: 'Dog',
                type: 'string'
            },
            {
                name: 'color',
                type: 'string'
            },

        ]
    });
    //
    store = Ext.create('Ext.data.Store', {
        storeId: 'testStore',
        model: 'Person'
    });

    beforeEach(function (done) {
        var myDbName = dbName,
            myDbUrl = dbUrl;

        PouchDB(myDbUrl + myDbName).destroy(function (err, info) {
            new PouchDB(myDbUrl + myDbName,function(err, info) {
                done();
            });

        });
    });

    afterEach(function (done) {
        PouchDB(dbUrl + dbName).destroy(function (err, info) {
            expect(err).toBeNull();
            done();
        });
    });

//     it('can create and load a new Model object', function (done) {
//         var id,
//             rev;
//
//         var person = new Person({ name: 'Ralph', age: 30 });
//         id = person.getId();
//
//         //expect(id).toBe('');
//         person.save({
//             success: function (records,operation,success) {
//                 id = person.getId();
//                 rev = person.get('_rev');
//
//                 expect(id).toBeDefined();
//                 expect(person.get('_id')).toBe(id);
//                 expect(rev).toBeDefined();
//                 expect(person.get('name')).toBe('Ralph');
//                 expect(person.get('age')).toBe(30);
//                 person = null;
//                 done();
//             }
//         });
//     });
////
//    it('can update an existing Model object', function (done) {
//        var id,
//            rev;
//
//        var person = new Person({ name: 'Teddy', age: 31 });
//        id = person.getId();
//        person.save({
//            success: function (records,operation,success) {
//                console.log(success);
//                id = person.getId();
//                rev = person.get('_rev');
//                person = null;
//                expect(person).toBeNull();
//                console.log(id);
//                Person.load(id, {
//                    success: function (record, operation) {
//
//                        person = record;
//                        person.set('name', 'Fred');
//                        person.set('age', 21);
//                        person.save({
//                            success: function () {
//                                person = null;
//                                Person.load(id, {
//                                    callback: function (record, operation) {
//                                        person = record;
//                                        expect(person).toBeDefined();
//                                        expect(person.getId()).toBe(id);
//                                        expect(person.get('_rev')).toBeDefined();
//                                        expect(person.get('_rev')).not.toBe(rev);
//                                        expect(person.get('name')).toBe('Fred');
//                                        expect(person.get('age')).toBe(21);
//                                        done();
//                                    }
//                                });
//                            }
//                        });
//                    }
//                });
//            }
//        });
//    });
////// //
//     it('can delete a Model object', function (done) {
//         var id,
//             person = new Person({ name: 'Ralph', age: 32 });
//
//         person.save({
//             callback: function () {
//                 id = person.getId();
//                 person = null;
//                 Person.load(id, {
//                     success: function (record, operation) {
//                         person = record;
//                         person.erase({
//                             callback: function () {
//                                 Person.load(id, {
//                                     callback: function (record, operation) {
//                                         //should get a 404
//                                         expect(operation.error.status).toBe(404);
//                                         done();
//                                     }
//                                 });
//                             }
//                         });
//                     }
//                 });
//             }
//         });
//     });
////// //
//     it('can load all Model objects using a Store', function (done) {
//         var person1 = new Person({ name: 'Ralph', age: 33 }),
//             person2 = Ext.create('Person', { name: 'Jane', age: 43 }),
//             person3 = Ext.create('Person', { name: 'David', age: 53 }),
//             allPeople = 0,
//             addPerson;
//
//         person1.save({
//             success: function (person, request) {
//                 store.add(person);
//                 addPerson();
//             }
//         });
//
//         person2.save({
//             success: function (person, request) {
//                 store.add(person);
//                 addPerson();
//             }
//         });
//
//         person3.save({
//             success: function (person, request) {
//                 store.add(person);
//                 addPerson();
//             }
//         });
//
//         addPerson = function () {
//             allPeople++;
//             if (allPeople === 3) {
//                 expect(store.getRange().length).toBe(3);
//                 done();
//             }
//         };
//     });
//
//     it('can read and write nested data', function (done) {
//         var person = new Person({ name: 'Ralph', age: 30 }),
//             dog = new Dog({color: 'Yellow', name: 'Fido'}),
//             cat = new Cat({color: 'Brown', name: 'Felix'});
//
//         dog.cats().add(cat);
//         person.dogs().add(dog);
//         person.save({
//             success: function (person, request) {
//                 Person.load(person.getId(), {
//                     callback: function (person, operation) {
//                         var dog,
//                             cat;
//                         dog = person.dogs().getAt(0);
//                         cat = dog.cats().getAt(0);
//                         expect(dog.get('color')).toBe('Yellow');
//                         expect(dog.get('name')).toBe('Fido');
//                         expect(cat.get('color')).toBe('Brown');
//                         expect(cat.get('name')).toBe('Felix');
//                         done();
//                     }
//                 });
//                 //done();
//             }
//         });
//     });
// //
     it('can have parent document be saved by calling save on a new(phantom) nested object', function (done) {
         var person = new Person({ name: 'Ralph', age: 30 }),
             dog = new Dog({color: 'Yellow', name: 'Fido'});

         person.dogs().add(dog);

         //in order to save a phantom record innerOf must be set manually. I can't figure out a good way to do this in the lib itself.
         dog.save({
             callback: function (person, request) {
                 debugger;
                 Person.load(person.getId(), {
                     callback: function (person, operation) {
                         debugger;
                         expect(person.dogs().first().get('color')).toBe('Yellow');
                         expect(person.dogs().first().get('name')).toBe('Fido');
                         done();
                     }
                 });
                 //done();
             }
         });
     });
// //
     it('can have parent document be saved by calling nested object', function (done) {
         var person = new Person({ name: 'Ralph', age: 30 }),
             dog = new Dog({color: 'Yellow', name: 'Fido'});

         person.dogs().add(dog);

         person.save({
             callback: function (person, request) {
                 Person.load(person.getId(), {
                     callback: function (person, operation) {
                         dog = person.dogs().first();
                         dog.save({
                             callback: function(person, operation){
                                 debugger;
                                 expect(person.dogs().first().get('color')).toBe('Yellow');
                                 expect(person.dogs().first().get('name')).toBe('Fido');
                                 done();
                             }
                         });

                     }
                 });
             }
         });
     });
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