class AttentionLayer(tf.keras.layers.Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    
    def build(self, input_shape):
        self.W = self.add_weight(
            name="att_weight",
            shape=(input_shape[-1], input_shape[-1]),
            initializer='glorot_uniform',
            trainable=True
        )
        
        self.u = self.add_weight(
            name="att_context_vector",
            shape=(input_shape[-1], 1),
            initializer="glorot_uniform",
            trainable=True
        )
        
        super().build(input_shape)
    
    def call(self, inputs, mask=None):
        v = tf.tanh(tf.matmul(inputs, self.W))
        score = tf.matmul(v, self.u)
        
        if mask is not None:
            mask = tf.cast(mask, tf.float32)
            mask = tf.expand_dims(mask, axis=-1)
            score += (1.0 - mask) * -1e9
            
        weights = tf.nn.softmax(score, axis=1)  # softmax digunakan untuk menghasilkan bobot attention
        context = inputs*weights
        context = tf.reduce_sum(context, axis=1)    # menghasilkan representasi akhir teks berdasarkan attention weight
        
        return context
    
    def compute_mask(self, inputs, mask=None):
        return None