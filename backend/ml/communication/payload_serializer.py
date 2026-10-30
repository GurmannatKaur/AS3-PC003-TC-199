import io
from collections.abc import Mapping

import torch


def serialize_model_update(state_dict: Mapping[str, torch.Tensor]) -> bytes:
    if not isinstance(state_dict, Mapping) or not state_dict:
        raise ValueError("Model update must be a non-empty state dictionary.")
    if any(
        not isinstance(key, str) or not isinstance(value, torch.Tensor)
        for key, value in state_dict.items()
    ):
        raise ValueError("Model update keys must be strings and values tensors.")

    buffer = io.BytesIO()
    torch.save(dict(state_dict), buffer)
    return buffer.getvalue()


def deserialize_model_update(payload: bytes) -> dict[str, torch.Tensor]:
    if not isinstance(payload, bytes) or not payload:
        raise ValueError("Serialized model update must be non-empty bytes.")

    try:
        state_dict = torch.load(
            io.BytesIO(payload),
            map_location="cpu",
            weights_only=True,
        )
    except (OSError, RuntimeError, EOFError, ValueError) as exc:
        raise ValueError("Serialized model update is invalid.") from exc

    if not isinstance(state_dict, dict) or not state_dict:
        raise ValueError("Serialized model update is not a state dictionary.")
    if any(
        not isinstance(key, str) or not isinstance(value, torch.Tensor)
        for key, value in state_dict.items()
    ):
        raise ValueError("Serialized model update contains invalid entries.")

    return state_dict
