(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function($, window, document) {
    var Base, Column, Feed, FeedItem, pluginName;
    pluginName = "popLockIt";
    Base = (function() {

      Base.prototype.requires = [];

      function Base($el, settings) {
        var require, _i, _len, _ref;
        this.$el = $el;
        this.settings = settings;
        _ref = this.requires;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          require = _ref[_i];
          if (this.settings[require] == null) {
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

      Column.prototype.marginTop = 0;

      Column.prototype.marginBottom = 0;

      Column.prototype.marginLeft = 0;

      function Column($el, settings) {
        this.$el = $el;
        this.settings = settings;
        this.setPosition = __bind(this.setPosition, this);

        this.setDimensions = __bind(this.setDimensions, this);

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
        this.height = Math.floor(Number(this.$el.css('height').replace('px', "")));
        this.top = Math.floor(this.$el.offset().top - this.marginTop);
        this.left = Math.floor(this.$el.offset().left);
        this.bottom = Math.floor(this.top + this.parentHeight - this.height);
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
          left: this.getLeftForPosition(pos)
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

      Column.prototype.getLeftForPosition = function(pos) {
        if (pos === 'fixed') {
          return this.left;
        } else if (pos === 'static') {
          return 0;
        } else {
          return this.left - (this.marginLeft || 0);
        }
      };

      Column.prototype.onScroll = function(scrollTop, viewportHeight, preventFixed) {
        if (preventFixed == null) {
          preventFixed = false;
        }
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

      FeedItem.prototype.active = false;

      FeedItem.prototype.initialize = function() {
        this.setDimensions();
        return this.createColumns();
      };

      function FeedItem($el, settings, index, parent) {
        this.$el = $el;
        this.settings = settings;
        this.index = index;
        this.parent = parent;
        this.recomputeColumn = __bind(this.recomputeColumn, this);

        this.recompute = __bind(this.recompute, this);

        this.onScroll = __bind(this.onScroll, this);

        this.setDimensions = __bind(this.setDimensions, this);

        this.initialize = __bind(this.initialize, this);

        FeedItem.__super__.constructor.apply(this, arguments);
        this.$columns = this.$el.find(this.settings.columnSelector);
        this.initialize();
        if (this.settings.additionalFeedItemInit) {
          this.settings.additionalFeedItemInit(this.$el, this.index);
        }
        this;

      }

      FeedItem.prototype.createColumns = function() {
        var height, left, marginBottom, marginTop, _ref;
        if (this.$columns.length < 2) {
          return;
        }
        height = this.height;
        left = this.left;
        marginTop = this.marginTop;
        marginBottom = this.marginBottom;
        if (((_ref = this.$columns) != null ? _ref.length : void 0) > 0) {
          return this.columns = this.$columns.map(function() {
            return new Column($(this), {
              height: height,
              marginTop: marginTop,
              marginBottom: marginBottom,
              marginLeft: left
            });
          });
        }
      };

      FeedItem.prototype.setDimensions = function() {
        var height;
        if (this.$columns.length < 2) {
          return;
        }
        this.marginTop = Number(this.$el.css('padding-top').replace('px', ''));
        this.marginBottom = Number(this.$el.css('padding-bottom').replace('px', ''));
        this.resetColumnPositioning();
        this.$el.css({
          height: 'auto'
        });
        height = this.$el.css('height');
        this.height = Number(height.replace('px', ""));
        this.$el.css({
          height: height
        });
        this.left = this.$el.offset().left;
        this.top = this.$el.offset().top;
        return this.bottom = this.top + this.height;
      };

      FeedItem.prototype.resetColumnPositioning = function() {
        var column, _i, _len, _ref, _ref1, _results;
        if (!(((_ref = this.columns) != null ? _ref.length : void 0) > 0)) {
          return;
        }
        _ref1 = this.columns;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          column = _ref1[_i];
          _results.push(column.setPosition('static'));
        }
        return _results;
      };

      FeedItem.prototype.onScroll = function(scrollTop, viewportHeight, forceOnScroll) {
        var column, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _results, _results1;
        if (!(((_ref = this.columns) != null ? _ref.length : void 0) > 0)) {
          return;
        }
        if (viewportHeight >= this.height) {
          return this.active = false;
        } else if (scrollTop >= this.top && scrollTop < this.bottom) {
          this.active = true;
          _ref1 = this.columns;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            column = _ref1[_i];
            _results.push(column.onScroll(scrollTop, viewportHeight, this.parent.settings.preventFixed));
          }
          return _results;
        } else if (this.active) {
          _ref2 = this.columns;
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            column = _ref2[_j];
            column.onScroll(scrollTop, viewportHeight, true);
          }
          return this.active = false;
        } else if (forceOnScroll) {
          _ref3 = this.columns;
          _results1 = [];
          for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
            column = _ref3[_k];
            _results1.push(column.onScroll(scrollTop, viewportHeight, true));
          }
          return _results1;
        }
      };

      FeedItem.prototype.recompute = function() {
        var column, _i, _len, _ref, _ref1, _results;
        if (!(((_ref = this.columns) != null ? _ref.length : void 0) > 0)) {
          return;
        }
        this.setDimensions();
        _ref1 = this.columns;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          column = _ref1[_i];
          _results.push(column.setDimensions(this.height, this.marginTop, this.marginBottom, this.left));
        }
        return _results;
      };

      FeedItem.prototype.recomputeColumn = function(index) {
        var _ref;
        if (!(((_ref = this.columns) != null ? _ref.length : void 0) > 0)) {
          return;
        }
        if (!!this.columns[index]) {
          return;
        }
        return this.columns[index].setDimensions(this.height, this.settings.marginTop, this.settings.marginBottom, this.left);
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

      Feed.prototype.hasFocus = true;

      Feed.prototype.scrollSpeedThreshold = 500;

      Feed.prototype.defaults = {
        active: true,
        rendered: false,
        preventFixed: false
      };

      function Feed(el, settings) {
        var _ref;
        this.el = el;
        this.settings = settings;
        this.addFeedItems = __bind(this.addFeedItems, this);

        this.start = __bind(this.start, this);

        this.stop = __bind(this.stop, this);

        this.destroy = __bind(this.destroy, this);

        this.recomputeItemColumn = __bind(this.recomputeItemColumn, this);

        this.recomputeItem = __bind(this.recomputeItem, this);

        this.$el = $(this.el);
        if (this.settings == null) {
          throw "You must pass settings";
        }
        if (((_ref = this.$el) != null ? _ref.length : void 0) !== 1) {
          throw "PopLockIt must be called on one element";
        }
        Feed.__super__.constructor.call(this, this.$el, this.settings);
        this.$window = $(window);
        this.settings = $.extend(this.defaults, this.settings);
        this.settings.active = true;
        this.initRequestAnimationFrame();
        this.viewportHeight = this.$window.outerHeight(true);
        this.$el.css({
          'box-sizing': 'border-box',
          overflow: 'hidden'
        });
        this.addFeedItems(this.settings.feedItems);
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
          return this.requestedAnimationFrame = window.requestAnimationFrame((function() {
            return _this.onScroll();
          }));
        }
        _ref = this.feedItems;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          item.onScroll(scrollTop, this.viewportHeight, Math.abs(scrollTop - this.previousScrollTop) > this.scrollSpeedThreshold);
        }
        this.previousScrollTop = scrollTop;
        if (this.settings.onScroll != null) {
          this.settings.onScroll(scrollTop);
        }
        return this.requestAnimationFrame();
      };

      Feed.prototype.recompute = function() {
        var feedItem, item, scrollTop, _i, _j, _len, _len1, _ref, _ref1, _results;
        this.settings.active = true;
        _ref = this.feedItems;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          feedItem = _ref[_i];
          feedItem.recompute();
        }
        scrollTop = this.$window.scrollTop();
        _ref1 = this.feedItems;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          item = _ref1[_j];
          _results.push(item.onScroll(scrollTop, this.viewportHeight, false));
        }
        return _results;
      };

      Feed.prototype.recomputeItem = function(index) {
        if (!this.feedItems[index]) {
          return;
        }
        return this.feedItems[index].recompute();
      };

      Feed.prototype.recomputeItemColumn = function(index, columnIndex) {
        if (!this.feedItems[index]) {
          return;
        }
        return this.feedItems[index].recomputeColumn(columnIndex);
      };

      Feed.prototype.destroy = function() {
        var item, _i, _len, _ref;
        this.settings.rendered = false;
        this.settings.active = false;
        $.data(this.$el, "plugin_" + pluginName, false);
        if (typeof feedItems !== "undefined" && feedItems !== null ? feedItems.length : void 0) {
          _ref = this.feedItems;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            item.destroy();
          }
        }
        return this.feedItems = [];
      };

      Feed.prototype.stop = function() {
        this.settings.active = false;
        return window.cancelAnimationFrame(this.requestedAnimationFrame);
      };

      Feed.prototype.start = function() {
        var _this = this;
        this.settings.active = true;
        window.cancelAnimationFrame(this.requestedAnimationFrame);
        return this.requestedAnimationFrame = window.requestAnimationFrame((function() {
          return _this.onScroll();
        }));
      };

      Feed.prototype.addFeedItems = function($feedItems) {
        var _this = this;
        if (!(($feedItems != null) && $feedItems.length)) {
          throw "You must pass $feedItems";
        }
        return $feedItems.map(function(index, el) {
          return _this.feedItems.push(new FeedItem($(el), _this.settings, index, _this));
        });
      };

      Feed.prototype.requestAnimationFrame = function() {
        var _this = this;
        return this.requestedAnimationFrame = window.requestAnimationFrame((function() {
          return _this.onScroll();
        }));
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

      Feed.prototype.initRequestAnimationFrame = function() {
        var lastTime, vendor, vendors, _i, _len;
        if (window.requestAnimationFrame) {
          return;
        }
        lastTime = 0;
        vendors = ['ms', 'moz', 'webkit', 'o'];
        for (_i = 0, _len = vendors.length; _i < _len; _i++) {
          vendor = vendors[_i];
          if (!(!window.requestAnimationFrame)) {
            continue;
          }
          window.requestAnimationFrame = window["" + vendor + "RequestAnimationFrame"];
          window.cancelAnimationFrame = window["{vendor}CancelAnimationFrame"] || window["{vendors}CancelRequestAnimationFrame"];
        }
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = function(callback, element) {
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
        if (!window.cancelAnimationFrame) {
          return window.cancelAnimationFrame = function(id) {
            return clearTimeout(id);
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
        return $.data(this, "plugin_" + pluginName)[options](Array.prototype.slice.call(arguments, 1)[0], Array.prototype.slice.call(arguments, 1)[1]);
      } else {
        throw "Method '" + options + "' does not exist on jQuery.popLockIt";
      }
    };
  })(jQuery, window, document);

}).call(this);
