(function() {

  describe("$.fn.popLockIt", function() {
    it("should be chainable", function() {
      $el.popLockIt({
        feedItems: $el.children(),
        columnSelector: '.',
        margin: 10
      });
      return $el.should === item;
    });
    it("should require settings to be passed in", function() {
      return raises($el.popLockIt(), Error, "must throw error to pass");
    });
    return it("sould raise error on invalid method", function() {
      return raises($el.popLockIt('invalid'), Error, "must throw error to pass");
    });
  });

}).call(this);
