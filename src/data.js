import { projectMedia } from './projectMedia.js';
// Profile and résumé-backed experience; project briefs also supplied by Muhammad Huzaifa.
export const profile = {
  name: 'Muhammad Huzaifa',
  shortName: 'Huzaifa',
  role: 'Game Designer & Developer',
  location: 'Karachi, Pakistan',
  email: 'huzaifaraees6146@gmail.com',
  linkedin: 'https://www.linkedin.com/in/muhammadhuzaifa24/',
  degree: 'Bachelor of Gaming and Animation',
  university: 'NED University of Engineering and Technology',
};

export const projectFilters = ['All Work', '3D Games', '2D Games', 'AR / VR', 'Blender Work'];
// Web/AI work remains in All Work rather than being mislabeled as a game.
export const projects = [
  { id: '01', title: 'R.I.S.E', category: 'AR / VR', discipline: 'VR rehabilitation & education', type: 'Final Year Design Project', description: 'An immersive VR rehabilitation and educational support system. Built with Unity and C#, combining hand-tracking gloves with custom visual feedback for interactive learning experiences.', tags: ['Unity', 'C#', 'VR', 'Hand-tracking gloves'], visual: 'world', demo: null, repository: null },
  { id: '05', title: 'AR Tank Trouble', category: 'AR / VR', type: 'Augmented reality combat', description: 'An AR combat game where the player controls one tank to aim, fire, and destroy enemy targets. Features AR interactions, a 3D battlefield, player controls, and physics-based movement.', tags: ['Unity', 'C#', 'AR', 'Physics'], visual: 'orbit', demo: null, repository: null },
  { id: '06', title: 'Furious 7', category: '3D Games', type: 'Racing / Action', description: 'A racing and action-inspired 3D game project, with contributions to player controls, gameplay mechanics, scene setup, environment interactions, and performance optimization.', tags: ['Unity', 'C#', '3D Game Design'], visual: 'orbit', demo: null, repository: null },
  { id: '07', title: 'WADA', category: '3D Games', featuredOrder: 2.5, type: '3D Open-World Action Adventure', description: 'An immersive 3D open-world game set in a stylized Arabian environment, featuring dynamic third-person combat systems, exploration mechanics, fluid animations, and custom environmental asset design built in Unity & Blender.', tags: ['Unity', 'C#', 'Blender', '3D Combat', 'Open World'], demo: null, repository: null },
  { id: '08', title: 'Ambugo', category: null, discipline: 'Web application', type: 'Ambulance management system', description: 'An ambulance management platform with a relational MySQL database, PHP-backed booking modules, dynamic forms, and organization records for services including Chhipa and Edhi.', tags: ['MySQL', 'PHP', 'JavaScript', 'HTML / CSS'], visual: 'nodes', demo: null, repository: null },
  { id: '09', title: 'The Kitchen Carnage', category: null, discipline: 'Game Development', type: 'Pre-production / Story development', description: 'Contributed to the pre-production of a kitchen-themed action game: concept development, story creation, character planning, environmental ideas, and level progression.', tags: ['Game Concept', 'Story Development', 'Level Planning'], visual: 'world', demo: null, repository: null },
  { id: '10', title: 'The Signal Shutdown', category: '3D Games', featuredOrder: 3, type: 'Survival / GameCon runner-up', description: 'A survival game featuring interactive player systems, environment design, story progression, and level mechanics. Presented with my team at GameCon, earning a runner-up position.', tags: ['Unity', 'C#', 'Gameplay Systems'], demo: null, repository: null },
  { id: '11', title: 'FlappyBird', category: '2D Games', featuredOrder: 4, type: '2D Game', description: 'A 2D game project presented through its supplied artwork. Open the image preview for a closer look.', tags: ['2D Game', 'Game Design'], demo: null, repository: null },
  { id: '12', title: 'MrJungle', category: '2D Games', featuredOrder: 4.2, type: '2D Game', description: 'A 2D game project. Explore the supplied project image in a full-resolution preview.', tags: ['2D Game', 'Game Design'], demo: null, repository: null },
  { id: '13', title: 'NinniTrap', category: '2D Games', featuredOrder: 4.4, type: '2D Gameplay', description: 'A 2D game showcased through its gameplay video and project artwork. Open the card to watch the film or explore the image.', tags: ['2D Game', 'Gameplay'], demo: null, repository: null },
  { id: '14', title: 'Kiki the Explorer', category: 'Blender Work', type: 'Interactive FBX Model', description: 'Explore the Player.fbx character asset in an interactive 3D viewer. Drag to rotate, zoom in for details, or reset the view.', tags: ['Blender Work', 'FBX', '3D Character'], demo: null, repository: null },
  { id: '15', title: 'Mochi 3D', category: 'Blender Work', type: 'Interactive FBX Model', description: 'An interactive preview of the CHARAC.fbx asset. Inspect the model from different angles with orbit and zoom controls.', tags: ['Blender Work', 'FBX', '3D Model'], demo: null, repository: null },
  { id: '16', title: 'MyAvatar', category: 'Blender Work', type: 'Interactive GLB Model', description: 'A custom Blender avatar presented as a self-contained GLB asset. Rotate, pan, and zoom to explore the model.', tags: ['Blender', 'GLB', 'Custom Avatar'], demo: null, repository: null },
].map(project => ({ ...project, ...projectMedia[project.id] }));

