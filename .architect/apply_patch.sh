#!/bin/bash
TARGET_FILE=$1
PATCH_TMP=$(mktemp); cat > "$PATCH_TMP"
SEARCH_TMP=$(mktemp); REPLACE_TMP=$(mktemp)

# 提取 SEARCH 和 REPLACE 块
awk '/^<<<<<< SEARCH/{flag=1; next} /^======/{flag=0; exit} flag' "$PATCH_TMP" > "$SEARCH_TMP"
awk '/^======/{flag=1; next} /^>>>>>> REPLACE/{flag=0; exit} flag' "$PATCH_TMP" > "$REPLACE_TMP"

# 执行匹配与替换
if awk -v s_file="$SEARCH_TMP" -v r_file="$REPLACE_TMP" -v t_file="$TARGET_FILE" '
BEGIN {
    n_search = 0
    while ((getline < s_file) > 0) {
        n_search++; search_lines[n_search] = $0
        comp = $0; sub(/^[ \t]+/, "", comp); sub(/[ \t\r]+$/, "", comp); search_comp[n_search] = comp
    }
    close(s_file)

    n_replace = 0
    while ((getline < r_file) > 0) {
        n_replace++; replace_lines[n_replace] = $0
    }
    close(r_file)

    n_target = 0
    while ((getline < t_file) > 0) {
        n_target++; target_lines[n_target] = $0
        comp = $0; sub(/^[ \t]+/, "", comp); sub(/[ \t\r]+$/, "", comp); target_comp[n_target] = comp
    }
    close(t_file)

    match_idx = 0
    if (n_search > 0) {
        for (i = 1; i <= n_target - n_search + 1; i++) {
            matched = 1
            for (j = 1; j <= n_search; j++) {
                if (target_comp[i + j - 1] != search_comp[j]) {
                    matched = 0; break
                }
            }
            if (matched) { match_idx = i; break }
        }
    }

    if (match_idx == 0 || n_search == 0) {
        print "ERROR: SEARCH block not found or empty." > "/dev/stderr"
        exit 1
    }

    for (i = 1; i < match_idx; i++) print target_lines[i]
    for (i = 1; i <= n_replace; i++) print replace_lines[i]
    for (i = match_idx + n_search; i <= n_target; i++) print target_lines[i]
}' > "${TARGET_FILE}.tmp"; then
    mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
    EXIT_CODE=0
else
    rm -f "${TARGET_FILE}.tmp"
    EXIT_CODE=1
fi

rm -f "$PATCH_TMP" "$SEARCH_TMP" "$REPLACE_TMP"
exit $EXIT_CODE
