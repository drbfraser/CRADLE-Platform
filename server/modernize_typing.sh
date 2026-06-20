#!/usr/bin/env bash
# Modernizes Python typing imports from typing.List/Dict/Set/Tuple to built-in generics.
# Requires Python 3.9+. We are on 3.10 (see server/Dockerfile).
#
# Usage (from repo root, inside Docker or with ruff installed):
#   bash scripts/modernize_typing.sh [--optional] [--dry-run]
#
# Flags:
#   --optional   Also convert Optional[X] -> X | None  (UP007, more invasive)
#   --dry-run    Show what would change without applying fixes

set -e

TARGET="server/"
RULES="UP006,UP035"
DRY_RUN=false

for arg in "$@"; do
    case $arg in
        --optional) RULES="$RULES,UP007" ;;
        --dry-run)  DRY_RUN=true ;;
    esac
done

echo "=== Typing modernization ==="
echo "Target : $TARGET"
echo "Rules  : $RULES"
echo "Dry run: $DRY_RUN"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "--- Files that would change ---"
    ruff check "$TARGET" --select "$RULES" --diff
    echo ""
    echo "--- Summary ---"
    ruff check "$TARGET" --select "$RULES" --statistics
else
    echo "--- Applying fixes ---"
    ruff check "$TARGET" --select "$RULES" --fix
    echo ""
    echo "--- Formatting ---"
    ruff format "$TARGET"
    echo ""
    echo "--- Verifying no issues remain ---"
    ruff check "$TARGET" --select "$RULES"
    echo ""
    echo "Done. Review changes with: git diff server/"
    echo "Run tests with:            pytest server/tests/"
fi
