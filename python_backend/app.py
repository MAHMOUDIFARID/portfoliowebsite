import os
import sys
import tempfile
import json
import traceback
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
from mutagen.easyid3 import EasyID3
from mutagen.id3 import ID3, APIC, ID3NoHeaderError

app = Flask(__name__)
CORS(app)

TEMP_DIR = tempfile.gettempdir()

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'online',
        'engine': 'Python yt-dlp',
        'version': yt_dlp.version.__version__
    })

@app.route('/api/info', methods=['POST'])
def get_info():
    data = request.get_json() or {}
    url = data.get('url', '').strip()
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Format durations
            duration = info.get('duration', 0)
            mins = duration // 60
            secs = duration % 60
            duration_str = f"{mins}:{secs:02d}"

            result = {
                'title': info.get('title', 'Unknown Title'),
                'channel': info.get('uploader') or info.get('channel') or 'Unknown Uploader',
                'duration': duration,
                'duration_str': duration_str,
                'thumbnail': info.get('thumbnail'),
                'description': (info.get('description') or '')[:300],
                'id': info.get('id'),
                'views': info.get('view_count', 0)
            }
            return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download', methods=['POST'])
def download_media():
    data = request.get_json() or {}
    url = data.get('url', '').strip()
    mode = data.get('mode', 'audio')  # 'audio' or 'video'
    quality = data.get('quality', '1080') # '1080', '720', '320'
    
    # Metadata tags (optional for audio)
    meta_title = data.get('title')
    meta_artist = data.get('artist')
    meta_album = data.get('album')

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    temp_id = next(tempfile._get_candidate_names())
    output_template = os.path.join(TEMP_DIR, f"ytdl_{temp_id}.%(ext)s")

    try:
        if mode == 'audio':
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': output_template,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '320',
                }],
                'quiet': True,
                'no_warnings': True,
            }
        else:
            # Video mode
            format_spec = f"bestvideo[height<={quality}]+bestaudio/best[height<={quality}]/best"
            ydl_opts = {
                'format': format_spec,
                'outtmpl': output_template,
                'merge_output_format': 'mp4',
                'quiet': True,
                'no_warnings': True,
            }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_title = info.get('title', 'downloaded_media')
            
            # Find output file
            expected_ext = 'mp3' if mode == 'audio' else 'mp4'
            final_filename = os.path.join(TEMP_DIR, f"ytdl_{temp_id}.{expected_ext}")
            
            if not os.path.exists(final_filename):
                # Search for any generated file with temp_id
                for f in os.listdir(TEMP_DIR):
                    if f.startswith(f"ytdl_{temp_id}"):
                        final_filename = os.path.join(TEMP_DIR, f)
                        break

            if not os.path.exists(final_filename):
                return jsonify({'error': 'Failed to locate downloaded file'}), 500

            # Apply ID3 Metadata tags for MP3 audio files
            if mode == 'audio' and final_filename.endswith('.mp3'):
                try:
                    try:
                        audio = EasyID3(final_filename)
                    except ID3NoHeaderError:
                        audio = EasyID3()
                    
                    if meta_title:
                        audio['title'] = meta_title
                    else:
                        audio['title'] = video_title

                    if meta_artist:
                        audio['artist'] = meta_artist
                    
                    if meta_album:
                        audio['album'] = meta_album
                        
                    audio.save(final_filename)
                except Exception as tag_err:
                    print(f"Warning ID3 tagging failed: {tag_err}")

            safe_name = "".join([c for c in video_title if c.isalnum() or c in (' ', '-', '_')]).rstrip()
            download_name = f"{safe_name}.{expected_ext}"

            return send_file(
                final_filename,
                as_attachment=True,
                download_name=download_name,
                mimetype='audio/mpeg' if mode == 'audio' else 'video/mp4'
            )

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f"Python Download Error: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Python yt-dlp Backend Service running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
