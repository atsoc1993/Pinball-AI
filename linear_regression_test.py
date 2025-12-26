# # Max height positions will range from 0 to 30 including start and end points (x-axis)
# from random import randint
# max_height_x_positions = [randint(0, 30) for i in range(50)]

# # angles will range between 180 and 360 since the ball will always be heading downwards at some angle from max height (3rd and 4th quadrants)
# angles = [randint(180, 360) for i in range(50)]

# # using some arbitrary decision based rules to determine targets for simulating the game
# # eg if angle is less than 270 (To the left) and we are in horizontal positions between 0 and 15, it will land between 0 and 20 in the center
# # eg if angle is less than 270 and we are in positions between 15 and 30, it will likely land somewhere in the lefthand side between 0 and 10
# # the reverse if the angle is greater than 270 for those positions

# target_game_bar_positions = [
#     randint(0, 20) if (x <= 15 and a <= 270) 
#     else randint(0, 10) if (x > 15 and a <= 270)
#     else randint(10, 30) if (x <= 15 and a >= 270)
#     else randint(20, 30)
#     for x, a in zip(max_height_x_positions, angles)
# ]

# print(target_game_bar_positions)
# learning_rate = 0.00001
# epochs = 100_000
# w1 = w2 = b = 0
# len_data = len(max_height_x_positions)
# assert len_data == len(angles) and len_data == len(target_game_bar_positions), "Features & Targets length mismatch =)"

# for _ in range(epochs):
#     dw1 = 0
#     dw2 = 0
#     db = 0
#     for x1, x2, gamebar_pos in zip(max_height_x_positions, angles, target_game_bar_positions):
#         game_bar_pos_pred = x1 * w1 + x2 * w2 + b
#         error = game_bar_pos_pred - gamebar_pos
#         dw1 += error * x1
#         dw2 += error * x2
#         db += error


#     dw1 /= len_data
#     dw2 /= len_data
#     db /= len_data

#     w1 -= learning_rate * dw1
#     w2 -= learning_rate * dw2
#     b -= learning_rate * db
#     print(f'\rW1: {w1}, W2: {w2}, B: {b}', end="", flush=True)

# print()

# test_max_height_pos = 10
# test_angle = 250
# game_bar_pos_prediction = w1 * test_max_height_pos + w2 * test_angle + b
# print(f'Game Bar Position of {game_bar_pos_prediction} predicted for Max-Height @ {test_max_height_pos} and Angle of {test_angle}')
