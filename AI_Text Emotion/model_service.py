import pickle
import numpy as np
import tensorflow as tf
import re 
from collections import Counter
from tensorflow.keras.preprocessing.sequence import pad_sequences
from attention_layer import AttentionLayer

MAX_LEN = 150

model = tf.keras.models.load_model(
    "best_model_nlp.keras",
    custom_objects={"AttentionLayer": AttentionLayer}
)

with open("tokenizer.pkl", "rb") as f:
    tokenizer = pickle.load(f)

with open("label_encoder.pkl", "rb") as f:
    label_encoder = pickle.load(f)


def split_text(text, chunk_size=150, overlap=35):
    words = text.split()
    chunks = []
    step = chunk_size - overlap

    for i in range(0, len(words), step):
        chunk = words[i:i + chunk_size]

        if len(chunk) > 0:
            chunks.append(" ".join(chunk))

    return chunks

def clean_text(text):
    text = str(text)
    
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"(.)\1{4,}", r"\1\1\1", text)
    
    text = text.strip()
    
    return text

def predict_long_text(text):
    if not text or not text.strip():
        return {
            "error": "Input teks tidak boleh kosong"
        }

    chunks = split_text(text)

    sequences = tokenizer.texts_to_sequences(chunks)

    padded = pad_sequences(
        sequences,
        maxlen=MAX_LEN,
        padding="post",
        truncating="post"
    )

    preds = model.predict(padded, verbose=0)

    labels = []

    for pred in preds:
        label = label_encoder.inverse_transform([np.argmax(pred)])[0]
        labels.append(label)

    final_probs = np.mean(preds, axis=0)

    vote_counter = Counter(labels)
    majority_label = vote_counter.most_common(1)[0][0]

    prob_label = label_encoder.inverse_transform(
        [np.argmax(final_probs)]
    )[0]

    if vote_counter[majority_label] >= 3:
        final_label = majority_label
    else:
        final_label = prob_label

    top2_idx = np.argsort(final_probs)[-2:][::-1]

    top2 = [
        {
            "emotion": label_encoder.classes_[idx],
            "probability": float(round(final_probs[idx], 3))
        }
        for idx in top2_idx
    ]

    all_probabilities = {
        label_encoder.classes_[i]: float(round(final_probs[i], 3))
        for i in range(len(label_encoder.classes_))
    }

    return {
        "final_emotion": final_label,
        "top_2_emotions": top2,
        "all_probabilities": all_probabilities
    }


if __name__ == "__main__":

    user_text = input("Masukkan teks: ")

    result = predict_long_text(user_text)

    print("\nHasil Prediksi:")
    print(result)
