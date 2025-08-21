# UTF-8 Safety for String-Store Operations

## Summary

This fix addresses potential UTF-8 character corruption issues in the string-store serialization/deserialization operations used for Discord component custom IDs. While no actual UTF-8 corruption was found in the current implementation, the changes provide defensive measures to ensure data integrity.

## Changes Made

### 1. Enhanced Utils.store wrapper with UTF-8 validation

- Added UTF-8 integrity checks for both serialization and deserialization
- Added Discord custom ID length validation (100 character limit)
- Enhanced error messages with debugging context
- Added specific handling for string-store buffer overflow errors

### 2. Comprehensive test coverage

- Created `__tests__/StringStoreUTF8.test.ts` with 14 test cases
- Tests cover emoji handling, Unicode characters, complex emoji sequences
- Validates round-trip integrity
- Tests error handling and validation

## Technical Details

### What the fix prevents:

1. **UTF-8 Corruption**: Validates that serialized strings maintain UTF-8 integrity
2. **Discord Limit Violations**: Ensures custom IDs don't exceed 100 characters
3. **Silent Failures**: Provides clear error messages with debugging context
4. **Buffer Overflows**: Handles string-store buffer overflow gracefully

### Test Results:

- ✅ All 37 tests pass (23 existing + 14 new UTF-8 safety tests)
- ✅ Project builds successfully with TypeScript
- ✅ Backward compatibility maintained
- ✅ Real-world scenarios tested (emojis, Unicode, complex sequences)

## Usage

The fix is transparent to existing code. All existing calls to `Utils.store.serialize()` and `Utils.store.deserialize()` will now benefit from the additional safety checks without any code changes required.

Example of enhanced error messages:

```
Before: "The buffer is full"
After: "String-store buffer overflow: Data is too large to serialize. Consider reducing the size of the data. Data: {...}"
```
