import { useRef } from "kaioken"
import gsap from "gsap"
import { useGSAP } from "kaioken-gsap"

export function TimelineExample() {
  const container = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline>()

  const toggleTimeline = () => {
    tl.current?.reversed(!tl.current.reversed())
  }

  useGSAP(
    () => {
      const boxes = gsap.utils.toArray(".box")
      tl.current = gsap
        .timeline()
        .to(boxes[0]!, { x: 120, rotation: 360 })
        .to(boxes[1]!, { x: -120, rotation: -360 }, "<")
        .to(boxes[2]!, { y: -166 })
        .reverse()
    },
    { scope: container }
  )

  return (
    <main>
      <section className="boxes-container" ref={container}>
        <h2>Use the button to toggle a Timeline</h2>
        <div>
          <button onclick={toggleTimeline}>Toggle Timeline</button>
        </div>
        <div className="box gradient-blue">Box 1</div>
        <div className="box gradient-blue">Box 2</div>
        <div className="box gradient-blue">Box 3</div>
      </section>
    </main>
  )
}
