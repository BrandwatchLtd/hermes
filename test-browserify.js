var test = require('tape');
var hermes = require('./hermes');

test('A token test to check that Hermes was required successfully.', function (t) {
    'use strict';

    var container = document.createElement('div');

    hermes({ container: container, styles: {} });

    t.ok(container.children.item(0) instanceof window.HTMLUListElement);

    t.end();
});
