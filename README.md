# backend
1. Navigate to backend
```
cd backend
```
2. Create a virtual environment
```
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```
3. Install dependencies
```
pip install -r requirements.txt
```
4. Start FastAPI server:
```
uvicorn main:app --reload
```

# frontend
1. Navigate to frontend directory
```
cd frontend
```
2. Install dependencies
```
npm install
```
3. Start
```
npm start
```