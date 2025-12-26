import { useRef } from "react"

export default function App() {

  const gameBar = useRef<HTMLDivElement | undefined>(undefined)

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