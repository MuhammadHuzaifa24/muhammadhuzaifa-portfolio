# Browser RAG and Web3Forms

## Run

`npm install`, then `npm run dev:ui`. Chat and contact do not need a backend. Build with `npm run build` for static hosting. `npm run dev` also starts the retained optional Node API.

## RAG pipeline

1. Verified profile, resume-backed experience, education, achievements and project descriptions feed curated bilingual knowledge chunks in `src/utils/ragEngine.js`.
2. Unicode tokenization and Urdu synonyms form sparse vectors. Cosine similarity plus alias matching retrieves the best topic.
3. The UI returns the corresponding factual English/Urdu passage with source links. It does not invent salary, age, phone numbers, GitHub profiles, or unconfirmed 2D games.
4. Optional semantic AI loads Transformers.js and the quantized `Xenova/paraphrase-multilingual-MiniLM-L12-v2` model in a Web Worker, creates normalized embeddings, and compares cosine similarity. This free inference happens in the browser, not a hosted paid API. No access token is needed for the public model. Initial model download can be large and needs internet; subsequent inference uses cached assets.
5. Local results display immediately, even while optional inference loads. A 12-second UI timeout leaves the local fallback visible. Low-confidence matches abstain. This implementation intentionally uses extractive retrieval rather than LLM generation.

Chats are held in browser memory, not posted to the API. Voice input is optional and uses the browser speech recognition service; its privacy policy applies. Text-to-speech depends on installed browser voices.

## Contact configuration

Register a free Web3Forms key for huzaifaraees6146@gmail.com at https://web3forms.com/#start. Set `VITE_WEB3FORMS_ACCESS_KEY` in `.env`, restart Vite, and rebuild deployed assets. The key determines the recipient; a random email address alone cannot authorize delivery. The supplied public key was configured on November 9, 2026.

`Contact.jsx` validates name, email, subject and message and calls `src/utils/contactDelivery.js`. It sends a JSON POST directly to `https://api.web3forms.com/submit`. Web3Forms validates/processes the submission; the browser cannot enforce server-side rate limits itself. A honeypot, local 30-second repeat-submission delay and provider spam checks provide basic protection. All input is rendered as text. No server mail credentials are used.

The green toast appears only after an HTTP success with `success: true`. Errors preserve the message. Provider acceptance is not proof of inbox arrival: check the target inbox/spam folder or provider dashboard for that evidence. A direct mailto link remains available.

## Optional legacy API

The existing Node/OpenAI/Resend adapters and their tests remain available. They are separate from the default browser chat/contact paths. Anonymous aggregate analytics still uses the optional API and quietly skips collection when it is absent. Old OpenAI/Resend secrets stay server-side and are not required for the default UI.

## References

- Web3Forms React guide: https://docs.web3forms.com/how-to-guides/js-frameworks/react-js/simple-react-contact-form
- Transformers.js pipeline and caching: https://huggingface.co/docs/transformers.js/en/pipelines
