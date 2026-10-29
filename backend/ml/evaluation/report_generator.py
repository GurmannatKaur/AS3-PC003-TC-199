import json
from pathlib import Path
from datetime import datetime


def generate_evaluation_report(
    metrics: dict,
    output_path: str | Path = "results/evaluation_report.json",
) -> Path:
    """
    Save traffic prediction evaluation metrics
    as a JSON report.
    """

    output_path = Path(output_path)

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    report = {
        "project": "MOSAIC",
        "evaluation_date": datetime.now().isoformat(),
        "metrics": metrics,
    }

    with output_path.open(
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            report,
            file,
            indent=4,
        )

    return output_path