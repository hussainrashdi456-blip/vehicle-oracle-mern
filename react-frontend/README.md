# Vehicle Oracle - React frontend (Vite + Tailwind + Framer Motion)

```bash
npm install
npm run dev          # http://localhost:5173  (uses mock predictions: .env.development)
```
- `VITE_USE_MOCK=true`  -> fake prediction (UI demo, no backend needed)
- `VITE_USE_MOCK=false` -> real call to `${VITE_API_URL}/api/predict` (Step 3)

Dropdown data is generated from your training data so it always matches the model's label encoders:
```bash
python scripts/gen_car_options.py ../ai-backend/outputs/clean_data.csv
```
