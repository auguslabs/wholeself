-- Insertar 2 nuevos miembros del equipo: Gabby Galvez y Lina Avalos
-- Ejecutar en la misma BD que usa public/api/team-members.php (tabla team_members).
-- Ajusta el nombre de la base de datos si es distinto.
-- En MySQL las comillas simples dentro del texto se escapan como ''.

-- Si tu tabla usa id numérico AUTO_INCREMENT, quita "id," de la línea de abajo y borra 'member-23' y 'member-24' de cada fila.
INSERT INTO team_members (id, photo_filename, first_name, last_name, credentials, pronouns, role, role_es, language, description_en, description_es, display_order) VALUES
(
  'member-23',
  'Gabby-Galvez',
  'Gabby',
  'Galvez',
  'LCSW',
  'they/them',
  'Mental Health Therapist',
  'Terapeuta de salud mental',
  'spanish',
  'I''m here to walk alongside you as you find a path that feels authentic and meaningful. Anxiety, depression, and other overwhelming emotions can disrupt our connection to ourselves. As a Provisional Licensed Clinical Social Worker, I support clients in building tools that nurture mental, emotional, physical, and spiritual wellness.\n\nA bit about me. I was born and raised in the San Fernando Valley, California. My parents were both born in Mexico and I identify as first generation in the United States. I am an Afro-Indigenous queer neurodivergent baddie (to say the least). Birth work, Aztec dancing, and herbalism are among the practices that fuel and inspire me.\n\nMy approach to healing is strengths-based and somatic. I integrate the elements, music, traditional healing practices, and healthy sexual expression. I have experience working with all age groups and currently focus on supporting individuals ages 14 and up. I am especially passionate about working with BIPOC and queer communities, community activists, first-time parents, neurodivergent individuals, and first-generation clients.\n\nMy goal is to offer a supportive and affirming space where you can reconnect with yourself and your inherent strengths. I am grateful for the opportunity to work together. Thank you for considering me.',
  'Estoy aquí para acompañarte en la búsqueda de un camino auténtico y significativo. La ansiedad, la depresión y otras emociones abrumadoras pueden perturbar nuestra conexión con nosotros mismos. Como Trabajadora Social Clínica con Licencia Provisional, apoyo a mis clientes en el desarrollo de herramientas que fomentan el bienestar mental, emocional, físico y espiritual.\n\nUn poco sobre mí. Nací y crecí en el Valle de San Fernando, California. Mis padres nacieron en México y me identifico como primera generación en Estados Unidos. Soy una persona afroindígena, queer y neurodivergente (como mínimo). El trabajo de parto, la danza azteca y la herbolaria son algunas de las prácticas que me impulsan e inspiran.\n\nMi enfoque de sanación se basa en las fortalezas y es somático. Integro los elementos, la música, las prácticas curativas tradicionales y la expresión sexual saludable. Tengo experiencia trabajando con personas de todas las edades y actualmente me enfoco en apoyar a personas mayores de 14 años. Me apasiona especialmente trabajar con comunidades BIPOC y queer, activistas comunitarios, padres primerizos, personas neurodivergentes y clientes de primera generación.\n\nMi objetivo es ofrecer un espacio de apoyo y afirmación donde puedas reconectar contigo mismo y con tus fortalezas. Agradezco la oportunidad de trabajar juntos. Gracias por considerarme.',
  23
),
(
  'member-24',
  'Lina-Avalos',
  'Lina',
  'Avalos',
  '',
  'she/her/ella',
  'Practice Scheduler',
  'Programador de prácticas',
  'spanish',
  'My name is Lina Avalos and I am Mexican-American and I have a big passion for helping all of our communities by translating and getting them the proper care they deserve in a timely manner.\n\nIn my free time, I mainly get bossed around by my 2.5 year old, but I love cooking/baking from scratch, traveling with my husband and son, working out, and continuing my education.',
  'Me llamo Lina Ávalos, soy mexicoamericana y me apasiona ayudar a todas nuestras comunidades traduciendo y brindándoles la atención adecuada que merecen de manera oportuna.\n\nEn mi tiempo libre, mi hijo de dos años y medio me da órdenes, pero me encanta cocinar y hornear desde cero, viajar con mi esposo y mi hijo, hacer ejercicio y continuar mi educación.',
  24
);
