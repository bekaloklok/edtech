"""Train a compact browser model on the RSL-Dataset landmark coordinates.

The source dataset has one class for Ш/Щ and one for Ъ/Ь, and two
variants of Ё. Space is excluded. The resulting 31 outputs represent
handshapes; motion must be checked separately by the website.
"""

import json
from pathlib import Path

import numpy as np


project = Path(__file__).resolve().parents[1]
source = project / 'data/RSL-Dataset/text'
out = project
xs = np.loadtxt(source / 'landmarks_x.txt', dtype=np.float32)
ys = np.loadtxt(source / 'landmarks_y.txt', dtype=np.float32)
raw = np.loadtxt(source / 'labels.txt', dtype=np.int16)
assert xs.shape == ys.shape == (43500, 21)

classes = list('АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧ') + ['Ш/Щ', 'Ъ/Ь'] + list('ЫЭЮЯ')
assert len(classes) == 31
mapping = {
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6,
    7: 7, 8: 8, 9: 9, 32: 10, 10: 11, 11: 12,
    12: 13, 13: 14, 14: 15, 15: 16, 16: 17,
    17: 18, 18: 19, 19: 20, 20: 21, 21: 22,
    22: 23, 23: 24, 24: 25, 25: 26, 26: 27,
    27: 28, 28: 29, 29: 30, 31: 6,
}
assert set(mapping) == set(range(33)) - {30}
keep = raw != 30
raw = raw[keep]
features = np.column_stack([xs[keep], ys[keep]])
labels = np.array([mapping[int(value)] for value in raw], dtype=np.int16)

# Preserve the beginning and end of each recorded class as separate blocks.
train_mask = np.zeros(len(labels), dtype=bool)
for value in sorted(set(raw)):
    positions = np.flatnonzero(raw == value)
    train_mask[positions[:int(len(positions) * 0.78)]] = True

mean = features[train_mask].mean(axis=0)
scale = features[train_mask].std(axis=0).clip(min=1e-4)
x_train = (features[train_mask] - mean) / scale
x_test = (features[~train_mask] - mean) / scale
y_train, y_test = labels[train_mask], labels[~train_mask]

random = np.random.default_rng(42)
dimensions = [42, 96, 64, 31]
weights = [random.normal(0, np.sqrt(2 / dimensions[i]), (dimensions[i], dimensions[i + 1])).astype(np.float32) for i in range(3)]
biases = [np.zeros(size, dtype=np.float32) for size in dimensions[1:]]
parameters = [value for pair in zip(weights, biases) for value in pair]
m = [np.zeros_like(value) for value in parameters]
v = [np.zeros_like(value) for value in parameters]
best_loss, best_parameters, stale, step = float('inf'), None, 0, 0

def predict_proba(x):
    a = x
    for layer in range(3):
        a = a @ weights[layer] + biases[layer]
        if layer < 2:
            a = np.maximum(a, 0)
    a -= a.max(axis=1, keepdims=True)
    a = np.exp(a)
    return a / a.sum(axis=1, keepdims=True)

for epoch in range(1, 81):
    order = random.permutation(len(x_train))
    for block in range(0, len(order), 256):
        indices = order[block:block + 256]
        x, y = x_train[indices], y_train[indices]
        z1 = x @ weights[0] + biases[0]
        a1 = np.maximum(z1, 0)
        z2 = a1 @ weights[1] + biases[1]
        a2 = np.maximum(z2, 0)
        z3 = a2 @ weights[2] + biases[2]
        z3 -= z3.max(axis=1, keepdims=True)
        probabilities = np.exp(z3)
        probabilities /= probabilities.sum(axis=1, keepdims=True)
        probabilities[np.arange(len(y)), y] -= 1
        dz3 = probabilities / len(y)
        gradients = [None] * 6
        gradients[4] = a2.T @ dz3 + 1e-4 * weights[2]
        gradients[5] = dz3.sum(axis=0)
        dz2 = (dz3 @ weights[2].T) * (z2 > 0)
        gradients[2] = a1.T @ dz2 + 1e-4 * weights[1]
        gradients[3] = dz2.sum(axis=0)
        dz1 = (dz2 @ weights[1].T) * (z1 > 0)
        gradients[0] = x.T @ dz1 + 1e-4 * weights[0]
        gradients[1] = dz1.sum(axis=0)
        step += 1
        for i, (param, gradient) in enumerate(zip(parameters, gradients)):
            m[i] = 0.9 * m[i] + 0.1 * gradient
            v[i] = 0.999 * v[i] + 0.001 * gradient * gradient
            param -= 0.001 * (m[i] / (1 - 0.9 ** step)) / (np.sqrt(v[i] / (1 - 0.999 ** step)) + 1e-8)
    check = predict_proba(x_test)
    loss = -np.log(check[np.arange(len(y_test)), y_test].clip(min=1e-9)).mean()
    accuracy = (check.argmax(axis=1) == y_test).mean()
    print(f'epoch {epoch:02d}: loss={loss:.4f} accuracy={accuracy:.4f}', flush=True)
    if loss < best_loss - 0.001:
        best_loss = loss
        best_parameters = [item.copy() for item in parameters]
        stale = 0
    else:
        stale += 1
        if stale >= 10:
            break

