# Project media and categories

Filters: All Work, 3D Games, 2D Games, AR / VR, Blender Work. There are 13 projects; All Work initially shows six, with an expand button for the remainder.

## Current assignments

- 3D Games: WADA, The Signal Shutdown, Furious 7.
- 2D Games: FlappyBird and MrJungle open full-resolution image previews. NinniTrap opens its gameplay video, with an image option.
- AR / VR: R.I.S.E and AR Tank Trouble.
- Blender Work: Kiki the Explorer (Player.fbx), Mochi 3D (CHARAC.fbx), MyAvatar (avatar.glb). All models are served from /media/models/.
- Ambugo and The Kitchen Carnage retain their existing information under All Work.

The Living Jungle, Interactive 3D Web Portfolio and AI Adaptive Tutor have been removed from the showcase and current local project knowledge. MrJungle is the user-confirmed 2D project and is separate from the removed Living Jungle entry.

## Asset paths

`src/projectMedia.js` defines case-sensitive thumbnail and ordered media URLs. The first media entry controls the initial modal type. The Signal Shutdown uses /media/images/signal-shutdown.jpg and /media/videos/signal-shutdown.mp4. The 2D entries use flappybird.jpg, mrjungle.jpg, ninnitrap.jpg and ninnitrap.mp4 under the respective image/video directories.

JPG derivatives were generated from the original FlappyBird.png and MrJungle.png; existing JPEGs were copied to the requested .jpg filenames. The NinniTrap video was copied from ninni trap.mp4 to ninnitrap.mp4. The avatar GLB was copied into public/media/models/. Original files were preserved.

WADA retains the real filenames /media/images/WADA.jpeg and /media/videos/WADA.mp4.

## Preview behavior

All cards open an animated native dialog supporting focus trapping, Escape, close button and backdrop dismissal. Focus and body scrolling restore after the exit animation. Videos start paused with native playback/audio controls, without forcing a mute/volume value, and stop on unmount. Images retain their natural aspect ratio. Model previews lazy-load an R3F canvas with lighting, automatic fitting, drag/orbit, zoom, pan and reset.

Missing thumbnails use a branded typographic fallback. WebGL/load errors offer a contained fallback. FBX models using external textures require the original texture files alongside the asset. No gameplay mechanics or technology stacks were invented for the newly supplied 2D games.
