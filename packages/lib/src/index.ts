/**
 * @fileoverview Tools for using GSAP in Kaioken, like useGSAP() which is a drop-in replacement for useLayoutEffect()/useEffect()
 * @version 1.0.0
 * @license ISC
 * Based on the work of Jack Doyle, jack@greensock.com - (https://github.com/greensock/react/blob/main/src/index.js)
 */

import { useCallback, useLayoutEffect, useRef, useState } from "kaioken"
import gsap from "gsap"

type ContextSafeFunc = <T extends Function>(func: T) => T
type ContextFunc = (
  context: gsap.Context,
  contextSafe: ContextSafeFunc
) => Function | any | void

export type UseGSAPReturn = {
  context: gsap.Context
  contextSafe: ContextSafeFunc
}

export type UseGSAPConfig = {
  scope?: Kaioken.MutableRefObject<Element | null> | Element | string
  dependencies?: unknown[]
  revertOnUpdate?: boolean
}

const isConfig = (obj: unknown): obj is UseGSAPConfig =>
  typeof obj === "object" && !!obj && !Array.isArray(obj)
const defaultConfig: UseGSAPConfig = {}
const emptyArray: unknown[] = []
let _gsap = gsap

export function useGSAP(
  callback?: ContextFunc | UseGSAPConfig,
  dependencies: unknown[] | UseGSAPConfig = emptyArray
): UseGSAPReturn {
  let config = defaultConfig
  if (isConfig(callback)) {
    config = callback
    callback = null!
    dependencies = "dependencies" in config ? config.dependencies! : emptyArray
  } else if (isConfig(dependencies)) {
    config = dependencies
    dependencies = "dependencies" in config ? config.dependencies! : emptyArray
  }

  if (callback && typeof callback !== "function") {
    console.warn("First parameter must be a function or config object")
  }

  const { scope, revertOnUpdate } = config
  const mounted = useRef(false)
  const context = useRef(_gsap.context(() => {}, scope))
  const contextSafe = useRef(
    (func: Function) => context.current.add(null!, func) as ContextSafeFunc
  )

  const deferCleanup = dependencies && dependencies.length && !revertOnUpdate

  deferCleanup &&
    useLayoutEffect(() => {
      mounted.current = true
      return () => context.current.revert()
    }, emptyArray)

  // @ts-expect-error
  useLayoutEffect(() => {
    callback && context.current.add(callback, scope)
    if (!deferCleanup || !mounted.current) {
      // Kaioken renders bottom-up, thus there could be hooks with dependencies that run BEFORE the component mounts, thus cleanup wouldn't occur since a hook with an empty dependency Array would only run once the component mounts.
      return () => context.current.revert()
    }
  }, dependencies)

  return {
    context: context.current,
    contextSafe: contextSafe.current as ContextSafeFunc,
  }
}
// @ts-expect-error shut up ts
useGSAP.register = (core) => (_gsap = core)
useGSAP.headless = true // doesn't require the window to be registered.

// the following is based on @gibsonmurray's 'useFlip' hook: https://github.com/gibsonmurray/react/tree/useFlip
export type UseFlipOptions = Flip.FlipStateVars &
  Flip.FromToVars & { revertOnUpdate?: boolean }

export function useFlip(target: gsap.DOMTarget, options: UseFlipOptions) {
  const [isFlipped, setIsFlipped] = useState(false)
  const flipStateRef = useRef<Flip.FlipState | null>(null)
  const scopeRef = useRef<Element | null>(null)

  const { props, simple, revertOnUpdate, ...vars } = options

  const captureState = useCallback(() => {
    const mergedVars = { props, simple, targets: target }
    flipStateRef.current = Flip.getState(target, mergedVars)
  }, [target, props, simple])

  const flip = useCallback(() => {
    captureState()
    setIsFlipped((prev) => !prev)
  }, [captureState])

  useGSAP(
    () => {
      if (flipStateRef.current) {
        Flip.from(flipStateRef.current, vars)
        flipStateRef.current = null
      }
    },
    {
      scope: scopeRef,
      dependencies: [isFlipped],
      revertOnUpdate: revertOnUpdate,
    }
  )

  return { isFlipped, flip, scopeRef }
}
