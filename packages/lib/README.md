# Kaioken-GSAP

> Based on [@gsap/react](https://www.npmjs.com/package/@gsap/react)

<a href="https://gsap.com">GSAP</a> itself is **completely framework-agnostic** and can be used in any JS framework without any special wrappers or dependencies. This hook solves a few **Kaioken-specific** friction points so that you can just focus on the fun stuff. 🤘🏻

## `useGSAP()`

A drop-in replacement for <a href="https://kaioken.dev/docs/hooks/useEffect">`useEffect()`</a> or <a href="https://kaioken.dev/docs/hooks/useLayoutEffect">`useLayoutEffect()`</a> that automatically handles cleanup using <a href="https://gsap.com/docs/v3/GSAP/gsap.context()">`gsap.context()`</a>

```javascript
import gsap from "gsap"
import { useRef } from "kaioken"
import { useGSAP } from "kaioken-gsap"

gsap.registerPlugin(useGSAP) // register any plugins, including the useGSAP hook

const container = useRef()
useGSAP(
  () => {
    // gsap code here...
  },
  { scope: container }
) // <-- scope is for selector text (optional)
```

### ...or with a dependency Array and scope:

```javascript
useGSAP(
  () => {
    // gsap code here...
  },
  { dependencies: [endX], scope: container }
) // config object offers maximum flexibility
```

If you prefer the method signature of `useEffect()` and you don't need to define a scope, this works too but the `config` object syntax is preferred because it offers more flexibility and readability:

```javascript
useGSAP(() => {
  // gsap code here...
}, [endX]) // works, but less flexible than the config object
```

So you can use **any** of these method signatures:

```javascript
// config object for defining things like scope, dependencies, and revertOnUpdate (most flexible)
useGSAP(func, config)
// exactly like useEffect()
useGSAP(func)
useGSAP(func, dependencies)
// primarily for event handlers and other external uses (read about contextSafe() below)
const { context, contextSafe } = useGSAP(config)
```

If you define `dependencies`, the GSAP-related objects (animations, ScrollTriggers, etc.) will only get reverted when the hook gets torn down but if you want them to get reverted **every time the hook updates** (when any dependency changes), you can set `revertOnUpdate: true` in the `config` object.

```javascript
useGSAP(
  () => {
    // gsap code here...
  },
  { dependencies: [endX], scope: container, revertOnUpdate: true }
)
```

## Benefits

- Automatically handles cleanup using <a href="https://gsap.com/docs/v3/GSAP/gsap.context()">`gsap.context()`</a>
- Safe to use in server-side rendering environments.
- You may optionally define a `scope` for selector text, making it safer/easier to write code that doesn't require you to create a `useRef()` for each and every element you want to animate.
- Defaults to using an empty dependency Array in its simplest form, like `useGSAP(() => {...})`.
- Exposes convenient references to the `context` instance and the `contextSafe()` function as method parameters as well as object properties that get returned by the `useGSAP()` hook, so it's easier to set up standard Kaioken event handlers.

## Install

```bash
npm install kaioken-gsap
```

At the top of your code right below your imports, it's usually a good idea to register `useGSAP` as a plugin:

```javascript
gsap.registerPlugin(useGSAP)
```

## Using callbacks or event listeners? Use `contextSafe()` and clean up!

A function is considered "context-safe" if it is properly scoped to a <a href="https://gsap.com/docs/v3/GSAP/gsap.context()">`gsap.context()`</a> so that any GSAP-related objects created **while that function executes** are recorded by that `Context` and use its `scope` for selector text. When that `Context` gets reverted (like when the hook gets torn down or re-synchronizes), so will all of those GSAP-related objects. Cleanup is important in Kaioken and `Context` makes it simple. Otherwise, you'd need to manually keep track of all your animations and `revert()` them when necessary, like when the entire component gets unmounted/remounted. `Context` does that work for you.

The main `useGSAP(() => {...})` function is automatically context-safe of course. But if you're creating functions that get called **AFTER** the main `useGSAP()` function executes (like click event handlers, something in a `setTimeout()`, or anything delayed), you need a way to make those functions context-safe. Think of it like telling the `Context` when to hit the "record" button for any GSAP-related objects.

**Solution**: wrap those functions in the provided `contextSafe()` to associates them with the `Context`. `contextSafe()` accepts a function and returns a new context-safe version of that function.

There are two ways to access the `contextSafe()` function:

#### 1) Using the returned object property (for outside `useGSAP()` function)

```JSX
const container = useRef();

const { contextSafe } = useGSAP({scope: container}); // we can just pass in a config object as the 1st parameter to make scoping simple

// ❌ DANGER! Not wrapped in contextSafe() so GSAP-related objects created inside this function won't be bound to the context for automatic cleanup when it's reverted. Selector text isn't scoped to the container either.
const onClickBad = () => {
          gsap.to(".bad", {y: 100});
      };

// ✅ wrapped in contextSafe() so GSAP-related objects here will be bound to the context and automatically cleaned up when the context gets reverted, plus selector text is scoped properly to the container.
const onClickGood = contextSafe(() => {
          gsap.to(".good", {rotation: 180});
      });

return (
    <div ref={container}>
        <button onclick={onClickBad} className="bad"></button>
        <button onclick={onClickGood} className="good"></button>
    </div>
);
```

### 2) Using the 2nd argument (for inside `useGSAP()` function)

```JSX
const container = useRef();
const badRef = useRef();
const goodRef = useRef();

useGSAP((context, contextSafe) => { // <-- there it is

    // ✅ safe, created during execution
    gsap.to(goodRef.current, {x: 100});

    // ❌ DANGER! This animation is created in an event handler that executes AFTER the useGSAP() executes, thus it's not added to the context so it won't get cleaned up (reverted). The event listener isn't removed in cleanup function below either, so it persists between component renders (bad).
    badRef.current.addEventListener("click", () => {
        gsap.to(badRef.current, {y: 100});
    });

    // ✅ safe, wrapped in contextSafe() function and we remove the event listener in the cleanup function below. 👍
    const onClickGood = contextSafe(() => {
                gsap.to(goodRef.current, {rotation: 180});
            });
    goodRef.current.addEventListener("click", onClickGood);

    return () => { // <-- cleanup (remove listeners here)
        goodRef.current.removeEventListener("click", onClickGood);
    };
}, {scope: container});
return (
	<div ref={container}>
		<button ref={badRef}></button>
		<button ref={goodRef}></button>
	</div>
);
```

## `scope` for selector text

You can optionally define a `scope` in the `config` object as a <a href="https://kaioken.dev/docs/hooks/useRef">Kaioken Ref</a> and then any selector text in the `useGSAP()` <a href="https://gsap.com/docs/v3/GSAP/gsap.context()">`Context`</a> will be scoped to that particular Ref, meaning it will be limited to finding **descendants** of that element. This can greatly simplify your code. No more creating a Ref for every element you want to animate! And you don't need to worry about selecting elements outside your component instance.

### Example using Refs (tedious) 😩

```JSX
const container = useRef();
const box1 = useRef(); // ugh, so many refs!
const box2 = useRef();
const box3 = useRef();

useGSAP(() => {
    gsap.from([box1, box2, box3], {opacity: 0, stagger: 0.1});
});

return (
    <div ref={container}>
        <div ref={box1} className="box"></div>
        <div ref={box2} className="box"></div>
        <div ref={box3} className="box"></div>
    </div>
);
```

### Example using scoped selector text (simple) 🙂

```JSX
// we only need one ref, the container. Use selector text for the rest (scoped to only find descendants of container).
const container = useRef();

useGSAP(() => {
    gsap.from(".box", {opacity: 0, stagger: 0.1});
}, { scope: container }); // <-- magic

return (
    <div ref={container}>
        <div className="box"></div>
        <div className="box"></div>
        <div className="box"></div>
    </div>
);
```

## Need help?

For GSAP-related questions, ask in the friendly <a href="https://gsap.com/community/">GSAP forums</a>. Or share your knowledge and help someone else - it's a great way to sharpen your skills! Report any GSAP-specific bugs there too (or <a href="https://github.com/greensock/GSAP/issues">file an issue here</a> if you prefer).