for target, saved in zip(parameters, best_parameters):
    target[:] = saved
prediction = predict_proba(x_test).argmax(axis=1)
accuracy = float((prediction == y_test).mean())
print('held-out accuracy', round(accuracy, 4))
confusion = np.zeros((31, 31), dtype=int)
np.add.at(confusion, (y_test, prediction), 1)
worst = np.argsort(np.diag(confusion) / np.maximum(1, confusion.sum(axis=1)))[:10]
print('lowest recall:', [(classes[i], round(confusion[i,i] / max(1, confusion[i].sum()), 3)) for i in worst])

# The blocked split above is the honest generalization check. Fit once more on
# all published examples so the shipped model includes every recorded variant.
all_features = (features - mean) / scale
all_labels = labels
m = [np.zeros_like(value) for value in parameters]
v = [np.zeros_like(value) for value in parameters]
step = 0
for epoch in range(1, 21):
    order = random.permutation(len(all_features))
    for block in range(0, len(order), 256):
        indices = order[block:block + 256]
        x, y = all_features[indices], all_labels[indices]
        z1 = x @ weights[0] + biases[0]
        a1 = np.maximum(z1, 0)
        z2 = a1 @ weights[1] + biases[1]
        a2 = np.maximum(z2, 0)
        z3 = a2 @ weights[2] + biases[2]
        z3 -= z3.max(axis=1, keepdims=True)
        probability = np.exp(z3)
        probability /= probability.sum(axis=1, keepdims=True)
        probability[np.arange(len(y)), y] -= 1
        dz3 = probability / len(y)
        gradients = [None] * 6
        gradients[4] = a2.T @ dz3 + 1e-4 * weights[2]
        gradients[5] = dz3.sum(axis=0)
        dz2 = (dz3 @ weights[2].T) * (z2 > 0)
        gradients[2] = a1.T @ dz2 + 1e-4 * weights[1]
        gradients[3] = dz2.sum(axis=0)
        dz1 = (dz2 @ weights[1].T) * (z1 > 0)
        gradients[0] = x.T @ dz1 + 1e-4 * weights[0]
        gradients[1] = dz1.sum(axis=0)
        step += 1
        for i, (param, gradient) in enumerate(zip(parameters, gradients)):
            m[i] = 0.9 * m[i] + 0.1 * gradient
            v[i] = 0.999 * v[i] + 0.001 * gradient * gradient
            param -= 0.0004 * (m[i] / (1 - 0.9 ** step)) / (np.sqrt(v[i] / (1 - 0.999 ** step)) + 1e-8)
    print(f'full-fit epoch {epoch:02d}', flush=True)

arrays = []
metadata = []
for name, value in [('mean', mean), ('scale', scale)]:
    arr = np.asarray(value, dtype='<f4').ravel()
    metadata.append({'name': name, 'shape': list(value.shape), 'offset': sum(len(a) for a in arrays), 'length': len(arr)})
    arrays.append(arr)
for layer, (kernel, bias) in enumerate(zip(weights, biases)):
    for name, value in [(f'kernel{layer}', kernel), (f'bias{layer}', bias)]:
        arr = np.asarray(value, dtype='<f4').ravel()
        metadata.append({'name': name, 'shape': list(value.shape), 'offset': sum(len(a) for a in arrays), 'length': len(arr)})
        arrays.append(arr)

(out / 'alphabet-weights.bin').write_bytes(np.concatenate(arrays).tobytes())
(out / 'alphabet-model.json').write_text(json.dumps({
    'format': 'rsl-landmarks-mlp-v1',
    'classes': classes,
    'features': 'x0..x20,y0..y20 normalized to 192px',
    'tensors': metadata,
    'heldOutAccuracy': accuracy,
}, ensure_ascii=False, indent=2), encoding='utf-8')
np.savez_compressed(project / 'training/alphabet-validation.npz', x=x_test, y=y_test, prediction=prediction)
