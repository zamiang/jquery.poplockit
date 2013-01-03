describe "$.fn.popLockIt", ->

  it "should be chainable", ->
    @$el.popLockIt        
      feedItems      : this.$el.children(),
      columnSelector : '.',
      margin         : 10
    @$el.should == item

  it "should require settings to be passed in", ->
    raises @$el.popLockIt(), Error, "must throw error to pass"

  it "sould raise error on invalid method", ->
    raises @$el.popLockIt('invalid'), Error, "must throw error to pass"
