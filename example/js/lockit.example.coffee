#
# Lockit.js example code
#
# Generates html to demonstrate what lockit.js does
# creates 'feedItems' that consist of columns of placekittens
# each of these columns will 'pop' and 'lock' in place as the user scrolls
#
# @requires jQuery
# @requires lockit.js

App = 
  defaults:
    numberItems: 2
    numberColumns: 4
    kittenHeight: 400
    columnPadding: 20

  initialize: ->
    @columnWidth = @getColumnWidth()
    $('body')
      .html(@generateFeedHtml())
      .find('> ul').lockit({})

  getColumnWidth: -> Math.floor($('body').width() / @defaults.numberColumns) - 40

  generateFeedHtml: ->
    [1..@defaults.numberItems].map =>
      "<ul>" + [1..@defaults.numberColumns].map =>
        @generateKittensHtml Math.ceil(Math.random() * 10)
      .join('') + "</ul>"
    .join('')

  generateKittensHtml: (num) ->
    "<ul style='width: #{@columnWidth}px'>" + [1..num].map =>
      height = Math.ceil(50 + (Math.random() * 600))
      width = @columnWidth - @defaults.columnPadding
      "<li style='width: #{width}px'><img height='#{height}' width='#{width}' src='http://placekitten.com/#{width}/#{height}'></li>"
    .join('') + "</ul>"

$ -> App.initialize()
