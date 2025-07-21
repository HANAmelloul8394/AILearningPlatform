import { useEffect, useState } from 'react';
import { useUserContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import handleApiError from '../utils/errorHandler';
import apiService from '../services/apiService';
import styles from '../styles/AdminUsers.module.css'; 
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [userPrompts, setUserPrompts] = useState([]);
  const { user, isInitialized } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, isInitialized, navigate]);

  const fetchUsers = async () => {
    try {
      const data = await apiService.get('/users/');
      if (data.success) {
        setUsers(data.data.users);
      } else {
        console.error('Failed to fetch users:', data.message);
      }
    } catch (err) {
      const msg = handleApiError(err);
      console.error('API error:', msg);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await apiService.delete(`/users/${id}`);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert(res.message || 'Failed to delete user');
      }
    } catch (err) {
      const msg = handleApiError(err);
      alert(msg);
    }
  };


  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Registered Users</h2>
        {users.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Prompt Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <>
                  <tr key={u.id} onClick={() => navigate(`/admin/users/${u.id}/prompts`)} style={{ cursor: 'pointer' }}>
                    <td>{u.name}</td>
                    <td>{u.phone}</td>
                    <td>{u.role}</td>
                    <td>{new Date(u.created_at).toLocaleString()}</td>
                    <td>{u.prompt_count}</td>
                    <td>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedUserId === u.id && (
                    <tr>
                      <td colSpan="6">
                        <h4>Prompt History</h4>
                        {userPrompts.length > 0 ? (
                          <ul>
                            {userPrompts.map((p) => (
                              <li key={p.id}>
                                <strong>{new Date(p.created_at).toLocaleString()}:</strong> {p.content}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No prompts found.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </>
  );
}

export default AdminUsers;
