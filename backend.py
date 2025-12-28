import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
    allow_credentials=False  
)

pinball_data_csv_filepath = 'pinball_data.csv'

global_w1 = global_w2 = global_b = 0

class PinballData(BaseModel):
    moving_right: bool
    x_pos_at_max_height: float
    impact_position: float

class ModelParams(BaseModel):
    weight_1: float
    weight_2: float
    bias: float

if os.path.exists(pinball_data_csv_filepath):
    os.remove(pinball_data_csv_filepath)

with open(pinball_data_csv_filepath, 'w') as f:
    f.writelines('direction,xPosAtMaxHeight,impactPos\n')

@app.get('/app/get_current_model_parameters')
def get_current_model_parameters() -> ModelParams:
    return ModelParams(
        weight_1=global_w1,
        weight_2=global_w2,
        bias=global_b
    )
    
@app.patch('/app/add_pinball_data_and_get_updated_params')
async def add_pinball_data(data: PinballData) -> ModelParams:
    direction = 'right' if data.moving_right else 'left'
    with open(pinball_data_csv_filepath, 'a') as f:
        f.writelines(f'{direction},{data.x_pos_at_max_height},{data.impact_position}\n')
    print('Added new line')
    new_params = await retrain_model()
    print('retrained model')
    return new_params


async def retrain_model() -> ModelParams:

    global global_w1
    global global_w2
    global global_b

    w1 = w2 = b = 0
    learning_rate = 0.0001
    epochs = 50_000
    all_pinball_data = pd.read_csv(pinball_data_csv_filepath)
    len_data = len(all_pinball_data['direction'])
    direction_feature = all_pinball_data['direction'].map({'left': 0, 'right': 1})
    max_height_x_pos_feature = all_pinball_data['xPosAtMaxHeight']
    target_impact_pos = all_pinball_data['impactPos']

    for _ in range(epochs):
        dw1 = 0
        dw2 = 0
        db = 0
        for x1, x2, y in zip(direction_feature, max_height_x_pos_feature, target_impact_pos):
            target_prediction = x1 * w1 + x2 * w2 + b
            error = target_prediction - y
            dw1 += error * x1
            dw2 += error * x2
            db += error

        dw1 /= len_data
        dw2 /= len_data
        db /= len_data

        w1 -= learning_rate * dw1
        w2 -= learning_rate * dw2
        b -= learning_rate * db

    global_w1 = w1
    global_w2 = w2
    global_b = b

    return ModelParams(
        weight_1=w1,
        weight_2=w2,
        bias=b
    )



