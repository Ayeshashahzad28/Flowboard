export default function Toasts({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="toast__dot" aria-hidden="true" />
          <span>{t.message}</span>
          <button
            type="button"
            className="icon-btn icon-btn--small"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
