[![build status](https://api.travis-ci.org/zamiang/jquery.popLockIt.png)](http://travis-ci.org/zamiang/jquery.popLockIt)

# jQuery.popLockIt

A jQuery plugin that does...

## Example

See [this example](http://htmlpreview.github.com/?https://github.com/zamiang/jquery.poplockit/blob/master/example/index.html) using [Placekitten](http://placekitten.com/)

## Usage

Download the [production version](https://raw.github.com/zamiang/jquery.poplockit/master/dist/jquery.poplockit.min.js) or the [development version](https://raw.github.com/zamiang/jquery.poplockit/master/dist/jquery.poplockit.js).

Include required Javascripts
```html
<script src="jquery.js"></script>
<script src="dist/poplockit.min.js"></script>
```

Create html like this:
```html
  <div id="feed">
    <article>
      <div class="column">Left</div>
      <div class="column">Center</div>
      <div class="column">Right</div>
    </article>
    ...
  </div>
```

Apply the popLockIt plugin

```javascript
$('#feed').popLockIt({
  feedItems      : $('#feed > article'),
  columnSelector : '> .column',
  margin         : 90
});
```

## Options

### feedItems { jQuery Object }

jQuery object for you feed items.

### columnSelector { selector String }

Selector string to get the columns for your feed items relative to a feed item element. It is used in jQuery.popLockIt like so: ```javascript $feedItem.find(columnSelector);```

### margin { number }

*todo* - investigate figuring this out from the html

## Methods

### destroy

returns feedItems and their Columns to their default positions and unbinds all events.

### recompute()

Recomputes height / top / bottom etc of each feed item and its columns. Run if the size of any of your feed items has changed

### onScroll()

Manually run the onScroll event. Recommend running this if you have hidden the feed and are now re-showing it.

### addFeedItems( { jQuery Object } )

Add items to the feed. Takes a jQuery object containing the new feed items.


## Contributing

Please don't edit files in the `dist` subdirectory as they are generated via grunt. You'll find source code in the `src` subdirectory!

### Modifying the code
1. Fork and clone the repo.
1. If needed: `npm install -g grunt` for [Grunt](https://github.com/gruntjs/grunt)
1. If needed: `brew install phantomjs` for [PhantomJS](http://phantomjs.org/download.html)
1. Run `npm install` to install dependencies
1. Run `grunt` (compiles coffeescripts and runs tests)
1. Run `grunt watch` while editing files to auto-compile coffeescripts and run tests

### Submitting pull requests

1. Add tests for the change you want to make. Run `grunt` to see if tests fail.
1. Run `grunt` to make sure nothing is broken
1. Push to your fork and submit a pull request.

## License

Copyright (c) 2012 Brennan Moore

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
