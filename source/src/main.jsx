import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowUpRight, Camera, Check, CircleHelp, Hand, ImagePlus, RotateCcw, ScanLine, Search, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import './index.css'

const letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')
const imageNames = 'a b v g d e - zh z i j k l m n o p r s t u f h ts ch sh shch tvjordyj-znak y myagkij-znak ee yu ya'.split(' ')
const motionLetters = new Set(['Д', 'Ё', 'Й', 'К', 'Щ', 'Ъ', 'Ь'])
const movementHelp = {
  'Д': 'Выпрями и соедини указательный со средним, остальные пальцы согни. Затем нарисуй двумя пальцами маленький круг в воздухе.',
  'Ё': 'Сложи пальцы как для Е, затем поверни кисть влево и вправо.',
  'Й': 'Покажи форму И: безымянный палец и мизинец вверх, указательный и средний согнуты. Затем поверни кисть дугой в сторону.',
  'К': 'Выпрями и слегка разведи указательный и средний пальцы. Согни безымянный и мизинец, затем коротко опусти кисть вниз.',
  'Щ': 'Покажи форму Ш, затем коротко опусти кисть вниз.',
  'Ъ': 'Сложи пальцы как для Г. Слегка наклони кисть: указательный палец уходит к тебе, от камеры.',
  'Ь': 'Сложи пальцы как для Г. Слегка наклони кисть: указательный палец уходит от тебя, к камере.',
}
const movementLabels = { 'Д': 'Круг двумя пальцами', 'Ё': 'Поворот туда и обратно', 'Й': 'Поворот кисти', 'К': 'Кисть вниз', 'Щ': 'Кисть вниз', 'Ъ': 'Наклон к себе', 'Ь': 'Наклон от себя' }
const movementSymbols = { 'Д': '◌', 'Ё': '↔', 'Й': '↶', 'К': '↓', 'Щ': '↓', 'Ъ': '•', 'Ь': '•' }
const actions = [
  { id: 'pit', word: 'Пить', category: 'Каждый день', example: 'Я хочу пить.', url: 'https://signflow.ru/pit' },
  { id: 'spat', word: 'Спать', category: 'Каждый день', example: 'Пора спать.', url: 'https://signflow.ru/spat' },
  { id: 'myt', word: 'Мыть', category: 'Каждый день', example: 'Я мою руки.', url: 'https://signflow.ru/myt' },
  { id: 'idti', word: 'Идти', category: 'Движение', example: 'Я иду домой.', url: 'https://signflow.ru/idti' },
  { id: 'pisat', word: 'Писать', category: 'Учёба', example: 'Я пишу письмо.', url: 'https://signflow.ru/pisat' },
  { id: 'kupit', word: 'Купить', category: 'Покупки', example: 'Я хочу купить воду.', url: 'https://signflow.ru/kupit' },
  { id: 'chitat', word: 'Читать', category: 'Учёба', example: 'Я читаю книгу.', url: 'https://signflow.ru/chitat' },
  { id: 'smotret', word: 'Смотреть', category: 'Каждый день', example: 'Давай посмотрим фильм.', url: 'https://signflow.ru/smotret' },
  { id: 'govorit', word: 'Говорить', category: 'Общение', example: 'Можно с тобой поговорить?', url: 'https://signflow.ru/govorit' },
  { id: 'slushat', word: 'Слушать', category: 'Общение', example: 'Я внимательно слушаю.', url: 'https://signflow.ru/slushat' },
  { id: 'rabotat', word: 'Работать', category: 'Учёба и работа', example: 'Я сегодня работаю.', url: 'https://signflow.ru/rabotat' },
  { id: 'uchitsya', word: 'Учиться', category: 'Учёба и работа', example: 'Я учусь каждый день.', url: 'https://signflow.ru/uchitsya' },
  { id: 'pomogat', word: 'Помогать', category: 'Общение', example: 'Я могу тебе помочь.', url: 'https://signflow.ru/pomogat' },
  { id: 'zhdat', word: 'Ждать', category: 'Каждый день', example: 'Я буду ждать здесь.', url: 'https://signflow.ru/zhdat' },
  { id: 'igrat', word: 'Играть', category: 'Досуг', example: 'Дети любят играть.', url: 'https://signflow.ru/igrat' },
  { id: 'gotovit', word: 'Готовить', category: 'Каждый день', example: 'Я готовлю ужин.', url: 'https://signflow.ru/gotovit' },
  { id: 'risovat', word: 'Рисовать', category: 'Досуг', example: 'Я люблю рисовать.', url: 'https://signflow.ru/risovat' },
  { id: 'lyubit', word: 'Любить', category: 'Общение', example: 'Я люблю свою семью.', url: 'https://signflow.ru/lyubit' },
]

