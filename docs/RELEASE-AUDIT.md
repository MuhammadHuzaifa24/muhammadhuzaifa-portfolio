# Portfolio release audit

## Automated results
- 52 regression tests: passed.
- Production Vite build: passed.
- Exact viewports: desktop 1440 × 1000, tablet 820 × 1180, mobile 390 × 844 and 320 × 740: passed.
- All viewports checked sections, overflow, responsive navigation, theme switching, project/video modal controls, chat sizing/focus, English/Urdu answers and source citations. LinkedIn and Gmail recipient URLs were checked.
- Browser speech recognition and speech synthesis integration were tested using mocks. Physical microphone access, browser speech-service availability and an installed Urdu speaking voice were NOT tested. Voice input needs HTTPS, a supported browser and user microphone permission.
- Real Qwen2.5-0.5B-Instruct q4 generation: passed. Saved evidence: docs/audit/real-llm.json.
- Real multilingual MiniLM embeddings and English/Urdu nearest-vector retrieval: passed. Saved evidence: docs/audit/real-embeddings.json.

## RAG pipeline
1. Build collects 24 documents from normalized résumé notes, current portfolio projects, skills, education, experience and achievements. User corrections (degree and CGPA 3.57) override older résumé details.
2. Documents are normalized and divided into 25 overlapping chunks (maximum 700 characters, 100-character overlap).
3. A normalized TF-IDF vector index (413 dimensions) is bundled for the deployable knowledge corpus. Instant bilingual source answers remain available without a model download.
4. Optional Local LLM mode downloads multilingual MiniLM and Qwen models from Hugging Face and runs them on the visitor's device. Neural source vectors are cached in IndexedDB and model weights in browser cache. First use downloads roughly 1 GB; device memory and download speed affect availability. No paid API key is required.
5. The query embedding retrieves relevant CV/portfolio evidence. The LLM generates an evidence-based answer in quote form. Only source-verifiable quotes and known source IDs can be displayed. Formatting/pro-form subject normalization preserves the original source wording; altered numbers and fabricated claims are rejected.
6. If a device cannot load the model, retrieval is uncertain, or generated quotes fail verification, the immediate source answer stays visible. Unknown personal facts are explicitly declined. The UI distinguishes verified AI answers from source-only answers.
7. Visitors can ask/type in English or Urdu and open citations to portfolio sections. The microphone fills the question field; the speaker control reads an answer when the browser supports it.

## Deployment scope
Public static portfolio; React, 3D assets, project images/videos, résumé, local RAG, contact via Web3Forms. Node-only OpenAI/Resend backends, local .env, paid credentials, local model caches, analytics records and render work files are excluded. Very large gameplay recordings use browser-compatible optimized delivery files online; full original recordings remain in the local workspace. Each hosted asset is below 25 MiB. Source uploads are split below the host's 64 MiB per-push limit.

## Manual checks remaining on visitor devices
Grant microphone permission and test spoken questions in Chrome/Edge; select Urdu and check whether an Urdu voice is installed. On first Local LLM use allow time for the model download. The no-download bilingual source mode works independently.

## Published result
Public URL: https://muhammadhuzaifa.epicdove4.chatgpt.site
Status: succeeded. Saved version 1.
Production source checkout: deployment/muhammadhuzaifa-upload.
Publishing required batching source pushes below 64 MiB and removing only unused standalone MP3 output plus one duplicate WADA AAC delivery file to stay below both 256 MiB archive limits. WADA's AAC fallback uses its canonical /media/videos/WADA.mp4 route. Native MP4/WebM soundtracks remain intact. The exact hosted source also passed all 52 tests.
Deployment metadata is in .openai/deployment.json; no credentials are stored there.

Post-publication check: anonymous homepage returned HTTP 200 with the Muhammad Huzaifa title, no login redirect and no restrictive CSP. Avatar GLB, corrected AR Tank thumbnail, Ambugo native MP4, current showreel native MP4, canonical WADA MP4 and résumé PDF returned HTTP 200 with the expected media content types. The host delivered full responses to these range requests; 206 byte-range support was not established by this check.
