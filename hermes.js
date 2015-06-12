/**
 * Each animation style is composed of three parts:
 *
 *  - in: A css class to animate/transition the element in.
 *  - paused: A css class to use when the message is static.
 *  - out: A css class to animate/transition the element out.
 *
 * The options object includes those fields, and a pauseTime field in ms.
 *
 * It is important that the in animation/transition ends with the same style that will be used for
 * paused, and that the out animation/transition starts with the same style too in order to make the
 * steps seamless.
 */

// IIFE to protect global scope.
(function () {
    'use strict';

    // Events that may be triggered when an animation or transition completes.
    var endEvents = [
        'animationend',
        'webkitAnimationEnd',
        'oAnimationEnd',
        'MSAnimationEnd',
        'transitionend',
        'webkitTransitionEnd',
        'oTransitionEnd',
        'MSTransitionEnd'
    ];

    function addEndEventListeners(target, listener) {
        for (var i = 0, len = endEvents.length; i < len; i++) {
            target.addEventListener(endEvents[i], listener);
        }
    }

    function removeEndEventListeners(target, listener) {
        for (var i = 0, len = endEvents.length; i < len; i++) {
            target.removeEventListener(endEvents[i], listener);
        }
    }

    function makeNotification(style, message) {
        var li = document.createElement('li');

        if (style.shared) {
            li.classList.add.apply(li.classList, style.shared);
        }

        if (typeof message === 'string') {
            li.textContent = message;
        } else {
            li.appendChild(message);
        }

        // Used for the pause step.
        var pauseTimeout = null;
        var afterEnd = null;
        var state = 'before-start';

        function animateIn(callback) {
            state = 'animating-in';

            li.classList.add.apply(li.classList, style.in);

            function listener(event) {
                event.stopPropagation();

                removeEndEventListeners(li, listener);

                li.classList.remove.apply(li.classList, style.in);

                callback();
            }

            addEndEventListeners(li, listener);
        }

        function pause(callback) {
            state = 'paused';

            if (style.paused) {
                li.classList.add.apply(li.classList, style.paused);
            }

            pauseTimeout = setTimeout(function () {
                pauseTimeout = null;

                if (style.paused) {
                    li.classList.remove.apply(li.classList, style.paused);
                }

                callback();
            }, style.pauseTime || 3000);
        }

        function animateOut() {
            state = 'animating-out';

            li.classList.add.apply(li.classList, style.out);

            function listener(event) {
                event.stopPropagation();

                removeEndEventListeners(li, listener);

                li.parentNode.removeChild(li);

                afterEnd();
            }

            addEndEventListeners(li, listener);
        }

        // The callback to the in animation should trigger a pause, and then animate out.
        var inCallback = function () {
            pause(animateOut);
        };

        return {
            start: function (callback) {
                afterEnd = callback;

                animateIn(function () {
                    inCallback();
                });
            },
            cancel: function () {
                if (state === 'animating-in') {
                    // Skip the pause step.
                    inCallback = animateOut;
                }

                if (state === 'paused') {
                    // Clear the pause.
                    clearTimeout(pauseTimeout);

                    if (style.paused) {
                        li.classList.remove.apply(li.classList, style.paused);
                    }

                    // Begin out animation.
                    animateOut();
                }
            },
            li: li
        };
    }

    // Configure and return a notifier object.
    function hermes(options) {
        var ul = document.createElement('ul');
        var types = Object.keys(options.styles);

        // If no maxNotifications was given, there is no maximum.
        var maxNotifications = options.maxNotifications || Infinity;
        var notifications = [];

        if (options.listClasses) {
            ul.classList.add.apply(ul.classList, options.listClasses);
        }

        options.container.appendChild(ul);

        // Append a notification with the given message and style to a list. Expire oldest
        // notification if the list has grown too large.
        function appendNotification(style, message) {
            var notification = makeNotification(style, message);

            notifications.push(notification);

            // If we've gone over the max notifications, animate oldest out early.
            if (notifications.length > maxNotifications) {
                notifications.shift().cancel();
            }

            notification.start(function notificationComplete() {
                var index = notifications.indexOf(notification);

                // If this notification animated out naturally, it needs to be removed from the
                // notifications array.
                if (index !== -1) {
                    notifications.splice(index, 1);
                }
            });

            var firstLi = ul.children[0];

            if (firstLi) {
                ul.insertBefore(notification.li, firstLi);
            } else {
                ul.appendChild(notification.li);
            }
        }

        // Append a new notification type to a notifier object.
        function makeType(notifier, type) {
            var style = options.styles[type];

            notifier[type] = function (message) {
                appendNotification(style, message);
            };

            return notifier;
        }

        // Populate an object with notification methods and return it.
        return types.reduce(makeType, {});
    }

    // If hermes is being loaded with an AMD module loader.
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return hermes;
        });

        return;
    }

    // If hermes is being loaded in Node.js or with Browserify.
    if (typeof module === 'object' && module && module.exports) {
        module.exports = hermes;

        return;
    }

    // Finally, if the module is being loaded as a global, check that jQuery has been loaded, then
    // append hermes to the window.
    window.hermes = hermes;
}());
