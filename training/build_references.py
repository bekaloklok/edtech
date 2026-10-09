import argparse
import json
from pathlib import Path
import numpy as np

project = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--data', type=Path, default=project / 'data/RSL-Dataset/text')
root = parser.parse_args().data
out = project
x = np.loadtxt(root/'landmarks_x.txt', dtype=np.float32)
y = np.loadtxt(root/'landmarks_y.txt', dtype=np.float32)
raw = np.loadtxt(root/'labels.txt', dtype=np.int16)
features = np.column_stack([x, y])
meta = json.loads((out/'alphabet-model.json').read_text(encoding='utf8'))
binary = np.fromfile(out/'alphabet-weights.bin', dtype='<f4')
named = {t['name']: binary[t['offset']:t['offset']+t['length']].reshape(t['shape']) for t in meta['tensors']}
z = (features - named['mean']) / named['scale']
for i in range(3):
    z = z @ named[f'kernel{i}'] + named[f'bias{i}']
    if i < 2:
        z = np.maximum(z, 0)
z = np.exp(z - z.max(axis=1, keepdims=True))
z /= z.sum(axis=1, keepdims=True)

letter_to_raw = {
    'А': 0, 'Б': 1, 'В': 2, 'Г': 3, 'Д': 4, 'Е': 5, 'Ё': 6,
    'Ж': 7, 'З': 8, 'И': 9, 'Й': 9, 'К': 10, 'Л': 11,
    'М': 12, 'Н': 13, 'О': 14, 'П': 15, 'Р': 16,
    'С': 17, 'Т': 18, 'У': 19, 'Ф': 20, 'Х': 21,
    'Ц': 22, 'Ч': 23, 'Ш': 24, 'Щ': 24, 'Ъ': 25,
    'Ь': 25, 'Ы': 26, 'Э': 27, 'Ю': 28, 'Я': 29,
}

examples = {}
for letter, label in letter_to_raw.items():
    model_class = 'Ш/Щ' if letter in 'ШЩ' else 'Ъ/Ь' if letter in 'ЪЬ' else 'И' if letter == 'Й' else letter
    class_index = meta['classes'].index(model_class)
    rows = np.flatnonzero(raw == label)
    best = rows[np.argmax(z[rows, class_index])]
    examples[letter] = [round(float(v), 7) for v in features[best]]

(out/'alphabet-examples.json').write_text(json.dumps(examples, ensure_ascii=False, separators=(',',':')), encoding='utf8')
print('Examples:', len(examples))
