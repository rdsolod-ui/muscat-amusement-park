import subprocess,pathlib,sys,json,shutil,hashlib
src=pathlib.Path(sys.argv[1]);root=pathlib.Path(__file__).resolve().parents[3];work=pathlib.Path(sys.argv[2]);out=root/'public/media/v5/boomerang-video.webm';ffmpeg=shutil.which('ffmpeg');ffprobe=shutil.which('ffprobe')
def run(args):return subprocess.run(args,capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW,timeout=600,check=True)
meta=json.loads(run([ffprobe,'-v','error','-show_streams','-show_format','-of','json',str(src)]).stdout)
args=[ffmpeg,'-hide_banner','-y','-i',str(src),'-map','0:v:0','-map','0:a:0?','-vf','scale=1080:1920:flags=lanczos','-c:v','libvpx-vp9','-b:v','5M','-maxrate','7M','-bufsize','10M','-crf','32','-deadline','good','-cpu-used','3','-row-mt','1','-tile-columns','1','-threads','8','-pix_fmt','yuv420p','-c:a','libopus','-b:a','192k','-map_metadata','-1',str(out)]
r=run(args);(work/'video-encode.log').write_bytes(r.stderr)
final=json.loads(run([ffprobe,'-v','error','-count_frames','-show_streams','-show_format','-of','json',str(out)]).stdout)
for label,t in [('first',0),('middle',7.3),('last',14.58)]:
 run([ffmpeg,'-hide_banner','-y','-ss',str(t),'-i',str(out),'-frames:v','1',str(work/('video-'+label+'.png'))])
run([ffmpeg,'-hide_banner','-y','-ss','0','-i',str(out),'-frames:v','1','-c:v','libwebp','-quality','90',str(root/'public/media/v5/boomerang-video-poster.webp')])
video=next(s for s in final['streams']if s['codec_type']=='video');audio=next(s for s in final['streams']if s['codec_type']=='audio')
report={'source':'boomerang-video.mp4','source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'source_video':{k:meta['streams'][0].get(k)for k in ['width','height','duration','nb_frames','avg_frame_rate']},'output':'media/v5/boomerang-video.webm','output_bytes':out.stat().st_size,'output_sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'output_duration':float(final['format']['duration']),'video':{k:video.get(k)for k in ['codec_name','width','height','display_aspect_ratio','avg_frame_rate','nb_read_frames']},'audio':{k:audio.get(k)for k in ['codec_name','sample_rate','channels','channel_layout']},'source_preserved':True,'no_cropping_or_trim':True,'derivative_resolution':'1080x1920 for browser playback; original4K retained','pass':video['nb_read_frames']=='730'and abs(float(final['format']['duration'])-14.6)<.04 and audio['channels']==2}
(root/'design/v5/video-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
