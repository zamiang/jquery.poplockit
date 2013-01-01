(function() {
  var $, Column, Ul, methods,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = jQuery;

  Column = (function() {

    Column.prototype.requires = ['height', 'margin', 'defaultTop', 'defaultbottom'];

    function Column($el, settings) {
      var require, _i, _len, _ref;
      _ref = this.requires;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        require = _ref[_i];
        if (settings[require] == null) {
          throw "You must pass " + require;
        }
      }
      this.$el = $el;
      this.settings = settings;
      this.setDimensions();
    }

    Column.prototype.setDimensions = function(height) {
      if (height) {
        this.settings.height = height;
      }
      this.top = this.$el.offset().top;
      return this.bottom = top + this.settings.height - this.$el.outerHeight(true) - (this.settings.margin * 2);
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
        top: direction === 'north' ? this.settings.defaultTop : 'auto',
        bottom: direction === 'south' ? this.settings.defaultBottom : 'auto'
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

    return Column;

  })();

  Ul = (function() {

    Ul.prototype.defaults = {
      defaultTop: '90px',
      defaultBottom: '90px',
      margin: 90,
      active: true,
      rendered: false
    };

    Ul.prototype.requires = [];

    function Ul(settings) {
      this.onScroll = __bind(this.onScroll, this);

      var items, require, _i, _len, _ref, _ref1;
      _ref = this.requires;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        require = _ref[_i];
        if (settings[require] == null) {
          throw "You must pass " + require;
        }
      }
      this.detectiOS();
      this.initRequestAnimationFrame();
      this.settings = $.extend(this.defaults, settings);
      items = (_ref1 = this.$el) != null ? _ref1.find('> li') : void 0;
      if (items) {
        this.items = items.map(function() {
          return new Li($(this), this.settings);
        });
      }
    }

    Ul.prototype.onScroll = function() {
      var item, scrollTop, _i, _len, _ref;
      if (!this.active) {
        return;
      }
      scrollTop = this.$win.scrollTop();
      if (scrollTop === this.previousScrollTop) {
        return this.requestAnimationFrame(this.onScroll);
      }
      this.scrollingDown = this.previousScrollTop < scrollTop;
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        item.onScroll(scrollTop, this.height);
      }
      this.previousScrollTop = scrollTop;
      return this.requestAnimationFrame(this.onScroll);
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

    Ul.prototype.bindWindowEvents = function() {
      this.requestAnimationFrame(this.onScroll);
      if (!this.IS_IOS) {
        return this.$win.bind('resize.feedItem', this.debounce(this.onResize, 100));
      }
    };

    Ul.prototype.unbindWindowEvents = function() {
      return this.$win.unbind('.feedItem');
    };

    Ul.prototype.destroy = function() {
      var item, _i, _len, _ref, _results;
      this.settings.rendered = false;
      this.setttings.active = false;
      _ref = this.items;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(this.item.destroy());
      }
      return _results;
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

    Ul.prototype.detectiOS = function() {
      var uagent;
      uagent = navigator.userAgent.toLowerCase();
      return this.IS_IOS = uagent.match(/(iPhone|iPod|iPad)/i) != null;
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
      if (settings == null) {
        throw "You must pass settings";
      }
      this.ul = new Ul(settings);
      return this;
    },
    destroy: function() {
      $(window).unbind('resize.lockit');
      return this.ul.destroy();
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
