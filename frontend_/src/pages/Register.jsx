import { useState } from 'react';
import { useUserContext } from '../context/userContext';
import formStyles from '../styles/Form.module.css';
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import apiService from '../services/apiService'; 

import {
    validatePassword,
    validatePhone,
    validateName,
    VALIDATION_MESSAGES
} from '../utils/validation';

function Register() {
    const navigate = useNavigate();
    const { user, setUser } = useUserContext();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    const login = async (credentials) => {
        try {
          const response = await apiService.post('/users/login', credentials);
          if (response.success && response.token && response.user) {
            localStorage.setItem('token', response.token);
            setUser(response.user);
            return { success: true };
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      };
    
      const register = async (userData) => {
        try {
          const response = await apiService.post('/users/register', userData);
          if (response.success && response.data.token && response.data.user) {
            localStorage.setItem('token', response.token);
            setUser(response.user);
            return { success: true };
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error) {
          console.error('Registration error:', error);
          throw error;
        }
      };
    
    const validateForm = () => {
        const newErrors = {};

        if (!validateName(formData.name)) {
            newErrors.name = VALIDATION_MESSAGES.NAME;
        }

        if (!validatePhone(formData.phone)) {
            newErrors.phone = VALIDATION_MESSAGES.PHONE;
        }

        if (!validatePassword(formData.password)) {
            newErrors.password = VALIDATION_MESSAGES.PASSWORD;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'The passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await register({
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                password: formData.password,
            });

            await login({
                phone: formData.phone.trim(),
                password: formData.password,
            });

            navigate('/home');

        } catch (error) {
            setError(error.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className={formStyles.formContainer}>
                <div className={formStyles.formTitle}>Registration</div>
                <div className={formStyles.formDescription}>Create a new account</div>

                {error && <div className={formStyles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={formStyles.form}>
                    <div className={formStyles.formGroup}>
                        <input
                            className={`${formStyles.input} ${errors.name ? formStyles.inputError : ''}`}
                            type="text"
                            name="name"
                            placeholder="Full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        {errors.name && <span className={formStyles.errorText}>{errors.name}</span>}
                    </div>

                    <div className={formStyles.formGroup}>
                        <input
                            className={`${formStyles.input} ${errors.phone ? formStyles.inputError : ''}`}
                            type="tel"
                            name="phone"
                            placeholder="Phone number (05xxxxxxxx)"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                        {errors.phone && <span className={formStyles.errorText}>{errors.phone}</span>}
                    </div>

                    <div className={formStyles.formGroup}>
                        <input
                            className={`${formStyles.input} ${errors.password ? formStyles.inputError : ''}`}
                            type="password"
                            name="password"
                            placeholder="Password (min 6 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        {errors.password && <span className={formStyles.errorText}>{errors.password}</span>}
                    </div>

                    <div className={formStyles.formGroup}>
                        <input
                            className={`${formStyles.input} ${errors.confirmPassword ? formStyles.inputError : ''}`}
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        {errors.confirmPassword && <span className={formStyles.errorText}>{errors.confirmPassword}</span>}
                    </div>

                    <button 
                        className={formStyles.button} 
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating account...' : 'Create an account'}
                    </button>
                </form>

                <div className={formStyles.switchAuth}>
                    Already have an account?{' '}
                    <Link to="/login" className={formStyles.link}>Login</Link>
                </div>
            </div>
        </>
    );
}

export default Register;