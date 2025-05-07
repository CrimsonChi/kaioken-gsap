import gsap from "gsap"
import { useGSAP } from "kaioken-gsap"
import { Link, Route, Router } from "kaioken/router"
import { BasicExamples } from "./components/BasicExamples"
import { Advanced } from "./components/advanced"
gsap.registerPlugin(useGSAP)

export function App() {
  return (
    <div className="App flex flex-col">
      <nav className="flex gap-2">
        <Link to="/basic-examples">Basic examples</Link>
        <Link to="/advanced">Advanced</Link>
      </nav>
      <Router>
        <Route fallthrough path="/basic-examples" element={<BasicExamples />} />
        <Route fallthrough path="/advanced" element={<Advanced />} />
      </Router>
    </div>
  )
}