const words = [
  { id: 'privet', word: 'Привет', category: 'Знакомство', example: 'Привет! Рад тебя видеть.', url: 'https://signflow.ru/privet' },
  { id: 'zdravstvuyte', word: 'Здравствуйте', category: 'Знакомство', example: 'Здравствуйте, как дела?', url: 'https://signflow.ru/zdravstvuyte' },
  { id: 'poka', word: 'Пока', category: 'Знакомство', example: 'Пока, до встречи!', url: 'https://signflow.ru/poka' },
  { id: 'spasibo', word: 'Спасибо', category: 'Вежливость', example: 'Спасибо за помощь.', url: 'https://signflow.ru/spasibo' },
  { id: 'pozhaluysta', word: 'Пожалуйста', category: 'Вежливость', example: 'Пожалуйста, проходи.', url: 'https://signflow.ru/pozhaluysta' },
  { id: 'izvinite', word: 'Извините', category: 'Вежливость', example: 'Извините, где магазин?', url: 'https://signflow.ru/izvinite' },
  { id: 'da', word: 'Да', category: 'Общение', example: 'Да, я согласен.', url: 'https://signflow.ru/da' },
  { id: 'net', word: 'Нет', category: 'Общение', example: 'Нет, спасибо.', url: 'https://signflow.ru/net' },
  { id: 'khorosho', word: 'Хорошо', category: 'Общение', example: 'Хорошо, договорились.', url: 'https://signflow.ru/khorosho' },
  { id: 'gde', word: 'Где', category: 'Общение', example: 'Где находится школа?', url: 'https://signflow.ru/gde' },
  { id: 'chto', word: 'Что', category: 'Общение', example: 'Что это?', url: 'https://signflow.ru/chto' },
  { id: 'drug', word: 'Друг', category: 'Люди', example: 'Это мой друг.', url: 'https://signflow.ru/drug' },
  { id: 'semya', word: 'Семья', category: 'Люди', example: 'Моя семья дома.', url: 'https://signflow.ru/semya' },
  { id: 'mama', word: 'Мама', category: 'Люди', example: 'Мама скоро придёт.', url: 'https://signflow.ru/mama' },
  { id: 'papa', word: 'Папа', category: 'Люди', example: 'Папа на работе.', url: 'https://signflow.ru/papa' },
  { id: 'pomoshch', word: 'Помощь', category: 'Важное', example: 'Мне нужна помощь.', url: 'https://signflow.ru/pomoshch' },
  { id: 'vrach', word: 'Врач', category: 'Важное', example: 'Мне нужен врач.', url: 'https://signflow.ru/vrach' },
  { id: 'shkola', word: 'Школа', category: 'Места', example: 'Где находится школа?', url: 'https://signflow.ru/shkola' },
  { id: 'magazin', word: 'Магазин', category: 'Места', example: 'Магазин рядом.', url: 'https://signflow.ru/magazin' },
  { id: 'avtobus', word: 'Автобус', category: 'Места', example: 'Когда придёт автобус?', url: 'https://signflow.ru/avtobus' },
]

const vocabulary = {
  actions: { items: actions, title: 'Учись показывать действия.', intro: 'Повседневные глаголы для общения, учёбы и досуга. Посмотри видео, повтори жест и используй его в короткой фразе.', eyebrow: 'Жесты действий', heading: 'Действия на каждый день' },
  words: { items: words, title: 'Начни говорить жестами.', intro: 'Приветствия, важные слова и простые вопросы. Выбери тему, посмотри жест и попробуй использовать его в разговоре.', eyebrow: 'Словарь слов', heading: 'Слова для первого разговора' },
}

function readStudied(key, items) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(saved) ? saved.filter((id) => items.some((item) => item.id === id)) : []
  } catch { return [] }
}

