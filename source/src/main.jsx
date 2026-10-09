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
  { id: 'begat', word: 'Бегать', category: 'Движение', example: 'Я бегаю по утрам.', url: 'https://signflow.ru/begat' },
  { id: 'sidet', word: 'Сидеть', category: 'Движение', example: 'Я сижу здесь.', url: 'https://signflow.ru/sidet' },
  { id: 'stoyat', word: 'Стоять', category: 'Движение', example: 'Я стою у двери.', url: 'https://signflow.ru/stoyat' },
  { id: 'lezhat', word: 'Лежать', category: 'Каждый день', example: 'Книга лежит на столе.', url: 'https://signflow.ru/lezhat' },
  { id: 'saditsya', word: 'Садиться', category: 'Движение', example: 'Пожалуйста, садись.', url: 'https://signflow.ru/saditsya' },
  { id: 'prikhodit', word: 'Приходить', category: 'Движение', example: 'Он приходит вовремя.', url: 'https://signflow.ru/prikhodit' },
  { id: 'otvechat', word: 'Отвечать', category: 'Общение', example: 'Ответь на вопрос.', url: 'https://signflow.ru/otvechat' },
  { id: 'sprashivat', word: 'Спрашивать', category: 'Общение', example: 'Можно спросить?', url: 'https://signflow.ru/sprashivat' },
  { id: 'pokazyvat', word: 'Показывать', category: 'Общение', example: 'Покажи мне дорогу.', url: 'https://signflow.ru/pokazyvat' },
  { id: 'dumat', word: 'Думать', category: 'Мысли', example: 'Мне нужно подумать.', url: 'https://signflow.ru/dumat' },
  { id: 'znat', word: 'Знать', category: 'Мысли', example: 'Я знаю ответ.', url: 'https://signflow.ru/znat' },
  { id: 'ponimat', word: 'Понимать', category: 'Мысли', example: 'Я тебя понимаю.', url: 'https://signflow.ru/ponimat' },
  { id: 'pomnit', word: 'Помнить', category: 'Мысли', example: 'Я помню этот день.', url: 'https://signflow.ru/pomnit' },
  { id: 'zabyvat', word: 'Забывать', category: 'Мысли', example: 'Не забывай книгу.', url: 'https://signflow.ru/zabyvat' },
  { id: 'videt', word: 'Видеть', category: 'Каждый день', example: 'Я вижу тебя.', url: 'https://signflow.ru/videt' },
  { id: 'iskat', word: 'Искать', category: 'Каждый день', example: 'Я ищу ключи.', url: 'https://signflow.ru/iskat' },
  { id: 'nakhodit', word: 'Находить', category: 'Каждый день', example: 'Я нахожу нужную страницу.', url: 'https://signflow.ru/nakhodit' },
  { id: 'dat', word: 'Дать', category: 'Каждый день', example: 'Дай мне книгу.', url: 'https://signflow.ru/dat' },
  { id: 'otkryt', word: 'Открыть', category: 'Каждый день', example: 'Открой дверь.', url: 'https://signflow.ru/otkryt' },
  { id: 'zakryt', word: 'Закрыть', category: 'Каждый день', example: 'Закрой окно.', url: 'https://signflow.ru/zakryt' },
  { id: 'nachat', word: 'Начать', category: 'Каждый день', example: 'Начнём урок.', url: 'https://signflow.ru/nachat' },
  { id: 'zakonchit', word: 'Закончить', category: 'Каждый день', example: 'Пора закончить работу.', url: 'https://signflow.ru/zakonchit' },
  { id: 'delat', word: 'Делать', category: 'Каждый день', example: 'Что ты делаешь?', url: 'https://signflow.ru/delat' },
  { id: 'ubirat', word: 'Убирать', category: 'Каждый день', example: 'Я убираю комнату.', url: 'https://signflow.ru/ubirat' },
  { id: 'odevat', word: 'Одевать', category: 'Каждый день', example: 'Я одеваю ребёнка.', url: 'https://signflow.ru/odevat' },
  { id: 'est', word: 'Есть', category: 'Каждый день', example: 'Я хочу есть.', url: 'https://signflow.ru/est' },
  { id: 'platit', word: 'Платить', category: 'Покупки', example: 'Я плачу за билет.', url: 'https://signflow.ru/platit' },
  { id: 'prodavat', word: 'Продавать', category: 'Покупки', example: 'Они продают книги.', url: 'https://signflow.ru/prodavat' },
  { id: 'vstrechat', word: 'Встречать', category: 'Общение', example: 'Я встречаю друга.', url: 'https://signflow.ru/vstrechat' },
  { id: 'ulybatsya', word: 'Улыбаться', category: 'Общение', example: 'Она улыбается.', url: 'https://signflow.ru/ulybatsya' },
  { id: 'smeyatsya', word: 'Смеяться', category: 'Общение', example: 'Мы смеёмся вместе.', url: 'https://signflow.ru/smeyatsya' },
  { id: 'pet', word: 'Петь', category: 'Досуг', example: 'Я люблю петь.', url: 'https://signflow.ru/pet' },
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
  { id: 'kto', word: 'Кто', category: 'Вопросы', example: 'Кто это?', url: 'https://signflow.ru/kto' },
  { id: 'kogda', word: 'Когда', category: 'Вопросы', example: 'Когда начнём?', url: 'https://signflow.ru/kogda' },
  { id: 'pochemu', word: 'Почему', category: 'Вопросы', example: 'Почему ты грустишь?', url: 'https://signflow.ru/pochemu' },
  { id: 'kak', word: 'Как', category: 'Вопросы', example: 'Как дела?', url: 'https://signflow.ru/kak' },
  { id: 'mozhno', word: 'Можно', category: 'Общение', example: 'Можно войти?', url: 'https://signflow.ru/mozhno' },
  { id: 'imya', word: 'Имя', category: 'Знакомство', example: 'Моё имя — Алия.', url: 'https://signflow.ru/imya' },
  { id: 'vremya', word: 'Время', category: 'Время', example: 'Сколько сейчас времени?', url: 'https://signflow.ru/vremya' },
  { id: 'utro', word: 'Утро', category: 'Время', example: 'Доброе утро!', url: 'https://signflow.ru/utro' },
  { id: 'vecher', word: 'Вечер', category: 'Время', example: 'Добрый вечер!', url: 'https://signflow.ru/vecher' },
  { id: 'vchera', word: 'Вчера', category: 'Время', example: 'Вчера мы встречались.', url: 'https://signflow.ru/vchera' },
  { id: 'seychas', word: 'Сейчас', category: 'Время', example: 'Я приду сейчас.', url: 'https://signflow.ru/seychas' },
  { id: 'skoro', word: 'Скоро', category: 'Время', example: 'Скоро начнётся урок.', url: 'https://signflow.ru/skoro' },
  { id: 'brat', word: 'Брат', category: 'Люди', example: 'Это мой брат.', url: 'https://signflow.ru/brat' },
  { id: 'sestra', word: 'Сестра', category: 'Люди', example: 'Моя сестра учится.', url: 'https://signflow.ru/sestra' },
  { id: 'babushka', word: 'Бабушка', category: 'Люди', example: 'Бабушка дома.', url: 'https://signflow.ru/babushka' },
  { id: 'dedushka', word: 'Дедушка', category: 'Люди', example: 'Дедушка любит читать.', url: 'https://signflow.ru/dedushka' },
  { id: 'deti', word: 'Дети', category: 'Люди', example: 'Дети играют.', url: 'https://signflow.ru/deti' },
  { id: 'park', word: 'Парк', category: 'Места', example: 'Пойдём в парк.', url: 'https://signflow.ru/park' },
  { id: 'biblioteka', word: 'Библиотека', category: 'Места', example: 'Библиотека рядом.', url: 'https://signflow.ru/biblioteka' },
  { id: 'metro', word: 'Метро', category: 'Места', example: 'Я еду на метро.', url: 'https://signflow.ru/metro' },
  { id: 'ostanovka', word: 'Остановка', category: 'Места', example: 'Где остановка?', url: 'https://signflow.ru/ostanovka' },
  { id: 'vokzal', word: 'Вокзал', category: 'Места', example: 'Вокзал недалеко.', url: 'https://signflow.ru/vokzal' },
  { id: 'kniga', word: 'Книга', category: 'Учёба и быт', example: 'Это моя книга.', url: 'https://signflow.ru/kniga' },
  { id: 'telefon', word: 'Телефон', category: 'Учёба и быт', example: 'Где мой телефон?', url: 'https://signflow.ru/telefon' },
  { id: 'stol', word: 'Стол', category: 'Учёба и быт', example: 'Книга лежит на столе.', url: 'https://signflow.ru/stol' },
  { id: 'dver', word: 'Дверь', category: 'Учёба и быт', example: 'Закрой дверь.', url: 'https://signflow.ru/dver' },
  { id: 'khleb', word: 'Хлеб', category: 'Еда', example: 'Купи хлеб.', url: 'https://signflow.ru/khleb' },
  { id: 'moloko', word: 'Молоко', category: 'Еда', example: 'Мне нужно молоко.', url: 'https://signflow.ru/moloko' },
  { id: 'chay', word: 'Чай', category: 'Еда', example: 'Будешь чай?', url: 'https://signflow.ru/chay' },
  { id: 'yabloko', word: 'Яблоко', category: 'Еда', example: 'Я хочу яблоко.', url: 'https://signflow.ru/yabloko' },
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
  const [visibleCount, setVisibleCount] = useState(12)
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
                <label className="vocab-search"><Search size={17} /><input type="search" value={currentSearch} onChange={(event) => { setSearch(event.target.value); setVisibleCount(12) }} placeholder="Найти жест или пример" aria-label={'Поиск в разделе ' + (tab === 'actions' ? 'действий' : 'слов')} /></label>
                <span className="vocab-count">Показано: {Math.min(visibleCount, visibleItems.length)} из {visibleItems.length}</span>
              </div>
              <div className="vocab-categories" aria-label="Темы">
                {categories.map((item) => <button type="button" className={'category-chip' + (currentCategory === item ? ' active' : '')} aria-pressed={currentCategory === item} onClick={() => { setCategory(item); setVisibleCount(12) }} key={item}>{item}</button>)}
              </div>
              {visibleItems.length ? (
                <div className="actions-grid">
                  {visibleItems.slice(0, visibleCount).map((item) => {
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
              {visibleItems.length > visibleCount && <button className="vocab-more" type="button" onClick={() => setVisibleCount((count) => count + 12)}>Показать ещё <span>Осталось {visibleItems.length - visibleCount}</span></button>}
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
