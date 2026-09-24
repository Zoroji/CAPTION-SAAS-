import kagglehub

# Download latest version
path = kagglehub.dataset_download("prithvijaunjale/instagram-images-with-captions")

print("Path to dataset files:", path)