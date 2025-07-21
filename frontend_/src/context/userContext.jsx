// import { createContext, useState, useContext, useEffect } from 'react';
// import apiService from '../services/apiService'; 

// const UserContext = createContext();
// export const useUserContext = () => useContext(UserContext);

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isInitialized, setIsInitialized] = useState(false);
  

//   const fetchUser = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         setUser(null);
//         return;
//       }

//       const response = await apiService.get('/users/me');
//       if (response.success && response.user && response.token) {
//         localStorage.setItem('token', response.token);
//         setUser(response.user);
//       } else {
//         localStorage.removeItem('token');
//         setUser(null);
//       }
//     } catch {
//       localStorage.removeItem('token');
//       setUser(null);
//     } finally {
//       setIsInitialized(true);
//     }
//   };

//   const login = async (credentials) => {
//     try {
//       const response = await apiService.post('/users/login', credentials);
//       if (response.success && response.token && response.user) {
//         localStorage.setItem('token', response.token);
//         setUser(response.user);
//         return { success: true };
//       } else {
//         throw new Error(response.message || 'Login failed');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   };

//   const register = async (userData) => {
//     try {
//       const response = await apiService.post('/users/register', userData);
//       if (response.success && response.data.token && response.data.user) {
//         localStorage.setItem('token', response.token);
//         setUser(response.user);
//         return { success: true };
//       } else {
//         throw new Error(response.message || 'Registration failed');
//       }
//     } catch (error) {
//       console.error('Registration error:', error);
//       throw error;
//     }
//   };

  

//   useEffect(() => {
//     fetchUser();
//   }, []);

//   const value = {
//     user,
//     isInitialized,
//     login,
//     register,
//     fetchUser,
//   };

//   return (
//     <UserContext.Provider value={value}>
//       {children}
//     </UserContext.Provider>
//   );
// };
import { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/apiService'; 

const UserContext = createContext();
export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  

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

  

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    setUser,
    isInitialized,
    setIsInitialized
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
