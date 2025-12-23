import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import confetti from 'canvas-confetti';
import { weightAPI } from '../api';
import './Dashboard.css';

const Dashboard = ({ user, onLogout, onOpenSettings }) => {
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState(user?.targetWeight || '');
  const [weightEntries, setWeightEntries] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [todayEntry, setTodayEntry] = useState(null);
  const [isEditingToday, setIsEditingToday] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const motivationMessages = [
    "🎉 Amazing progress! You're doing great!",
    "🌟 Fantastic! Keep up the excellent work!",
    "💪 You're crushing it! Every step counts!",
    "✨ Wonderful! Your dedication is paying off!",
    "🏆 Outstanding! You're on the right track!",
    "🎊 Incredible! Consistency is key!",
    "⭐ Excellent work! You're making it happen!",
    "🔥 You're unstoppable! Keep going!",
    "💎 Brilliant! Small changes lead to big results!",
    "🚀 Phenomenal! You're building great habits!",
    "🌈 Wonderful progress! You've got this!",
    "🎯 Perfect! You're moving in the right direction!",
    "💫 Awesome! Your hard work is showing!",
    "🌱 Great job! Progress, not perfection!",
    "🎈 Fantastic! You're creating positive change!"
  ];

  useEffect(() => {
    loadWeightEntries();
    checkTodayEntry();
    // Load target weight and name from user prop
    setTargetWeight(user?.targetWeight || '');
    setName(user?.name || '');
  }, [selectedPeriod, user]);

  // Update name when user prop changes
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const loadWeightEntries = async () => {
    try {
      const response = await weightAPI.getByPeriod(selectedPeriod);
      setWeightEntries(response.data);
    } catch (err) {
      console.error('Failed to load weight entries:', err);
    }
  };

  const checkTodayEntry = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await weightAPI.getByDate(today);
      if (response.data) {
        setTodayEntry(response.data);
        setCurrentWeight(response.data.weight.toString());
        setIsEditingToday(true);
      } else {
        setTodayEntry(null);
        setIsEditingToday(false);
      }
    } catch (err) {
      console.error('Failed to check today entry:', err);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 9999,
      colors: ['#00b894', '#00a085', '#00d4aa', '#ffffff', '#f0f0f0']
    };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Confetti from left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      // Confetti from right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
      // Confetti from center
      confetti({
        ...defaults,
        particleCount: particleCount * 0.5,
        origin: { x: 0.5, y: 0.5 }
      });
    }, 250);
  };

  const checkWeightDrop = async (newWeight) => {
    try {
      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];
      
      // Get yesterday's weight entry
      const yesterdayResponse = await weightAPI.getByDate(yesterdayDate);
      
      if (yesterdayResponse.data && yesterdayResponse.data.weight) {
        const yesterdayWeight = yesterdayResponse.data.weight;
        const todayWeight = parseFloat(newWeight);
        
        // Check if weight dropped
        if (todayWeight < yesterdayWeight) {
          // Trigger confetti
          triggerConfetti();
          setShowConfetti(true);
          
          // Show random motivation message
          const randomMessage = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
          setMotivationMessage(randomMessage);
          
          // Hide confetti indicator and message after 5 seconds
          setTimeout(() => {
            setShowConfetti(false);
            setMotivationMessage('');
          }, 5000);
        }
      }
    } catch (err) {
      console.error('Failed to check weight drop:', err);
    }
  };

  const handleSubmitWeight = async (e) => {
    e.preventDefault();
    if (!currentWeight || isNaN(currentWeight)) {
      setMessage('Please enter a valid weight');
      return;
    }

    // Prevent creating a new entry if one already exists for today
    if (!isEditingToday && todayEntry) {
      setMessage('Weight entry already exists for today. Please update the existing entry.');
      return;
    }

    setLoading(true);
    setMessage('');
    setMotivationMessage('');

    try {
      const newWeight = parseFloat(currentWeight);
      await weightAPI.add(newWeight);
      const successMessage = isEditingToday 
        ? 'Weight updated successfully!' 
        : 'Weight logged successfully!';
      setMessage(successMessage);
      setIsEditingToday(true);
      await loadWeightEntries();
      await checkTodayEntry();
      
      // Check if weight dropped and trigger celebration
      await checkWeightDrop(newWeight);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to log weight');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTargetWeight = async () => {
    if (!targetWeight || isNaN(targetWeight)) {
      setMessage('Please enter a valid target weight');
      return;
    }

    try {
      await userAPI.updateTargetWeight(parseFloat(targetWeight));
      setMessage('Target weight updated!');
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

  const handleUpdateName = async () => {
    if (!name || name.trim().length === 0) {
      setMessage('Please enter your name');
      return;
    }

    try {
      await userAPI.updateName(name.trim());
      setMessage('Name updated successfully!');
      // Update user in localStorage
      const updatedUser = { ...user, name: name.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Reload profile to update the welcome message
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
      // Update user in localStorage
      const updatedUser = { ...user, username: username.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update username');
    }
  };

  const formatDate = (dateString, entry) => {
    const date = new Date(dateString);
    if (selectedPeriod === 'day') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (selectedPeriod === 'week') {
      // Format as "Week of Dec 17" or show date range
      if (entry?.period_start && entry?.period_end) {
        const start = new Date(entry.period_start);
        const end = new Date(entry.period_end);
        if (start.getTime() === end.getTime()) {
          return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
      // Month view
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  const chartData = weightEntries.map((entry) => ({
    date: formatDate(entry.date, entry),
    weight: entry.weight,
    targetWeight: targetWeight ? parseFloat(targetWeight) : null,
    fullDate: entry.date,
    isAverage: entry.is_average || false,
    entryCount: entry.entry_count || 1,
    periodStart: entry.period_start,
    periodEnd: entry.period_end,
  }));

  // Always use today's weight for "Current Weight" regardless of selected period
  const latestWeight = todayEntry?.weight || null;
  const weightDifference = latestWeight && targetWeight ? (latestWeight - parseFloat(targetWeight)).toFixed(1) : null;

  // Calculate dynamic y-axis domain based on data range
  const calculateYAxisDomain = () => {
    if (chartData.length === 0) {
      return [50, 70]; // Default range when no data
    }

    const weights = chartData.map(d => d.weight).filter(w => w != null);
    if (weights.length === 0) {
      return [50, 70];
    }

    // Include target weight in the calculation if it exists
    const allWeights = [...weights];
    if (targetWeight) {
      allWeights.push(parseFloat(targetWeight));
    }

    const minWeight = Math.min(...allWeights);
    const maxWeight = Math.max(...allWeights);
    const range = maxWeight - minWeight;

    // If range is less than 1 kg, use a tight domain for better visibility
    if (range < 1) {
      const padding = Math.max(0.5, range * 0.3); // Add 30% padding or minimum 0.5 kg
      const domainMin = Math.max(0, minWeight - padding);
      const domainMax = maxWeight + padding;
      return [Math.floor(domainMin * 10) / 10, Math.ceil(domainMax * 10) / 10];
    } else if (range < 5) {
      // For moderate ranges (1-5 kg), use a tighter domain
      const padding = range * 0.2; // 20% padding
      const domainMin = Math.max(0, minWeight - padding);
      const domainMax = maxWeight + padding;
      return [Math.floor(domainMin), Math.ceil(domainMax)];
    } else {
      // For larger ranges, use default or wider domain
      return [50, 70];
    }
  };

  const yAxisDomain = calculateYAxisDomain();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Weight Tracker</h1>
          {(user?.name || name) && (
            <p className="welcome-message">Welcome back, {user?.name || name}! 👋</p>
          )}
        </div>
        <div className="header-actions">
          <button onClick={onOpenSettings} className="menu-button" aria-label="Settings">
            <span className="hamburger-icon">☰</span>
          </button>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {message && (
          <div className={`message ${message.includes('success') || message.includes('updated') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        {motivationMessage && (
          <div className="motivation-message">
            {motivationMessage}
          </div>
        )}

        <div className="input-section">
          <div className="input-card">
            <h2>{isEditingToday ? 'Update Weight' : 'Log Weight'}</h2>
            {isEditingToday && (
              <p className="edit-notice">You already have a weight entry for today. Update it below.</p>
            )}
            <form onSubmit={handleSubmitWeight}>
              <div className="input-group">
                <label htmlFor="currentWeight">Today's Weight (kg)</label>
                <input
                  type="number"
                  id="currentWeight"
                  step="0.1"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  placeholder="Enter weight"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="submit-button">
                {loading ? (isEditingToday ? 'Updating...' : 'Logging...') : (isEditingToday ? 'Update Weight' : 'Log Weight')}
              </button>
            </form>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-header-top">
                <h2>Weight Trend</h2>
                <div className="period-selector">
                  <button
                    className={selectedPeriod === 'day' ? 'active' : ''}
                    onClick={() => setSelectedPeriod('day')}
                  >
                    Day
                  </button>
                  <button
                    className={selectedPeriod === 'week' ? 'active' : ''}
                    onClick={() => setSelectedPeriod('week')}
                  >
                    Week
                  </button>
                  <button
                    className={selectedPeriod === 'month' ? 'active' : ''}
                    onClick={() => setSelectedPeriod('month')}
                  >
                    Month
                  </button>
                </div>
              </div>
              <div className="chart-stats">
                <div className="chart-stat-item">
                  <div className="chart-stat-label">Current Weight</div>
                  <div className="chart-stat-value">{latestWeight ? `${latestWeight} kg` : '--'}</div>
                </div>
                <div className="chart-stat-item">
                  <div className="chart-stat-label">Target Weight</div>
                  <div className="chart-stat-value">{targetWeight ? `${targetWeight} kg` : '--'}</div>
                </div>
                <div className="chart-stat-item">
                  <div className="chart-stat-label">Difference</div>
                  <div className={`chart-stat-value ${weightDifference && parseFloat(weightDifference) < 0 ? 'positive' : weightDifference && parseFloat(weightDifference) > 0 ? 'negative' : ''}`}>
                    {weightDifference ? `${weightDifference > 0 ? '+' : ''}${weightDifference} kg` : '--'}
                  </div>
                </div>
              </div>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={yAxisDomain} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      
                      // Filter out target weight for week/month views
                      const filteredPayload = (selectedPeriod === 'week' || selectedPeriod === 'month') 
                        ? payload.filter(item => item.dataKey !== 'targetWeight')
                        : payload;
                      
                      return (
                        <div style={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e5e5',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          {filteredPayload.map((entry, index) => {
                            if (entry.dataKey === 'targetWeight') return null;
                            
                            const isAverage = entry.payload?.isAverage || false;
                            const entryCount = entry.payload?.entryCount || 1;
                            
                            return (
                              <div key={index} style={{ color: entry.color, marginBottom: '4px' }}>
                                <span style={{ fontWeight: 'bold' }}>{entry.name}: </span>
                                {isAverage 
                                  ? `${entry.value} kg (avg of ${entryCount} entries)`
                                  : `${entry.value} kg`
                                }
                              </div>
                            );
                          })}
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#00b894"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: '#00b894' }}
                    name={selectedPeriod === 'week' ? 'Weekly Average (kg)' : selectedPeriod === 'month' ? 'Monthly Average (kg)' : 'Weight (kg)'}
                  />
                  {targetWeight && (
                    <Line
                      type="monotone"
                      dataKey="targetWeight"
                      stroke="#95a5a6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target Weight"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No weight data available. Start logging your weight!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

