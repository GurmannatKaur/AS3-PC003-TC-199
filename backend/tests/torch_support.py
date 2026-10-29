import importlib

import pytest

_torch = None
_torch_error: OSError | None = None
_torch_checked = False


def require_torch():
    global _torch, _torch_error, _torch_checked
    if not _torch_checked:
        _torch_checked = True
        try:
            _torch = importlib.import_module("torch")
        except OSError as exc:
            _torch_error = exc
    if _torch_error is not None:
        pytest.skip(f"PyTorch native library unavailable in this environment: {_torch_error}")
    return _torch
