# Timeblazer User Guide

## Getting Started

### Creating Your Account

1. Open the Timeblazer web app at http://localhost:3000
2. Click **"Don't have an account? Register"**
3. Enter your name, email, and password
4. Click **Register** — you'll be logged in automatically

---

## Core Concepts

### What is Timeboxing?

Timeboxing means assigning fixed time periods to tasks. Instead of working until a task is done, you work on it for a set amount of time. This improves focus, prevents overruns, and makes your day predictable.

### Timebox States

| Status | Meaning |
|--------|---------|
| 🔵 Scheduled | Planned but not started |
| 🟡 Active | Timer is running |
| 🟢 Completed | Finished within the timebox |
| ⚪ Skipped | Did not complete |

---

## Dashboard

The Dashboard is your daily command center.

### Top 3 Priorities

Every morning, set your **3 most important tasks** for the day. These are the things that must get done no matter what.

1. Click on **"Set Today's Priorities"**
2. Enter your top 3 tasks
3. Press Save

### Today's Timeboxes

See all your scheduled time blocks for today. Each shows:
- Time range (e.g., 9:00 AM – 10:30 AM)
- Title and category
- Status indicator
- Action buttons (Start, Edit, Complete, Skip)

### Starting a Timebox

Click the **▶ Start** button on any timebox to begin the countdown timer. The timer appears in the Dashboard and tracks your actual time.

---

## Calendar

Plan your day, week, or month visually.

### Creating a Timebox

1. Click on a time slot in the calendar
2. Enter the title, time range, category, and color
3. Click **Save**

### Editing a Timebox

- Click on any timebox to open it for editing
- Drag and drop to reschedule (if supported by your browser)

### Views

- **Month** — Overview of all timeboxes
- **Week** — Detailed week view  
- **Day** — Hour-by-hour day view

---

## Goals

Track your medium and long-term objectives.

### Creating a Goal

1. Go to **Goals** page
2. Click **+ Add Goal**
3. Fill in:
   - **Title** — What you want to achieve
   - **Target Date** — Deadline (creates a D-Day countdown)
   - **Priority** — High, Medium, or Low
4. Click **Save**

### D-Day Countdown

Each goal shows how many days remain until the target date:
- **D-30** means 30 days to go
- **D-0** means today is the deadline
- **D+5** means 5 days past deadline

### Updating Progress

Drag the progress slider on each Goal Card to update how close you are to completion (0–100%).

### Year Progress Bar

At the top of the Goals page, a bar shows how much of the current year has elapsed — a reminder that time is finite.

---

## Focus Mode

Eliminate all distractions and focus on one task.

1. Go to **Focus Mode** (or click the Focus button on a timebox)
2. The screen goes full-screen with a large countdown timer
3. The current timebox title is shown
4. **Space** — Pause/Resume timer
5. **Esc** — Exit focus mode

---

## Analytics

Understand your productivity patterns.

### Completion Rate

Percentage of timeboxes you completed vs. scheduled. Aim for 70%+ as a starting point.

### Accuracy

How well your planned duration matched your actual time. High accuracy means better estimation.

### Streaks

Consecutive days where you completed at least one timebox. Build the habit!

### Charts Available

- **Weekly Completion** — Bar chart of daily completion rates
- **Time Patterns** — When during the day you're most productive
- **Category Breakdown** — Which types of work you spend most time on

---

## Weekly Review

Every week, review what you accomplished and plan improvements.

### Auto-Generate

1. Go to **Weekly Review**
2. Click **Generate Review**
3. The app analyzes your completed timeboxes and creates a summary

### Manual Review

Edit the generated review by:
- Adding **Wins** — things that went well
- Adding **Improvements** — what to do better next week
- Writing **Insights** — key learnings
- Setting your **Mood** (1–5 stars)

---

## Settings

### Profile

Update your name and timezone. The timezone affects how your timeboxes and analytics are displayed.

### Theme

Toggle between **Light** and **Dark** mode. Your preference is saved automatically.

### Notifications

Enable/disable notifications for:
- Timebox reminders (5 minutes before start)
- Daily summary (end of day)

### Change Password

Enter your current password and a new password. Must be at least 8 characters.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Pause/Resume active timer (Focus Mode) |
| `Esc` | Exit Focus Mode |

---

## Tips for Success

1. **Plan the night before** — Set up tomorrow's timeboxes before bed
2. **Start with priorities** — Always set your Top 3 first
3. **Be realistic** — A 90-minute deep work session is better than 4 hours of scattered work
4. **Include breaks** — Schedule 15-minute breaks between timeboxes
5. **Review weekly** — Use the Weekly Review every Sunday to improve your system
6. **Track everything** — Even "checking email" gets a timebox — this builds self-awareness
7. **Use categories** — Tag timeboxes (work, exercise, learning) for better analytics

---

## Frequently Asked Questions

**Q: What if I run over time?**  
A: When you click Complete, you can enter the actual duration. The analytics will track your estimation accuracy.

**Q: Can I use Timeblazer offline?**  
A: Yes! The app caches your data locally and syncs when you reconnect.

**Q: How do I use the mobile app?**  
A: Install Expo Go on your phone, run `npm start` in the `/mobile` directory, and scan the QR code.

**Q: Can I share timeboxes with others?**  
A: Not currently — Timeblazer is a personal productivity tool. Sharing may be added in a future version.

**Q: How is the completion rate calculated?**  
A: `completed_timeboxes / total_scheduled_timeboxes × 100`. Skipped timeboxes count against your rate.
