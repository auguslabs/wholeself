<?php
/**
 * GET /api/content.php?pageId=xxx&locale=es
 * PUT /api/content/home (vía .htaccess) → guardado desde Augushub
 * Misma URL para lectura (GET) y escritura (PUT/POST).
 */
header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// CORS: permitir origen de Augushub y métodos PUT/POST
$configApiFile = __DIR__ . '/content_api_config.php';
if (is_file($configApiFile)) {
  require $configApiFile;
  $corsOrigins = defined('CONTENT_API_CORS_ORIGINS') && is_array(CONTENT_API_CORS_ORIGINS) && count(CONTENT_API_CORS_ORIGINS) > 0
    ? CONTENT_API_CORS_ORIGINS
    : ['*'];
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if ($origin !== '' && (in_array('*', $corsOrigins) || in_array($origin, $corsOrigins))) {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
  } elseif (in_array('*', $corsOrigins)) {
    header('Access-Control-Allow-Origin: *');
  }
} else {
  header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, PUT, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key, Authorization');
header('Access-Control-Max-Age: 86400');

if ($method === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if (!in_array($method, ['GET', 'PUT', 'POST'], true)) {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

$pageId = trim($_GET['pageId'] ?? '');

// ---------- Escritura (PUT/POST) desde Augushub ----------
if ($method === 'PUT' || $method === 'POST') {
  if (!is_file($configApiFile)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Content API config not found. Copy content_api_config.sample.php to content_api_config.php.']);
    exit;
  }
  require $configApiFile;
  if (!defined('CONTENT_API_KEY') || CONTENT_API_KEY === '' || CONTENT_API_KEY === 'cambiar-por-clave-secreta-generada') {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Content API key not configured. Set CONTENT_API_KEY in content_api_config.php.']);
    exit;
  }

  $apiKey = null;
  if (!empty($_SERVER['HTTP_X_API_KEY'])) {
    $apiKey = trim($_SERVER['HTTP_X_API_KEY']);
  } elseif (!empty($_SERVER['HTTP_AUTHORIZATION']) && preg_match('/^Bearer\s+(.+)$/i', $_SERVER['HTTP_AUTHORIZATION'], $m)) {
    $apiKey = trim($m[1]);
  }
  if ($apiKey === null || $apiKey !== CONTENT_API_KEY) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
    exit;
  }

  $raw = file_get_contents('php://input');
  $body = $raw !== false ? json_decode($raw, true) : null;
  if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON body']);
    exit;
  }

  $meta = $body['meta'] ?? null;
  $seo = $body['seo'] ?? null;
  $content = $body['content'] ?? null;
  if (!is_array($meta) || !is_array($seo) || !is_array($content)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Body must include meta, seo, and content (objects)']);
    exit;
  }

  $bodyPageId = isset($meta['pageId']) ? trim((string) $meta['pageId']) : '';
  if ($pageId === '' && $bodyPageId === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'pageId required (URL or meta.pageId)']);
    exit;
  }
  if ($pageId === '') {
    $pageId = $bodyPageId;
  }
  if ($bodyPageId !== '' && $bodyPageId !== $pageId) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid page_id: URL and meta.pageId must match']);
    exit;
  }

  $configFile = __DIR__ . '/forms/db_config.php';
  if (!is_file($configFile)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Server config not found']);
    exit;
  }
  require $configFile;

  try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    if ($conn->connect_error) {
      http_response_code(500);
      echo json_encode(['ok' => false, 'error' => 'Database connection failed']);
      exit;
    }
    $conn->set_charset('utf8mb4');

    // ---------- Home: escribir en tabla plana page_home (2 filas en/es) ----------
    if ($pageId === 'home') {
      $hero = $content['hero'] ?? [];
      $vp = $content['valuePropositions'] ?? [];
      $vpItems = isset($vp['items']) && is_array($vp['items']) ? $vp['items'] : [];
      $cta = $content['ctaSection'] ?? [];
      // Contrato del sitio/editor: ctaSection.ctas. Aceptamos ctaSection.items solo por compatibilidad.
      $ctaItems =
        (isset($cta['ctas']) && is_array($cta['ctas']))
          ? $cta['ctas']
          : ((isset($cta['items']) && is_array($cta['items'])) ? $cta['items'] : []);

      $loc = function ($v) {
        if (is_array($v) && (isset($v['en']) || isset($v['es']))) {
          return ['en' => $v['en'] ?? '', 'es' => $v['es'] ?? ''];
        }
        $s = is_string($v) ? $v : '';
        return ['en' => $s, 'es' => $s];
      };
      // id, link, icon son siempre escalares en page_home; si vienen como {en,es} usar .en
      $str = function ($v) {
        if (is_string($v)) return $v;
        if (is_array($v) && (isset($v['en']) || isset($v['es']))) {
          return is_string($v['en'] ?? null) ? $v['en'] : (is_string($v['es'] ?? null) ? $v['es'] : '');
        }
        return '';
      };

      $metaLastUpdated = isset($meta['lastUpdated']) ? $meta['lastUpdated'] : date('c');
      $metaVersion = isset($meta['version']) ? (int) $meta['version'] : 1;

      foreach (['en' => 'en', 'es' => 'es'] as $locale) {
        $h = $loc($hero['headline'] ?? '');
        $hd = $loc($hero['description'] ?? '');
        $himg = $loc($hero['backgroundImage'] ?? '');
        $halt = $loc($hero['backgroundImageAlt'] ?? '');
        $seoT = $loc($seo['title'] ?? '');
        $seoD = $loc($seo['description'] ?? '');
        $ctaTitle = $loc($cta['title'] ?? '');

        $v1 = $loc($vpItems[0]['icon'] ?? ''); $v1t = $loc($vpItems[0]['title'] ?? ''); $v1d = $loc($vpItems[0]['description'] ?? '');
        $v2 = $loc($vpItems[1]['icon'] ?? ''); $v2t = $loc($vpItems[1]['title'] ?? ''); $v2d = $loc($vpItems[1]['description'] ?? '');
        $v3 = $loc($vpItems[2]['icon'] ?? ''); $v3t = $loc($vpItems[2]['title'] ?? ''); $v3d = $loc($vpItems[2]['description'] ?? '');
        $v4 = $loc($vpItems[3]['icon'] ?? ''); $v4t = $loc($vpItems[3]['title'] ?? ''); $v4d = $loc($vpItems[3]['description'] ?? '');

        $c1 = $ctaItems[0] ?? []; $c2 = $ctaItems[1] ?? []; $c3 = $ctaItems[2] ?? [];
        $c1id = $str($c1['id'] ?? ''); $c1t = $loc($c1['title'] ?? ''); $c1d = $loc($c1['description'] ?? ''); $c1link = $str($c1['link'] ?? ''); $c1icon = $str($c1['icon'] ?? '');
        $c2id = $str($c2['id'] ?? ''); $c2t = $loc($c2['title'] ?? ''); $c2d = $loc($c2['description'] ?? ''); $c2link = $str($c2['link'] ?? ''); $c2icon = $str($c2['icon'] ?? '');
        $c3id = $str($c3['id'] ?? ''); $c3t = $loc($c3['title'] ?? ''); $c3d = $loc($c3['description'] ?? ''); $c3link = $str($c3['link'] ?? ''); $c3icon = $str($c3['icon'] ?? '');

        $stmt = $conn->prepare('UPDATE page_home SET meta_last_updated=?, meta_version=?, seo_title=?, seo_description=?, hero_headline=?, hero_description=?, hero_background_image=?, hero_background_image_alt=?, vp1_icon=?, vp1_title=?, vp1_description=?, vp2_icon=?, vp2_title=?, vp2_description=?, vp3_icon=?, vp3_title=?, vp3_description=?, vp4_icon=?, vp4_title=?, vp4_description=?, cta_section_title=?, cta1_id=?, cta1_title=?, cta1_description=?, cta1_link=?, cta1_icon=?, cta2_id=?, cta2_title=?, cta2_description=?, cta2_link=?, cta2_icon=?, cta3_id=?, cta3_title=?, cta3_description=?, cta3_link=?, cta3_icon=? WHERE locale=?');
        if (!$stmt) {
          $conn->close();
          http_response_code(500);
          echo json_encode(['ok' => false, 'error' => 'Query failed']);
          exit;
        }
        $stmt->bind_param('sisssssssssssssssssssssssssssssssssss',
          $metaLastUpdated, $metaVersion,
          $seoT[$locale], $seoD[$locale],
          $h[$locale], $hd[$locale], $himg[$locale], $halt[$locale],
          $v1[$locale], $v1t[$locale], $v1d[$locale],
          $v2[$locale], $v2t[$locale], $v2d[$locale],
          $v3[$locale], $v3t[$locale], $v3d[$locale],
          $v4[$locale], $v4t[$locale], $v4d[$locale],
          $ctaTitle[$locale],
          $c1id, $c1t[$locale], $c1d[$locale], $c1link, $c1icon,
          $c2id, $c2t[$locale], $c2d[$locale], $c2link, $c2icon,
          $c3id, $c3t[$locale], $c3d[$locale], $c3link, $c3icon,
          $locale
        );
        $stmt->execute();
        $stmt->close();
      }
      $conn->close();
      http_response_code(200);
      echo json_encode(['ok' => true]);
      exit;
    }

    // ---------- Shared header: escribir en tabla plana page_shared_header (menu + navigation.items, migración 029) ----------
    if ($pageId === 'shared-header') {
      $loc = function ($v) {
        if (is_array($v) && (isset($v['en']) || isset($v['es']))) {
          return ['en' => (string) ($v['en'] ?? ''), 'es' => (string) ($v['es'] ?? '')];
        }
        $s = is_string($v) ? $v : '';
        return ['en' => $s, 'es' => $s];
      };
      $str = function ($v) {
        if (is_string($v)) return $v;
        if (is_array($v) && (isset($v['en']) || isset($v['es']))) return (string) ($v['en'] ?? $v['es'] ?? '');
        return '';
      };
      $menu = $content['menu'] ?? [];
      $menuLabel = $loc($menu['label'] ?? 'menu');
      $menuCloseLabel = $loc($menu['closeLabel'] ?? '✕');
      $nav = $content['navigation'] ?? [];
      $navItems = isset($nav['items']) && is_array($nav['items']) ? $nav['items'] : [];
      $navLabel = function ($i) use ($navItems, $loc) {
        $it = $navItems[$i] ?? [];
        $v = $it['label'] ?? '';
        return $loc($v);
      };
      $navLink = function ($i) use ($navItems, $str) { return $str($navItems[$i]['link'] ?? $navItems[$i]['href'] ?? ''); };
      $metaLastUpdated = isset($meta['lastUpdated']) ? $meta['lastUpdated'] : date('c');
      $metaVersion = isset($meta['version']) ? (int) $meta['version'] : 1;
      $seoTitle = $loc($seo['title'] ?? '');
      $seoDesc = $loc($seo['description'] ?? '');
      foreach (['en', 'es'] as $locale) {
        $n1 = $navLabel(0); $n2 = $navLabel(1); $n3 = $navLabel(2); $n4 = $navLabel(3); $n5 = $navLabel(4); $n6 = $navLabel(5);
        $stmt = $conn->prepare('UPDATE page_shared_header SET meta_last_updated=?, meta_version=?, seo_title=?, seo_description=?, menu_label=?, menu_close_label=?, nav_link1_label=?, nav_link1_link=?, nav_link2_label=?, nav_link2_link=?, nav_link3_label=?, nav_link3_link=?, nav_link4_label=?, nav_link4_link=?, nav_link5_label=?, nav_link5_link=?, nav_link6_label=?, nav_link6_link=? WHERE locale=?');
        if (!$stmt) {
          $conn->close();
          http_response_code(500);
          echo json_encode(['ok' => false, 'error' => 'Query failed']);
          exit;
        }
        $stmt->bind_param('sissssssssssssssssss', $metaLastUpdated, $metaVersion, $seoTitle[$locale], $seoDesc[$locale], $menuLabel[$locale], $menuCloseLabel[$locale], $n1[$locale], $navLink(0), $n2[$locale], $navLink(1), $n3[$locale], $navLink(2), $n4[$locale], $navLink(3), $n5[$locale], $navLink(4), $n6[$locale], $navLink(5), $locale);
        $stmt->execute();
        $stmt->close();
      }
      $conn->close();
      http_response_code(200);
      echo json_encode(['ok' => true]);
      exit;
    }

    // ---------- Shared footer: escribir en tabla plana page_shared_footer (esquema augushub: nav_title, nav_link1..6, copyright, link1..6) ----------
    if ($pageId === 'shared-footer') {
      $loc = function ($v) {
        if (is_array($v) && (isset($v['en']) || isset($v['es']))) {
          return ['en' => $v['en'] ?? '', 'es' => $v['es'] ?? ''];
        }
        $s = is_string($v) ? $v : '';
        return ['en' => $s, 'es' => $s];
      };
      $str = function ($v) {
        if (is_string($v)) return $v;
        if (is_array($v) && (isset($v['en']) || isset($v['es']))) return is_string($v['en'] ?? null) ? $v['en'] : (is_string($v['es'] ?? null) ? $v['es'] : '');
        return '';
      };
      $company = $content['companyInfo'] ?? [];
      $nav = $content['navigation'] ?? [];
      $res = $content['resources'] ?? [];
      $navItems = isset($nav['items']) && is_array($nav['items']) ? $nav['items'] : [];
      $resItems = isset($res['items']) && is_array($res['items']) ? $res['items'] : [];
      $companyName = $loc($company['name'] ?? '');
      $companyTagline = $loc($company['tagline'] ?? '');
      $navTitle = $loc($nav['title'] ?? '');
      $resTitle = $loc($res['title'] ?? '');
      $copyright = $loc($content['copyright'] ?? '');
      $metaLastUpdated = isset($meta['lastUpdated']) ? $meta['lastUpdated'] : date('c');
      $metaVersion = isset($meta['version']) ? (int) $meta['version'] : 1;
      $navLabel = function ($i) use ($navItems) {
        $it = $navItems[$i] ?? [];
        $v = $it['label'] ?? $it['href'] ?? '';
        if (is_array($v) && (isset($v['en']) || isset($v['es']))) return $v;
        return ['en' => (string) $v, 'es' => (string) $v];
      };
      $navLink = function ($i) use ($navItems, $str) { return $str($navItems[$i]['link'] ?? $navItems[$i]['href'] ?? ''); };
      $resLabel = function ($i) use ($resItems) {
        $it = $resItems[$i] ?? [];
        $v = $it['label'] ?? '';
        if (is_array($v) && (isset($v['en']) || isset($v['es']))) return $v;
        return ['en' => (string) $v, 'es' => (string) $v];
      };
      $resLink = function ($i) use ($resItems, $str) { return $str($resItems[$i]['link'] ?? ''); };
      $resModal = function ($i) use ($resItems) { return (int) (bool) ($resItems[$i]['isModal'] ?? 0); };
      foreach (['en' => 'en', 'es' => 'es'] as $locale) {
        $stmt = $conn->prepare('UPDATE page_shared_footer SET meta_last_updated=?, meta_version=?, company_name=?, company_tagline=?, copyright=?, nav_title=?, nav_link1_label=?, nav_link1_link=?, nav_link2_label=?, nav_link2_link=?, nav_link3_label=?, nav_link3_link=?, nav_link4_label=?, nav_link4_link=?, nav_link5_label=?, nav_link5_link=?, nav_link6_label=?, nav_link6_link=?, resources_title=?, link1_label=?, link1_link=?, link1_is_modal=?, link2_label=?, link2_link=?, link2_is_modal=?, link3_label=?, link3_link=?, link3_is_modal=?, link4_label=?, link4_link=?, link4_is_modal=?, link5_label=?, link5_link=?, link5_is_modal=?, link6_label=?, link6_link=?, link6_is_modal=? WHERE locale=?');
        if (!$stmt) {
          $conn->close();
          http_response_code(500);
          echo json_encode(['ok' => false, 'error' => 'Query failed']);
          exit;
        }
        $n1 = $navLabel(0); $n2 = $navLabel(1); $n3 = $navLabel(2); $n4 = $navLabel(3); $n5 = $navLabel(4); $n6 = $navLabel(5);
        $r1 = $resLabel(0); $r2 = $resLabel(1); $r3 = $resLabel(2); $r4 = $resLabel(3); $r5 = $resLabel(4); $r6 = $resLabel(5);
        // Log de escritura footer por locale (company_name y tagline que vienen del editor)
        error_log('[content.php PUT shared-footer] locale=' . $locale . ' company_name=' . json_encode($companyName[$locale] ?? '') . ' tagline=' . json_encode($companyTagline[$locale] ?? ''));

        // 38 placeholders: meta(2), company+nav_title(5), nav_links(12), resources_title(1), link1..6(18), locale(1). Type string must be 38 chars.
        $stmt->bind_param('sissssssssssssssssssisssisssisssisssis',
          $metaLastUpdated, $metaVersion,
          $companyName[$locale], $companyTagline[$locale], $copyright[$locale], $navTitle[$locale],
          $n1[$locale], $navLink(0), $n2[$locale], $navLink(1), $n3[$locale], $navLink(2), $n4[$locale], $navLink(3), $n5[$locale], $navLink(4), $n6[$locale], $navLink(5),
          $resTitle[$locale],
          $r1[$locale], $resLink(0), $resModal(0), $r2[$locale], $resLink(1), $resModal(1), $r3[$locale], $resLink(2), $resModal(2),
          $r4[$locale], $resLink(3), $resModal(3), $r5[$locale], $resLink(4), $resModal(4), $r6[$locale], $resLink(5), $resModal(5),
          $locale
        );
        $stmt->execute();
        $stmt->close();
      }
      $conn->close();
      http_response_code(200);
      echo json_encode(['ok' => true]);
      exit;
    }

    // ---------- Crisis resources: escribir en tabla plana page_crisis_resources (2 filas en/es) ----------
    if ($pageId === 'crisis-resources') {
      $loc = function ($v) {
        if (is_array($v) && (isset($v['en']) || isset($v['es']))) {
          return ['en' => (string) ($v['en'] ?? ''), 'es' => (string) ($v['es'] ?? '')];
        }
        $s = is_string($v) ? $v : '';
        return ['en' => $s, 'es' => $s];
      };
      $hero = $content['hero'] ?? [];
      $button = $content['button'] ?? [];
      $heroTitle = $loc($hero['title'] ?? '');
      $btnAria = $loc($button['ariaLabel'] ?? '');
      $btnTitle = $loc($button['title'] ?? '');
      $categories = isset($content['categories']) && is_array($content['categories']) ? $content['categories'] : [];
      $categoriesJson = json_encode($categories, JSON_UNESCAPED_UNICODE);
      if ($categoriesJson === false) {
        $categoriesJson = '[]';
      }
      // Log de escritura crisis-resources (trazabilidad migración a page_crisis_resources)
      error_log('[content.php PUT crisis-resources] hero_title.en=' . json_encode($heroTitle['en'] ?? '') . ' hero_title.es=' . json_encode($heroTitle['es'] ?? '') . ' categories_count=' . count($categories));
      $metaLastUpdated = isset($meta['lastUpdated']) ? (string) $meta['lastUpdated'] : date('c');
      $metaVersion = isset($meta['version']) ? (int) $meta['version'] : 1;
      $seoTitle = $loc($seo['title'] ?? '');
      $seoDesc = $loc($seo['description'] ?? '');

      foreach (['en', 'es'] as $locale) {
        $stmt = $conn->prepare('UPDATE page_crisis_resources SET meta_last_updated=?, meta_version=?, seo_title=?, seo_description=?, hero_title=?, button_aria_label=?, button_title=?, categories_json=? WHERE locale=?');
        if (!$stmt) {
          $conn->close();
          http_response_code(500);
          echo json_encode(['ok' => false, 'error' => 'Query failed']);
          exit;
        }
        $seoT = $seoTitle[$locale] ?? '';
        $seoD = $seoDesc[$locale] ?? '';
        $hTitle = $heroTitle[$locale] ?? '';
        $bAria = $btnAria[$locale] ?? '';
        $bTitle = $btnTitle[$locale] ?? '';
        $stmt->bind_param('sisssssss', $metaLastUpdated, $metaVersion, $seoT, $seoD, $hTitle, $bAria, $bTitle, $categoriesJson, $locale);
        $stmt->execute();
        $stmt->close();
      }
      $conn->close();
      http_response_code(200);
      echo json_encode(['ok' => true]);
      exit;
    }

    // ---------- What to expect: escribir en tabla plana page_what_to_expect (2 filas en/es) ----------
    if ($pageId === 'what-to-expect') {
      $loc = function ($v) {
        if (is_array($v) && (isset($v['en']) || isset($v['es']))) {
          return ['en' => (string) ($v['en'] ?? ''), 'es' => (string) ($v['es'] ?? '')];
        }
        $s = is_string($v) ? $v : '';
        return ['en' => $s, 'es' => $s];
      };
      $hero = $content['hero'] ?? [];
      $intro = $content['intro'] ?? [];
      $heroTitle = $loc($hero['title'] ?? '');
      $heroSubtitle = $loc($hero['subtitle'] ?? '');
      $introText = $loc($intro['text'] ?? '');
      $mergedSections = isset($content['sections']) && is_array($content['sections']) ? $content['sections'] : [];
      $ctaSection = $content['ctaSection'] ?? [];
      $ctaTitle = $loc($ctaSection['title'] ?? '');
      $ctaSubtitle = $loc($ctaSection['subtitle'] ?? '');
      $mergedCtas = isset($ctaSection['ctas']) && is_array($ctaSection['ctas']) ? $ctaSection['ctas'] : [];
      $metaLastUpdated = isset($meta['lastUpdated']) ? (string) $meta['lastUpdated'] : date('c');
      $metaVersion = isset($meta['version']) ? (int) $meta['version'] : 1;
      $seoTitle = $loc($seo['title'] ?? '');
      $seoDesc = $loc($seo['description'] ?? '');

      $buildSectionsForLocale = function (array $sections, string $locale) {
        $out = [];
        foreach ($sections as $sec) {
          $title = is_array($sec['title'] ?? null) ? ($sec['title'][$locale] ?? '') : ($sec['title'] ?? '');
          $content = $sec['content'] ?? [];
          $intro = is_array($content['intro'] ?? null) ? ($content['intro'][$locale] ?? '') : ($content['intro'] ?? '');
          $items = [];
          foreach ($content['items'] ?? [] as $it) {
            $items[] = [
              'title' => is_array($it['title'] ?? null) ? ($it['title'][$locale] ?? '') : ($it['title'] ?? ''),
              'description' => is_array($it['description'] ?? null) ? ($it['description'][$locale] ?? '') : ($it['description'] ?? ''),
            ];
          }
          $paragraphs = [];
          foreach ($content['paragraphs'] ?? [] as $p) {
            $paragraphs[] = is_array($p) ? ($p[$locale] ?? '') : $p;
          }
          $out[] = [
            'id' => $sec['id'] ?? '',
            'title' => $title,
            'icon' => $sec['icon'] ?? '',
            'content' => ['intro' => $intro, 'items' => $items, 'paragraphs' => $paragraphs],
          ];
        }
        return json_encode($out, JSON_UNESCAPED_UNICODE) ?: '[]';
      };
      $buildCtaForLocale = function (array $ctas, string $locale) use ($ctaTitle, $ctaSubtitle) {
        $out = ['title' => $ctaTitle[$locale] ?? '', 'subtitle' => $ctaSubtitle[$locale] ?? '', 'ctas' => []];
        foreach ($ctas as $c) {
          $out['ctas'][] = [
            'id' => $c['id'] ?? '',
            'title' => is_array($c['title'] ?? null) ? ($c['title'][$locale] ?? '') : ($c['title'] ?? ''),
            'description' => is_array($c['description'] ?? null) ? ($c['description'][$locale] ?? '') : ($c['description'] ?? ''),
            'link' => (string) ($c['link'] ?? ''),
            'variant' => $c['variant'] ?? 'primary',
          ];
        }
        return json_encode($out, JSON_UNESCAPED_UNICODE) ?: '{"title":"","subtitle":"","ctas":[]}';
      };

      foreach (['en', 'es'] as $locale) {
        $sectionsJson = $buildSectionsForLocale($mergedSections, $locale);
        $ctaJson = $buildCtaForLocale($mergedCtas, $locale);
        $seoT = $seoTitle[$locale] ?? '';
        $seoD = $seoDesc[$locale] ?? '';
        $hTitle = $heroTitle[$locale] ?? '';
        $hSub = $heroSubtitle[$locale] ?? '';
        $introT = $introText[$locale] ?? '';
        $stmt = $conn->prepare('UPDATE page_what_to_expect SET meta_last_updated=?, meta_version=?, seo_title=?, seo_description=?, hero_title=?, hero_subtitle=?, intro_text=?, sections_json=?, cta_section_json=? WHERE locale=?');
        if (!$stmt) {
          $conn->close();
          http_response_code(500);
          echo json_encode(['ok' => false, 'error' => 'Query failed']);
          exit;
        }
        $stmt->bind_param('sissssssss', $metaLastUpdated, $metaVersion, $seoT, $seoD, $hTitle, $hSub, $introT, $sectionsJson, $ctaJson, $locale);
        $stmt->execute();
        $stmt->close();
      }
      error_log('[content.php PUT what-to-expect] hero_title.en=' . json_encode($heroTitle['en']) . ' sections_count=' . count($mergedSections));
      $conn->close();
      http_response_code(200);
      echo json_encode(['ok' => true]);
      exit;
    }

    // ---------- Rates: escribir en tabla plana page_rates (2 filas en/es) ----------
    if ($pageId === 'rates') {
      $loc = function ($v) {
        if (is_array($v) && (isset($v['en']) || isset($v['es']))) {
          return ['en' => (string) ($v['en'] ?? ''), 'es' => (string) ($v['es'] ?? '')];
        }
        $s = is_string($v) ? $v : '';
        return ['en' => $s, 'es' => $s];
      };
      $hero = $content['hero'] ?? [];
      $metaLastUpdated = isset($meta['lastUpdated']) ? (string) $meta['lastUpdated'] : date('c');
      $metaVersion = isset($meta['version']) ? (int) $meta['version'] : 1;
      $seoTitle = $loc($seo['title'] ?? '');
      $seoDesc = $loc($seo['description'] ?? '');
      $heroTitle = $loc($hero['title'] ?? '');
      $heroSubtitle = $loc($hero['subtitle'] ?? '');
      $heroBg = $hero['backgroundImage'] ?? '';
      $heroBgArr = is_array($heroBg) ? $heroBg : ['en' => $heroBg, 'es' => $heroBg];
      $heroBgEn = (string) ($heroBgArr['en'] ?? '');
      $heroBgEs = (string) ($heroBgArr['es'] ?? '');
      $heroAlt = $loc($hero['backgroundImageAlt'] ?? '');

      $pricing = $content['pricing'] ?? [];
      $insurance = $content['insurance'] ?? [];
      $paymentOptions = $content['paymentOptions'] ?? [];
      $faq = $content['faq'] ?? [];
      $ctaSection = $content['ctaSection'] ?? [];

      $buildRatesRow = function (string $locale) use ($pricing, $insurance, $paymentOptions, $faq, $ctaSection, $loc) {
        $pTitle = is_array($pricing['title'] ?? null) ? ($pricing['title'][$locale] ?? '') : ($pricing['title'] ?? '');
        $pSessions = [];
        foreach ($pricing['sessions'] ?? [] as $s) {
          $pSessions[] = [
            'type' => is_array($s['type'] ?? null) ? ($s['type'][$locale] ?? '') : ($s['type'] ?? ''),
            'rate' => is_array($s['rate'] ?? null) ? ($s['rate'][$locale] ?? '') : ($s['rate'] ?? ''),
            'duration' => is_array($s['duration'] ?? null) ? ($s['duration'][$locale] ?? '') : ($s['duration'] ?? ''),
          ];
        }
        $pricingJson = json_encode(['title' => $pTitle, 'sessions' => $pSessions], JSON_UNESCAPED_UNICODE) ?: '{"title":"","sessions":[]}';

        $ins = $insurance;
        $insTitle = is_array($ins['title'] ?? null) ? ($ins['title'][$locale] ?? '') : ($ins['title'] ?? '');
        $insDesc = is_array($ins['description'] ?? null) ? ($ins['description'][$locale] ?? '') : ($ins['description'] ?? '');
        // providerList ya no se guarda en insurance_json; viene de la tabla insurance_provider (migración 025)
        $providerList = [];
        $providers = [];
        foreach ($ins['providers'] ?? [] as $pr) {
          $providers[] = [
            'label' => is_array($pr['label'] ?? null) ? ($pr['label'][$locale] ?? '') : ($pr['label'] ?? ''),
            'text' => is_array($pr['text'] ?? null) ? ($pr['text'][$locale] ?? '') : ($pr['text'] ?? ''),
          ];
        }
        $modal = $ins['modal'] ?? [];
        $modalCta = $modal['cta'] ?? [];
        $insModal = [
          'title' => is_array($modal['title'] ?? null) ? ($modal['title'][$locale] ?? '') : ($modal['title'] ?? ''),
          'description' => is_array($modal['description'] ?? null) ? ($modal['description'][$locale] ?? '') : ($modal['description'] ?? ''),
          'outOfNetworkInfo' => is_array($modal['outOfNetworkInfo'] ?? null) ? ($modal['outOfNetworkInfo'][$locale] ?? '') : ($modal['outOfNetworkInfo'] ?? ''),
          'note' => is_array($modal['note'] ?? null) ? ($modal['note'][$locale] ?? '') : ($modal['note'] ?? ''),
          'cta' => [
            'text' => is_array($modalCta['text'] ?? null) ? ($modalCta['text'][$locale] ?? '') : ($modalCta['text'] ?? ''),
            'href' => is_array($modalCta['href'] ?? null) ? ($modalCta['href'][$locale] ?? '') : ($modalCta['href'] ?? ''),
          ],
        ];
        $insuranceJson = json_encode([
          'title' => $insTitle,
          'description' => $insDesc,
          'providerList' => $providerList,
          'providers' => $providers,
          'modal' => $insModal,
        ], JSON_UNESCAPED_UNICODE) ?: '{}';

        $poTitle = is_array($paymentOptions['title'] ?? null) ? ($paymentOptions['title'][$locale] ?? '') : ($paymentOptions['title'] ?? '');
        $poDesc = is_array($paymentOptions['description'] ?? null) ? ($paymentOptions['description'][$locale] ?? '') : ($paymentOptions['description'] ?? '');
        $poOpts = [];
        foreach ($paymentOptions['options'] ?? [] as $o) {
          $poOpts[] = [
            'label' => is_array($o['label'] ?? null) ? ($o['label'][$locale] ?? '') : ($o['label'] ?? ''),
            'text' => is_array($o['text'] ?? null) ? ($o['text'][$locale] ?? '') : ($o['text'] ?? ''),
          ];
        }
        $paymentOptionsJson = json_encode(['title' => $poTitle, 'description' => $poDesc, 'options' => $poOpts], JSON_UNESCAPED_UNICODE) ?: '{}';

        $faqTitle = is_array($faq['title'] ?? null) ? ($faq['title'][$locale] ?? '') : ($faq['title'] ?? '');
        $faqQuestions = [];
        foreach ($faq['questions'] ?? [] as $q) {
          $faqQuestions[] = [
            'question' => is_array($q['question'] ?? null) ? ($q['question'][$locale] ?? '') : ($q['question'] ?? ''),
            'answer' => is_array($q['answer'] ?? null) ? ($q['answer'][$locale] ?? '') : ($q['answer'] ?? ''),
          ];
        }
        $faqJson = json_encode(['title' => $faqTitle, 'questions' => $faqQuestions], JSON_UNESCAPED_UNICODE) ?: '{}';

        $ctaTitle = is_array($ctaSection['title'] ?? null) ? ($ctaSection['title'][$locale] ?? '') : ($ctaSection['title'] ?? '');
        $ctaSubtitle = is_array($ctaSection['subtitle'] ?? null) ? ($ctaSection['subtitle'][$locale] ?? '') : ($ctaSection['subtitle'] ?? '');
        $primary = $ctaSection['primaryCTA'] ?? [];
        $secondary = $ctaSection['secondaryCTA'] ?? [];
        $ctaSectionJson = json_encode([
          'title' => $ctaTitle,
          'subtitle' => $ctaSubtitle,
          'primaryCTA' => [
            'text' => is_array($primary['text'] ?? null) ? ($primary['text'][$locale] ?? '') : ($primary['text'] ?? ''),
            'href' => is_array($primary['href'] ?? null) ? ($primary['href'][$locale] ?? '') : ($primary['href'] ?? ''),
          ],
          'secondaryCTA' => [
            'text' => is_array($secondary['text'] ?? null) ? ($secondary['text'][$locale] ?? '') : ($secondary['text'] ?? ''),
            'href' => is_array($secondary['href'] ?? null) ? ($secondary['href'][$locale] ?? '') : ($secondary['href'] ?? ''),
          ],
        ], JSON_UNESCAPED_UNICODE) ?: '{}';

        return [$pricingJson, $insuranceJson, $paymentOptionsJson, $faqJson, $ctaSectionJson];
      };

      foreach (['en', 'es'] as $locale) {
        list($pricingJson, $insuranceJson, $paymentOptionsJson, $faqJson, $ctaSectionJson) = $buildRatesRow($locale);
        $seoT = $seoTitle[$locale] ?? '';
        $seoD = $seoDesc[$locale] ?? '';
        $hTitle = $heroTitle[$locale] ?? '';
        $hSub = $heroSubtitle[$locale] ?? '';
        $hBg = $locale === 'en' ? $heroBgEn : $heroBgEs;
        $hAlt = $heroAlt[$locale] ?? '';
        $stmt = $conn->prepare('UPDATE page_rates SET meta_last_updated=?, meta_version=?, seo_title=?, seo_description=?, hero_title=?, hero_subtitle=?, hero_background_image=?, hero_background_image_alt=?, pricing_json=?, insurance_json=?, payment_options_json=?, faq_json=?, cta_section_json=? WHERE locale=?');
        if (!$stmt) {
          $conn->close();
          http_response_code(500);
          echo json_encode(['ok' => false, 'error' => 'Query failed']);
          exit;
        }
        $stmt->bind_param('sissssssssssss', $metaLastUpdated, $metaVersion, $seoT, $seoD, $hTitle, $hSub, $hBg, $hAlt, $pricingJson, $insuranceJson, $paymentOptionsJson, $faqJson, $ctaSectionJson, $locale);
        $stmt->execute();
        $stmt->close();
      }

      // ---------- Persistir providerList en insurance_provider (editor puede editar la lista) ----------
      $providerList = isset($insurance['providerList']) && is_array($insurance['providerList']) ? $insurance['providerList'] : [];
      if (count($providerList) > 0) {
        $conn->query('DELETE FROM insurance_provider');
        $insStmt = $conn->prepare('INSERT INTO insurance_provider (name_en, name_es, logo_url, display_order) VALUES (?, ?, ?, ?)');
        if ($insStmt) {
          $order = 0;
          foreach ($providerList as $item) {
            $order++;
            $name = $item['name'] ?? [];
            $nameEn = is_array($name) ? (string) ($name['en'] ?? '') : (string) $name;
            $nameEs = is_array($name) ? (string) ($name['es'] ?? $name['en'] ?? '') : $nameEn;
            if ($nameEn === '' && $nameEs === '') { continue; }
            $logoUrl = (string) ($item['logoUrl'] ?? $item['logo_url'] ?? '');
            $insStmt->bind_param('sssi', $nameEn, $nameEs, $logoUrl, $order);
            $insStmt->execute();
          }
          $insStmt->close();
        }
      }

      error_log('[content.php PUT rates] hero_title.en=' . json_encode($heroTitle['en'] ?? ''));
      $conn->close();
      http_response_code(200);
      echo json_encode(['ok' => true]);
      exit;
    }

    // ---------- Services: escribir en tabla plana page_services (2 filas en/es) ----------
    if ($pageId === 'services') {
      $loc = function ($v) {
        if (is_array($v) && (isset($v['en']) || isset($v['es']))) {
          return ['en' => (string) ($v['en'] ?? ''), 'es' => (string) ($v['es'] ?? '')];
        }
        $s = is_string($v) ? $v : '';
        return ['en' => $s, 'es' => $s];
      };
      $hero = $content['hero'] ?? [];
      $metaLastUpdated = isset($meta['lastUpdated']) ? (string) $meta['lastUpdated'] : date('c');
      $metaVersion = isset($meta['version']) ? (int) $meta['version'] : 1;
      $seoTitle = $loc($seo['title'] ?? '');
      $seoDesc = $loc($seo['description'] ?? '');
      $heroTitle = $loc($hero['title'] ?? '');
      $heroSubtitle = $loc($hero['subtitle'] ?? '');
      $heroBg = $hero['backgroundImage'] ?? '';
      $heroBgArr = is_array($heroBg) ? $heroBg : ['en' => $heroBg, 'es' => $heroBg];
      $heroBgEn = (string) ($heroBgArr['en'] ?? '');
      $heroBgEs = (string) ($heroBgArr['es'] ?? '');
      $heroAlt = $loc($hero['backgroundImageAlt'] ?? '');
      $quickJumpText = $loc($content['quickJump']['text'] ?? '');
      $immigrationText = $loc($content['immigrationEvaluation']['text'] ?? '');
      $introText = $loc($content['intro']['text'] ?? '');
      $categories = $content['categories'] ?? [];
      $conditionsSection = $content['conditionsSection'] ?? [];
      $ctaSection = $content['ctaSection'] ?? [];

      $buildServicesRow = function (string $locale) use ($categories, $conditionsSection, $ctaSection, $loc) {
        $catForLocale = [];
        foreach ($categories as $c) {
          $servs = [];
          foreach ($c['services'] ?? [] as $sv) {
            $servs[] = [
              'id' => (string) ($sv['id'] ?? ''),
              'name' => is_array($sv['name'] ?? null) ? ($sv['name'][$locale] ?? '') : (string) ($sv['name'] ?? ''),
              'description' => is_array($sv['description'] ?? null) ? ($sv['description'][$locale] ?? '') : (string) ($sv['description'] ?? ''),
              'icon' => (string) ($sv['icon'] ?? 'document'),
            ];
          }
          $catForLocale[] = [
            'id' => (string) ($c['id'] ?? ''),
            'title' => is_array($c['title'] ?? null) ? ($c['title'][$locale] ?? '') : (string) ($c['title'] ?? ''),
            'services' => $servs,
          ];
        }
        $categoriesJson = json_encode($catForLocale, JSON_UNESCAPED_UNICODE) ?: '[]';

        $condTitle = is_array($conditionsSection['title'] ?? null) ? ($conditionsSection['title'][$locale] ?? '') : (string) ($conditionsSection['title'] ?? '');
        $condSubtitle = is_array($conditionsSection['subtitle'] ?? null) ? ($conditionsSection['subtitle'][$locale] ?? '') : (string) ($conditionsSection['subtitle'] ?? '');

        $ctaTitle = is_array($ctaSection['title'] ?? null) ? ($ctaSection['title'][$locale] ?? '') : ($ctaSection['title'] ?? '');
        $ctaSubtitle = is_array($ctaSection['subtitle'] ?? null) ? ($ctaSection['subtitle'][$locale] ?? '') : ($ctaSection['subtitle'] ?? '');
        $primaryCTAs = [];
        foreach ($ctaSection['primaryCTAs'] ?? [] as $p) {
          $primaryCTAs[] = [
            'id' => (string) ($p['id'] ?? ''),
            'title' => is_array($p['title'] ?? null) ? ($p['title'][$locale] ?? '') : (string) ($p['title'] ?? ''),
            'link' => (string) ($p['link'] ?? ''),
            'color' => (string) ($p['color'] ?? 'blueGreen'),
          ];
        }
        $sec = $ctaSection['secondaryCTA'] ?? null;
        $secondaryCTA = $sec === null ? (object) [] : [
          'id' => (string) ($sec['id'] ?? ''),
          'title' => is_array($sec['title'] ?? null) ? ($sec['title'][$locale] ?? '') : (string) ($sec['title'] ?? ''),
          'link' => (string) ($sec['link'] ?? ''),
          'text' => is_array($sec['text'] ?? null) ? ($sec['text'][$locale] ?? '') : (string) ($sec['text'] ?? ''),
        ];
        $ctaSectionJson = json_encode(['title' => $ctaTitle, 'subtitle' => $ctaSubtitle, 'primaryCTAs' => $primaryCTAs, 'secondaryCTA' => $secondaryCTA], JSON_UNESCAPED_UNICODE) ?: '{}';

        return [$categoriesJson, $condTitle, $condSubtitle, $ctaSectionJson];
      };

      foreach (['en', 'es'] as $locale) {
        list($categoriesJson, $condTitle, $condSubtitle, $ctaSectionJson) = $buildServicesRow($locale);
        $seoT = $seoTitle[$locale] ?? '';
        $seoD = $seoDesc[$locale] ?? '';
        $hTitle = $heroTitle[$locale] ?? '';
        $hSub = $heroSubtitle[$locale] ?? '';
        $hBg = $locale === 'en' ? $heroBgEn : $heroBgEs;
        $hAlt = $heroAlt[$locale] ?? '';
        $qJump = $quickJumpText[$locale] ?? '';
        $immText = $immigrationText[$locale] ?? '';
        $introT = $introText[$locale] ?? '';
        $stmt = $conn->prepare('UPDATE page_services SET meta_last_updated=?, meta_version=?, seo_title=?, seo_description=?, hero_title=?, hero_subtitle=?, hero_background_image=?, hero_background_image_alt=?, quick_jump_text=?, immigration_evaluation_text=?, intro_text=?, categories_json=?, conditions_section_title=?, conditions_section_subtitle=?, cta_section_json=? WHERE locale=?');
        if (!$stmt) {
          $conn->close();
          http_response_code(500);
          echo json_encode(['ok' => false, 'error' => 'Query failed']);
          exit;
        }
        $stmt->bind_param('sissssssssssssss', $metaLastUpdated, $metaVersion, $seoT, $seoD, $hTitle, $hSub, $hBg, $hAlt, $qJump, $immText, $introT, $categoriesJson, $condTitle, $condSubtitle, $ctaSectionJson, $locale);
        $stmt->execute();
        $stmt->close();
      }
      $conn->close();
      http_response_code(200);
      echo json_encode(['ok' => true]);
      exit;
    }

    // ---------- Contact: escribir solo campos editables en page_contact (2 filas en/es). No se toca form. ----------
    if ($pageId === 'contact') {
      $loc = function ($v) {
        if (is_array($v) && (isset($v['en']) || isset($v['es']))) {
          return ['en' => (string) ($v['en'] ?? ''), 'es' => (string) ($v['es'] ?? '')];
        }
        $s = is_string($v) ? $v : '';
        return ['en' => $s, 'es' => $s];
      };
      $hero = $content['hero'] ?? [];
      $contactInfo = $content['contactInfo'] ?? [];
      $addr = $contactInfo['address'] ?? [];
      $oh = $contactInfo['officeHours'] ?? [];
      $sm = $contactInfo['socialMedia'] ?? [];
      $metaLastUpdated = isset($meta['lastUpdated']) ? (string) $meta['lastUpdated'] : date('c');
      $metaVersion = isset($meta['version']) ? (int) $meta['version'] : 1;
      $seoTitle = $loc($seo['title'] ?? '');
      $seoDesc = $loc($seo['description'] ?? '');

      foreach (['en', 'es'] as $locale) {
        $stmt = $conn->prepare('UPDATE page_contact SET meta_last_updated=?, meta_version=?, seo_title=?, seo_description=?, hero_title=?, address_street=?, address_city=?, address_state=?, address_zip=?, phone=?, email=?, office_hours_title=?, office_hours_hours=?, office_hours_note=?, facebook_url=?, instagram_url=? WHERE locale=?');
        if (!$stmt) {
          $conn->close();
          http_response_code(500);
          echo json_encode(['ok' => false, 'error' => 'Query failed']);
          exit;
        }
        $seoT = $seoTitle[$locale] ?? '';
        $seoD = $seoDesc[$locale] ?? '';
        $hTitle = is_array($hero['title'] ?? null) ? ($hero['title'][$locale] ?? '') : ($hero['title'] ?? '');
        $street = is_array($addr['street'] ?? null) ? ($addr['street'][$locale] ?? '') : ($addr['street'] ?? '');
        $city = is_array($addr['city'] ?? null) ? ($addr['city'][$locale] ?? '') : ($addr['city'] ?? '');
        $state = is_array($addr['state'] ?? null) ? ($addr['state'][$locale] ?? '') : ($addr['state'] ?? '');
        $zip = is_array($addr['zip'] ?? null) ? ($addr['zip'][$locale] ?? '') : ($addr['zip'] ?? '');
        $phone = is_array($contactInfo['phone'] ?? null) ? ($contactInfo['phone'][$locale] ?? '') : ($contactInfo['phone'] ?? '');
        $email = is_array($contactInfo['email'] ?? null) ? ($contactInfo['email'][$locale] ?? '') : ($contactInfo['email'] ?? '');
        $ohTitle = is_array($oh['title'] ?? null) ? ($oh['title'][$locale] ?? '') : ($oh['title'] ?? '');
        $ohHours = is_array($oh['hours'] ?? null) ? ($oh['hours'][$locale] ?? '') : ($oh['hours'] ?? '');
        $ohNote = is_array($oh['note'] ?? null) ? ($oh['note'][$locale] ?? '') : ($oh['note'] ?? '');
        $fb = is_array($sm['facebook'] ?? null) ? ($sm['facebook'][$locale] ?? '') : ($sm['facebook'] ?? '');
        $ig = is_array($sm['instagram'] ?? null) ? ($sm['instagram'][$locale] ?? '') : ($sm['instagram'] ?? '');
        $stmt->bind_param('sisssssssssssssss', $metaLastUpdated, $metaVersion, $seoT, $seoD, $hTitle, $street, $city, $state, $zip, $phone, $email, $ohTitle, $ohHours, $ohNote, $fb, $ig, $locale);
        $stmt->execute();
        $stmt->close();
      }
      error_log('[content.php PUT contact] hero_title.en=' . json_encode($hTitle ?? ''));
      $conn->close();
      http_response_code(200);
      echo json_encode(['ok' => true]);
      exit;
    }

    // ---------- Resto de páginas: escribir en page_content (blob) ----------
    $metaJson = json_encode($meta, JSON_UNESCAPED_UNICODE);
    $seoJson = json_encode($seo, JSON_UNESCAPED_UNICODE);
    $contentJson = json_encode($content, JSON_UNESCAPED_UNICODE);
    if ($metaJson === false || $seoJson === false || $contentJson === false) {
      $conn->close();
      http_response_code(400);
      echo json_encode(['ok' => false, 'error' => 'Invalid meta/seo/content encoding']);
      exit;
    }

    $stmt = $conn->prepare('INSERT INTO page_content (page_id, meta, seo, content, updated_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE meta = VALUES(meta), seo = VALUES(seo), content = VALUES(content), updated_at = NOW()');
    if (!$stmt) {
      $conn->close();
      http_response_code(500);
      echo json_encode(['ok' => false, 'error' => 'Query failed']);
      exit;
    }
    $stmt->bind_param('ssss', $pageId, $metaJson, $seoJson, $contentJson);
    $stmt->execute();
    $stmt->close();
    $conn->close();

    http_response_code(200);
    echo json_encode(['ok' => true]);
  } catch (Throwable $e) {
    error_log('[content.php PUT] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    http_response_code(500);
    $msg = 'Failed to save content';
    if ($e->getMessage() !== '') {
      $msg .= ': ' . $e->getMessage();
    }
    echo json_encode(['ok' => false, 'error' => $msg]);
  }
  exit;
}

