/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($) {

    /*
     ======== A Handy Little QUnit Reference ========
     http://docs.jquery.com/QUnit

     Test methods:
     expect(numAssertions)
     stop(increment)
     start(decrement)
     Test assertions:
     ok(value, [message])
     equal(actual, expected, [message])
     notEqual(actual, expected, [message])
     deepEqual(actual, expected, [message])
     notDeepEqual(actual, expected, [message])
     strictEqual(actual, expected, [message])
     notStrictEqual(actual, expected, [message])
     raises(block, [expected], [message])
     */

    module('jQuery#lockit', {
        setup: function() {
            this.elems = $('#qunit-fixture').children();
        }
    });

    test('is chainable', function() {
        strictEqual(this.elems.lockit('initialize', {}), this.elems, 'should be chaninable');
    });

    test('requires settings', function() {
        raises(function() { this.elems.lockit(); }, Error, "must throw error to pass");
    });

    test('raises error on invalid method', function() {
        raises(function() { this.elems.lockit('invalid'); }, Error, "must throw error to pass");
    });

}(jQuery));
