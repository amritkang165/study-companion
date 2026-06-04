# Changelog

- 2026-06-04 22:30:00 - Task experience improvements, analytics, consistency tracking, profile page:
  - Added status filter tabs (All/Pending/Completed/Overdue) with counts to tasks panel on Subjects & Tasks page.
  - Added sort toggle (by deadline / by priority) for the task list.
  - Added consistency heatmap on dashboard: monthly calendar grid showing daily task completions with 5-level intensity.
  - Added streak display (current day streak + best streak) and week-over-week comparison on dashboard.
  - Added priority breakdown chart (High/Medium/Low distribution with horizontal bars) on dashboard.
  - Added `getCompletionDates`, `computeStreak`, `getMonthlyActivity`, `priorityBreakdown`, `thisWeekVsLastWeek` helpers to helpers.js.
  - Exposed `streak`, `monthly`, `priorities`, `weekComparison` from useProgress hook.
  - Added `ConsistencyHeatmap` and `PriorityBreakdown` chart components to ProgressChart.
  - Rebuilt profile page with: initials avatar, editable name (click to edit, persists via Supabase), full name updates dashboard, stats card grid (tasks, completed, subjects, streak), account details section, change password form.
  - Removed "Today" stat card and "Today's Checklist" panel from dashboard.
  - All derived analytics from existing `completedAt` timestamps — no new storage needed.

- 2026-06-04 18:00:00 - Dashboard date, checklist, focus mode:
  - Added today's date (formatted) next to stat cards on dashboard.
  - Added "Today's Checklist" panel with add/toggle/remove items, persisted per-day in localStorage.
  - Added "Focus Mode" button on dashboard that opens fullscreen overlay with Pomodoro (left) and task list (right).
  - Created `<FocusMode>` component and added `noOverlay` prop to FullscreenPomodoro for embedded use.
  - Added round checkboxes to checklist items with strikethrough and progress counter.

- 2026-06-04 16:00:00 - Subjects & Tasks UI overhaul, Pomodoro focus sounds:
  - Replaced collapsible forms panel with dedicated "+ Subject" and "+ Task" buttons on each side of the split view.
  - Subjects on left, tasks on right with a vertical divider in the center.
  - Added 6 focus sounds to Pomodoro (White, Pink, Brown noise, Rain, Forest, Ocean Waves) using Web Audio API — no external files needed.
  - Added volume slider per sound with stop button.

- 2026-06-04 14:00:00 - Dashboard cleanup, login fix, and project error fixes:
  - Removed revision schedule, subject progress chart, and revision tasks stat from dashboard.
  - Shifted theme picker to the right side, centered.
  - Set exam date button now matches Pomodoro button size (both `btn--primary`).
  - Fixed login to use Supabase Auth (email + password) instead of localStorage.
  - Configured Supabase client with explicit session persistence so login survives refresh.
  - Fixed unused import `apiCall` in aiService.js that would cause a runtime error.
  - Updated motivational quotes API to API Ninjas `/v2/quoteoftheday` with provided key.

- 2026-06-04 12:00:00 - Nav restructure, dashboard welcome & exam countdown, merged subjects & tasks:
  - Moved theme picker from sidebar nav to dashboard, shifted slightly left and above the quote.
  - Added welcome greeting with user's name (from Supabase auth) on dashboard header.
  - Added exam countdown feature: "Set exam date" button → date picker → shows "X days left" with persistent localStorage storage.
  - Merged "Subjects" and "Tasks" pages into single "Subjects & Tasks" nav entry with tabbed view (subjects with inline tasks / flat task list).
  - Removed "Revision" planner from navigation.
  - Renamed "AI Tools" to "Study Buddy" in nav and page heading, with route redirect from `/ai-tools`.
  - Updated motivational quotes API to `https://nodejs-quoteapp.herokuapp.com/`.
  - Updated Groq API key in `.env`.

- 2026-06-03 22:15:00 - Theme picker reposition:
  - Moved the theme swatches into the top navigation beside the 'Dashboard' link (free space above the quote). Ensured a single picker, flex layout, and slightly shifted swatches right for spacing.

