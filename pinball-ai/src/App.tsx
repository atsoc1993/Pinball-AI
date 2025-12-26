import { useEffect, useRef, useState } from "react"

export default function App() {

  const [falling, setFalling] = useState(true);
  const gameBar = useRef<HTMLDivElement | null>(null)
  // 500 / 30 = 20, horizontal game bar positions in intervals of 20
  // whatever the predicted game bar position is, we set pixels to the product of this number & 30
  // eg target position for game bar of 5 will set the "left" style property to "150px"
  const gameBall = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameBall.current) return;

      const gameBallPos = gameBall.current.getBoundingClientRect()

      let newTopValue: number;

      if (gameBallPos.top < 350 && falling) {
        newTopValue = gameBallPos.top + 1
        adjustBallPosition(newTopValue);
        console.log(`Falling: ${newTopValue} ${falling}`)

      } else {
        newTopValue = gameBallPos.top - 1
        adjustBallPosition(newTopValue);
        console.log(`Rising: ${newTopValue} ${falling}`)
      }
      
      checkFallingState(newTopValue)
    }, 5)

    return () => clearInterval(interval)

  }, [falling])

  const adjustBallPosition = (newTopValue: number) => {
    if (!gameBall.current) return;
    gameBall.current.style.top = `${(newTopValue).toLocaleString()}px`
  }

  const checkFallingState = (newTopValue: number) => {
    if (newTopValue == 100) setFalling(true);
    if (newTopValue == 350) setFalling(false);
    return
  }

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
      <div style={{ width: '50px', height: '50px', borderRadius: '50px', backgroundColor: 'white', top: '100px', position: 'fixed' }}
        ref={gameBall}>

      </div>
    </div>
  )
}