"""Train a rotation/mirror invariant detector for the И handshape.

Reads only the RSL-Dataset text landmarks. A contiguous final block of each
source class is reserved for evaluation; no photo or personal sample is used.

Run from any directory with::

    python training/train_i_invariant.py

This writes i-invariant-model.json and i-invariant-weights.bin beside app.js.
"""

import argparse
import json
from pathlib import Path

import numpy as np


PROJECT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description="Train the invariant И detector")
parser.add_argument(
    "--data",
    type=Path,
    default=PROJECT / "data" / "RSL-Dataset" / "text",
    help="Directory containing landmarks_x.txt, landmarks_y.txt and labels.txt",
)
SOURCE = parser.parse_args().data
MODEL_FILE = PROJECT / "i-invariant-model.json"
WEIGHTS_FILE = PROJECT / "i-invariant-weights.bin"

xs = np.loadtxt(SOURCE / "landmarks_x.txt", dtype=np.float32)
ys = np.loadtxt(SOURCE / "landmarks_y.txt", dtype=np.float32)
raw_labels = np.loadtxt(SOURCE / "labels.txt", dtype=np.int16)
assert xs.shape == ys.shape == (43500, 21)
assert raw_labels.shape == (43500,)

# Label 30 is a space, not a handshape. Label 9 is И; the Й skeleton is unreliable.
keep = raw_labels != 30
points = np.stack([xs[keep], ys[keep]], axis=-1)
labels = raw_labels[keep]
answers = (labels == 9).astype(np.float32)

# Pairwise distances are unchanged by rotating or mirroring a 2D hand. Their
# order is (0,1)..(0,20),(1,2)..(19,20).
pair_a, pair_b = np.triu_indices(21, 1)
features = np.linalg.norm(points[:, pair_a] - points[:, pair_b], axis=-1).astype(np.float32)
assert features.shape[1] == 210

# Preserve the chronological blocks in every recorded class. Choose the
# operating threshold with validation only; touch test data once at the end.
splits = {"train": [], "validation": [], "test": []}
for label in np.unique(labels):
    rows = np.flatnonzero(labels == label)
    first = int(len(rows) * 0.70)
    second = int(len(rows) * 0.85)
    splits["train"].extend(rows[:first])
    splits["validation"].extend(rows[first:second])
    splits["test"].extend(rows[second:])
splits = {name: np.asarray(rows, dtype=np.int32) for name, rows in splits.items()}

train_rows = splits["train"]
mean = features[train_rows].mean(axis=0)
scale = features[train_rows].std(axis=0).clip(min=0.005)
features = (features - mean) / scale

random = np.random.default_rng(42)
sample = list(train_rows[answers[train_rows] == 1])
for label in np.unique(labels):
    if label == 9:
        continue
    candidates = train_rows[labels[train_rows] == label]
    sample.extend(random.choice(candidates, size=min(220, len(candidates)), replace=False))
sample = np.asarray(sample, dtype=np.int32)

weights = [
    random.normal(0, np.sqrt(2 / 210), (210, 64)).astype(np.float32),
    np.zeros(64, dtype=np.float32),
    random.normal(0, np.sqrt(2 / 64), (64, 32)).astype(np.float32),
    np.zeros(32, dtype=np.float32),
    random.normal(0, np.sqrt(1 / 32), (32, 1)).astype(np.float32),
    np.zeros(1, dtype=np.float32),
]
adam_mean = [np.zeros_like(value) for value in weights]
adam_variance = [np.zeros_like(value) for value in weights]
step = 0


def forward(batch):
    first = batch @ weights[0] + weights[1]
    first_active = np.maximum(first, 0)
    second = first_active @ weights[2] + weights[3]
    second_active = np.maximum(second, 0)
    logits = (second_active @ weights[4] + weights[5]).ravel()
    probability = 1 / (1 + np.exp(-np.clip(logits, -40, 40)))
    return probability, (first, first_active, second, second_active)


