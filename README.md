# backend
cd backend
### create a virtual environment to minimize conflicts with local libs
python -m venv venv
source venv/bin/activate  # on Linux/macOS
venv\Scripts\activate     # on Windows
### installing dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-jose[cryptography] passlib[bcrypt] python-multipart
pip install -r requirements.txt
### turn on localhost
uvicorn main:app --reload

# frontend
cd frontend
npm install
npm start

# some fixes
"cannot be loaded because running scripts is disabled on this system. For more information, see about_Execution_Policies..."
run this:
Set-ExecutionPolicy Unrestricted -Scope Process