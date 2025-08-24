import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon,
  onClick,
  className = '',
  ...props 
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${loading ? 'cursor-wait' : 'cursor-pointer'}
  `;

  const variants = {
    primary: `
      bg-blue-600 hover:bg-blue-700 text-white
      focus:ring-blue-500 shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200 text-gray-900
      focus:ring-gray-500 border border-gray-300
    `,
    success: `
      bg-green-600 hover:bg-green-700 text-white
      focus:ring-green-500 shadow-sm hover:shadow-md
    `,
    danger: `
      bg-red-600 hover:bg-red-700 text-white
      focus:ring-red-500 shadow-sm hover:shadow-md
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 text-gray-700
      focus:ring-gray-500
    `
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const buttonStyles = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={buttonStyles}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        backgroundColor: variant === 'primary' ? 'var(--primary-600)' : 
                        variant === 'secondary' ? 'var(--gray-100)' :
                        variant === 'success' ? 'var(--success-500)' :
                        variant === 'danger' ? 'var(--error-500)' : 'transparent',
        color: variant === 'primary' || variant === 'success' || variant === 'danger' ? 'white' : 'var(--gray-900)',
        border: variant === 'secondary' ? '1px solid var(--gray-300)' : 'none',
        borderRadius: 'var(--radius-lg)',
        padding: size === 'sm' ? 'var(--space-2) var(--space-3)' :
                size === 'md' ? 'var(--space-2) var(--space-4)' :
                size === 'lg' ? 'var(--space-3) var(--space-6)' : 'var(--space-4) var(--space-8)',
        fontSize: size === 'sm' ? '0.875rem' : 
                 size === 'lg' ? '1rem' : 
                 size === 'xl' ? '1.125rem' : '0.875rem',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        transition: 'all var(--transition-fast)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: variant === 'primary' || variant === 'success' || variant === 'danger' ? 'var(--shadow-sm)' : 'none'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = variant === 'primary' || variant === 'success' || variant === 'danger' ? 'var(--shadow-sm)' : 'none';
        }
      }}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"></path>
        </svg>
      )}
      {icon && !loading && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
