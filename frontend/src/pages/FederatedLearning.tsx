import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getFederatedClients,
  getFederatedRounds,
  getFederatedStatus,
  startFederatedTraining,
  stopFederatedTraining,
} from "../api/federatedApi";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Icon from "../components/common/Icon";
import LoadingState from "../components/common/LoadingState";
import type {
  FederatedClientsResponse,
  FederatedMetrics,
  FederatedRoundsResponse,
  FederatedStatusResponse,
  FederatedTrainingRequest,
} from "../types/federated";

const initialConfiguration: FederatedTrainingRequest = {
  rounds: 5,
  local_epochs: 3,
  learning_rate: 0.001,
  num_clients: 4,
};

const activeStatuses = new Set(["STARTING", "TRAINING", "STOPPING"]);
const phaseLabels: Record<string, string> = {
  initializing: "Preparing run",
  local_training: "Local model training",
  aggregating: "Aggregating updates",
  evaluating: "Evaluating global model",
  completed: "Completed",
  stopped: "Stopped",
  failed: "Failed",
  stopping: "Stopping after active update",
};

function formatMetric(value: number | null | undefined) {
  return value == null ? "—" : value.toFixed(4);
}

function isActive(status: FederatedStatusResponse | null) {
  return status !== null && activeStatuses.has(status.status);
}

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
      setErrorMessage("");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Federated training status could not be loaded.",
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

  useEffect(() => {
    if (!isActive(status)) return;
    const interval = window.setInterval(() => void loadData(), 1200);
    return () => window.clearInterval(interval);
  }, [loadData, status]);

  const updateConfiguration = (
    field: keyof FederatedTrainingRequest,
    value: number,
  ) => setConfiguration((current) => ({ ...current, [field]: value }));

  const startTraining = async () => {
    setBusyAction("start");
    setErrorMessage("");
    setActionMessage("");
    try {
      const response = await startFederatedTraining(configuration);
      setActionMessage(response.message);
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Federated training could not be started.",
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
        error instanceof Error
          ? error.message
          : "Federated training could not be stopped.",
      );
    } finally {
      setBusyAction(null);
    }
  };

  const active = isActive(status);
  const metrics: FederatedMetrics | null = status?.model_metrics ?? null;
  const completedCount = rounds?.rounds.length ?? 0;
  const progress = status?.total_rounds
    ? Math.min(100, (completedCount / status.total_rounds) * 100)
    : 0;
  const workLimitExceeded =
    configuration.rounds *
      configuration.local_epochs *
      configuration.num_clients >
    500;

  return (
    <div className="page-stack">
      {isLoading && <LoadingState message="Loading federated training…" />}
      {errorMessage && (
        <ErrorState message={errorMessage} onRetry={() => void loadData()} />
      )}
      {status?.status === "FAILED" && status.last_error && (
        <ErrorState message={`Training failed: ${status.last_error}`} />
      )}
      {actionMessage && (
        <div className="api-state" role="status" aria-live="polite">
          {actionMessage}
        </div>
      )}

      <section className="training-hero surface">
        <div className="training-hero-copy">
          <span className="eyebrow">MODEL COLLABORATION</span>
          <h1>Federated training</h1>
          <p>
            Train local traffic models, aggregate their updates, and evaluate
            the resulting global model.
          </p>
          <Link className="button-primary" to="/clients">
            View local partitions <Icon name="arrow" />
          </Link>
        </div>
        <div className="training-hero-state">
          <span className="state-orbit" aria-hidden="true">
            <Icon name="training" />
          </span>
          <span className="status-pill planned">
            <span />
            {status?.status ?? "Loading"}
          </span>
          <small>{phaseLabels[status?.phase ?? ""] ?? "Federated run"}</small>
        </div>
      </section>

      <section className="summary-grid training-summary-grid">
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Global model</span>
            <span className="summary-icon"><Icon name="training" /></span>
          </div>
          <strong>{status?.model_trained ? status.global_model_version : "—"}</strong>
          <small>{status?.model_trained ? "Trained in this run" : "Not trained"}</small>
        </article>
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Completed rounds</span>
            <span className="summary-icon"><Icon name="clock" /></span>
          </div>
          <strong>{completedCount}</strong>
          <small>{status ? `of ${status.total_rounds}` : "Loading"}</small>
        </article>
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Local partitions</span>
            <span className="summary-icon"><Icon name="clients" /></span>
          </div>
          <strong>{status?.participating_clients ?? "—"}</strong>
          <small>Training participants</small>
        </article>
        <article className="summary-card">
          <div className="summary-card-heading">
            <span>Evaluation MAE</span>
            <span className="summary-icon"><Icon name="predictions" /></span>
          </div>
          <strong>{formatMetric(metrics?.mae)}</strong>
          <small>
            {metrics
              ? `${metrics.evaluation_samples} holdout predictions`
              : "Available after evaluation"}
          </small>
        </article>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">TRAINING CONTROLS</span>
            <h2>Run configuration</h2>
          </div>
          <span className="count-pill">
            {status?.execution_mode === "local_demo" ? "Local run" : "Federated run"}
          </span>
        </div>
        <div className="training-controls-grid">
          <label className="select-control">
            Rounds
            <input
              type="number"
              min="1"
              max="100"
              value={configuration.rounds}
              disabled={active}
              onChange={(event) =>
                updateConfiguration("rounds", Number(event.target.value))
              }
            />
          </label>
          <label className="select-control">
            Local epochs
            <input
              type="number"
              min="1"
              max="50"
              value={configuration.local_epochs}
              disabled={active}
              onChange={(event) =>
                updateConfiguration("local_epochs", Number(event.target.value))
              }
            />
          </label>
          <label className="select-control">
            Learning rate
            <input
              type="number"
              min="0.000001"
              step="0.0001"
              value={configuration.learning_rate}
              disabled={active}
              onChange={(event) =>
                updateConfiguration("learning_rate", Number(event.target.value))
              }
            />
          </label>
          <label className="select-control">
            Local partitions
            <input
              type="number"
              min="2"
              max="100"
              value={configuration.num_clients}
              disabled={active}
              onChange={(event) =>
                updateConfiguration("num_clients", Number(event.target.value))
              }
            />
          </label>
        </div>
        {workLimitExceeded && (
          <p className="inline-note" role="alert">
            Reduce the run to 500 client-epochs or fewer.
          </p>
        )}
        <div className="training-control-actions">
          <button
            className="button-primary"
            type="button"
            onClick={() => void startTraining()}
            disabled={active || busyAction !== null || isLoading || workLimitExceeded}
          >
            {busyAction === "start" ? "Starting…" : "Start training"}
          </button>
          <button
            className="button-secondary"
            type="button"
            onClick={() => void stopTraining()}
            disabled={!active || busyAction !== null || isLoading}
          >
            {busyAction === "stop" ? "Stopping…" : "Stop training"}
          </button>
          <span className="count-pill">
            {status?.status === "TRAINING"
              ? `Round ${status.current_round} of ${status.total_rounds}`
              : `${completedCount} rounds complete`}
          </span>
        </div>
        {status && (
          <div className="training-progress-summary" aria-live="polite">
            <div className="training-progress-heading">
              <strong>{phaseLabels[status.phase] ?? status.phase}</strong>
              <span>{Math.round(progress)}%</span>
            </div>
            <div
              className="training-progress-track"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Federated training progress"
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </section>

      <section className="summary-grid training-summary-grid">
        <article className="summary-card">
          <div className="summary-card-heading"><span>RMSE</span></div>
          <strong>{formatMetric(metrics?.rmse)}</strong>
          <small>Holdout evaluation</small>
        </article>
        <article className="summary-card">
          <div className="summary-card-heading"><span>R²</span></div>
          <strong>{formatMetric(metrics?.r2)}</strong>
          <small>Holdout evaluation</small>
        </article>
        <article className="summary-card">
          <div className="summary-card-heading"><span>Training time</span></div>
          <strong>
            {status?.training_duration_seconds == null
              ? "—"
              : `${status.training_duration_seconds.toFixed(2)} s`}
          </strong>
          <small>Elapsed run time</small>
        </article>
        <article className="summary-card">
          <div className="summary-card-heading"><span>Global model version</span></div>
          <strong>{status?.global_model_version ?? "—"}</strong>
          <small>{status?.metrics_source ? "Evaluated model" : "No evaluation yet"}</small>
        </article>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ROUND HISTORY</span>
            <h2>Training results</h2>
          </div>
          <span className="count-pill">{completedCount} completed</span>
        </div>
        {!rounds || rounds.rounds.length === 0 ? (
          <EmptyState message="Completed rounds will appear here." />
        ) : (
          <div className="comm-table-container">
            <table className="comm-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Model</th>
                  <th>Training loss</th>
                  <th>MAE</th>
                  <th>RMSE</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {rounds.rounds.map((round) => (
                  <tr key={round.round}>
                    <td><strong>{round.round}</strong></td>
                    <td>{round.global_model_version}</td>
                    <td>{formatMetric(round.training_loss)}</td>
                    <td>{formatMetric(round.metrics.mae)}</td>
                    <td>{formatMetric(round.metrics.rmse)}</td>
                    <td>{round.duration_seconds.toFixed(2)} s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LOCAL PARTICIPANTS</span>
            <h2>Training partitions</h2>
          </div>
          <span className="count-pill">{clients?.total_clients ?? 0} configured</span>
        </div>
        {!clients || clients.clients.length === 0 ? (
          <EmptyState message="No local partitions are configured." />
        ) : (
          <div className="training-client-list">
            {clients.clients.map((client) => (
              <div className="training-client-row" key={client.client_id}>
                <span className="road-marker moderate" />
                <div>
                  <strong>{client.name}</strong>
                  <small>
                    {client.client_id} · {client.training_samples} training windows
                  </small>
                </div>
                <span className="status-pill planned">
                  <span />
                  {client.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
