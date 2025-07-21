import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from '../context/userContext';
import styles from '../styles/Navbar.module.css';
import logo from '../assets/images/Logo1.png';

function Navbar() {
    const { user,setUser, isInitialized } = useUserContext();
    const navigate = useNavigate();

    if (!isInitialized) {
        return null;
    }

    const handleAuthClick = () => {
        navigate('/login');
    };
console.log('user', user);
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        
        window.location.reload();
    };  
    return (
        <nav className={styles.navbar}>
            <Link to="/home">
                <img src={logo} alt="Logo" className={styles.logo} />
            </Link>

            <div className={styles.links}>
                <Link to="/home" className={styles.link}>Home Page</Link>

                <button
                    onClick={() => user ? navigate('/prompt') : navigate('/login')}
                    className={styles.link}
                >
                    Creating a prompt
                </button>

                <button
                    onClick={() => user ? navigate('/history') : navigate('/login')}
                    className={styles.link}
                >
                    My History
                </button>

                {user?.role === 'admin' && (
                    <button
                        onClick={() => navigate('/admin/users')}
                        className={styles.link}
                    >
                        Manage users
                    </button>
                )}
            </div>


            {user ? (
                <>
                    <div className={styles.userName}>{user.name}</div>
                    <button onClick={logout} className={styles.logoutButton}>Logout</button>
                </>
            ) : (
                <>
                    <button
                        onClick={handleAuthClick}
                        className={`${styles.logoutButton} ${styles.loginButton}`}
                        onMouseDown={e => e.preventDefault()}
                    >
                        Login
                    </button>
                </>
            )}
        </nav>
    );
}

export default Navbar;