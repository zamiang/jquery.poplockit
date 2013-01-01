# lockito
# https://github.com/zamiang/lockit-js
#
# Copyright (c) 2012 Brennan Moore
# Licensed under the MIT license.

$ = jQuery
  
class Column

  requires: ['height', 'margin', 'defaultTop', 'defaultbottom']

  constructor: ($el, settings) ->
    for require in @requires
      throw "You must pass #{require}" unless settings[require]?
    @$el = $el
    @settings = settings
    @setDimensions()

  setDimensions: (height) ->
    @settings.height = height if height
    @top = @$el.offset().top
    @bottom = top + @settings.height - @$el.outerHeight(true) - (@settings.margin * 2)

  setPosition: (pos = 'absolute', direction = 'north') ->
    @$el.css {
      position : pos
      top      : if direction == 'north' then @settings.defaultTop else 'auto'
      bottom   : if direction == 'south' then @settings.defaultBottom else 'auto'
    }

  onScroll: (scrollTop, viewportHeight) ->
    return if viewportHeight >= @height
    return @setPosition('fixed') if scrollTop >= @top and scrollTop < @bottom
    return @setPosition('absolute', 'north') if scrollTop < @top
    return @setPosition('absolute', 'south') if scrollTop >= @bottom


class Ul

  defaults: 
    defaultTop: '90px'
    defaultBottom: '90px'
    margin: 90
    active: true
    rendered: false

  requires: []

  constructor: (settings) ->
    for require in @requires
      throw "You must pass #{require}" unless settings[require]?

    @detectiOS()
    @initRequestAnimationFrame()

    @settings = $.extend @defaults, settings
    items = @$el?.find('> li')
    if items
      @items = items.map -> new Li($(this), @settings)

  onScroll: =>
    return unless @active
    scrollTop = @$win.scrollTop()

    if scrollTop == @previousScrollTop
      return @requestAnimationFrame @onScroll

    @scrollingDown = @previousScrollTop < scrollTop
    for item in @items
      item.onScroll scrollTop, @height

    @previousScrollTop = scrollTop

    @requestAnimationFrame @onScroll

  recomputeEachLiHeight: -> item.setWayPointThrottled() for item in @items
  repositionEachLi: -> item.onScroll(@previousScrollTop, @$win.height()) for item in @items

  onResize: ->
    @setMaxWidth()
    for item in @items
      item.onResize()
      item.onScroll @previousScrollTop, @$win.height()
    @height = @$win.outerHeight(true)

  bindWindowEvents: ->
    @requestAnimationFrame @onScroll
    unless @IS_IOS
      @$win.bind 'resize.feedItem', @debounce(@onResize, 100)

  unbindWindowEvents: -> @$win.unbind('.feedItem')

  destroy: ->
    @settings.rendered = false
    @setttings.active = false
    @item.destroy() for item in @items



  ##
  ## Helpers 
  # from underscore.js
  debounce: (func, wait) ->
    timeout = 0
    return ->
      args = arguments
      throttler = =>
        timeout = null
        func args

      clearTimeout timeout
      timeout = setTimeout(throttler, wait)

  # iOS has a unique set of scroll issues
  # - does not update scrollTop until touchEnd event is fired (does not update while scrolling -- only when done)
  # - resize event fires when document height or width change (such as when items are added to the dom)
  detectiOS: ->
    uagent = navigator.userAgent.toLowerCase()
    @IS_IOS = uagent.match(/(iPhone|iPod|iPad)/i)?

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
    throw "You must pass settings" unless settings?
    @ul = new Ul(settings)
    @

  destroy: ->
    $(window).unbind 'resize.lockit'
    @ul.destroy()

$.fn.lockit = (method) ->
  if methods[method]?
    methods[method].apply @, Array::slice.call(arguments, 1)
  else if typeof method is "object" or not method?
    methods.initialize.apply @, arguments
  else
    $.error "Method #{method} does not exist on jQuery.lockit"
