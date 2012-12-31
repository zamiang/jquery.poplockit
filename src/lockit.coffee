# lockit
# https://github.com/zamiang/lockit-js
#
# Copyright (c) 2012 Brennan Moore
# Licensed under the MIT license.

$ = jQuery
  
class Column

  constructor: ($el, settings) ->
    @$el = $el
    @settings = settings

    @originalWidth = @width = @$el.outerWidth(false)
    @originalHeight = @height = @$el.height()

  setPosition: (pos = 'absolute', direction = 'north') ->
    css =
      position : pos
      top      : if direction == 'north' then @defaultTop else 'auto'
      bottom   : if direction == 'south' then @defaultBottom else 'auto'

    @$el.css css

  onScroll: (scrollTop, viewportHeight) ->
    return if viewportHeight >= @model.get('height')
    return @setPosition('fixed') if scrollTop >= @model.get('top') and scrollTop < @model.get('bottom')
    return @setPosition('absolute', 'north') if scrollTop < @model.get('top')
    return @setPosition('absolute', 'south') if scrollTop >= @model.get('bottom')


class Ul

  active: true
  rendered: false

  onScroll: =>
    return unless @active
    scrollTop = @$win.scrollTop()

    if scrollTop == @previousScrollTop
      return window.requestAnimationFrame @onScroll

    @scrollingDown = @previousScrollTop < scrollTop
    for item in @items
      item.onScroll scrollTop, @height

    @previousScrollTop = scrollTop

    window.requestAnimationFrame @onScroll

  recomputeEachLiHeight: -> item.setWayPointThrottled() for item in @items
  repositionEachLi: -> item.onScroll(@previousScrollTop, @$win.height()) for item in @items

  onResize: =>
    @setMaxWidth()
    for item in @items
      item.onResize()
      item.onScroll @previousScrollTop, @$win.height()
    @height = @$win.outerHeight(true)

  # creates a div w/ a max-width that correspods to the max-width of
  # artwork images and posts
  # allows us to keep image and post sizes responsive while knowing max width in JS
  setMaxWidth: ->
    @$el.append("<div class='max_width'></div>") unless @$('.max_width').length > 0
    @maxWidth = Number(@$el.find('.max_width').css('max-width').replace('px',''))

  bindWindowEvents: ->
    @requestAnimationFrame @onScroll
    unless App.IS_IOS
      @$win.bind 'resize.feedItem', @debounce(@onResize, 100)

  unbindWindowEvents: -> @$win.unbind('.feedItem')

  # from underscore.js
  # ----------------------------------
  debounce: (func, wait) ->
    timeout = 0
    return ->
      args = arguments
      throttler = =>
        timeout = null
        func args

      clearTimeout timeout
      timeout = setTimeout(throttler, wait)

  # http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  # requestAnimationFrame polyfill by Erik Moller
  # fixes from Paul Irish and Tino Zijdel
  initRequestAnimationFrame: ->
    if window.requestAnimationFrame
      # requestAnimationFrame is always paired with cancelAnimationFrame
      @requestAnimationFrame = window.requestAnimationFrame
      @cancelAnimationFrame = window.cancelAnimationFrame
      return

    lastTime = 0
    vendors = ['ms', 'moz', 'webkit', 'o']
    for vendor in vendors when not @requestAnimationFrame
      @requestAnimationFrame = window["#{vendor}RequestAnimationFrame"]
      @cancelAnimationFrame = window["#{vendor}CancelAnimationFrame"] or window["#{vendor}CancelAnimationFrame"]

    unless @requestAnimationFrame
      @requestAnimationFrame = (callback, element) ->
        currTime = new Date().getTime()
        timeToCall = Math.max(0, 16 - (currTime - lastTime))
        id = window.setTimeout((-> callback(currTime + timeToCall)), timeToCall)
        lastTime = currTime + timeToCall
        id

    unless @cancelAnimationFrame
      @cancelAnimationFrame = (id) -> clearTimeout id


methods =

  initialize: (settings) ->
    @settings = settings
    @

  destroy: ->
    $(window).unbind 'resize.lockit'


# Collection method.
$.fn.lockit = (method) ->
  if methods[method]?
    methods[method].apply @, Array::slice.call(arguments, 1)
  else if typeof method is "object" or not method?
    methods.initialize.apply @, arguments
  else
    $.error "Method #{method} does not exist on jQuery.lockit"

