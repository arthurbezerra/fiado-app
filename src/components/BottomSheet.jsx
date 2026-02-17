export default function BottomSheet({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 60,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#2A2870',
          borderRadius: '24px 24px 0 0',
          padding: '12px 20px 44px',
          width: '100%',
          maxWidth: 430,
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.2)',
          margin: '0 auto 24px',
        }} />
        {title && (
          <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: '0 0 24px', letterSpacing: '-0.3px' }}>
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  )
}
