import { Link } from "react-router-dom";
import Icon from "../components/common/Icon";
import "../styles/dashboard.css";

export default function EmergencyRouteSupport() {
  return (
    <div className="page-stack">
      <header className="page-intro">
        <div className="page-intro-copy">
          <span className="eyebrow">ROUTE PLANNING</span>
          <h1>Emergency route support</h1>
          <p>Plan standard driving directions between locations on the map.</p>
        </div>
      </header>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DIRECTIONS</span>
            <h2>Plan a route</h2>
            <p>
              Routes use standard driving directions and are not connected to
              emergency dispatch.
            </p>
          </div>
        </div>
        <Link className="button-primary" to="/traffic-map">
          Open traffic map <Icon name="arrow" />
        </Link>
      </section>
    </div>
  );
}
