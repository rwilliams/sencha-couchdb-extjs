describe("Prerequisites", function() {
   it("has loaded ExtJS 6.0.x", function() {
     expect(Ext).toBeDefined();
     expect(Ext.getVersion()).toBeTruthy();
     expect(Ext.getVersion().major).toEqual(6);
     expect(Ext.getVersion().minor === 0).toBeTruthy();
   });
});