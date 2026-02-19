interface Props {
  message: string;
}

export default function WaitingView({ message }: Props) {
  return (
    <div className="action-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div className="pulse" style={{ fontSize: '5rem', marginBottom: '30px' }}>⏳</div>
      <p style={{ fontSize: '1.4rem', color: 'var(--gold)' }}>{message}</p>
    </div>
  );
}
