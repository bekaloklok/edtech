import { HandLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/+esm';

const $ = (id) => document.getElementById(id);
const alphabet = [...'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'];
const images = 'a b v g d e e zh z i j k l m n o p r s t u f h ts ch sh shch tvjordyj-znak y myagkij-znak ee yu ya'.split(' ');
const specialHints = {
  'А': 'Сожми пальцы в кулак. Большой палец прижми сбоку к указательному, как на образце.',
  'Б': 'Выпрями указательный палец. Средний держи рядом, согнув его верхнюю фалангу; безымянный и мизинец прижми к ладони.',
  'В': 'Раскрой ладонь и выпрями четыре пальца, держи их вместе.',
  'Г': 'Выпрями указательный палец, остальные три прижми к ладони. Большой палец отведи в сторону, кисть направь пальцами вниз.',
  'Д': 'Выпрями и соедини указательный со средним, остальные пальцы согни. Когда форма найдена, нарисуй двумя пальцами небольшой круг в воздухе.',
  'Е': 'Согни пальцы в пучок, чтобы их кончики встретились с большим пальцем.',
  'Ё': 'Сложи пальцы как для Е. Когда форма найдена, поверни кисть влево и вправо.',
  'Ж': 'Согни четыре пальца у основания примерно под прямым углом и положи их на большой палец.',
  'З': 'Выпрями указательный палец, остальные согни. Полный жест рисует указательным букву З в воздухе; пока сайт проверяет только форму руки.',
  'И': 'Выпрями безымянный палец и мизинец вверх, слегка разведи их. Указательный и средний прижми к ладони большим пальцем.',
  'Й': 'Покажи форму И: безымянный палец и мизинец вверх, указательный и средний согнуты. Затем поверни кисть дугой в сторону.',
  'К': 'Выпрями указательный и средний пальцы, слегка разведи их. Безымянный и мизинец согни к ладони. Когда форма найдена, коротко опусти кисть вниз.',
  'Л': 'Выпрями и разведи указательный и средний пальцы. Остальные прижми к ладони, кисть направь пальцами вниз.',
  'М': 'Направь кисть пальцами вниз. Выпрями указательный, средний и безымянный, а мизинец соедини с большим пальцем.',
  'Н': 'Выпрями указательный, средний и мизинец. Безымянный соедини с большим пальцем.',
  'О': 'Соедини указательный и большой пальцы в кольцо. Средний, безымянный и мизинец выпрями.',
  'П': 'Выпрями и соедини указательный со средним, остальные согни. Кисть направь пальцами вниз.',
  'Р': 'Соедини средний и большой пальцы в кольцо. Указательный, безымянный и мизинец выпрями.',
  'С': 'Слегка согни все пальцы, чтобы кисть напоминала букву С.',
  'Т': 'Направь кисть пальцами вниз. Указательный, средний и безымянный выпрями и соедини; мизинец согни.',
  'У': 'Выпрями мизинец и отведи большой палец в сторону. Остальные пальцы согни.',
  'Ф': 'Согни четыре пальца у основания примерно под прямым углом; большой палец прижми сбоку, как на образце.',
  'Х': 'Согни указательный палец крючком. Остальные пальцы прижми к ладони.',
  'Ц': 'Выпрями и соедини указательный со средним, остальные согни. Полный жест включает короткое движение кисти вниз; пока сайт проверяет только форму руки.',
  'Ч': 'Согни указательный и средний у основания и положи их на большой палец. Безымянный и мизинец прижми к ладони.',
  'Ш': 'Выпрями указательный, средний и безымянный. Мизинец соедини с большим пальцем.',
  'Щ': 'Покажи форму Ш. Когда форма найдена, коротко опусти всю кисть вниз.',
  'Ъ': 'Выпрями указательный палец и отведи большой в сторону, остальные согни. Затем слегка наклони кисть так, чтобы указательный палец ушёл к тебе, от камеры.',
  'Ы': 'Выпрями указательный палец и мизинец. Средний и безымянный прижми к ладони большим пальцем.',
  'Ь': 'Выпрями указательный палец и отведи большой в сторону, остальные согни. Затем слегка наклони кисть так, чтобы указательный палец ушёл от тебя, к камере.',
  'Э': 'Согни указательный и большой пальцы навстречу друг другу, образуя полукольцо. Остальные прижми к ладони.',
  'Ю': 'Подними мизинец, остальные пальцы собери к большому, как на образце.',
  'Я': 'Положи средний палец на указательный. Безымянный и мизинец прижми к ладони.',
};
const targets = alphabet.map((letter, index) => ({
  letter, image: images[index], hint: specialHints[letter],
}));
const baseClass = (letter) => letter === 'Й' ? 'И' : 'ШЩ'.includes(letter) ? 'Ш/Щ' : 'ЪЬ'.includes(letter) ? 'Ъ/Ь' : letter;
const movementLetters = new Set(['Д', 'Ё', 'Й', 'К', 'Щ', 'Ъ', 'Ь']);
const fingerColors = {
  palm: '#ff3030', thumb: '#ffe5b4', index: '#804080',
  middle: '#ffcc00', ring: '#30ff30', pinky: '#1565c0',
};
const edges = [
  [0,1,'palm'],[0,5,'palm'],[0,9,'palm'],[0,13,'palm'],[0,17,'palm'],
  [5,9,'palm'],[9,13,'palm'],[13,17,'palm'],
  [1,2,'thumb'],[2,3,'thumb'],[3,4,'thumb'],
  [5,6,'index'],[6,7,'index'],[7,8,'index'],
  [9,10,'middle'],[10,11,'middle'],[11,12,'middle'],
  [13,14,'ring'],[14,15,'ring'],[15,16,'ring'],
  [17,18,'pinky'],[18,19,'pinky'],[19,20,'pinky'],
];
const dotType = (index) => [0,1,5,9,13,17].includes(index) ? 'palm' :
  index <= 4 ? 'thumb' : index <= 8 ? 'index' : index <= 12 ? 'middle' :
  index <= 16 ? 'ring' : 'pinky';

let model, landmarker, photoLandmarker, stream, timer, examples;
let alphabetActive = true;
let lessonIndex = 0;
const completed = new Set();
let steadyFrames = 0;
let lastAdvance = 0;
let motionHistory = [];
let motionShapeFrames = 0;
let motionReadyFrames = 0;
let motionArmedAt = 0;
let busy = false;
let photoBusy = false;
const skeleton = $('skeleton');
const context = skeleton.getContext('2d', { willReadFrequently: true });

function setFeedback(title, detail, icon = '✳') {
  $('feedbackTitle').textContent = title;
  $('feedbackText').textContent = detail;
  $('feedbackIcon').textContent = icon;
}

function resetMotion() {
  motionHistory = [];
  motionShapeFrames = 0;
  motionReadyFrames = 0;
  motionArmedAt = 0;
}

function updateLesson() {
  $('exampleButton').disabled = lessonIndex >= targets.length;
  $('resetButton').hidden = lessonIndex < targets.length;
  if (lessonIndex >= targets.length) {
    $('targetLetter').textContent = '✓';
    $('targetTitle').textContent = 'Урок завершён';
    $('counter').textContent = '33 / 33';
    $('reference').hidden = true;
    $('reference').classList.remove('upright-a');
    $('targetHint').textContent = 'Ты прошёл весь алфавит. Можно выбрать букву в справочнике и повторить её.';
    setFeedback('Весь алфавит пройден', 'Можешь выбрать любую букву или пройти урок снова.', '✓');
  } else {
    const target = targets[lessonIndex];
    $('reference').hidden = false;
    $('targetLetter').textContent = target.letter;
    $('targetTitle').textContent = `Покажи букву ${target.letter}`;
    $('counter').textContent = `${lessonIndex + 1} / 33`;
    $('reference').src = `references/alphabet/${target.image}.png`;
    $('reference').alt = `Образец жеста ${target.letter}`;
    $('reference').classList.toggle('upright-a', target.letter === 'А');
    $('targetHint').textContent = target.hint;
  }
  $('progressCount').textContent = `${completed.size} из 33`;
  $('progressFill').style.width = `${completed.size / 33 * 100}%`;
  for (const [index, card] of [...document.querySelectorAll('.letter-card')].entries()) {
    card.classList.toggle('done', completed.has(targets[index]?.letter));
    card.classList.toggle('active', index === lessonIndex);
  }
}

function nextUncompleted(afterIndex) {
  for (let step = 0; step < targets.length; step++) {
    const index = (afterIndex + step) % targets.length;
    if (!completed.has(targets[index].letter)) return index;
  }
  return targets.length;
}

async function loadModel() {
  if (!window.tf) throw new Error('Не удалось загрузить TensorFlow.js');
  const [metaResponse, weightsResponse, aMetaResponse, aWeightsResponse,
    shMetaResponse, shWeightsResponse, iMetaResponse, iWeightsResponse,
    kMetaResponse, kWeightsResponse, dMetaResponse, dWeightsResponse] = await Promise.all([
    fetch('alphabet-model.json'), fetch('alphabet-weights.bin'),
    fetch('a-invariant-model.json'), fetch('a-invariant-weights.bin'),
    fetch('sh-invariant-model.json'), fetch('sh-invariant-weights.bin'),
    fetch('i-invariant-model.json'), fetch('i-invariant-weights.bin'),
    fetch('k-invariant-model.json'), fetch('k-invariant-weights.bin'),
    fetch('d-invariant-model.json'), fetch('d-invariant-weights.bin'),
  ]);
  if (!metaResponse.ok || !weightsResponse.ok || !aMetaResponse.ok || !aWeightsResponse.ok ||
      !shMetaResponse.ok || !shWeightsResponse.ok || !iMetaResponse.ok || !iWeightsResponse.ok ||
      !kMetaResponse.ok || !kWeightsResponse.ok || !dMetaResponse.ok || !dWeightsResponse.ok) throw new Error('Не удалось загрузить файлы модели');
  const meta = await metaResponse.json();
  const binary = new Float32Array(await weightsResponse.arrayBuffer());
  const aMeta = await aMetaResponse.json();
  const aBinary = new Float32Array(await aWeightsResponse.arrayBuffer());
  const shMeta = await shMetaResponse.json();
  const shBinary = new Float32Array(await shWeightsResponse.arrayBuffer());
  const iMeta = await iMetaResponse.json();
  const iBinary = new Float32Array(await iWeightsResponse.arrayBuffer());
  const kMeta = await kMetaResponse.json();
  const kBinary = new Float32Array(await kWeightsResponse.arrayBuffer());
  const dMeta = await dMetaResponse.json();
  const dBinary = new Float32Array(await dWeightsResponse.arrayBuffer());
  if (meta.format !== 'rsl-landmarks-mlp-v1' || meta.tensors.length !== 8 || meta.classes.length !== 31) {
    throw new Error('Неизвестный формат модели');
  }
  if (aMeta.format !== 'rsl-a-invariant-distances-mlp-v1' || aMeta.tensors.length !== 8) {
    throw new Error('Неизвестный формат модели буквы А');
  }
  if (shMeta.format !== 'rsl-sh-invariant-distances-mlp-v1' || shMeta.tensors.length !== 8) {
    throw new Error('Неизвестный формат модели Ш/Щ');
  }
  if (iMeta.format !== 'rsl-i-invariant-distances-mlp-v1' || iMeta.tensors.length !== 8) {
    throw new Error('Неизвестный формат модели И');
  }
  if (kMeta.format !== 'rsl-k-invariant-distances-mlp-v1' || kMeta.tensors.length !== 8) {
    throw new Error('Неизвестный формат модели К');
  }
  if (dMeta.format !== 'rsl-d-invariant-distances-mlp-v1' || dMeta.tensors.length !== 8) {
    throw new Error('Неизвестный формат модели Д');
  }
  const tensors = Object.fromEntries(meta.tensors.map((entry) => [
    entry.name, tf.tensor(binary.subarray(entry.offset, entry.offset + entry.length), entry.shape, 'float32'),
  ]));
  const net = tf.sequential();
  net.add(tf.layers.dense({ inputShape: [42], units: 96, activation: 'relu' }));
  net.add(tf.layers.dense({ units: 64, activation: 'relu' }));
  net.add(tf.layers.dense({ units: 31, activation: 'softmax' }));
  net.setWeights([tensors.kernel0, tensors.bias0, tensors.kernel1, tensors.bias1, tensors.kernel2, tensors.bias2]);
  for (const name of ['kernel0','bias0','kernel1','bias1','kernel2','bias2']) tensors[name].dispose();
  const aTensors = Object.fromEntries(aMeta.tensors.map((entry) => [
    entry.name, aBinary.subarray(entry.offset, entry.offset + entry.length),
  ]));
  if (aTensors.mean.length !== 210 || aTensors.scale.length !== 210 ||
      aTensors.kernel0.length !== 210 * 64 || aTensors.kernel1.length !== 64 * 32 || aTensors.kernel2.length !== 32) {
    throw new Error('Неверный размер модели буквы А');
  }
  const shTensors = Object.fromEntries(shMeta.tensors.map((entry) => [
    entry.name, shBinary.subarray(entry.offset, entry.offset + entry.length),
  ]));
  if (shTensors.mean.length !== 210 || shTensors.scale.length !== 210 ||
      shTensors.kernel0.length !== 210 * 64 || shTensors.kernel1.length !== 64 * 32 || shTensors.kernel2.length !== 32) {
    throw new Error('Неверный размер модели Ш/Щ');
  }
  const iTensors = Object.fromEntries(iMeta.tensors.map((entry) => [
    entry.name, iBinary.subarray(entry.offset, entry.offset + entry.length),
  ]));
  if (iTensors.mean.length !== 210 || iTensors.scale.length !== 210 ||
      iTensors.kernel0.length !== 210 * 64 || iTensors.kernel1.length !== 64 * 32 || iTensors.kernel2.length !== 32) {
    throw new Error('Неверный размер модели И');
  }
  const kTensors = Object.fromEntries(kMeta.tensors.map((entry) => [
    entry.name, kBinary.subarray(entry.offset, entry.offset + entry.length),
  ]));
  if (kTensors.mean.length !== 210 || kTensors.scale.length !== 210 ||
      kTensors.kernel0.length !== 210 * 64 || kTensors.kernel1.length !== 64 * 32 || kTensors.kernel2.length !== 32) {
    throw new Error('Неверный размер модели К');
  }
  const dTensors = Object.fromEntries(dMeta.tensors.map((entry) => [
    entry.name, dBinary.subarray(entry.offset, entry.offset + entry.length),
  ]));
  if (dTensors.mean.length !== 210 || dTensors.scale.length !== 210 ||
      dTensors.kernel0.length !== 210 * 64 || dTensors.kernel1.length !== 64 * 32 || dTensors.kernel2.length !== 32) {
    throw new Error('Неверный размер модели Д');
  }
  return { net, mean: tensors.mean, scale: tensors.scale, classes: meta.classes,
    aDetector: { ...aTensors, threshold: aMeta.threshold },
    shDetector: { ...shTensors, threshold: shMeta.threshold },
    iDetector: { ...iTensors, threshold: iMeta.threshold },
    kDetector: { ...kTensors, threshold: kMeta.threshold },
    dDetector: { ...dTensors, threshold: dMeta.threshold } };
}

function scoreInvariant(features, net) {
  const distances = new Float32Array(210);
  let pair = 0;
  for (let i = 0; i < 21; i++) {
    for (let j = i + 1; j < 21; j++) {
      const dx = features[i] - features[j];
      const dy = features[i + 21] - features[j + 21];
      distances[pair] = (Math.hypot(dx, dy) - net.mean[pair]) / net.scale[pair];
      pair++;
    }
  }
  const h1 = new Float32Array(64);
  for (let unit = 0; unit < 64; unit++) {
    let value = net.bias0[unit];
    for (let i = 0; i < 210; i++) value += distances[i] * net.kernel0[i * 64 + unit];
    h1[unit] = Math.max(0, value);
  }
  const h2 = new Float32Array(32);
  for (let unit = 0; unit < 32; unit++) {
    let value = net.bias1[unit];
    for (let i = 0; i < 64; i++) value += h1[i] * net.kernel1[i * 32 + unit];
    h2[unit] = Math.max(0, value);
  }
  let logit = net.bias2[0];
  for (let i = 0; i < 32; i++) logit += h2[i] * net.kernel2[i];
  return 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, logit))));
}

