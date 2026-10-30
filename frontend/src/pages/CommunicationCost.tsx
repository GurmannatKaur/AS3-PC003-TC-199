import { useEffect, useState } from "react";
import "../styles/dashboard.css";
import "../styles/CommunicationCost.css";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import Icon from "../components/common/Icon";
import {
  getCommunicationRounds,
  getCommunicationSummary,
} from "../api/communicationApi";
import type {
  CommunicationRoundsResponse,
  CommunicationSummary,
} from "../types/communication";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(3)} MB`;
}

export default function CommunicationCost() {
  const [summary, setSummary] = useState<CommunicationSummary | null>(null);
  const [rounds, setRounds] = useState<CommunicationRoundsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadCounter, setReloadCounter] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadCommunication = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const [summaryResponse, roundsResponse] = await Promise.all([
          getCommunicationSummary(controller.signal),
          getCommunicationRounds(controller.signal),
        ]);
        setSummary(summaryResponse);
        setRounds(roundsResponse);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Communication records could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadCommunication();
    return () => controller.abort();
  }, [reloadCounter]);

  return (
    <div className="page-stack">
      <header className="page-intro">
        <div className="page-intro-copy">
          <span className="eyebrow">NETWORK EFFICIENCY</span>
          <h1>Communication Cost</h1>
        </div>
        <div className="status-pill planned">
          <span />
          Payload sizes
        </div>
      </header>

      {isLoading && <LoadingState message="Loading communication records…" />}
      {errorMessage && (
        <ErrorState
          message={errorMessage}
          onRetry={() => setReloadCounter((current) => current + 1)}
        />
      )}

      {summary && (
        <>
          <section className="summary-grid">
            <article className="summary-card">
              <div className="summary-card-heading">
                <span>Upload total</span>
                <span className="summary-icon"><Icon name="network" /></span>
              </div>
              <strong>{formatBytes(summary.total_upload_bytes)}</strong>
              <small>Serialized client updates</small>
            </article>
            <article className="summary-card">
              <div className="summary-card-heading">
                <span>Download total</span>
                <span className="summary-icon"><Icon name="network" /></span>
              </div>
              <strong>{formatBytes(summary.total_download_bytes)}</strong>
              <small>Serialized global-model copies</small>
            </article>
            <article className="summary-card">
              <div className="summary-card-heading">
                <span>Total communication</span>
                <span className="summary-icon"><Icon name="clock" /></span>
              </div>
              <strong>{formatBytes(summary.total_bytes)}</strong>
              <small>{summary.total_mb.toFixed(4)} MB · binary megabytes</small>
            </article>
            <article className="summary-card">
              <div className="summary-card-heading">
                <span>Recorded rounds</span>
                <span className="summary-icon"><Icon name="training" /></span>
              </div>
              <strong>{summary.total_rounds.toString().padStart(2, "0")}</strong>
              <small>Completed training rounds</small>
            </article>
          </section>

          <section className="surface">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ROUND PAYLOADS</span>
                <h2>Serialized model sizes</h2>
              </div>
              <span className="count-pill">{rounds?.total_rounds ?? 0} rounds</span>
            </div>

            {rounds && rounds.rounds.length === 0 ? (
              <EmptyState message="No communication rounds have been recorded." />
            ) : (
              <div className="comm-table-container">
                <table className="comm-table">
                  <thead>
                    <tr>
                      <th>Round</th>
                      <th>Upload</th>
                      <th>Download</th>
                      <th>Total bytes</th>
                      <th>Total MB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rounds?.rounds.map((round) => (
                      <tr key={round.round}>
                        <td><strong>{round.round}</strong></td>
                        <td>{formatBytes(round.upload_bytes)}</td>
                        <td>{formatBytes(round.download_bytes)}</td>
                        <td>{formatBytes(round.total_bytes)}</td>
                        <td>
                          <span className="comm-transfer-pill">
                            {round.total_mb.toFixed(4)} MB
                          </span>
                        </td>
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
                <span className="eyebrow">MEASUREMENT METHOD</span>
                <h2>Communication cost</h2>
                <p>Payload sizes are measured from each serialized model state.</p>
              </div>
            </div>
            <div className="comm-formula-box">
              <div className="comm-formula-equation">
                <span className="comm-formula-plain">
                  Total bytes = client update payloads + global model payloads
                </span>
              </div>
              <p className="comm-formula-detail">
                Serialized sizes only; no network transfer took place.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
