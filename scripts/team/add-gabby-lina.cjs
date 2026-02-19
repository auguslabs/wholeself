const fs = require('fs');

const gabby = {
  id: 'member-23',
  photoFilename: 'Gabby-Galvez',
  firstName: 'Gabby',
  lastName: 'Galvez',
  credentials: 'LCSW',
  pronouns: 'they/them',
  role: 'Mental Health Therapist',
  roleEs: 'Terapeuta de salud mental',
  language: 'spanish',
  descriptionEn: "I'm here to walk alongside you as you find a path that feels authentic and meaningful. Anxiety, depression, and other overwhelming emotions can disrupt our connection to ourselves. As a Provisional Licensed Clinical Social Worker, I support clients in building tools that nurture mental, emotional, physical, and spiritual wellness.\n\nA bit about me. I was born and raised in the San Fernando Valley, California. My parents were both born in Mexico and I identify as first generation in the United States. I am an Afro-Indigenous queer neurodivergent baddie (to say the least). Birth work, Aztec dancing, and herbalism are among the practices that fuel and inspire me.\n\nMy approach to healing is strengths-based and somatic. I integrate the elements, music, traditional healing practices, and healthy sexual expression. I have experience working with all age groups and currently focus on supporting individuals ages 14 and up. I am especially passionate about working with BIPOC and queer communities, community activists, first-time parents, neurodivergent individuals, and first-generation clients.\n\nMy goal is to offer a supportive and affirming space where you can reconnect with yourself and your inherent strengths. I am grateful for the opportunity to work together. Thank you for considering me.",
  descriptionEs: "Estoy aquí para acompañarte en la búsqueda de un camino auténtico y significativo. La ansiedad, la depresión y otras emociones abrumadoras pueden perturbar nuestra conexión con nosotros mismos. Como Trabajadora Social Clínica con Licencia Provisional, apoyo a mis clientes en el desarrollo de herramientas que fomentan el bienestar mental, emocional, físico y espiritual.\n\nUn poco sobre mí. Nací y crecí en el Valle de San Fernando, California. Mis padres nacieron en México y me identifico como primera generación en Estados Unidos. Soy una persona afroindígena, queer y neurodivergente (como mínimo). El trabajo de parto, la danza azteca y la herbolaria son algunas de las prácticas que me impulsan e inspiran.\n\nMi enfoque de sanación se basa en las fortalezas y es somático. Integro los elementos, la música, las prácticas curativas tradicionales y la expresión sexual saludable. Tengo experiencia trabajando con personas de todas las edades y actualmente me enfoco en apoyar a personas mayores de 14 años. Me apasiona especialmente trabajar con comunidades BIPOC y queer, activistas comunitarios, padres primerizos, personas neurodivergentes y clientes de primera generación.\n\nMi objetivo es ofrecer un espacio de apoyo y afirmación donde puedas reconectar contigo mismo y con tus fortalezas. Agradezco la oportunidad de trabajar juntos. Gracias por considerarme.",
  displayOrder: 23
};

const lina = {
  id: 'member-24',
  photoFilename: 'Lina-Avalos',
  firstName: 'Lina',
  lastName: 'Avalos',
  credentials: '',
  pronouns: 'she/her/ella',
  role: 'Practice Scheduler',
  roleEs: 'Programador de prácticas',
  language: 'spanish',
  descriptionEn: "My name is Lina Avalos and I am Mexican-American and I have a big passion for helping all of our communities by translating and getting them the proper care they deserve in a timely manner.\n\nIn my free time, I mainly get bossed around by my 2.5 year old, but I love cooking/baking from scratch, traveling with my husband and son, working out, and continuing my education.",
  descriptionEs: "Me llamo Lina Ávalos, soy mexicoamericana y me apasiona ayudar a todas nuestras comunidades traduciendo y brindándoles la atención adecuada que merecen de manera oportuna.\n\nEn mi tiempo libre, mi hijo de dos años y medio me da órdenes, pero me encanta cocinar y hornear desde cero, viajar con mi esposo y mi hijo, hacer ejercicio y continuar mi educación.",
  displayOrder: 24
};

const newMembers = [gabby, lina];

// 1. src/data/content/pages/team.json
const contentPath = 'src/data/content/pages/team.json';
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
content.content.team_members.push(...newMembers);
fs.writeFileSync(contentPath, JSON.stringify(content, null, 0) + '\n', 'utf8');
console.log('OK src/data/content/pages/team.json');

// 2. public/team_members_info.json
const infoPath = 'public/team_members_info.json';
const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
info.team_members.push(...newMembers);
fs.writeFileSync(infoPath, JSON.stringify(info, null, 2) + '\n', 'utf8');
console.log('OK public/team_members_info.json');

// 3. public/team.json
const publicPath = 'public/team.json';
const pub = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
pub.content.team_members.push(...newMembers);
fs.writeFileSync(publicPath, JSON.stringify(pub, null, 4) + '\n', 'utf8');
console.log('OK public/team.json');

// 4. sectionsplan/team/data.json
const planPath = 'sectionsplan/team/data.json';
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
plan.team_members.push(...newMembers);
fs.writeFileSync(planPath, JSON.stringify(plan, null, 2) + '\n', 'utf8');
console.log('OK sectionsplan/team/data.json');

console.log('Done. Added Gabby Galvez and Lina Avalos.');
