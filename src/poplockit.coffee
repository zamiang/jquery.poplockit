# jquery.popLockIt
# https://github.com/zamiang/jquery.popLockIt
#
# Copyright (c) 2012 Brennan Moore
# Licensed under the MIT license.
#
# DOM STRUCTURE:
# Feed
# -- FeedItem
# ---- Column
# ---- Column
# ---- Column
# -- FeedItem
# ---- Column
# ...

$ = jQuery
  
class Base

  requires: []

  constructor: ($el, settings) ->
    for require in @requires
      throw "You must pass #{require}" unless settings[require]?


class Column extends Base

  requires: ['height', 'margin']

  constructor: ($el, settings) ->
    super($el, settings)
    @$el = $el
    @settings = settings
    @height = settings.height
    @setDimensions()
    @

  setDimensions: (height) ->
    @height = height if height
    @top = @$el.offset().top - @settings.margin
    @left = @$el.offset().left
    @bottom = @top + @height - @$el.outerHeight(true)

  setPosition: (pos = 'absolute', direction = 'north') ->
    @$el.css
      position : pos
      top      : if direction == 'north' then @settings.margin else 'auto'
      bottom   : if direction == 'south' then @settings.margin else 'auto'
      left     : @left

  onScroll: (scrollTop, viewportHeight) ->
    return if viewportHeight >= @height
    return @setPosition('fixed') if scrollTop >= @top and scrollTop < @bottom
    return @setPosition('absolute', 'north') if scrollTop < @top
    return @setPosition('absolute', 'south') if scrollTop >= @bottom

  # return to default state on destroy
  destroy: -> @setPosition()


class FeedItem extends Base

  requires: ['columnSelector']

  constructor: ($el, settings) ->
    super($el, settings)
    @$el = $el
    @settings = settings
    @setDimensions()
    
    @$columns = @$el.find(settings.columnSelector)

    height = @height
    @columns = @$columns.map -> new Column $(this),
      height: height
      margin: settings.margin
    @

  setDimensions: ->
    @height = @$el.outerHeight(true)
    @top = @$el.offset().top - @settings.margin
    @bottom = @top + @height
    @$el.css
      height: "#{@height}px"
      position: "relative"

  onScroll: (scrollTop, viewportHeight) ->
    # only trigger onscroll for columns if we are in the feeditem
    if scrollTop >= @top and scrollTop < @bottom
      @active = true
      column.onScroll(scrollTop, viewportHeight) for column in @columns
    else if @active
      column.onScroll(scrollTop, viewportHeight) for column in @columns
      @active = false

  destroy: ->
    column.destroy() for column in @columns


class Feed extends Base

  defaults: 
    active: true
    rendered: false

  feedItems: []
  requires: ['feedItems']

  constructor: ($el, settings) ->
    super($el, settings)
    throw "PopLockIt must be called on an element" unless $el.length > 0

    @$el = $el
    @$window = $(window)
    @detectiOS()
    @initRequestAnimationFrame()

    @settings = $.extend @defaults, settings

    @addFeedIitems @settings.feedItems

    @bindWindowEvents()

  addFeedIitems: ($feedItems) ->
    @feedItems = @feedItems.concat(new FeedItem($($item), @settings) for $item in $feedItems)

  onScroll: ->
    return unless @settings.active
    scrollTop = @$window.scrollTop()

    if scrollTop == @previousScrollTop
      return window.requestAnimationFrame (=> @onScroll())

    @scrollingDown = @previousScrollTop < scrollTop
    for item in @feedItems
      item.onScroll scrollTop, @height

    @previousScrollTop = scrollTop

    window.requestAnimationFrame (=> @onScroll())

  onResize: =>
    for item in @feedItems
      item.onScroll @previousScrollTop, @$window.height()
    @height = @$window.outerHeight(true)

  bindWindowEvents: ->
    window.requestAnimationFrame (=> @onScroll())
    unless @IS_IOS
      @$window.bind 'resize.feedItem', @debounce(@onResize, 100)

  unbindWindowEvents: -> @$window.unbind('.feedItem')

  destroy: ->
    @settings.rendered = false
    @settings.active = false
    @feedItems.destroy() for item in @items
    @unbindWindowEvents()


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

  # Identify iOS devices and bind on resize instead of setinterval
  #
  # iOS has a unique set of scroll issues
  # - does not update scrollTop until touchEnd event is fired (does not update while scrolling -- only when done)
  # - resize event fires when document height or width change (such as when items are added to the dom)
  detectiOS: ->
    uagent = navigator.userAgent.toLowerCase()
    @IS_IOS = uagent.match(/(iPhone|iPod|iPad)/i)?

  # http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  # requestAnimationFrame polyfill by Erik Moller
  # fixes from Paul Irish and Tino Zijdel
  #
  # todo: put this on @
  initRequestAnimationFrame: ->
    return if window.requestAnimationFrame

    lastTime = 0
    vendors = ['ms', 'moz', 'webkit', 'o']
    for vendor in vendors when not window.requestAnimationFrame
      window.requestAnimationFrame = window["#{vendor}RequestAnimationFrame"]

    unless window.requestAnimationFrame
      window.requestAnimationFrame = (callback, element) ->
        currTime = new Date().getTime()
        timeToCall = Math.max(0, 16 - (currTime - lastTime))
        id = window.setTimeout((-> callback(currTime + timeToCall)), timeToCall)
        lastTime = currTime + timeToCall
        id


methods =

  initialize: (settings) ->
    throw "You must pass settings" unless settings?
    @feed = new Feed($(@), settings)
    @

  destroy: ->
    $(window).unbind 'resize.popLockIt'
    @feed.destroy()

  # recomputes height / top / bottom etc of each feed item and its columns
  recompute: ->
    for feedItem in @feed.feedItems
      feedItem.setDimensions()
      for column in feedItem.columns
        colum.setDimensions feedItem.height

  onScroll: -> @feed.onScroll()

  addFeedItems: ($feedItems) ->
    throw "You must pass $feedItems" unless $feedItems? and $feedItems.length
    @feed.addFeedIitems $feedItems


$.fn.popLockIt = (method) ->
  if methods[method]?
    methods[method].apply @, Array::slice.call(arguments, 1)
  else if typeof method is "object" or not method?
    methods.initialize.apply @, arguments
  else
    $.error "Method #{method} does not exist on jQuery.popLockIt"
