
# Creative Worlds / reference-inspired portfolio film

Reference reviewed in YouTube: https://www.youtube.com/watch?v=kTKXK2W1WVo (48-second SaaS / 3D motion promo).

The new film recreates the visual direction with original Three.js scenes: pastel blue/lilac studio lighting, a laptop/desk opening, frosted floating cards, layered interfaces, orange workflow connections, matte surfaces with no mirrored ground, gentle camera motion, light transitions and glass bubbles. It is an original adaptation using Huzaifa's portfolio, rather than a frame-for-frame copy of the reference or its soundtrack.

Content: Muhammad Huzaifa introduction; NED Gaming & Animation final year; CGPA 3.57; Unity, Blender, React, Three.js, C#, Python; WADA and The Signal Shutdown gameplay; R.I.S.E VR; FlappyBird, MrJungle, NinniTrap; custom Blender avatar and character collection; GameCon runner-up; The Game Storm Studio internship; email CTA.

Audio: original 118 BPM synthesized electronic music, percussion, transition whooshes and impacts; original English narration voiced using Microsoft Edge en-US-GuyNeural. Script and timings are in narration.json. No reference music or recordings were copied. Optional English captions are embedded as a native VTT track in the portfolio player.

Final master: public/media/videos/promo.mp4, 1920x1080, 30 fps, 48.00 seconds, H264/AAC stereo. Exact 1,440-frame sequence. Smooth 720p native MP4/MP3 and WebM/Opus versions retain the entire 48-second film. Native mute/unmute controls remain the only playback controls. Delivery revision creative-worlds-48-v5 prevents reusing an old cached reel. Prior reel is preserved as previous-promo.mp4.

Rebuild workflow:
1. Generate voice files: python creative/reference-reel/narrate.py (local edge-tts dependencies are in python/).
2. Prepare audio: npm run promo:audio.
3. Open the renderer with npm run promo:render, visit http://127.0.0.1:5182, inspect shots, then click Render 48-second film.
4. Publish the completed film and native delivery copies: npm run promo:publish.
5. Verify: npm run promo:verify; node scripts/probe-reel-delivery.mjs; npm test; npm run build.

The frame bridge streams exact JPEG frames directly into FFmpeg and honors backpressure; no real-time capture or screen-recording frame drops are baked into the movie. All footage, images, and avatar assets come from the portfolio. Technology marks come from Simple Icons (see branding/SOURCES.txt).

Revision 2 adds the actual textured /models/avatar.glb at 0–6, 37–41 and 44–48 seconds. A 27-piece cube assembles and separates at 12–17 seconds. An articulated CGI hand taps and pulls a floating glass interface at 17–23 seconds. All floor reflections were removed; the floor is rough matte material. The pastel desk room, phone UI and frosted panels are original reference-inspired scenes. Version 1 is preserved as version-1-master.mp4.

Revision 2 delivery QA: 48.00 seconds, 1920x1080, 30 fps, 1440 frames, stereo AAC master; mean audio -21.8 dB, peak -3.2 dB. Native MP4 playback copies retain the complete 48-second film. All 49 tests and production build passed. Visual QA contact sheet is qa/contact-sheet.jpg.

Revision 3: charcoal/graphite laptop body; the duplicate name/role over the desk was removed. Books now have clear space beside the laptop. Card title widths reserve room for badges and long subtitles fit inside the panel. Game captions sit beneath gameplay and R.I.S.E workflow panels are spaced apart.
The procedural hand was replaced by the MIT-licensed WebXR Input Profiles continuous skinned hand mesh (right-hand.glb; original license in HAND_LICENSE.txt). Its joints form finger chains for a point/tap pose. The finger reaches the actual card surface, with a short response ripple, then the hand withdraws. A sleeve covers the wrist opening. No high-five was added.
Offscreen rebuild: start npm run promo:render, then node scripts/render-reel-offscreen.mjs qa (25 sampled frames) and node scripts/render-reel-offscreen.mjs export. Chrome uses an isolated local render profile, no existing browser windows or automation/debugging protocol. D3D11 is the default; set REEL_SOFTWARE=1 for SwiftShader fallback. Then npm run promo:publish and npm run promo:verify.

Revision 4: reference-inspired blue/teal desktop, sky-blue window and wall, pink wall slats, lilac pegboard, and richer blue/pink scene backdrop. The graphite laptop starts closed, opens on its actual hinge from 0.35–1.55s, and types the name/roles/university line by line from 1.45–4.55s. At 4.7–6s the camera approaches the screen. The correctly color-managed first frame of scene two appears on the display before it fills the camera view. No white-flash cut at this scene boundary. The floor remains matte. Export remains 48 seconds at 1080p30 with the existing music/voice-over.
