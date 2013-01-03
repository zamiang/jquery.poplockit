beforeEach ->
  # Add a div to hold html elements
  $('<div />').attr('id', 'test_container').css('display','none').appendTo('body')
  @container = $('#test_container')

afterEach ->
  $('#test_container').remove()
