# backend
cd backend

### you can create a virtual environment(optional)
python -m venv venv
source venv/bin/activate  # on Linux/macOS
venv\Scripts\activate     # on Windows

pip install -r requirements.txt
uvicorn main:app --reload

# frontend
cd frontend
npm install
npm update 
npm start
