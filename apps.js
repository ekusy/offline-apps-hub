window.APPS = [
  {
    id: 'puzzle',
    emoji: '🧩',
    nameJa: '15パズル',
    nameEn: '15 Puzzle',
    descJa: '数字を順番に並べる定番のスライドパズル。',
    descEn: 'Classic sliding number puzzle. Arrange all numbers in order.',
    category: 'games',
    subcategory: 'puzzle',
    path: './apps/puzzle/',
    comingSoon: false
  },
  {
    id: 'water-sort',
    emoji: '🧪',
    nameJa: '水の並べ替えパズル',
    nameEn: 'Water Sort Puzzle',
    descJa: '試験管の色水を仕分けるパズル。お助け「スポイトツール」付き。',
    descEn: 'Sort colored water between tubes. Includes a unique pipette helper.',
    category: 'games',
    subcategory: 'puzzle',
    path: './apps/water-sort/',
    comingSoon: false
  },
  {
    id: 'sudoku',
    emoji: '🔢',
    nameJa: '数独',
    nameEn: 'Sudoku',
    descJa: '1〜9 を行・列・3×3 ブロックに重複なく配置するパズル。',
    descEn: 'Classic 9x9 number placement puzzle with notes and difficulty levels.',
    category: 'games',
    subcategory: 'puzzle',
    path: './apps/sudoku/',
    comingSoon: false
  },
  {
    id: 'tower-defense',
    emoji: '🏰',
    nameJa: 'タワーディフェンス',
    nameEn: 'Tower Defense',
    descJa: 'タワーを配置して 10 ウェーブの敵から拠点を守るリアルタイム戦略ゲーム。',
    descEn: 'Place towers to defend against 10 waves of enemies in real-time.',
    category: 'games',
    subcategory: 'strategy',
    path: './apps/tower-defense/',
    comingSoon: false
  },
  {
    id: 'dungeon',
    emoji: '🗡️',
    nameJa: 'ダンジョンクローラー',
    nameEn: 'Dungeon Crawler',
    descJa: '7×7 グリッドのターンベース RPG。10 階のダンジョンを踏破せよ。',
    descEn: 'Turn-based grid RPG. Conquer the 10-floor dungeon.',
    category: 'games',
    subcategory: 'rpg',
    path: './apps/dungeon/',
    comingSoon: false
  },
  {
    id: 'card-battle',
    emoji: '🎴',
    nameJa: 'カードバトル',
    nameEn: 'Card Battle',
    descJa: '8 枚のデッキを組んで AI と対戦するデッキ構築型カードバトル。',
    descEn: 'Build an 8-card deck and battle the AI through 5 stages.',
    category: 'games',
    subcategory: 'cards',
    path: './apps/card-battle/',
    comingSoon: false
  },
  {
    id: 'coming-soon',
    emoji: '🎯',
    nameJa: '近日公開',
    nameEn: 'Coming Soon',
    descJa: '新しいアプリを追加予定。お楽しみに！',
    descEn: 'More apps will be added soon. Check back later!',
    category: 'placeholder',
    subcategory: 'placeholder',
    path: null,
    comingSoon: true
  }
];

window.CATEGORIES = {
  all:         { ja: 'すべて',         en: 'All' },
  games:       { ja: 'ゲーム',         en: 'Games' },
  utilities:   { ja: 'ユーティリティ', en: 'Utilities' },
  placeholder: { ja: 'その他',         en: 'Other' }
};

window.SUBCATEGORIES = {
  all:         { ja: 'すべて',     en: 'All' },
  puzzle:      { ja: 'パズル',     en: 'Puzzle' },
  strategy:    { ja: 'ストラテジー', en: 'Strategy' },
  rpg:         { ja: 'RPG',         en: 'RPG' },
  cards:       { ja: 'カード',     en: 'Cards' },
  calculator:  { ja: '計算',       en: 'Calculator' },
  placeholder: { ja: '近日公開',   en: 'Coming Soon' }
};
