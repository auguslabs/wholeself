-- Migración 024: Reestructura "Conditions We Support" sin JSON.
-- 1. Nueva tabla page_services_condition: 7 filas (una por condición), columnas planas en/es.
-- 2. page_services: añade conditions_section_title y conditions_section_subtitle; elimina conditions_section_json.
-- Requisito: tener page_services con filas en/es (ej. tras ejecutar 018). Ejecutar en la misma BD que content.php.

-- ========== 1. Crear tabla de condiciones (7 filas, datos planos) ==========
CREATE TABLE IF NOT EXISTS page_services_condition (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE COMMENT 'ej. anxiety, adhd; la URL es /services/{slug}',
  display_order INT NOT NULL DEFAULT 0 COMMENT 'orden de aparición 1-7',
  icon VARCHAR(64) NOT NULL DEFAULT '',
  title_en VARCHAR(255) NOT NULL DEFAULT '',
  title_es VARCHAR(255) NOT NULL DEFAULT '',
  short_description_en TEXT,
  short_description_es TEXT,
  detail_title_en VARCHAR(255) DEFAULT '',
  detail_title_es VARCHAR(255) DEFAULT '',
  detail_content_en LONGTEXT,
  detail_content_es LONGTEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar las 7 condiciones (en/es en columnas). Comillas simples en texto se escapan como ''.
INSERT INTO page_services_condition (slug, display_order, icon, title_en, title_es, short_description_en, short_description_es, detail_title_en, detail_title_es, detail_content_en, detail_content_es) VALUES
('anxiety', 1, 'FaceFrownIcon',
 'Anxiety Therapy', 'Terapia para Ansiedad',
 'Support for managing anxiety, panic, and worry through evidence-based approaches.', 'Apoyo para manejar ansiedad, pánico y preocupación mediante enfoques basados en evidencia.',
 'Understanding Anxiety', 'Entendiendo la Ansiedad',
 'Anxiety is a natural response to stress, but when it becomes overwhelming or persistent, it can significantly impact your daily life. At Whole Self Counseling, we provide compassionate, evidence-based support to help you manage anxiety, panic, and worry.\n\nOur approach focuses on understanding your unique experience with anxiety and developing personalized strategies that work for you. We combine therapeutic techniques with practical tools to help you build resilience and regain control.',
 'La ansiedad es una respuesta natural al estrés, pero cuando se vuelve abrumadora o persistente, puede impactar significativamente tu vida diaria. En Whole Self Counseling, brindamos apoyo compasivo basado en evidencia para ayudarte a manejar la ansiedad, el pánico y la preocupación.\n\nNuestro enfoque se centra en entender tu experiencia única con la ansiedad y desarrollar estrategias personalizadas que funcionen para ti. Combinamos técnicas terapéuticas con herramientas prácticas para ayudarte a construir resiliencia y recuperar el control.'),
('adhd', 2, 'AcademicCapIcon',
 'ADHD Support', 'Apoyo para TDAH',
 'Comprehensive support for attention, focus, and executive function challenges.', 'Apoyo integral para desafíos de atención, concentración y función ejecutiva.',
 'Understanding ADHD', 'Entendiendo el TDAH',
 'ADHD (Attention-Deficit/Hyperactivity Disorder) affects attention, focus, and executive function in unique ways for each individual. At Whole Self Counseling, we provide comprehensive support to help you understand and work with your ADHD, rather than against it.\n\nOur approach focuses on building practical strategies, developing organizational skills, and creating systems that support your unique brain wiring. We help you harness your strengths while developing tools to manage challenges.',
 'El TDAH (Trastorno por Déficit de Atención/Hiperactividad) afecta la atención, la concentración y la función ejecutiva de maneras únicas para cada individuo. En Whole Self Counseling, brindamos apoyo integral para ayudarte a entender y trabajar con tu TDAH, en lugar de luchar contra él.\n\nNuestro enfoque se centra en construir estrategias prácticas, desarrollar habilidades organizacionales y crear sistemas que apoyen tu cableado cerebral único. Te ayudamos a aprovechar tus fortalezas mientras desarrollas herramientas para manejar los desafíos.'),
('depression', 3, 'CloudIcon',
 'Depression Treatment', 'Tratamiento para Depresión',
 'Evidence-based therapy to help you navigate depression and find hope again.', 'Terapia basada en evidencia para ayudarte a navegar la depresión y encontrar esperanza nuevamente.',
 'Understanding Depression', 'Entendiendo la Depresión',
 'Depression is more than feeling sad—it can affect every aspect of your life, from your energy levels to your relationships. At Whole Self Counseling, we provide evidence-based therapy to help you navigate depression and find hope again.\n\nOur compassionate approach focuses on understanding your unique experience, identifying patterns, and developing practical strategies for healing. We work together to build resilience, restore hope, and help you reconnect with what matters most to you.',
 'La depresión es más que sentirse triste—puede afectar cada aspecto de tu vida, desde tus niveles de energía hasta tus relaciones. En Whole Self Counseling, brindamos terapia basada en evidencia para ayudarte a navegar la depresión y encontrar esperanza nuevamente.\n\nNuestro enfoque compasivo se centra en entender tu experiencia única, identificar patrones y desarrollar estrategias prácticas para la sanación. Trabajamos juntos para construir resiliencia, restaurar la esperanza y ayudarte a reconectar con lo que más te importa.'),
('bipolar', 4, 'ArrowsUpDownIcon',
 'Bipolar Disorder Support', 'Apoyo para Trastorno Bipolar',
 'Specialized support for managing mood cycles and building stability.', 'Apoyo especializado para manejar ciclos de ánimo y construir estabilidad.',
 'Understanding Bipolar Disorder', 'Entendiendo el Trastorno Bipolar',
 'Bipolar disorder involves cycles of mood changes that can range from depressive lows to manic or hypomanic highs. At Whole Self Counseling, we provide specialized support to help you manage these cycles and build stability in your life. Our approach focuses on recognizing early warning signs, developing coping strategies, and creating a support system that works for you. We help you understand your patterns, build routines that support stability, and develop skills to navigate both the highs and lows.',
 'El trastorno bipolar involucra ciclos de cambios de ánimo que pueden variar desde bajos depresivos hasta altos maníacos o hipomaníacos. En Whole Self Counseling, brindamos apoyo especializado para ayudarte a manejar estos ciclos y construir estabilidad en tu vida.\n\nNuestro enfoque se centra en reconocer signos de advertencia tempranos, desarrollar estrategias de afrontamiento y crear un sistema de apoyo que funcione para ti. Te ayudamos a entender tus patrones, construir rutinas que apoyen la estabilidad y desarrollar habilidades para navegar tanto los altos como los bajos.'),
('trauma', 5, 'ShieldCheckIcon',
 'Trauma/PTSD Therapy', 'Terapia para Trauma/TEPT',
 'Trauma-informed care to help you heal from past experiences and build resilience.', 'Atención informada sobre trauma para ayudarte a sanar de experiencias pasadas y construir resiliencia.',
 'Understanding Trauma and PTSD', 'Entendiendo el Trauma y el TEPT',
 'Trauma can leave lasting impacts on your mind, body, and spirit. Whether you''ve experienced a single traumatic event or ongoing trauma, healing is possible. At Whole Self Counseling, we provide trauma-informed care to help you heal from past experiences and build resilience.\n\nOur trauma-informed approach prioritizes safety, empowerment, and your pace of healing. We use evidence-based techniques to help you process traumatic memories, develop coping strategies, and rebuild a sense of safety and trust in yourself and others.',
 'El trauma puede dejar impactos duraderos en tu mente, cuerpo y espíritu. Ya sea que hayas experimentado un evento traumático único o trauma continuo, la sanación es posible. En Whole Self Counseling, brindamos atención informada sobre trauma para ayudarte a sanar de experiencias pasadas y construir resiliencia.\n\nNuestro enfoque informado sobre trauma prioriza la seguridad, el empoderamiento y tu ritmo de sanación. Usamos técnicas basadas en evidencia para ayudarte a procesar recuerdos traumáticos, desarrollar estrategias de afrontamiento y reconstruir un sentido de seguridad y confianza en ti mismo y en otros.'),
('stress', 6, 'FireIcon',
 'Stress Management', 'Manejo del Estrés',
 'Tools and strategies to manage stress, build coping skills, and improve well-being.', 'Herramientas y estrategias para manejar el estrés, desarrollar habilidades de afrontamiento y mejorar el bienestar.',
 'Understanding Stress', 'Entendiendo el Estrés',
 'Stress is a natural part of life, but when it becomes chronic or overwhelming, it can take a toll on your physical and mental health. At Whole Self Counseling, we provide tools and strategies to help you manage stress effectively and improve your overall well-being.\n\nOur approach focuses on identifying your unique stress triggers, developing healthy coping skills, and creating sustainable strategies for managing life''s challenges. We help you build resilience, set boundaries, and create a more balanced, fulfilling life.',
 'El estrés es una parte natural de la vida, pero cuando se vuelve crónico o abrumador, puede afectar tu salud física y mental. En Whole Self Counseling, brindamos herramientas y estrategias para ayudarte a manejar el estrés efectivamente y mejorar tu bienestar general.\n\nNuestro enfoque se centra en identificar tus desencadenantes únicos de estrés, desarrollar habilidades de afrontamiento saludables y crear estrategias sostenibles para manejar los desafíos de la vida. Te ayudamos a construir resiliencia, establecer límites y crear una vida más equilibrada y satisfactoria.'),
('identity', 7, 'UserCircleIcon',
 'Identity/Transition Support', 'Apoyo para Identidad/Transición',
 'Affirming support for gender identity, transition, and authentic self-expression.', 'Apoyo afirmativo para identidad de género, transición y expresión auténtica del ser.',
 'Understanding Identity and Transition', 'Entendiendo la Identidad y la Transición',
 'Exploring and affirming your gender identity is a deeply personal journey. At Whole Self Counseling, we provide affirming, supportive care for individuals navigating gender identity, transition, and authentic self-expression.\n\nOur approach is grounded in respect, validation, and empowerment. We create a safe, non-judgmental space where you can explore your identity at your own pace. We support you through all aspects of your journey, from self-discovery to social transition, helping you build confidence and live authentically.',
 'Explorar y afirmar tu identidad de género es un viaje profundamente personal. En Whole Self Counseling, brindamos atención afirmativa y de apoyo para personas que navegan la identidad de género, la transición y la expresión auténtica del ser.\n\nNuestro enfoque se basa en el respeto, la validación y el empoderamiento. Creamos un espacio seguro y sin juicios donde puedes explorar tu identidad a tu propio ritmo. Te apoyamos en todos los aspectos de tu viaje, desde el autodescubrimiento hasta la transición social, ayudándote a construir confianza y vivir auténticamente.')
ON DUPLICATE KEY UPDATE display_order=VALUES(display_order), icon=VALUES(icon), title_en=VALUES(title_en), title_es=VALUES(title_es), short_description_en=VALUES(short_description_en), short_description_es=VALUES(short_description_es), detail_title_en=VALUES(detail_title_en), detail_title_es=VALUES(detail_title_es), detail_content_en=VALUES(detail_content_en), detail_content_es=VALUES(detail_content_es), updated_at=NOW();

-- ========== 2. page_services: columnas para título y subtítulo de la sección; quitar JSON ==========
-- Si al ejecutar el ALTER de abajo falla con "#1060 Duplicate column name", las columnas ya existen:
--   1. No ejecutes el ALTER ADD (las 3 líneas siguientes).
--   2. Ejecuta solo el bloque "SI FALLÓ EL ALTER (columnas ya existen)" que está al final de este archivo.

ALTER TABLE page_services
  ADD COLUMN conditions_section_title VARCHAR(255) DEFAULT '' COMMENT 'Título de la sección Conditions We Support para este locale',
  ADD COLUMN conditions_section_subtitle TEXT COMMENT 'Subtítulo de la sección para este locale';

-- Rellenar título y subtítulo en las filas en/es.
UPDATE page_services SET conditions_section_title = 'Conditions We Support', conditions_section_subtitle = 'We provide specialized support for various conditions. Click to learn more about our approach.' WHERE locale = 'en';
UPDATE page_services SET conditions_section_title = 'Condiciones que Apoyamos', conditions_section_subtitle = 'Brindamos apoyo especializado para diversas condiciones. Haz clic para conocer más sobre nuestro enfoque.' WHERE locale = 'es';

-- Eliminar la columna JSON de condiciones (los datos están ahora en page_services_condition).
ALTER TABLE page_services DROP COLUMN conditions_section_json;


-- ========== SI FALLÓ EL ALTER (columnas ya existen): ejecuta solo este bloque ==========
-- Copia y pega en SQL solo estas 4 líneas:
--
-- UPDATE page_services SET conditions_section_title = 'Conditions We Support', conditions_section_subtitle = 'We provide specialized support for various conditions. Click to learn more about our approach.' WHERE locale = 'en';
-- UPDATE page_services SET conditions_section_title = 'Condiciones que Apoyamos', conditions_section_subtitle = 'Brindamos apoyo especializado para diversas condiciones. Haz clic para conocer más sobre nuestro enfoque.' WHERE locale = 'es';
-- ALTER TABLE page_services DROP COLUMN conditions_section_json;
