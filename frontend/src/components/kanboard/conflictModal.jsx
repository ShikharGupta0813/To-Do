const ConflictModal = ({ show, onClose, onMerge, onOverwrite, clientTask, serverTask }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        width: '400px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      }}>
        <h2 style={{ color: '#1e293b', marginBottom: '15px' }}>Conflict Detected</h2>
        <p style={{ marginBottom: '8px' }}>
          <strong>Your Version:</strong> {clientTask.status}
        </p>
        <p style={{ marginBottom: '15px' }}>
          <strong>Server Version:</strong> {serverTask.status}
        </p>
        <p style={{ marginBottom: '15px' }}>How would you like to resolve it?</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={onMerge}
            style={{
              padding: '10px',
              backgroundColor: '#f1f5f9',
              color: '#1e293b',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Keep Server Version
          </button>
          <button
            onClick={onOverwrite}
            style={{
              padding: '10px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Overwrite with My Change
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: '#e2e8f0',
              color: '#1e293b',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
