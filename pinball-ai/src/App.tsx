import { useEffect, useRef, useState } from "react"
import axios from 'axios'

export default function App() {

  const [falling, setFalling] = useState<boolean>(true);
  const [movingRight, setMovingRight] = useState<boolean>(true);
  const gameBar = useRef<HTMLDivElement | null>(null)
  // 500 / 30 = 20, horizontal game bar positions in intervals of 20
  // whatever the predicted game bar position is, we set pixels to the product of this number & 30
  // eg target position for game bar of 5 will set the "left" style property to "150px"
  const gameBall = useRef<HTMLDivElement | null>(null)
  const [lastMaxHeightPosition, setLastMaxHeightPosition] = useState<number | undefined>()
  const [lastImpactPosition, setImpactPosition] = useState<number | undefined>()

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
      updateFallingState(newTopValue, gameBallPos);
      checkMovingRightState(newLeftValue);
    }, 1)

    return () => clearInterval(interval)

  }, [falling, movingRight, failed, lastImpactPosition])

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

  const updateFallingState = (newTopValue: number, gameBallPos: DOMRect): void => {
    if (newTopValue <= 100) {
      setFalling(true)
      setLastMaxHeightPosition(gameBallPos.left);
      setImpactPosition(undefined)
    }
    if (newTopValue >= 350 && !lastImpactPosition) {
      const [madeImpact, impactPos] = gameBarPresentForImpact(gameBallPos);
      setImpactPosition(impactPos);
      if (madeImpact) setFalling(false);
    }
    if (newTopValue > 500) {
      setFailed(true)
      updateModel()
    };
    return
  }

  const gameBarPresentForImpact = (gameBallPos: DOMRect): [boolean, number] => {
    if (!gameBar.current) return [false, gameBallPos.left];
    const gameBarPos = gameBar.current.getBoundingClientRect();
    const [qualifyingRangeLow, qualifyingRangeHigh] = [gameBallPos.left - 25, gameBallPos.left + 25]
    if ((qualifyingRangeLow <= gameBarPos.left) && (gameBarPos.left <= qualifyingRangeHigh)) return [true, gameBallPos.left];
    return [false, gameBallPos.left];
  }

  const checkMovingRightState = (newLeftValue: number): void => {
    if (newLeftValue <= 0) setMovingRight(true);
    if (newLeftValue >= 450) setMovingRight(false);
    return
  }

  const updateModel = async () => {
    const data = {
      moving_right: movingRight,
      x_pos_at_max_height: lastMaxHeightPosition,
      impact_position: lastImpactPosition
    }
    console.log(data)
    const response = await axios.patch('http://localhost:8000/app/add_pinball_data', data)
    console.log(response)


  }
  return (
    // Game Box
    <div style={{ width: '500px', height: '500px', backgroundColor: 'black', display: 'flex' }}>
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
        : <div style={{ display: 'flex', justifyContent: 'center', flex: '1 1 100%' }}>
          <h1 style={{ color: 'white', margin: 0, alignSelf: 'center' }}>Failed</h1>
        </div>
      }
    </div>
  )
}