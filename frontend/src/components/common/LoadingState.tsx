interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading MOSAIC data…",
}: LoadingStateProps) {
  return (
    <div className="api-state api-state-loading" role="status" aria-live="polite">
      <span className="api-state-spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
