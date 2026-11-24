# Warm studio restoration

The current UI uses #f4f3ef, white cards, charcoal text and #f97316/#ff5533 accents. The polar/racing-red overrides and outlined oversized hero were removed. Hero type is capped at 64px, section titles at 44px and project/experience card titles at 21px, with smaller mobile rules.

All HTML video elements now come from src/components/VideoPlayer.jsx. The shared player sets controls=true, controlsList=nodownload, playsInline=true, autoPlay=false and preload=metadata. It does not assign muted, defaultMuted, volume or play() on open. Native playback starts only after the visitor presses Play; closing a modal pauses its video. Browser checks verified initial paused/unmuted state, Play, persistent native mute selection, unmute and Pause.

PromoSection.jsx embeds /media/videos/promo.mp4 directly in a responsive frosted white frame, with a light orange hover/focus border and Framer Motion entrance. Its download button serves the real supplied resume PDF at /media/files/Muhammad_Huzaifa_Resume.pdf. No placeholder .aep link is exposed.

## Current showreel

The real MP4 is 60 seconds, 1920x1080, 60 fps, H.264 video with AAC 48 kHz stereo audio. It follows six chapters: branding (0–8), software logos (8–18), WADA/Signal Shutdown gameplay (18–30), R.I.S.E (30–42), arcade games and 3D turntables (42–52), achievement/contact outro (52–60).

The soundtrack, percussion, whoosh and impact accents are synthesized locally at 140 BPM. No third-party music recording was used. Technology marks come from the Simple Icons CC0 collection; see creative/promo/branding/SOURCES.txt.

Turntables were recorded from the actual FBX/GLB models using the local-only model-preview.html studio. Files are retained under creative/promo/turntables/. R.I.S.E uses the supplied workflow film with the requested hand-tracking/VR/parent-analytics labels; no survey scores or clinical results were invented.

The MP4 is rendered using FFmpeg. creative/promo/Build-Promo.jsx builds an editable native After Effects composition at 1080p/60fps with motion blur and six scene compositions. It adds to the open AE project without deleting existing work. Use After Effects to save a native .aep if required. The website provides the resume-download alternative requested in the brief.

Run npm run promo:render to reproduce the movie and npm run promo:verify to inspect its format and contact sheet. The renderer supports --chapters=1,3 for replacing selected zero-based chapters before remuxing. Rendered MP4 publication uses a completed temporary file to avoid serving a partial movie.

Vite ignores generated creative/, docs/ and public/media/ files to avoid Windows EBUSY watcher crashes. Reload the page after replacing a media file. Source code still hot-reloads normally.
