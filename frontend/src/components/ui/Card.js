import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'md',
  shadow = 'md',
  ...props 
}) => {
  const paddingStyles = {
    sm: 'var(--space-3)',
    md: 'var(--space-6)',
    lg: 'var(--space-8)',
    none: '0'
  };

  const shadowStyles = {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    none: 'none'
  };

  return (
    <div
      className={`card ${hover ? 'hover-lift' : ''} ${className}`}
      style={{
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: paddingStyles[padding],
        boxShadow: shadowStyles[shadow],
        border: '1px solid var(--gray-200)',
        transition: hover ? 'all var(--transition-fast)' : 'none',
        ...props.style
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = shadowStyles[shadow];
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <div 
    className={`card-header ${className}`}
    style={{
      marginBottom: 'var(--space-4)',
      paddingBottom: 'var(--space-4)',
      borderBottom: '1px solid var(--gray-200)'
    }}
    {...props}
  >
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 
    className={`card-title ${className}`}
    style={{
      fontSize: '1.125rem',
      fontWeight: '600',
      color: 'var(--gray-900)',
      margin: '0'
    }}
    {...props}
  >
    {children}
  </h3>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div 
    className={`card-content ${className}`}
    style={{
      color: 'var(--gray-600)'
    }}
    {...props}
  >
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div 
    className={`card-footer ${className}`}
    style={{
      marginTop: 'var(--space-4)',
      paddingTop: 'var(--space-4)',
      borderTop: '1px solid var(--gray-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}
    {...props}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
