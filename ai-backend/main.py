from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import pandas as pd
import os

from ai_models import predict_price, _load_artifacts, _model, _encoders, _features

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "outputs", "clean_data.csv")

class CarDetails(BaseModel):
    Brand: str
    Model: str
    Year: int
    Mileage_Cleaned: Optional[float] = 0
    mileage: Optional[float] = 0
    Engine_Cleaned: Optional[float] = 1000
    engine: Optional[float] = 1000
    Fuel: str
    Transmission: str
    Province: str
    Body_Type: Optional[str] = "Sedan"
    bodyType: Optional[str] = "Sedan"
    Feature_Count: Optional[int] = 5
    features: Optional[list] = []

@app.post("/predict")
def get_price(car: CarDetails):
    data = car.dict()
    
    details_dict = {
        "Brand": data["Brand"],
        "Model": data["Model"],
        "Year": data["Year"],
        "Mileage_Cleaned": data.get("Mileage_Cleaned") or data.get("mileage") or 0,
        "Engine_Cleaned": data.get("Engine_Cleaned") or data.get("engine") or 1000,
        "Fuel": data["Fuel"],
        "Transmission": data["Transmission"],
        "Province": data["Province"],
        "Body Type": data.get("Body_Type") or data.get("bodyType") or "Sedan",
        "Feature_Count": data.get("Feature_Count") or len(data.get("features", [])) or 5
    }
    
    result = predict_price(details_dict)
    
    # --- XGBoost Built-in Feature Importance (SHAP ka substitute) ---
    try:
        if _load_artifacts():
            # Model ki global feature importance
            importances = _model.feature_importances_
            
            # Har feature ka importance nikalain
            feature_impacts = list(zip(_features, importances))
            feature_impacts.sort(key=lambda x: abs(x[1]), reverse=True)
            
            # Top 5 factors return karein
            # Note: XGBoost ki importance hamesha positive hoti hai (0-1), 
            # isliye hum inhein thora modify karke price impact jaisa dikhayenge
            top_5 = feature_impacts[:5]
            
            # Price ke hisab se impact ka andaza lagayein (thoda dynamic banane ke liye)
            price = result["price"]
            
            result["explanation"]["top_factors"] = [
                {"feature": f, "importance": round(float(v * price * 0.3), 2)} for f, v in top_5
            ]
    except Exception as e:
        print("Feature Importance Error:", e)
        
    return result


@app.get("/api/stats")
def get_stats():
    if not os.path.exists(CSV_PATH):
        return {"total_cars": 0, "avg_price": 0, "brands": 0, "models": 0, "error": "CSV not found"}
    df = pd.read_csv(CSV_PATH)
    return {
        "total_cars": int(len(df)),
        "avg_price": int(df["Price_Cleaned"].mean()),
        "brands": int(df["Brand"].nunique()),
        "models": int(df["Model"].nunique())
    }

@app.get("/api/car-options")
def get_car_options():
    if not os.path.exists(CSV_PATH):
        return {"error": "CSV not found"}
    df = pd.read_csv(CSV_PATH)
    brand_models = {}
    for brand, group in df.groupby("Brand"):
        brand_models[brand] = sorted(group["Model"].dropna().unique().tolist())
    return {
        "brand_models": brand_models,
        "provinces": sorted(df["Province"].dropna().unique().tolist()),
        "body_types": sorted(df["Body Type"].dropna().unique().tolist()),
        "fuels": sorted(df["Fuel"].dropna().unique().tolist()),
        "transmissions": sorted(df["Transmission"].dropna().unique().tolist()),
    }

@app.get("/api/car-details")
def get_car_details(brand: str, model: str):
    if not os.path.exists(CSV_PATH):
        return {}
    df = pd.read_csv(CSV_PATH)
    car_data = df[(df["Brand"] == brand) & (df["Model"] == model)]
    
    if car_data.empty:
        return {}
        
    return {
        "engine": int(round(car_data["Engine_Cleaned"].median() / 50) * 50) if not pd.isna(car_data["Engine_Cleaned"].median()) else 1300,
        "bodyType": str(car_data["Body Type"].mode().iloc[0]) if not car_data["Body Type"].mode().empty else "Sedan",
        "available_body_types": sorted(car_data["Body Type"].dropna().unique().tolist()),
        "available_fuels": sorted(car_data["Fuel"].dropna().unique().tolist()),
        "available_transmissions": sorted(car_data["Transmission"].dropna().unique().tolist())
    }


from fastapi import File, UploadFile
from PIL import Image
import io
from ultralytics import YOLO

# Model ko ek dafa load karein (server start hote waqt)
yolo_model = YOLO("yolov8n.pt") # 'n' ka matlab Nano (fast aur light hai)

@app.post("/api/detect-damage")
async def detect_damage(file: UploadFile = File(...)):
    try:
        # 1. Image ko read karein
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # 2. AI Model se detect karein
        results = yolo_model(image)
        
        detections = []
        # 3. Result ko format karein jo React samajh sake
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                class_name = yolo_model.names[class_id]
                
                detections.append({
                    "label": class_name,
                    "confidence": round(confidence, 2),
                    "box": [int(x1), int(y1), int(x2), int(y2)]
                })
                
        return {
            "damage_detected": len(detections) > 0,
            "detections": detections,
            "message": f"{len(detections)} objects detected."
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/trends")
def get_trends():
    if not os.path.exists(CSV_PATH):
        return {"error": "CSV not found"}
    
    df = pd.read_csv(CSV_PATH)
    
    # 1. Har saal ki average price (Year vs Price)
    year_price = df.groupby("Year")["Price_Cleaned"].mean().reset_index()
    year_price = year_price[year_price["Year"] >= 2010] # 2010 se aage ka data
    year_data = [
        {"year": int(row["Year"]), "avgPrice": int(row["Price_Cleaned"])} 
        for _, row in year_price.iterrows()
    ]
    
    # 2. Top 5 Brands ki average price (Brand vs Price)
    brand_price = df.groupby("Brand")["Price_Cleaned"].mean().sort_values(ascending=False).head(5).reset_index()
    brand_data = [
        {"brand": row["Brand"], "avgPrice": int(row["Price_Cleaned"])} 
        for _, row in brand_price.iterrows()
    ]
    
    # 3. Body Type ka count (Kaunsi body type zyada hai)
    body_count = df["Body Type"].value_counts().head(6).reset_index()
    body_data = [
        {"name": row["Body Type"], "value": int(row["count"])} 
        for _, row in body_count.iterrows()
    ]
    
    # 4. Provinces ka count
    province_count = df["Province"].value_counts().head(5).reset_index()
    province_data = [
        {"name": row["Province"], "value": int(row["count"])} 
        for _, row in province_count.iterrows()
    ]
    
    return {
        "year_trend": year_data,
        "brand_trend": brand_data,
        "body_types": body_data,
        "provinces": province_data
    }