beforeEach ->
  # Add a div to hold html elements
  $("<div id='test-container'></div>").appendTo('body')
  window.$el = $('#test-container')

afterEach ->
  $('#test_container').remove()
