"""Data analysis
Columns: Page, Item, UTCDateTime, LocalDateTime, Latitude, Longitude, TimeZone, City, County, State, Country, CellType

1. Page and Item are not relevant
2. UTCDateTime and LocalDateTime are always set
3. TimeZone, City, County, State, Country are location data
4. When Latitude is undefined or 0.0, location data is not set
5. All records have Country="United States"

Algorithm:
- Decide if record is:
    location still (still)
    location change (moving)
    tower jump (fake)
- All records start with 0% confidence
- Confidence subtracts based on location change and tower jump
- Confidence depends on:
    - Elapsed time
    - Coords change
- Define unreal_travel:
    - if absolute coordinate offset > elapsed minutes * movement_to_time_factor
    - then unreal_travel, likely tower jump
"""

import datetime as dt
import uuid

import pandas as pd
from flask import current_app
from werkzeug.datastructures import FileStorage


def save_file(file: FileStorage) -> str:
    file_id = str(uuid.uuid4())
    file.save(f'{current_app.config["UPLOAD_FOLDER"]}/{file_id}.csv')
    return file_id


# Support fast transportation like train, airplane, etc.
MAX_TIME_UNREAL_TRAVEL = 120
# higher: increase time threshold in unreal travel condition
MOVEMENT_TO_TIME_FACTOR = 1.2


def process_carrier_report(file_id: str) -> str:
    df = pd.read_csv(f'{current_app.config["UPLOAD_FOLDER"]}/{file_id}.csv')
    # timestamp to datetime
    df["UTCDateTime"] = pd.to_datetime(df["UTCDateTime"], format="%m/%d/%y %H:%M")
    df = df.sort_values(by="UTCDateTime")

    # Add TowerJump and Confidence
    df["TowerJump"] = False
    df["Confidence"] = 0
    df["ElapsedTime"] = 0
    df["CoordsOffset"] = 0.0

    geo_enabled_rows = []  # row.Index[] rows with geo coords
    real_rows = []  # row.Index[] non tower jump rows
    for row in df.itertuples():
        if pd.isna(row.State):
            continue
        if len(geo_enabled_rows) == 0:
            df.at[row.Index, "Confidence"] = 100
            geo_enabled_rows.append(row.Index)
            real_rows.append(row.Index)
            continue

        last_index = geo_enabled_rows[-1]

        # same coords
        if (
            row.Latitude == df.at[last_index, "Latitude"]
            and row.Longitude == df.at[last_index, "Longitude"]
        ):
            # same coords, last was tower_jump then now is tower_jump
            if df.at[last_index, "TowerJump"] == True:
                df.at[row.Index, "Confidence"] = 0
                df.at[row.Index, "TowerJump"] = True
                geo_enabled_rows.append(row.Index)
                continue
        # different coords, last was tower_jump
        elif df.at[last_index, "TowerJump"] == True:
            # use last in real_rows
            last_index = real_rows[-1]

        elapsed_minutes = (
            df.at[row.Index, "UTCDateTime"] - df.at[last_index, "UTCDateTime"]
        ).seconds / 60
        coords_offset = (
            abs(df.at[row.Index, "Latitude"] - df.at[last_index, "Latitude"])
            + abs(df.at[row.Index, "Longitude"] - df.at[last_index, "Longitude"])
        ) * 100
        df.at[row.Index, "ElapsedTime"] = elapsed_minutes
        df.at[row.Index, "CoordsOffset"] = coords_offset

        is_unreal_travel = (
            coords_offset > elapsed_minutes * MOVEMENT_TO_TIME_FACTOR
            and elapsed_minutes < MAX_TIME_UNREAL_TRAVEL
        )
        # different coords, unreal travel
        if is_unreal_travel:
            df.at[row.Index, "TowerJump"] = True
            df.at[row.Index, "Confidence"] = 0
            geo_enabled_rows.append(row.Index)
            continue
        # same time
        if elapsed_minutes == 0:
            # same time, same coords
            if coords_offset == 0:
                df.at[row.Index, "Confidence"] = df.at[last_index, "Confidence"]
        # different time
        else:
            # different time, same coords
            if coords_offset == 0:
                # increase confidence
                df.at[row.Index, "Confidence"] = min(
                    100, df.at[last_index, "Confidence"] + 10
                )
            # different time, different coords
            else:
                # different time, different coords, same state
                if row.State == df.at[last_index, "State"]:
                    # increase confidence
                    df.at[row.Index, "Confidence"] = min(
                        100, df.at[last_index, "Confidence"] + 10
                    )
                # different time, different coords, different state
                else:
                    df.at[row.Index, "Confidence"] = max(
                        0, df.at[last_index, "Confidence"] - 20
                    )

        geo_enabled_rows.append(row.Index)
        if df.at[row.Index, "TowerJump"] == False:
            real_rows.append(row.Index)

    # Remove helper columns
    df = df.drop(columns=["ElapsedTime", "CoordsOffset"])

    # Export df as csv
    df.to_csv(
        f'{current_app.config["UPLOAD_FOLDER"]}/{file_id}_processed.csv',
        index_label="Index",
    )
    return file_id


def get_location_data_from_file(
    file_id: str, start_date: dt.date, end_date: dt.date
) -> str:
    df = pd.read_csv(f'{current_app.config["UPLOAD_FOLDER"]}/{file_id}_processed.csv')
    df = df[df["State"].notna()]  # drop non geolocation rows

    # timestamp to datetime
    df["UTCDateTime"] = pd.to_datetime(df["UTCDateTime"], format="%Y-%m-%d %H:%M:%S")

    # Filter df by datetime range
    df = df[
        (df["UTCDateTime"].dt.date >= start_date)
        & (df["UTCDateTime"].dt.date <= end_date)
    ]
    df = df.sort_values(by="Index")

    # Export df in range { timestamp: { latitude, longitude } }
    return df.to_json(orient="records")
