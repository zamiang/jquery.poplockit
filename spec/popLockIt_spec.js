(function() {

  describe("$.fn.popLockIt", function() {
    it("should be chainable", function() {
      this.$el.popLockIt({
        feedItems: this.$el.children(),
        columnSelector: '.',
        margin: 10
      });
      return this.$el.should === item;
    });
    it("should require settings to be passed in", function() {
      return raises(this.$el.popLockIt(), Error, "must throw error to pass");
    });
    return it("sould raise error on invalid method", function() {
      return raises(this.$el.popLockIt('invalid'), Error, "must throw error to pass");
    });
  });

}).call(this);
