const toneClasses = {
  success: 'bg-emerald-500/20 border-emerald-400 text-emerald-100',
  error: 'bg-red-500/20 border-red-400 text-red-100',
  info: 'bg-sky-500/20 border-sky-400 text-sky-100',
};

function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="fixed right-4 top-4 z-50">
      <div
        className={`max-w-sm rounded-xl border p-4 shadow-lg backdrop-blur ${toneClasses[toast.type || 'info']}`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={onClose}
            className="text-xs text-slate-200 transition hover:text-white"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toast;
