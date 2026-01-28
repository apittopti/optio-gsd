# Changelog: v2.4.0

## Summary

Remove redundant VERSION file to establish single source of truth for version tracking.

## Changes

### Cleanup
- Removed `VERSION` file from repository
- Updated `help.md` to read version from `package.json` instead of VERSION file

## Technical

- **Single source of truth:** `package.json` is now the only place version is tracked
- No more risk of version mismatch between files

## Files Changed

| File | Change |
|------|--------|
| `VERSION` | Deleted |
| `commands/opti-gsd/help.md` | Updated to use package.json |
