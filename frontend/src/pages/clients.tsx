import { useCallback, useEffect, useState } from "react";
import { getFederatedClients } from "../api/federatedApi";
import type { FederatedClientsResponse } from "../types/federated";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import Icon from "../components/common/Icon";

type ClientsProps = {
  onNavigate: () => void;
};

export default function Clients({ onNavigate }: ClientsProps) {
  const [clientData, setClientData] = useState<FederatedClientsResponse | null>(
    null,
  );
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadCounter, setReloadCounter] = useState(0);

  const loadClients = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await getFederatedClients(signal);
      if (!signal?.aborted) setClientData(response);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setErrorMessage(
        error instanceof Error ? error.message : "Federated clients could not be loaded.",
      );
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadClients(controller.signal);
    return () => controller.abort();
  }, [loadClients, reloadCounter]);

  const connectedCount =
    clientData?.clients.filter((client) => client.status.toLowerCase() === "online")
      .length ?? 0;

  return (
    <div className="page-stack">
      {isLoading && <LoadingState message="Loading federated clients…" />}
      {errorMessage && (
        <ErrorState
          message={errorMessage}
          onRetry={() => setReloadCounter((current) => current + 1)}
        />
      )}

      <section className="summary-grid clients-summary">
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Configured clients</span>
            <span className="summary-icon"><Icon name="clients" /></span>
          </div>
          <strong>{clientData?.total_clients.toString().padStart(2, "0") ?? "—"}</strong>
          <small>From the federated clients endpoint</small>
        </article>
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Connected</span>
            <span className="summary-icon"><Icon name="network" /></span>
          </div>
          <strong>{clientData ? connectedCount.toString().padStart(2, "0") : "—"}</strong>
          <small>Reported online by the API</small>
        </article>
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Local models</span>
            <span className="summary-icon"><Icon name="training" /></span>
          </div>
          <strong>—</strong>
          <small>Training service is not connected</small>
        </article>
      </section>

      <section className="surface clients-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CLIENT DIRECTORY</span>
            <h2>Federated client records</h2>
            <p>Client names, statuses, and data sources are returned by the backend.</p>
          </div>
          <span className="status-pill planned">
            <span />
            {connectedCount > 0 ? "API reports connected clients" : "No live connections"}
          </span>
        </div>

        {clientData && clientData.clients.length === 0 ? (
          <EmptyState message="No federated clients are configured." />
        ) : (
          <div className="client-list">
            {clientData?.clients.map((client, index) => {
              const expanded = detailsId === client.client_id;
              const isOnline = client.status.toLowerCase() === "online";
              return (
                <article
                  className={`client-card ${expanded ? "is-selected" : ""}`}
                  key={client.client_id}
                >
                  <div className="client-card-main">
                    <span className={`client-avatar ${isOnline ? "low" : "moderate"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="client-road-name">
                      <span className="eyebrow">{client.client_id}</span>
                      <h3>{client.name}</h3>
                      <p>{client.data_source}</p>
                    </div>
                    <div className="client-card-field">
                      <small>API status</small>
                      <strong>{client.status}</strong>
                    </div>
                    <div className="client-card-field">
                      <small>Data source</small>
                      <strong>{client.data_source}</strong>
                    </div>
                    <div className="client-card-field">
                      <small>Model training</small>
                      <span className="status-pill offline"><span />Not connected</span>
                    </div>
                    <button
                      className="button-secondary client-details-button"
                      type="button"
                      onClick={() =>
                        setDetailsId(expanded ? null : client.client_id)
                      }
                      aria-expanded={expanded}
                    >
                      {expanded ? "Hide details" : "Inspect"}{" "}
                      <Icon name={expanded ? "minus" : "plus"} />
                    </button>
                  </div>
                  {expanded && (
                    <div className="client-details">
                      <div><small>Client ID</small><strong>{client.client_id}</strong></div>
                      <div><small>Reported status</small><strong>{client.status}</strong></div>
                      <div><small>Reported source</small><strong>{client.data_source}</strong></div>
                      <p>Client records are sample configuration, not active network connections.</p>
                      <button className="text-button" type="button" onClick={onNavigate}>
                        View traffic map <Icon name="arrow" />
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