function drawWhiteCanvas() {
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 192, 192);
}

function renderSkeleton(landmarks, aspectRatio) {
  drawWhiteCanvas();
  const x = landmarks.map((point) => point.x * aspectRatio);
  const y = landmarks.map((point) => point.y);
  const minX = Math.min(...x), minY = Math.min(...y);
  const size = Math.max(Math.max(...x) - minX, Math.max(...y) - minY);
  if (size < 0.02) return false;
  const points = landmarks.map((_, index) => ({
    x: 10 + (x[index] - minX) * 172 / size,
    y: 10 + (y[index] - minY) * 172 / size,
  }));
  for (const [a,b,type] of edges) {
    context.strokeStyle = type === 'palm' ? '#808080' : fingerColors[type];
    context.lineWidth = type === 'palm' ? 3 : 2;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(points[a].x, points[a].y);
    context.lineTo(points[b].x, points[b].y);
    context.stroke();
  }
  for (let i = 0; i < 21; i++) {
    context.fillStyle = fingerColors[dotType(i)];
    context.beginPath();
    context.arc(points[i].x, points[i].y, 5, 0, Math.PI * 2);
    context.fill();
  }
  return [...points.map((point) => point.x / 192), ...points.map((point) => point.y / 192)];
}

async function classify(features) {
  const input = tf.tensor2d(features, [1,42]);
  const normalized = input.sub(model.mean).div(model.scale);
  const prediction = model.net.predict(normalized);
  const scores = await prediction.data();
  input.dispose(); normalized.dispose(); prediction.dispose();
  let best = 0;
  for (let i = 1; i < scores.length; i++) if (scores[i] > scores[best]) best = i;
  const target = targets[lessonIndex]?.letter;
  const aScore = target === 'А' ? scoreInvariant(features, model.aDetector) : null;
  const shScore = target === 'Щ' ? scoreInvariant(features, model.shDetector) : null;
  const iScore = target === 'И' || target === 'Й' ? scoreInvariant(features, model.iDetector) : null;
  const kScore = target === 'К' ? scoreInvariant(features, model.kDetector) : null;
  const dScore = target === 'Д' ? scoreInvariant(features, model.dDetector) : null;
  return { letter: model.classes[best], score: scores[best], scores, aScore, shScore, iScore, kScore, dScore };
}

