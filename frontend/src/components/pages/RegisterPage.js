import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import RegisterView from '../elements/RegisterView';
import { host } from '../../utils/APIRoutes';
import CryptoJS from 'crypto-js';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    //check matching pass
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const convertBinaryToPEM = (binaryData, label) => {
        const base64String = window.btoa(String.fromCharCode(...new Uint8Array(binaryData)));
        const formatted = base64String.match(/.{1,64}/g).join('\n');
        return `-----BEGIN ${label}-----\n${formatted}\n-----END ${label}-----`;
    }
    
    
    const encryptPrivateKey = (privateKeyPem, password) => {
        return CryptoJS.AES.encrypt(privateKeyPem, password).toString(); // base64
    }

    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKeyBuffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    const publicKeyPem = convertBinaryToPEM(publicKeyBuffer, "PUBLIC KEY");
    const privateKeyPem = convertBinaryToPEM(privateKeyBuffer, "PRIVATE KEY");

    const encryptedPrivateKeyPem = encryptPrivateKey(privateKeyPem, password);

    console.log('Public Key:', publicKeyPem);
    console.log('Encrypted Private Key:', encryptedPrivateKeyPem);

    try {
      const response = await axios.post(`${host}/users/register`, {
        username,
        email,
        password,
        public_key_pem: publicKeyPem,
        private_key_pem: encryptedPrivateKeyPem
      });

      console.log('Registration successful:', response.data);

      //back to login page
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      console.error('Registration error:', err);

      if (err.response?.status === 422) {
        // FastAPI sent back: { detail: [ { loc, msg, type }, ... ] }
        const details = err.response.data.detail;
        // Map to the human messages and join into one string
        const messages = Array.isArray(details)
          ? details.map(e => e.msg).join('; ')
          : String(details);
        setError(messages);
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Props to pass to the view component
  const viewProps = {
    formData,
    username,
    email,
    password,
    confirmPassword,
    error,
    loading,
    handleChange,
    handleSubmit,
    showPassword,
    showConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility
  };

  return <RegisterView {...viewProps} />;
};

export default Register;
