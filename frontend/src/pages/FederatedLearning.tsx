import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFederatedClients, getFederatedRounds, getFederatedStatus, startFederatedTraining, stopFederatedTraining } from "../api/federatedApi";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Icon from "../components/common/Icon";
import LoadingState from "../components/common/LoadingState";
import { sampleDataNote } from "../data/trafficSamples";
import type {
  FederatedClientsResponse,
  FederatedRoundsResponse,
  FederatedStatusResponse,
  FederatedTrainingRequest,
} from "../types/federated";

const stages = [
  {
    number: "01",
    name: "Local training",
    detail: "Each road client trains using locally held traffic data.",
    state: "Planned",
  },
  {
    number: "02",
    name: "Model updates",
    detail: "Clients submit model parameters to the coordinating server.",
    state: "Planned",
  },
  {
    number: "03",
    name: "Aggregation",
    detail: "The server combines model updates into a global model.",
    state: "Planned",
  },
  {
    number: "04",
    name: "Distribution",
    detail: "The global model is returned to participating clients.",
    state: "Planned",
  },
];

const initialConfiguration: FederatedTrainingRequest = {
  rounds: 5,
  local_epochs: 3,
  learning_rate: 0.001,
  num_clients: 4,
};

export default function FederatedLearning() {
  const [status, setStatus] = useState<FederatedStatusResponse | null>(null);
  const [rounds, setRounds] = useState<FederatedRoundsResponse | null>(null);
  const [clients, setClients] = useState<FederatedClientsResponse | null>(null);
  const [configuration, setConfiguration] =
    useState<FederatedTrainingRequest>(initialConfiguration);
  const [isLoading, setIsLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<"start" | "stop" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadData = useCallback(async (signal?: AbortSignal) => {
    setErrorMessage("");
    try {
      const [statusResponse, roundsResponse, clientsResponse] =
        await Promise.all([
          getFederatedStatus(signal),
          getFederatedRounds(signal),
          getFederatedClients(signal),
        ]);
      if (signal?.aborted) return;
      setStatus(statusResponse);
      setRounds(roundsResponse);
      setClients(clientsResponse);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setErrorMessage(
        error instanceof Error ? error.message : "Federated status could not be loaded.",
      );
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const updateConfiguration = (
    field: keyof FederatedTrainingRequest,
    value: number,
  ) => {
    setConfiguration((current) => ({ ...current, [field]: value }));
  };

  const startTraining = async () => {
    setBusyAction("start");
    setErrorMessage("");
    setActionMessage("");
    try {
      const response = await startFederatedTraining(configuration);
      setActionMessage(response.note ?? response.message);
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Training configuration was rejected.",
      );
    } finally {
      setBusyAction(null);
    }
  };

  const stopTraining = async () => {
    setBusyAction("stop");
    setErrorMessage("");
    setActionMessage("");
    try {
      const response = await stopFederatedTraining();
      setActionMessage(response.message);
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "The training request could not be stopped.",
      );
    } finally {
      setBusyAction(null);
    }
  };

  const configuredOnly = status?.status.toLowerCase() === "configured";

  return (
    <div className="page-stack">
      {isLoading && <LoadingState message="Loading federated status…" />}
      {errorMessage && (
        <ErrorState message={errorMessage} onRetry={() => void loadData()} />
      )}
      {actionMessage && (
        <div className="api-state" role="status" aria-live="polite">
          {actionMessage}
        </div>
      )}

      <section className="training-hero surface">
        <div className="training-hero-copy">
          <span className="eyebrow">MODEL COLLABORATION</span>
          <h2>Intelligence, without moving raw data</h2>
          <p>
            Federated learning lets road clients learn locally and share model
            updates. The API accepts configuration, but the ML training service
            is not connected, so these controls do not execute model training.
          </p>
          <Link className="button-primary" to="/clients">
            Review configured clients <Icon name="arrow" />
          </Link>
        </div>

        <div className="training-hero-state">
          <span className="state-orbit" aria-hidden="true">
            <Icon name="training" />
          </span>
          <span className={`status-pill ${configuredOnly ? "planned" : "offline"}`}>
            <span />
            {configuredOnly ? "Configuration accepted" : "Model service unavailable"}
          </span>
          <small>{status?.data_source ?? "Waiting for backend status."}</small>
        </div>
      </section>

      <section className="summary-grid training-summary-grid">
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Global model</span>
            <span className="summary-icon"><Icon name="training" /></span>
          </div>
          <strong>—</strong>
          <small>No trained model is connected</small>
        </article>
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Completed rounds</span>
            <span className="summary-icon"><Icon name="clock" /></span>
          </div>
          <strong>{rounds?.rounds.length ?? "—"}</strong>
          <small>Recorded by the backend</small>
        </article>
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Configured clients</span>
            <span className="summary-icon"><Icon name="clients" /></span>
          </div>
          <strong>{clients?.total_clients ?? "—"}</strong>
          <small>Not connected to live clients</small>
        </article>
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Model metrics</span>
            <span className="summary-icon"><Icon name="predictions" /></span>
          </div>
          <strong>—</strong>
          <small>No model evaluation recorded</small>
        </article>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FEDERATED CONTROLS</span>
            <h2>Training configuration</h2>
            <p>
              Requests are sent to the backend. Until its ML service is wired,
              starting only records a configuration.
            </p>
          </div>
        </div>
        <div className="training-controls-grid">
          <label className="select-control">
            Rounds
            <input
              type="number"
              min="1"
              max="100"
              value={configuration.rounds}
              onChange={(event) => updateConfiguration("rounds", Number(event.target.value))}
            />
          </label>
          <label className="select-control">
            Local epochs
            <input
              type="number"
              min="1"
              max="50"
              value={configuration.local_epochs}
              onChange={(event) => updateConfiguration("local_epochs", Number(event.target.value))}
            />
          </label>
          <label className="select-control">
            Learning rate
            <input
              type="number"
              min="0.000001"
              step="0.0001"
              value={configuration.learning_rate}
              onChange={(event) => updateConfiguration("learning_rate", Number(event.target.value))}
            />
          </label>
          <label className="select-control">
            Clients
            <input
              type="number"
              min="2"
              max="100"
              value={configuration.num_clients}
              onChange={(event) => updateConfiguration("num_clients", Number(event.target.value))}
            />
          </label>
        </div>
        <div className="training-control-actions">
          <button
            className="button-primary"
            type="button"
            onClick={() => void startTraining()}
            disabled={busyAction !== null || isLoading}
          >
            {busyAction === "start" ? "Submitting…" : "Submit configuration"}
          </button>
          <button
            className="button-secondary"
            type="button"
            onClick={() => void stopTraining()}
            disabled={busyAction !== null || isLoading}
          >
            {busyAction === "stop" ? "Stopping…" : "Stop / clear"}
          </button>
          {status && (
            <span className="count-pill">Backend status: {status.status}</span>
          )}
        </div>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FEDERATED WORKFLOW</span>
            <h2>How a training round works</h2>
            <p>Four steps take local learning toward shared traffic intelligence.</p>
          </div>
          <span className="count-pill">Workflow guide</span>
        </div>
        <div className="workflow-grid">
          {stages.map((stage, index) => (
            <article className="workflow-card" key={stage.number}>
              <span className="workflow-step-number">{stage.number}</span>
              {index < stages.length - 1 && (
                <span className="workflow-connector" aria-hidden="true" />
              )}
              <h3>{stage.name}</h3>
              <p>{stage.detail}</p>
              <span className="status-pill planned"><span />{stage.state}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FEDERATED CLIENTS</span>
            <h2>Configured contributors</h2>
            <p>Backend client records use synthetic sample data; none are live connections.</p>
          </div>
          <span className="count-pill">{clients?.total_clients ?? 0} configured</span>
        </div>
        {clients && clients.clients.length === 0 ? (
          <EmptyState message="No federated clients are configured." />
        ) : (
          <div className="training-client-list">
            {clients?.clients.map((client) => (
              <div className="training-client-row" key={client.client_id}>
                <span className="road-marker moderate" />
                <div>
                  <strong>{client.name}</strong>
                  <small>{client.client_id} · {client.data_source}</small>
                </div>
                <span className="status-pill planned"><span />{client.status}</span>
              </div>
            ))}
          </div>
        )}
        <p className="inline-note">{sampleDataNote} Client updates and aggregation have not run.</p>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PRIVACY & COMMUNICATION</span>
            <h2>Why federated learning?</h2>
            <p>How distributed learning can support traffic intelligence.</p>
          </div>
        </div>
        <div className="info-grid">
          <div className="info-card">
            <h3>Data Privacy</h3>
            <p>Raw traffic data can remain at each participating client while model updates are shared.</p>
          </div>
          <div className="info-card">
            <h3>Collaborative Learning</h3>
            <p>Multiple locations can contribute to a shared model that learns from distributed traffic patterns.</p>
          </div>
          <div className="info-card">
            <h3>Communication Efficiency</h3>
            <p>Model updates can be exchanged instead of transferring complete local datasets.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
