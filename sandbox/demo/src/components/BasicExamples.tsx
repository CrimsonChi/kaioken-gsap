import { useRef } from "kaioken"
import { useGSAP } from "kaioken-gsap"
import { Link, Router, Route } from "kaioken/router"
import gsap from "gsap"

export function BasicExamples() {
  return (
    <div className="flex flex-col">
      <nav className="flex gap-2">
        <Link to="/one" inherit>
          Example One
        </Link>
        <Link to="/two" inherit>
          Example Two
        </Link>
        <Link to="/three" inherit>
          Example Three
        </Link>
      </nav>
      <Router>
        <Route path="/one" element={<ExampleOne />} />
        <Route path="/two" element={<ExampleTwo />} />
        <Route path="/three" element={<ExampleThree />} />
      </Router>
    </div>
  )
}

function ExampleOne() {
  const container = useRef<HTMLDivElement>(null)
  const circle = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // use selectors...
      gsap.to(".box", { rotation: "+=360", duration: 3 })

      // or refs...
      gsap.to(circle.current, { rotation: "-=360", duration: 3 })
    },
    { scope: container }
  ) // <-- scope for selector text (optional)

  return (
    <div className="flex gap-2">
      <div ref={container} className="flex gap-2">
        <div className="box gradient-blue">selector</div>
        <div className="circle gradient-green" ref={circle}>
          Ref
        </div>
      </div>
      <div className="box gradient-blue">selector</div>
    </div>
  )
}

function ExampleTwo() {
  const { contextSafe } = useGSAP()

  const rotate = contextSafe<(e: MouseEvent) => void>(({ currentTarget }) => {
    gsap.to(currentTarget, { rotation: "+=360" })
  })

  return (
    <button className="box gradient-blue cursor-pointer" onclick={rotate}>
      Click Me
    </button>
  )
}

function ExampleThree() {
  const containerRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useGSAP(
    (_, contextSafe) => {
      // ✅ safe, created during execution
      gsap.to(btnRef.current, { x: 100 })

      // ✅ safe, wrapped in contextSafe() function
      const onClickGood = contextSafe(() => {
        gsap.to(btnRef.current, { rotation: 180 })
      })

      btnRef.current?.addEventListener("click", onClickGood)

      // 👍 we remove the event listener in the cleanup function below.
      return () => {
        // <-- cleanup
        btnRef.current?.removeEventListener("click", onClickGood)
      }
    },
    { scope: containerRef }
  )
  return (
    <div className="flex gap-2">
      <div ref={containerRef}>
        <button ref={btnRef} className="box gradient-blue cursor-pointer">
          Click Me
        </button>
      </div>
      <button className="box gradient-blue cursor-pointer">Click Me</button>
    </div>
  )
}
