import { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowSignup(false);
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setShowSignup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowSignup(false);
  };

  if (loading) {
  return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <div className="App">
      {user ? (
        showSettings ? (
          <Settings user={user} onBack={() => setShowSettings(false)} />
        ) : (
          <Dashboard 
            user={user} 
            onLogout={handleLogout} 
            onOpenSettings={() => setShowSettings(true)}
          />
        )
      ) : showSignup ? (
        <Signup onSignup={handleSignup} onSwitchToLogin={() => setShowSignup(false)} />
      ) : (
        <Login onLogin={handleLogin} onSwitchToSignup={() => setShowSignup(true)} />
      )}
    </div>
  );
}

export default App;
