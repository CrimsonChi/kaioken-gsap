import { Link, Router, Route } from "kaioken/router"
import { ScrollSmootherExample } from "./ScrollSmootherExample"
import { TimelineExample } from "./TimelineExample"

export function Advanced() {
  return (
    <div className="flex flex-col">
      <nav className="flex gap-2">
        <Link to="/scroll-smoother" inherit>
          ScrollSmoother
        </Link>
        <Link to="/timeline-example" inherit>
          Timelines
        </Link>
      </nav>
      <Router>
        <Route path="/scroll-smoother" element={<ScrollSmootherExample />} />
        <Route path="/timeline-example" element={<TimelineExample />} />
      </Router>
    </div>
  )
}
