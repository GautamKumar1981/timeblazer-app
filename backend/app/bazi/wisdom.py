import random

ART_OF_WAR = {
    'Wood': [
        {'quote': 'In the midst of chaos, there is also opportunity.',
         'context': 'Wood energy opens doors — seize what others overlook.',
         'source': 'Art of War, Chapter 1 · Sun Tzu'},
        {'quote': 'The supreme art of war is to subdue the enemy without fighting.',
         'context': 'Expand through collaboration and growth, not confrontation.',
         'source': 'Art of War, Chapter 3 · Sun Tzu'},
        {'quote': 'Opportunities multiply as they are seized.',
         'context': 'Each step on a Wood day creates momentum for the next.',
         'source': 'Art of War · Sun Tzu'},
    ],
    'Fire': [
        {'quote': 'Speed is the essence of war. Take advantage of unpreparedness.',
         'context': 'Fire energy rewards decisive, swift, visible action today.',
         'source': 'Art of War, Chapter 11 · Sun Tzu'},
        {'quote': 'Let your plans be dark as night; when you move, fall like a thunderbolt.',
         'context': 'Act with confidence — Fire days demand bold moves.',
         'source': 'Art of War, Chapter 7 · Sun Tzu'},
        {'quote': 'He who knows when to fight and when not to fight will be victorious.',
         'context': 'Harness passion with discernment on this blazing day.',
         'source': 'Art of War, Chapter 3 · Sun Tzu'},
    ],
    'Earth': [
        {'quote': 'The general who wins makes many calculations before the battle is fought.',
         'context': 'Earth energy rewards thorough preparation and steady planning.',
         'source': 'Art of War, Chapter 1 · Sun Tzu'},
        {'quote': 'To know your enemy, you must become your enemy.',
         'context': 'Deep understanding, not reaction, defines Earth wisdom today.',
         'source': 'Art of War, Chapter 3 · Sun Tzu'},
        {'quote': 'Build your opponent a golden bridge to retreat across.',
         'context': 'Stability and diplomacy are your greatest strengths today.',
         'source': 'Art of War · Sun Tzu'},
    ],
    'Metal': [
        {'quote': 'He will win who knows when to fight and when not to fight.',
         'context': 'Metal calls for precision and discernment over brute force.',
         'source': 'Art of War, Chapter 3 · Sun Tzu'},
        {'quote': 'The quality of decision is like the well-timed swoop of a falcon.',
         'context': 'Cut through confusion — make decisions swift and final today.',
         'source': 'Art of War, Chapter 5 · Sun Tzu'},
        {'quote': 'Disciplined and calm, await the appearance of disorder amongst the enemy.',
         'context': 'Maintain your standards; Metal rewards those who hold principles.',
         'source': 'Art of War, Chapter 7 · Sun Tzu'},
    ],
    'Water': [
        {'quote': 'Be extremely subtle, even to formlessness. Be extremely mysterious, even to soundlessness.',
         'context': 'Water energy flows around obstacles — adapt and persist without forcing.',
         'source': 'Art of War, Chapter 6 · Sun Tzu'},
        {'quote': 'Water shapes its course according to the nature of the ground over which it flows.',
         'context': 'Flexibility is your greatest strength on this Water day.',
         'source': 'Art of War, Chapter 6 · Sun Tzu'},
        {'quote': 'If you know the enemy and know yourself, you need not fear a hundred battles.',
         'context': 'Deep self-knowledge is the gift of Water energy.',
         'source': 'Art of War, Chapter 3 · Sun Tzu'},
    ],
}

FIVE_RINGS = {
    'high': [
        {'quote': 'There is nothing outside yourself that can ever enable you to get better, stronger, richer, quicker, or smarter. Everything is within.',
         'context': 'On this powerful day, your inner resources are your greatest asset.',
         'source': 'Book of Five Rings · Miyamoto Musashi'},
        {'quote': 'Today is victory over yourself of yesterday; tomorrow is your victory over lesser men.',
         'context': 'High energy days call for self-mastery above all else.',
         'source': 'Book of Five Rings · Miyamoto Musashi'},
        {'quote': 'The true science of martial arts means practising in such a way that they will be useful at any time.',
         'context': 'Excellence deployed at the right moment — this is today\'s lesson.',
         'source': 'Book of Five Rings · Miyamoto Musashi'},
    ],
    'medium': [
        {'quote': 'Do not think dishonestly. The Way is in training.',
         'context': 'Steady effort on moderate days builds the foundation of mastery.',
         'source': 'Book of Five Rings · Miyamoto Musashi'},
        {'quote': 'Think lightly of yourself and deeply of the world.',
         'context': 'A balanced day calls for outward focus and careful observation.',
         'source': 'Book of Five Rings · Miyamoto Musashi'},
        {'quote': 'From one thing, know ten thousand things.',
         'context': 'Use this reflective energy to draw insight from small details.',
         'source': 'Book of Five Rings · Miyamoto Musashi'},
    ],
    'low': [
        {'quote': 'It is difficult to understand the universe if you only study one planet.',
         'context': 'Quiet days are for wide study, not narrow action.',
         'source': 'Book of Five Rings · Miyamoto Musashi'},
        {'quote': 'The warrior must train with his sword every day, even when tired.',
         'context': 'Consistency through stillness — small actions today plant tomorrow\'s victories.',
         'source': 'Book of Five Rings · Miyamoto Musashi'},
        {'quote': 'Perceive that which cannot be seen with the eye.',
         'context': 'Rest the outward gaze; let intuition guide you on this low-energy day.',
         'source': 'Book of Five Rings · Miyamoto Musashi'},
    ],
}


def get_wisdom_for_day(day_element: str, score: float) -> dict:
    art_quotes = ART_OF_WAR.get(day_element, ART_OF_WAR['Water'])
    art_quote = random.choice(art_quotes)

    energy_level = 'high' if score >= 70 else ('medium' if score >= 40 else 'low')
    five_rings_quote = random.choice(FIVE_RINGS[energy_level])

    return {
        'art_of_war': art_quote,
        'five_rings': five_rings_quote,
        'energy_level': energy_level,
    }
