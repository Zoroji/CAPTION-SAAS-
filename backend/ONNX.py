from pathlib import Path
from optimum.onnxruntime import ORTModelForFeatureExtraction, ORTQuantizer
from optimum.onnxruntime.configuration import AutoQuantizationConfig

# DINOv2-small ONNX Export & INT8 Quantization
# Model: facebook/dinov2-small (22M parameters, 384 dimensions)
# Results in a lightweight ~23MB INT8 quantized ONNX model for high-efficiency CPU inference.

ROOT_DIR = Path(__file__).resolve().parent.parent
VECTOR_DIR = ROOT_DIR / "vectors"

model_id = "facebook/dinov2-small"
onnx_temp_path = VECTOR_DIR / "dinov2_onnx_temp"
quantized_dir = VECTOR_DIR / "dinov2_onnx_quantized"

print(f"1. Exporting {model_id} to ONNX format...")
model = ORTModelForFeatureExtraction.from_pretrained(model_id, export=True)
model.save_pretrained(onnx_temp_path)

print("2. Quantizing weights to INT8...")
quantizer = ORTQuantizer.from_pretrained(onnx_temp_path)
cq = AutoQuantizationConfig.avx512_vnni(is_static=False, per_channel=False)
quantizer.quantize(save_dir=quantized_dir, quantization_config=cq)

# Clean up unquantized intermediate files
import shutil
if onnx_temp_path.exists():
    shutil.rmtree(onnx_temp_path)

print(f"Successfully exported and quantized DINOv2-small to: {quantized_dir / 'model_quantized.onnx'}")