best = None
for epoch in range(1, 81):
    order = random.permutation(sample)
    for offset in range(0, len(order), 256):
        rows = order[offset:offset + 256]
        x, y = features[rows], answers[rows]
        probabilities, (first, first_active, second, second_active) = forward(x)
        output_gradient = ((probabilities - y) / len(rows)).reshape(-1, 1)
        gradients = [None] * 6
        gradients[4] = second_active.T @ output_gradient + 0.0003 * weights[4]
        gradients[5] = output_gradient.sum(axis=0)
        second_gradient = (output_gradient @ weights[4].T) * (second > 0)
        gradients[2] = first_active.T @ second_gradient + 0.0003 * weights[2]
        gradients[3] = second_gradient.sum(axis=0)
        first_gradient = (second_gradient @ weights[2].T) * (first > 0)
        gradients[0] = x.T @ first_gradient + 0.0003 * weights[0]
        gradients[1] = first_gradient.sum(axis=0)
        step += 1
        for i, gradient in enumerate(gradients):
            adam_mean[i] = 0.9 * adam_mean[i] + 0.1 * gradient
            adam_variance[i] = 0.999 * adam_variance[i] + 0.001 * gradient * gradient
            weights[i] -= 0.0008 * (adam_mean[i] / (1 - 0.9**step)) / (
                np.sqrt(adam_variance[i] / (1 - 0.999**step)) + 1e-8
            )
    if epoch % 5 == 0:
        held = splits["validation"]
        scores = forward(features[held])[0]
        positive = answers[held].astype(bool)
        positive_loss = -np.log(scores[positive].clip(min=1e-9)).mean()
        negative_loss = -np.log((1 - scores[~positive]).clip(min=1e-9)).mean()
        balanced_loss = float((positive_loss + negative_loss) / 2)
        print(f"epoch {epoch:02d}: validation balanced loss={balanced_loss:.5f}", flush=True)
        if best is None or balanced_loss < best[0]:
            best = (balanced_loss, [value.copy() for value in weights], epoch)

for current, saved in zip(weights, best[1]):
    current[:] = saved

validation_rows = splits["validation"]
validation_scores = forward(features[validation_rows])[0]
validation_truth = answers[validation_rows].astype(bool)
min_positive = float(validation_scores[validation_truth].min())
max_negative = float(validation_scores[~validation_truth].max())
threshold = float(np.sqrt(min_positive * max_negative))


def evaluate(rows):
    scores = forward(features[rows])[0]
    positive = answers[rows].astype(bool)
    accepted = scores >= threshold
    return {
        "I_count": int(positive.sum()),
        "non_I_count": int((~positive).sum()),
        "I_recall": float(accepted[positive].mean()),
        "non_I_false_positive_rate": float(accepted[~positive].mean()),
        "non_I_false_positive_count": int(accepted[~positive].sum()),
    }


tensor_arrays = [mean, scale, *weights]
tensor_names = ["mean", "scale", "kernel0", "bias0", "kernel1", "bias1", "kernel2", "bias2"]
tensor_metadata = []
offset = 0
for name, value in zip(tensor_names, tensor_arrays):
    tensor_metadata.append({
        "name": name,
        "shape": list(value.shape),
        "offset": offset,
        "length": int(value.size),
    })
    offset += value.size

np.concatenate([value.ravel() for value in tensor_arrays]).astype("<f4").tofile(WEIGHTS_FILE)
metadata = {
    "format": "rsl-i-invariant-distances-mlp-v1",
    "classes": ["И", "не И"],
    "features": "210 pairwise distances of the 21 normalized 2D hand landmarks",
    "pair_indices": "(0,1)..(0,20),(1,2)..(19,20)",
    "threshold": threshold,
    "tensors": tensor_metadata,
    "training": {
        "source": "Blockbattle/RSL-Dataset text landmarks, except the space class",
        "split": "Within each class, first 70% train, next 15% validation, last 15% test",
        "sampled_train_I": int(answers[sample].sum()),
        "sampled_train_non_I": int((1 - answers[sample]).sum()),
        "best_epoch": best[2],
        "threshold_rule": "Geometric mean of the lowest validation И score and highest validation non-И score",
        "validation": evaluate(validation_rows),
        "test": evaluate(splits["test"]),
        "limitation": "No independent person or live camera was included in the test",
    },
}
MODEL_FILE.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(metadata["training"], ensure_ascii=False, indent=2))
print(f"Saved {MODEL_FILE.name} and {WEIGHTS_FILE.name}")
