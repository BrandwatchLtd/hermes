# Hermes

Hermes is a barebones notification system, designed to work with css animations and transitions. You
supply css classes to it for animating/transitioning in new notifications and likewise for removing
notifications.

Hermes has no production dependencies, and you can use it with RequireJS or Browserify!

## Usage

```javascript
var notifier = hermes({
    maxNotifications: 5,                      // The max number of notifications you want to see.
                                              // If we go over, then the oldest notifications are
                                              // Animated out early (optional).

    container: notificationsContainer,        // A container element to attach notification list to.

    listClasses: ['notifications'],           // CSS to apply to the list generated by hermes.

    styles: {                                 // Define as many styles as you like!
        success: {
            shared: ['notification-success'], // All states of the success notification have these.
            in: ['notification-in'],          // CSS to animate/transition in a new notification.
            paused: ['notification-paused'],  // CSS to use when a notification paused (optional).
            out: ['notification-out'],        // CSS to animate/transition a notification out.
            pauseTime: 3000                   // Waiting time between in and out states. Defaults to
                                              // 3000ms.
        },
        error: {
            shared: ['notification-error'],
            in: ['notification-in'],
            paused: ['notification-paused'],
            out: ['notification-out'],
            pauseTime: 3000
        }
    }
});

// The notifier is an object with fields matching the styles in the config object fed to hermes.
notifier.success('Something went well.');
```

You can define as many styles as you like.

## Notes

Hermes relies on animation/transition end events to know what state a notification should be in. If
the CSS provided for in or out styles lacks an animation or transition, Hermes will not work
properly.

Hermes does not rely on jQuery, and uses some features that older browsers may not provide. Hermes
will certainly not work on IE versions less than 10.

## Contributing

Contributions are welcome! Please see the [contributing](CONTRIBUTING.md) document.
