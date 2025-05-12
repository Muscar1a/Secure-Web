import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import RegisterView from '../elements/RegisterView';
import { host } from '../../utils/APIRoutes';

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

    try {
      const response = await axios.post(`${host}/users/register`, {
        username,
        email,
        password
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