export const experience = [
  { title: 'Game Developer Intern', organization: 'The Game Storm Studio', dates: 'June 2026 – August 2026', location: 'Karachi, Pakistan', description: 'Worked within a professional Unity development team on gameplay features, game systems, and level development.', highlights: ['Implemented and tested game features using Unity and C#.', 'Debugged development issues and optimized gameplay.', 'Collaborated with the team through professional game development workflows.'], tags: ['Unity', 'C#', 'Gameplay', 'Testing & Optimization'] },
  { title: 'Freelance Logo & Post Designer', organization: 'Freelance', dates: 'November 2023 – Present', location: 'Karachi, Pakistan', description: 'Create custom logos and promotional visuals for clients across industries, translating brand ideas into clear visual identities.', highlights: ['Design social media posts and digital campaign assets.', 'Use Adobe Illustrator and Photoshop for branding and promotional design.', 'Collaborate with clients to understand their vision and deliver aligned designs.'], tags: ['Adobe Illustrator', 'Photoshop', 'Branding', 'Client Collaboration'] },
  { title: 'Promotions Domain Team Member', organization: 'IMechE Society', dates: '2024 – Present', location: 'Society involvement', description: 'Support promotional campaigns and event-related activities alongside the society team.', highlights: ['Collaborate on campaigns and technical events.', 'Develop communication, organization, and teamwork skills.'], tags: ['Teamwork', 'Promotions', 'Technical Events'] },
];

export const education = [
  { title: 'Bachelor of Gaming and Animation', institution: 'NED University of Engineering and Technology', dates: '2023 – 2027 · Final Year', detail: 'CGPA: 3.57 / 4.00', description: 'Final-year student focusing on 3D graphics, game development, AR/VR, AI integration, and web applications. R.I.S.E connects these interests through the Final Year Design Project.' },
  { title: 'Diploma in Gaming Development', institution: 'NED University of Engineering and Technology', dates: '2024 – 2025', detail: 'Karachi, Pakistan', description: 'Additional study in gaming development alongside my undergraduate degree.' },
  { title: 'Intermediate · Pre-Engineering', institution: 'Govt Dehli Inter-Science College', dates: '2019 – 2021', detail: '86.91%', description: 'Pre-engineering studies in Karachi, Pakistan.' },
];
export const achievements = [
  { title: 'GameCon · Runner-up', thumbnail: '/media/images/GameConRunner.jpg', dates: '2024 – 2025', description: 'Presented The Signal Shutdown with my team, demonstrating game design, gameplay mechanics, and project presentation.' },
  { title: 'Mechathon · Bottle Rocket Winner', dates: '2024 – 2025', description: 'Worked with a team to design, build, and launch a bottle rocket at the IMechE Society competition.' },
];
