import json
import requests
import lyricsPaser

status: int
id: int
lyrics: dict = {}
trans: bool = True
tlyrics: dict = {}
progress: float
currentLyric: str


def update(current_id: int = 0) -> dict:
    global status, id, lyrics, tlyrics, progress
    try:
        res = requests.get("http://127.0.0.1:27232/player")
    except:
        status = 404
        return {"status": status}
    status = res.status_code
    metadata = json.loads(res.text)
    progress = metadata["progress"]
    id = metadata["currentTrack"]["id"]
    if id != current_id or not lyrics:
        [lyrics, tlyrics] = getLyrics(id)
    return {"status": status}


def getLyrics(id: int) -> tuple:
    global trans
    res = requests.get("http://127.0.0.1:10754/lyric?id=" + str(id))
    lyrics_metadata = json.loads(res.text)
    lyrics = lyricsPaser.lrc2dict(lyrics_metadata["lrc"]["lyric"])
    tlyrics = lyrics_metadata.get('tlyric', 0)
    if tlyrics != 0:
        trans = True
        tlyrics = lyricsPaser.lrc2dict(lyrics_metadata["tlyric"]["lyric"])
    else:
        trans = False
    return (lyrics, tlyrics)


def getCurrentLyric(current_id: int) -> dict:
    global progress, lyrics, tlyrics, trans, id, status
    update(current_id)
    if status == 404:
        return {"status": 404}
    key: int = {}
    for item in lyrics.items():
        if item[0] <= progress+2:
            key = item[0]
        if tlyrics == {} :
            trans = False
    try:
        if trans:
            return {
                "id": id,
                "lyric": lyrics[key],
                "tlyric": tlyrics[key],
                "status": status,
                "trans": trans,
            }
        else:
            return {
                "id": id,
                "lyric": lyrics[key],
                "status": status,
                "trans": trans,
            }
    except:
        if key != {} :
            aaa = False
            return {"status": 200,
                    "lyric": lyrics[key],
                    "trans": aaa,
                    "id": id}
        else:
            return {"status": 404,
                    "id": id}
        update()
