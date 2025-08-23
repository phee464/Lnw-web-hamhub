

export default function XButton({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-xl shadow hover:shadow-md transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
