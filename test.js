/* global describe, it, beforeEach */

define(['hermes', 'chai', 'jquery'], function (hermes, chai, $) {
    'use strict';

    var assert = chai.assert;

    describe('hermes', function () {
        describe('setup', function () {
            it('should attach a list to the provided element', function () {
                var $container = $('<div />');
                hermes({ container: $container, styles: {} });

                assert.ok($container.children().eq(0).is('ul'));
            });

            it('should apply listClasses to the generated list', function () {
                var $container = $('<div />');
                hermes({ container: $container, styles: {}, listClasses: 'test-class' });

                assert.ok($container.children().eq(0).hasClass('test-class'));
            });

            it('should return an object with given style fields', function () {
                var $container = $('<div />');

                var notifier = hermes({
                    container: $container,
                    styles: {
                        success: { shared: '', in: '', out: '' },
                        error: { shared: '', in: '', out: '' }
                    }
                });

                assert.deepEqual(Object.keys(notifier), ['success', 'error']);
            });
        });


        describe('natural life cycle', function () {
            beforeEach(function () {
                var $container = $('<div />');

                this.$container = $container;

                this.notifier = hermes({
                    container: $container,
                    styles: {
                        success: {
                            shared: 'notification-success',
                            in: 'notification-in',
                            paused: 'notification-paused',
                            out: 'notification-out',
                            pauseTime: 10
                        }
                    },
                    listClasses: 'test-class'
                });
            });

            describe('a notification', function () {
                it('should create a list item', function(){
                    this.notifier.success('hello world');

                    assert.equal(this.$container.find('li').length, 1);
                });

                it('should display the message', function () {
                    this.notifier.success('hello world');

                    assert.equal(this.$container.find('li').eq(0).text(), 'hello world');
                });
            });

            describe('a notification list element', function () {
                it('should begin with "shared" and "in" classes', function () {
                    this.notifier.success('hello world');

                    var $notification = this.$container.find('li').eq(0);

                    assert.strictEqual($notification.hasClass('notification-success'), true);
                    assert.strictEqual($notification.hasClass('notification-in'), true);
                });

                it('should remove "in" and add "paused" class when in animation is done', function () {
                    this.notifier.success('hello world');

                    var $notification = this.$container.find('li').eq(0);

                    $notification.trigger('animationend');

                    assert.strictEqual($notification.hasClass('notification-in'), false);
                    assert.strictEqual($notification.hasClass('notification-success'), true);
                    assert.strictEqual($notification.hasClass('notification-paused'), true);
                });

                it('should remove "paused" and add "out" class when pause is done', function (done) {
                    this.notifier.success('hello world');

                    var $notification = this.$container.find('li').eq(0);

                    $notification.trigger('animationend');

                    setTimeout(function () {
                        assert.strictEqual($notification.hasClass('notification-paused'), false);
                        assert.strictEqual($notification.hasClass('notification-success'), true);
                        assert.strictEqual($notification.hasClass('notification-out'), true);

                        done();
                    }, 20);
                });

                it('should remove the notification when the out animation is done', function (done) {
                    this.notifier.success('hello world');

                    var $container = this.$container;
                    var $notification = $container.find('li').eq(0);

                    $notification.trigger('animationend');

                    setTimeout(function () {
                        $notification.trigger('animationend');

                        assert.equal($container.find('li').length, 0);

                        done();
                    }, 20);
                });
            });
        });

        describe('cancelled notifications', function () {
            beforeEach(function () {
                var $container = $('<div />');

                this.$container = $container;

                this.notifier = hermes({
                    container: $container,
                    styles: {
                        success: {
                            shared: 'notification-success',
                            in: 'notification-in',
                            paused: 'notification-paused',
                            out: 'notification-out',
                            pauseTime: 10
                        }
                    },
                    listClasses: 'test-class',
                    maxNotifications: 1
                });
            });

            it('should cancel the earliest if there are one too many notifications', function () {
                this.notifier.success('hello world');

                var $firstNotification = this.$container.find('li').eq(0);

                $firstNotification.trigger('animationend');

                this.notifier.success('goodbye world');

                assert.ok($firstNotification.hasClass('notification-out'));
            });

            it('should finish animation if cancelled whilst animating in', function () {
                this.notifier.success('hello world');

                var $firstNotification = this.$container.find('li').eq(0);

                this.notifier.success('goodbye world');

                assert.ok($firstNotification.hasClass('notification-in'));

                $firstNotification.trigger('animationend');

                assert.ok($firstNotification.hasClass('notification-out'));
            });

            it('should be unaffected if cancelled whilst animating out', function (done) {
                var $container = this.$container;
                var notifier = this.notifier;

                notifier.success('hello world');

                var $firstNotification = $container.find('li').eq(0);

                $firstNotification.trigger('animationend');

                setTimeout(function () {
                    $firstNotification.trigger('animationend');

                    notifier.success('goodbye world');

                    assert.ok($firstNotification.hasClass('notification-out'));

                    done();
                }, 20);
            });
        });
    });
});
