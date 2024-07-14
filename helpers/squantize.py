import onnx
from onnxruntime.quantization import quantize_dynamic, QuantType

# Load your model
model_path = 'emotion-english-distilroberta-base-onnx/onnx/model.onnx'
model = onnx.load(model_path)

# Quantize the model
quantized_model_path = 'emotion-english-distilroberta-base-onnx/onnx/model_quantized.onnx'
quantize_dynamic(model_path, quantized_model_path, weight_type=QuantType.QInt8)

print(f"Quantized model saved to: {quantized_model_path}")
