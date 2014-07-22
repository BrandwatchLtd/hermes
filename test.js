/* global describe, it, beforeEach */

define(['hermes', 'chai'], function (hermes, chai) {
    'use strict';

    var assert = chai.assert;

    describe('hermes', function () {
        describe('setup', function () {
            it('should attach a list to the provided element', function () {
                var container = document.createElement('div');

                hermes({ container: container, styles: {} });

                assert.ok(container.children.item(0) instanceof window.HTMLUListElement);
            });

            it('should apply listClasses to the generated list', function () {
                var container = document.createElement('div');
                hermes({ container: container, styles: {}, listClasses: ['test-class'] });

                assert.ok(container.children.item(0).classList.contains('test-class'));
            });

            it('should return an object with given style fields', function () {
                var container = document.createElement('div');

                var notifier = hermes({
                    container: container,
                    styles: {
                        success: { shared: [], in: [], out: [] },
                        error: { shared: [], in: [], out: [] }
                    }
                });

                assert.deepEqual(Object.keys(notifier), ['success', 'error']);
            });
        });


        describe('natural life cycle', function () {
            beforeEach(function () {
                var container = document.createElement('div');

                this.notifier = hermes({
                    container: container,
                    styles: {
                        success: {
                            shared: ['notification-success'],
                            in: ['notification-in'],
                            paused: ['notification-paused'],
                            out: ['notification-out'],
                            pauseTime: 10
                        }
                    },
                    listClasses: ['test-class']
                });

                this.ul = container.children.item(0);
            });

            describe('a notification', function () {
                it('should create a list item', function(){
                    this.notifier.success('hello world');

                    assert.equal(this.ul.children.length, 1);
                });

                it('should display the message', function () {
                    this.notifier.success('hello world');

                    assert.equal(this.ul.children.item(0).textContent, 'hello world');
                });
            });

            describe('a notification list element', function () {
                it('should begin with "shared" and "in" classes', function () {
                    this.notifier.success('hello world');

                    var notification = this.ul.children.item(0);

                    assert.strictEqual(notification.classList.contains('notification-success'), true);
                    assert.strictEqual(notification.classList.contains('notification-in'), true);
                });

                it('should remove "in" and add "paused" class when in animation is done', function () {
                    this.notifier.success('hello world');

                    var notification = this.ul.children.item(0);

                    // Using the deprecated pre-DOM4
                    var evt = document.createEvent('CustomEvent');
                    evt.initCustomEvent('animationend', true, true, null);

                    notification.dispatchEvent(evt);

                    assert.strictEqual(notification.classList.contains('notification-in'), false);
                    assert.strictEqual(notification.classList.contains('notification-success'), true);
                    assert.strictEqual(notification.classList.contains('notification-paused'), true);
                });

                it('should remove "paused" and add "out" class when pause is done', function (done) {
                    this.notifier.success('hello world');

                    var notification = this.ul.children.item(0);

                    var evt = document.createEvent('CustomEvent');
                    evt.initCustomEvent('animationend', true, true, null);

                    notification.dispatchEvent(evt);

                    setTimeout(function () {
                        assert.strictEqual(notification.classList.contains('notification-paused'), false);
                        assert.strictEqual(notification.classList.contains('notification-success'), true);
                        assert.strictEqual(notification.classList.contains('notification-out'), true);

                        done();
                    }, 20);
                });

                it('should remove the notification when the out animation is done', function (done) {
                    this.notifier.success('hello world');

                    var ul = this.ul;
                    var notification = ul.children.item(0);

                    var evt = document.createEvent('CustomEvent');
                    evt.initCustomEvent('animationend', true, true, null);

                    notification.dispatchEvent(evt);

                    setTimeout(function () {
                        var evt = document.createEvent('CustomEvent');
                        evt.initCustomEvent('animationend', true, true, null);

                        notification.dispatchEvent(evt);

                        assert.equal(ul.children.length, 0);

                        done();
                    }, 20);
                });
            });
        });

        describe('cancelled notifications', function () {
            beforeEach(function () {
                var container = document.createElement('div');

                this.notifier = hermes({
                    container: container,
                    styles: {
                        success: {
                            shared: ['notification-success'],
                            in: ['notification-in'],
                            paused: ['notification-paused'],
                            out: ['notification-out'],
                            pauseTime: 10
                        }
                    },
                    listClasses: ['test-class'],
                    maxNotifications: 1
                });

                this.ul = container.children.item(0);
            });

            it('should cancel the earliest if there are one too many notifications', function () {
                this.notifier.success('hello world');

                var firstNotification = this.ul.children.item(0);

                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent('animationend', true, true, null);

                firstNotification.dispatchEvent(evt);

                this.notifier.success('goodbye world');

                assert.ok(firstNotification.classList.contains('notification-out'));
                assert.ok(!firstNotification.classList.contains('notification-paused'));
            });

            it('should finish animation if cancelled whilst animating in', function () {
                this.notifier.success('hello world');

                var firstNotification = this.ul.children.item(0);

                this.notifier.success('goodbye world');

                assert.ok(firstNotification.classList.contains('notification-in'));

                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent('animationend', true, true, null);

                firstNotification.dispatchEvent(evt);

                assert.ok(firstNotification.classList.contains('notification-out'));
            });

            it('should be unaffected if cancelled whilst animating out', function (done) {
                var notifier = this.notifier;

                notifier.success('hello world');

                var firstNotification = this.ul.children.item(0);

                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent('animationend', true, true, null);

                firstNotification.dispatchEvent(evt);

                setTimeout(function () {
                    var evt = document.createEvent('CustomEvent');
                    evt.initCustomEvent('animationend', true, true, null);

                    firstNotification.dispatchEvent(evt);

                    notifier.success('goodbye world');

                    assert.ok(firstNotification.classList.contains('notification-out'));

                    done();
                }, 20);
            });
        });
    });
});
