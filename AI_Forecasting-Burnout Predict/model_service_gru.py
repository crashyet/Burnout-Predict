import numpy as np
import pandas as pd
import tensorflow as tf
import pickle

WINDOW_SIZE = 7

MEDIAN_WORK_HOURS    = 12.0
MEDIAN_SLEEP_HOURS   = 5.0
MEDIAN_CONSECUTIVE   = 1
MEDIAN_BURNOUT_SCORE = 50.0

FEATURE_ORDER = [
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

class TemporalAttention(tf.keras.layers.Layer):
    def __init__(self, units=32, **kwargs):
        super(TemporalAttention, self).__init__(**kwargs)
        self.units = units
        self.W = tf.keras.layers.Dense(units)
        self.V = tf.keras.layers.Dense(1)

    def call(self, inputs):
        score = self.V(tf.nn.tanh(self.W(inputs)))
        attention_weights = tf.nn.softmax(score, axis=1)
        context_vector = attention_weights * inputs
        context_vector = tf.reduce_sum(context_vector, axis=1)
        return context_vector

    def get_config(self):
        config = super().get_config()
        config.update({"units": self.units})
        return config


def load_model_and_scalers():
    model = tf.keras.models.load_model(
        "best_burnout_model.keras",
        custom_objects={"TemporalAttention": TemporalAttention}
    )

    with open("feature_scaler.pkl", "rb") as f:
        feature_scaler = pickle.load(f)

    with open("target_scaler.pkl", "rb") as f:
        target_scaler = pickle.load(f)

    return model, feature_scaler, target_scaler


best_model, feature_scaler, target_scaler = load_model_and_scalers()

def get_burnout_level(score):
    if score < 40:
        return "Low"
    elif score < 70:
        return "Moderate"
    else:
        return "High"


def hitung_consecutive_overwork(work_hours_list, threshold=8):
    result, streak = [], 0
    for jam in work_hours_list:
        streak = streak + 1 if jam > threshold else 0
        result.append(streak)
    return result


def combine_with_questionnaire(predicted_score, questionnaire_score):
    diff = abs(float(predicted_score) - float(questionnaire_score))

    if diff <= 10:
        final_score    = (0.5 * predicted_score) + (0.5 * questionnaire_score)
        weighting_type = "balanced weighting"
    elif diff <= 25:
        final_score    = (0.4 * predicted_score) + (0.6 * questionnaire_score)
        weighting_type = "moderate questionnaire priority"
    else:
        final_score    = (0.3 * predicted_score) + (0.7 * questionnaire_score)
        weighting_type = "high questionnaire priority"

    return {
        "final_score"   : round(float(np.clip(final_score, 0, 100)), 2),
        "difference"    : round(float(diff), 2),
        "weighting_type": weighting_type
    }


def apply_padding(work_list, sleep_list, consec_list, burnout_list):
    current_days   = len(work_list)
    padding_needed = WINDOW_SIZE - current_days

    if padding_needed <= 0:
        return (
            work_list[-WINDOW_SIZE:],
            sleep_list[-WINDOW_SIZE:],
            consec_list[-WINDOW_SIZE:],
            burnout_list[-WINDOW_SIZE:]
        )

    return (
        ([MEDIAN_WORK_HOURS]    * padding_needed) + list(work_list),
        ([MEDIAN_SLEEP_HOURS]   * padding_needed) + list(sleep_list),
        ([MEDIAN_CONSECUTIVE]   * padding_needed) + list(consec_list),
        ([MEDIAN_BURNOUT_SCORE] * padding_needed) + list(burnout_list)
    )


def build_sequence(work_7, sleep_7, consec_7, burnout_7):
    df_temp = pd.DataFrame({
        "work_hours_per_day"  : work_7,
        "sleep_hours"         : sleep_7,
        "consecutive_overwork": consec_7,
        "burnout_score"       : burnout_7
    })

    df_temp["sleep_work_ratio"]        = df_temp["sleep_hours"] / (df_temp["work_hours_per_day"] + 1e-6)
    b_std = df_temp["burnout_score"].std()
    df_temp["burnout_rolling_mean_7"]  = df_temp["burnout_score"].mean()
    df_temp["burnout_rolling_mean_14"] = df_temp["burnout_score"].mean()
    df_temp["burnout_rolling_std_7"]   = 0.0 if np.isnan(b_std) else b_std
    df_temp["work_rolling_mean_7"]     = df_temp["work_hours_per_day"].mean()
    df_temp["sleep_rolling_mean_7"]    = df_temp["sleep_hours"].mean()

    scaled = feature_scaler.transform(df_temp[FEATURE_ORDER].values)
    return np.expand_dims(scaled, axis=0)

def get_absolute_level(score):
    if score >= 70:
        return "high"
    elif score >= 55:
        return "medium"
    else:
        return None

def analyze_trend(burnout_history: list, predicted_tomorrow: float):
    last_score = predicted_tomorrow
    abs_level  = get_absolute_level(last_score)

    if len(burnout_history) < 3:
        if abs_level == "high":
            return {
                "trend"    : "insufficient_data",
                "avg_delta": None,
                "streak_up": 0,
                "severity" : "high",
                "warning"  : (
                    f"Burnout kamu hari ini cukup tinggi ({last_score:.1f}). "
                    f"Coba perhatikan jam tidur dan waktu istirahatmu — "
                    f"analisis tren akan mulai terbaca setelah 3 hari."
                )
            }
        elif abs_level == "medium":
            return {
                "trend"    : "insufficient_data",
                "avg_delta": None,
                "streak_up": 0,
                "severity" : "medium",
                "warning"  : (
                    f"Burnout kamu hari ini di angka menengah ({last_score:.1f}). "
                    f"Masih oke, tapi tetap perlu dijaga — "
                    f"analisis tren akan mulai terbaca setelah 3 hari."
                )
            }
        else:
            return {
                "trend"    : "insufficient_data",
                "avg_delta": None,
                "streak_up": 0,
                "severity" : "neutral",
                "warning"  : (
                    f"Burnout kamu hari ini masih terkendali ({last_score:.1f}). "
                    f"Analisis tren akan mulai terbaca setelah 3 hari."
                )
            }

    full_series = list(burnout_history) + [predicted_tomorrow]
    recent      = full_series[-5:]

    deltas    = [recent[i+1] - recent[i] for i in range(len(recent) - 1)]
    avg_delta = sum(deltas) / len(deltas)

    streak = 0
    for d in reversed(deltas):
        if d > 0:
            streak += 1
        else:
            break

    all_up   = all(d > 0 for d in deltas)
    all_down = all(d < 0 for d in deltas)

    if avg_delta > 0:
        trend = "increasing"
    elif avg_delta < 0:
        trend = "decreasing"
    else:
        trend = "stable"

    if all_up and avg_delta >= 3:
        trend_severity = "high"
    elif streak >= 3:
        trend_severity = "medium"
    elif all_down and avg_delta <= -2:
        trend_severity = "positive"
    else:
        trend_severity = "neutral"

    if trend_severity == "high" and abs_level == "high":
        severity = "critical"
        warning  = (
            f"Burnout kamu sudah tinggi ({last_score:.1f}) dan terus naik {streak} hari berturut-turut. "
            f"Ini sinyal serius — tubuh dan pikiranmu butuh jeda. "
            f"Coba kurangi jam kerja dan prioritaskan tidur mulai sekarang."
        )
    elif trend_severity == "high" and abs_level == "medium":
        severity = "high"
        warning  = (
            f"Burnout kamu naik terus selama {streak} hari terakhir dan sekarang mendekati level tinggi ({last_score:.1f}). "
            f"Sebaiknya mulai ambil langkah sebelum makin berat — "
            f"kurangi sedikit beban kerja atau tambah waktu istirahat."
        )
    elif trend_severity == "high" and abs_level is None:
        severity = "medium"
        warning  = (
            f"Ada tren kenaikan burnout selama {streak} hari terakhir, meski skornya belum tinggi ({last_score:.1f}). "
            f"Perhatikan pola kerjamu sebelum mulai terasa berat."
        )
    elif trend_severity == "medium" and abs_level == "high":
        severity = "high"
        warning  = (
            f"Burnout kamu sudah di level tinggi ({last_score:.1f}) dan trennya masih naik {streak} hari terakhir. "
            f"Coba cek ulang jadwal kerjamu — mungkin sudah waktunya istirahat lebih serius."
        )
    elif trend_severity == "medium" and abs_level in ("medium", None):
        severity = "medium"
        warning  = (
            f"Burnout kamu perlahan naik dalam {streak} hari terakhir ({last_score:.1f}). "
            f"Belum kritis, tapi perlu diwaspadai — coba tambah waktu tidur atau kurangi sedikit jam kerja."
        )
    elif trend_severity == "neutral" and abs_level == "high":
        severity = "high"
        warning  = (
            f"Burnout kamu stabil, tapi di angka yang tinggi ({last_score:.1f}). "
            f"Angka segini tetap menguras energi dalam jangka panjang — "
            f"coba cari celah untuk beristirahat lebih banyak."
        )
    elif trend_severity == "neutral" and abs_level == "medium":
        severity = "medium"
        warning  = (
            f"Burnout kamu stabil di angka menengah ({last_score:.1f}). "
            f"Tidak ada tren mengkhawatirkan, tapi tetap jaga pola tidur dan istirahatmu."
        )
    elif trend_severity == "positive" and abs_level == "high":
        severity = "medium"
        warning  = (
            f"Burnout kamu mulai turun, itu bagus! Tapi angkanya masih cukup tinggi ({last_score:.1f}). "
            f"Terus jaga pola ini dan beri dirimu waktu untuk pulih lebih jauh."
        )
    elif trend_severity == "positive" and abs_level == "medium":
        severity = "positive"
        warning  = (
            f"Burnout kamu turun ke angka menengah ({last_score:.1f}) — ada kemajuan yang nyata. "
            f"Terus jaga ritme ini ya."
        )
    else:
        severity = "positive"
        warning  = (
            f"Burnout kamu membaik ({last_score:.1f}). "
            f"Apa pun yang kamu lakukan belakangan ini sepertinya cocok — terus jaga."
        )

    return {
        "trend"    : trend,
        "avg_delta": round(avg_delta, 2),
        "streak_up": streak,
        "severity" : severity,
        "warning"  : warning
    }

def predict_burnout(work_hours_list, sleep_hours_list, burnout_score_list, questionnaire_score):
    history_days = len(burnout_score_list)
    abs_level    = get_absolute_level(questionnaire_score)

    if history_days == 0:
        if abs_level == "high":
            first_severity = "high"
            first_warning  = (
                f"Burnout kamu hari ini cukup tinggi ({questionnaire_score:.1f}). "
                f"Coba perhatikan jam tidur dan waktu istirahatmu — "
                f"analisis tren akan mulai terbaca setelah 3 hari."
            )
        elif abs_level == "medium":
            first_severity = "medium"
            first_warning  = (
                f"Burnout kamu hari ini di angka menengah ({questionnaire_score:.1f}). "
                f"Masih oke, tapi tetap perlu dijaga — "
                f"analisis tren akan mulai terbaca setelah 3 hari."
            )
        else:
            first_severity = "neutral"
            first_warning  = (
                f"Burnout kamu hari ini masih terkendali ({questionnaire_score:.1f}). "
                f"Analisis tren akan mulai terbaca setelah 3 hari."
            )

        return {
            "behavior_prediction_score": None,
            "questionnaire_score"      : round(float(questionnaire_score), 2),
            "final_burnout_score"      : round(float(questionnaire_score), 2),
            "final_burnout_level"      : get_burnout_level(questionnaire_score),
            "difference"               : None,
            "weighting_type"           : "questionnaire only",
            "note"                     : "Hari pertama — prediksi berdasarkan kuesioner saja",
            "trend_warning"            : {
                "trend"    : "insufficient_data",
                "avg_delta": None,
                "streak_up": 0,
                "severity" : first_severity,
                "warning"  : first_warning
            }
        }

    consec_list = hitung_consecutive_overwork(work_hours_list)

    work_7, sleep_7, consec_7, burnout_7 = apply_padding(
        work_hours_list, sleep_hours_list, consec_list, burnout_score_list
    )

    sequence       = build_sequence(work_7, sleep_7, consec_7, burnout_7)
    pred           = best_model.predict(sequence, verbose=0)
    behavior_score = float(np.clip(target_scaler.inverse_transform(pred)[0][0], 0, 100))
    combined       = combine_with_questionnaire(behavior_score, questionnaire_score)

    note = (
        f"Data {history_days} hari — {WINDOW_SIZE - history_days} hari dipadding. Akurasi meningkat seiring penggunaan."
        if history_days < WINDOW_SIZE
        else "Prediksi penuh — akurasi optimal"
    )

    trend_warning = analyze_trend(
        burnout_history    = burnout_score_list,
        predicted_tomorrow = combined["final_score"]
    )

    return {
        "behavior_prediction_score": round(behavior_score, 2),
        "questionnaire_score"      : round(float(questionnaire_score), 2),
        "final_burnout_score"      : combined["final_score"],
        "final_burnout_level"      : get_burnout_level(combined["final_score"]),
        "difference"               : combined["difference"],
        "weighting_type"           : combined["weighting_type"],
        "note"                     : note,
        "trend_warning"            : trend_warning
    }
