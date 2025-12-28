## Plan

- Simulate a linear regression model for a pinball game in Python, where we try to determine the **new game bar position** [target] based on max-height position and velocity (speed will initially be fixed, so we will only use an angle) [inputs]. There will also be a gravitational factor but this will be fixed as well.

- Create a front-end application that visualizes said pinball game and on-failure sends patch requests to a FastAPI Python backend that updates a csv with what would have been the correct target (new game bar position) for the last max-height position and velocity, retrains our model, and provides the optimized parameters to our front-end

## Current State

<video controls src="ModelTestVisualized.mp4" title="Title"></video>

Implemented as planned— there is a Python FastAPI Backend & React TS front-end that visualizes the game ball (this can be seen in the video above); we are not using angle or velocity in features due to complications when attempting to visualize these, we instead just use the initial direction of the game ball (left/right) as well as the impact location (an x-axis point at a fixed height in the game window where the game bar is). Learning rates & epochs are not set in stone, and still zeroing in on optimal values for these— the model could benefit from additional features eg; does the ball impact the wall while descending/ascending.

## Usage
# Project Setup & Dependencies
- `git clone atsoc1993/Pinball-AI`
- From root folder, use `pip install -r requirements.txt`
- From `pinball-ai` folder use `npm install`

# Running
- Use `fastapi backend.py run` to start backend from root folder
- Use `npm run dev` from `pinball-ai` folder
- Visit localhost page url generated from npm run dev command in browser (http://localhost:5173[+ n instances running])