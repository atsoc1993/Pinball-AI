import { useEffect, useRef, useState } from "react"

export default function App() {

  const [falling, setFalling] = useState<boolean>(true);
  const [movingRight, setMovingRight] = useState<boolean>(true);
  const gameBar = useRef<HTMLDivElement | null>(null)
  // 500 / 30 = 20, horizontal game bar positions in intervals of 20
  // whatever the predicted game bar position is, we set pixels to the product of this number & 30
  // eg target position for game bar of 5 will set the "left" style property to "150px"
  const gameBall = useRef<HTMLDivElement | null>(null)

  const [failed, setFailed] = useState<boolean>(false);


  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameBall.current) return;

      const gameBallPos = gameBall.current.getBoundingClientRect()
      const topPosition = gameBallPos.top
      const leftPosition = gameBallPos.left

      const newTopValue = getNewTopValue(topPosition);
      const newLeftValue = getNewLeftValue(leftPosition);

      adjustBallPosition(newTopValue, newLeftValue);
      checkFallingState(newTopValue, gameBallPos);
      checkMovingRightState(newLeftValue);
    }, 1)

    return () => clearInterval(interval)

  }, [falling, movingRight, failed])

  const getNewTopValue = (topPosition: number): number => {
    const gravityDelta = 1 * ((topPosition - 98) / 50)
    if (falling) {
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
    return
  }

  const checkFallingState = (newTopValue: number, gameBallPos: DOMRect): void => {
    if (newTopValue <= 100) setFalling(true);
    if (newTopValue >= 350) {
      const madeImpact = gameBarPresentForImpact(gameBallPos);
      console.log(madeImpact)
      if (madeImpact) setFalling(false);
    }
    if (newTopValue > 500) setFailed(true);
    return
  }

  const gameBarPresentForImpact = (gameBallPos: DOMRect): boolean => {
    if (!gameBar.current) return false;
    const gameBarPos = gameBar.current.getBoundingClientRect();
    const [qualifyingRangeLow, qualifyingRangeHigh] = [gameBallPos.left - 25, gameBallPos.left + 25]
    if ((qualifyingRangeLow <= gameBarPos.left) && (gameBarPos.left <= qualifyingRangeHigh)) return true;
    return false;
  }

  const checkMovingRightState = (newLeftValue: number): void => {
    if (newLeftValue <= 0) setMovingRight(true);
    if (newLeftValue >= 450) setMovingRight(false);
    return
  }

  return (
    // Game Box
    <div style={{ width: '500px', height: '500px', backgroundColor: 'black', display: 'flex'}}>
      {/* // Game Bar  */}
      {!failed ?
        <>
          <div style={{
            width: '50px', height: '20px', backgroundColor: 'white',
            position: 'fixed',
            left: '200px', top: '400px'
          }}
            ref={gameBar} />

          {/* game ball */}
          <div style={{ width: '50px', height: '50px', borderRadius: '50px', backgroundColor: 'white', top: '100px', position: 'fixed' }}
            ref={gameBall}>

          </div>
        </>
        : <div style={{display: 'flex', justifyContent: 'center', flex: '1 1 100%'}}>
          <h1 style={{color: 'white', margin: 0, alignSelf: 'center'}}>Failed</h1>
          </div>
      }
    </div>
  )
}