#!/usr/bin/zsh


command -v playerctl >/dev/null 2>&1 || {
  echo >&2 "Program 'playerctl' required but is not installed.
Aborting."
  exit 1
}

playerctl -p yesplaymusic status || \
case $BLOCK_BUTTON in
1) echo "ok" & i3-msg -q exec yesplaymusic & exit 0;;
# 1) yesplaymusic && exit 0;;
esac


playerctl -p yesplaymusic metadata | \
awk -F'xesam:title|xesam:artist' '
# 如果匹配到 xesam:title 行，将其值存入变量 title
/xesam:title/ {title=$2} \
# 如果匹配到 xesam:artist 行，去除每行的前后空格，并将其拼接到变量 artist（用 "," 分隔）
/xesam:artist/ {
    # 去掉当前行 artist 的前后空格
    gsub(/^ +| +$/, "", $2)
    if (artist != "") {
        artist = artist "," $2
    } else {
        artist = $2
    }
} \
# 在处理完所有输入后，执行以下操作
END {
    # 去掉 title 和 artist 的首尾空格
    gsub(/^ +| +$/, "", title)
    gsub(/^ +| +$/, "", artist)
    # 输出歌名和作者，多个作者用 "," 隔开
    print title "-" artist
  }'

case $BLOCK_BUTTON in
1) playerctl -p yesplaymusic previous ;;
2) playerctl -p yesplaymusic play-pause ;;
3) playerctl -p yesplaymusic next ;;
esac