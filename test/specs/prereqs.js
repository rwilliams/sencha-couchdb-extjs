describe("Prerequisites", function() {
   it("has loaded ExtJS 5.0.x", function() {
     expect(Ext).toBeDefined();
     expect(Ext.getVersion()).toBeTruthy();
     expect(Ext.getVersion().major).toEqual(5);
     expect(Ext.getVersion().minor === 0).toBeTruthy();
   });
});