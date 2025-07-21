import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/userContext';
import Navbar from '../components/Navbar';
import apiService from '../services/apiService';
import handleApiError from '../utils/errorHandler';

function UserPrompts(prop) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const { user } = useUserContext();

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const idToUse = prop.state === 'admin' ? id : user.id;
        const res = await apiService.get(`/users/${idToUse}/history`);
        if (res.success) {
          setPrompts(res.data.prompts);
        } else {
          alert('Failed to load prompts');
        }
      } catch (err) {
        alert(handleApiError(err));
      }
    };
    fetchPrompts();
  }, [id, prop.state, user]);

  const handleDeletePrompt = async (promptId) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    try {
      const res = await apiService.delete(`/prompts/${promptId}`);
      if (res.success) {
        setPrompts((prev) => prev.filter((p) => p.id !== promptId));
      } else {
        alert(res.message || 'Failed to delete prompt');
      }
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>User data not found. Please go back and try again.</p>
          {prop.state === 'admin' && (
            <button onClick={() => navigate('/admin/users')}>← Back to users list</button>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        {prop.state === 'admin' && (
          <button onClick={() => navigate('/admin/users')}>← Back to users list</button>
        )}
        <h2>Prompt History for {prop.state === 'admin' ? `user ${id}` : user.name}</h2>

        {prompts.length > 0 ? (
          <ul>
            {prompts.map((p) => (
              <li key={p.id}>
                <strong>{new Date(p.created_at).toLocaleString()}:</strong>
                 <div>category: {p.category_name} </div>
                <div>sub category: {p.sub_category_name}</div>
                <div>prompt: {p.prompt}</div>
                <div>response: {p.response}</div>
                <button
                  onClick={() => handleDeletePrompt(p.id)}
                  style={{ marginLeft: '10px', color: 'red' }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No prompts found.</p>
        )}
      </div>
    </>
  );
}

export default UserPrompts;
