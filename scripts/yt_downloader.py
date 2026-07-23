#!/usr/bin/env python3
"""
Standalone CLI tool for downloading YouTube audio and video with Python yt-dlp & mutagen.
"""

import os
import sys
import argparse
import yt_dlp
from mutagen.easyid3 import EasyID3

def main():
    parser = argparse.ArgumentParser(description="Python YouTube Media Downloader & ID3 Tagger")
    parser.add_argument("url", help="YouTube video or playlist URL")
    parser.add_argument("--mode", choices=["audio", "video"], default="audio", help="Download mode (default: audio)")
    parser.add_argument("--quality", default="1080", help="Video quality or audio bitrate (e.g. 1080, 720, 320)")
    parser.add_argument("--title", help="Custom MP3 Title tag")
    parser.add_argument("--artist", help="Custom MP3 Artist tag")
    parser.add_argument("--album", help="Custom MP3 Album tag")
    
    args = parser.parse_args()

    print(f"[Processing] {args.url} (Mode: {args.mode})")

    if args.mode == "audio":
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': '%(title)s.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': args.quality,
            }],
        }
    else:
        ydl_opts = {
            'format': f"bestvideo[height<={args.quality}]+bestaudio/best[height<={args.quality}]/best",
            'outtmpl': '%(title)s.%(ext)s',
            'merge_output_format': 'mp4',
        }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(args.url, download=True)
        filename = ydl.prepare_filename(info)
        
        if args.mode == "audio":
            base, _ = os.path.splitext(filename)
            mp3_filename = f"{base}.mp3"
            if os.path.exists(mp3_filename) and (args.title or args.artist or args.album):
                try:
                    audio = EasyID3(mp3_filename)
                    if args.title: audio['title'] = args.title
                    if args.artist: audio['artist'] = args.artist
                    if args.album: audio['album'] = args.album
                    audio.save()
                    print("[Success] ID3 Tags applied successfully!")
                except Exception as e:
                    print(f"Warning: Tagging error: {e}")

    print("[Complete] Done!")

if __name__ == "__main__":
    main()
