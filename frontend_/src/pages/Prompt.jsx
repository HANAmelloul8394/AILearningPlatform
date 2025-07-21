import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/userContext';
import apiService from '../services/apiService';
import Navbar from '../components/Navbar';
import handleApiError from '../utils/errorHandler';
import styles from '../styles/Prompt.module.css';

function PromptPage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  const navigate = useNavigate();
  const { user, isInitialized } = useUserContext();

  useEffect(() => {
    if (!isInitialized && !user) {
      navigate('/login');
    }
  }, [user, isInitialized, navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiService.get('/categories');
        
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory || selectedCategory === '__new__') {
      setSubCategories([]);
      return;
    }

    const fetchSubCategories = async () => {
      try {
        const res = await apiService.get(`/categories/${selectedCategory}/sub-categories`);
        setSubCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch sub-categories');
      }
    };
    fetchSubCategories();
  }, [selectedCategory]);

  const handleCategoryChange = async (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      console.log('Creating new category',value);
      
      const name = window.prompt('Enter new category name:');
      if (name) {
        try {
          const res = await apiService.post('/categories', { name });
          const newCat = res.data;
          setCategories([...categories, newCat]);
          setSelectedCategory(newCat.id);
        } catch (err) {
          alert('Failed to create category');
        }
      }
    } else {
      setSelectedCategory(value);
    }
  };

  const handleSubCategoryChange = async (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      const name = window.prompt('Enter new subcategory name:');
      if (name && selectedCategory) {
        try {
          const res = await apiService.post('/categories/sub-categories', {
            name,
            category_id: selectedCategory,
          });
          const newSub = res.data;
          setSubCategories([...subCategories, newSub]);
          setSelectedSubCategory(newSub.id);
        } catch (err) {
          alert('Failed to create subcategory');
        }
      }
    } else {
      setSelectedSubCategory(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        user_id: user?.id,
        category_id: selectedCategory,
        sub_category_id: selectedSubCategory,
        prompt,
      };

      const res = await apiService.post('/prompts/generate', payload);
      setResponse(res.data.data.response);
    } catch (err) {
      
      const msg = handleApiError(err);
      alert(msg || 'Something went wrong');
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.promptContainer}>
        <form onSubmit={handleSubmit} className={styles.promptForm}>
          <div className={styles.selectionSection}>
            <div className={styles.selectGroup}>
              <label>Choose category:</label>
              <select value={selectedCategory} onChange={handleCategoryChange} required>
                <option value="">--Choose--</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
                <option value="__new__">+ Create new category</option>
              </select>
            </div>

            {selectedCategory && selectedCategory !== '__new__' && (
              <div className={styles.selectGroup}>
                <label>Choose subcategory:</label>
                <select value={selectedSubCategory} onChange={handleSubCategoryChange} required>
                  <option value="">--Choose--</option>
                  {subCategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                  <option value="__new__">+ Create new subcategory</option>
                </select>
              </div>
            )}
          </div>

          <div className={styles.promptSection}>
            <label>Enter your prompt:</label>
            <textarea
              className={styles.promptTextarea}
              placeholder="e.g. Explain the concept of recursion"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </div>

          <div className={styles.submitButtonContainer}>
            <button type="submit" className={styles.submitButton}>Send</button>
          </div>
        </form>

        {response && (
          <div className={styles.responseSection}>
            <h3>AI Response:</h3>
            <div className={styles.responseQuestion}><strong>Prompt:</strong> {prompt}</div>
            <div className={styles.responseContent}>{response}</div>
          </div>
        )}
      </div>
    </>
  );
}

export default PromptPage;
