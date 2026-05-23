import numpy as np
import pandas as pd
import tensorflow as tf
import pickle
from temporal_attention import TemporalAttention
 

WINDOW_SIZE = 7

best_model = tf.keras.models.load_model(
    "best_burnout_model.keras",
    custom_objects={
        "TemporalAttention": TemporalAttention
    }
)

with open("feature_scaler.pkl", "rb") as f:
    feature_scaler = pickle.load(f)

with open("target_scaler.pkl", "rb") as f:
    target_scaler = pickle.load(f)


def get_burnout_level(score):
    if score < 40:
        return "Low"
    elif score < 70:
        return "Moderate"
    else:
        return "High"


def combine_with_questionnaire(predicted_score, questionnaire_score):

    predicted_score = float(predicted_score)
    questionnaire_score = float(questionnaire_score)

    diff = abs(predicted_score - questionnaire_score)

    if diff <= 10:
        final_score = (
            0.5 * predicted_score
        ) + (
            0.5 * questionnaire_score
        )

        weighting_type = "balanced weighting"

    elif diff <= 25:
        final_score = (
            0.4 * predicted_score
        ) + (
            0.6 * questionnaire_score
        )

        weighting_type = "moderate questionnaire priority"

    else:
        final_score = (
            0.3 * predicted_score
        ) + (
            0.7 * questionnaire_score
        )

        weighting_type = "high questionnaire priority"

    final_score = np.clip(final_score, 0, 100)

    return {
        "final_score": round(float(final_score), 2),
        "difference": round(float(diff), 2),
        "weighting_type": weighting_type
    }


def predict_burnout_score_final(
    work_hours_7days,
    sleep_hours_7days,
    consecutive_overwork_7days,
    burnout_score_7days,
    questionnaire_score
):

    if not (
        len(work_hours_7days)
        == len(sleep_hours_7days)
        == len(consecutive_overwork_7days)
        == len(burnout_score_7days)
        == WINDOW_SIZE
    ):
        raise ValueError(
            "Semua input harus berisi tepat 7 data"
        )

    if questionnaire_score < 0 or questionnaire_score > 100:
        raise ValueError(
            "questionnaire_score harus berada pada rentang 0-100"
        )

    df_temp = pd.DataFrame({
        "work_hours_per_day": work_hours_7days,
        "sleep_hours": sleep_hours_7days,
        "consecutive_overwork": consecutive_overwork_7days,
        "burnout_score": burnout_score_7days
    })


    df_temp["sleep_work_ratio"] = (
        df_temp["sleep_hours"]
        / (df_temp["work_hours_per_day"] + 1e-6)
    )

    burnout_mean = df_temp["burnout_score"].mean()

    burnout_std = df_temp["burnout_score"].std()

    work_mean = df_temp["work_hours_per_day"].mean()

    sleep_mean = df_temp["sleep_hours"].mean()

    if np.isnan(burnout_std):
        burnout_std = 0.0

    df_temp["burnout_rolling_mean_7"] = burnout_mean

    df_temp["burnout_rolling_mean_14"] = burnout_mean

    df_temp["burnout_rolling_std_7"] = burnout_std

    df_temp["work_rolling_mean_7"] = work_mean

    df_temp["sleep_rolling_mean_7"] = sleep_mean


    feature_order = [
        "work_hours_per_day",
        "sleep_hours",
        "consecutive_overwork",
        "sleep_work_ratio",
        "burnout_rolling_mean_7",
        "burnout_rolling_mean_14",
        "burnout_rolling_std_7",
        "work_rolling_mean_7",
        "sleep_rolling_mean_7"
    ]

    sequence_input = df_temp[
        feature_order
    ].values


    sequence_input_scaled = feature_scaler.transform(
        sequence_input
    )

    sequence_input_scaled = np.expand_dims(
        sequence_input_scaled,
        axis=0
    )


    pred_scaled = best_model.predict(
        sequence_input_scaled,
        verbose=0
    )

    behavior_score = target_scaler.inverse_transform(
        pred_scaled
    )[0][0]

    behavior_score = np.clip(
        behavior_score,
        0,
        100
    )



    combined_result = combine_with_questionnaire(
        behavior_score,
        questionnaire_score
    )

    return {
        "behavior_prediction_score": round(
            float(behavior_score), 2
        ),

        "questionnaire_score": round(
            float(questionnaire_score), 2
        ),

        "final_burnout_score": combined_result[
            "final_score"
        ],

        "final_burnout_level": get_burnout_level(
            combined_result["final_score"]
        ),

        "difference": combined_result[
            "difference"
        ],

        "weighting_type": combined_result[
            "weighting_type"
        ]
    }


if __name__ == "__main__":

    result = predict_burnout_score_final(

        work_hours_7days=[
            12, 11, 10, 11, 12, 10, 11
        ],

        sleep_hours_7days=[
            5, 6, 5, 5, 5, 6, 5
        ],

        consecutive_overwork_7days=[
            9, 10, 11, 12, 13, 14, 15
        ],

        burnout_score_7days=[
            45, 50, 48, 52, 55, 53, 56
        ],

        questionnaire_score=58
    )

    print(result)