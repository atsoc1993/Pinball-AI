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

class PinballData(BaseModel):
    moving_right: bool
    x_pos_at_max_height: float
    impact_position: float


if os.path.exists(pinball_data_csv_filepath):
    os.remove(pinball_data_csv_filepath)

with open(pinball_data_csv_filepath, 'w') as f:
    f.writelines('direction,xPosAtMaxHeight,impactPos\n')

@app.get('/app/get_current_model_parameters')
def get_current_model_parameters():
    
@app.patch('/app/add_pinball_data')
def add_pinball_data(data: PinballData):
    direction = 'right' if data.moving_right else 'left'
    with open(pinball_data_csv_filepath, 'a') as f:
        f.writelines(f'{direction},{data.x_pos_at_max_height},{data.impact_position}\n')
    return ({'message': 'Data added.'})




