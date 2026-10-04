from optimum.onnxruntime import ORTModelForCustomTasks, ORTQuantizer
from optimum.onnxruntime.configuration import AutoQuantizationConfig
from pathlib import Path

#ONNX Open Neural Network Exchange
#You can build and train a model in PyTorch, TensorFlow, or Scikit-learn,
#export it to an ONNX file, and run it in a completely different environment
#without getting locked into one ecosystem

model_id = "openai/clip-vit-base-patch32"
onnx_path = Path("./onnx_clip")

model = ORTModelForCustomTasks.from_pretrained(model_id,export=True)
model.save_pretrained(onnx_path)

#quantizationfrom 32 to 8 bits model weight
quantizer = ORTQuantizer.from_pretrained(onnx_path)
cq = AutoQuantizationConfig.avx512_vnni(is_static=False, per_channel=False)
quantizer.quantize(save_dir="./onnx_clip_quantized", quantization_config=cq)

print("✅ Model successfully exported and quantized to ONNX format!")