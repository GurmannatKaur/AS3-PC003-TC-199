import torch
from torch import nn


class TrafficFlowModel(nn.Module):
    def __init__(
        self,
        input_size: int,
        hidden_size: int = 64,
        num_layers: int = 2,
        output_size: int = 1,
        dropout: float = 0.2,
    ):
        super().__init__()

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )

        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if x.ndim != 3:
            raise ValueError(
                "TrafficFlowModel expects input shaped "
                "(batch_size, sequence_length, input_size); "
                f"got {tuple(x.shape)}"
            )
        if x.shape[-1] != self.lstm.input_size:
            raise ValueError(
                f"TrafficFlowModel expects {self.lstm.input_size} features "
                f"per time step; got {x.shape[-1]}"
            )

        lstm_output, _ = self.lstm(x)

        last_time_step = lstm_output[:, -1, :]

        output = self.fc(last_time_step)

        return output