const fingerJoints = [
  { name: 'указательный', joint: 6 },
  { name: 'средний', joint: 10 },
  { name: 'безымянный', joint: 14 },
  { name: 'мизинец', joint: 18 },
];

function jointAngle(points, joint, aspectRatio) {
  const center = points[joint];
  const prev = points[joint - 1];
  const next = points[joint + 1];
  const a = [(prev.x - center.x) * aspectRatio, prev.y - center.y];
  const b = [(next.x - center.x) * aspectRatio, next.y - center.y];
  const length = Math.hypot(...a) * Math.hypot(...b);
  if (length < 1e-6) return null;
  return Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1]) / length))) * 180 / Math.PI;
}

function measuredFingerAngles(points, aspectRatio) {
  if (!points || points.length < 21) return null;
  const angles = fingerJoints.map(({ joint }) => jointAngle(points, joint, aspectRatio));
  if (angles.some((angle) => angle === null || !Number.isFinite(angle))) return null;
  return angles;
}

function recordMotion(landmarks, aspectRatio, now = Date.now()) {
  const palmSpan = Math.hypot((landmarks[5].x - landmarks[17].x) * aspectRatio, landmarks[5].y - landmarks[17].y);
  if (palmSpan < 0.01) return;
  const palmY = [5, 9, 13, 17].reduce((sum, index) => sum + landmarks[index].y, 0) / 4;
  const tipX = (landmarks[8].x + landmarks[12].x) * aspectRatio / 2;
  const tipY = (landmarks[8].y + landmarks[12].y) / 2;
  const upperFingersY = (landmarks[8].y + landmarks[12].y) / 2;
  const upperFingersDrop = (upperFingersY - palmY) / palmSpan;
  const roll = Math.atan2(landmarks[9].y - landmarks[0].y, (landmarks[9].x - landmarks[0].x) * aspectRatio);
  const twist = ((landmarks[5].z ?? 0) - (landmarks[17].z ?? 0)) * aspectRatio / palmSpan;
  // Relative fingertip depth ignores movement of the whole hand toward the camera.
  const fingerDepth = ((landmarks[8].z ?? 0) - (landmarks[5].z ?? 0)) * aspectRatio / palmSpan;
  motionHistory.push({ time: now, y: palmY, span: palmSpan, tipX, tipY, twist, roll, fingerDepth, upperFingersDrop });
  motionHistory = motionHistory.filter((item) => now - item.time <= 1800);
}

