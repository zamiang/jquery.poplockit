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

(($, window, document) ->

  pluginName = "popLockIt"

  class Base

    requires: []

    constructor: ($el, settings) ->
      for require in @requires
        throw "You must pass #{require}" unless settings[require]?


  class Column extends Base

    requires: ['height', 'marginTop', 'marginLeft', 'marginBottom']
    cssProperties: ['position', 'top', 'bottom', 'left']

    constructor: ($el, settings) ->
      super($el, settings)
      @$el = $el
      @settings = settings

      # defaults
      @marginTop = 0
      @marginBottom = 0
      @marginLeft = 0

      @setDimensions settings.height, settings.marginTop, settings.marginBottom, settings.marginLeft
      @

    setDimensions: (parentHeight, marginTop, marginBottom, marginLeft) ->
      @parentHeight = parentHeight if parentHeight
      @marginTop = marginTop if marginTop
      @marginBottom = marginBottom if marginBottom
      @marginLeft = marginLeft if marginLeft

      @height = Number(@$el.css('height').replace('px',""))
      @top = @$el.offset().top - @marginTop
      @left = @$el.offset().left

      @bottom = @top + @parentHeight - @height - (@marginBottom * 2)

      @top = 1 if @top < 1

    setPosition: (pos = 'absolute', direction = 'north') ->
      newState =
        position : pos
        top      : if direction == 'north' then @marginTop else 'auto'
        bottom   : if direction == 'south' then @marginBottom else 'auto'
        left     : if pos == 'fixed' then @left else @left - (@marginLeft || 0)

      unless @oldState
        @$el.css newState
        return @oldState = newState

      diff = {}
      changed = false
      for prop in @cssProperties
        if newState[prop] != @oldState[prop]
          diff[prop] = newState[prop]
          changed = true

      if changed
        @$el.css diff
        @oldState = newState

    onScroll: (scrollTop, viewportHeight, preventFixed) ->
      return @setPosition('fixed') if !preventFixed and scrollTop >= @top and scrollTop < @bottom
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
      @createColumns()
      @

    createColumns: ->
      @$columns = @$el.find @settings.columnSelector

      height = @height
      left = @left
      marginTop = @marginTop
      marginBottom = @marginBottom

      if @$columns?.length > 0
        @columns = @$columns.map -> new Column $(this),
          height       : height
          marginTop    : marginTop
          marginBottom : marginBottom
          marginLeft   : left

    setDimensions: ->
      # accomodate for when feed items have different padding
      @marginTop = Number(@$el.css('padding-top').replace('px', ''))
      @marginBottom = Number(@$el.css('padding-bottom').replace('px', ''))

      height = @$el.css('height')
      @height = Number(height.replace('px',""))
      @$el.css
        height: @height
        position: "relative"

      @left = @$el.offset().left
      @top = @$el.offset().top - @marginTop
      @bottom = @top + @height

    onScroll: (scrollTop, viewportHeight) ->
      # only trigger onscroll for columns if we are in the feeditem
      if viewportHeight >= @height
        @active = false
        return
      else if scrollTop >= @top and scrollTop < @bottom
        @active = true
        column.onScroll(scrollTop, viewportHeight) for column in @columns
      else if @active
        column.onScroll(scrollTop, viewportHeight, true) for column in @columns
        @active = false

    destroy: ->
      column.destroy() for column in @columns


  class Feed extends Base

    feedItems: []
    requires: ['feedItems']

    defaults:
      active: true
      rendered: false

    constructor: (el, settings) ->
      @$el = $(el)
      super(@$el, settings)
      throw "PopLockIt must be called on an element" unless @$el?.length > 0
      throw "You must pass settings" unless settings?

      @$window = $(window)
      @detectiOS()
      @initRequestAnimationFrame()
      @setViewportHeight()

      @$el.css
        'box-sizing': 'border-box'
        overflow    : 'hidden'

      @settings = $.extend @defaults, settings

      @addFeedItems @settings.feedItems

      @bindWindowEvents()
      @

    onScroll: ->
      return unless @settings.active
      scrollTop = @$window.scrollTop()

      if scrollTop == @previousScrollTop
        return window.requestAnimationFrame (=> @onScroll())

      for item in @feedItems
        item.onScroll scrollTop, @viewportHeight

      @previousScrollTop = scrollTop

      window.requestAnimationFrame (=> @onScroll())

    # recomputes height / top / bottom etc of each feed item and its columns
    recompute: ->
      for feedItem in @feedItems
        feedItem.setDimensions()
        for column in feedItem.columns
          column.setDimensions feedItem.height, feedItem.settings.marginTop, feedItem.settings.marginBottom, feedItem.left

    addFeedItems: ($feedItems) ->
      throw "You must pass $feedItems" unless $feedItems? and $feedItems.length
      @feedItems = @feedItems.concat(new FeedItem($($item), @settings) for $item in $feedItems)

    onResize: =>
      @setViewportHeight()
      for item in @feedItems
        item.onScroll @previousScrollTop, @viewportHeight

    setViewportHeight: -> @viewportHeight = @$window.outerHeight(true)

    bindWindowEvents: ->
      window.requestAnimationFrame (=> @onScroll())
      unless @IS_IOS
        @$window.bind 'resize.feedItem', @debounce(@onResize, 100)

    unbindWindowEvents: -> @$window.unbind('.feedItem')

    destroy: ->
      $(window).unbind 'resize.popLockIt'
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

  # A really lightweight plugin wrapper around the constructor,
  # preventing against multiple instantiations
  $.fn[pluginName] = (options) ->
    if !$.data(@, "plugin_#{pluginName}")
      throw "You must pass settings" unless options?
      $.data(@, "plugin_#{pluginName}", new Feed(@, options))
    else if $.data(@, "plugin_#{pluginName}")[options]?
      $.data(@, "plugin_#{pluginName}")[options] Array::slice.call(arguments, 1)

)(jQuery, window, document)
