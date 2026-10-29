interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: string;
  trend?: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon = "",
  trend,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>

      <h2>{value}</h2>

      {description && <p>{description}</p>}

      {trend && (
        <span className="stat-trend">
          {trend}
        </span>
      )}
    </div>
  );
}