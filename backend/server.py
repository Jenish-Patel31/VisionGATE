from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os
import subprocess
import json
import sys

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
INPUT_DIR = "input_pdf"
OUTPUT_DIR = "output_images"
DATA_DIR = "data"

# Ensure directories
os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Mount Static Files
app.mount("/images", StaticFiles(directory=OUTPUT_DIR), name="images")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Clean up input directory
        for filename in os.listdir(INPUT_DIR):
            file_path = os.path.join(INPUT_DIR, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f"Failed to delete {file_path}. Reason: {e}")

        # Save file
        file_path = os.path.join(INPUT_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Run Processor
        # Run Processor
        # We run it as a subprocess to keep it isolated
        # Use sys.executable to ensure we use the same python interpreter as the server
        python_executable = sys.executable

        command = [
            python_executable, 
            "processor.py", 
            "--input", file_path,
            "--output-dir", OUTPUT_DIR,
            "--data-dir", DATA_DIR
        ]
        
        result = subprocess.run(command, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"Processor Error: {result.stderr}")
            raise HTTPException(status_code=500, detail=f"Processing failed: {result.stderr}")
            
        return {"message": "File processed successfully", "filename": file.filename}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/exam-data")
async def get_exam_data():
    json_path = os.path.join(DATA_DIR, "exam_data.json")
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="Exam data not found")
        
    with open(json_path, "r") as f:
        data = json.load(f)
        
    # Update image paths to be absolute URLs or relative to server
    # The frontend expects /images/... if we mount it there.
    # The processor generates /output_images/...
    # We need to fix this match.
    
    # Processor generates: /output_images/q_1.png
    # Server mounts output_images at: /images
    # So we should replace /output_images/ with http://localhost:8000/images/
    # Or just /images/ if using relative paths in frontend (but frontend is on port 5173)
    
    base_url = os.getenv("API_URL", "http://localhost:8000")
    
    for q in data.get("questions", []):
        if q.get("imagePath"):
            # Replace /output_images/ with /images/
            q["imagePath"] = q["imagePath"].replace("/output_images/", f"{base_url}/images/")
            
    return data

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
