interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="api-state api-state-error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button className="button-secondary" type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
