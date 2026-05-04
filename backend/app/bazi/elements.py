HEAVENLY_STEMS = [
    {'index': 0, 'cn': '甲', 'pinyin': 'Jiǎ', 'en': 'Yang Wood', 'element': 'Wood', 'polarity': 'Yang'},
    {'index': 1, 'cn': '乙', 'pinyin': 'Yǐ',  'en': 'Yin Wood',  'element': 'Wood', 'polarity': 'Yin'},
    {'index': 2, 'cn': '丙', 'pinyin': 'Bǐng','en': 'Yang Fire', 'element': 'Fire', 'polarity': 'Yang'},
    {'index': 3, 'cn': '丁', 'pinyin': 'Dīng','en': 'Yin Fire',  'element': 'Fire', 'polarity': 'Yin'},
    {'index': 4, 'cn': '戊', 'pinyin': 'Wù',  'en': 'Yang Earth','element': 'Earth','polarity': 'Yang'},
    {'index': 5, 'cn': '己', 'pinyin': 'Jǐ',  'en': 'Yin Earth', 'element': 'Earth','polarity': 'Yin'},
    {'index': 6, 'cn': '庚', 'pinyin': 'Gēng','en': 'Yang Metal','element': 'Metal','polarity': 'Yang'},
    {'index': 7, 'cn': '辛', 'pinyin': 'Xīn', 'en': 'Yin Metal', 'element': 'Metal','polarity': 'Yin'},
    {'index': 8, 'cn': '壬', 'pinyin': 'Rén', 'en': 'Yang Water','element': 'Water','polarity': 'Yang'},
    {'index': 9, 'cn': '癸', 'pinyin': 'Guǐ','en': 'Yin Water', 'element': 'Water','polarity': 'Yin'},
]

EARTHLY_BRANCHES = [
    {'index': 0,  'cn': '子', 'pinyin': 'Zǐ',  'en': 'Rat',     'element': 'Water', 'polarity': 'Yang', 'hour_start': 23, 'hour_end': 1},
    {'index': 1,  'cn': '丑', 'pinyin': 'Chǒu','en': 'Ox',      'element': 'Earth', 'polarity': 'Yin',  'hour_start': 1,  'hour_end': 3},
    {'index': 2,  'cn': '寅', 'pinyin': 'Yín', 'en': 'Tiger',   'element': 'Wood',  'polarity': 'Yang', 'hour_start': 3,  'hour_end': 5},
    {'index': 3,  'cn': '卯', 'pinyin': 'Mǎo', 'en': 'Rabbit',  'element': 'Wood',  'polarity': 'Yin',  'hour_start': 5,  'hour_end': 7},
    {'index': 4,  'cn': '辰', 'pinyin': 'Chén','en': 'Dragon',  'element': 'Earth', 'polarity': 'Yang', 'hour_start': 7,  'hour_end': 9},
    {'index': 5,  'cn': '巳', 'pinyin': 'Sì',  'en': 'Snake',   'element': 'Fire',  'polarity': 'Yin',  'hour_start': 9,  'hour_end': 11},
    {'index': 6,  'cn': '午', 'pinyin': 'Wǔ',  'en': 'Horse',   'element': 'Fire',  'polarity': 'Yang', 'hour_start': 11, 'hour_end': 13},
    {'index': 7,  'cn': '未', 'pinyin': 'Wèi', 'en': 'Goat',    'element': 'Earth', 'polarity': 'Yin',  'hour_start': 13, 'hour_end': 15},
    {'index': 8,  'cn': '申', 'pinyin': 'Shēn','en': 'Monkey',  'element': 'Metal', 'polarity': 'Yang', 'hour_start': 15, 'hour_end': 17},
    {'index': 9,  'cn': '酉', 'pinyin': 'Yǒu', 'en': 'Rooster', 'element': 'Metal', 'polarity': 'Yin',  'hour_start': 17, 'hour_end': 19},
    {'index': 10, 'cn': '戌', 'pinyin': 'Xū',  'en': 'Dog',     'element': 'Earth', 'polarity': 'Yang', 'hour_start': 19, 'hour_end': 21},
    {'index': 11, 'cn': '亥', 'pinyin': 'Hài', 'en': 'Pig',     'element': 'Water', 'polarity': 'Yin',  'hour_start': 21, 'hour_end': 23},
]

# Hidden stems (藏干) — main, secondary, tertiary stem indices per branch
HIDDEN_STEMS = {
    0:  [9],           # 子: 癸
    1:  [5, 9, 7],     # 丑: 己癸辛
    2:  [0, 2, 4],     # 寅: 甲丙戊
    3:  [1],           # 卯: 乙
    4:  [4, 1, 9],     # 辰: 戊乙癸
    5:  [2, 6, 4],     # 巳: 丙庚戊
    6:  [3, 5],        # 午: 丁己
    7:  [5, 1, 3],     # 未: 己乙丁
    8:  [6, 8, 4],     # 申: 庚壬戊
    9:  [7],           # 酉: 辛
    10: [4, 7, 3],     # 戌: 戊辛丁
    11: [8, 0],        # 亥: 壬甲
}

# Five-element relationships
PRODUCTION = {'Wood': 'Fire', 'Fire': 'Earth', 'Earth': 'Metal', 'Metal': 'Water', 'Water': 'Wood'}
DESTRUCTION = {'Wood': 'Earth', 'Earth': 'Water', 'Water': 'Fire', 'Fire': 'Metal', 'Metal': 'Wood'}
ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']

ELEMENT_COLORS = {
    'Wood':  '#22c55e',
    'Fire':  '#ef4444',
    'Earth': '#f59e0b',
    'Metal': '#94a3b8',
    'Water': '#3b82f6',
}
