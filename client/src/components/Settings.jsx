import { useState, useEffect } from 'react';
import { userAPI, authAPI } from '../api';
import './Settings.css';

const Settings = ({ user, onBack }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [name, setName] = useState(user?.name || '');
  const [targetWeight, setTargetWeight] = useState(user?.targetWeight || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setTargetWeight(response.data.targetWeight || '');
      setEmail(response.data.email || '');
      setUsername(response.data.username || '');
      setName(response.data.name || '');
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleUpdateName = async () => {
    if (!name || name.trim().length === 0) {
      setMessage('Please enter your name');
      return;
    }

    try {
      await userAPI.updateName(name.trim());
      setMessage('Name updated successfully!');
      const updatedUser = { ...user, name: name.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      await loadUserProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update name');
    }
  };

  const handleUpdateUsername = async () => {
    if (!username || username.trim().length < 3) {
      setMessage('Username must be at least 3 characters long');
      return;
    }

    try {
      await userAPI.updateUsername(username.trim());
      setMessage('Username updated successfully!');
      const updatedUser = { ...user, username: username.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update username');
    }
  };

  const handleUpdateTargetWeight = async () => {
    if (!targetWeight || isNaN(targetWeight)) {
      setMessage('Please enter a valid target weight');
      return;
    }

    try {
      await userAPI.updateTargetWeight(targetWeight);
      setMessage('Target weight updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update target weight');
    }
  };

  const handleUpdateEmail = async () => {
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      return;
    }

    try {
      await userAPI.updateEmail(email);
      setMessage('Email updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update email');
    }
  };

  const handleTestEmail = async () => {
    if (!email || !email.includes('@')) {
      setMessage('Please set your email address first');
      return;
    }

    try {
      const response = await userAPI.testEmail();
      setMessage(response.data.message || 'Test email sent successfully!');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.details || 'Failed to send test email';
      setMessage(`Email test failed: ${errorMsg}. Please check your .env configuration.`);
      setTimeout(() => setMessage(''), 8000);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }

    setChangingPassword(true);
    setMessage('');

    try {
      await authAPI.changePassword(currentPassword, newPassword);
      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <button onClick={onBack} className="back-button">
          ← Back to Dashboard
        </button>
        <h1>Settings</h1>
      </header>

      <div className="settings-content">
        {message && (
          <div className={`message ${message.includes('success') || message.includes('updated') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {!user?.name && !name && (
          <div className="settings-card highlight-card">
            <h2>Complete Your Profile</h2>
            <div className="input-group">
              <label htmlFor="name">Your Name <span className="required">(Required)</span></label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
                <button onClick={handleUpdateName} className="update-button">
                  Save
                </button>
              </div>
              <p className="helper-text">Add your name to personalize your experience</p>
            </div>
          </div>
        )}

        <div className="settings-card">
          <h2>Profile Information</h2>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <div className="input-with-button">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
              <button onClick={handleUpdateName} className="update-button">
                Update
              </button>
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-button">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
              <button onClick={handleUpdateUsername} className="update-button">
                Update
              </button>
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="targetWeight">Target Weight (kg)</label>
            <div className="input-with-button">
              <input
                type="number"
                id="targetWeight"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="Enter target weight"
              />
              <button onClick={handleUpdateTargetWeight} className="update-button">
                Update
              </button>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h2>Email Settings</h2>
          <div className="input-group">
            <label htmlFor="email">Email for Reminders</label>
            <div className="input-with-button">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <button onClick={handleUpdateEmail} className="update-button">
                Update
              </button>
            </div>
            {email && (
              <button 
                onClick={handleTestEmail} 
                className="test-email-button"
                style={{ marginTop: '8px', width: '100%' }}
              >
                Test Email
              </button>
            )}
          </div>
        </div>

        <div className="settings-card">
          <h2>Change Password</h2>
          <div className="input-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="input-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <button 
            onClick={handleChangePassword} 
            disabled={changingPassword}
            className="submit-button"
            style={{ width: '100%' }}
          >
            {changingPassword ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

