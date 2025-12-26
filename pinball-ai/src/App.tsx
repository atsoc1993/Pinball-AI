import { useEffect, useRef } from "react"

export default function App() {

  const gameBar = useRef<HTMLDivElement | null>(null)
  // 500 / 30 = 20, horizontal game bar positions in intervals of 20
  // whatever the predicted game bar position is, we set pixels to the product of this number & 30
  // eg target position for game bar of 5 will set the "left" style property to "150px"
  const gameBall = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(gameBall.current?.getBoundingClientRect())
    }, 50)

    return () => clearInterval(interval)

  }, [])

  return (
    // Game Box
    <div style={{ width: '500px', height: '500px', backgroundColor: 'black' }}>
      {/* // Game Bar  */}
      <div style={{
        width: '50px', height: '20px', backgroundColor: 'white',
        position: 'fixed',
        left: '0px', top: '400px'
      }}
      ref={gameBar} />

      {/* game ball */}
      <div style={{ width: '50px', height: '50px', borderRadius: '50px', backgroundColor: 'white', top: '100px', position: 'fixed'}}
      ref={gameBall}>

      </div>
    </div>
  )
}