import { useEffect, useRef, useState } from "react"

export default function App() {

  const [falling, setFalling] = useState<boolean>(true);
  const [movingRight, setMovingRight] = useState<boolean>(true);
  const gameBar = useRef<HTMLDivElement | null>(null)
  // 500 / 30 = 20, horizontal game bar positions in intervals of 20
  // whatever the predicted game bar position is, we set pixels to the product of this number & 30
  // eg target position for game bar of 5 will set the "left" style property to "150px"
  const gameBall = useRef<HTMLDivElement | null>(null)


  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameBall.current) return;

      const gameBallPos = gameBall.current.getBoundingClientRect()
      const topPosition = gameBallPos.top
      const leftPosition = gameBallPos.left

      const newTopValue = getNewTopValue(topPosition);
      const newLeftValue = getNewLeftValue(leftPosition);
      
      adjustBallPosition(newTopValue, newLeftValue);
      checkFallingState(newTopValue);
      checkMovingRightState(newLeftValue);
    }, 1)

    return () => clearInterval(interval)

  }, [falling, movingRight])

  const getNewTopValue = (topPosition: number): number => {
      const gravityDelta = 1 * ((topPosition - 98) / 50) 
      if (topPosition < 350 && falling) {
        return topPosition + gravityDelta        
      } else {
        return topPosition - gravityDelta
      }
  }

  const getNewLeftValue = (leftPosition: number): number => {
      if (movingRight) {
        return leftPosition + .8
      } else {
        return leftPosition - .8
      }
  }
  const adjustBallPosition = (newTopValue: number, newLeftValue: number): void => {
    if (!gameBall.current) return;
    gameBall.current.style.top = `${(newTopValue).toLocaleString()}px`
    gameBall.current.style.left = `${(newLeftValue).toLocaleString()}px`
  }

  const checkFallingState = (newTopValue: number): void => {
    if (newTopValue <= 100) setFalling(true);
    if (newTopValue >= 350) setFalling(false);
    return
  }
  const checkMovingRightState = (newLeftValue: number): void => {
    if (newLeftValue <= 0) setMovingRight(true);
    if (newLeftValue >= 450) setMovingRight(false);
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