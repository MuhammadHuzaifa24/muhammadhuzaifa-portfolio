# Muhammad Huzaifa — Interactive 3D Portfolio

React + Vite, Tailwind CSS, Framer Motion, Lucide, Three.js, React Three Fiber, and Drei. All components and assets are physical workspace files.

## Run

```sh
npm install
npm run dev
```

`npm run dev` starts both the API and Vite. `npm run build` produces `dist/`; `npm start` serves the production UI and API. `npm test` runs backend and driving-physics checks. See `docs/RAG_AND_CONTACT.md` for configuration, the RAG pipeline, and delivery verification.

## Personal content

`src/data.js` contains the profile, projects, experience, education, and achievements. Professional roles, dates, academic results, and six additional projects were transcribed from the supplied résumé. The degree title **Bachelor of Gaming and Animation** was confirmed by Muhammad Huzaifa. AutiVerse / R.I.S.E, AI Adaptive Tutor, and the portfolio project also use his supplied project brief.

- Experience includes The Game Storm Studio internship, freelance logo/post design, and IMechE society involvement.
- Academic entries include the NED degree (2023–2027), gaming-development diploma, and pre-engineering studies.
- Achievement cards cover the GameCon runner-up result and Mechathon bottle-rocket win.
- Email and LinkedIn links use the résumé's contact information. No phone number is displayed.

Project filters are **All Work**, **3D Games**, **2D Games**, **AR / VR**, and **Blender Work**. The showcase includes WADA, The Signal Shutdown, Furious 7, the user-confirmed FlappyBird/MrJungle/NinniTrap 2D games, AR/VR work, and three interactive Blender asset cards. The Living Jungle, Interactive 3D Web Portfolio and AI Adaptive Tutor have been removed. All Work initially shows six cards and expands to the complete collection.

Only verified demo/repository URLs should be added. Missing links are omitted. The assistant runs locally in English and Urdu, with optional free Hugging Face semantic matching in a Web Worker. It does not require OpenAI, a paid API or the Node backend.

## Custom avatar

Place the self-contained GLB at `public/models/avatar.glb`. Both viewers use it:

- `src/components/3d/AvatarViewer.jsx`: garage exhibit, rover, input, camera, and arcade HUD.
- `src/components/3d/AboutAvatarViewer.jsx`: dedicated About canvas with floating/rotating avatar, studio lighting, shadows, and drag-to-rotate controls. Zoom and pan are disabled; vertical page scrolling remains available.

Each viewer fits and clones the model independently. Missing/invalid assets have a contained fallback. Viewers pause rendering when offscreen or the tab is hidden; reduced-motion preferences disable ambient motion. For compressed GLBs, configure decoder paths as required by the asset.

## Playground

Click **Playground Mode** to focus the scene. **W/Up** accelerates, **S/Down** reverses, **A/Left** and **D/Right** steer, **Space** brakes, **R** resets, and **Escape** exits. Held on-screen arrows support touch/pointer input and mirror the arcade key indicators. Drag skill crates or push them with the rover. Drive into Projects, Skills, or Contact gateways, or click their labels, to navigate.

`src/components/3d/playgroundPhysics.js` contains the fixed 120 Hz planar arcade simulation: acceleration, tire grip, drag, approximate circular colliders, mass-weighted impulses, and track bounds. Decorative objects do not have collision bodies.

## Design

Warm cream background, white frosted cards, warm orange/coral accents, mint, and sky blue. Bright yellow accents have been removed from source and public assets. Theme values live in `tailwind.config.js` and `src/index.css`; shared motion elements are in `src/components/MotionPrimitives.jsx`.

## Free chatbot and direct contact delivery

The browser loads the verified knowledge chunks from `src/utils/ragEngine.js`, ranks them using keyword vectors and cosine similarity, and returns grounded English/Urdu answers with section citations. Unknown personal facts receive an honest fallback. Optional semantic AI uses a multilingual Hugging Face embedding model locally; its first download can be large. This is retrieval, not LLM-generated biography.

The contact form posts directly to Web3Forms. Configure the public key in `.env`:

```env
VITE_WEB3FORMS_ACCESS_KEY=your_public_web3forms_key
```

Get a key registered to huzaifaraees6146@gmail.com at https://web3forms.com/#start. The supplied key is installed locally. Restart Vite after changing `.env` and rebuild for deployment. This public form key is designed to be included in the browser; never prefix OpenAI, Resend, or SMTP secrets with VITE_.

Run `npm run dev:ui` for the independent frontend, or `npm run dev` for the UI plus optional legacy API/aggregate analytics. `dist/` supports static hosting for the new chat and contact form. Existing server-side AI/email adapters are retained for optional use and are not called by these components.

The rover spawns at the grid origin on entry/reset. Gate navigation uses an entry latch and a two-second cooldown; a gate must be exited before it can trigger again. See `docs/VERIFICATION.md` for checks and live email acceptance evidence.

## Project media gallery

Cards open video, high-resolution image or interactive GLB/FBX previews in a keyboard-accessible animated dialog. The 2D Games and Blender Work filters provide dedicated collections. Configure asset mappings in `src/projectMedia.js`; see `docs/PROJECT_MEDIA.md` for all assignments and normalized filenames.

## Warm studio and showreel

The restored theme uses cream, white cards, warm orange and balanced typography. Videos start paused with native controls and visitor-controlled audio. The Film module embeds the real 60-second 1080p/60fps reel, with a resume download and scroll entrance. See docs/STUDIO_RESTORE.md for the six-scene timeline, editable AE source and reproduction commands.
