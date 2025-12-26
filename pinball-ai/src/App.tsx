import { useRef } from "react"

export default function App() {

  const gameBar = useRef<HTMLDivElement | undefined>(undefined)
  // 500 / 30 = 20, horizontal game bar positions in intervals of 20
  // whatever the predicted game bar position is, we set pixels to the product of this number & 30
  // eg target position for game bar of 5 will set the "left" style property to "150px"
  return (
    // Game Box
    <div style={{ width: '500px', height: '500px', backgroundColor: 'black' }}>
      {/* // Game Bar  */}
      <div style={{
        width: '50px', height: '20px', backgroundColor: 'white',
        position: 'fixed',
        left: '0px', top: '400px'
      }} />
    </div>
  )
}