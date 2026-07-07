const variantClasses = {
  primary: 'bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-blue-700',
  secondary: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-700',
  danger: 'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-700',
}

function Button({
  children,
  onClick,
  disabled = false,
  type = 'button',
  variant = 'primary',
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-4 py-2 font-medium transition
        disabled:cursor-not-allowed disabled:opacity-60
        focus-visible:ring-2 focus-visible:ring-offset-2
        ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
