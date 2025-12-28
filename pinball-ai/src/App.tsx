import { useEffect, useRef, useState } from "react"
import axios from 'axios'

export default function App() {

  const [falling, setFalling] = useState<boolean>(true);
  const [movingRight, setMovingRight] = useState<boolean>(true);
  const [lastMaxHeightPosition, setLastMaxHeightPosition] = useState<number | undefined>()
  const [lastImpactPosition, setImpactPosition] = useState<number | undefined>()
  const gameBar = useRef<HTMLDivElement | null>(null)
  // 500 / 30 = 20, horizontal game bar positions in intervals of 20
  // whatever the predicted game bar position is, we set pixels to the product of this number & 30
  // eg target position for game bar of 5 will set the "left" style property to "150px"
  const gameBall = useRef<HTMLDivElement | null>(null)
  const [failed, setFailed] = useState<boolean>(false);
  // const [nextGameBarXPositionPrediction, setNextGameBarXPositionPrediction] = useState<number | undefined>();

  type ModelParams = {
    weight_1: number,
    weight_2: number,
    bias: number
  };

  const [modelParams, setModelParams] = useState<ModelParams | undefined>();

  const getInitialModelParams = async () => {
    const response = await axios.get('http://localhost:8000/app/get_current_model_parameters')
    setModelParams(response.data)
  }
  useEffect(() => {
    getInitialModelParams();
  }, [])

  useEffect(() => {
    if (failed) {
      setTimeout(() => {
        setLastMaxHeightPosition(undefined);
        setImpactPosition(undefined);
        setFailed(false);
      }, 1000);
    } else {

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
      }, 0.1)

      return () => clearInterval(interval)
    }

  }, [falling, movingRight, failed, lastImpactPosition, modelParams])

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
    gameBall.current.style.top = `${(newTopValue).toString()}px`
    gameBall.current.style.left = `${(newLeftValue).toString()}px`
    return
  }

  const updateFallingState = (newTopValue: number, gameBallPos: DOMRect): void => {
    if (newTopValue <= 100) {
      const maxHeightPosition = gameBallPos.left - 25
      setFalling(true)
      setLastMaxHeightPosition(maxHeightPosition / 500);
      setImpactPosition(undefined)
      const nextGameBarPosition = predictNextGameBarPosition(maxHeightPosition)
      console.log(`Prediction: ${nextGameBarPosition}`)
      // setNextGameBarXPositionPrediction(nextGameBarPosition);
      if (!gameBar.current) return;
      gameBar.current.style.left = `${nextGameBarPosition}px`
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

  const predictNextGameBarPosition = (maxHeightPosition: number): number => {
    if (!modelParams) return 0;
    const direction = movingRight ? 1 : 0
    console.log(modelParams.weight_1, modelParams.weight_2, modelParams.bias)

    return modelParams.weight_1 * maxHeightPosition + modelParams.weight_2 * direction + modelParams.bias
  }

  const gameBarPresentForImpact = (gameBallPos: DOMRect): [boolean, number] => {
    if (!gameBar.current) return [false, gameBallPos.left + 50];
    const gameBarPos = gameBar.current.getBoundingClientRect();
    const [qualifyingRangeLow, qualifyingRangeHigh] = [gameBallPos.left - 40, gameBallPos.left + 40]
    if ((qualifyingRangeLow <= gameBarPos.left) && (gameBarPos.left <= qualifyingRangeHigh)) return [true, gameBallPos.left + 50];
    return [false, gameBallPos.left + 50];
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
    const response = await axios.patch('http://localhost:8000/app/add_pinball_data_and_get_updated_params', data)
    setModelParams(response.data)


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