#!/usr/bin/env bash

read -r -d '' re << 'HEREDOC'
\$t\( *['"]\K[^\)]+(?= *['"]\))|\$tlang\( *[^,]+, *['"]\K[^\)]+(?= *['"]\))|{{ *['"]\K[^\|]+(?= *['"] *\| *translate)
HEREDOC

found_strings=$(grep -rnoP "$re" src)
translation_files=(src/locales/*.json)

old_IFS=$IFS
IFS=:
for translation_file in "${translation_files[@]}"; do
  echo "$found_strings" | while read -ra line; do
    file="${line[0]}"
    linenumber="${line[1]}"
    string="${line[2]}"
      if ! egrep "$string\": \".+\"" "$translation_file" >/dev/null; then
        echo "$translation_file => $file:$linenumber:$string"
      fi
  done
done
IFS=$old_IFS
