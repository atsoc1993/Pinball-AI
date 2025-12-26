# Max height positions will range from 0 to 30 including start and end points (x-axis)
from random import randint
max_height_x_positions = [randint(0, 30) for i in range(50)]

# angles will range between 180 and 360 since the ball will always be heading downwards at some angle from max height (3rd and 4th quadrants)
angles = [randint(180, 360) for i in range(50)]

# using some arbitrary decision based rules to determine targets for simulating the game
# eg if angle is less than 270 (To the left) and we are in horizontal positions between 0 and 15, it will land between 0 and 20 in the center
# eg if angle is less than 270 and we are in positions between 15 and 30, it will likely land somewhere in the lefthand side between 0 and 10
# the reverse if the angle is greater than 270 for those positions

target_game_bar_positions = [
    randint(0, 20) if (x <= 15 and a <= 270) 
    else randint(0, 10) if (x >= 15 and a <= 270)
    else randint(10, 30) if (x <= 15 and a >= 270)
    else randint(20, 30) if (x >= 15 and a >= 270)
    else ""
    for x, a in zip(max_height_x_positions, angles)]

print(target_game_bar_positions)