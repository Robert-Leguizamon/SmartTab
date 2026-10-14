import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  id,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg min-h-[36px]',
    md: 'px-4 py-2 text-sm rounded-lg min-h-[40px]',
    lg: 'px-6 py-3 text-base rounded-xl min-h-[48px]',
  };

  const variantClasses = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-950/40 border border-indigo-500/30 active:scale-[0.98]',
    secondary:
      'bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-neutral-800/80 text-neutral-300 border border-neutral-700/80 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-neutral-800 text-neutral-300 border border-transparent',
    danger:
      'bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border border-rose-700/50 active:scale-[0.98]',
  };

  return (
    <button
      id={id || `btn-${Math.random().toString(36).substring(2, 7)}`}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 font-sans font-medium whitespace-nowrap transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-0.5 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