function turnedAndReturned(values, amount) {
  const start = values[0], end = values.at(-1);
  return values.slice(1, -1).some((middle) =>
    (middle - start > amount && middle - end > amount) ||
    (start - middle > amount && end - middle > amount));
}

function drewCircle(history) {
  for (let start = 0; start <= history.length - 7; start++) {
    const path = history.slice(start);
    const xs = path.map((point) => point.tipX);
    const ys = path.map((point) => point.tipY);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    const minSize = Math.max(0.035, path[0].span * 0.2);
    if (width < minSize || height < minSize) continue;
    const centerX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
    const centerY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
    let turn = 0;
    let length = 0;
    for (let i = 1; i < path.length; i++) {
      const previous = Math.atan2(ys[i - 1] - centerY, xs[i - 1] - centerX);
      const current = Math.atan2(ys[i] - centerY, xs[i] - centerX);
      turn += Math.atan2(Math.sin(current - previous), Math.cos(current - previous));
      length += Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
    }
    const closed = Math.hypot(xs[0] - xs.at(-1), ys[0] - ys.at(-1)) < Math.max(width, height) * 0.75;
    if (Math.abs(turn) > 4.4 && length > minSize * 3 && closed) return true;
  }
  return false;
}

function movementDetected(letter) {
  if (motionHistory.length < 3) return false;
  const first = motionHistory[0], last = motionHistory.at(-1);
  if (last.time - first.time < 250) return false;
  if (letter === 'Д') return drewCircle(motionHistory);
  if (letter === 'Ё') {
    const twists = motionHistory.map((item) => item.twist);
    const rolls = motionHistory.map((item) => Math.atan2(
      Math.sin(item.roll - first.roll), Math.cos(item.roll - first.roll)));
    return turnedAndReturned(twists, 0.11) || turnedAndReturned(rolls, 0.18);
  }
  if (letter === 'Й') {
    const rollChange = Math.max(...motionHistory.map((item) => Math.abs(Math.atan2(
      Math.sin(item.roll - first.roll), Math.cos(item.roll - first.roll)))));
    const twistChange = Math.max(...motionHistory.map((item) => Math.abs(item.twist - first.twist)));
    return rollChange > 0.28 || twistChange > 0.15;
  }
  if (letter === 'К') {
    const handDrop = last.y - first.y > Math.max(0.03, first.span * 0.22);
    const fingerDrop = last.upperFingersDrop - first.upperFingersDrop > 0.22;
    return handDrop || fingerDrop;
  }
  if (letter === 'Щ') return last.y - first.y > Math.max(0.035, first.span * 0.3);
  if (letter === 'Ъ') return last.fingerDepth - first.fingerDepth > 0.075;
  if (letter === 'Ь') return first.fingerDepth - last.fingerDepth > 0.075;
  return false;
}