function App() {
  const [selected, setSelected] = useState(0)
  const [activeTab, setActiveTab] = useState('alphabet')
  const [studiedActions, setStudiedActions] = useState(() => readStudied('fingram-studied-actions', actions))
  const [studiedWords, setStudiedWords] = useState(() => readStudied('fingram-studied-words', words))
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Все')
  const selectedLetter = letters[selected]
  const selectedImage = imageNames[selected]
  const chooseTab = (tab) => {
    window.dispatchEvent(new Event(tab === 'alphabet' ? 'resume-letter-page' : 'pause-letter-camera'))
    setActiveTab(tab)
    setSearch('')
    setCategory('Все')
  }
  const toggleStudied = (tab, id) => {
    const setStudied = tab === 'actions' ? setStudiedActions : setStudiedWords
    setStudied((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      try { localStorage.setItem('fingram-studied-' + tab, JSON.stringify(next)) } catch { /* Storage may be unavailable. */ }
      return next
    })
  }
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = './app.js'
    document.body.append(script)
    return () => script.remove()
  }, [])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Hand size={20} strokeWidth={2.2} /></span>Fingram</div>
        <div className="topbar-right">
          <span className="topbar-note">Изучай русский жестовый язык</span>
          <Badge variant="outline">{activeTab === 'alphabet' ? 'Алфавит · 33 буквы' : activeTab === 'actions' ? 'Действия · ' + actions.length + ' жестов' : 'Слова · ' + words.length + ' жестов'}</Badge>
        </div>
      </header>

      <main>
        <nav className="course-tabs" role="tablist" aria-label="Разделы обучения">
          <button id="alphabet-tab" type="button" role="tab" aria-selected={activeTab === 'alphabet'} aria-controls="alphabet-panel" className={activeTab === 'alphabet' ? 'active' : ''} onClick={() => chooseTab('alphabet')}>Алфавит <span>33 буквы</span></button>
          <button id="actions-tab" type="button" role="tab" aria-selected={activeTab === 'actions'} aria-controls="actions-panel" className={activeTab === 'actions' ? 'active' : ''} onClick={() => chooseTab('actions')}>Действия <span>{actions.length} жестов</span></button>
          <button id="words-tab" type="button" role="tab" aria-selected={activeTab === 'words'} aria-controls="words-panel" className={activeTab === 'words' ? 'active' : ''} onClick={() => chooseTab('words')}>Слова <span>{words.length} жестов</span></button>
        </nav>
        <div id="alphabet-panel" role="tabpanel" aria-labelledby="alphabet-tab" hidden={activeTab !== 'alphabet'}>
        <section className="intro">
          <div className="intro-copy">
            <div className="eyebrow"><Sparkles size={15} /> Учись жестам с камерой</div>
            <h1>Покажи букву — получи ответ.</h1>
            <p>Изучи весь русский дактильный алфавит. Камера определяет форму руки для всех букв и подсказывает, какой палец поправить.</p>
          </div>
          <div className="intro-side"><CircleHelp size={16} /> 33 буквы · подсказки по пальцам</div>
        </section>

        <section className="lesson" aria-label="Урок">
          <Card className="lesson-card target-card">
            <CardContent className="lesson-card-body">
              <div className="card-head"><span>Твоё задание</span><Badge id="counter" variant="secondary">1 / 33</Badge></div>
              <div className="target-letter" id="targetLetter">А</div>
              <p className="target-title" id="targetTitle">Покажи букву А</p>
              <div className="reference"><img id="reference" className="upright-a" src="./references/alphabet/a.png" alt="Образец жеста А" /><span>Образец жеста</span></div>
              <p className="tiny" id="targetHint">Сожми пальцы в кулак, большой палец положи поверх. Держи запястье снизу, как на рисунке.</p>
            </CardContent>
          </Card>

          <Card className="lesson-card camera-card">
            <CardContent className="lesson-card-body">
              <div className="card-head"><span>Практика с камерой</span><span><i className="status-dot" /><span id="cameraState">Выключена</span></span></div>
              <div className="video-wrap">
                <video id="video" autoPlay playsInline muted />
                <div className="video-placeholder" id="videoPlaceholder"><span className="placeholder-icon"><Camera size={24} /></span><span>Включи камеру, чтобы начать практику</span></div>
                <div className="video-pill" id="videoPill">Ожидание руки</div>
              </div>
              <div className="camera-actions">
                <Button id="startButton" type="button" className="primary-action" disabled><Camera size={16} /> Включить камеру</Button>
                <label className="upload-button"><ImagePlus size={16} /> Загрузить фото <input id="imageInput" type="file" accept="image/*" disabled /></label>
                <Button id="exampleButton" type="button" variant="outline" disabled><ScanLine size={16} /> Проверить образец</Button>
              </div>
              <div className="feedback" aria-live="polite">
                <div className="feedback-icon" id="feedbackIcon">✳</div>
                <div><strong id="feedbackTitle">Готовимся к уроку</strong><p id="feedbackText">Загрузка модели…</p></div>
              </div>
            </CardContent>
          </Card>

          <Card className="lesson-card analysis-card">
            <CardContent className="lesson-card-body">
              <div className="card-head"><span>Анализ жеста</span><ScanLine size={17} /></div>
              <div className="analysis-stage"><canvas id="skeleton" width="192" height="192" aria-label="Контур обнаруженной руки" /></div>
              <div className="prediction"><span>Распознано</span><strong id="prediction">—</strong></div>
              <div className="meter"><span id="meterFill" /></div>
              <p className="tiny" id="confidence">Наведите руку на камеру</p>
            </CardContent>
          </Card>
        </section>

        <section className="alphabet-section" aria-label="Русский дактильный алфавит">
          <div className="alphabet-heading"><div><span className="eyebrow">Справочник жестов</span><h2>Весь алфавит</h2></div><Badge variant="secondary">33 буквы</Badge></div>
          <p className="alphabet-intro">Выбери букву и нажми «Тренировать». Для Д, Ё, Й, К, Щ, Ъ и Ь нужна камера: одно фото не показывает движение.</p>
          <div className="alphabet-layout">
            <div className="alphabet-grid">
              {letters.map((letter, index) => (
                <button key={letter} className={`alphabet-key ${selected === index ? 'selected' : ''}`} type="button" onClick={() => setSelected(index)} aria-pressed={selected === index} aria-label={`Буква ${letter}`}>
                  <strong>{letter}</strong><span>{movementSymbols[letter] || ''}</span>
                </button>
              ))}
            </div>
            <Card className="alphabet-preview"><CardContent className="alphabet-preview-body">
              <div className="alphabet-preview-top"><strong>{selectedLetter}</strong><Badge variant={motionLetters.has(selectedLetter) ? 'secondary' : 'default'}>{motionLetters.has(selectedLetter) ? 'Нужна камера и движение' : 'Можно проверить камерой'}</Badge></div>
              <img className={selectedLetter === 'А' ? 'upright-a' : undefined} src={`./references/alphabet/${selectedImage === '-' ? 'e' : selectedImage}.png`} alt={`Положение руки для буквы ${selectedLetter}${selectedLetter === 'Ё' ? ' (основа жеста Е)' : ''}`} />
              {movementHelp[selectedLetter] && <div className="motion-note"><strong>{movementLabels[selectedLetter]}</strong><span>{movementHelp[selectedLetter]}</span></div>}
              <p className="alphabet-caption">Рисунки: <a href="https://abvgdee.ru/alfavity/gluhonemyh" target="_blank" rel="noreferrer">Русский алфавит</a>. {selectedLetter === 'Ё' ? <>Движение Ё: <a href="https://infourok.ru/daktilnaya-azbuka-v-stihah-shag-navstrechu-5751737.html" target="_blank" rel="noreferrer">учебное описание</a>.</> : 'Для некоторых букв важно движение кисти.'}</p>
              <Button className="practice-selected" type="button" onClick={() => { window.dispatchEvent(new CustomEvent('practice-letter', { detail: selectedLetter })); document.querySelector('.lesson')?.scrollIntoView({ behavior: 'smooth' }) }}><Camera size={15} /> Тренировать букву {selectedLetter}</Button>
            </CardContent></Card>
          </div>
        </section>

        <section className="progress-section" aria-label="Прогресс урока">
          <div className="progress-heading"><h2>Твой прогресс</h2><span id="progressCount">0 из 33</span></div>
          <div className="progress-track"><span id="progressFill" /></div>
          <Button id="resetButton" type="button" variant="outline" className="reset-button" hidden><RotateCcw size={15} /> Пройти снова</Button>
        </section>
        </div>

        {Object.entries(vocabulary).map(([tab, config]) => {
          const studied = tab === 'actions' ? studiedActions : studiedWords
          const categories = ['Все', ...new Set(config.items.map((item) => item.category))]
          const currentSearch = activeTab === tab ? search : ''
          const currentCategory = activeTab === tab ? category : 'Все'
          const visibleItems = config.items.filter((item) =>
            (currentCategory === 'Все' || item.category === currentCategory) &&
            (item.word + ' ' + item.example).toLocaleLowerCase('ru').includes(currentSearch.trim().toLocaleLowerCase('ru'))
          )
          return (
            <div id={tab + '-panel'} role="tabpanel" aria-labelledby={tab + '-tab'} hidden={activeTab !== tab} key={tab}>
              <section className="intro actions-intro">
                <div className="intro-copy">
                  <div className="eyebrow"><Sparkles size={15} /> {config.eyebrow}</div>
                  <h1>{config.title}</h1>
                  <p>{config.intro}</p>
                </div>
                <div className="intro-side"><Check size={16} /> {studied.length} из {config.items.length} изучено</div>
              </section>
              <section className="actions-guide" aria-label="Как заниматься">
                <div><span>1</span><strong>Посмотри видео</strong><p>Обрати внимание на обе руки, направление и движение.</p></div>
                <div><span>2</span><strong>Повтори жест</strong><p>Покажи его медленно, затем в обычном темпе.</p></div>
                <div><span>3</span><strong>Используй в примере</strong><p>Свяжи жест с короткой фразой и отметь как изученный.</p></div>
              </section>
              <div className="actions-heading">
                <div><span className="eyebrow">{config.eyebrow}</span><h2>{config.heading}</h2></div>
                <Badge variant="secondary">{studied.length} / {config.items.length} изучено</Badge>
              </div>
              <div className="vocab-controls">
                <label className="vocab-search"><Search size={17} /><input type="search" value={currentSearch} onChange={(event) => setSearch(event.target.value)} placeholder="Найти жест или пример" aria-label={'Поиск в разделе ' + (tab === 'actions' ? 'действий' : 'слов')} /></label>
                <span className="vocab-count">Найдено: {visibleItems.length}</span>
              </div>
              <div className="vocab-categories" aria-label="Темы">
                {categories.map((item) => <button type="button" className={'category-chip' + (currentCategory === item ? ' active' : '')} aria-pressed={currentCategory === item} onClick={() => setCategory(item)} key={item}>{item}</button>)}
              </div>
              {visibleItems.length ? (
                <div className="actions-grid">
                  {visibleItems.map((item) => {
                    const isStudied = studied.includes(item.id)
                    return <Card className={'action-card' + (isStudied ? ' studied' : '')} key={item.id}><CardContent className="action-card-body">
                      <div className="action-card-top"><span className="action-number">{String(config.items.indexOf(item) + 1).padStart(2, '0')}</span><Badge variant="secondary">{item.category}</Badge></div>
                      <h3>{item.word}</h3>
                      <p className="action-example">«{item.example}»</p>
                      <div className="action-card-buttons">
                        <a className="action-video" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={'Смотреть видео жеста ' + item.word + ' в словаре Signflow'}>Смотреть жест <ArrowUpRight size={16} /></a>
                        <button className={'action-check' + (isStudied ? ' done' : '')} type="button" aria-pressed={isStudied} onClick={() => toggleStudied(tab, item.id)}><Check size={15} /> {isStudied ? 'Изучено' : 'Отметить'}</button>
                      </div>
                    </CardContent></Card>
                  })}
                </div>
              ) : <p className="vocab-empty">Жесты не найдены. Попробуй другое слово или выбери «Все».</p>}
              <p className="actions-note">Видео открываются в <a href="https://signflow.ru/about" target="_blank" rel="noopener noreferrer">словаре Signflow</a>. Жесты слов отличаются от букв дактильного алфавита. Проверка слов и действий камерой пока не доступна; отметка «Изучено» ставится вручную.</p>
            </div>
          )
        })}
      </main>
      <Separator />
      <footer>Fingram · рисунки алфавита: <a href="https://abvgdee.ru/alfavity/gluhonemyh" target="_blank" rel="noreferrer">abvgdee.ru</a> · модель букв: <a href="https://github.com/Blockbattle/RSL-Dataset" target="_blank" rel="noreferrer">RSL-Dataset</a> · видео слов и действий: <a href="https://signflow.ru/about" target="_blank" rel="noreferrer">Signflow</a></footer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
