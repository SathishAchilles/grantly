# Changelog

## 1.1.0 (7 Nov 2026)

### Fixed

- Eligibility never reports a match when no rule applies; a known mismatch always wins. NMMSS is for school students only.
- Fresh or renewal is worked out per scheme from the student's own applications.
- Conflicting official deadlines stay unresolved and show every source; the earliest open date is offered only as a precaution.
- Payment failures are diagnosed as invalid account details, account status, Aadhaar/NPCI mapping or unknown, and Aadhaar advice is given only when the notice mentions it.
- Readiness counts every required document, shows conditional documents, and asks for confirmation when an academic year is unclear.
- Next actions link to the page that resolves them, including `/readiness?scheme=<id>`.
- Funding wording says how money will be paid; only confirmed support reduces the gap.
- The app states that profiles are fictional, the Gmail connection is simulated and progress stays in this browser.
- A page file missing after a new deployment offers "Reload page".

## 1.0.0 (7 Nov 2026)

### Added

- My funding plan: next action first, gap bar, and a remaining gap that counts only confirmed support.
- Opportunities: per-condition eligibility with official sources, percentile-versus-percentage handling, renewal-only availability and conflicting-deadline warnings.
- Readiness: per-programme document checks with accepted alternatives and rejected substitutes.
- Applications: a caseworker that turns provider notices into one task with an owner.
- Application emails: fetches application emails and applies confirmed status, task and funding updates; flags likely scams.
- College desk: a shared task queue between students and the college coordinator.
- Funding and renewal: separate application, award, payment and renewal tracks with history.
- Error page for failed routes, security headers, `robots.txt`.
- Test suite: Vitest and Testing Library with 100% coverage, Playwright with axe at three widths.

### Changed

- Friendly mobile-first design with the Nunito font.

### Removed

- The unbuilt Combinations area.
