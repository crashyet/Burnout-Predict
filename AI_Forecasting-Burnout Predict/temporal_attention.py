import tensorflow as tf

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
        config.update({
            "units": self.units
        })
        return config