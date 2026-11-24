# City polish and profile update

- Two warm car spotlights, road illumination and bright headlamp lenses turn on with night mode and follow the rover's steering.
- All gateways have emissive frames, pulsing rings, soft ground halos and sparkles in both themes. Portal labels glow with their own color.
- Forward no longer has a permanent orange style. Driving arrow buttons are white at rest; the current held action alone receives the orange is-down state. Each button exposes aria-pressed.
- Horn now uses two short layered square/sine meep notes with a cooldown.
- City details include instanced zebra crossings, storefront awnings, park benches, a small fountain and pastel planters.
- About, Skills, Projects, Experience and Education heading accents use the site's orange. The marquee is now pale peach in light mode and muted warm tan in dark mode.
- CGPA is 3.57 throughout site data, education, English/Urdu local RAG and server knowledge. The local vector index was regenerated without external API calls.
- The newly supplied PDF was copied unchanged to public/media/files/Muhammad_Huzaifa_Resume.pdf. Download link is versioned by SHA256 prefix 5b59df0a04db. The actual production download response was verified against the supplied original byte-for-byte.
- Header, CTA, footer and driving gateways share section navigation. Tall content lands below the sticky header; shorter content is centered in the remaining viewport. Layout offsets ignore Framer entrance transforms. Mobile menu closing is allowed to finish before positioning.

Validation: build and all 49 tests pass. Browser checked neutral driving controls, visible 3.57 CGPA, orange Skills heading and day/night rendering. Header navigation and a real 6.5-second drive through the Skills portal both landed the Skills heading at Y=138.47px in the same viewport. Latest resume download returns 200 and matching SHA256.
