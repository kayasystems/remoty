import React from 'react';
import Card from './Card';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  color = 'blue',
  loading = false 
}) => {
  const colors = {
    blue: {
      bg: 'var(--primary-50)',
      icon: 'var(--primary-600)',
      text: 'var(--primary-700)'
    },
    green: {
      bg: '#f0fdf4',
      icon: 'var(--success-500)',
      text: '#166534'
    },
    red: {
      bg: '#fef2f2',
      icon: 'var(--error-500)',
      text: '#dc2626'
    },
    yellow: {
      bg: '#fffbeb',
      icon: 'var(--warning-500)',
      text: '#d97706'
    }
  };

  const changeColors = {
    positive: 'var(--success-500)',
    negative: 'var(--error-500)',
    neutral: 'var(--gray-500)'
  };

  if (loading) {
    return (
      <Card hover className="animate-pulse">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ 
              height: '1rem', 
              width: '6rem', 
              backgroundColor: 'var(--gray-200)', 
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-2)'
            }}></div>
            <div style={{ 
              height: '2rem', 
              width: '4rem', 
              backgroundColor: 'var(--gray-200)', 
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-2)'
            }}></div>
            <div style={{ 
              height: '0.875rem', 
              width: '5rem', 
              backgroundColor: 'var(--gray-200)', 
              borderRadius: 'var(--radius-sm)'
            }}></div>
          </div>
          <div style={{
            width: '3rem',
            height: '3rem',
            backgroundColor: 'var(--gray-200)',
            borderRadius: 'var(--radius-lg)'
          }}></div>
        </div>
      </Card>
    );
  }

  return (
    <Card hover className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: 'var(--gray-600)',
            marginBottom: 'var(--space-1)'
          }}>
            {title}
          </p>
          <p style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: 'var(--gray-900)',
            lineHeight: '1',
            marginBottom: 'var(--space-2)'
          }}>
            {value}
          </p>
          {change && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: changeColors[changeType]
              }}>
                {changeType === 'positive' && '↗'} 
                {changeType === 'negative' && '↘'} 
                {change}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                vs last month
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div style={{
            width: '3rem',
            height: '3rem',
            backgroundColor: colors[color].bg,
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors[color].icon,
            fontSize: '1.5rem'
          }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
