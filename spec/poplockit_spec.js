(function() {

  describe("$.fn.popLockIt", function() {
    it("should be chainable", function() {
      var item;
      item = $el.popLockIt({
        feedItems: $el.children(),
        columnSelector: '.',
        margin: 10
      });
      return $el.should === item;
    });
    it("should require settings to be passed in", function() {
      return expect(function() {
        return $el.popLockIt();
      }).toThrow(new Error("You must pass settings"));
    });
    it("should require being called on an element", function() {
      return expect(function() {
        return $.fn.popLockIt({
          feedItems: $el.children(),
          columnSelector: '.',
          margin: 10
        });
      }).toThrow(new Error("PopLockIt must be called on an element"));
    });
    return it("sould raise error on invalid method", function() {
      return expect(function() {
        return $el.popLockIt('invalid');
      }).toThrow(new Error("Method invalid does not exist on jQuery.popLockIt"));
    });
  });

}).call(this);
