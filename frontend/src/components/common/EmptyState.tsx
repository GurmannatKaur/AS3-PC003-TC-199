interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="api-state" role="status">
      {message}
    </div>
  );
}
