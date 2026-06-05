# Changelog

- 2026-06-05 00:45 — Dark/light mode toggle: sun/moon button in nav bar, persisted to localStorage, `.dark` CSS class with full variable overrides
- 2026-06-05 00:30 — Neo-brutalist light mode redesign: warm cream bg, 2px solid borders, hard offset shadows, 3-column dashboard layout, solid accent fills, no glass/blur effects
- 2026-06-05 00:15 — Day streak stat card added to dashboard stat grid; chart empty states now use visible grey (`#e0dbd5`); removed decorative glow notch from dashboard
- 2026-06-05 00:00 — Migrated all study data (subjects, topics, tasks, revisions) from localStorage to Supabase. Data persists across devices and survives cache clears. Existing localStorage data auto-migrates on first login. Created `supabase-migration.sql` for table setup.
- 2026-06-04 23:55 — Warm/human UI overhaul: rose/amber palette, pill shapes, noise texture, staggered spring animations, bounce checkboxes
- 2026-06-04 23:45 — Font swap: MuseoModerno (display) + Outfit (body) replaced Inter + Plus Jakarta Sans
- 2026-06-04 23:30 — Study Buddy AI fixes: updated decommissioned model to `llama-3.3-70b-versatile`, fixed Gemini→Groq references; created `<QuestionsViewer>` and `<SummaryViewer>` for rich AI output rendering
- 2026-06-04 22:30 — Task filters (All/Pending/Completed/Overdue with counts), sort toggle (deadline/priority); consistency heatmap with 5-level intensity, streak display, week-over-week comparison, priority breakdown chart; rebuilt profile page with initials avatar, editable name (Supabase persist), stats grid, account details, change password; removed "Today" stat card and "Today's Checklist" panel
- 2026-06-04 18:00 — Active tasks panel on dashboard with quick-add and scrollable list; Focus Mode fullscreen overlay with Pomodoro + task list; 6 Pomodoro focus sounds via Web Audio API
- 2026-06-04 16:00 — Subjects & Tasks split view with inline add buttons, vertical divider
- 2026-06-04 14:00 — Supabase auth fix: explicit session persistence, login survives refresh; welcome greeting, exam countdown with localStorage persistence; removed revision schedule from dashboard
- 2026-06-04 12:00 — Merged Subjects & Tasks pages, removed Revision planner, renamed AI Tools → Study Buddy; updated quotes API and Groq key
- 2026-06-03 22:15 — Theme system: ThemeContext with 6 color swatches, persisted to localStorage, applied via CSS variables; Supabase client + DB helpers; replaced example content with empty-state UI; various theme picker placement tweaks and CSS cleanup
