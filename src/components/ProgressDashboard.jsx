import React from 'react';
import { 
  Flame, 
  Target, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  BarChart2, 
  Calendar,
  Sparkles,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function ProgressDashboard({
  history = [],
  rollingAverageAccuracy = 0,
  topicsNeedingImprovement = [],
  accuracyOverTime = [],
  currentStreak = 0,
  longestStreak = 0,
  cardsReviewedTotal = 0,
  sessionsCompleted = 0,
  unlockedBadges = [],
  badgeDefinitions = [],
  onClearHistory
}) {
  const formatXAxisLabel = (str) => {
    if (!str) return '';
    const cleaned = str.replace(/:\s*.*$/, '').trim();
    return cleaned.length > 13 ? `${cleaned.substring(0, 11)}…` : cleaned;
  };

  return (
    <div className="dashboard-container">
      
      {/* Top Stat Summary Grid */}
      <div className="stats-summary-grid">
        
        <div className="stat-card glass-panel">
          <div className="stat-card-header">
            <Target className="stat-card-icon text-accent" size={24} />
            <span className="stat-card-title">Rolling Accuracy</span>
          </div>
          <div className="stat-card-value">{rollingAverageAccuracy}%</div>
          <span className="stat-card-subtitle">Across {history.length} session{history.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-card-header">
            <Flame className="stat-card-icon text-fire" size={24} />
            <span className="stat-card-title">Study Streak</span>
          </div>
          <div className="stat-card-value">{currentStreak} Days</div>
          <span className="stat-card-subtitle">Best: {longestStreak} days</span>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-card-header">
            <CheckCircle2 className="stat-card-icon text-success" size={24} />
            <span className="stat-card-title">Cards Reviewed</span>
          </div>
          <div className="stat-card-value">{cardsReviewedTotal}</div>
          <span className="stat-card-subtitle">SM-2 Spaced Repetition</span>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-card-header">
            <Award className="stat-card-icon text-gold" size={24} />
            <span className="stat-card-title">Badges Unlocked</span>
          </div>
          <div className="stat-card-value">{unlockedBadges.length} / {badgeDefinitions.length}</div>
          <span className="stat-card-subtitle">Milestone Achievements</span>
        </div>

      </div>

      {/* Recharts Analytics Section */}
      <div className="dashboard-charts-grid">
        
        {/* Line Chart: Accuracy Over Time */}
        <div className="chart-panel glass-panel">
          <div className="chart-header">
            <TrendingUp size={20} className="text-accent" />
            <h3>Accuracy Performance Over Time</h3>
          </div>

          {accuracyOverTime.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={accuracyOverTime} margin={{ bottom: 25, left: 0, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} unit="%" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-card)', 
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-primary)', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">Complete quiz sessions to view performance trends.</div>
          )}
        </div>

        {/* Bar Chart: Topics Needing Improvement */}
        <div className="chart-panel glass-panel">
          <div className="chart-header">
            <AlertTriangle size={20} className="text-warning" />
            <h3>Topics Needing Improvement</h3>
          </div>

          {topicsNeedingImprovement.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topicsNeedingImprovement} margin={{ bottom: 45, left: 0, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="concept" 
                    stroke="var(--text-muted)" 
                    fontSize={11} 
                    tickFormatter={formatXAxisLabel}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    height={50}
                  />
                  <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} label={{ value: 'Errors', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} errors`, `Topic: ${props.payload.concept}`]}
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-card)', 
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)'
                    }} 
                  />
                  <Bar dataKey="wrongCount" fill="var(--color-warning)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">No weak topics identified yet. Keep practicing!</div>
          )}
        </div>

      </div>

      {/* Gamification Badges Showcase */}
      <div className="badges-section glass-panel">
        <div className="section-title-row">
          <Sparkles className="text-gold" size={22} />
          <h3>Achievement Badges</h3>
        </div>

        <div className="badges-grid">
          {badgeDefinitions.map(badge => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <div 
                key={badge.id} 
                className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                title={isUnlocked ? `Unlocked: ${badge.desc}` : `Locked: ${badge.desc}`}
              >
                <div className="badge-icon-box">{badge.icon}</div>
                <div className="badge-title">{badge.name}</div>
                <div className="badge-desc">{badge.desc}</div>
                <span className="badge-status-tag">{isUnlocked ? 'UNLOCKED' : 'LOCKED'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent History Table */}
      <div className="history-section glass-panel">
        <div className="section-title-row space-between">
          <div className="title-left">
            <Calendar size={20} />
            <h3>Recent Study Sessions ({history.length})</h3>
          </div>
          {history.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={onClearHistory}>
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Topic</th>
                  <th>Questions</th>
                  <th>Correct</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {history.map(session => (
                  <tr key={session.id}>
                    <td>{session.displayDate}</td>
                    <td className="topic-cell">{session.topic}</td>
                    <td>{session.totalQuestions}</td>
                    <td>{session.correctCount}</td>
                    <td>
                      <span className={`accuracy-pill ${session.accuracy >= 80 ? 'high' : session.accuracy >= 50 ? 'med' : 'low'}`}>
                        {session.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="chart-empty">No study sessions recorded yet.</div>
        )}
      </div>

    </div>
  );
}
