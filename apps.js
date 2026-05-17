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
  calculator:  { ja: '計算',       en: 'Calculator' },
  placeholder: { ja: '近日公開',   en: 'Coming Soon' }
};
