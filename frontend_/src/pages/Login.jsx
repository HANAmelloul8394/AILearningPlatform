import { useState ,useEffect} from 'react';
import { useUserContext } from '../context/userContext';
import formStyles from '../styles/Form.module.css';
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import { validatePhone, VALIDATION_MESSAGES } from '../utils/validation';
import apiService from '../services/apiService';


function Login() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const { setUser,setIsInitialized } = useUserContext();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setUser(null);
            return;
          }
    
          const response = await apiService.get('/users/me');
          if (response.success && response.user && response.token) {
            localStorage.setItem('token', response.token);
            setUser(response.user);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch {
          localStorage.removeItem('token');
          setUser(null);
        } finally {
          setIsInitialized(true);
        }
      };
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
        setError('');
        setShowRegisterPrompt(false);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!validatePhone(formData.phone)) {
            newErrors.phone = VALIDATION_MESSAGES.PHONE;
        }

        if (!formData.password) {
            newErrors.password = VALIDATION_MESSAGES.REQUIRED;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must contain at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleRegisterRedirect = () => {
        navigate('/register', {
            state: {
                prefillPhone: formData.phone
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setShowRegisterPrompt(false);

        if (!validateForm()) {
            return;
        }
        setIsLoading(true);

        try {
            const response = await apiService.post('/users/login', {
                phone: formData.phone.trim(),
                password: formData.password
            });

            if (response.success && response.token) {
                localStorage.setItem('token', response.token);
                await fetchUser();
                navigate('/home');
            } else {
                setError('Login failed. Please check your phone and password.');
            }
        } catch (error) {
            setError('Incorrect phone or password. Please try again.');
            if (error.response?.status === 401 ||
                error.response?.data?.message?.includes('not found') ||
                error.response?.data?.message?.includes('Invalid credentials') ||
                error.message?.includes('not found')) {

                setError('User not found with this phone number.');
                setShowRegisterPrompt(true);
            } else if (error.response?.status === 400) {
                setError('Invalid phone number or password.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <Navbar />
            <div className={formStyles.formContainer}>
                <div className={formStyles.formTitle}>Login</div>
                <div className={formStyles.formDescription}>Enter your login details</div>
                {error && !showRegisterPrompt && (<div className={formStyles.error}>{error}</div>)}

                {showRegisterPrompt && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                        <div className="text-yellow-800 text-sm mb-3">
                            <strong>User not found!</strong>
                            <br />
                            No account exists with phone number: {formData.phone}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRegisterRedirect}
                                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                                Create Account
                            </button>
                            <button
                                onClick={() => setShowRegisterPrompt(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={formStyles.form}>
                    <div className={formStyles.formGroup}>
                        <input
                            className={`${formStyles.input} ${errors.phone ? formStyles.inputError : ''}`}
                            type="tel"
                            name="phone"
                            placeholder="phone number"
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
                            placeholder="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        {errors.password && <span className={formStyles.errorText}>{errors.password}</span>}
                    </div>

                    <button className={formStyles.button} type="submit">conecting</button>
                </form>

                <div className={formStyles.switchAuth}>
                    Don't have an account?{' '}
                    <Link to="/register" className={formStyles.link}>Register</Link>
                </div>
            </div>
        </>
    );
}

export default Login;