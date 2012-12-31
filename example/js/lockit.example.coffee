App = 
  defaults:
    numberItems: 2
    numberColumns: 4
    kittenHeight: 400
    columnPadding: 20

  # generate a whole bunch of html and then initialize lockitjs
  initialize: ->
    @columnWidth = @getColumnWidth()
    $('body')
      .html(@generateFeedHtml())
      .find('> ul').lockit()

  getColumnWidth: -> Math.floor($('body').width() / @defaults.numberColumns) - 80

  generateFeedHtml: ->
    [1..@defaults.numberItems].map =>
      "<ul>" + [1..@defaults.numberColumns].map =>
        numberKittens = Math.ceil(Math.random() * 10)
        @generateKittens numberKittens
      .join('') + "</ul>"
    .join('')

  generateKittens: (num) ->
    "<ul style='width: #{@columnWidth}px'>" + [1..num].map =>
      height = Math.ceil(50 + (Math.random() * 600))
      width = @columnWidth - @defaults.columnPadding
      "<li style='width: #{width}px'><img height='#{height}' width='#{width}' src='http://placekitten.com/#{width}/#{height}'></li>"
    .join('') + "</ul>"

$ -> App.initialize()
