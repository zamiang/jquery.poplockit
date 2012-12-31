(function() {
  var $, Column, Ul, methods,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = jQuery;

  Column = (function() {

    function Column($el, settings) {
      this.$el = $el;
      this.settings = settings;
      this.originalWidth = this.width = this.$el.outerWidth(false);
      this.originalHeight = this.height = this.$el.height();
    }

    Column.prototype.setPosition = function(pos, direction) {
      var css;
      if (pos == null) {
        pos = 'absolute';
      }
      if (direction == null) {
        direction = 'north';
      }
      css = {
        position: pos,
        top: direction === 'north' ? this.defaultTop : 'auto',
        bottom: direction === 'south' ? this.defaultBottom : 'auto'
      };
      return this.$el.css(css);
    };

    Column.prototype.onScroll = function(scrollTop, viewportHeight) {
      if (viewportHeight >= this.model.get('height')) {
        return;
      }
      if (scrollTop >= this.model.get('top') && scrollTop < this.model.get('bottom')) {
        return this.setPosition('fixed');
      }
      if (scrollTop < this.model.get('top')) {
        return this.setPosition('absolute', 'north');
      }
      if (scrollTop >= this.model.get('bottom')) {
        return this.setPosition('absolute', 'south');
      }
    };

    return Column;

  })();

  Ul = (function() {

    function Ul() {
      this.onResize = __bind(this.onResize, this);

      this.onScroll = __bind(this.onScroll, this);

    }

    Ul.prototype.active = true;

    Ul.prototype.rendered = false;

    Ul.prototype.onScroll = function() {
      var item, scrollTop, _i, _len, _ref;
      if (!this.active) {
        return;
      }
      scrollTop = this.$win.scrollTop();
      if (scrollTop === this.previousScrollTop) {
        return window.requestAnimationFrame(this.onScroll);
      }
      this.scrollingDown = this.previousScrollTop < scrollTop;
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        item.onScroll(scrollTop, this.height);
      }
      this.previousScrollTop = scrollTop;
      return window.requestAnimationFrame(this.onScroll);
    };

    Ul.prototype.recomputeEachLiHeight = function() {
      var item, _i, _len, _ref, _results;
      _ref = this.items;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(item.setWayPointThrottled());
      }
      return _results;
    };

    Ul.prototype.repositionEachLi = function() {
      var item, _i, _len, _ref, _results;
      _ref = this.items;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(item.onScroll(this.previousScrollTop, this.$win.height()));
      }
      return _results;
    };

    Ul.prototype.onResize = function() {
      var item, _i, _len, _ref;
      this.setMaxWidth();
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        item.onResize();
        item.onScroll(this.previousScrollTop, this.$win.height());
      }
      return this.height = this.$win.outerHeight(true);
    };

    Ul.prototype.setMaxWidth = function() {
      if (!(this.$('.max_width').length > 0)) {
        this.$el.append("<div class='max_width'></div>");
      }
      return this.maxWidth = Number(this.$el.find('.max_width').css('max-width').replace('px', ''));
    };

    Ul.prototype.bindWindowEvents = function() {
      this.requestAnimationFrame(this.onScroll);
      if (!App.IS_IOS) {
        return this.$win.bind('resize.feedItem', this.debounce(this.onResize, 100));
      }
    };

    Ul.prototype.unbindWindowEvents = function() {
      return this.$win.unbind('.feedItem');
    };

    Ul.prototype.debounce = function(func, wait) {
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

    Ul.prototype.initRequestAnimationFrame = function() {
      var lastTime, vendor, vendors, _i, _len;
      if (window.requestAnimationFrame) {
        this.requestAnimationFrame = window.requestAnimationFrame;
        this.cancelAnimationFrame = window.cancelAnimationFrame;
        return;
      }
      lastTime = 0;
      vendors = ['ms', 'moz', 'webkit', 'o'];
      for (_i = 0, _len = vendors.length; _i < _len; _i++) {
        vendor = vendors[_i];
        if (!(!this.requestAnimationFrame)) {
          continue;
        }
        this.requestAnimationFrame = window["" + vendor + "RequestAnimationFrame"];
        this.cancelAnimationFrame = window["" + vendor + "CancelAnimationFrame"] || window["" + vendor + "CancelAnimationFrame"];
      }
      if (!this.requestAnimationFrame) {
        this.requestAnimationFrame = function(callback, element) {
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
      if (!this.cancelAnimationFrame) {
        return this.cancelAnimationFrame = function(id) {
          return clearTimeout(id);
        };
      }
    };

    return Ul;

  })();

  methods = {
    initialize: function(settings) {
      this.settings = settings;
      return this;
    },
    destroy: function() {
      return $(window).unbind('resize.lockit');
    }
  };

  $.fn.lockit = function(method) {
    if (methods[method] != null) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === "object" || !(method != null)) {
      return methods.initialize.apply(this, arguments);
    } else {
      return $.error("Method " + method + " does not exist on jQuery.lockit");
    }
  };

}).call(this);
