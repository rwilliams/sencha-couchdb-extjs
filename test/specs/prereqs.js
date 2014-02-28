describe("Prerequisites", function() {
   it("has loaded ExtJS 4.2.x", function() {
     expect(Ext).toBeDefined();
     expect(Ext.getVersion()).toBeTruthy();
     expect(Ext.getVersion().major).toEqual(4);
     expect(Ext.getVersion().minor === 2).toBeTruthy();
   });
});