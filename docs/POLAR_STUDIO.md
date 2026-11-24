# Polar studio refactor — November 11, 2026

The uploaded palette reference drives the visual system: polar #f8fafc/#f1f5f9 as the main canvas, glacier #e2e8f0/#cbd5e1 for frames and panels, and racing red #E4002B for actions, active tabs and highlights. The 60/30/10 balance is a design guide, not a pixel-count claim over the original project artwork. Orange/yellow UI accents were removed; original model and photo colors are preserved.

The Behance reference was inspected in the browser. Its oversized solid/outline editorial lettering, generous white space and artwork-first framing informed the new hero and card layout. No reference artwork was copied. System fonts keep the page independent of external font services.

R.I.S.E uses /media/images/fyp.jpg and /media/videos/fyp.mp4. Existing FYP.jpeg and GameConRunner.jpeg images were copied to .jpg aliases; the video filename was normalized from FYP.mp4 to fyp.mp4 for case-sensitive hosting.

Kiki the Explorer, Mochi 3D and MyAvatar have dedicated rendered thumbnails. The local model-preview.html thumbnail studio is not a production build entry. Model transforms are normalized and centered before Bounds measures the scene, preserving the authored asset transforms. The modal uses FOV 45 and initial camera position [0,1.2,3.5], plus orbit/zoom/pan and reset.

Videos request unmuted playback with volume controls. If browser autoplay policy blocks sound, the modal presents Play with sound rather than silently muting the video. A click/keyboard gesture starts playback. Closing or switching previews pauses the old player.

GameCon Runner-up has a clickable photograph with a full-resolution modal. The new Film section and navigation link open a 45-second original portfolio motion-graphics film.

## Promo source and rendering

public/media/videos/promo.mp4 is a real 1280x720, 24-fps, 45-second H.264/AAC stereo file. It contains five kinetic-title chapters, portfolio images, fades and original synthesized background music. No licensed music or AI service is needed.

The MP4 was rendered with FFmpeg, not exported by an installed After Effects application. creative/promo/Build-Promo.jsx is an editable Adobe After Effects ExtendScript source: run it via File > Scripts > Run Script File. It adds a new composition to the open project without removing existing work. It uses storyboard.json and background.wav in the same folder plus the portfolio images. Save/export the resulting composition in After Effects if an .aep or native AE export is required.

To reproduce the existing MP4: npm run promo:render. ffmpeg-static is a development dependency. Intermediate chapters, filters and original music are retained in creative/promo/. The script requires the model thumbnails to have been captured first. It rewrites only its own generated assets.
