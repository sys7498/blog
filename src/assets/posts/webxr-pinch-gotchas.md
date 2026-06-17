---
title: WebXR pinch gestures, the gotchas
date: 2026.05.22
summary: pinchstart / pinchend and the state you actually need to guard.
---

# WebXR pinch gestures, the gotchas

The `pinchstart` / `pinchend` events on a hand from `renderer.xr.getHand(i)` look
simple, but a few things bit me.

## Guard your state

If you advance an index on every `pinchstart`, you will eventually walk off the
end of your array and read `undefined`. Wrap it:

```ts
this.nowAnswerOrder = (this.nowAnswerOrder + 1) % this.answers.length;
```

## `this` binding

Adding `hand.addEventListener('pinchend', this.onPinchEnd)` loses `this`. Use an
arrow function or bind it, or your handler will throw the moment it touches a
field.

## Don't translate geometry on every swap

Centering a `TextGeometry` by translating it is fine — *once*. Do it at creation
time, not every time you show it, or the text drifts further off-center on each
pinch.

Small things, but they're the difference between a demo that survives a live
showing and one that doesn't.
