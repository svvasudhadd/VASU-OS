#!/bin/bash
VAULT="$HOME/Documents/Obsidian"
DIARY="$VAULT/Дневник"
FILE="$DIARY/$(date +%Y-%m-%d).md"

mkdir -p "$DIARY"

if [ -f "$FILE" ]; then
  exit 0
fi

declare -A MONTHS=(
  [01]="января" [02]="февраля" [03]="марта" [04]="апреля"
  [05]="мая" [06]="июня" [07]="июля" [08]="августа"
  [09]="сентября" [10]="октября" [11]="ноября" [12]="декабря"
)

cat > "$FILE" <<EOF
# $(date +%-d) ${MONTHS[$(date +%m)]} $(date +%Y)

## План дня
- [ ]

## Сделано
- [ ]

## Заметки
_

## Настроение
_

## Завтра
_
EOF
