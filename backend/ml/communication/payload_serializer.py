import io

import torch


def serialize_model_update(state_dict: dict) -> bytes:
    buffer = io.BytesIO()
    torch.save(state_dict, buffer)
    return buffer.getvalue()
