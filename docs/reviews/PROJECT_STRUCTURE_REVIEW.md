# NFL Dashboard - Project Structure Review & Cleanup Plan

**Review Date:** January 4, 2026
**Reviewed By:** Claude Code
**Project Version:** 0.1.0

---

## Executive Summary

The NFL Dashboard has accumulated technical debt through **duplicate data structures, temporary test files, and inconsistent organization**. This review identifies **33 actionable items** across 6 categories that will:

- **Remove 7 deprecated files** (-50 KB)
- **Consolidate 4 team data files → 1** (-150 lines of duplicate code)
- **Organize 5 documentation files** into `/docs/` structure
- **Create 3 missing standard files** (.env.example, CONTRIBUTING.md, etc.)

**Total Cleanup Time:** 5-7 hours
**Immediate Impact:** Cleaner codebase, easier maintenance, single source of truth

---

## Table of Contents

1. [Deprecated Files to Delete](#1-deprecated-files-to-delete)
2. [Duplicate Data Structures](#2-duplicate-data-structures)
3. [Organization Issues](#3-organization-issues)
4. [Documentation Cleanup](#4-documentation-cleanup)
5. [Missing Standard Files](#5-missing-standard-files)
6. [Consolidation Recommendations](#6-consolidation-recommendations)
7. [Implementation Phases](#7-implementation-phases)
8. [Risk Assessment](#8-risk-assessment)

---

## 1. Deprecated Files to Delete

### Immediate Deletion (Zero Risk)

| File | Size | Reason | Action |
|------|------|--------|--------|
| `dev.log` | 0 bytes | Empty log file, already in .gitignore | `rm dev.log` |
| `__tests__/temp-sumer-stats.test.ts` | ~2.2 KB | Temporary test file (prefix: temp-) | `rm __tests__/temp-sumer-stats.test.ts` |
| `__tests__/temp-fetch.test.ts` | ~1 KB | Temporary test file (prefix: temp-) | `rm __tests__/temp-fetch.test.ts` |
| `nflfastr/test_output.json` | Unknown | Test artifact, not version controlled | `rm nflfastr/test_output.json` |

### Review & Delete (Low Risk)

| File | Size | Status | Recommendation |
|------|------|--------|----------------|
| `export_stats.py` | 1.7 KB | Superseded by `nflfastr/app.py` | Verify no direct calls, then delete |

**Verification Command:**
```bash
# Check if export_stats.py is referenced anywhere
grep -r "export_stats" --exclude-dir={node_modules,.next,.git} .
```

If no references found:
```bash
rm export_stats.py
```

---

## 2. Duplicate Data Structures

### Problem: Team Data Exists in 4 Places

#### Current Files with Team Data:

1. **`constants/teams.ts`** (71 lines)
   - `TEAM_LOGOS` - Logo URLs for all 32 teams
   - `TEAM_NAMES` - Full team names mapping
   - Used in: 5 files (gameService, playoffService, TeamSelector, SafeImage, team page)

2. **`constants/mappings.ts`** (25 lines)
   - `TEAM_ID_TO_ABBR` - ESPN ID to abbreviation mapping
   - `NFL_FASTR_TO_ESPN` - nflfastR to ESPN ID mapping
   - Used in: 1 file (matchupService)

3. **`lib/team-branding.ts`** (177 lines)
   - Complete team objects with:
     - Logo URLs (DUPLICATE of constants/teams.ts)
     - Primary colors
     - Secondary colors
     - Full color palettes (primary, lightAccent, darkAccent)
   - Used in: 1 file (gameService)

4. **`lib/nfl-data.ts`** (42 lines)
   - `TEAM_MAP` - ESPN ID to nflfastR mapping (DUPLICATE of mappings.ts)
   - Helper functions for team data retrieval
   - Used in: matchupService

### Duplication Analysis

**Logo URLs:**
- Defined in `constants/teams.ts` → 32 entries
- **DUPLICATED** in `lib/team-branding.ts` → 32 entries with logoUrl property
- **Impact:** Maintenance requires updating 2 files

**ID Mappings:**
- `TEAM_ID_TO_ABBR` in `constants/mappings.ts` (ESPN ID → Abbreviation)
- **DUPLICATED** as inverse in `lib/nfl-data.ts` (Abbreviation → ESPN ID)
- **Impact:** Inconsistency risk if one is updated without the other

### Proposed Solution: Consolidated Team Configuration

Create a **single source of truth** for all team data:

#### New File: `constants/teams.ts` (Consolidated)

```typescript
/**
 * Consolidated NFL Team Configuration
 * Single source of truth for all team data
 */

export interface NFLTeam {
  id: string;                    // ESPN team ID
  name: string;                  // Full team name
  abbreviation: string;          // 3-letter code
  nflfastrCode: string;         // nflfastR team code
  logo: string;                  // Logo URL
  branding: {
    primary: string;             // Primary color
    secondary: string;           // Secondary color
    colors: {
      primary: string;
      lightAccent: string;
      darkAccent: string;
    };
  };
}

export const NFL_TEAMS: Record<string, NFLTeam> = {
  'BUF': {
    id: '2',
    name: 'Buffalo Bills',
    abbreviation: 'BUF',
    nflfastrCode: 'BUF',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
    branding: {
      primary: '#00338D',
      secondary: '#C60C30',
      colors: {
        primary: '#00338D',
        lightAccent: '#00338D',
        darkAccent: '#4FACFF'
      }
    }
  },
  // ... 31 more teams
} as const;

// Utility Functions
export const getTeamByEspnId = (id: string): NFLTeam | undefined =>
  Object.values(NFL_TEAMS).find(team => team.id === id);

export const getTeamByAbbr = (abbr: string): NFLTeam | undefined =>
  NFL_TEAMS[abbr as keyof typeof NFL_TEAMS];

export const getTeamBranding = (abbr: string) =>
  NFL_TEAMS[abbr as keyof typeof NFL_TEAMS]?.branding;

// Legacy Exports (for backward compatibility during migration)
export const TEAM_LOGOS = Object.fromEntries(
  Object.values(NFL_TEAMS).map(team => [team.abbreviation, team.logo])
) as Record<string, string>;

export const TEAM_NAMES = Object.fromEntries(
  Object.values(NFL_TEAMS).map(team => [team.abbreviation, team.name])
) as Record<string, string>;

export const TEAM_ID_TO_ABBR = Object.fromEntries(
  Object.values(NFL_TEAMS).map(team => [team.id, team.abbreviation])
) as Record<string, string>;

export const TEAM_BRANDING = Object.fromEntries(
  Object.values(NFL_TEAMS).map(team => [team.abbreviation, team.branding])
);

export const DEFAULT_NFL_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png';
```

#### Migration Steps:

**Step 1:** Create new consolidated file (above)

**Step 2:** Update imports in these files:

1. `services/gameService.ts`
   ```typescript
   // Before:
   import { TEAM_LOGOS, DEFAULT_NFL_LOGO } from "@/constants/teams";
   import { TEAM_BRANDING } from "@/lib/team-branding";

   // After:
   import { TEAM_LOGOS, DEFAULT_NFL_LOGO, TEAM_BRANDING } from "@/constants/teams";
   ```

2. `services/playoffService.ts`
   ```typescript
   // No changes needed - already uses constants/teams
   ```

3. `services/matchupService.ts`
   ```typescript
   // Before:
   import { TEAM_ID_TO_ABBR } from "@/constants/mappings";

   // After:
   import { TEAM_ID_TO_ABBR } from "@/constants/teams";
   ```

4. `lib/nfl-data.ts`
   ```typescript
   // Before:
   export const TEAM_MAP: Record<string, string> = { /* ... */ };

   // After:
   import { NFL_TEAMS } from "@/constants/teams";
   // Remove TEAM_MAP, use NFL_TEAMS directly
   ```

5. Update other files as needed

**Step 3:** Run tests to verify no breakage
```bash
npm test
npm run build
```

**Step 4:** Delete deprecated files:
```bash
rm constants/mappings.ts
rm lib/team-branding.ts
# Update lib/nfl-data.ts to remove TEAM_MAP
```

### Benefits of Consolidation

✅ **Single source of truth** - Update team data in one place
✅ **Type safety** - All team data uses same interface
✅ **Easier maintenance** - No risk of inconsistencies
✅ **Reduced code** - ~150 lines eliminated
✅ **Better organization** - Clear data ownership

---

## 3. Organization Issues

### Constants vs Lib - Inconsistent Separation

**Principle:**
- `constants/` → Immutable data, lookup tables, enums
- `lib/` → Utility functions, helper logic, services

**Current Issues:**

| File | Location | Type | Issue | Should Be |
|------|----------|------|-------|-----------|
| `team-branding.ts` | `lib/` | Pure data object | No functions, just data | `constants/` |
| `stadiums.ts` | `lib/` | Pure data object | No functions, just data | `constants/` |
| `nfl-data.ts` | `lib/` | Data + functions | Mixed concerns | Split |
| `sumerSportsService.ts` | `lib/` | Service function | API service | `services/` |

### Recommended Moves

#### Move to Constants:

```bash
# Pure data objects belong in constants
git mv lib/stadiums.ts constants/stadiums.ts

# Update imports in affected files
# - services/gameService.ts (line 3)
```

**Impact:** 1 file to update

#### Move to Services:

```bash
# Service functions belong in services
git mv lib/sumerSportsService.ts services/sumer-sports-service.ts

# Update imports in affected files
# - Check for any imports (likely in tests)
```

**Impact:** 1-2 files to update

#### Keep in Lib (Correctly Located):

✅ `nflDates.ts` - Utility function (getCurrentNFLWeek)
✅ `polling-config.ts` - Configuration + utilities
✅ `utils.ts` - General utilities
✅ `weatherCache.ts` - Cache management
✅ `storage.ts` - Storage utilities

### File Naming Inconsistencies

**Issue:** Mix of camelCase and kebab-case

| Current | Should Be | Reason |
|---------|-----------|--------|
| `lib/nflDates.ts` | `lib/nfl-dates.ts` | Project uses kebab-case |
| `lib/sumerSportsService.ts` | `services/sumer-sports-service.ts` | Location + naming |
| `constants/mappings.ts` | `constants/team-id-mappings.ts` | More descriptive |

**Rename Commands:**
```bash
git mv lib/nflDates.ts lib/nfl-dates.ts
git mv lib/sumerSportsService.ts services/sumer-sports-service.ts
git mv constants/mappings.ts constants/team-id-mappings.ts
```

**Files to Update After Rename:** 3-5 imports

---

## 4. Documentation Cleanup

### Current Root-Level Documentation

| File | Lines | Date | Purpose | Status |
|------|-------|------|---------|--------|
| `README.md` | 728 | Jan 4, 2026 | Primary docs | ✅ **KEEP** |
| `CODE_REVIEW_REPORT.md` | 1019 | Jan 4, 2026 | Latest review | 📋 **MOVE** to /docs/reviews/ |
| `CODE_REVIEW_SUMMARY.md` | 402 | Jan 3, 2026 | Older review | ❌ **DELETE** (superseded) |
| `GAME_HEADER_UX_IMPROVEMENTS.md` | 676 | Jan 3, 2026 | Design decisions | 📋 **MOVE** to /docs/decisions/ |
| `HEADER_REFACTOR_SUMMARY.md` | 342 | Jan 3, 2026 | Implementation | 📋 **MOVE** to /docs/archive/ |
| `PHASE_1_IMPLEMENTATION.md` | 383 | Jan 3, 2026 | Implementation | 📋 **MOVE** to /docs/archive/ |
| `PHASE_1_SUMMARY.md` | 360 | Jan 3, 2026 | Older summary | ❌ **DELETE** (duplicate) |
| `TESTING_STRATEGY.md` | 46 | Dec 26, 2025 | Testing docs | ✅ **MOVE** to /docs/ |

### Problem: Root Clutter

- **8 documentation files** in root
- **2 duplicate documents** (CODE_REVIEW_SUMMARY vs REPORT, PHASE_1 duplicates)
- **Historical artifacts** mixed with current docs
- **No organization** by type or date

### Proposed Documentation Structure

```
/docs/
  README.md                              # Documentation index
  TESTING_STRATEGY.md                    # Current testing docs

  /archive/                              # Historical implementation docs
    PHASE_1_IMPLEMENTATION.md            # Adaptive polling implementation
    HEADER_REFACTOR_SUMMARY.md          # Header component refactor

  /decisions/                            # Architecture Decision Records (ADRs)
    GAME_HEADER_UX_IMPROVEMENTS.md      # UX design decisions

  /reviews/                              # Code review reports
    CODE_REVIEW_REPORT_2026-01-04.md   # Latest comprehensive review
```

### Implementation Commands

```bash
# Create docs structure
mkdir -p docs/{archive,decisions,reviews}

# Move active documentation
mv CODE_REVIEW_REPORT.md docs/reviews/CODE_REVIEW_REPORT_2026-01-04.md
mv TESTING_STRATEGY.md docs/TESTING_STRATEGY.md

# Move historical docs
mv PHASE_1_IMPLEMENTATION.md docs/archive/
mv HEADER_REFACTOR_SUMMARY.md docs/archive/

# Move design decisions
mv GAME_HEADER_UX_IMPROVEMENTS.md docs/decisions/

# Delete duplicates
rm CODE_REVIEW_SUMMARY.md
rm PHASE_1_SUMMARY.md

# Create docs index
cat > docs/README.md << 'EOF'
# NFL Dashboard Documentation

## Current Documentation
- [Testing Strategy](./TESTING_STRATEGY.md) - Testing approach and guidelines

## Archive
Historical implementation documentation:
- [Phase 1 Implementation](./archive/PHASE_1_IMPLEMENTATION.md) - Adaptive polling system
- [Header Refactor](./archive/HEADER_REFACTOR_SUMMARY.md) - Header component refactor

## Design Decisions
- [Game Header UX Improvements](./decisions/GAME_HEADER_UX_IMPROVEMENTS.md) - Header UX design

## Code Reviews
- [Code Review 2026-01-04](./reviews/CODE_REVIEW_REPORT_2026-01-04.md) - Comprehensive review
EOF
```

### Benefits

✅ **Clean root directory** - Only README.md remains
✅ **Organized by type** - Reviews, decisions, archives separate
✅ **Easier to find** - Clear directory structure
✅ **No duplicates** - Remove superseded docs
✅ **Versioned reviews** - Date-stamped code reviews

---

## 5. Missing Standard Files

### Critical Missing Files

| File | Purpose | Priority | Status |
|------|---------|----------|--------|
| `.env.example` | Document required env variables | 🔴 **HIGH** | Missing |
| `CONTRIBUTING.md` | Contribution guidelines | 🟡 **MEDIUM** | Missing |
| `CHANGELOG.md` | Version history | 🟢 **LOW** | Missing |
| `.github/workflows/` | CI/CD pipelines | 🟡 **MEDIUM** | Missing |
| `.github/ISSUE_TEMPLATE/` | Issue templates | 🟢 **LOW** | Missing |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR template | 🟢 **LOW** | Missing |

### 1. .env.example (Critical)

**Problem:**
- No documentation of required environment variables
- New contributors don't know what to configure
- API keys were exposed in code review docs

**Create `.env.example`:**

```bash
cat > .env.example << 'EOF'
# NFL Dashboard Environment Variables
# Copy this file to .env.local and add your actual API keys

# The Odds API (Optional)
# Get your key at: https://the-odds-api.com/
# Used for: Betting lines and odds display
NEXT_PUBLIC_ODDS_API_KEY=your_odds_api_key_here

# OpenWeather API (Optional)
# Get your key at: https://openweathermap.org/api
# Used for: Stadium weather conditions (currently disabled)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key_here

# Note: NEXT_PUBLIC_* variables are exposed in the client bundle
# Consider moving sensitive API calls to server-side API routes
EOF
```

**Also Add to README.md:**

```markdown
## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.example .env.local`
4. Add your API keys to `.env.local` (optional)
5. Run development server: `npm run dev`
```

### 2. CONTRIBUTING.md (Medium Priority)

**Create `CONTRIBUTING.md`:**

```markdown
# Contributing to NFL Dashboard

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/nfl-dashboard.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `npm test`
6. Commit with conventional commits: `git commit -m "feat: add new feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep PRs focused and small
- Ensure all tests pass before submitting

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or tooling changes

## Code Review Process

- All PRs require review
- CI must pass (tests, linting)
- Coverage should not decrease
- Update relevant documentation

## Questions?

Open an issue or discussion on GitHub.
```

### 3. CHANGELOG.md (Low Priority)

**Create `CHANGELOG.md`:**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Conference Standings Table with sortable columns
- Multi-tab game management (up to 5 tabs)
- Season selector for historical data

### Changed
- Improved polling system with adaptive intervals
- Enhanced dark mode support

### Fixed
- Type safety improvements in playoff data

## [0.1.0] - 2025-12-23

### Added
- Initial release
- Dashboard with week-by-week game cards
- Live game updates with play-by-play
- Playoff bracket view
- Advanced matchup statistics
```

### 4. GitHub Actions CI/CD (Medium Priority)

**Create `.github/workflows/ci.yml`:**

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linter
      run: npm run lint

    - name: Run tests
      run: npm test -- --coverage

    - name: Build
      run: npm run build

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json
```

---

## 6. Consolidation Recommendations

### Summary of Consolidation Opportunities

| Item | Current State | Proposed State | Effort | Impact |
|------|--------------|----------------|--------|--------|
| **Team Data** | 4 files, ~273 lines | 1 file, ~150 lines | 2-3 hours | High |
| **Documentation** | 8 root files | 1 root file + /docs/ | 1 hour | Medium |
| **Constants/Lib** | Mixed concerns | Clear separation | 1 hour | Medium |
| **Test Files** | 2 temp files | 0 temp files | 5 minutes | Low |

### Consolidation Benefits

**Team Data Consolidation:**
- ✅ Eliminate 150 lines of duplicate code
- ✅ Single source of truth for all team info
- ✅ Type-safe access to team data
- ✅ Easier to add new teams or update existing
- ✅ No risk of inconsistent data

**Documentation Consolidation:**
- ✅ Clean root directory
- ✅ Organized by purpose
- ✅ Easier to find relevant docs
- ✅ No duplicate information

**File Organization:**
- ✅ Clear separation of concerns
- ✅ Predictable locations
- ✅ Easier for new contributors

---

## 7. Implementation Phases

### Phase 1: Immediate Cleanup (30 minutes) ✅ SAFE

**Zero risk deletions:**

```bash
#!/bin/bash
# Run this script to execute Phase 1 cleanup

echo "Phase 1: Immediate Cleanup"
echo "=========================="

# Delete temp files
echo "Deleting temporary test files..."
rm -f __tests__/temp-sumer-stats.test.ts
rm -f __tests__/temp-fetch.test.ts

# Delete empty log
echo "Deleting empty log file..."
rm -f dev.log

# Delete test artifacts
echo "Deleting test artifacts..."
rm -f nflfastr/test_output.json

# Delete duplicate documentation
echo "Deleting duplicate documentation..."
rm -f CODE_REVIEW_SUMMARY.md
rm -f PHASE_1_SUMMARY.md

# Verify export_stats.py is not used
echo "Checking if export_stats.py is referenced..."
if ! grep -r "export_stats" --exclude-dir={node_modules,.next,.git} . > /dev/null 2>&1; then
    echo "No references found. Deleting export_stats.py..."
    rm -f export_stats.py
else
    echo "⚠️  Warning: export_stats.py has references. Manual review needed."
fi

echo ""
echo "✅ Phase 1 Complete!"
echo "Deleted: 5-7 files"
echo "Space saved: ~50 KB"
```

**Impact:**
- Files deleted: 5-7
- Risk: Zero (all are temporary/duplicate/empty)
- Time: 30 minutes
- Space saved: ~50 KB

### Phase 2: Documentation Organization (1 hour)

```bash
#!/bin/bash
# Run this script to execute Phase 2 cleanup

echo "Phase 2: Documentation Organization"
echo "===================================="

# Create docs structure
echo "Creating /docs/ directory structure..."
mkdir -p docs/{archive,decisions,reviews}

# Move active documentation
echo "Moving code review report..."
mv CODE_REVIEW_REPORT.md docs/reviews/CODE_REVIEW_REPORT_2026-01-04.md

echo "Moving testing strategy..."
mv TESTING_STRATEGY.md docs/TESTING_STRATEGY.md

# Move historical docs
echo "Moving historical implementation docs..."
mv PHASE_1_IMPLEMENTATION.md docs/archive/
mv HEADER_REFACTOR_SUMMARY.md docs/archive/

# Move design decisions
echo "Moving design decision docs..."
mv GAME_HEADER_UX_IMPROVEMENTS.md docs/decisions/

# Create docs index
echo "Creating documentation index..."
cat > docs/README.md << 'EOF'
# NFL Dashboard Documentation

## Current Documentation
- [Testing Strategy](./TESTING_STRATEGY.md) - Testing approach and guidelines

## Archive
Historical implementation documentation:
- [Phase 1 Implementation](./archive/PHASE_1_IMPLEMENTATION.md) - Adaptive polling system
- [Header Refactor](./archive/HEADER_REFACTOR_SUMMARY.md) - Header component refactor

## Design Decisions
- [Game Header UX Improvements](./decisions/GAME_HEADER_UX_IMPROVEMENTS.md) - Header UX design

## Code Reviews
- [Code Review 2026-01-04](./reviews/CODE_REVIEW_REPORT_2026-01-04.md) - Comprehensive review

## Contributing
See main [README.md](../README.md) for setup and development instructions.
See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
EOF

echo ""
echo "✅ Phase 2 Complete!"
echo "Organized: 5 documentation files"
echo "Created: /docs/ directory structure"
```

**Impact:**
- Files organized: 5
- Directories created: 4
- Risk: Low (just moving files)
- Time: 1 hour

### Phase 3: Create Missing Standard Files (45 minutes)

```bash
#!/bin/bash
# Run this script to create missing standard files

echo "Phase 3: Create Missing Standard Files"
echo "======================================"

# Create .env.example
echo "Creating .env.example..."
cat > .env.example << 'EOF'
# NFL Dashboard Environment Variables
# Copy this file to .env.local and add your actual API keys

# The Odds API (Optional)
# Get your key at: https://the-odds-api.com/
# Used for: Betting lines and odds display
NEXT_PUBLIC_ODDS_API_KEY=your_odds_api_key_here

# OpenWeather API (Optional)
# Get your key at: https://openweathermap.org/api
# Used for: Stadium weather conditions (currently disabled)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key_here

# Note: NEXT_PUBLIC_* variables are exposed in the client bundle
# Consider moving sensitive API calls to server-side API routes
EOF

# Create CONTRIBUTING.md
echo "Creating CONTRIBUTING.md..."
cat > CONTRIBUTING.md << 'EOF'
# Contributing to NFL Dashboard

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `npm test`
6. Commit: `git commit -m "feat: add new feature"`
7. Push and open a Pull Request

## Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep PRs focused

## Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring

See [Conventional Commits](https://www.conventionalcommits.org/) for more.
EOF

# Create CHANGELOG.md
echo "Creating CHANGELOG.md..."
cat > CHANGELOG.md << 'EOF'
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Conference Standings Table with sortable columns
- Multi-tab game management
- Season selector

### Changed
- Improved polling system

## [0.1.0] - 2025-12-23

### Added
- Initial release
EOF

echo ""
echo "✅ Phase 3 Complete!"
echo "Created: .env.example, CONTRIBUTING.md, CHANGELOG.md"
```

**Impact:**
- Files created: 3
- Risk: Zero (new files)
- Time: 45 minutes

### Phase 4: Team Data Consolidation (2-3 hours) ⚠️ TEST REQUIRED

**See detailed implementation in Section 2**

**Steps:**
1. Create new `constants/teams.ts` with consolidated data
2. Update 7 import statements across codebase
3. Run full test suite: `npm test`
4. Build project: `npm run build`
5. Manual testing of team-related features
6. Delete deprecated files

**Impact:**
- Files consolidated: 4 → 1
- Lines saved: ~150
- Risk: Medium (requires testing)
- Time: 2-3 hours

### Phase 5: File Reorganization (1 hour)

```bash
#!/bin/bash
# Run this script for Phase 5 reorganization

echo "Phase 5: File Reorganization"
echo "============================="

# Move data objects to constants
echo "Moving stadiums.ts to constants..."
git mv lib/stadiums.ts constants/stadiums.ts

# Move service to services
echo "Moving sumerSportsService to services..."
git mv lib/sumerSportsService.ts services/sumer-sports-service.ts

# Update imports (manual step)
echo ""
echo "⚠️  Manual step required:"
echo "Update imports in:"
echo "  - services/gameService.ts (stadiums import)"
echo "  - Any files importing sumerSportsService"

echo ""
echo "After updating imports, run:"
echo "  npm test"
echo "  npm run build"
```

**Impact:**
- Files moved: 2
- Imports to update: 2-3
- Risk: Low (git tracks moves)
- Time: 1 hour

---

## 8. Risk Assessment

### Risk Matrix

| Phase | Risk Level | Test Coverage Required | Rollback Difficulty |
|-------|------------|----------------------|-------------------|
| Phase 1: Delete deprecated | ✅ **Zero** | None | N/A (permanent) |
| Phase 2: Organize docs | 🟢 **Low** | Manual verification | Easy (git revert) |
| Phase 3: Create files | ✅ **Zero** | None | Easy (delete files) |
| Phase 4: Consolidate teams | 🟡 **Medium** | Full test suite + manual | Medium (restore files) |
| Phase 5: Reorganize files | 🟢 **Low** | Build + tests | Easy (git revert) |

### Testing Requirements by Phase

**Phase 1:** None (safe deletions)

**Phase 2:**
- Verify no broken links in documentation
- Check README.md references

**Phase 3:**
- Verify .env.example has correct variables
- Test setup process with new contributor

**Phase 4:**
- ✅ Run full test suite: `npm test`
- ✅ Build project: `npm run build`
- ✅ Manual testing:
  - Dashboard game cards display team logos
  - Playoff standings show correct teams
  - Team selector works
  - Game detail page displays teams correctly
  - Matchup stats show team colors

**Phase 5:**
- ✅ Run tests: `npm test`
- ✅ Build: `npm run build`
- Manual: Verify affected features work

### Rollback Procedures

**Phase 1 (Deleted Files):**
```bash
# Cannot rollback - files permanently deleted
# But all deleted files were temporary/duplicate/empty
# No functional impact
```

**Phase 2 (Moved Docs):**
```bash
# If needed, move files back:
git mv docs/reviews/CODE_REVIEW_REPORT_2026-01-04.md CODE_REVIEW_REPORT.md
git mv docs/TESTING_STRATEGY.md TESTING_STRATEGY.md
# etc.
```

**Phase 3 (New Files):**
```bash
# Simply delete if needed:
rm .env.example CONTRIBUTING.md CHANGELOG.md
```

**Phase 4 (Team Consolidation):**
```bash
# Restore from git:
git checkout HEAD -- constants/teams.ts
git checkout HEAD -- constants/mappings.ts
git checkout HEAD -- lib/team-branding.ts
git checkout HEAD -- lib/nfl-data.ts
# Restore all updated imports
```

**Phase 5 (File Reorganization):**
```bash
# Git revert the move commits:
git revert <commit-hash>
```

---

## Implementation Checklist

### Pre-Implementation

- [ ] Backup current state: `git commit -am "Pre-cleanup checkpoint"`
- [ ] Create feature branch: `git checkout -b cleanup/project-structure`
- [ ] Review all changes with team
- [ ] Schedule testing time

### Phase 1: Immediate Cleanup ✅

- [ ] Delete temporary test files
- [ ] Delete empty log file
- [ ] Delete test artifacts
- [ ] Delete duplicate documentation
- [ ] Verify export_stats.py usage
- [ ] Commit: `git commit -m "chore: delete deprecated files"`

### Phase 2: Documentation Organization

- [ ] Create /docs/ directory structure
- [ ] Move code review reports
- [ ] Move historical docs
- [ ] Move design decisions
- [ ] Create docs/README.md
- [ ] Update root README.md references
- [ ] Commit: `git commit -m "docs: organize documentation structure"`

### Phase 3: Standard Files

- [ ] Create .env.example
- [ ] Create CONTRIBUTING.md
- [ ] Create CHANGELOG.md
- [ ] Update README.md with setup instructions
- [ ] Commit: `git commit -m "docs: add standard project files"`

### Phase 4: Team Consolidation ⚠️

- [ ] Create new constants/teams.ts with consolidated data
- [ ] Update services/gameService.ts imports
- [ ] Update services/playoffService.ts imports
- [ ] Update services/matchupService.ts imports
- [ ] Update components/TeamSelector.tsx imports
- [ ] Update components/SafeImage.tsx imports
- [ ] Update app/team/[teamAbbr]/page.tsx imports
- [ ] Update lib/nfl-data.ts (remove TEAM_MAP)
- [ ] Run tests: `npm test`
- [ ] Build: `npm run build`
- [ ] Manual testing checklist
- [ ] Delete deprecated files
- [ ] Commit: `git commit -m "refactor: consolidate team data into single source"`

### Phase 5: File Reorganization

- [ ] Move lib/stadiums.ts → constants/stadiums.ts
- [ ] Move lib/sumerSportsService.ts → services/
- [ ] Update imports in services/gameService.ts
- [ ] Update any sumerSportsService imports
- [ ] Run tests: `npm test`
- [ ] Build: `npm run build`
- [ ] Commit: `git commit -m "refactor: reorganize constants and services"`

### Post-Implementation

- [ ] Full regression testing
- [ ] Update README.md if needed
- [ ] Create pull request
- [ ] Code review
- [ ] Merge to main

---

## Expected Outcomes

### Quantitative Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Root documentation files | 8 | 1 | -87.5% |
| Team data locations | 4 | 1 | -75% |
| Duplicate code lines | ~150 | 0 | -100% |
| Temporary test files | 2 | 0 | -100% |
| Total files | 80+ | 75+ | -6% |
| Organization clarity | Low | High | ✅ |

### Qualitative Improvements

✅ **Single Source of Truth** for team data
✅ **Clear Organization** with docs/ structure
✅ **Better Onboarding** with .env.example and CONTRIBUTING.md
✅ **Reduced Maintenance** burden
✅ **Improved Consistency** across codebase
✅ **Easier Navigation** for new contributors

---

## Timeline

**Total Estimated Time:** 5-7 hours

| Phase | Time | Can Run In Parallel? |
|-------|------|---------------------|
| Phase 1: Immediate Cleanup | 30 min | No (sequential) |
| Phase 2: Documentation | 1 hour | After Phase 1 |
| Phase 3: Standard Files | 45 min | Can parallelize with Phase 2 |
| Phase 4: Team Consolidation | 2-3 hours | After Phases 1-3 |
| Phase 5: File Reorganization | 1 hour | After Phase 4 |

**Recommended Schedule:**
- **Day 1:** Phases 1-3 (2-3 hours)
- **Day 2:** Phase 4 with testing (3-4 hours)
- **Day 3:** Phase 5 + final testing (2 hours)

---

## Conclusion

This project structure review identified **33 actionable items** that will significantly improve the maintainability and organization of the NFL Dashboard codebase. The cleanup is divided into 5 phases with clear risk assessment and rollback procedures.

**Key Recommendations:**
1. ✅ Execute Phase 1 immediately (zero risk)
2. 📋 Create .env.example (critical for security)
3. 🔄 Consolidate team data (high impact)
4. 📁 Organize documentation
5. 🔧 Standardize file organization

**Next Steps:**
1. Review this document with team
2. Execute Phase 1 cleanup
3. Create feature branch for remaining phases
4. Implement phases 2-5 with testing
5. Submit pull request for review

---

*Generated: January 4, 2026*
*Review Tool: Claude Code*
*Project: NFL Dashboard v0.1.0*