function completeCurrentLetter(target) {
  lastAdvance = Date.now();
  steadyFrames = 0;
  completed.add(target);
  lessonIndex = nextUncompleted(lessonIndex + 1);
  resetMotion();
  updateLesson();
}

function present(result, fromCamera, landmarks = null, aspectRatio = 1, fromExample = false) {
  if (lessonIndex >= targets.length) return;
  const target = targets[lessonIndex].letter;
  const angles = measuredFingerAngles(landmarks, aspectRatio);
  const invariantA = target === 'А' && result.aScore !== null &&
    result.aScore >= model.aDetector.threshold && (!angles || angles.every((angle) => angle <= 145));
  const invariantI = (target === 'И' || target === 'Й') && result.iScore != null &&
    result.iScore >= model.iDetector.threshold;
  const invariantK = target === 'К' && result.kScore != null &&
    result.kScore >= model.kDetector.threshold;
  const invariantD = target === 'Д' && result.dScore != null &&
    result.dScore >= model.dDetector.threshold;
  const dBaseShape = target === 'Д' && (result.letter === 'Д' || result.letter === 'Ц') && result.score >= 0.6;
  $('prediction').textContent = invariantA ? 'А' : target === 'И' || target === 'Й' ? invariantI ? 'И' : '—' :
    target === 'К' ? invariantK ? 'К' : '—' : target === 'Д' ? invariantD || dBaseShape ? 'Д' : '—' : result.letter;
  $('meterFill').style.width = invariantA || invariantI || invariantK || invariantD ? '100%' :
    dBaseShape ? `${Math.round(result.score * 100)}%` :
    target === 'И' || target === 'Й' || target === 'К' || target === 'Д' ? '0%' : `${Math.round(result.score * 100)}%`;
  $('confidence').textContent = invariantA ? 'Форма А прошла дополнительную проверку' :
    invariantI ? 'Форма И прошла дополнительную проверку' :
    invariantK ? 'Форма К прошла дополнительную проверку' :
    invariantD ? 'Форма Д прошла дополнительную проверку' :
    dBaseShape ? 'Форма Д найдена · для зачёта нужен круг' :
    target === 'И' || target === 'Й' ? 'Форма И пока не подтверждена' :
    target === 'К' ? 'Форма К пока не подтверждена' :
    target === 'Д' ? 'Форма Д пока не подтверждена' :
    `Оценка модели: ${Math.round(result.score * 100)}% · возможна ошибка`;
  const matchingShape = result.letter === baseClass(target);
  // Finger angles are useful advice, but webcam landmarks are noisy. Do not
  // veto a strong matching prediction because one 2-D joint angle disagrees.
  const clearShape = target === 'А' ? invariantA : target === 'И' ? invariantI : matchingShape && result.score >= 0.7;
  if (movementLetters.has(target)) {
    const invariantSh = target === 'Щ' && result.shScore != null && result.shScore >= model.shDetector.threshold;
    const shapeSeen = target === 'Й' ? invariantI : target === 'К' ? invariantK : target === 'Д' ? invariantD || dBaseShape :
      (matchingShape && result.score >= 0.45) || invariantSh;
    steadyFrames = 0;
    if (invariantSh) {
      $('prediction').textContent = 'Ш/Щ';
      $('confidence').textContent = 'Форма Ш прошла дополнительную проверку';
      $('meterFill').style.width = '100%';
    }
    if (!fromCamera || !landmarks) {
      resetMotion();
      setFeedback(shapeSeen ? 'Форма руки подходит' : 'Форма пока не подтверждена',
        shapeSeen ? `Для буквы ${target} нужно движение. Включи камеру: ${targets[lessonIndex].hint}` : targets[lessonIndex].hint, '↔');
      return;
    }
    if (!motionArmedAt) {
      motionShapeFrames = shapeSeen ? Math.min(motionShapeFrames + 1, 3) : Math.max(0, motionShapeFrames - 1);
      if (motionShapeFrames < 2) {
        setFeedback('Сначала покажи форму руки', targets[lessonIndex].hint, '↻');
        return;
      }
      motionArmedAt = Date.now();
      motionHistory = [];
      recordMotion(landmarks, aspectRatio);
      setFeedback('Форма найдена — добавь движение', targets[lessonIndex].hint, '↔');
      return;
    }
    if (Date.now() - motionArmedAt > 5000) {
      resetMotion();
      setFeedback('Покажи форму ещё раз', 'После подтверждения формы сразу выполни движение.', '↻');
      return;
    }
    recordMotion(landmarks, aspectRatio);
    $('prediction').textContent = target;
    $('confidence').textContent = 'Форма найдена · проверяю движение';
    $('meterFill').style.width = '60%';
    motionReadyFrames = movementDetected(target) ? motionReadyFrames + 1 : 0;
    if (motionReadyFrames >= 2 && Date.now() - lastAdvance > 700) {
      setFeedback(`Вижу букву ${target}`, 'Форма и движение совпали.', '✓');
      completeCurrentLetter(target);
    } else {
      setFeedback(motionReadyFrames ? 'Движение замечено' : 'Форма найдена — добавь движение',
        targets[lessonIndex].hint, '↔');
    }
    return;
  }
  if (clearShape) {
    steadyFrames++;
    setFeedback(`Вижу букву ${target}`, fromCamera ? 'Удерживай жест ещё немного.' : 'Образец распознан.', '✓');
    if ((!fromCamera || steadyFrames >= 5) && (!fromCamera || Date.now() - lastAdvance > 1000)) {
      completeCurrentLetter(target);
    }
  } else {
    steadyFrames = 0;
    setFeedback(`Пока не подтверждаю букву ${target}`, targets[lessonIndex].hint, '↻');
  }
}

