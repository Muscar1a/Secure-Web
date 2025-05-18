# backend
cd backend<br>
### create a virtual environment to minimize conflicts with local libs
python -m venv venv<br>
source venv/bin/activate  # on Linux/macOS<br>
venv\Scripts\activate     # on Windows<br>
### installing dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-jose[cryptography] passlib[bcrypt] python-multipart motor pydantic_settings pydantic[email] pymongo itsdangerous slowapi<br>
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

# for DB
Installing MongoDB Atlas Root CA

To allow your local development environment to establish a secure TLS connection to MongoDB Atlas, you must install the DigiCert “TLS RSA4096 Root G5” certificate into your system’s trust store. Follow the steps below for your OS.

---

Why This Is Needed

- Atlas servers present a certificate chain signed by DigiCert’s “TLS RSA4096 Root G5” root.
- Ubuntu/Debian does not include this root by default, so your Mongo driver and mongosh will reject the TLS handshake.
- Installing the root CA into your system store lets Python, Node.js, and mongosh verify Atlas’s certificate chain and connect securely.

---

Ubuntu / Debian

1. Copy the PEM into the system certificates directory  
   ```
   sudo cp /path/to/backend/db/ca.pem \  
            /usr/local/share/ca-certificates/atlas-root.crt
   sudo chmod 644 /usr/local/share/ca-certificates/atlas-root.crt
   ```

2. Rebuild the CA bundle  
   ```
   sudo update-ca-certificates --fresh
   ```

3. Verify installation  
   ```
   grep -R "DigiCert TLS RSA4096 Root G5" /etc/ssl/certs/ca-certificates.crt
   ```
   You should see the `subject=CN=DigiCert TLS RSA4096 Root G5` line.

---

macOS

1. Import into the System Keychain  
   ```
   sudo security add-trusted-cert \  
     -d -r trustRoot \  
     -k /Library/Keychains/System.keychain \  
     /path/to/backend/db/ca.pem
   ```

2. Verify installation  
   ```
   security find-certificate -c "DigiCert TLS RSA4096 Root G5" \  
     /Library/Keychains/System.keychain
   ```

---

Next Steps
 
- Restart your FastAPI server or rerun mongosh; the TLS handshake to Atlas will now succeed.

⚠️ Note: If you only need a quick local workaround and don’t require full certificate validation, you can set  
`tlsAllowInvalidCertificates=True`  
on your Mongo client—but only for local development. Do not use this in production.