describe "$.fn.popLockIt", ->

  it "should be chainable", ->
    item = $el.popLockIt
      feedItems      : $el.children(),
      columnSelector : '.',
      margin         : 10
    $el.should == item

  it "should require settings to be passed in", ->
    expect( -> $el.popLockIt()).toThrow new Error("You must pass settings")

  it "should require being called on an element", ->
    expect( -> $.fn.popLockIt(
      feedItems      : $el.children(),
      columnSelector : '.',
      margin         : 10
    )).toThrow new Error("PopLockIt must be called on an element")

  it "sould raise error on invalid method", ->
    expect( -> $el.popLockIt('invalid')).toThrow new Error("Method invalid does not exist on jQuery.popLockIt")
