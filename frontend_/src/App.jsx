// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import PromptPage from './pages/Prompt';
import AdminUsers from './pages/AdminUsers';
import UserPrompts from './pages/UserPrompts';
import { UserProvider } from '../src/context/userContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/prompt" element={<PromptPage />} />
          <Route path="/history" element={<UserPrompts state="history" />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id/prompts" element={<UserPrompts state="admin"/>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
