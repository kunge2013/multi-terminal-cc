# TODOS

## MVP (v0.0.0.0) - Current

### Core Implementation
- [x] Read ~/.claude/sessions/*.json
- [x] Display session list (PID, cwd, status, description)
- [x] Keyboard navigation (↑↓, Enter info, q quit)
- [x] Edit description (press 'e')
- [x] Persist descriptions to ~/.claude/session-labels.json
- [x] PID liveness check with procStart validation
- [x] Schema version check (2.1.119)
- [x] 2-second polling
- [x] Manual refresh ('r' key)

### Documentation
- [x] VERSION file
- [x] CHANGELOG.md
- [x] TODOS.md
- [x] GitHub Actions CI workflow
- [x] README.md (user guide)

### Testing
- [x] Unit tests for session.ts (~8 tests)
- [x] Unit tests for store.ts (~4 tests)
- [x] Unit tests for types.ts (~3 tests)

### CI/CD
- [x] GitHub Actions workflow for build/release

## Post-MVP (v1.1)

### Features
- [ ] tmux auto-attach support
- [ ] Clear completed sessions ('c' key)
- [ ] Show session duration
- [ ] Color coding by status

### Platform Support
- [ ] macOS support (ps -o lstart)
- [ ] Windows support (WMI/Win32 API)

### Testing
- [ ] E2E tests with mock sessions
- [ ] Integration tests with real sessions