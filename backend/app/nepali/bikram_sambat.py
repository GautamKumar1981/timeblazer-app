"""
Bikram Sambat (BS) <-> Gregorian (AD) date conversion.
Uses a lookup table for days-per-month (months vary from 28-32 days).
Table covers BS 2075-2090 (AD 2018-2033).
"""

from datetime import date, timedelta

# Days in each BS month for years 2075-2090
# Index 0 = Baisakh, 1 = Jestha, ..., 11 = Chaitra
BS_MONTH_DAYS = {
    2075: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2077: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2078: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2079: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2081: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
    2082: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 31],
    2083: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2085: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
    2086: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
    2087: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2088: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2089: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2090: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
}

# The Gregorian date corresponding to BS 2075 Baisakh 1
BS_EPOCH_BS_YEAR = 2075
BS_EPOCH_AD_DATE = date(2018, 4, 14)


def _total_bs_days_from_epoch(bs_year: int, bs_month: int, bs_day: int) -> int:
    """Count total days from epoch (BS 2075 Baisakh 1) to given BS date."""
    total = 0
    # Full years
    for y in range(BS_EPOCH_BS_YEAR, bs_year):
        if y in BS_MONTH_DAYS:
            total += sum(BS_MONTH_DAYS[y])
        else:
            total += 365  # fallback
    # Full months in current year
    if bs_year in BS_MONTH_DAYS:
        for m in range(0, bs_month - 1):
            total += BS_MONTH_DAYS[bs_year][m]
    # Days in current month
    total += bs_day - 1
    return total


def bs_to_ad(bs_year: int, bs_month: int, bs_day: int) -> date:
    """Convert Bikram Sambat date to Gregorian date."""
    days = _total_bs_days_from_epoch(bs_year, bs_month, bs_day)
    return BS_EPOCH_AD_DATE + timedelta(days=days)


def ad_to_bs(ad_date: date) -> tuple[int, int, int]:
    """Convert Gregorian date to Bikram Sambat (year, month, day)."""
    delta = (ad_date - BS_EPOCH_AD_DATE).days
    if delta < 0:
        raise ValueError("Date before supported range (2018 AD / BS 2075)")

    bs_year = BS_EPOCH_BS_YEAR
    bs_month = 1
    bs_day = 1

    remaining = delta
    while remaining > 0:
        if bs_year not in BS_MONTH_DAYS:
            # Rough fallback for years outside table
            if remaining < 365:
                break
            remaining -= 365
            bs_year += 1
            continue

        month_days = BS_MONTH_DAYS[bs_year][bs_month - 1]
        if remaining >= month_days:
            remaining -= month_days
            bs_month += 1
            if bs_month > 12:
                bs_month = 1
                bs_year += 1
        else:
            bs_day = remaining + 1
            remaining = 0

    return bs_year, bs_month, bs_day


BS_MONTH_NAMES_NP = [
    'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
    'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत्र',
]

BS_MONTH_NAMES_EN = [
    'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
]
