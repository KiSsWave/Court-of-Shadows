import React from 'react';

interface ConfirmDialogProps {
  icon?: string;
  title?: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  confirmClass?: string;
  infoOnly?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  icon = '⚠️',
  title = 'Confirmation',
  message,
  cancelText = 'Annuler',
  confirmText = 'Confirmer',
  confirmClass = 'btn-danger',
  infoOnly = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Fermeture par Escape / Enter
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel, onConfirm]);

  return (
    <div
      className="confirm-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          background: 'var(--bg-secondary, #1a1a2e)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '32px',
          maxWidth: 420,
          width: '100%',
          border: '1px solid var(--border, rgba(255,255,255,0.1))',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: 16 }}>{icon}</div>
        <h3 style={{ textAlign: 'center', marginBottom: 12, color: 'var(--text-primary, #fff)' }}>
          {title}
        </h3>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary, #aaa)', marginBottom: 24 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {!infoOnly && (
            <button className="btn btn-secondary" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
