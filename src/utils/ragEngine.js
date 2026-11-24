import knowledgeIndex from '../knowledgeIndex.json' with { type: 'json' };
import { profile, projects, education, experience, achievements } from '../data.js';

const chunk = (id, title, href, en, ur, aliases) => ({ id, title, href, en, ur, aliases });
export const knowledge = [
  chunk('about', 'About Huzaifa', '#about', `${profile.name} is a final-year ${profile.degree} student at ${profile.university}, based in ${profile.location}. His interests include 3D graphics, AR/VR, game development, AI integration and web applications.`, 'محمد حذیفہ کراچی میں مقیم NED University of Engineering and Technology کے فائنل ایئر Bachelor of Gaming and Animation کے طالب علم ہیں۔ ان کی دلچسپیوں میں تھری ڈی گرافکس، گیم ڈویلپمنٹ، AR/VR، AI اور ویب ایپلی کیشنز شامل ہیں۔', 'who about background introduce huzaifa muhammad کون تعارف حذیفہ بارے'),
  chunk('education', 'Education', '#education', education.map(e => `${e.title}, ${e.institution}, ${e.dates}. ${e.detail}.`).join('\n'), 'حذیفہ NED یونیورسٹی میں Bachelor of Gaming and Animation (2023–2027، فائنل ایئر) کر رہے ہیں۔ CGPA: 3.57/4.00۔ انہوں نے NED سے Diploma in Gaming Development (2024–2025) بھی کیا ہے۔ انٹرمیڈیٹ پری انجینئرنگ میں 86.91% حاصل کیے۔', 'education degree university ned cgpa study studying qualification تعلیم یونیورسٹی ڈگری پڑھائی نمبر'),
  chunk('skills', 'Skills', '#skills', '3D Modeling: Blender, custom avatars and GLB assets. VR & Game Engines: Unity, C#, Unreal Engine, C++ and AR/VR. Web: React, Three.js, React Three Fiber, Tailwind CSS, JavaScript, HTML and CSS. AI/Backend: Python, RAG, MCP, Hugging Face, PHP and MySQL. Design: Illustrator and Photoshop.', 'مہارتیں: Blender اور تھری ڈی ماڈلنگ؛ Unity، C#، Unreal Engine، C++ اور AR/VR؛ React، Three.js، React Three Fiber، Tailwind اور JavaScript؛ Python، RAG، MCP، Hugging Face، PHP اور MySQL؛ Illustrator اور Photoshop۔', 'skills stack technologies programming web3d blender react unity python rag mcp صلاحیت مہارت ٹیکنالوجی'),
  chunk('experience', 'Experience', '#experience', experience.map(e => `${e.title}, ${e.organization} (${e.dates}). ${e.description} ${e.highlights.join(' ')}`).join('\n'), 'حذیفہ نے The Game Storm Studio، کراچی میں جون تا اگست 2026 گیم ڈویلپر انٹرن کے طور پر Unity اور C#، گیم پلے، ٹیسٹنگ اور آپٹمائزیشن پر کام کیا۔ نومبر 2023 سے فری لانس لوگو اور پوسٹ ڈیزائنر ہیں۔ 2024 سے IMechE Society کی پروموشنز ٹیم کا حصہ ہیں۔', 'experience internship intern job work employment freelance gamestorm storm تجربہ ملازمت انٹرن شپ کام'),
  chunk('achievements', 'Achievements', '#education', achievements.map(a => `${a.title} (${a.dates}): ${a.description}`).join('\n'), 'ٹیم کے ساتھ The Signal Shutdown پر GameCon 2024–2025 میں رنر اپ پوزیشن حاصل کی۔ IMechE Society کے Mechathon 2024–2025 میں بوتل راکٹ مقابلہ بھی جیتا۔', 'achievements awards winner gamecon mechathon کامیابی ایوارڈ انعام'),
  chunk('contact', 'Contact', '#contact', `Email: ${profile.email}. Location: ${profile.location}. LinkedIn: ${profile.linkedin}. Use the contact section for project enquiries.`, `ای میل: ${profile.email}۔ مقام: کراچی، پاکستان۔ پروجیکٹ کے بارے میں بات کرنے کے لیے کانٹیکٹ سیکشن استعمال کریں۔`, 'contact email location linkedin reach hire رابطہ ای میل کراچی کہاں'),
  chunk('2d', '2D Games', '#projects', 'The confirmed 2D game projects are FlappyBird, MrJungle and NinniTrap. FlappyBird and MrJungle have image previews; NinniTrap has gameplay video and artwork.', 'ٹو ڈی گیم پروجیکٹس میں FlappyBird، MrJungle اور NinniTrap شامل ہیں۔ پہلے دو کی تصاویر اور NinniTrap کی گیم پلے ویڈیو اور تصویر دستیاب ہیں۔', '2d games two dimensional ٹو ڈی'),
  ...projects.map(p => chunk(`project-${p.id}`, p.title, '#projects', `${p.title} — ${p.type}. ${p.description} Technologies: ${p.tags.join(', ')}.`, `${p.title}: ${p.description}`, `${p.title} ${p.category || p.discipline} ${p.tags.join(' ')} ${p.id === '01' ? 'autiverse rise r.i.s.e fydp rehabilitation gloves autism آٹیزم بحالی تعلیمی گلوز' : ''}`)),
];
const projectUrdu = {
  'project-01': 'R.I.S.E فائنل ایئر کا VR بحالی اور تعلیمی معاونت کا نظام ہے۔ Unity، C#، ہینڈ ٹریکنگ گلوز اور بصری فیڈبیک استعمال کرتا ہے۔',
  'project-05': 'AR Tank Trouble ایک Unity اور C# میں بنی آگمینٹڈ ریئلٹی ٹینک گیم ہے۔ کھلاڑی ایک ٹینک کنٹرول کرتا ہے اور دشمنوں کو تباہ کرتا ہے۔ اس میں AR تعامل، نشانہ لگانا، فائرنگ، تھری ڈی میدان، پلیئر کنٹرولز اور فزکس شامل ہیں۔',
  'project-06': 'Furious 7 ایک تھری ڈی ریسنگ اور ایکشن گیم پروجیکٹ ہے۔ حذیفہ نے Unity اور C# میں پلیئر کنٹرولز، گیم پلے، سین سیٹ اپ، ماحول اور کارکردگی بہتر بنانے پر کام کیا۔',
  'project-07': 'WADA ایک تھری ڈی اوپن ورلڈ ایکشن ایڈونچر گیم ہے جو ایک اسٹائلائزڈ عرب ماحول میں بنائی گئی ہے۔ اس میں تھرڈ پرسن کامبیٹ، دریافت، اینیمیشنز اور کسٹم ماحولیاتی اثاثے شامل ہیں۔ ٹیکنالوجیز: Unity، C#، Blender، 3D Combat اور Open World۔',
  'project-08': 'Ambugo ایمبولینس مینجمنٹ کی ویب ایپلی کیشن ہے۔ MySQL ڈیٹابیس، PHP بکنگ ماڈیولز اور JavaScript فارم استعمال کرتی ہے، اور Chhipa اور Edhi سمیت سروسز کے ریکارڈ رکھتی ہے۔',
  'project-09': 'The Kitchen Carnage کی پری پروڈکشن میں حذیفہ نے گیم کا تصور، کہانی، کرداروں، ماحول اور لیول کی منصوبہ بندی میں حصہ لیا۔',
  'project-10': 'The Signal Shutdown ایک تھری ڈی سروائیول گیم ہے جس میں پلیئر سسٹمز، ماحول، کہانی اور لیول میکینکس شامل ہیں۔ حذیفہ کی ٹیم نے GameCon میں اس پر رنر اپ پوزیشن حاصل کی۔',
  'project-11': 'FlappyBird ایک ٹو ڈی گیم پروجیکٹ ہے۔ پروجیکٹ کارڈ پر کلک کرنے سے اس کی مکمل ریزولیوشن تصویر کھلتی ہے۔',
  'project-12': 'MrJungle ایک ٹو ڈی گیم پروجیکٹ ہے جس کی تصویر پورٹ فولیو میں دیکھی جا سکتی ہے۔',
  'project-13': 'NinniTrap ایک ٹو ڈی گیم ہے۔ پروجیکٹ کارڈ میں گیم پلے ویڈیو اور تصویر دستیاب ہیں۔',
  'project-14': 'Kiki the Explorer، Blender Work کیٹیگری میں Player.fbx اثاثے کا تھری ڈی پری ویو ہے۔ ماڈل کو گھمایا اور زوم کیا جا سکتا ہے۔',
  'project-15': 'Mochi 3D میں CHARAC.fbx ماڈل کا انٹرایکٹو تھری ڈی پری ویو دستیاب ہے۔',
  'project-16': 'MyAvatar ایک کسٹم Blender اوتار کا GLB ماڈل ہے۔ اسے Blender Work کیٹیگری میں گھما کر، پین اور زوم کر کے دیکھا جا سکتا ہے۔',

};
knowledge.forEach(doc => { if (projectUrdu[doc.id]) doc.ur = projectUrdu[doc.id]; });
const stop = new Set('a an the is are was does do how what tell me his he you your about of and in to for can please huzaifa muhammad ہے ہیں کی کے کا کو میں سے بارے بتائیں کیا مجھے'.split(' '));
const synonyms = { مہارتیں: 'skills', مہارتوں: 'skills', مہارت: 'skills', تعلیم: 'education', تعلیمی: 'education', تجربہ: 'experience', تجربے: 'experience', پروجیکٹ: 'project', پروجیکٹس: 'projects', ڈگری: 'degree', اس: '', حذیفہ: '', ان: '', نے: '', کوئی: '', کون: 'introduce', تعارف: 'introduce', skills: 'skills' };
function tokens(text) { return text.toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}+#.]+/gu)?.map(t => synonyms[t] ?? t).filter(t => t && !stop.has(t)) || []; }
function vector(text) { const v = new Map(); for (const t of tokens(text)) v.set(t, (v.get(t) || 0) + 1); return v; }
function cosine(a, b) { let dot = 0, aa = 0, bb = 0; for (const [t, n] of a) { dot += n * (b.get(t) || 0); aa += n * n; } for (const n of b.values()) bb += n * n; return dot / Math.sqrt(aa * bb || 1); }
export const corpusIndex = knowledgeIndex;
export function retrieve(question) {
  const query = vector(question);
  return knowledge.map(doc => ({ doc, score: cosine(query, vector(`${doc.aliases} ${doc.en} ${doc.ur}`)) + tokens(doc.aliases).filter(t => query.has(t)).length * 0.12 })).sort((a, b) => b.score - a.score);
}
export function answerQuestion(question, { language = 'auto' } = {}) {
  const ur = language === 'ur' || (language === 'auto' && /[\u0600-\u06ff]/.test(question));
  const ranked = retrieve(question), best = ranked[0];
  // Unknown personal facts must never be inferred from a loosely related match.
  const unknown = /\b(salary|birthday|birth date|age|married|phone|github|favourite|favorite)\b|تنخواہ|عمر|پیدائش|فون/i.test(question) || /the living jungle|interactive 3d web portfolio|ai adaptive tutor/i.test(question);
  const projectQuery = /\b(projects|games)\b|blender work|پروجیکٹس|گیمز/.test(question.toLowerCase());
  const namedProject = /rise|r\.i\.s\.e|autiverse|mrjungle|mr jungle|flappy|ninni|furious|tank|wada|signal|ambugo|kitchen|kiki|mochi|myavatar/i.test(question);
  if (!unknown && projectQuery && !namedProject) {
    let docs = /\b2d\b/i.test(question) ? knowledge.filter(d => d.id === '2d') : knowledge.filter(d => d.id.startsWith('project-'));
    if (/\b3d\b/i.test(question)) docs = docs.filter(d => projects.some(p => `project-${p.id}` === d.id && p.category === '3D Games'));
    else if (/blender/i.test(question)) docs = docs.filter(d => projects.some(p => `project-${p.id}` === d.id && p.category === 'Blender Work'));
    else if (/\b(ar|vr)\b/i.test(question)) docs = docs.filter(d => ['project-01', 'project-05'].includes(d.id));
    return { answer: docs.map(d => ur ? d.ur : d.en).join('\n\n'), sources: docs.map(d => ({ id: d.id, title: d.title, href: d.href, quote: d.en })), language: ur ? 'ur' : 'en', mode: 'local', matched: true };
  }
  if (/\b(programming languages|tech stack)\b/i.test(question) && !unknown) return answerQuestion('skills', { language: ur ? 'ur' : 'en' });
  if (/^(hi|hello|hey|salam|سلام|السلام علیکم)[!?.\s]*$/i.test(question.trim())) return { answer: ur ? 'السلام علیکم! حذیفہ کی تعلیم، مہارتوں، تجربے یا پروجیکٹس کے بارے میں پوچھیں۔' : 'Hello! Ask about Huzaifa’s projects, education, skills or experience.', sources: [], language: ur ? 'ur' : 'en', mode: 'local', matched: true };
  if (unknown || !best || best.score < 0.15) return { answer: ur ? 'فراہم کردہ معلومات میں اس سوال کا جواب موجود نہیں۔ حذیفہ کی تعلیم، مہارتوں، تجربے یا کسی نامزد پروجیکٹ کے بارے میں پوچھیں، یا رابطہ سیکشن استعمال کریں۔' : 'The supplied portfolio information does not contain that answer. Ask about Huzaifa’s education, skills, experience or a named project, or use the contact section.', sources: [], language: ur ? 'ur' : 'en', mode: 'local', matched: false, allowSemantic: !unknown };
  const selected = [best.doc];
  return { answer: selected.map(d => ur ? d.ur : d.en).join('\n\n'), sources: selected.map(d => ({ id: d.id, title: d.title, href: d.href, quote: d.en })), language: ur ? 'ur' : 'en', mode: 'local', matched: true };
}

// Optional free browser inference: no hosted API token and no paid generation.
let worker, sequence = 0;
export function semanticAnswer(question, language, onProgress = () => {}) {
  if (typeof Worker === 'undefined') return Promise.resolve(null);
  worker ||= new Worker(new URL('./ragWorker.js', import.meta.url), { type: 'module' });
  return new Promise(resolve => {
    const id = ++sequence;
    const finish = value => { clearTimeout(timer); worker.removeEventListener('message', receive); worker.removeEventListener('error', fail); resolve(value); };
    const receive = event => { if (event.data.id !== id) return; if (event.data.status) onProgress(event.data.status); else finish(event.data.result); };
    const fail = () => finish(null);
    const timer = setTimeout(fail, 600000);
    worker.addEventListener('message', receive); worker.addEventListener('error', fail);
    worker.postMessage({ id, question, language, documents: knowledge, chunks: knowledgeIndex.chunks, fingerprint: knowledgeIndex.fingerprint });
  });
}
