(function() {

  beforeEach(function() {
    $("<div id='test-container'></div>").appendTo('body');
    return window.$el = $('#test-container');
  });

  afterEach(function() {
    return $('#test_container').remove();
  });

}).call(this);
