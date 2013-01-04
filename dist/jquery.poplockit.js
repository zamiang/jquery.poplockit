/*! jQuery.popLockIt - v0.1.0 - 2013-01-04
* https://github.com/zamiang/jquery.popLockIt
* Copyright (c) 2013 Brennan Moore; Licensed MIT */

(function() {
  var $, Base, Column, Feed, FeedItem, methods,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = jQuery;

  Base = (function() {

    Base.prototype.requires = [];

    function Base($el, settings) {
      var require, _i, _len, _ref;
      _ref = this.requires;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        require = _ref[_i];
        if (settings[require] == null) {
          throw "You must pass " + require;
        }
      }
    }

    return Base;

  })();

  Column = (function(_super) {

    __extends(Column, _super);

    Column.prototype.requires = ['height', 'margin'];

    function Column($el, settings) {
      Column.__super__.constructor.call(this, $el, settings);
      this.$el = $el;
      this.settings = settings;
      this.height = settings.height;
      this.setDimensions();
      this;

    }

    Column.prototype.setDimensions = function(height) {
      if (height) {
        this.height = height;
      }
      this.top = this.$el.offset().top - this.settings.margin;
      this.left = this.$el.offset().left;
      return this.bottom = this.top + this.height - this.$el.outerHeight(true);
    };

    Column.prototype.setPosition = function(pos, direction) {
      if (pos == null) {
        pos = 'absolute';
      }
      if (direction == null) {
        direction = 'north';
      }
      return this.$el.css({
        position: pos,
        top: direction === 'north' ? this.settings.margin : 'auto',
        bottom: direction === 'south' ? this.settings.margin : 'auto',
        left: this.left
      });
    };

    Column.prototype.onScroll = function(scrollTop, viewportHeight) {
      if (viewportHeight >= this.height) {
        return;
      }
      if (scrollTop >= this.top && scrollTop < this.bottom) {
        return this.setPosition('fixed');
      }
      if (scrollTop < this.top) {
        return this.setPosition('absolute', 'north');
      }
      if (scrollTop >= this.bottom) {
        return this.setPosition('absolute', 'south');
      }
    };

    Column.prototype.destroy = function() {
      return this.setPosition();
    };

    return Column;

  })(Base);

  FeedItem = (function(_super) {

    __extends(FeedItem, _super);

    FeedItem.prototype.requires = ['columnSelector'];

    function FeedItem($el, settings) {
      var height, _ref;
      FeedItem.__super__.constructor.call(this, $el, settings);
      this.$el = $el;
      this.settings = settings;
      this.setDimensions();
      this.$columns = this.$el.find(settings.columnSelector);
      height = this.height;
      if (((_ref = this.$columns) != null ? _ref.length : void 0) > 0) {
        this.columns = this.$columns.map(function() {
          return new Column($(this), {
            height: height,
            margin: settings.margin
          });
        });
      }
      this;

    }

    FeedItem.prototype.setDimensions = function() {
      this.height = this.$el.outerHeight(true);
      this.top = this.$el.offset().top - this.settings.margin;
      this.bottom = this.top + this.height;
      return this.$el.css({
        height: "" + this.height + "px",
        position: "relative"
      });
    };

    FeedItem.prototype.onScroll = function(scrollTop, viewportHeight) {
      var column, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (scrollTop >= this.top && scrollTop < this.bottom) {
        this.active = true;
        _ref = this.columns;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          column = _ref[_i];
          _results.push(column.onScroll(scrollTop, viewportHeight));
        }
        return _results;
      } else if (this.active) {
        _ref1 = this.columns;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          column = _ref1[_j];
          column.onScroll(scrollTop, viewportHeight);
        }
        return this.active = false;
      }
    };

    FeedItem.prototype.destroy = function() {
      var column, _i, _len, _ref, _results;
      _ref = this.columns;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        column = _ref[_i];
        _results.push(column.destroy());
      }
      return _results;
    };

    return FeedItem;

  })(Base);

  Feed = (function(_super) {

    __extends(Feed, _super);

    Feed.prototype.defaults = {
      active: true,
      rendered: false
    };

    Feed.prototype.feedItems = [];

    Feed.prototype.requires = ['feedItems'];

    function Feed($el, settings) {
      this.onResize = __bind(this.onResize, this);
      Feed.__super__.constructor.call(this, $el, settings);
      if (!($el.length > 0)) {
        throw "PopLockIt must be called on an element";
      }
      this.$el = $el;
      this.$window = $(window);
      this.detectiOS();
      this.initRequestAnimationFrame();
      this.settings = $.extend(this.defaults, settings);
      this.addFeedIitems(this.settings.feedItems);
      this.bindWindowEvents();
    }

    Feed.prototype.addFeedIitems = function($feedItems) {
      var $item;
      return this.feedItems = this.feedItems.concat((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = $feedItems.length; _i < _len; _i++) {
          $item = $feedItems[_i];
          _results.push(new FeedItem($($item), this.settings));
        }
        return _results;
      }).call(this));
    };

    Feed.prototype.onScroll = function() {
      var item, scrollTop, _i, _len, _ref,
        _this = this;
      if (!this.settings.active) {
        return;
      }
      scrollTop = this.$window.scrollTop();
      if (scrollTop === this.previousScrollTop) {
        return window.requestAnimationFrame((function() {
          return _this.onScroll();
        }));
      }
      this.scrollingDown = this.previousScrollTop < scrollTop;
      _ref = this.feedItems;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        item.onScroll(scrollTop, this.height);
      }
      this.previousScrollTop = scrollTop;
      return window.requestAnimationFrame((function() {
        return _this.onScroll();
      }));
    };

    Feed.prototype.onResize = function() {
      var item, _i, _len, _ref;
      _ref = this.feedItems;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        item.onScroll(this.previousScrollTop, this.$window.height());
      }
      return this.height = this.$window.outerHeight(true);
    };

    Feed.prototype.bindWindowEvents = function() {
      var _this = this;
      window.requestAnimationFrame((function() {
        return _this.onScroll();
      }));
      if (!this.IS_IOS) {
        return this.$window.bind('resize.feedItem', this.debounce(this.onResize, 100));
      }
    };

    Feed.prototype.unbindWindowEvents = function() {
      return this.$window.unbind('.feedItem');
    };

    Feed.prototype.destroy = function() {
      var item, _i, _len, _ref;
      this.settings.rendered = false;
      this.settings.active = false;
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        this.feedItems.destroy();
      }
      return this.unbindWindowEvents();
    };

    Feed.prototype.debounce = function(func, wait) {
      var timeout;
      timeout = 0;
      return function() {
        var args, throttler,
          _this = this;
        args = arguments;
        throttler = function() {
          timeout = null;
          return func(args);
        };
        clearTimeout(timeout);
        return timeout = setTimeout(throttler, wait);
      };
    };

    Feed.prototype.detectiOS = function() {
      var uagent;
      uagent = navigator.userAgent.toLowerCase();
      return this.IS_IOS = uagent.match(/(iPhone|iPod|iPad)/i) != null;
    };

    Feed.prototype.initRequestAnimationFrame = function() {
      var lastTime, vendor, vendors, _i, _len;
      if (window.requestAnimationFrame) {
        return;
      }
      lastTime = 0;
      vendors = ['ms', 'moz', 'webkit', 'o'];
      for (_i = 0, _len = vendors.length; _i < _len; _i++) {
        vendor = vendors[_i];
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window["" + vendor + "RequestAnimationFrame"];
        }
      }
      if (!window.requestAnimationFrame) {
        return window.requestAnimationFrame = function(callback, element) {
          var currTime, id, timeToCall;
          currTime = new Date().getTime();
          timeToCall = Math.max(0, 16 - (currTime - lastTime));
          id = window.setTimeout((function() {
            return callback(currTime + timeToCall);
          }), timeToCall);
          lastTime = currTime + timeToCall;
          return id;
        };
      }
    };

    return Feed;

  })(Base);

  methods = {
    initialize: function(settings) {
      if (settings == null) {
        throw "You must pass settings";
      }
      this.feed = new Feed($(this), settings);
      return this;
    },
    destroy: function() {
      $(window).unbind('resize.popLockIt');
      return this.feed.destroy();
    },
    recompute: function() {
      var column, feedItem, _i, _len, _ref, _results;
      _ref = this.feed.feedItems;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        feedItem = _ref[_i];
        feedItem.setDimensions();
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = feedItem.columns;
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            column = _ref1[_j];
            _results1.push(colum.setDimensions(feedItem.height));
          }
          return _results1;
        })());
      }
      return _results;
    },
    onScroll: function() {
      return this.feed.onScroll();
    },
    addFeedItems: function($feedItems) {
      if (!(($feedItems != null) && $feedItems.length)) {
        throw "You must pass $feedItems";
      }
      return this.feed.addFeedIitems($feedItems);
    }
  };

  $.fn.popLockIt = function(method) {
    if (methods[method] != null) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === "object" || !(method != null)) {
      return methods.initialize.apply(this, arguments);
    } else {
      return $.error("Method " + method + " does not exist on jQuery.popLockIt");
    }
  };

}).call(this);
