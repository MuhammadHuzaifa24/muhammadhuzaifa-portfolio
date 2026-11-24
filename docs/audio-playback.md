# Media and city updates

The shared video player now has only native HTML5 controls. Removed the separate toolbar, volume slider, quality dropdown, test-tone button and MP3 audio player. Original sound remains inside the video. Seven WebM copies use VP8 video and Opus stereo audio, with MP4 fallback for browsers without WebM support. This avoids depending exclusively on AAC decoding in embedded previews. Browser testing confirmed the native speaker icon toggles muted true/false and R.I.S.E plays while unmuted. FFmpeg decoded non-silent Opus audio from all seven copies (first eight seconds: mean levels between -16.8 and -19.2 dB). Physical headphone output is not measured by these checks.

The existing original MP4 files and standalone soundtrack assets are preserved. No standalone audio is shown in the UI. Regenerate everything using npm run media:optimize; verify Opus tracks with node scripts/verify-webm.mjs.

Avatar viewers now explicitly use the authored diffuse atlas, sRGB color handling and non-metallic fabric/skin shading. Cached GLTF materials remain untouched. The About viewer, hero exhibit and MyAvatar project viewer use the same material restoration helper.

The playground is now a 44-unit city with roads, spaced-out gates and crates, a park, low-poly buildings, instanced windows and eight street lamps. Real point lights are limited to four lamps for performance; all lamps and windows glow at night. Dark theme changes the sky, moon lighting, ground, windows and street lighting together. Active mode follows the car; idle mode frames the full city. Building collisions share rendered building dimensions. Start/reset remain centered and gateway cooldown is preserved. Existing engine, horn, brake and collision audio remain connected.

Validation: production build, 46 tests, video audio decode checks, native mute/unmute clicks, avatar colors, day/night rendering, and keyboard movement (car advanced to Z -7.0) checked.

## Production playback correction

The first source is now an H264 MP4 containing the original soundtrack as MP3 audio, in a single native video element. Sources automatically recover through WebM/Opus, standard MP4 and original footage on load/decoder failure; the player is retained inside the modal. There is no external-original link or separate audio player. Native mute/volume choices survive source recovery. A 15-second metadata watchdog handles stalled loads, and supported audio byte counters detect a decoder that is producing video without audio.

The server serves /media and /models from public in both development and production, independently of dist rebuilds. Missing media returns a real 404 rather than the SPA HTML. Byte ranges return 206 with proper video MIME types; all seven native video routes are covered in backend tests.

Verification used the actual production address http://127.0.0.1:3001. Decoded audio byte counts were positive for R.I.S.E (324441, later 648882), WADA (8359), The Signal Shutdown (10971), NinniTrap (10449), AR Tank Trouble (5747), Furious 7 (10449), and showreel (10971). Native speaker clicks were checked with explicit muted=true and muted=false attribute assertions. FFmpeg independently verified MP3 stereo with non-silent audio in all seven native MP4 files. Build and all 48 tests pass. This proves browser decoding and control operation; it does not record sound from physical headphones.

Generate native copies: node scripts/encode-native-video.mjs. Verify files: node scripts/verify-native-video.mjs. The complete npm run media:optimize pipeline includes these copies. Production proof: docs/production-video-audio-fixed.jpg. The local production server was left running on port 3001 for the user.
