const ConflictModal = ({ show, onClose, onMerge, onOverwrite, clientTask, serverTask }) => {
    if (!show) return null;
  
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}>
        <div style={{
          background: 'white', padding: '20px', borderRadius: '8px', width: '400px'
        }}>
          <h3>Conflict Detected</h3>
          <p><strong>Your Version:</strong> {clientTask.status}</p>
          <p><strong>Server Version:</strong> {serverTask.status}</p>
          <p>How would you like to resolve it?</p>
          <button onClick={onMerge} style={{ marginRight: '10px' }}>Keep Server Version</button>
          <button onClick={onOverwrite}>Overwrite with My Change</button>
          <button onClick={onClose} style={{ marginTop: '10px' }}>Cancel</button>
        </div>
      </div>
    );
  };
  
  export default ConflictModal;
  