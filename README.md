# backend
cd backend<br>
### create a virtual environment to minimize conflicts with local libs
python -m venv venv<br>
source venv/bin/activate  # on Linux/macOS<br>
venv\Scripts\activate     # on Windows<br>
### installing dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-jose[cryptography] passlib[bcrypt] python-multipart motor pydantic_settings pydantic[email] pymongo<br>
pip install -r requirements.txt #optional, only if the dependencies did not work.<br>
## Local HTTPS Setup

We use mkcert for dev TLS certificates. On your machine:

1. Install mkcert (see https://github.com/FiloSottile/mkcert).  
2. `mkcert -install`  ← this adds the root CA to your OS/browser.  
3. `mkcert -cert-file backend/cert.pem -key-file backend/key.pem localhost 127.0.0.1 ::1`  
4. `npm start` (React) and your usual uvicorn command will now be trusted.
### turn on localhost
uvicorn main:app --port 8000 --reload --ssl-keyfile ./key.pem --ssl-certfile ./cert.pem<br>

# frontend
cd frontend<br>
npm install<br>
npm start<br>

# some fixes
"cannot be loaded because running scripts is disabled on this system. For more information, see about_Execution_Policies..."<br>
run this:<br>
Set-ExecutionPolicy Unrestricted -Scope Process<br>