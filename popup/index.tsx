import { useState } from "react"
import "./index.css"

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div className="border-black border-2 bg-black/80 p-4 text-white">
        <h1 className="text-red-600">Built by chon</h1>
        <h3>If my extension was helpful, consider supporting me <a>here</a>.</h3>
    </div>
  )
}

export default IndexPopup