import React from 'react'

interface VenueButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  isLoading?: boolean
}

export const VenueButton: React.FC<VenueButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl'

  const variants = {
    primary: 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 hover:bg-indigo-700',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800',
    danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-100',
    outline: 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-100 hover:text-indigo-600',
    success: 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100',
  }

  const sizes = {
    xs: 'px-2 py-1 text-[10px]',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
          <span>Processing...</span>
        </div>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}
