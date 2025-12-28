import { useEffect, useRef, useState } from "react"
import axios from 'axios'

export default function App() {

  const [falling, setFalling] = useState<boolean>(true);
  const [movingRight, setMovingRight] = useState<boolean>(true);
  const [initiallyMovingRight, setInitiallyMovingRight] = useState(true);
  const [lastMaxHeightPosition, setLastMaxHeightPosition] = useState<number | undefined>()
  const [lastImpactPosition, setImpactPosition] = useState<number | undefined>()
  
  const lockImpact = useRef(false);
  const requiresNewInitial = useRef(true);
  const nextTargetSetRef = useRef(false);
  const gameBar = useRef<HTMLDivElement | null>(null)

  const gameBall = useRef<HTMLDivElement | null>(null)
  const [failed, setFailed] = useState<boolean>(false);

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

  const setInitialXPosition = (): [number, boolean] => {

    if (!gameBall.current) return [0, false];
    const randomNum = Math.random()
    const initialMaxHeightXPos = Number((randomNum * 500).toFixed(0))
    const randomBinary = Number((randomNum * 100).toFixed(0)) % 2
    const willMoveRight = randomBinary == 1 ? true : false;
    setMovingRight(willMoveRight);
    setInitiallyMovingRight(willMoveRight);
    (true)
    
    gameBall.current.style.left = `${initialMaxHeightXPos}px`
    setLastMaxHeightPosition(initialMaxHeightXPos / 500);
    return [initialMaxHeightXPos, willMoveRight]
  }

  useEffect(() => {

    if (failed) {
      setTimeout(() => {
        requiresNewInitial.current = true;
        nextTargetSetRef.current = false;
        setLastMaxHeightPosition(undefined);
        setFailed(false);
        lockImpact.current = false
      }, 2000);
  }
 }, [failed, lastImpactPosition])

  useEffect(() => {

      const interval = setInterval(() => {
        if (!modelParams) return;
        if (requiresNewInitial.current) {
          requiresNewInitial.current = false;
          const [initialMaxHeightXPos, willMoveRight] = setInitialXPosition();
          setNextGameBarPosition(initialMaxHeightXPos / 500, willMoveRight);
        } else {

          if (!gameBall.current) return;
          
          const gameBallPos = gameBall.current.getBoundingClientRect()
          const topPosition = gameBallPos.top
          const leftPosition = gameBallPos.left
          const newTopValue = getNewTopValue(topPosition);
          const newLeftValue = getNewLeftValue(leftPosition);
          
          adjustBallPosition(newTopValue, newLeftValue);
          updateFallingState(newTopValue, gameBallPos);
          checkMovingRightState(newLeftValue);
        }
      }, 1)

      return () => clearInterval(interval)

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
      setInitiallyMovingRight(movingRight);
      if (!requiresNewInitial.current && !nextTargetSetRef.current) setNextGameBarPosition(maxHeightPosition / 500, movingRight)

    }

    if (newTopValue >= 350 && !lockImpact.current) {
      lockImpact.current = true;
      const [madeImpact, impactPos] = gameBarPresentForImpact(gameBallPos);
      console.log(madeImpact, impactPos)
      setImpactPosition(impactPos);
      if (madeImpact) {
        setFalling(false)
        lockImpact.current = false;
        nextTargetSetRef.current = false;
      };
    }
    if (newTopValue > 500) {
      setFailed(true)
      updateModel()

    };
    return
  }
  const setNextGameBarPosition = (maxHeightPosition: number, isMovingRight: boolean) => {
      if (nextTargetSetRef.current) return;
      nextTargetSetRef.current = true;
      const nextGameBarPosition = predictNextGameBarPosition(maxHeightPosition, isMovingRight)
      console.log(`Prediction: ${nextGameBarPosition}`)
      // setNextGameBarXPositionPrediction(nextGameBarPosition);
      if (!gameBar.current) return;
      gameBar.current.style.left = `${nextGameBarPosition}px`
  }

  const predictNextGameBarPosition = (maxHeightPosition: number, isMovingRight: boolean): number => {
    if (!modelParams) return 0;
    const direction = isMovingRight ? 1 : 0
    // console.log(modelParams.weight_1, modelParams.weight_2, modelParams.bias)

    return modelParams.weight_1 * direction + modelParams.weight_2 * maxHeightPosition + modelParams.bias
  }


  const gameBarPresentForImpact = (gameBallPos: DOMRect): [boolean, number] => {
    if (!gameBar.current) return [false, gameBallPos.left + 25];
    const gameBarPos = gameBar.current.getBoundingClientRect();
    const [qualifyingRangeLow, qualifyingRangeHigh] = [gameBallPos.left - 25, gameBallPos.left + 25]
    if ((qualifyingRangeLow <= gameBarPos.left + 25) && (gameBarPos.left - 25 <= qualifyingRangeHigh)) return [true, gameBallPos.left + 25];
    return [false, gameBallPos.left + 50];
  }

  const checkMovingRightState = (newLeftValue: number): void => {
    if (newLeftValue <= 0) setMovingRight(true);
    if (newLeftValue >= 450) setMovingRight(false);
    return
  }

  const updateModel = async () => {
    const data = {
      moving_right: initiallyMovingRight,
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
            left: '0px', top: '400px'
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