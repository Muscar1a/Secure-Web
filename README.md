# backend
cd backend<br>
### create a virtual environment to minimize conflicts with local libs
python -m venv venv<br>
source venv/bin/activate  # on Linux/macOS<br>
venv\Scripts\activate     # on Windows<br>
### installing dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-jose[cryptography] passlib[bcrypt] python-multipart<br>
pip install -r requirements.txt<br>
### turn on localhost
uvicorn main:app --reload<br>

# frontend
cd frontend<br>
npm install<br>
npm start<br>

# some fixes
"cannot be loaded because running scripts is disabled on this system. For more information, see about_Execution_Policies..."<br>
run this:<br>
Set-ExecutionPolicy Unrestricted -Scope Process<br>