- 2026-06-03 21:10:00 - Quick fixes:
  - Removed stray 'theme-' token from public/index.html that could break theme class application.
  - Fixed malformed theme modifier lines in src/index.css (added missing leading dot and removed stray token).
  - Repaired malformed CSS tokens in FlashcardViewer.css and ProgressChart.jsx so theme variables parse correctly.

- 2026-06-03 19:30:00 - Theme consolidation and fixes:
  - Consolidated the theme picker to a single location in the top navigation beside the "Dashboard" link and removed duplicate pickers from page headers and other components.
  - Ensured ThemeProvider applies theme classes on <html> and components read colors via CSS variables (--accent, --accent-dim, --accent-glow, --subject-color) so theme changes apply across all pages.
  - Fixed Open Pomodoro button, task completion UI, subject cards, revision items, and AI tools so they inherit the selected theme correctly.
  - Shifted theme swatches slightly right and added a small blank gap beside the Dashboard link for spacing; added visible focus styles.
  - Persisted selected theme to localStorage and removed legacy inline theme tokens.
  - Replaced remaining hardcoded pink values with CSS variables and updated styles in src/index.css.

- 2026-06-03 12:00:00 - Major feature updates and DB integration:
  - Added Supabase client: src/lib/supabaseClient.js
  - Implemented DB helper functions for CRUD operations: src/services/dbHelpers.js
  - Added ThemeContext and theme CSS: src/context/ThemeContext.jsx and src/styles/themes.css (global CSS variables and vertical theme picker)
  - Replaced hardcoded example content with DB-backed lists and empty-state UI in various pages (Dashboard, Subjects, Tasks, Pomodoro, Profile)
  - Persisted theme selection to localStorage and user_profiles.theme_key in Supabase; theme applies globally via CSS variables.
  - Removed hardcoded study examples and replaced with empty-state UI; users can add their own content.

  Note: Some ESLint warnings were temporarily suppressed during edits; recommended follow-ups include cleaning up unused variables and ensuring hooks are called unconditionally where applicable.

- 2026-06-03 15:10:00 - Theme picker and UI fixes:
  - Removed stray "theme-" token from public/index.html which could interfere with theme class application.
  - Moved inline theme picker to the Dashboard header beside the "Dashboard" title for easier access (src/pages/Dashboard.jsx).
  - Hid legacy right-side theme palette and added CSS for inline theme swatches (src/index.css).
  - Ensured clicking a swatch sets the ThemeContext theme class on <html> so the accent colors apply across all pages.

- 2026-06-03 17:40:00 - Theme/global accent fixes and UI tweaks:
  - Replaced several hardcoded pink colors with CSS variables so theme swatches change primary controls (src/index.css)
  - Pie chart and other charts now use CSS variables for accent colors (src/components/ProgressChart.jsx)
  - Adjusted Dashboard inline theme picker spacing so it sits beside 'Dashboard' with a small blank space; Pomodoro opener now inherits accent via CSS (src/pages/Dashboard.jsx)

- 2026-06-03 17:55:00 - Theme picker moved to nav and spacing tweaks:
  - Added compact theme picker into top navigation so swatches are available beside 'Dashboard' and other nav links (src/components/Layout.jsx)
  - Tweaked CSS margins so swatches sit slightly right and maintain a small blank gap beside Dashboard (src/index.css)

- 2026-06-03 18:40:00 - Theme picker consolidation and spacing fixes:
  - Removed inline theme picker from the Dashboard header so there's only a single picker in the top navigation (src/pages/Dashboard.jsx, src/components/Layout.jsx).
  - Ensured theme swatches sit beside the Dashboard link with a small blank gap and shifted swatches slightly right (src/index.css).
  - Fixed styling so primary controls (Pomodoro open button, task completion, subject cards, revision items) inherit the --accent variable consistently.

- 2026-06-03 20:10:00 - Minor cleanup:
  - Removed stray "theme-" token from public/index.html and fixed theme modifier definitions in src/index.css.
  - Added .nav-gap spacer and adjusted theme-picker spacing in the top nav.

- 2026-06-03 21:40:00 - Theme picker placement and spacing:
  - Moved the theme swatches to sit with a larger blank gap beside the 'Dashboard' link and shifted swatches slightly right for better separation.

