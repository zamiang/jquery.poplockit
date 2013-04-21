[![build status](https://api.travis-ci.org/zamiang/jquery.poplockit.png)](http://travis-ci.org/zamiang/jquery.poplockit)

# jQuery.popLockIt

A jQuery plugin for 'locking' short content in place as the user
scrolls by longer content. For example, it will lock metadata and
share buttons in place as the user scrolls by a long essay or series
of images.

This is used for the feed on [Artsy](http://artsy.net)

For documentation, usage and examples please see http://zamiang.github.com/jquery.poplockit/

See [this example](http://htmlpreview.github.com/?https://github.com/zamiang/jquery.poplockit/blob/master/example/index.html) using [Placekitten](http://placekitten.com/)

![https://raw.github.com/zamiang/jquery.poplockit/master/img/example1.png](https://raw.github.com/zamiang/jquery.poplockit/master/img/example1.png)
![https://raw.github.com/zamiang/jquery.poplockit/master/img/example2.png](https://raw.github.com/zamiang/jquery.poplockit/master/img/example2.png)



## Usage

Download the [production version](https://raw.github.com/zamiang/jquery.poplockit/master/dist/jquery.poplockit.min.js) or the [development version](https://raw.github.com/zamiang/jquery.poplockit/master/dist/jquery.poplockit.js).

Include required Javascripts
```html
<script src="jquery.js"></script>
<script src="dist/poplockit.min.js"></script>
```

Create html like this
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
  columnSelector : '> .column'
});
```

## Contributing

Contributions and pull requests are very welcome. Please follow these guidelines when submitting new code.

### Modifying the code
1. Fork and clone the repo.
1. If needed: `npm install -g grunt` for [Grunt](https://github.com/gruntjs/grunt)
1. If needed: `brew install phantomjs` for [PhantomJS](http://phantomjs.org/download.html)
1. Run `npm install` to install dependencies
1. Run `grunt` (compiles coffeescripts and runs tests)
1. Run `grunt watch` while editing files to auto-compile coffeescripts and run tests
1. Make all changes in Coffeescript files, not JavaScript files.

### Submitting pull requests

1. Add tests for the change you want to make. Run `grunt jasmine` to see if tests fail.
1. Run `grunt` to compile new dist and make sure nothing is broken
1. Submit a Pull Request using GitHub.