// ---------- Lectura (GET) ----------
// Evitar que el navegador cachee el contenido: así el sitio muestra siempre la última versión
// tras editar en el editor sin que el cliente tenga que hacer F5 forzado.
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if ($pageId === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'pageId required']);
  exit;
}

$configFile = __DIR__ . '/forms/db_config.php';
if (!is_file($configFile)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Server config not found']);
  exit;
}
require $configFile;

try {
  $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
  if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Database connection failed']);
    exit;
  }
  $conn->set_charset('utf8mb4');

  // ---------- Home: leer desde tabla plana page_home (2 filas en/es) ----------
  if ($pageId === 'home') {
    // No usar get_result() (mysqlnd). Usar bind_result + fetch para máxima compatibilidad.
    $fetchHomeRow = function (string $locale) use ($conn) {
      $stmt = $conn->prepare('SELECT meta_last_updated, meta_version, seo_title, seo_description, hero_headline, hero_description, hero_background_image, hero_background_image_alt, vp1_icon, vp1_title, vp1_description, vp2_icon, vp2_title, vp2_description, vp3_icon, vp3_title, vp3_description, vp4_icon, vp4_title, vp4_description, cta_section_title, cta1_id, cta1_title, cta1_description, cta1_link, cta1_icon, cta2_id, cta2_title, cta2_description, cta2_link, cta2_icon, cta3_id, cta3_title, cta3_description, cta3_link, cta3_icon, updated_at FROM page_home WHERE locale = ? LIMIT 1');
      if (!$stmt) return null;
      $stmt->bind_param('s', $locale);
      $stmt->execute();
      $meta_last_updated = $meta_version = $seo_title = $seo_description = null;
      $hero_headline = $hero_description = $hero_background_image = $hero_background_image_alt = null;
      $vp1_icon = $vp1_title = $vp1_description = null;
      $vp2_icon = $vp2_title = $vp2_description = null;
      $vp3_icon = $vp3_title = $vp3_description = null;
      $vp4_icon = $vp4_title = $vp4_description = null;
      $cta_section_title = null;
      $cta1_id = $cta1_title = $cta1_description = $cta1_link = $cta1_icon = null;
      $cta2_id = $cta2_title = $cta2_description = $cta2_link = $cta2_icon = null;
      $cta3_id = $cta3_title = $cta3_description = $cta3_link = $cta3_icon = null;
      $updated_at = null;
      $stmt->bind_result(
        $meta_last_updated, $meta_version,
        $seo_title, $seo_description,
        $hero_headline, $hero_description, $hero_background_image, $hero_background_image_alt,
        $vp1_icon, $vp1_title, $vp1_description,
        $vp2_icon, $vp2_title, $vp2_description,
        $vp3_icon, $vp3_title, $vp3_description,
        $vp4_icon, $vp4_title, $vp4_description,
        $cta_section_title,
        $cta1_id, $cta1_title, $cta1_description, $cta1_link, $cta1_icon,
        $cta2_id, $cta2_title, $cta2_description, $cta2_link, $cta2_icon,
        $cta3_id, $cta3_title, $cta3_description, $cta3_link, $cta3_icon,
        $updated_at
      );
      $ok = $stmt->fetch();
      $stmt->close();
      if (!$ok) return null;
      return [
        'meta_last_updated' => $meta_last_updated,
        'meta_version' => $meta_version,
        'seo_title' => $seo_title,
        'seo_description' => $seo_description,
        'hero_headline' => $hero_headline,
        'hero_description' => $hero_description,
        'hero_background_image' => $hero_background_image,
        'hero_background_image_alt' => $hero_background_image_alt,
        'vp1_icon' => $vp1_icon,
        'vp1_title' => $vp1_title,
        'vp1_description' => $vp1_description,
        'vp2_icon' => $vp2_icon,
        'vp2_title' => $vp2_title,
        'vp2_description' => $vp2_description,
        'vp3_icon' => $vp3_icon,
        'vp3_title' => $vp3_title,
        'vp3_description' => $vp3_description,
        'vp4_icon' => $vp4_icon,
        'vp4_title' => $vp4_title,
        'vp4_description' => $vp4_description,
        'cta_section_title' => $cta_section_title,
        'cta1_id' => $cta1_id,
        'cta1_title' => $cta1_title,
        'cta1_description' => $cta1_description,
        'cta1_link' => $cta1_link,
        'cta1_icon' => $cta1_icon,
        'cta2_id' => $cta2_id,
        'cta2_title' => $cta2_title,
        'cta2_description' => $cta2_description,
        'cta2_link' => $cta2_link,
        'cta2_icon' => $cta2_icon,
        'cta3_id' => $cta3_id,
        'cta3_title' => $cta3_title,
        'cta3_description' => $cta3_description,
        'cta3_link' => $cta3_link,
        'cta3_icon' => $cta3_icon,
        'updated_at' => $updated_at,
      ];
    };

    $en = $fetchHomeRow('en');
    $es = $fetchHomeRow('es');
    $conn->close();

    if (!$en || !$es) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Page not found']);
      exit;
    }

    $updatedAt = isset($en['updated_at']) ? date('c', strtotime($en['updated_at'])) : date('c');

    $meta = ['pageId' => 'home', 'lastUpdated' => $en['meta_last_updated'] ?? $updatedAt, 'version' => (int) ($en['meta_version'] ?? 1)];
    $seo = [
      'title' => ['en' => $en['seo_title'] ?? '', 'es' => $es['seo_title'] ?? ''],
      'description' => ['en' => $en['seo_description'] ?? '', 'es' => $es['seo_description'] ?? ''],
    ];
    $content = [
      'hero' => [
        'headline' => ['en' => $en['hero_headline'] ?? '', 'es' => $es['hero_headline'] ?? ''],
        'description' => ['en' => $en['hero_description'] ?? '', 'es' => $es['hero_description'] ?? ''],
        'backgroundImage' => ['en' => $en['hero_background_image'] ?? '', 'es' => $es['hero_background_image'] ?? ''],
        'backgroundImageAlt' => ['en' => $en['hero_background_image_alt'] ?? '', 'es' => $es['hero_background_image_alt'] ?? ''],
      ],
      'valuePropositions' => [
        'items' => [
          ['icon' => ['en' => $en['vp1_icon'] ?? '', 'es' => $es['vp1_icon'] ?? ''], 'title' => ['en' => $en['vp1_title'] ?? '', 'es' => $es['vp1_title'] ?? ''], 'description' => ['en' => $en['vp1_description'] ?? '', 'es' => $es['vp1_description'] ?? '']],
          ['icon' => ['en' => $en['vp2_icon'] ?? '', 'es' => $es['vp2_icon'] ?? ''], 'title' => ['en' => $en['vp2_title'] ?? '', 'es' => $es['vp2_title'] ?? ''], 'description' => ['en' => $en['vp2_description'] ?? '', 'es' => $es['vp2_description'] ?? '']],
          ['icon' => ['en' => $en['vp3_icon'] ?? '', 'es' => $es['vp3_icon'] ?? ''], 'title' => ['en' => $en['vp3_title'] ?? '', 'es' => $es['vp3_title'] ?? ''], 'description' => ['en' => $en['vp3_description'] ?? '', 'es' => $es['vp3_description'] ?? '']],
          ['icon' => ['en' => $en['vp4_icon'] ?? '', 'es' => $es['vp4_icon'] ?? ''], 'title' => ['en' => $en['vp4_title'] ?? '', 'es' => $es['vp4_title'] ?? ''], 'description' => ['en' => $en['vp4_description'] ?? '', 'es' => $es['vp4_description'] ?? '']],
        ],
      ],
      'ctaSection' => [
        'title' => ['en' => $en['cta_section_title'] ?? '', 'es' => $es['cta_section_title'] ?? ''],
        // Contrato del sitio/editor: ctaSection.ctas (id, link, icon siempre string desde BD)
        'ctas' => [
          ['id' => (string) ($en['cta1_id'] ?? ''), 'title' => ['en' => (string) ($en['cta1_title'] ?? ''), 'es' => (string) ($es['cta1_title'] ?? '')], 'description' => ['en' => (string) ($en['cta1_description'] ?? ''), 'es' => (string) ($es['cta1_description'] ?? '')], 'link' => (string) ($en['cta1_link'] ?? ''), 'icon' => (string) ($en['cta1_icon'] ?? '')],
          ['id' => (string) ($en['cta2_id'] ?? ''), 'title' => ['en' => (string) ($en['cta2_title'] ?? ''), 'es' => (string) ($es['cta2_title'] ?? '')], 'description' => ['en' => (string) ($en['cta2_description'] ?? ''), 'es' => (string) ($es['cta2_description'] ?? '')], 'link' => (string) ($en['cta2_link'] ?? ''), 'icon' => (string) ($en['cta2_icon'] ?? '')],
          ['id' => (string) ($en['cta3_id'] ?? ''), 'title' => ['en' => (string) ($en['cta3_title'] ?? ''), 'es' => (string) ($es['cta3_title'] ?? '')], 'description' => ['en' => (string) ($en['cta3_description'] ?? ''), 'es' => (string) ($es['cta3_description'] ?? '')], 'link' => (string) ($en['cta3_link'] ?? ''), 'icon' => (string) ($en['cta3_icon'] ?? '')],
        ],
      ],
    ];

    echo json_encode(['meta' => $meta, 'seo' => $seo, 'content' => $content]);
    exit;
  }

  // ---------- Shared header: leer desde tabla plana page_shared_header (menu + navigation, migración 028/029) ----------
  if ($pageId === 'shared-header') {
    $fetchHeaderRow = function (string $locale) use ($conn) {
      $stmt = $conn->prepare('SELECT meta_last_updated, meta_version, seo_title, seo_description, menu_label, menu_close_label, nav_link1_label, nav_link1_link, nav_link2_label, nav_link2_link, nav_link3_label, nav_link3_link, nav_link4_label, nav_link4_link, nav_link5_label, nav_link5_link, nav_link6_label, nav_link6_link, updated_at FROM page_shared_header WHERE locale = ? LIMIT 1');
      if (!$stmt) return null;
      $stmt->bind_param('s', $locale);
      $stmt->execute();
      $meta_last_updated = $meta_version = $seo_title = $seo_description = $menu_label = $menu_close_label = null;
      $nav_link1_label = $nav_link1_link = $nav_link2_label = $nav_link2_link = $nav_link3_label = $nav_link3_link = $nav_link4_label = $nav_link4_link = $nav_link5_label = $nav_link5_link = $nav_link6_label = $nav_link6_link = $updated_at = null;
      $stmt->bind_result($meta_last_updated, $meta_version, $seo_title, $seo_description, $menu_label, $menu_close_label, $nav_link1_label, $nav_link1_link, $nav_link2_label, $nav_link2_link, $nav_link3_label, $nav_link3_link, $nav_link4_label, $nav_link4_link, $nav_link5_label, $nav_link5_link, $nav_link6_label, $nav_link6_link, $updated_at);
      $ok = $stmt->fetch();
      $stmt->close();
      if (!$ok) return null;
      return compact('meta_last_updated', 'meta_version', 'seo_title', 'seo_description', 'menu_label', 'menu_close_label', 'nav_link1_label', 'nav_link1_link', 'nav_link2_label', 'nav_link2_link', 'nav_link3_label', 'nav_link3_link', 'nav_link4_label', 'nav_link4_link', 'nav_link5_label', 'nav_link5_link', 'nav_link6_label', 'nav_link6_link', 'updated_at');
    };
    $en = $fetchHeaderRow('en');
    $es = $fetchHeaderRow('es');
    $conn->close();
    if (!$en || !$es) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Page not found. Ensure table page_shared_header exists with rows for locale en and es (migration 028).']);
      exit;
    }
    $s = function ($v) { return (string) ($v ?? ''); };
    $lastUpdated = $en['meta_last_updated'] ?? $en['updated_at'] ?? null;
    $lastUpdated = (!empty($lastUpdated) && strtotime($lastUpdated) !== false) ? date('c', strtotime($lastUpdated)) : date('c');
    $meta = ['pageId' => 'shared-header', 'lastUpdated' => $lastUpdated, 'version' => (int) ($en['meta_version'] ?? 1)];
    $seo = [
      'title' => ['en' => $s($en['seo_title']), 'es' => $s($es['seo_title'])],
      'description' => ['en' => $s($en['seo_description']), 'es' => $s($es['seo_description'])],
    ];
    $content = [
      'menu' => [
        'label' => ['en' => $s($en['menu_label']), 'es' => $s($es['menu_label'])],
        'closeLabel' => ['en' => $s($en['menu_close_label']), 'es' => $s($es['menu_close_label'])],
      ],
      'navigation' => [
        'items' => [
          ['label' => ['en' => $s($en['nav_link1_label']), 'es' => $s($es['nav_link1_label'])], 'link' => $s($en['nav_link1_link'])],
          ['label' => ['en' => $s($en['nav_link2_label']), 'es' => $s($es['nav_link2_label'])], 'link' => $s($en['nav_link2_link'])],
          ['label' => ['en' => $s($en['nav_link3_label']), 'es' => $s($es['nav_link3_label'])], 'link' => $s($en['nav_link3_link'])],
          ['label' => ['en' => $s($en['nav_link4_label']), 'es' => $s($es['nav_link4_label'])], 'link' => $s($en['nav_link4_link'])],
          ['label' => ['en' => $s($en['nav_link5_label']), 'es' => $s($es['nav_link5_label'])], 'link' => $s($en['nav_link5_link'])],
          ['label' => ['en' => $s($en['nav_link6_label']), 'es' => $s($es['nav_link6_label'])], 'link' => $s($en['nav_link6_link'])],
        ],
      ],
    ];
    echo json_encode(['meta' => $meta, 'seo' => $seo, 'content' => $content]);
    exit;
  }

  // ---------- Shared footer: leer desde tabla plana page_shared_footer (esquema augushub: nav_title, nav_link1..6, copyright, link1..6) ----------
  if ($pageId === 'shared-footer') {
    $fetchFooterRow = function (string $locale) use ($conn) {
      $stmt = $conn->prepare('SELECT meta_last_updated, meta_version, company_name, company_tagline, copyright, nav_title, nav_link1_label, nav_link1_link, nav_link2_label, nav_link2_link, nav_link3_label, nav_link3_link, nav_link4_label, nav_link4_link, nav_link5_label, nav_link5_link, nav_link6_label, nav_link6_link, resources_title, link1_label, link1_link, link1_is_modal, link2_label, link2_link, link2_is_modal, link3_label, link3_link, link3_is_modal, link4_label, link4_link, link4_is_modal, link5_label, link5_link, link5_is_modal, link6_label, link6_link, link6_is_modal, updated_at FROM page_shared_footer WHERE locale = ? LIMIT 1');
      if (!$stmt) return null;
      $stmt->bind_param('s', $locale);
      $stmt->execute();
      $meta_last_updated = $meta_version = $company_name = $company_tagline = $copyright = $nav_title = null;
      $nav_link1_label = $nav_link1_link = $nav_link2_label = $nav_link2_link = $nav_link3_label = $nav_link3_link = $nav_link4_label = $nav_link4_link = $nav_link5_label = $nav_link5_link = $nav_link6_label = $nav_link6_link = null;
      $resources_title = null;
      $link1_label = $link1_link = $link1_is_modal = $link2_label = $link2_link = $link2_is_modal = $link3_label = $link3_link = $link3_is_modal = null;
      $link4_label = $link4_link = $link4_is_modal = $link5_label = $link5_link = $link5_is_modal = $link6_label = $link6_link = $link6_is_modal = null;
      $updated_at = null;
      $stmt->bind_result(
        $meta_last_updated, $meta_version, $company_name, $company_tagline, $copyright, $nav_title,
        $nav_link1_label, $nav_link1_link, $nav_link2_label, $nav_link2_link, $nav_link3_label, $nav_link3_link, $nav_link4_label, $nav_link4_link, $nav_link5_label, $nav_link5_link, $nav_link6_label, $nav_link6_link,
        $resources_title,
        $link1_label, $link1_link, $link1_is_modal, $link2_label, $link2_link, $link2_is_modal, $link3_label, $link3_link, $link3_is_modal,
        $link4_label, $link4_link, $link4_is_modal, $link5_label, $link5_link, $link5_is_modal, $link6_label, $link6_link, $link6_is_modal,
        $updated_at
      );
      $ok = $stmt->fetch();
      $stmt->close();
      if (!$ok) return null;
      return [
        'meta_last_updated' => $meta_last_updated, 'meta_version' => $meta_version,
        'company_name' => $company_name, 'company_tagline' => $company_tagline, 'copyright' => $copyright, 'nav_title' => $nav_title,
        'nav_link1_label' => $nav_link1_label, 'nav_link1_link' => $nav_link1_link, 'nav_link2_label' => $nav_link2_label, 'nav_link2_link' => $nav_link2_link,
        'nav_link3_label' => $nav_link3_label, 'nav_link3_link' => $nav_link3_link, 'nav_link4_label' => $nav_link4_label, 'nav_link4_link' => $nav_link4_link,
        'nav_link5_label' => $nav_link5_label, 'nav_link5_link' => $nav_link5_link, 'nav_link6_label' => $nav_link6_label, 'nav_link6_link' => $nav_link6_link,
        'resources_title' => $resources_title,
        'link1_label' => $link1_label, 'link1_link' => $link1_link, 'link1_is_modal' => $link1_is_modal,
        'link2_label' => $link2_label, 'link2_link' => $link2_link, 'link2_is_modal' => $link2_is_modal,
        'link3_label' => $link3_label, 'link3_link' => $link3_link, 'link3_is_modal' => $link3_is_modal,
        'link4_label' => $link4_label, 'link4_link' => $link4_link, 'link4_is_modal' => $link4_is_modal,
        'link5_label' => $link5_label, 'link5_link' => $link5_link, 'link5_is_modal' => $link5_is_modal,
        'link6_label' => $link6_label, 'link6_link' => $link6_link, 'link6_is_modal' => $link6_is_modal,
        'updated_at' => $updated_at,
      ];
    };
    $en = $fetchFooterRow('en');
    $es = $fetchFooterRow('es');
    $conn->close();
    if (!$en || !$es) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Page not found']);
      exit;
    }

    $s = function ($v) { return (string) ($v ?? ''); };
    $updatedAt = isset($en['updated_at']) ? date('c', strtotime($en['updated_at'])) : date('c');
    $meta = ['pageId' => 'shared-footer', 'lastUpdated' => $en['meta_last_updated'] ?? $updatedAt, 'version' => (int) ($en['meta_version'] ?? 1)];
    $content = [
      'companyInfo' => [
        'name' => ['en' => $s($en['company_name']), 'es' => $s($es['company_name'])],
        'tagline' => ['en' => $s($en['company_tagline']), 'es' => $s($es['company_tagline'])],
      ],
      'navigation' => [
        'title' => ['en' => $s($en['nav_title']), 'es' => $s($es['nav_title'])],
        'items' => [
          ['label' => ['en' => $s($en['nav_link1_label']), 'es' => $s($es['nav_link1_label'])], 'link' => $s($en['nav_link1_link'])],
          ['label' => ['en' => $s($en['nav_link2_label']), 'es' => $s($es['nav_link2_label'])], 'link' => $s($en['nav_link2_link'])],
          ['label' => ['en' => $s($en['nav_link3_label']), 'es' => $s($es['nav_link3_label'])], 'link' => $s($en['nav_link3_link'])],
          ['label' => ['en' => $s($en['nav_link4_label']), 'es' => $s($es['nav_link4_label'])], 'link' => $s($en['nav_link4_link'])],
          ['label' => ['en' => $s($en['nav_link5_label']), 'es' => $s($es['nav_link5_label'])], 'link' => $s($en['nav_link5_link'])],
          ['label' => ['en' => $s($en['nav_link6_label']), 'es' => $s($es['nav_link6_label'])], 'link' => $s($en['nav_link6_link'])],
        ],
      ],
      'resources' => [
        'title' => ['en' => $s($en['resources_title']), 'es' => $s($es['resources_title'])],
        'items' => [
          ['label' => ['en' => $s($en['link1_label']), 'es' => $s($es['link1_label'])], 'link' => $s($en['link1_link']), 'isModal' => (bool) ($en['link1_is_modal'] ?? 0)],
          ['label' => ['en' => $s($en['link2_label']), 'es' => $s($es['link2_label'])], 'link' => $s($en['link2_link']), 'isModal' => (bool) ($en['link2_is_modal'] ?? 0)],
          ['label' => ['en' => $s($en['link3_label']), 'es' => $s($es['link3_label'])], 'link' => $s($en['link3_link']), 'isModal' => (bool) ($en['link3_is_modal'] ?? 0)],
          ['label' => ['en' => $s($en['link4_label']), 'es' => $s($es['link4_label'])], 'link' => $s($en['link4_link']), 'isModal' => (bool) ($en['link4_is_modal'] ?? 0)],
          ['label' => ['en' => $s($en['link5_label']), 'es' => $s($es['link5_label'])], 'link' => $s($en['link5_link']), 'isModal' => (bool) ($en['link5_is_modal'] ?? 0)],
          ['label' => ['en' => $s($en['link6_label']), 'es' => $s($es['link6_label'])], 'link' => $s($en['link6_link']), 'isModal' => (bool) ($en['link6_is_modal'] ?? 0)],
        ],
      ],
      'copyright' => ['en' => $s($en['copyright']), 'es' => $s($es['copyright'])],
    ];
    // Si la BD tiene vacíos o "0", normalizar para que el front muestre siempre títulos y Fellowship
    if (trim((string) ($content['navigation']['title']['en'] ?? '')) === '') {
      $content['navigation']['title']['en'] = 'Navigation';
    }
    if (trim((string) ($content['navigation']['title']['es'] ?? '')) === '') {
      $content['navigation']['title']['es'] = 'Navegación';
    }
    if (trim((string) ($content['resources']['title']['en'] ?? '')) === '') {
      $content['resources']['title']['en'] = 'Resources';
    }
    if (trim((string) ($content['resources']['title']['es'] ?? '')) === '') {
      $content['resources']['title']['es'] = 'Recursos';
    }
    $link4 = &$content['resources']['items'][3]['label'];
    if (trim((string) ($link4['en'] ?? '')) === '' || trim((string) ($link4['en'] ?? '')) === '0') {
      $link4['en'] = 'Fellowship Program';
    }
    if (trim((string) ($link4['es'] ?? '')) === '' || trim((string) ($link4['es'] ?? '')) === '0') {
      $link4['es'] = 'Programa de Fellowship';
    }
    // El cliente valida con Zod: seo.title y seo.description son requeridos (LocalizedTextSchema).
    $seo = ['title' => ['en' => '', 'es' => ''], 'description' => ['en' => '', 'es' => '']];
    echo json_encode(['meta' => $meta, 'seo' => $seo, 'content' => $content]);
    exit;
  }

  // ---------- Crisis resources: leer desde tabla plana page_crisis_resources (2 filas en/es) ----------
  if ($pageId === 'crisis-resources') {
    $fetchCrisisRow = function (string $locale) use ($conn) {
      $stmt = $conn->prepare('SELECT meta_last_updated, meta_version, seo_title, seo_description, hero_title, button_aria_label, button_title, categories_json, updated_at FROM page_crisis_resources WHERE locale = ? LIMIT 1');
      if (!$stmt) return null;
      $stmt->bind_param('s', $locale);
      $stmt->execute();
      $meta_last_updated = $meta_version = $seo_title = $seo_description = $hero_title = $button_aria_label = $button_title = $categories_json = $updated_at = null;
      $stmt->bind_result($meta_last_updated, $meta_version, $seo_title, $seo_description, $hero_title, $button_aria_label, $button_title, $categories_json, $updated_at);
      $ok = $stmt->fetch();
      $stmt->close();
      if (!$ok) return null;
      return [
        'meta_last_updated' => $meta_last_updated,
        'meta_version' => $meta_version,
        'seo_title' => $seo_title,
        'seo_description' => $seo_description,
        'hero_title' => $hero_title,
        'button_aria_label' => $button_aria_label,
        'button_title' => $button_title,
        'categories_json' => $categories_json,
        'updated_at' => $updated_at,
      ];
    };
    $en = $fetchCrisisRow('en');
    $es = $fetchCrisisRow('es');
    $conn->close();
    if (!$en || !$es) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Page not found']);
      exit;
    }
    $categoriesRaw = $en['categories_json'] ?? '[]';
    $categoriesDecoded = is_string($categoriesRaw) ? json_decode($categoriesRaw, true) : $categoriesRaw;
    $categoriesCount = is_array($categoriesDecoded) ? count($categoriesDecoded) : 0;
    // lastUpdated: siempre string ISO 8601 para que Zod (z.string().datetime()) no falle
    $lastUpdatedRaw = $en['meta_last_updated'] ?? $en['updated_at'] ?? null;
    $lastUpdated = null;
    if (!empty($lastUpdatedRaw) && strtotime($lastUpdatedRaw) !== false) {
      $lastUpdated = date('c', strtotime($lastUpdatedRaw));
    }
    if ($lastUpdated === null || $lastUpdated === '') {
      $lastUpdated = date('c');
    }
    // Log de lectura desde BD (trazabilidad migración a page_crisis_resources)
    error_log('[content.php GET crisis-resources] db.en.hero_title=' . json_encode($en['hero_title'] ?? '') . ' db.es.hero_title=' . json_encode($es['hero_title'] ?? '') . ' categories_count=' . $categoriesCount . ' meta.lastUpdated=' . $lastUpdated);
    $s = function ($v) { return (string) ($v ?? ''); };
    $meta = ['pageId' => 'crisis-resources', 'lastUpdated' => $lastUpdated, 'version' => (int) ($en['meta_version'] ?? 1)];
    $seo = [
      'title' => ['en' => $s($en['seo_title']), 'es' => $s($es['seo_title'])],
      'description' => ['en' => $s($en['seo_description']), 'es' => $s($es['seo_description'])],
    ];
    $categories = is_array($categoriesDecoded) ? $categoriesDecoded : [];
    $content = [
      'hero' => [
        'title' => ['en' => $s($en['hero_title']), 'es' => $s($es['hero_title'])],
      ],
      'button' => [
        'ariaLabel' => ['en' => $s($en['button_aria_label']), 'es' => $s($es['button_aria_label'])],
        'title' => ['en' => $s($en['button_title']), 'es' => $s($es['button_title'])],
      ],
      'categories' => $categories,
    ];
    echo json_encode(['meta' => $meta, 'seo' => $seo, 'content' => $content]);
    exit;
  }

  // ---------- Fellowship: leer desde tabla plana page_fellowship (2 filas en/es) ----------
  if ($pageId === 'fellowship') {
    $fetchFellowshipRow = function (string $locale) use ($conn) {
      $stmt = $conn->prepare('SELECT meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_subtitle, hero_description, hero_icon, hero_announcement, mission_title, mission_content, benefits_json, program_details_json, how_to_apply_json, updated_at FROM page_fellowship WHERE locale = ? LIMIT 1');
      if (!$stmt) return null;
      $stmt->bind_param('s', $locale);
      $stmt->execute();
      $meta_last_updated = $meta_version = $seo_title = $seo_description = $hero_title = $hero_subtitle = $hero_description = $hero_icon = $hero_announcement = $mission_title = $mission_content = $benefits_json = $program_details_json = $how_to_apply_json = $updated_at = null;
      $stmt->bind_result($meta_last_updated, $meta_version, $seo_title, $seo_description, $hero_title, $hero_subtitle, $hero_description, $hero_icon, $hero_announcement, $mission_title, $mission_content, $benefits_json, $program_details_json, $how_to_apply_json, $updated_at);
      $ok = $stmt->fetch();
      $stmt->close();
      if (!$ok) return null;
      return compact('meta_last_updated', 'meta_version', 'seo_title', 'seo_description', 'hero_title', 'hero_subtitle', 'hero_description', 'hero_icon', 'hero_announcement', 'mission_title', 'mission_content', 'benefits_json', 'program_details_json', 'how_to_apply_json', 'updated_at');
    };
    $en = $fetchFellowshipRow('en');
    $es = $fetchFellowshipRow('es');
    $conn->close();
    if (!$en || !$es) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Page not found']);
      exit;
    }
    $s = function ($v) { return (string) ($v ?? ''); };
    $lastUpdatedRaw = $en['meta_last_updated'] ?? $en['updated_at'] ?? null;
    $lastUpdated = (!empty($lastUpdatedRaw) && strtotime($lastUpdatedRaw) !== false) ? date('c', strtotime($lastUpdatedRaw)) : date('c');
    $meta = ['pageId' => 'fellowship', 'lastUpdated' => $lastUpdated, 'version' => (int) ($en['meta_version'] ?? 1)];
    $seo = ['title' => ['en' => $s($en['seo_title']), 'es' => $s($es['seo_title'])], 'description' => ['en' => $s($en['seo_description']), 'es' => $s($es['seo_description'])]];
    $benefitsEn = is_string($en['benefits_json']) ? json_decode($en['benefits_json'], true) : ($en['benefits_json'] ?? []);
    $benefitsEs = is_string($es['benefits_json']) ? json_decode($es['benefits_json'], true) : ($es['benefits_json'] ?? []);
    $benefitsEn = is_array($benefitsEn) ? $benefitsEn : [];
    $benefitsEs = is_array($benefitsEs) ? $benefitsEs : [];
    $benefitsItems = [];
    $maxB = max(count($benefitsEn), count($benefitsEs));
    for ($i = 0; $i < $maxB; $i++) {
      $be = $benefitsEn[$i] ?? [];
      $bs = $benefitsEs[$i] ?? [];
      $benefitsItems[] = ['id' => $s($be['id'] ?? $bs['id'] ?? "benefit-$i"), 'text' => ['en' => $s($be['text'] ?? ''), 'es' => $s($bs['text'] ?? '')]];
    }
    $progEn = is_string($en['program_details_json']) ? json_decode($en['program_details_json'], true) : ($en['program_details_json'] ?? []);
    $progEs = is_string($es['program_details_json']) ? json_decode($es['program_details_json'], true) : ($es['program_details_json'] ?? []);
    $progEn = is_array($progEn) ? $progEn : [];
    $progEs = is_array($progEs) ? $progEs : [];
    $howEn = is_string($en['how_to_apply_json']) ? json_decode($en['how_to_apply_json'], true) : ($en['how_to_apply_json'] ?? []);
    $howEs = is_string($es['how_to_apply_json']) ? json_decode($es['how_to_apply_json'], true) : ($es['how_to_apply_json'] ?? []);
    $howEn = is_array($howEn) ? $howEn : [];
    $howEs = is_array($howEs) ? $howEs : [];
    $content = [
      'hero' => [
        'title' => ['en' => $s($en['hero_title']), 'es' => $s($es['hero_title'])],
        'subtitle' => ['en' => $s($en['hero_subtitle']), 'es' => $s($es['hero_subtitle'])],
        'description' => ['en' => $s($en['hero_description']), 'es' => $s($es['hero_description'])],
        'icon' => $s($en['hero_icon'] ?? $es['hero_icon'] ?? 'AcademicCapIcon'),
        'announcement' => ['en' => $s($en['hero_announcement']), 'es' => $s($es['hero_announcement'])],
      ],
      'mission' => ['title' => ['en' => $s($en['mission_title']), 'es' => $s($es['mission_title'])], 'content' => ['en' => $s($en['mission_content']), 'es' => $s($es['mission_content'])]],
      'benefits' => ['title' => ['en' => '', 'es' => ''], 'items' => $benefitsItems],
      'programDetails' => [
        'title' => ['en' => '', 'es' => ''],
        'commitment' => ['en' => $s($progEn['commitment'] ?? ''), 'es' => $s($progEs['commitment'] ?? '')],
        'duration' => ['label' => ['en' => $s($progEn['duration']['label'] ?? ''), 'es' => $s($progEs['duration']['label'] ?? '')], 'value' => ['en' => $s($progEn['duration']['value'] ?? ''), 'es' => $s($progEs['duration']['value'] ?? '')]],
        'deadline' => ['label' => ['en' => $s($progEn['deadline']['label'] ?? ''), 'es' => $s($progEs['deadline']['label'] ?? '')], 'value' => ['en' => $s($progEn['deadline']['value'] ?? ''), 'es' => $s($progEs['deadline']['value'] ?? '')]],
      ],
      'howToApply' => [
        'title' => ['en' => $s($howEn['title'] ?? ''), 'es' => $s($howEs['title'] ?? '')],
        'description' => ['en' => $s($howEn['description'] ?? ''), 'es' => $s($howEs['description'] ?? '')],
        'contactEmail' => ['en' => $s($howEn['contactEmail'] ?? ''), 'es' => $s($howEs['contactEmail'] ?? '')],
        'email' => $s($howEn['email'] ?? $howEs['email'] ?? ''),
        'applyLink' => [
          'text' => ['en' => $s($howEn['applyLink']['text'] ?? ''), 'es' => $s($howEs['applyLink']['text'] ?? '')],
          'url' => $s($howEn['applyLink']['url'] ?? $howEs['applyLink']['url'] ?? ''),
          'enabled' => !empty($howEn['applyLink']['enabled']) || !empty($howEs['applyLink']['enabled']),
        ],
        'footnote' => ['en' => $s($howEn['footnote'] ?? ''), 'es' => $s($howEs['footnote'] ?? '')],
      ],
      'footnote' => ['en' => $s($howEn['footnote'] ?? ''), 'es' => $s($howEs['footnote'] ?? '')],
    ];
    echo json_encode(['meta' => $meta, 'seo' => $seo, 'content' => $content]);
    exit;
  }

  // ---------- Immigration evaluations: leer desde tabla plana page_immigration_evaluations (2 filas en/es) ----------
  if ($pageId === 'immigration-evaluations') {
    $fetchImmRow = function (string $locale) use ($conn) {
      $stmt = $conn->prepare('SELECT meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_description, intro_text, specializations_json, faq_json, cta_title, cta_subtitle, cta_button_text, updated_at FROM page_immigration_evaluations WHERE locale = ? LIMIT 1');
      if (!$stmt) return null;
      $stmt->bind_param('s', $locale);
      $stmt->execute();
      $meta_last_updated = $meta_version = $seo_title = $seo_description = $hero_title = $hero_description = $intro_text = $specializations_json = $faq_json = $cta_title = $cta_subtitle = $cta_button_text = $updated_at = null;
      $stmt->bind_result($meta_last_updated, $meta_version, $seo_title, $seo_description, $hero_title, $hero_description, $intro_text, $specializations_json, $faq_json, $cta_title, $cta_subtitle, $cta_button_text, $updated_at);
      $ok = $stmt->fetch();
      $stmt->close();
      if (!$ok) return null;
      return compact('meta_last_updated', 'meta_version', 'seo_title', 'seo_description', 'hero_title', 'hero_description', 'intro_text', 'specializations_json', 'faq_json', 'cta_title', 'cta_subtitle', 'cta_button_text', 'updated_at');
    };
    $en = $fetchImmRow('en');
    $es = $fetchImmRow('es');
    $conn->close();
    if (!$en || !$es) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Page not found']);
      exit;
    }
    $s = function ($v) { return (string) ($v ?? ''); };
    $lastUpdatedRaw = $en['meta_last_updated'] ?? $en['updated_at'] ?? null;
    $lastUpdated = (!empty($lastUpdatedRaw) && strtotime($lastUpdatedRaw) !== false) ? date('c', strtotime($lastUpdatedRaw)) : date('c');
    $meta = ['pageId' => 'immigration-evaluations', 'lastUpdated' => $lastUpdated, 'version' => (int) ($en['meta_version'] ?? 1)];
    $seo = ['title' => ['en' => $s($en['seo_title']), 'es' => $s($es['seo_title'])], 'description' => ['en' => $s($en['seo_description']), 'es' => $s($es['seo_description'])]];
    $specEn = is_string($en['specializations_json']) ? json_decode($en['specializations_json'], true) : ($en['specializations_json'] ?? []);
    $specEs = is_string($es['specializations_json']) ? json_decode($es['specializations_json'], true) : ($es['specializations_json'] ?? []);
    $specEn = is_array($specEn) ? $specEn : [];
    $specEs = is_array($specEs) ? $specEs : [];
    $specializations = [];
    $maxSpec = max(count($specEn), count($specEs));
    for ($i = 0; $i < $maxSpec; $i++) {
      $se_ = $specEn[$i] ?? [];
      $ss = $specEs[$i] ?? [];
      $specializations[] = ['id' => $s($se_['id'] ?? $ss['id'] ?? "spec-$i"), 'title' => ['en' => $s($se_['title'] ?? ''), 'es' => $s($ss['title'] ?? '')], 'description' => ['en' => $s($se_['description'] ?? ''), 'es' => $s($ss['description'] ?? '')]];
    }
    $faqEn = is_string($en['faq_json']) ? json_decode($en['faq_json'], true) : ($en['faq_json'] ?? []);
    $faqEs = is_string($es['faq_json']) ? json_decode($es['faq_json'], true) : ($es['faq_json'] ?? []);
    $faqEn = is_array($faqEn) ? $faqEn : [];
    $faqEs = is_array($faqEs) ? $faqEs : [];
    $faq = [];
    $maxFaq = max(count($faqEn), count($faqEs));
    for ($i = 0; $i < $maxFaq; $i++) {
      $fe = $faqEn[$i] ?? [];
      $fs = $faqEs[$i] ?? [];
      $parsEn = $fe['paragraphs'] ?? [];
      $parsEs = $fs['paragraphs'] ?? [];
      $paragraphs = [];
      for ($j = 0; $j < max(count($parsEn), count($parsEs)); $j++) {
        $paragraphs[] = ['en' => $s($parsEn[$j] ?? ''), 'es' => $s($parsEs[$j] ?? '')];
      }
      $item = ['question' => ['en' => $s($fe['question'] ?? ''), 'es' => $s($fs['question'] ?? '')]];
      if (isset($fe['answer']) || isset($fs['answer'])) {
        $item['answer'] = ['en' => $s($fe['answer'] ?? ''), 'es' => $s($fs['answer'] ?? '')];
      }
      if (!empty($paragraphs)) {
        $item['paragraphs'] = $paragraphs;
      }
      if (!empty($fe['isSource']) || !empty($fs['isSource'])) {
        $item['isSource'] = true;
      }
      $faq[] = $item;
    }
    $content = [
      'hero' => ['title' => ['en' => $s($en['hero_title']), 'es' => $s($es['hero_title'])], 'description' => ['en' => $s($en['hero_description']), 'es' => $s($es['hero_description'])]],
      'intro' => ['text' => ['en' => $s($en['intro_text']), 'es' => $s($es['intro_text'])]],
      'specializations' => $specializations,
      'faq' => $faq,
      'cta' => ['title' => ['en' => $s($en['cta_title']), 'es' => $s($es['cta_title'])], 'subtitle' => ['en' => $s($en['cta_subtitle']), 'es' => $s($es['cta_subtitle'])], 'buttonText' => ['en' => $s($en['cta_button_text']), 'es' => $s($es['cta_button_text'])]],
    ];
    echo json_encode(['meta' => $meta, 'seo' => $seo, 'content' => $content]);
    exit;
  }

  // ---------- What to expect: leer desde tabla plana page_what_to_expect (2 filas en/es) ----------
  if ($pageId === 'what-to-expect') {
    $fetchWteRow = function (string $locale) use ($conn) {
      $stmt = $conn->prepare('SELECT meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_subtitle, intro_text, sections_json, cta_section_json, updated_at FROM page_what_to_expect WHERE locale = ? LIMIT 1');
      if (!$stmt) return null;
      $stmt->bind_param('s', $locale);
      $stmt->execute();
      $meta_last_updated = $meta_version = $seo_title = $seo_description = $hero_title = $hero_subtitle = $intro_text = $sections_json = $cta_section_json = $updated_at = null;
      $stmt->bind_result($meta_last_updated, $meta_version, $seo_title, $seo_description, $hero_title, $hero_subtitle, $intro_text, $sections_json, $cta_section_json, $updated_at);
      $ok = $stmt->fetch();
      $stmt->close();
      if (!$ok) return null;
      return [
        'meta_last_updated' => $meta_last_updated,
        'meta_version' => $meta_version,
        'seo_title' => $seo_title,
        'seo_description' => $seo_description,
        'hero_title' => $hero_title,
        'hero_subtitle' => $hero_subtitle,
        'intro_text' => $intro_text,
        'sections_json' => $sections_json,
        'cta_section_json' => $cta_section_json,
        'updated_at' => $updated_at,
      ];
    };
    $en = $fetchWteRow('en');
    $es = $fetchWteRow('es');
    $conn->close();
    if (!$en || !$es) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Page not found']);
      exit;
    }
    $s = function ($v) { return (string) ($v ?? ''); };
    $lastUpdatedRaw = $en['meta_last_updated'] ?? $en['updated_at'] ?? null;
    $lastUpdated = null;
    if (!empty($lastUpdatedRaw) && strtotime($lastUpdatedRaw) !== false) {
      $lastUpdated = date('c', strtotime($lastUpdatedRaw));
    }
    if ($lastUpdated === null || $lastUpdated === '') {
      $lastUpdated = date('c');
    }
    $meta = ['pageId' => 'what-to-expect', 'lastUpdated' => $lastUpdated, 'version' => (int) ($en['meta_version'] ?? 1)];
    $seo = [
      'title' => ['en' => $s($en['seo_title']), 'es' => $s($es['seo_title'])],
      'description' => ['en' => $s($en['seo_description']), 'es' => $s($es['seo_description'])],
    ];
    $enSections = is_string($en['sections_json']) ? json_decode($en['sections_json'], true) : $en['sections_json'];
    $esSections = is_string($es['sections_json']) ? json_decode($es['sections_json'], true) : $es['sections_json'];
    $enSections = is_array($enSections) ? $enSections : [];
    $esSections = is_array($esSections) ? $esSections : [];
    $maxSections = max(count($enSections), count($esSections));
    $sections = [];
    for ($i = 0; $i < $maxSections; $i++) {
      $e = $enSections[$i] ?? [];
      $secEs = $esSections[$i] ?? [];
      $id = $e['id'] ?? $secEs['id'] ?? ('section-' . $i);
      $contentEn = $e['content'] ?? [];
      $contentEs = $secEs['content'] ?? [];
      $itemsEn = $contentEn['items'] ?? [];
      $itemsEs = $contentEs['items'] ?? [];
      $maxItems = max(count($itemsEn), count($itemsEs));
      $items = [];
      for ($j = 0; $j < $maxItems; $j++) {
        $ie = $itemsEn[$j] ?? [];
        $is = $itemsEs[$j] ?? [];
        $items[] = [
          'title' => ['en' => (string) ($ie['title'] ?? ''), 'es' => (string) ($is['title'] ?? '')],
          'description' => ['en' => (string) ($ie['description'] ?? ''), 'es' => (string) ($is['description'] ?? '')],
        ];
      }
      $parEn = $contentEn['paragraphs'] ?? [];
      $parEs = $contentEs['paragraphs'] ?? [];
      $maxPar = max(count($parEn), count($parEs));
      $paragraphs = [];
      for ($k = 0; $k < $maxPar; $k++) {
        $pe = $parEn[$k] ?? '';
        $ps = $parEs[$k] ?? '';
        $paragraphs[] = ['en' => (string) (is_array($pe) ? ($pe['en'] ?? '') : $pe), 'es' => (string) (is_array($ps) ? ($ps['es'] ?? '') : $ps)];
      }
      $sections[] = [
        'id' => $id,
        'title' => ['en' => $s($e['title'] ?? ''), 'es' => $s($secEs['title'] ?? '')],
        'icon' => $e['icon'] ?? $secEs['icon'] ?? '',
        'content' => [
          'intro' => ['en' => (string) (is_array($contentEn['intro'] ?? null) ? ($contentEn['intro']['en'] ?? $contentEn['intro'] ?? '') : ($contentEn['intro'] ?? '')), 'es' => (string) (is_array($contentEs['intro'] ?? null) ? ($contentEs['intro']['es'] ?? $contentEs['intro'] ?? '') : ($contentEs['intro'] ?? ''))],
          'items' => $items,
          'paragraphs' => $paragraphs,
        ],
      ];
    }
    $enCta = is_string($en['cta_section_json']) ? json_decode($en['cta_section_json'], true) : $en['cta_section_json'];
    $esCta = is_string($es['cta_section_json']) ? json_decode($es['cta_section_json'], true) : $es['cta_section_json'];
    $enCta = is_array($enCta) ? $enCta : ['title' => '', 'subtitle' => '', 'ctas' => []];
    $esCta = is_array($esCta) ? $esCta : ['title' => '', 'subtitle' => '', 'ctas' => []];
    $ctasEn = $enCta['ctas'] ?? [];
    $ctasEs = $esCta['ctas'] ?? [];
    $maxCtas = max(count($ctasEn), count($ctasEs));
    $ctas = [];
    for ($i = 0; $i < $maxCtas; $i++) {
      $ce = $ctasEn[$i] ?? [];
      $cs = $ctasEs[$i] ?? [];
      $ctas[] = [
        'id' => $ce['id'] ?? $cs['id'] ?? ('cta-' . $i),
        'title' => ['en' => (string) ($ce['title'] ?? ''), 'es' => (string) ($cs['title'] ?? '')],
        'description' => ['en' => (string) ($ce['description'] ?? ''), 'es' => (string) ($cs['description'] ?? '')],
        'link' => (string) ($ce['link'] ?? $cs['link'] ?? ''),
        'variant' => $ce['variant'] ?? $cs['variant'] ?? 'primary',
      ];
    }
    $content = [
      'hero' => [
        'title' => ['en' => $s($en['hero_title']), 'es' => $s($es['hero_title'])],
        'subtitle' => ['en' => $s($en['hero_subtitle']), 'es' => $s($es['hero_subtitle'])],
      ],
      'intro' => [
        'text' => ['en' => $s($en['intro_text']), 'es' => $s($es['intro_text'])],
      ],
      'sections' => $sections,
      'ctaSection' => [
        'title' => ['en' => $s($enCta['title'] ?? ''), 'es' => $s($esCta['title'] ?? '')],
        'subtitle' => ['en' => $s($enCta['subtitle'] ?? ''), 'es' => $s($esCta['subtitle'] ?? '')],
        'ctas' => $ctas,
      ],
    ];
    error_log('[content.php GET what-to-expect] hero_title.en=' . json_encode($en['hero_title']) . ' sections_count=' . count($sections) . ' meta.lastUpdated=' . $lastUpdated);
    echo json_encode(['meta' => $meta, 'seo' => $seo, 'content' => $content]);
    exit;
  }

  // ---------- Rates: leer desde tabla plana page_rates (2 filas en/es) ----------
  if ($pageId === 'rates') {
    $fetchRatesRow = function (string $locale) use ($conn) {
      $stmt = $conn->prepare('SELECT meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_subtitle, hero_background_image, hero_background_image_alt, pricing_json, insurance_json, payment_options_json, faq_json, cta_section_json, updated_at FROM page_rates WHERE locale = ? LIMIT 1');
      if (!$stmt) return null;
      $stmt->bind_param('s', $locale);
      $stmt->execute();
      $meta_last_updated = $meta_version = $seo_title = $seo_description = $hero_title = $hero_subtitle = $hero_background_image = $hero_background_image_alt = $pricing_json = $insurance_json = $payment_options_json = $faq_json = $cta_section_json = $updated_at = null;
      $stmt->bind_result($meta_last_updated, $meta_version, $seo_title, $seo_description, $hero_title, $hero_subtitle, $hero_background_image, $hero_background_image_alt, $pricing_json, $insurance_json, $payment_options_json, $faq_json, $cta_section_json, $updated_at);
      $ok = $stmt->fetch();
      $stmt->close();
      if (!$ok) return null;
      return compact('meta_last_updated', 'meta_version', 'seo_title', 'seo_description', 'hero_title', 'hero_subtitle', 'hero_background_image', 'hero_background_image_alt', 'pricing_json', 'insurance_json', 'payment_options_json', 'faq_json', 'cta_section_json', 'updated_at');
    };
    $en = $fetchRatesRow('en');
    $es = $fetchRatesRow('es');
    if (!$en || !$es) {
      $conn->close();
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Page not found']);
      exit;
    }
    // providerList desde tabla dedicada insurance_provider (migración 025), no desde insurance_json
    $providerListMerged = [];
    $providerRes = $conn->query('SELECT name_en, name_es, logo_url FROM insurance_provider ORDER BY display_order ASC, name_en ASC');
    if ($providerRes) {
      while ($row = $providerRes->fetch_assoc()) {
        $providerListMerged[] = [
          'name' => ['en' => (string) ($row['name_en'] ?? ''), 'es' => (string) ($row['name_es'] ?? '')],
          'logoUrl' => trim((string) ($row['logo_url'] ?? '')),
        ];
      }
      $providerRes->free();
    }
    $conn->close();
    $s = function ($v) { return (string) ($v ?? ''); };
    $lastUpdatedRaw = $en['meta_last_updated'] ?? $en['updated_at'] ?? null;
    $lastUpdated = (!empty($lastUpdatedRaw) && strtotime($lastUpdatedRaw) !== false) ? date('c', strtotime($lastUpdatedRaw)) : date('c');
    $meta = ['pageId' => 'rates', 'lastUpdated' => $lastUpdated, 'version' => (int) ($en['meta_version'] ?? 1)];
    $seo = [
      'title' => ['en' => $s($en['seo_title']), 'es' => $s($es['seo_title'])],
      'description' => ['en' => $s($en['seo_description']), 'es' => $s($es['seo_description'])],
    ];
    $content = [
      'hero' => [
        'title' => ['en' => $s($en['hero_title']), 'es' => $s($es['hero_title'])],
        'subtitle' => ['en' => $s($en['hero_subtitle']), 'es' => $s($es['hero_subtitle'])],
        'backgroundImage' => $en['hero_background_image'] === $es['hero_background_image'] ? $s($en['hero_background_image']) : ['en' => $s($en['hero_background_image']), 'es' => $s($es['hero_background_image'])],
        'backgroundImageAlt' => ['en' => $s($en['hero_background_image_alt']), 'es' => $s($es['hero_background_image_alt'])],
      ],
    ];
    $pEn = is_string($en['pricing_json']) ? json_decode($en['pricing_json'], true) : $en['pricing_json'];
    $pEs = is_string($es['pricing_json']) ? json_decode($es['pricing_json'], true) : $es['pricing_json'];
    $pEn = is_array($pEn) ? $pEn : ['title' => '', 'sessions' => []];
    $pEs = is_array($pEs) ? $pEs : ['title' => '', 'sessions' => []];
    $sessionsMerged = [];
    $maxSessions = max(count($pEn['sessions'] ?? []), count($pEs['sessions'] ?? []));
    for ($i = 0; $i < $maxSessions; $i++) {
      $se = $pEn['sessions'][$i] ?? [];
      $ss = $pEs['sessions'][$i] ?? [];
      $sessionsMerged[] = [
        'type' => ['en' => $s($se['type'] ?? ''), 'es' => $s($ss['type'] ?? '')],
        'rate' => ['en' => $s($se['rate'] ?? ''), 'es' => $s($ss['rate'] ?? '')],
        'duration' => ['en' => $s($se['duration'] ?? ''), 'es' => $s($ss['duration'] ?? '')],
      ];
    }
    $content['pricing'] = [
      'title' => ['en' => $s($pEn['title'] ?? ''), 'es' => $s($pEs['title'] ?? '')],
      'sessions' => $sessionsMerged,
    ];
    $insEn = is_string($en['insurance_json']) ? json_decode($en['insurance_json'], true) : $en['insurance_json'];
    $insEs = is_string($es['insurance_json']) ? json_decode($es['insurance_json'], true) : $es['insurance_json'];
    $insEn = is_array($insEn) ? $insEn : [];
    $insEs = is_array($insEs) ? $insEs : [];
    // providerList ya viene de tabla insurance_provider (arriba); el resto de insurance desde JSON
    $providersMerged = [];
    $provEn = $insEn['providers'] ?? [];
    $provEs = $insEs['providers'] ?? [];
    $maxProv = max(count($provEn), count($provEs));
    for ($i = 0; $i < $maxProv; $i++) {
      $pe = $provEn[$i] ?? [];
      $ps = $provEs[$i] ?? [];
      $providersMerged[] = [
        'label' => ['en' => $s($pe['label'] ?? ''), 'es' => $s($ps['label'] ?? '')],
        'text' => ['en' => $s($pe['text'] ?? ''), 'es' => $s($ps['text'] ?? '')],
      ];
    }
    $modalEn = $insEn['modal'] ?? [];
    $modalEs = $insEs['modal'] ?? [];
    $content['insurance'] = [
      'title' => ['en' => $s($insEn['title'] ?? ''), 'es' => $s($insEs['title'] ?? '')],
      'description' => ['en' => $s($insEn['description'] ?? ''), 'es' => $s($insEs['description'] ?? '')],
      'providerList' => $providerListMerged,
      'providers' => $providersMerged,
      'modal' => [
        'title' => ['en' => $s($modalEn['title'] ?? ''), 'es' => $s($modalEs['title'] ?? '')],
        'description' => ['en' => $s($modalEn['description'] ?? ''), 'es' => $s($modalEs['description'] ?? '')],
        'outOfNetworkInfo' => ['en' => $s($modalEn['outOfNetworkInfo'] ?? ''), 'es' => $s($modalEs['outOfNetworkInfo'] ?? '')],
        'note' => ['en' => $s($modalEn['note'] ?? ''), 'es' => $s($modalEs['note'] ?? '')],
        'cta' => [
          'text' => ['en' => $s($modalEn['cta']['text'] ?? ''), 'es' => $s($modalEs['cta']['text'] ?? '')],
          'href' => ['en' => $s($modalEn['cta']['href'] ?? ''), 'es' => $s($modalEs['cta']['href'] ?? '')],
        ],
      ],
    ];
    $poEn = is_string($en['payment_options_json']) ? json_decode($en['payment_options_json'], true) : $en['payment_options_json'];
    $poEs = is_string($es['payment_options_json']) ? json_decode($es['payment_options_json'], true) : $es['payment_options_json'];
    $poEn = is_array($poEn) ? $poEn : ['title' => '', 'description' => '', 'options' => []];
    $poEs = is_array($poEs) ? $poEs : ['title' => '', 'description' => '', 'options' => []];
    $optMerged = [];
    $optEn = $poEn['options'] ?? [];
    $optEs = $poEs['options'] ?? [];
    $maxOpt = max(count($optEn), count($optEs));
    for ($i = 0; $i < $maxOpt; $i++) {
      $oe = $optEn[$i] ?? [];
      $os = $optEs[$i] ?? [];
      $optMerged[] = [
        'label' => ['en' => $s($oe['label'] ?? ''), 'es' => $s($os['label'] ?? '')],
        'text' => ['en' => $s($oe['text'] ?? ''), 'es' => $s($os['text'] ?? '')],
      ];
    }
    $content['paymentOptions'] = [
      'title' => ['en' => $s($poEn['title'] ?? ''), 'es' => $s($poEs['title'] ?? '')],
      'description' => ['en' => $s($poEn['description'] ?? ''), 'es' => $s($poEs['description'] ?? '')],
      'options' => $optMerged,
    ];
    $faqEn = is_string($en['faq_json']) ? json_decode($en['faq_json'], true) : $en['faq_json'];
    $faqEs = is_string($es['faq_json']) ? json_decode($es['faq_json'], true) : $es['faq_json'];
    $faqEn = is_array($faqEn) ? $faqEn : ['title' => '', 'questions' => []];
    $faqEs = is_array($faqEs) ? $faqEs : ['title' => '', 'questions' => []];
    $questionsMerged = [];
    $qEn = $faqEn['questions'] ?? [];
    $qEs = $faqEs['questions'] ?? [];
    $maxQ = max(count($qEn), count($qEs));
    for ($i = 0; $i < $maxQ; $i++) {
      $qe = $qEn[$i] ?? [];
      $qs = $qEs[$i] ?? [];
      $questionsMerged[] = [
        'question' => ['en' => $s($qe['question'] ?? ''), 'es' => $s($qs['question'] ?? '')],
        'answer' => ['en' => $s($qe['answer'] ?? ''), 'es' => $s($qs['answer'] ?? '')],
      ];
    }
    $content['faq'] = [
      'title' => ['en' => $s($faqEn['title'] ?? ''), 'es' => $s($faqEs['title'] ?? '')],
      'questions' => $questionsMerged,
    ];
    $ctaEn = is_string($en['cta_section_json']) ? json_decode($en['cta_section_json'], true) : $en['cta_section_json'];
    $ctaEs = is_string($es['cta_section_json']) ? json_decode($es['cta_section_json'], true) : $es['cta_section_json'];
    $ctaEn = is_array($ctaEn) ? $ctaEn : [];
    $ctaEs = is_array($ctaEs) ? $ctaEs : [];
    $content['ctaSection'] = [
      'title' => ['en' => $s($ctaEn['title'] ?? ''), 'es' => $s($ctaEs['title'] ?? '')],
      'subtitle' => ['en' => $s($ctaEn['subtitle'] ?? ''), 'es' => $s($ctaEs['subtitle'] ?? '')],
      'primaryCTA' => [
        'text' => ['en' => $s($ctaEn['primaryCTA']['text'] ?? ''), 'es' => $s($ctaEs['primaryCTA']['text'] ?? '')],
        'href' => ['en' => $s($ctaEn['primaryCTA']['href'] ?? ''), 'es' => $s($ctaEs['primaryCTA']['href'] ?? '')],
      ],
      'secondaryCTA' => [
        'text' => ['en' => $s($ctaEn['secondaryCTA']['text'] ?? ''), 'es' => $s($ctaEs['secondaryCTA']['text'] ?? '')],
        'href' => ['en' => $s($ctaEn['secondaryCTA']['href'] ?? ''), 'es' => $s($ctaEs['secondaryCTA']['href'] ?? '')],
      ],
    ];
    error_log('[content.php GET rates] hero_title.en=' . json_encode($en['hero_title']));
    echo json_encode(['meta' => $meta, 'seo' => $seo, 'content' => $content]);
    exit;
  }

  // ---------- Services: leer desde page_services (2 filas en/es) + page_services_condition (7 filas) ----------
  if ($pageId === 'services') {
    $fetchServicesRow = function (string $locale) use ($conn) {
      $stmt = $conn->prepare('SELECT meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_subtitle, hero_background_image, hero_background_image_alt, quick_jump_text, immigration_evaluation_text, intro_text, categories_json, conditions_section_title, conditions_section_subtitle, cta_section_json, updated_at FROM page_services WHERE locale = ? LIMIT 1');
      if (!$stmt) return null;
      $stmt->bind_param('s', $locale);
      $stmt->execute();
      $meta_last_updated = $meta_version = $seo_title = $seo_description = $hero_title = $hero_subtitle = $hero_background_image = $hero_background_image_alt = $quick_jump_text = $immigration_evaluation_text = $intro_text = $categories_json = $conditions_section_title = $conditions_section_subtitle = $cta_section_json = $updated_at = null;
      $stmt->bind_result($meta_last_updated, $meta_version, $seo_title, $seo_description, $hero_title, $hero_subtitle, $hero_background_image, $hero_background_image_alt, $quick_jump_text, $immigration_evaluation_text, $intro_text, $categories_json, $conditions_section_title, $conditions_section_subtitle, $cta_section_json, $updated_at);
      $ok = $stmt->fetch();
      $stmt->close();
      if (!$ok) return null;
      return compact('meta_last_updated', 'meta_version', 'seo_title', 'seo_description', 'hero_title', 'hero_subtitle', 'hero_background_image', 'hero_background_image_alt', 'quick_jump_text', 'immigration_evaluation_text', 'intro_text', 'categories_json', 'conditions_section_title', 'conditions_section_subtitle', 'cta_section_json', 'updated_at');
    };
    $en = $fetchServicesRow('en');
    $es = $fetchServicesRow('es');
    // Leer condiciones desde tabla plana (7 filas)
    $conditionsRows = [];
    $condStmt = $conn->query('SELECT slug, icon, title_en, title_es, short_description_en, short_description_es, detail_title_en, detail_title_es, detail_content_en, detail_content_es FROM page_services_condition ORDER BY display_order ASC');
    if ($condStmt) {
      while ($row = $condStmt->fetch_assoc()) {
        $conditionsRows[] = $row;
      }
      $condStmt->close();
    }
    $conn->close();
    if (!$en || !$es) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Page not found']);
      exit;
    }
    $s = function ($v) { return (string) ($v ?? ''); };
    $lastUpdatedRaw = $en['meta_last_updated'] ?? $en['updated_at'] ?? null;
    $lastUpdated = (!empty($lastUpdatedRaw) && strtotime($lastUpdatedRaw) !== false) ? date('c', strtotime($lastUpdatedRaw)) : date('c');
    $meta = ['pageId' => 'services', 'lastUpdated' => $lastUpdated, 'version' => (int) ($en['meta_version'] ?? 1)];
    $seo = [
      'title' => ['en' => $s($en['seo_title']), 'es' => $s($es['seo_title'])],
      'description' => ['en' => $s($en['seo_description']), 'es' => $s($es['seo_description'])],
    ];
    $content = [
      'hero' => [
        'title' => ['en' => $s($en['hero_title']), 'es' => $s($es['hero_title'])],
        'subtitle' => ['en' => $s($en['hero_subtitle']), 'es' => $s($es['hero_subtitle'])],
        'backgroundImage' => $en['hero_background_image'] === $es['hero_background_image'] ? $s($en['hero_background_image']) : ['en' => $s($en['hero_background_image']), 'es' => $s($es['hero_background_image'])],
        'backgroundImageAlt' => ['en' => $s($en['hero_background_image_alt']), 'es' => $s($es['hero_background_image_alt'])],
      ],
      'quickJump' => ['text' => ['en' => $s($en['quick_jump_text']), 'es' => $s($es['quick_jump_text'])]],
      'immigrationEvaluation' => ['text' => ['en' => $s($en['immigration_evaluation_text']), 'es' => $s($es['immigration_evaluation_text'])]],
      'intro' => ['text' => ['en' => $s($en['intro_text']), 'es' => $s($es['intro_text'])]],
    ];
    $catEn = is_string($en['categories_json']) ? json_decode($en['categories_json'], true) : $en['categories_json'];
    $catEs = is_string($es['categories_json']) ? json_decode($es['categories_json'], true) : $es['categories_json'];
    $catEn = is_array($catEn) ? $catEn : [];
    $catEs = is_array($catEs) ? $catEs : [];
    $categoriesMerged = [];
    $maxCat = max(count($catEn), count($catEs));
    for ($i = 0; $i < $maxCat; $i++) {
      $ce = $catEn[$i] ?? [];
      $cs = $catEs[$i] ?? [];
      $servEn = $ce['services'] ?? [];
      $servEs = $cs['services'] ?? [];
      $servMerged = [];
      $maxServ = max(count($servEn), count($servEs));
      for ($j = 0; $j < $maxServ; $j++) {
        $se_ = $servEn[$j] ?? [];
        $ss = $servEs[$j] ?? [];
        $servMerged[] = [
          'id' => $s($se_['id'] ?? $ss['id'] ?? 'svc-' . $i . '-' . $j),
          'name' => ['en' => $s($se_['name'] ?? ''), 'es' => $s($ss['name'] ?? '')],
          'description' => ['en' => $s($se_['description'] ?? ''), 'es' => $s($ss['description'] ?? '')],
          'icon' => $s($se_['icon'] ?? $ss['icon'] ?? 'document'),
        ];
      }
      $categoriesMerged[] = [
        'id' => $s($ce['id'] ?? $cs['id'] ?? 'cat-' . $i),
        'title' => ['en' => $s($ce['title'] ?? ''), 'es' => $s($cs['title'] ?? '')],
        'services' => $servMerged,
      ];
    }
    $content['categories'] = $categoriesMerged;
    // conditionsSection: título/subtítulo desde page_services; lista desde page_services_condition
    $conditionsMerged = [];
    foreach ($conditionsRows as $row) {
      $slug = $s($row['slug'] ?? '');
      $conditionsMerged[] = [
        'id' => $slug,
        'name' => ['en' => $s($row['title_en'] ?? ''), 'es' => $s($row['title_es'] ?? '')],
        'description' => ['en' => $s($row['short_description_en'] ?? ''), 'es' => $s($row['short_description_es'] ?? '')],
        'icon' => $s($row['icon'] ?? ''),
        'link' => '/services/' . $slug,
        'detailTitle' => ['en' => $s($row['detail_title_en'] ?? ''), 'es' => $s($row['detail_title_es'] ?? '')],
        'detailContent' => ['en' => $s($row['detail_content_en'] ?? ''), 'es' => $s($row['detail_content_es'] ?? '')],
      ];
    }
    $content['conditionsSection'] = [
      'title' => ['en' => $s($en['conditions_section_title'] ?? ''), 'es' => $s($es['conditions_section_title'] ?? '')],
      'subtitle' => ['en' => $s($en['conditions_section_subtitle'] ?? ''), 'es' => $s($es['conditions_section_subtitle'] ?? '')],
      'conditions' => $conditionsMerged,
    ];
    $ctaEn = is_string($en['cta_section_json']) ? json_decode($en['cta_section_json'], true) : $en['cta_section_json'];
    $ctaEs = is_string($es['cta_section_json']) ? json_decode($es['cta_section_json'], true) : $es['cta_section_json'];
    $ctaEn = is_array($ctaEn) ? $ctaEn : ['title' => '', 'subtitle' => '', 'primaryCTAs' => [], 'secondaryCTA' => []];
    $ctaEs = is_array($ctaEs) ? $ctaEs : ['title' => '', 'subtitle' => '', 'primaryCTAs' => [], 'secondaryCTA' => []];
    $primaryEn = $ctaEn['primaryCTAs'] ?? [];
    $primaryEs = $ctaEs['primaryCTAs'] ?? [];
    $primaryMerged = [];
    $maxPrimary = max(count($primaryEn), count($primaryEs));
    for ($i = 0; $i < $maxPrimary; $i++) {
      $pe = $primaryEn[$i] ?? [];
      $ps = $primaryEs[$i] ?? [];
      $primaryMerged[] = [
        'id' => $s($pe['id'] ?? $ps['id'] ?? 'primary-' . $i),
        'title' => ['en' => $s($pe['title'] ?? ''), 'es' => $s($ps['title'] ?? '')],
        'link' => $s($pe['link'] ?? $ps['link'] ?? ''),
        'color' => $s($pe['color'] ?? $ps['color'] ?? 'blueGreen'),
      ];
    }
    $secEn = $ctaEn['secondaryCTA'] ?? [];
    $secEs = $ctaEs['secondaryCTA'] ?? [];
    $secondaryCTA = (count($secEn) > 0 || count($secEs) > 0) ? [
      'id' => $s($secEn['id'] ?? $secEs['id'] ?? ''),
      'title' => ['en' => $s($secEn['title'] ?? ''), 'es' => $s($secEs['title'] ?? '')],
      'link' => $s($secEn['link'] ?? $secEs['link'] ?? ''),
      'text' => ['en' => $s($secEn['text'] ?? ''), 'es' => $s($secEs['text'] ?? '')],
    ] : null;
    $content['ctaSection'] = [
      'title' => ['en' => $s($ctaEn['title'] ?? ''), 'es' => $s($ctaEs['title'] ?? '')],
      'subtitle' => ['en' => $s($ctaEn['subtitle'] ?? ''), 'es' => $s($ctaEs['subtitle'] ?? '')],
      'primaryCTAs' => $primaryMerged,
      'secondaryCTA' => $secondaryCTA,
    ];
    echo json_encode(['meta' => $meta, 'seo' => $seo, 'content' => $content]);
    exit;
  }

  // ---------- Contact: leer campos editables desde page_contact; form desde page_content ----------
  if ($pageId === 'contact') {
    $fetchContactRow = function (string $locale) use ($conn) {
      $stmt = $conn->prepare('SELECT meta_last_updated, meta_version, seo_title, seo_description, hero_title, address_street, address_city, address_state, address_zip, phone, email, office_hours_title, office_hours_hours, office_hours_note, facebook_url, instagram_url, updated_at FROM page_contact WHERE locale = ? LIMIT 1');
      if (!$stmt) {
        error_log('[content.php GET contact] prepare failed: ' . $conn->error);
        return null;
      }
      $stmt->bind_param('s', $locale);
      if (!$stmt->execute()) {
        error_log('[content.php GET contact] execute failed for locale ' . $locale . ': ' . $stmt->error);
        $stmt->close();
        return null;
      }
      $r = [
        'meta_last_updated' => null, 'meta_version' => null, 'seo_title' => null, 'seo_description' => null,
        'hero_title' => null, 'address_street' => null, 'address_city' => null, 'address_state' => null, 'address_zip' => null,
        'phone' => null, 'email' => null, 'office_hours_title' => null, 'office_hours_hours' => null, 'office_hours_note' => null,
        'facebook_url' => null, 'instagram_url' => null, 'updated_at' => null,
      ];
      $stmt->bind_result(
        $r['meta_last_updated'], $r['meta_version'], $r['seo_title'], $r['seo_description'], $r['hero_title'],
        $r['address_street'], $r['address_city'], $r['address_state'], $r['address_zip'],
        $r['phone'], $r['email'], $r['office_hours_title'], $r['office_hours_hours'], $r['office_hours_note'],
        $r['facebook_url'], $r['instagram_url'], $r['updated_at']
      );
      $ok = $stmt->fetch();
      $stmt->close();
      return $ok ? $r : null;
    };
    $en = $fetchContactRow('en');
    $es = $fetchContactRow('es');
    if (!$en || !$es) {
      $conn->close();
      error_log('[content.php GET contact] missing page_contact row(s). Run migration 016_create_page_contact.sql. en=' . ($en ? 'ok' : 'null') . ' es=' . ($es ? 'ok' : 'null'));
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Contact page not found. Ensure table page_contact exists with rows for locale en and es (migration 016).']);
      exit;
    }
    $s = function ($v) { return (string) ($v ?? ''); };
    $lastUpdatedRaw = $en['meta_last_updated'] ?? $en['updated_at'] ?? null;
    $lastUpdated = (!empty($lastUpdatedRaw) && strtotime($lastUpdatedRaw) !== false) ? date('c', strtotime($lastUpdatedRaw)) : date('c');
    $meta = ['pageId' => 'contact', 'lastUpdated' => $lastUpdated, 'version' => (int) ($en['meta_version'] ?? 1)];
    $seo = [
      'title' => ['en' => $s($en['seo_title']), 'es' => $s($es['seo_title'])],
      'description' => ['en' => $s($en['seo_description']), 'es' => $s($es['seo_description'])],
    ];
    $content = [
      'hero' => [
        'title' => ['en' => $s($en['hero_title']), 'es' => $s($es['hero_title'])],
      ],
      'contactInfo' => [
        'address' => [
          'street' => ['en' => $s($en['address_street']), 'es' => $s($es['address_street'])],
          'city' => ['en' => $s($en['address_city']), 'es' => $s($es['address_city'])],
          'state' => ['en' => $s($en['address_state']), 'es' => $s($es['address_state'])],
          'zip' => ['en' => $s($en['address_zip']), 'es' => $s($es['address_zip'])],
        ],
        'phone' => ['en' => $s($en['phone']), 'es' => $s($es['phone'])],
        'email' => ['en' => $s($en['email']), 'es' => $s($es['email'])],
        'officeHours' => [
          'title' => ['en' => $s($en['office_hours_title']), 'es' => $s($es['office_hours_title'])],
          'hours' => ['en' => $s($en['office_hours_hours']), 'es' => $s($es['office_hours_hours'])],
          'note' => ['en' => $s($en['office_hours_note']), 'es' => $s($es['office_hours_note'])],
        ],
        'socialMedia' => [
          'facebook' => ['en' => $s($en['facebook_url']), 'es' => $s($es['facebook_url'])],
          'instagram' => ['en' => $s($en['instagram_url']), 'es' => $s($es['instagram_url'])],
        ],
      ],
    ];
    // Form no es editable: leer desde page_content y añadirlo al content
    $stmtForm = $conn->prepare('SELECT content FROM page_content WHERE page_id = ? LIMIT 1');
    if ($stmtForm) {
      $stmtForm->bind_param('s', $pageId);
      if ($stmtForm->execute()) {
        $contentCol = null;
        $stmtForm->bind_result($contentCol);
        if ($stmtForm->fetch()) {
        $blob = is_string($contentCol) ? json_decode($contentCol, true) : $contentCol;
        if (is_array($blob) && isset($blob['form'])) {
          $content['form'] = $blob['form'];
        }
        }
      }
      $stmtForm->close();
    }
    if (!isset($content['form'])) {
      $content['form'] = [
        'introText' => ['en' => "We'd love to hear from you! Fill out the form below.", 'es' => '¡Nos encantaría saber de ti! Completa el formulario.'],
        'fields' => ['name' => ['label' => ['en' => 'Name', 'es' => 'Nombre'], 'placeholder' => ['en' => 'Your name', 'es' => 'Tu nombre']], 'email' => ['label' => ['en' => 'Email', 'es' => 'Correo'], 'placeholder' => ['en' => 'your@email.com', 'es' => 'tu@correo.com']], 'comment' => ['label' => ['en' => 'Comment', 'es' => 'Comentario'], 'placeholder' => ['en' => 'Your message...', 'es' => 'Tu mensaje...']]],
        'submitButton' => ['en' => 'Send', 'es' => 'Enviar'],
      ];
    }
    $conn->close();
    error_log('[content.php GET contact] hero_title.en=' . json_encode($en['hero_title']));
    echo json_encode(['meta' => $meta, 'seo' => $seo, 'content' => $content]);
    exit;
  }

  // ---------- Resto de páginas: leer desde page_content (blob) ----------
  $stmt = $conn->prepare('SELECT meta, seo, content, updated_at FROM page_content WHERE page_id = ? LIMIT 1');
  if (!$stmt) {
    $conn->close();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Query failed']);
    exit;
  }
  $stmt->bind_param('s', $pageId);
  $stmt->execute();
  $metaCol = $seoCol = $contentCol = $updatedAtCol = null;
  $stmt->bind_result($metaCol, $seoCol, $contentCol, $updatedAtCol);
  $fetched = $stmt->fetch();
  $row = $fetched ? [
    'meta' => $metaCol,
    'seo' => $seoCol,
    'content' => $contentCol,
    'updated_at' => $updatedAtCol,
  ] : null;
  $stmt->close();
  $conn->close();

  if (!$row) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Page not found']);
    exit;
  }

  $meta   = is_string($row['meta'])   ? json_decode($row['meta'], true)   : $row['meta'];
  $seo    = is_string($row['seo'])   ? json_decode($row['seo'], true)    : $row['seo'];
  $content = is_string($row['content']) ? json_decode($row['content'], true) : $row['content'];
  $updatedAt = isset($row['updated_at']) ? date('c', strtotime($row['updated_at'])) : null;

  if (is_array($meta) && $updatedAt !== null && empty($meta['lastUpdated'])) {
    $meta['lastUpdated'] = $updatedAt;
  }
  if (!is_array($meta)) {
    $meta = ['pageId' => $pageId, 'lastUpdated' => $updatedAt ?? date('c'), 'version' => 1];
  }

  echo json_encode([
    'meta' => $meta ?: (object)[],
    'seo' => $seo ?: (object)[],
    'content' => $content ?: (object)[],
  ]);
} catch (Throwable $e) {
  error_log('[content.php GET] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Failed to load content']);
}
