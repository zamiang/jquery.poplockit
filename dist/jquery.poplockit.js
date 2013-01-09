/*! jQuery.popLockIt - v0.1.0 - 2013-01-08
* https://github.com/zamiang/jquery.popLockIt
* Copyright (c) 2013 Brennan Moore; Licensed MIT */

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function($, window, document) {
    var Base, Column, Feed, FeedItem, pluginName;
    pluginName = "popLockIt";
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

      Column.prototype.requires = ['height', 'marginTop', 'marginLeft', 'marginBottom'];

      Column.prototype.cssProperties = ['position', 'top', 'bottom', 'left'];

      function Column($el, settings) {
        Column.__super__.constructor.call(this, $el, settings);
        this.$el = $el;
        this.settings = settings;
        this.setDimensions(settings.height, settings.marginTop, settings.marginBottom, settings.marginLeft);
        this;

      }

      Column.prototype.setDimensions = function(parentHeight, marginTop, marginBottom, marginLeft) {
        if (parentHeight) {
          this.parentHeight = parentHeight;
        }
        if (marginTop) {
          this.marginTop = marginTop;
        }
        if (marginBottom) {
          this.marginBottom = marginBottom;
        }
        if (marginLeft) {
          this.marginLeft = marginLeft;
        }
        this.height = Number(this.$el.css('height').replace('px', ""));
        this.top = this.$el.offset().top - this.marginTop;
        this.left = this.$el.offset().left;
        this.bottom = this.top + this.parentHeight - this.height - (this.marginBottom * 2);
        if (this.top < 1) {
          return this.top = 1;
        }
      };

      Column.prototype.setPosition = function(pos, direction) {
        var changed, diff, newState, prop, _i, _len, _ref;
        if (pos == null) {
          pos = 'absolute';
        }
        if (direction == null) {
          direction = 'north';
        }
        newState = {
          position: pos,
          top: direction === 'north' ? this.marginTop : 'auto',
          bottom: direction === 'south' ? this.marginBottom : 'auto',
          left: pos === 'fixed' ? this.left : this.left - (this.marginLeft || 0)
        };
        if (!this.oldState) {
          this.$el.css(newState);
          return this.oldState = newState;
        }
        diff = {};
        changed = false;
        _ref = this.cssProperties;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          prop = _ref[_i];
          if (newState[prop] !== this.oldState[prop]) {
            diff[prop] = newState[prop];
            changed = true;
          }
        }
        if (changed) {
          this.$el.css(diff);
          return this.oldState = newState;
        }
      };

      Column.prototype.onScroll = function(scrollTop, viewportHeight, preventFixed) {
        if (!preventFixed && scrollTop >= this.top && scrollTop < this.bottom) {
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
        var height, left, _ref;
        FeedItem.__super__.constructor.call(this, $el, settings);
        this.$el = $el;
        this.settings = settings;
        this.setDimensions();
        this.$columns = this.$el.find(settings.columnSelector);
        height = this.height;
        left = this.left;
        if (((_ref = this.$columns) != null ? _ref.length : void 0) > 0) {
          this.columns = this.$columns.map(function() {
            return new Column($(this), {
              height: height,
              marginTop: settings.marginTop,
              marginBottom: settings.marginBottom,
              marginLeft: left
            });
          });
        }
        this;

      }

      FeedItem.prototype.setDimensions = function() {
        var height;
        height = this.$el.css('height');
        this.height = Number(height.replace('px', ""));
        this.$el.css({
          height: this.height,
          position: "relative"
        });
        this.left = this.$el.offset().left;
        this.top = this.$el.offset().top - this.settings.marginTop;
        return this.bottom = this.top + this.height;
      };

      FeedItem.prototype.onScroll = function(scrollTop, viewportHeight) {
        var column, _i, _j, _len, _len1, _ref, _ref1, _results;
        if (viewportHeight >= this.height) {
          this.active = false;
        } else if (scrollTop >= this.top && scrollTop < this.bottom) {
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
            column.onScroll(scrollTop, viewportHeight, true);
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

      Feed.prototype.feedItems = [];

      Feed.prototype.requires = ['feedItems'];

      Feed.prototype.defaults = {
        active: true,
        rendered: false
      };

      function Feed(el, settings) {
        this.onResize = __bind(this.onResize, this);

        var _ref;
        this.$el = $(el);
        Feed.__super__.constructor.call(this, this.$el, settings);
        if (!(((_ref = this.$el) != null ? _ref.length : void 0) > 0)) {
          throw "PopLockIt must be called on an element";
        }
        if (settings == null) {
          throw "You must pass settings";
        }
        this.$window = $(window);
        this.detectiOS();
        this.initRequestAnimationFrame();
        this.setViewportHeight();
        this.$el.css({
          'box-sizing': 'border-box',
          overflow: 'hidden'
        });
        this.settings = $.extend(this.defaults, settings);
        this.settings.marginTop = Number(this.$el.css('padding-top').replace('px', ''));
        this.settings.marginBottom = Number(this.$el.css('padding-bottom').replace('px', ''));
        this.addFeedItems(this.settings.feedItems);
        this.bindWindowEvents();
        this;

      }

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
        _ref = this.feedItems;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          item.onScroll(scrollTop, this.viewportHeight);
        }
        this.previousScrollTop = scrollTop;
        return window.requestAnimationFrame((function() {
          return _this.onScroll();
        }));
      };

      Feed.prototype.recompute = function() {
        var column, feedItem, _i, _len, _ref, _results;
        _ref = this.feedItems;
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
              _results1.push(column.setDimensions(feedItem.height, feedItem.settings.marginTop, feedItem.settings.marginBottom, feedItem.left));
            }
            return _results1;
          })());
        }
        return _results;
      };

      Feed.prototype.addFeedItems = function($feedItems) {
        var $item;
        if (!(($feedItems != null) && $feedItems.length)) {
          throw "You must pass $feedItems";
        }
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

      Feed.prototype.onResize = function() {
        var item, _i, _len, _ref, _results;
        this.setViewportHeight();
        _ref = this.feedItems;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push(item.onScroll(this.previousScrollTop, this.viewportHeight));
        }
        return _results;
      };

      Feed.prototype.setViewportHeight = function() {
        return this.viewportHeight = this.$window.outerHeight(true);
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
        $(window).unbind('resize.popLockIt');
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
    return $.fn[pluginName] = function(options) {
      if (!$.data(this, "plugin_" + pluginName)) {
        if (options == null) {
          throw "You must pass settings";
        }
        return $.data(this, "plugin_" + pluginName, new Feed(this, options));
      } else if ($.data(this, "plugin_" + pluginName)[options] != null) {
        return $.data(this, "plugin_" + pluginName)[options](Array.prototype.slice.call(arguments, 1));
      }
    };
  })(jQuery, window, document);

}).call(this);