async function loadLandmarker(runningMode = 'VIDEO') {
  const version = '0.10.21';
  const vision = await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${version}/wasm`);
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task' },
    runningMode, numHands: 1,
    minHandDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

async function cameraTick() {
  if (!stream || busy || photoBusy || !model || !landmarker || lessonIndex >= targets.length) return;
  const video = $('video');
  if (video.readyState < 2) return;
  busy = true;
  try {
    const result = landmarker.detectForVideo(video, performance.now());
    const landmarks = result.landmarks?.[0];
    if (!landmarks) {
      drawWhiteCanvas();
      $('videoPill').textContent = 'Рука не найдена';
      $('prediction').textContent = '—';
      $('meterFill').style.width = '0%';
      $('confidence').textContent = 'Наведите руку на камеру';
      steadyFrames = 0;
      resetMotion();
      setFeedback('Покажи руку в кадре', 'Подними кисть так, чтобы были видны все пальцы.', '↻');
      return;
    }
    $('videoPill').textContent = 'Рука найдена';
    const aspectRatio = video.videoWidth / video.videoHeight;
    const features = renderSkeleton(landmarks, aspectRatio);
    if (features) {
      const prediction = await classify(features);
      present(prediction, true, landmarks, aspectRatio);
    }
  } catch (error) {
    setFeedback('Ошибка распознавания', error.message, '!');
    clearInterval(timer);
  } finally {
    busy = false;
  }
}

function stopCamera() {
  clearInterval(timer);
  timer = undefined;
  stream?.getTracks().forEach((track) => track.stop());
  stream = undefined;
  $('video').pause();
  $('video').srcObject = null;
  $('videoPlaceholder').hidden = false;
  $('cameraState').textContent = 'Выключена';
  $('cameraState').parentElement.classList.remove('camera-on');
  $('startButton').disabled = false;
  $('startButton').textContent = 'Включить камеру';
  $('videoPill').textContent = 'Ожидание руки';
  resetMotion();
}

window.addEventListener('pause-letter-camera', () => {
  alphabetActive = false;
  stopCamera();
});
window.addEventListener('resume-letter-page', () => { alphabetActive = true; });

$('startButton').addEventListener('click', async () => {
  const button = $('startButton');
  button.disabled = true;
  setFeedback('Запускаем камеру', 'Разреши доступ в окне браузера.');
  try {
    if (!model) model = await loadModel();
    if (!landmarker) landmarker = await loadLandmarker('VIDEO');
    if (!alphabetActive) { button.disabled = false; return; }
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false });
    if (!alphabetActive) { stopCamera(); return; }
    $('video').srcObject = stream;
    await $('video').play();
    if (!alphabetActive) { stopCamera(); return; }
    $('videoPlaceholder').hidden = true;
    $('cameraState').textContent = 'Включена';
    $('cameraState').parentElement.classList.add('camera-on');
    button.textContent = 'Камера включена';
    setFeedback(`Покажи букву ${targets[lessonIndex]?.letter || 'А'}`, 'Расположи одну руку полностью в кадре.');
    timer = setInterval(cameraTick, 100);
  } catch (error) {
    button.disabled = false;
    setFeedback('Не удалось включить камеру', error.message, '!');
  }
});

$('imageInput').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const input = $('imageInput');
  input.disabled = true;
  photoBusy = true;
  setFeedback('Проверяем фото', 'Ищем кисть руки на изображении…');
  let image;
  try {
    if (!model) model = await loadModel();
    if (!photoLandmarker) photoLandmarker = await loadLandmarker('IMAGE');
    image = await createImageBitmap(file);
    const landmarks = photoLandmarker.detect(image).landmarks?.[0];
    if (!landmarks) {
      drawWhiteCanvas();
      $('prediction').textContent = '—';
      $('meterFill').style.width = '0%';
      $('confidence').textContent = 'Рука не найдена';
      setFeedback('Не вижу руку на фото', 'Загрузи чёткое фото одной руки целиком.', '↻');
      return;
    }
    const features = renderSkeleton(landmarks, image.width / image.height);
    if (!features) {
      setFeedback('Не удалось выделить руку', 'Попробуй другое фото с чётко видимыми пальцами.', '↻');
      return;
    }
    present(await classify(features), false, landmarks, image.width / image.height);
  } catch (error) {
    setFeedback('Не удалось проверить изображение', error.message, '!');
  } finally {
    image?.close();
    input.value = '';
    input.disabled = false;
    photoBusy = false;
  }
});

$('exampleButton').addEventListener('click', async () => {
  if (lessonIndex >= targets.length) return;
  const button = $('exampleButton');
  button.disabled = true;
  photoBusy = true;
  try {
    if (!model) model = await loadModel();
    if (!examples) {
      const response = await fetch('alphabet-examples.json');
      if (!response.ok) throw new Error('Образцы не загрузились');
      examples = await response.json();
    }
    const letter = targets[lessonIndex].letter;
    const features = examples[letter];
    if (!features) throw new Error(`Нет образца для буквы ${letter}`);
    const points = Array.from({ length: 21 }, (_, index) => ({ x: features[index], y: features[index + 21] }));
    renderSkeleton(points, 1);
    present(await classify(features), false, null, 1, true);
  } catch (error) {
    setFeedback('Не удалось проверить образец', error.message, '!');
  } finally {
    button.disabled = lessonIndex >= targets.length;
    photoBusy = false;
  }
});

$('resetButton').addEventListener('click', () => {
  lessonIndex = 0;
  completed.clear();
  steadyFrames = 0;
  resetMotion();
  updateLesson();
  setFeedback('Начинаем снова', 'Покажи букву А.', '✳');
});

window.addEventListener('practice-letter', (event) => {
  const index = alphabet.indexOf(event.detail);
  if (index < 0) return;
  lessonIndex = index;
  steadyFrames = 0;
  resetMotion();
  updateLesson();
  setFeedback(`Покажи букву ${event.detail}`, targets[index].hint);
});

drawWhiteCanvas();
updateLesson();
$('startButton').disabled = false;
$('imageInput').disabled = false;
$('exampleButton').disabled = false;
loadModel().then((loaded) => {
  model = loaded;
  setFeedback('Модель готова', 'Включи камеру, загрузи фото или проверь образец.');
}).catch((error) => setFeedback('Не удалось загрузить модель', error.message, '!'));
