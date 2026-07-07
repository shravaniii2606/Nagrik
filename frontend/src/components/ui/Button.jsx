/**
 * Reusable button. Always renders a real <button> element (not a div)
 * so it's keyboard-accessible and screen-reader friendly by default.
 */
function Button({ children, onClick, disabled = false, type = 'button', ...rest }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium
        hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
