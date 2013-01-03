(function() {

  beforeEach(function() {
    $('<div />').attr('id', 'test_container').css('display', 'none').appendTo('body');
    return this.container = $('#test_container');
  });

  afterEach(function() {
    return $('#test_container').remove();
  });

}).call(this);
