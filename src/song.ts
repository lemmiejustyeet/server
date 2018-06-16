import * as uuid from "uuid";

/**
 * Song type
 */
export interface Song {
    _id?: string;
    _rev?: string;
    title: string;
    date: number;
    image_url?: string;
    url: string;
    othersongs?: string[];
    ratings?: {
        up: number;
        down: number;
    };
}
/**
 * Verify the entergity of a song
 * @param song Song to verify
 */
export function verifySong(song: Song): Song {
    if (!song.title)
        throw TypeError("Song requires property 'title'");

    if (!song.url)
        throw TypeError("Song requires property 'url'");

    return {
        _id: song._id || uuid(),
        _rev: song._rev,
        title: song.title,      // !
        date: song.date || Date.now(),
        image_url: song.image_url,
        url: song.url,          // !
        othersongs: song.othersongs,
        ratings: {
            up: song.ratings ? song.ratings.up : 0,
            down: song.ratings ? song.ratings.down : 0,
        }
    };
}

export function cleanAllSongs<T>(songs: T[]) {
    for (let i in songs) {
        songs[i] = cleanSong(songs[i]) as any;
    }
    return songs;
}
export function cleanSong<T>(song: T): Song[] {
    for (let prop in song) {
        if (prop.startsWith("_"))
            delete song[prop];
    }
    return song as any;
}