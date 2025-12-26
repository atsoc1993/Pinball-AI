# Plan

- Simulate a linear regression model for a pinball game in Python, where we try to determine the **new game bar position** [target] based on max-height position and velocity (speed will initially be fixed, so we will only use an angle) [inputs]. There will also be a gravitational factor but this will be fixed as well.

- Create a front-end application that visualizes said pinball game and on-failure sends patch requests to a FastAPI Python backend that updates a csv with what would have been the correct target (new game bar position) for the last max-height position and velocity, retrains our model, and provides the optimized parameters to our front-end