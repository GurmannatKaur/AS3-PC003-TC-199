import "../../styles/dashboard.css";

interface TopbarProps {
  title?: string;
}

export default function Topbar({
  title = "Dashboard",
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <p className="topbar-breadcrumb">
          MOSAIC <span>/</span> {title}
        </p>

        <h2>{title}</h2>
      </div>

      <div className="topbar-right">
        <div className="topbar-date">
          
          <span>Traffic Intelligence</span>
        </div>

        <div className="topbar-avatar">M</div>
      </div>
    </header>
  );
}