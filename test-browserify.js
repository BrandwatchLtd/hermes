var test = require('tape');
var hermes = require('./hermes');

test('A token test to check that Hermes was required successfully.', function (t) {
    var container = document.createElement('div');

    hermes({ container: container, styles: {} });

    t.ok(container.children.item(0) instanceof HTMLUListElement);

    t.end();
});
