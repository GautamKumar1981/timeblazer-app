ELEMENT_REMEDIES = {
    'Wood': {
        'element': 'Wood',
        'emoji': '🌿',
        'crystals': ['Green Aventurine', 'Malachite', 'Moss Agate'],
        'colors': ['Forest Green', 'Emerald', 'Teal'],
        'direction': 'East',
        'foods': ['Leafy greens', 'Sour citrus fruits', 'Broccoli', 'Sprouts'],
        'activities': ['Walk in nature', 'Gardening', 'Creative writing', 'Yoga stretches'],
        'affirmation': 'I grow with grace and purpose, reaching toward the light.',
        'feng_shui_tip': 'Place a healthy plant in the East of your home or desk. Water it today.',
        'avoid': ['Conflict, excessive rigidity, suppressing creativity'],
    },
    'Fire': {
        'element': 'Fire',
        'emoji': '🔥',
        'crystals': ['Carnelian', 'Red Jasper', 'Garnet'],
        'colors': ['Vermillion', 'Crimson', 'Bright Orange'],
        'direction': 'South',
        'foods': ['Red berries', 'Hawthorn tea', 'Warming spices', 'Bitter greens'],
        'activities': ['Cardio exercise', 'Social gatherings', 'Public speaking', 'Dancing'],
        'affirmation': 'My inner fire lights the way for myself and all around me.',
        'feng_shui_tip': 'Light a candle in the South sector. Use red accents in your workspace today.',
        'avoid': ['Isolation, overworking alone, excessive cold foods or drinks'],
    },
    'Earth': {
        'element': 'Earth',
        'emoji': '⛰️',
        'crystals': ["Tiger's Eye", 'Yellow Jasper', 'Citrine'],
        'colors': ['Golden Yellow', 'Ochre', 'Terracotta'],
        'direction': 'Center',
        'foods': ['Root vegetables', 'Sweet potato', 'Yellow fruits', 'Miso soup'],
        'activities': ['Grounding meditation', 'Home organisation', 'Cooking', 'Tai Chi'],
        'affirmation': 'I am rooted, stable, and deeply connected to the abundant Earth.',
        'feng_shui_tip': 'Declutter the centre of your home. Place crystals on a yellow cloth to ground energy.',
        'avoid': ['Excessive worry, overthinking, skipping meals'],
    },
    'Metal': {
        'element': 'Metal',
        'emoji': '⚙️',
        'crystals': ['Clear Quartz', 'White Jade', 'Howlite'],
        'colors': ['White', 'Gold', 'Silver', 'Pearl'],
        'direction': 'West',
        'foods': ['Pear', 'White rice', 'Ginger tea', 'Pungent herbs'],
        'activities': ['Decluttering', 'Precision crafts', 'Breath-work', 'Journaling'],
        'affirmation': 'I release what no longer serves me, refined and clear as precious metal.',
        'feng_shui_tip': 'Clear and organise the West corner of your space. Remove broken items.',
        'avoid': ['Holding grudges, clutter, making impulsive commitments'],
    },
    'Water': {
        'element': 'Water',
        'emoji': '💧',
        'crystals': ['Aquamarine', 'Lapis Lazuli', 'Blue Kyanite'],
        'colors': ['Deep Blue', 'Indigo', 'Black'],
        'direction': 'North',
        'foods': ['Seafood', 'Black beans', 'Walnuts', 'Seaweed'],
        'activities': ['Swimming', 'Deep meditation', 'Dream journaling', 'Sound healing'],
        'affirmation': 'I flow with wisdom and adaptability, finding my way around all obstacles.',
        'feng_shui_tip': 'Place a small water feature or blue object in the North. Keep it clean and flowing.',
        'avoid': ['Forcing outcomes, fear-based decisions, dehydration'],
    },
}


def get_daily_remedy(day_element: str, fav_elements: list, unfav_elements: list) -> dict:
    day_remedy = ELEMENT_REMEDIES.get(day_element, {})
    strengthen = [
        {'element': e, **ELEMENT_REMEDIES[e]}
        for e in fav_elements[:2] if e in ELEMENT_REMEDIES
    ]
    calm = [
        {'element': e, **ELEMENT_REMEDIES[e]}
        for e in unfav_elements[:1] if e in ELEMENT_REMEDIES
    ]
    return {
        'day_element': day_element,
        'day_element_remedy': day_remedy,
        'strengthen_elements': strengthen,
        'calm_elements': calm,
    }
