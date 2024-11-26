import getLyrics

current_id = 0
res=getLyrics.getCurrentLyric(current_id);

if res["status"] == 404:
    print("宋子龙帅帅帅帅帅帅帅帅")
    exit(0)

print(res["lyric"])
