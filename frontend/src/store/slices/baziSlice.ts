import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { baziAPI } from '../../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Stem {
  index: number; cn: string; pinyin: string; en: string; element: string; polarity: string;
}
export interface Branch {
  index: number; cn: string; pinyin: string; en: string;
  element: string; polarity: string; hour_start: number; hour_end: number;
}
export interface Pillar {
  stem: Stem; branch: Branch; hidden_stems: Stem[];
  name: string; stem_index: number; branch_index: number;
}
export interface BaziChart {
  year: Pillar; month: Pillar; day: Pillar; hour: Pillar;
  day_master: Stem;
  day_master_element: string;
  day_master_strength: string;
  element_balance: Record<string, number>;
  favorable_elements: string[];
  unfavorable_elements: string[];
  bazi_year: number;
  gender: string;
}
export interface HourForecast {
  branch_index: number; time_label: string; pillar_name: string;
  stem: Stem; branch: Branch; score: number; rating: string; color: string;
}
export interface DayForecast {
  date: string; pillar: Pillar; score: number; rating: string; color: string;
  hours: HourForecast[]; tips: string[]; favorable_elements: string[];
}
export interface CalendarDay {
  date: string; pillar: Pillar; score: number; rating: string; color: string;
}
export interface LuckPillar {
  stem: Stem; branch: Branch; name: string;
  age_start: number; age_end: number; decade: number;
}
export interface LuckPillars {
  direction: string; start_age: number; pillars: LuckPillar[];
}
export interface BaziProfileData {
  birth_date: string; birth_hour: number; birth_minute: number;
  gender: string; timezone_offset: number;
}
export interface BusinessRec {
  date: string; day_name: string; pillar: Pillar;
  score: number; activity_match: number; personal_match: number; day_elements: string[];
}

interface BaziState {
  profile:      BaziProfileData | null;
  chart:        BaziChart | null;
  today:        { forecast: DayForecast; day_master: Stem; day_master_strength: string; favorable_elements: string[]; date: string } | null;
  dailyForecast: DayForecast | null;
  calendar:     CalendarDay[] | null;
  calendarMeta: { year: number; month: number } | null;
  luckPillars:  LuckPillars | null;
  businessRecs: { activity: object; recommendations: BusinessRec[] } | null;
  loading:      boolean;
  error:        string | null;
}

const initialState: BaziState = {
  profile: null, chart: null, today: null, dailyForecast: null,
  calendar: null, calendarMeta: null, luckPillars: null,
  businessRecs: null, loading: false, error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────
const _err = (e: unknown) => {
  const err = e as { response?: { data?: { error?: string; message?: string } } };
  return err.response?.data?.error || err.response?.data?.message || 'Request failed';
};

export const fetchBaziProfile = createAsyncThunk('bazi/fetchProfile', async (_, { rejectWithValue }) => {
  try { return (await baziAPI.getProfile()).data.profile; }
  catch (e) { return rejectWithValue(_err(e)); }
});

export const saveBaziProfile = createAsyncThunk('bazi/saveProfile', async (data: object, { rejectWithValue }) => {
  try { return (await baziAPI.saveProfile(data)).data.profile; }
  catch (e) { return rejectWithValue(_err(e)); }
});

export const fetchBaziChart = createAsyncThunk('bazi/fetchChart', async (_, { rejectWithValue }) => {
  try { return (await baziAPI.getChart()).data.chart as BaziChart; }
  catch (e) { return rejectWithValue(_err(e)); }
});

export const fetchToday = createAsyncThunk('bazi/fetchToday', async (_, { rejectWithValue }) => {
  try { return (await baziAPI.getToday()).data; }
  catch (e) { return rejectWithValue(_err(e)); }
});

export const fetchDailyForecast = createAsyncThunk('bazi/fetchDaily', async (date: string | undefined, { rejectWithValue }) => {
  try { return (await baziAPI.getDaily(date)).data.forecast as DayForecast; }
  catch (e) { return rejectWithValue(_err(e)); }
});

export const fetchCalendar = createAsyncThunk('bazi/fetchCalendar', async ({ year, month }: { year: number; month: number }, { rejectWithValue }) => {
  try {
    const r = (await baziAPI.getCalendar(year, month)).data;
    return { days: r.calendar as CalendarDay[], year: r.year as number, month: r.month as number };
  } catch (e) { return rejectWithValue(_err(e)); }
});

export const fetchLuckPillars = createAsyncThunk('bazi/fetchLuckPillars', async (_, { rejectWithValue }) => {
  try { return (await baziAPI.getLuckPillars()).data.luck_pillars as LuckPillars; }
  catch (e) { return rejectWithValue(_err(e)); }
});

export const fetchBusinessTiming = createAsyncThunk('bazi/fetchBusinessTiming',
  async ({ activity, days_ahead }: { activity: string; days_ahead?: number }, { rejectWithValue }) => {
    try { return (await baziAPI.businessTiming(activity, days_ahead)).data; }
    catch (e) { return rejectWithValue(_err(e)); }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const baziSlice = createSlice({
  name: 'bazi',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
    clearBusinessRecs(state) { state.businessRecs = null; },
  },
  extraReducers: (b) => {
    const pending   = (state: BaziState) => { state.loading = true; state.error = null; };
    const rejected  = (state: BaziState, action: PayloadAction<unknown>) => {
      state.loading = false; state.error = action.payload as string;
    };

    b.addCase(fetchBaziProfile.pending,   pending)
     .addCase(fetchBaziProfile.fulfilled, (state, a) => { state.loading = false; state.profile = a.payload; })
     .addCase(fetchBaziProfile.rejected,  rejected)

     .addCase(saveBaziProfile.pending,    pending)
     .addCase(saveBaziProfile.fulfilled,  (state, a) => { state.loading = false; state.profile = a.payload; })
     .addCase(saveBaziProfile.rejected,   rejected)

     .addCase(fetchBaziChart.pending,     pending)
     .addCase(fetchBaziChart.fulfilled,   (state, a) => { state.loading = false; state.chart = a.payload; })
     .addCase(fetchBaziChart.rejected,    rejected)

     .addCase(fetchToday.pending,         pending)
     .addCase(fetchToday.fulfilled,       (state, a) => { state.loading = false; state.today = a.payload; })
     .addCase(fetchToday.rejected,        rejected)

     .addCase(fetchDailyForecast.pending,   pending)
     .addCase(fetchDailyForecast.fulfilled, (state, a) => { state.loading = false; state.dailyForecast = a.payload; })
     .addCase(fetchDailyForecast.rejected,  rejected)

     .addCase(fetchCalendar.pending,      pending)
     .addCase(fetchCalendar.fulfilled,    (state, a) => {
       state.loading = false; state.calendar = a.payload.days;
       state.calendarMeta = { year: a.payload.year, month: a.payload.month };
     })
     .addCase(fetchCalendar.rejected,     rejected)

     .addCase(fetchLuckPillars.pending,   pending)
     .addCase(fetchLuckPillars.fulfilled, (state, a) => { state.loading = false; state.luckPillars = a.payload; })
     .addCase(fetchLuckPillars.rejected,  rejected)

     .addCase(fetchBusinessTiming.pending,   pending)
     .addCase(fetchBusinessTiming.fulfilled, (state, a) => { state.loading = false; state.businessRecs = a.payload; })
     .addCase(fetchBusinessTiming.rejected,  rejected);
  },
});

export const { clearError, clearBusinessRecs } = baziSlice.actions;
export default baziSlice.reducer;
