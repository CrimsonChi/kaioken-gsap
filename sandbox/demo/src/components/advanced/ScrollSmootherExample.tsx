import { useRef } from "kaioken"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { useGSAP } from "kaioken-gsap"

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother)

export function ScrollSmootherExample() {
  const main = useRef<HTMLDivElement>(null)
  const smoother = useRef<globalThis.ScrollSmoother>()

  const scrollTo = () => {
    smoother.current?.scrollTo(".box-c", true, "center center")
  }

  useGSAP(
    () => {
      // create the smooth scroller FIRST!
      smoother.current = ScrollSmoother.create({
        smooth: 2, // seconds it takes to "catch up" to native scroll position
        effects: true, // look for data-speed and data-lag attributes on elements and animate accordingly
      })
      ScrollTrigger.create({
        trigger: ".box-c",
        pin: true,
        start: "center center",
        end: "+=300",
        markers: true,
      })
    },
    { scope: main }
  )

  return (
    <>
      <div id="smooth-wrapper" ref={main}>
        <div id="smooth-content">
          <header className="header">
            <h2 className="title">GSAP ScrollSmoother in React</h2>
            <button className="button" onclick={scrollTo}>
              Jump to C
            </button>
          </header>
          <div className="box box-a gradient-blue" data-speed="0.5">
            a
          </div>
          <div className="box box-b gradient-orange" data-speed="0.8">
            b
          </div>
          <div className="box box-c gradient-purple" data-speed="1.5">
            c
          </div>
          <div className="line"></div>
        </div>
      </div>
    </>
  )
}
