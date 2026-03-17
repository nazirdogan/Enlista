// ═══════════════════════════════════════════════════════════════
// Enlista — Brand Documents Figma Plugin
// Creates two pages:
//   Page 1: 🎨 Logo Options (10 logo explorations)
//   Page 2: 📋 Brand Strategy (full GTM document)
// ═══════════════════════════════════════════════════════════════

(async function main() {

  // ─── FONTS ────────────────────────────────────────────────────
  var FONT = 'Satoshi';
  var fontStyles = ['Light', 'Regular', 'Medium', 'Bold', 'Black'];

  try {
    await Promise.all(fontStyles.map(function(s) {
      return figma.loadFontAsync({ family: FONT, style: s });
    }));
    await figma.loadFontAsync({ family: FONT, style: 'Light Italic' });
    await figma.loadFontAsync({ family: FONT, style: 'Italic' });
  } catch (e) {
    try {
      FONT = 'Plus Jakarta Sans';
      fontStyles = ['Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold'];
      await Promise.all(fontStyles.map(function(s) {
        return figma.loadFontAsync({ family: FONT, style: s });
      }));
    } catch (e2) {
      FONT = 'Inter';
      fontStyles = ['Light', 'Regular', 'Medium', 'Semi Bold', 'Bold', 'Extra Bold'];
      await Promise.all(fontStyles.map(function(s) {
        return figma.loadFontAsync({ family: FONT, style: s });
      }));
    }
  }

  // Try Cairo for Arabic
  var FONT_AR = 'Cairo';
  try {
    await figma.loadFontAsync({ family: FONT_AR, style: 'Regular' });
    await figma.loadFontAsync({ family: FONT_AR, style: 'SemiBold' });
    await figma.loadFontAsync({ family: FONT_AR, style: 'Bold' });
  } catch (e) {
    FONT_AR = FONT;
  }

  // Normalise weight names across fonts
  function W(w) {
    if (FONT === 'Inter') {
      if (w === 'SemiBold') return 'Semi Bold';
      if (w === 'ExtraBold') return 'Extra Bold';
      if (w === 'Black') return 'Extra Bold';
    }
    if (FONT === 'Plus Jakarta Sans') {
      if (w === 'Black') return 'ExtraBold';
      if (w === 'Bold') return 'Bold';
    }
    return w;
  }

  // ─── COLOURS ──────────────────────────────────────────────────
  function rgb(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16) / 255,
      g: parseInt(hex.slice(3, 5), 16) / 255,
      b: parseInt(hex.slice(5, 7), 16) / 255,
    };
  }

  var C = {
    ink:     rgb('#0E1F38'),
    gold:    rgb('#C9A452'),
    goldL:   rgb('#E8C97A'),
    warm:    rgb('#F8F5F0'),
    warm2:   rgb('#EDE8DF'),
    white:   rgb('#FFFFFF'),
    muted:   rgb('#64748B'),
    border:  rgb('#E2E4E9'),
    success: rgb('#2D8A6E'),
    danger:  rgb('#DC2626'),
    teal:    rgb('#0B4D57'),
    mid:     rgb('#141E2E'),
    card:    rgb('#080F1C'),
    borderDark: rgb('#2A3A52'),
    red50:   rgb('#FEF2F2'),
    red200:  rgb('#FCA5A5'),
    green50: rgb('#F0FDF4'),
    blue:    rgb('#4299E1'),
  };

  // ─── HELPERS ──────────────────────────────────────────────────
  function solid(color, opacity) {
    return [{ type: 'SOLID', color: color, opacity: opacity !== undefined ? opacity : 1 }];
  }

  function at(node, x, y) { node.x = x; node.y = y; return node; }

  function makeFrame(name, w, h, bg, bgO) {
    var f = figma.createFrame();
    f.name = name;
    f.resize(w, h);
    f.fills = bg ? solid(bg, bgO !== undefined ? bgO : 1) : [];
    f.clipsContent = true;
    return f;
  }

  function makeRect(w, h, color, radius, opacity) {
    var r = figma.createRectangle();
    r.resize(w, h);
    r.fills = solid(color, opacity !== undefined ? opacity : 1);
    r.cornerRadius = radius !== undefined ? radius : 0;
    return r;
  }

  function makeEllipse(w, h, color, opacity) {
    var e = figma.createEllipse();
    e.resize(w, h);
    e.fills = [];
    e.strokes = solid(color, opacity !== undefined ? opacity : 1);
    e.strokeWeight = 1;
    return e;
  }

  function makeText(str, size, style, color, opts) {
    opts = opts || {};
    var t = figma.createText();
    var useFont = opts.arabic ? FONT_AR : FONT;
    t.fontName = { family: useFont, style: opts.arabic ? (style === 'Bold' ? 'Bold' : 'SemiBold') : W(style) };
    t.fontSize = size;
    t.fills = solid(color, opts.opacity !== undefined ? opts.opacity : 1);
    if (opts.width) { t.textAutoResize = 'HEIGHT'; t.resize(opts.width, 100); }
    if (opts.lineHeight) t.lineHeight = { unit: 'PIXELS', value: opts.lineHeight };
    if (opts.letterSpacing) t.letterSpacing = { unit: 'PERCENT', value: opts.letterSpacing };
    if (opts.align) t.textAlignHorizontal = opts.align;
    if (opts.textCase) t.textCase = opts.textCase;
    if (opts.textDecoration) t.textDecoration = opts.textDecoration;
    t.characters = str;
    return t;
  }

  function makeCard(name, w, h, bg, radius, borderColor, borderO, bgO) {
    var f = makeFrame(name, w, h, bg, bgO !== undefined ? bgO : 1);
    f.cornerRadius = radius !== undefined ? radius : 12;
    if (borderColor) {
      f.strokes = [{ type: 'SOLID', color: borderColor, opacity: borderO !== undefined ? borderO : 1 }];
      f.strokeWeight = 1;
      f.strokeAlign = 'INSIDE';
    }
    return f;
  }

  function makeLabel(text, color, opacity) {
    return makeText(text, 20, 'Bold', color, {
      opacity: opacity !== undefined ? opacity : 1,
      letterSpacing: 18,
      textCase: 'UPPER',
    });
  }

  function makeGoldDivider() {
    var d = makeRect(48, 3, C.gold, 2);
    return d;
  }

  // ─── SCORE BAR ────────────────────────────────────────────────
  function makeScoreBar(parent, label, pct, x, y, w) {
    var lbl = makeText(label, 20, 'Medium', C.muted);
    at(lbl, x, y);
    parent.appendChild(lbl);

    var pctT = makeText(pct + '%', 20, 'Bold', C.gold);
    at(pctT, x + w - 48, y);
    parent.appendChild(pctT);

    var track = makeRect(w, 4, C.border, 2);
    at(track, x, y + 28);
    parent.appendChild(track);

    var fill = makeRect(Math.round(w * pct / 100), 4, C.gold, 2);
    at(fill, x, y + 28);
    parent.appendChild(fill);
  }

  // ═══════════════════════════════════════════════════════════════
  // PAGE 1 — LOGO OPTIONS
  // ═══════════════════════════════════════════════════════════════
  var logoPage = figma.createPage();
  logoPage.name = '🎨 Logo Options';

  var COL = 3;
  var CARD_W = 440;
  var CARD_H = 500;
  var CARD_GAP = 1;
  var GRID_W = COL * CARD_W + (COL - 1) * CARD_GAP;

  // ── Header ──────────────────────────────────────────────────
  var logoHeader = makeFrame('Header', GRID_W, 280, C.ink);
  at(logoHeader, 0, 0);

  // grid texture
  for (var gi = 0; gi < 22; gi++) {
    var gLine = makeRect(GRID_W, 1, C.gold, 0, 0.03);
    at(gLine, 0, gi * 60);
    logoHeader.appendChild(gLine);
  }

  var eyebrow = makeLabel('Creative Explorations · 2025', C.gold);
  at(eyebrow, 64, 64);
  logoHeader.appendChild(eyebrow);

  var hTitle = makeText('Logo Directions\nfor Enlista', 64, 'Black', C.white, { width: GRID_W - 128, lineHeight: 70 });
  // We can't do inline colour change easily in Figma API, so "Enlista" is in a separate text node
  at(hTitle, 64, 100);
  logoHeader.appendChild(hTitle);

  var hMeta = makeText('10 distinct creative directions — from typographic experiments to geometric marks.\nEach concept stands on a different idea about what Enlista means.', 24, 'Regular', C.warm, { width: 600, opacity: 0.45, lineHeight: 38 });
  at(hMeta, 64, 220);
  logoHeader.appendChild(hMeta);

  logoPage.appendChild(logoHeader);

  // ── 10 Logo Cards ────────────────────────────────────────────
  var logos = [
    {
      num: '01',
      title: 'Weight Contrast Slash',
      desc: 'Heavy "Enlist" meets a gold forward-slash and a feather-light italic "a". The slash reads as speed — cutting through the old process. Three weights, one word, no icon needed.',
      stageColor: C.ink,
      renderLogo: function(stage, sw) {
        var t1 = makeText('Enlist', 52, 'Black', C.white);
        var t2 = makeText('/', 52, 'Light', C.gold);
        var t3 = makeText('a', 52, 'Light', C.white, { opacity: 0.5 });
        var totalW = 160 + 20 + 28;
        var startX = (sw - totalW) / 2 - 10;
        at(t1, startX, 60);
        at(t2, startX + 158, 54);
        at(t3, startX + 176, 54);
        stage.appendChild(t1);
        stage.appendChild(t2);
        stage.appendChild(t3);
      },
    },
    {
      num: '02',
      title: 'Property Pin "i"',
      desc: 'The dot above the "i" becomes a gold location pin. One glyph swap communicates the entire product idea: real estate + digital publishing. Subtle until you see it — then it\'s all you see.',
      stageColor: C.mid,
      renderLogo: function(stage, sw) {
        // "En" text
        var t1 = makeText('En', 54, 'Black', C.white);
        at(t1, (sw - 240) / 2, 52);
        stage.appendChild(t1);
        // Pin circle (replacing i dot)
        var pin = makeRect(14, 14, C.gold, 7);
        at(pin, (sw - 240) / 2 + 84, 48);
        stage.appendChild(pin);
        // "ista" text (dotless i approximated with just position)
        var t2 = makeText('ista', 54, 'Black', C.white);
        at(t2, (sw - 240) / 2 + 76, 66);
        stage.appendChild(t2);
      },
    },
    {
      num: '03',
      title: 'Brutalist Stack',
      desc: 'Two-tier typographic architecture: "EN" at 80px weight 900 in gold, ruled off, "LISTA" in tracked small caps. Brutally confident. Looks like a Bloomberg terminal or a luxury auction house — both work for PropTech.',
      stageColor: C.mid,
      renderLogo: function(stage, sw) {
        var en = makeText('EN', 80, 'Black', C.gold);
        var rule = makeRect(80, 2, C.gold, 1, 0.5);
        var lista = makeText('L I S T A', 18, 'Regular', C.white, { opacity: 0.55, letterSpacing: 40 });
        at(en, (sw - 80) / 2, 28);
        at(rule, (sw - 80) / 2, 116);
        at(lista, (sw - 100) / 2, 126);
        stage.appendChild(en);
        stage.appendChild(rule);
        stage.appendChild(lista);
      },
    },
    {
      num: '04',
      title: 'Gold Reverse Block',
      desc: '"ENLISTA" in deep ink inside a gold pill-shaped block. Chanel stamp feel. Exceptional as a favicon, embossed card, or platform badge. Signals premium without saying it.',
      stageColor: C.card,
      renderLogo: function(stage, sw) {
        var pillW = 220;
        var pill = makeRect(pillW, 60, C.gold, 8);
        at(pill, (sw - pillW) / 2, 44);
        stage.appendChild(pill);
        var t = makeText('ENLISTA', 28, 'Black', C.ink, { letterSpacing: 2 });
        at(t, (sw - pillW) / 2 + 18, 58);
        stage.appendChild(t);
        var sub = makeText('Real Estate AI Platform', 18, 'Medium', C.white, { opacity: 0.3, letterSpacing: 28, textCase: 'UPPER' });
        at(sub, (sw - 220) / 2 - 4, 124);
        stage.appendChild(sub);
      },
    },
    {
      num: '05',
      title: 'Signal Fade (Staggered Weight)',
      desc: 'Each letter increases in weight and opacity from 200 to 800 — building to a full-strength "a". The metaphor: loading bar, signal strength, building to something complete.',
      stageColor: C.ink,
      renderLogo: function(stage, sw) {
        var letters = ['E', 'n', 'l', 'i', 's', 't', 'a'];
        var opacities = [0.25, 0.38, 0.52, 0.65, 0.78, 0.88, 1.0];
        var weights = ['Light', 'Light', 'Regular', 'Regular', 'Medium', 'Bold', 'Black'];
        var xPos = (sw - 220) / 2;
        letters.forEach(function(letter, i) {
          var lt = makeText(letter, 52, weights[i], C.gold, { opacity: opacities[i] });
          at(lt, xPos, 52);
          stage.appendChild(lt);
          xPos += 30;
        });
      },
    },
    {
      num: '06',
      title: 'Property Grid Mark',
      desc: 'A 3×3 grid of small squares forms the letter "E" — the first letter of Enlista. Simultaneously reads as a data dashboard, a listing grid, and the brand initial. The wordmark sits beside it.',
      stageColor: C.card,
      renderLogo: function(stage, sw) {
        // E-shaped grid: 3×3, cells on = top row, middle-left 2, bottom row
        var gridX = (sw - 200) / 2;
        var gridY = 44;
        var onCells = [[0,0],[1,0],[2,0], [0,1],[1,1], [0,2],[1,2],[2,2]];
        for (var row = 0; row < 3; row++) {
          for (var col = 0; col < 3; col++) {
            var isOn = false;
            for (var k = 0; k < onCells.length; k++) {
              if (onCells[k][0] === col && onCells[k][1] === row) { isOn = true; break; }
            }
            var cell = makeRect(14, 14, C.gold, 3, isOn ? 1.0 : 0.18);
            at(cell, gridX + col * 18, gridY + row * 18);
            stage.appendChild(cell);
          }
        }
        var t1 = makeText('Enlist', 40, 'Black', C.white);
        var t2 = makeText('a', 40, 'Black', C.gold);
        at(t1, gridX + 64, gridY + 4);
        at(t2, gridX + 64 + 114, gridY + 4);
        stage.appendChild(t1);
        stage.appendChild(t2);
      },
    },
    {
      num: '07',
      title: 'Diamond Accent Mark',
      desc: 'A rotated square mark — simultaneously a compass rose, a gemstone, a portal frame, and a certificate seal. Pairs with a clean wordmark for maximum versatility across print and digital.',
      stageColor: C.ink,
      renderLogo: function(stage, sw) {
        // Outer diamond (rotated square)
        var dOuter = makeRect(40, 40, C.white, 0);
        dOuter.fills = [];
        dOuter.strokes = solid(C.gold, 0.9);
        dOuter.strokeWeight = 2;
        dOuter.rotation = 45;
        at(dOuter, (sw - 200) / 2 + 6, 46);
        stage.appendChild(dOuter);

        // Inner diamond
        var dInner = makeRect(26, 26, C.white, 0);
        dInner.fills = [];
        dInner.strokes = solid(C.gold, 0.3);
        dInner.strokeWeight = 1;
        dInner.rotation = 45;
        at(dInner, (sw - 200) / 2 + 13, 53);
        stage.appendChild(dInner);

        // E lines inside
        var e1 = makeRect(16, 2, C.gold, 1);
        var e2 = makeRect(12, 2, C.gold, 1);
        var e3 = makeRect(16, 2, C.gold, 1);
        at(e1, (sw - 200) / 2 + 14, 55);
        at(e2, (sw - 200) / 2 + 14, 63);
        at(e3, (sw - 200) / 2 + 14, 71);
        stage.appendChild(e1);
        stage.appendChild(e2);
        stage.appendChild(e3);

        var t = makeText('Enlista', 36, 'Black', C.white);
        at(t, (sw - 200) / 2 + 68, 52);
        stage.appendChild(t);

        var tag = makeText('Real Estate AI · UAE', 18, 'Medium', C.gold, { opacity: 0.5, letterSpacing: 20, textCase: 'UPPER' });
        at(tag, (sw - 200) / 2 + 68, 100);
        stage.appendChild(tag);
      },
    },
    {
      num: '08',
      title: 'Split-Rule Bilingual',
      desc: 'English and Arabic separated by a gold rule — neither language is primary. The bilingual DNA of the product made structural. Speaks directly to a UAE market where both languages are equal.',
      stageColor: C.card,
      renderLogo: function(stage, sw) {
        var tEN = makeText('Enlista', 36, 'Black', C.white);
        at(tEN, (sw - 300) / 2, 60);
        stage.appendChild(tEN);

        var rule = makeRect(2, 46, C.gold, 1, 0.5);
        at(rule, (sw - 300) / 2 + 138, 54);
        stage.appendChild(rule);

        var tAR = makeText('إنليستا', 32, 'Bold', C.gold, { arabic: true, opacity: 0.6 });
        at(tAR, (sw - 300) / 2 + 160, 62);
        stage.appendChild(tAR);
      },
    },
    {
      num: '09',
      title: 'Kinetic Arc (Portal Signal)',
      desc: 'Three concentric quarter-arcs above the wordmark — reads instantly as WiFi/broadcast, representing "sync to all portals". The signal fades to reinforce the transmission concept.',
      stageColor: C.ink,
      renderLogo: function(stage, sw) {
        // Approximate arcs with ellipse strokes (quarter visible due to clipping)
        var cx = sw / 2;
        var opacities = [0.9, 0.55, 0.25];
        var sizes = [54, 34, 18];
        sizes.forEach(function(size, i) {
          var arc = figma.createEllipse();
          arc.resize(size * 2, size * 2);
          arc.fills = [];
          arc.strokes = solid(C.gold, opacities[i]);
          arc.strokeWeight = 2.2;
          arc.arcData = { startingAngle: 0, endingAngle: Math.PI, innerRadius: 0 };
          at(arc, cx - size, 28 + (54 - size));
          stage.appendChild(arc);
        });

        var t = makeText('Enlist', 40, 'Black', C.white);
        var ta = makeText('a', 40, 'Black', C.gold);
        at(t, cx - 100, 94);
        at(ta, cx - 100 + 113, 94);
        stage.appendChild(t);
        stage.appendChild(ta);
      },
    },
    {
      num: '10',
      title: 'Halftone Field',
      desc: 'The wordmark sits over a gold halftone dot pattern that fades left to right. Editorial, magazine-grade. Speaks to precision and data — the same energy as a Bloomberg data terminal or an FT weekend magazine.',
      stageColor: rgb('#000000'),
      renderLogo: function(stage, sw) {
        // Halftone dots (simplified grid)
        var STAGE_H = 160;
        for (var dRow = 0; dRow < 14; dRow++) {
          for (var dCol = 0; dCol < 32; dCol++) {
            var fade = (dCol / 32);
            if (fade < 0.1) continue;
            var dot = makeRect(3, 3, C.gold, 2, Math.min(fade * 0.6, 0.35));
            at(dot, dCol * 12 + 8, dRow * 12 + 8);
            stage.appendChild(dot);
          }
        }
        var t = makeText('Enlista', 52, 'Black', C.gold);
        at(t, 24, 44);
        stage.appendChild(t);
        var sub = makeText('Property AI Platform', 18, 'Medium', C.gold, { letterSpacing: 24, textCase: 'UPPER' });
        at(sub, 24, 112);
        stage.appendChild(sub);
      },
    },
  ];

  logos.forEach(function(logo, i) {
    var col = i % COL;
    var row = Math.floor(i / COL);
    var cx = col * (CARD_W + CARD_GAP);
    var cy = 280 + row * (CARD_H + CARD_GAP);

    var card = makeFrame('Logo ' + logo.num + ' — ' + logo.title, CARD_W, CARD_H, C.card);
    at(card, cx, cy);

    // Card number
    var numT = makeText('Option ' + logo.num, 18, 'Bold', C.gold, { opacity: 0.4, letterSpacing: 20, textCase: 'UPPER' });
    at(numT, 40, 36);
    card.appendChild(numT);

    // Stage frame
    var STAGE_W = CARD_W - 80;
    var STAGE_H = 160;
    var stage = makeFrame('Stage', STAGE_W, STAGE_H, logo.stageColor);
    stage.cornerRadius = 12;
    at(stage, 40, 70);
    card.appendChild(stage);

    // Render the logo inside the stage
    logo.renderLogo(stage, STAGE_W);

    // Title
    var titleT = makeText(logo.title, 24, 'Bold', C.warm);
    at(titleT, 40, 256);
    card.appendChild(titleT);

    // Divider
    var div = makeRect(32, 2, C.gold, 1, 0.4);
    at(div, 40, 290);
    card.appendChild(div);

    // Description
    var descT = makeText(logo.desc, 19, 'Regular', C.warm, { width: CARD_W - 80, opacity: 0.3, lineHeight: 32 });
    at(descT, 40, 306);
    card.appendChild(descT);

    logoPage.appendChild(card);
  });

  // Footer
  var logoFooter = makeFrame('Footer', GRID_W, 80, C.ink);
  at(logoFooter, 0, 280 + Math.ceil(logos.length / COL) * (CARD_H + CARD_GAP));
  var footerT = makeText('Enlista Brand Identity  ·  Creative Explorations  ·  2025  ·  Confidential', 20, 'Regular', C.warm, { opacity: 0.18 });
  at(footerT, 64, 28);
  logoFooter.appendChild(footerT);
  logoPage.appendChild(logoFooter);

  // ═══════════════════════════════════════════════════════════════
  // PAGE 2 — BRAND STRATEGY
  // ═══════════════════════════════════════════════════════════════
  var stratPage = figma.createPage();
  stratPage.name = '📋 Brand Strategy';

  var SW = 1440;  // strategy page width
  var PAD = 80;
  var yPos = 0;

  // ── SECTION: COVER ──────────────────────────────────────────
  var cover = makeFrame('Cover', SW, 860, C.ink);
  at(cover, 0, yPos); yPos += 860 + 2;

  // Grid texture
  for (var gi2 = 0; gi2 < 16; gi2++) {
    var gL = makeRect(SW, 1, C.gold, 0, 0.04);
    at(gL, 0, gi2 * 60);
    cover.appendChild(gL);
    var gV = makeRect(1, 860, C.gold, 0, 0.04);
    at(gV, gi2 * 60, 0);
    cover.appendChild(gV);
  }
  // Decorative circles
  var c1 = makeEllipse(700, 700, C.gold, 0.08);
  at(c1, SW - 500, -200);
  cover.appendChild(c1);
  var c2 = makeEllipse(500, 500, C.gold, 0.12);
  at(c2, SW - 400, -100);
  cover.appendChild(c2);

  var cEye = makeLabel('Go-To-Market Brand Strategy', C.gold);
  at(cEye, PAD, 580);
  cover.appendChild(cEye);

  var cTitle = makeText('Brand Identity\n& GTM Playbook', 80, 'Black', C.white, { width: SW - PAD * 2, lineHeight: 88 });
  at(cTitle, PAD, 630);
  cover.appendChild(cTitle);

  var cSub = makeText('A complete brand strategy for the UAE\'s leading AI-powered property listing platform — from naming and visual identity to messaging architecture and market positioning.', 28, 'Light', C.white, { width: 640, opacity: 0.5, lineHeight: 48 });
  at(cSub, PAD, 762);
  cover.appendChild(cSub);

  // Meta row
  var metaItems = [
    { label: 'Prepared', value: 'March 2025' },
    { label: 'Market', value: 'UAE PropTech' },
    { label: 'Category', value: 'AI SaaS · B2B' },
  ];
  var mx = PAD;
  metaItems.forEach(function(m) {
    var ml = makeText(m.label, 18, 'Medium', C.white, { opacity: 0.35, letterSpacing: 10, textCase: 'UPPER' });
    var mv = makeText(m.value, 18, 'Bold', C.white);
    at(ml, mx, 816);
    at(mv, mx, 840);
    cover.appendChild(ml);
    cover.appendChild(mv);
    mx += 220;
  });

  stratPage.appendChild(cover);

  // ── HELPER: SECTION HEADER ────────────────────────────────────
  function addSectionHeader(parent, label, title, subtitle, bgColor, yOff) {
    var lbl = makeLabel(label, C.gold);
    at(lbl, PAD, yOff + 64);
    parent.appendChild(lbl);

    var div = makeGoldDivider();
    at(div, PAD, yOff + 96);
    parent.appendChild(div);

    var ttl = makeText(title, 52, 'Black', bgColor === C.ink ? C.white : C.ink, { width: SW - PAD * 2, lineHeight: 64 });
    at(ttl, PAD, yOff + 110);
    parent.appendChild(ttl);

    if (subtitle) {
      var ttlH = 64 * (title.split('\n').length);
      var sub = makeText(subtitle, 26, 'Regular', C.muted, { width: 680, lineHeight: 42 });
      at(sub, PAD, yOff + 110 + ttlH + 16);
      parent.appendChild(sub);
    }
  }

  // ── SECTION: BRAND AUDIT ──────────────────────────────────────
  var auditH = 720;
  var audit = makeFrame('Brand Audit', SW, auditH, C.warm);
  at(audit, 0, yPos); yPos += auditH + 2;

  addSectionHeader(audit, 'Brand Audit', 'What\'s working.\nWhat isn\'t.', 'The product is genuinely strong — the brand hasn\'t caught up. Here\'s an honest assessment of where the current identity stands.', C.warm, 0);

  // Strengths card
  var colW = (SW - PAD * 2 - 24) / 2;
  var sCard = makeCard('Strengths', colW, 360, C.white, 12, C.success, 1, 1);
  sCard.strokes = [{ type: 'SOLID', color: C.success }];
  sCard.strokeWeight = 3;
  sCard.strokeAlign = 'INSIDE';
  // Top border accent
  var sAccent = makeRect(colW, 3, C.success);
  at(sAccent, 0, 0);
  sCard.appendChild(sAccent);
  at(sCard, PAD, 340);
  audit.appendChild(sCard);

  var sTitle = makeText('✓  Strengths to Build On', 26, 'Bold', C.ink);
  at(sTitle, 28, 24);
  sCard.appendChild(sTitle);

  var strengths = [
    '💪  840 agencies, 124K listings, <4 min publish — credible and compelling proof points',
    '📊  Satoshi at weight 800 reads with authority across all headings',
    '🏗  Bento card grid UI is on-trend, positions this as a modern platform',
    '🤝  Real testimonials with measurable outcomes ("720× improvement")',
    '📋  RERA compliance as a core feature is a genuine market differentiator',
    '🌐  Bilingual EN/AR is a structural advantage no Western tool can replicate',
  ];
  strengths.forEach(function(s, i) {
    var t = makeText(s, 21, 'Regular', C.muted, { width: colW - 56, lineHeight: 34 });
    at(t, 28, 60 + i * 46);
    sCard.appendChild(t);
  });

  // Problems card
  var pCard = makeCard('Problems', colW, 360, C.white, 12);
  pCard.strokes = [{ type: 'SOLID', color: C.danger }];
  pCard.strokeWeight = 3;
  pCard.strokeAlign = 'INSIDE';
  var pAccent = makeRect(colW, 3, C.danger);
  at(pAccent, 0, 0);
  pCard.appendChild(pAccent);
  at(pCard, PAD + colW + 24, 340);
  audit.appendChild(pCard);

  var pTitle = makeText('✗  Problems to Fix', 26, 'Bold', C.ink);
  at(pTitle, 28, 24);
  pCard.appendChild(pTitle);

  var problems = [
    '🏷  Name confusion: "ListingAI" and "ListingsLaunch" both appear — generic, untrademark-able',
    '🎨  Primary blue (#1D4ED8) is identical to thousands of SaaS products — zero differentiation',
    '✍️  Hero copy "moves the needle" is generic B2B — could describe any software product',
    '🇦🇪  No Arabic cultural resonance despite a majority-Arabic speaking customer base',
    '💎  No prestige element — the product serves luxury real estate; the brand doesn\'t',
    '📄  Near-empty footer misses credibility and trust-building opportunity',
  ];
  problems.forEach(function(p, i) {
    var t = makeText(p, 21, 'Regular', C.muted, { width: colW - 56, lineHeight: 34 });
    at(t, 28, 60 + i * 46);
    pCard.appendChild(t);
  });

  stratPage.appendChild(audit);

  // ── SECTION: NAME OPTIONS ─────────────────────────────────────
  var namesH = 1200;
  var names = makeFrame('Name Options', SW, namesH, C.white);
  at(names, 0, yPos); yPos += namesH + 2;

  addSectionHeader(names, 'Name Options', 'Five names.\nOne clear winner.', 'Each name evaluated on Arabic resonance, global scalability, memorability, trademark risk, category signal, and premium feel.', C.white, 0);

  var nameData = [
    {
      name: 'Enlista', tag: '★  Recommended', rank: 'Option 01 / Primary Pick',
      pron: 'lis·TAR·ah', meaning: 'Listing + "-ara" (elegant Arabic/Mediterranean suffix)',
      tagline: 'From details to live. In minutes.',
      desc: 'The best balance of cultural resonance, category clarity, and premium feel. Arabic speakers feel the "-ara" ending as natural and elegant. English speakers immediately connect "list" to the product category. Fully coined — strong trademark position.',
      scores: [{ l: 'Arabic resonance', v: 90 }, { l: 'Memorability', v: 85 }, { l: 'Premium feel', v: 80 }, { l: 'Trademark safety', v: 95 }],
      url: 'enlista.ai · enlista.com', highlight: true,
    },
    {
      name: 'Arkan', tag: 'Arabic-First', rank: 'Option 02 / Arabic-First',
      pron: 'ar·KAN — أركان', meaning: 'Arabic: "Pillars" or "Foundations"',
      tagline: 'The foundation your listings deserve.',
      desc: 'Deeply authentic to the UAE market. The word carries weight, dignity, and a real estate connotation (building foundations). Best choice if strategy is UAE-first, Arabic-first.',
      scores: [{ l: 'Arabic resonance', v: 98 }, { l: 'Premium feel', v: 92 }, { l: 'Global scalability', v: 55 }, { l: 'Category signal', v: 60 }],
      url: 'arkan.ai',
    },
    {
      name: 'PortIQ', tag: 'Feature-Led', rank: 'Option 03 / Feature-Led',
      pron: 'PORT·iq', meaning: 'Portal + IQ (intelligence)',
      tagline: 'Every portal. One intelligence.',
      desc: 'Directly encodes the core mechanic (multi-portal sync) and the AI layer. Short, crisp, two syllables — natural to say: "We\'re on PortIQ."',
      scores: [{ l: 'Category signal', v: 95 }, { l: 'Memorability', v: 90 }, { l: 'Premium feel', v: 62 }, { l: 'Global scalability', v: 85 }],
      url: 'portiq.ai',
    },
    {
      name: 'Relio', tag: 'International', rank: 'Option 04 / International',
      pron: 'REE·lee·oh', meaning: 'Real estate + "-io" (action, flow)',
      tagline: 'Property intelligence. Published.',
      desc: 'Unique enough to be fully ownable. Flows naturally in both English and Arabic. Most scalable option for markets beyond UAE.',
      scores: [{ l: 'Trademark safety', v: 98 }, { l: 'Global scalability', v: 95 }, { l: 'Category signal', v: 55 }, { l: 'Arabic resonance', v: 72 }],
      url: 'relio.ai · useRelio.com',
    },
    {
      name: 'PropLab', tag: 'Functional', rank: 'Option 05 / Functional',
      pron: 'PROP·lab', meaning: 'Property + Lab (innovation)',
      tagline: 'Where listings get built.',
      desc: 'Immediately communicates real estate + technology. Lowest naming risk. However, "Lab" feels experimental rather than enterprise and doesn\'t scale well beyond listings.',
      scores: [{ l: 'Category clarity', v: 92 }, { l: 'Simplicity', v: 88 }, { l: 'Premium feel', v: 52 }, { l: 'Brand ceiling', v: 48 }],
      url: 'proplab.ai',
    },
  ];

  var nCardW = 240;
  var nCardH = 420;
  var nGap = 24;
  var totalNW = nameData.length * nCardW + (nameData.length - 1) * nGap;
  var nStartX = (SW - totalNW) / 2;

  nameData.forEach(function(nd, i) {
    var nc = makeCard(nd.name, nCardW, nCardH, C.white, 16,
      nd.highlight ? C.gold : C.border, 1, 1);
    if (nd.highlight) {
      nc.strokes = [{ type: 'SOLID', color: C.gold }];
      nc.strokeWeight = 2;
      nc.strokeAlign = 'INSIDE';
    }
    at(nc, nStartX + i * (nCardW + nGap), 320);
    names.appendChild(nc);

    if (nd.highlight) {
      var badge = makeRect(160, 36, C.gold, 18);
      at(badge, (nCardW - 160) / 2, -18);
      nc.appendChild(badge);
      var badgeT = makeText('★  Recommended', 18, 'Bold', C.ink);
      at(badgeT, (nCardW - 160) / 2 + 12, -12);
      nc.appendChild(badgeT);
    }

    var rankT = makeText(nd.rank, 18, 'Bold', C.muted, { letterSpacing: 5, textCase: 'UPPER' });
    at(rankT, 20, 18);
    nc.appendChild(rankT);

    var nameT = makeText(nd.name, 44, 'Black', C.ink);
    at(nameT, 20, 44);
    nc.appendChild(nameT);

    var pronT = makeText(nd.pron, 20, 'Regular', C.muted, { opacity: 0.7 });
    at(pronT, 20, 100);
    nc.appendChild(pronT);

    var divN = makeRect(32, 2, C.gold, 1, 0.5);
    at(divN, 20, 126);
    nc.appendChild(divN);

    var taglineT = makeText('"' + nd.tagline + '"', 22, 'Bold', C.ink, { width: nCardW - 40, lineHeight: 34 });
    at(taglineT, 20, 140);
    nc.appendChild(taglineT);

    nd.scores.forEach(function(sc, si) {
      makeScoreBar(nc, sc.l, sc.v, 20, 220 + si * 44, nCardW - 40);
    });

    var urlT = makeText(nd.url, 18, 'Medium', C.gold, { width: nCardW - 40 });
    at(urlT, 20, 402);
    nc.appendChild(urlT);
  });

  stratPage.appendChild(names);

  // ── SECTION: TAGLINES ─────────────────────────────────────────
  var taglinesH = 760;
  var taglines = makeFrame('Taglines', SW, taglinesH, C.warm);
  at(taglines, 0, yPos); yPos += taglinesH + 2;

  addSectionHeader(taglines, 'Tagline Options', 'The lines that do\nthe heavy lifting.', 'A tagline must communicate the transformation, not the feature. The best options below turn the product\'s core mechanic into a memorable promise.', C.warm, 0);

  // Top recommendation (full width dark card)
  var topRec = makeCard('Top Recommendation', SW - PAD * 2, 140, C.ink, 16);
  at(topRec, PAD, 340);
  taglines.appendChild(topRec);

  var topTier = makeLabel('★  Top Recommendation', C.gold);
  at(topTier, 32, 24);
  topRec.appendChild(topTier);

  var topTagT = makeText('From details to live. In minutes.', 36, 'Bold', C.white);
  at(topTagT, 32, 58);
  topRec.appendChild(topTagT);

  var topWhy = makeText('Communicates the full workflow in 6 words. "Details" = filling the form. "Live" = published across portals. "Minutes" = the speed claim. Pairs perfectly with Enlista.', 22, 'Regular', C.white, { width: SW - PAD * 2 - 64, opacity: 0.45, lineHeight: 36 });
  at(topWhy, 32, 102);
  topRec.appendChild(topWhy);

  var tlData = [
    { tier: 'Strong Alternative', text: 'List once. Land everywhere.', why: 'Multi-portal sync in 5 words. "Land" carries a real estate double meaning — land the deal, land on every portal.', pairing: 'Best paired with: PortIQ · PropLab' },
    { tier: 'Strong Alternative', text: 'The listing OS for UAE real estate.', why: '"OS" positions the product as infrastructure — everything runs through it. Appeals to agency owners who think in systems.', pairing: 'Best paired with: Arkan · Relio' },
    { tier: 'Bilingual-Led', text: 'Bilingual. Beautiful. Live in 4 minutes.', why: 'Hits all three USPs. "Bilingual" signals UAE market knowledge. "4 minutes" is specific, credible, and differentiated.', pairing: 'Best paired with: Enlista' },
    { tier: 'Emotional', text: 'Stop writing listings. Start closing deals.', why: 'Pain-to-outcome format. Speaks directly to the broker\'s actual goal. Better as an ad headline than a permanent tagline.', pairing: 'Best for: Ad copy, landing pages' },
  ];

  var tlCardW = (SW - PAD * 2 - 24) / 2;
  tlData.forEach(function(tl, i) {
    var tlCol = i % 2;
    var tlRow = Math.floor(i / 2);
    var tc = makeCard(tl.tier, tlCardW, 176, C.white, 12, C.border, 1, 1);
    at(tc, PAD + tlCol * (tlCardW + 24), 504 + tlRow * (176 + 16));
    taglines.appendChild(tc);

    var tierT = makeLabel(tl.tier, C.gold);
    at(tierT, 24, 20);
    tc.appendChild(tierT);

    var tlText = makeText(tl.text, 28, 'Bold', C.ink, { width: tlCardW - 48 });
    at(tlText, 24, 50);
    tc.appendChild(tlText);

    var tlWhy = makeText(tl.why, 21, 'Regular', C.muted, { width: tlCardW - 48, lineHeight: 34 });
    at(tlWhy, 24, 88);
    tc.appendChild(tlWhy);

    var tlPair = makeText(tl.pairing, 20, 'Bold', C.gold);
    at(tlPair, 24, 146);
    tc.appendChild(tlPair);
  });

  stratPage.appendChild(taglines);

  // ── SECTION: VISUAL IDENTITY ──────────────────────────────────
  var identityH = 760;
  var identity = makeFrame('Visual Identity', SW, identityH, C.white);
  at(identity, 0, yPos); yPos += identityH + 2;

  addSectionHeader(identity, 'Visual Identity', 'Color, type, and feel.', null, C.white, 0);

  // Colour swatches
  var swatches = [
    { hex: '#0E1F38', name: 'Deep Ink', role: 'Primary · Text · Headings', light: false },
    { hex: '#C9A452', name: 'Desert Gold', role: 'Accent · CTAs · Highlights', light: false },
    { hex: '#F8F5F0', name: 'Warm White', role: 'Page Background', light: true },
    { hex: '#FFFFFF', name: 'Cloud', role: 'Card Surfaces', light: true },
    { hex: '#2D8A6E', name: 'Sage', role: 'Published · Live · Success', light: false },
    { hex: '#64748B', name: 'Slate', role: 'Secondary Text', light: false },
  ];

  var swatchW = (SW - PAD * 2 - 5 * 16) / 6;
  swatches.forEach(function(sw2, i) {
    var sc = makeCard('Swatch: ' + sw2.name, swatchW, 160, rgb(sw2.hex), 12, sw2.light ? C.border : null, 1, 1);
    at(sc, PAD + i * (swatchW + 16), 260);
    identity.appendChild(sc);

    var textCol = sw2.light ? C.ink : C.white;
    var hexT = makeText(sw2.hex, 22, 'Bold', textCol);
    at(hexT, 16, 80);
    sc.appendChild(hexT);

    var nameT2 = makeText(sw2.name, 20, 'Bold', textCol);
    at(nameT2, 16, 110);
    sc.appendChild(nameT2);

    var roleT = makeText(sw2.role, 18, 'Regular', textCol, { opacity: 0.6 });
    at(roleT, 16, 132);
    sc.appendChild(roleT);
  });

  // Why Desert Gold
  var goldNote = makeCard('Why Desert Gold', SW - PAD * 2, 120, C.warm, 12);
  at(goldNote, PAD, 448);
  identity.appendChild(goldNote);

  var goldLbl = makeLabel('Why Desert Gold?', C.muted);
  at(goldLbl, 28, 24);
  goldNote.appendChild(goldLbl);

  var goldT = makeText('Gold is culturally significant across the UAE and MENA — prestige, achievement, and luxury. Every competitor uses blue or teal. Desert Gold creates instant visual differentiation while being perfectly appropriate for a product serving agencies that sell AED 5M+ properties.', 23, 'Regular', C.muted, { width: SW - PAD * 2 - 56, lineHeight: 38 });
  at(goldT, 28, 52);
  goldNote.appendChild(goldT);

  // Typography showcase
  var typoCard = makeCard('Typography', SW - PAD * 2, 164, C.ink, 16);
  at(typoCard, PAD, 588);
  identity.appendChild(typoCard);

  var typoLbl = makeLabel('Display · ' + FONT + ' Black · -0.04em tracking', C.white, 0.3);
  at(typoLbl, 32, 24);
  typoCard.appendChild(typoLbl);

  var typoSample = makeText('Listing AI.\nFluent in both.', 56, 'Black', C.white, { lineHeight: 64 });
  at(typoSample, 32, 52);
  typoCard.appendChild(typoSample);

  var typoAr = makeText('من التفاصيل إلى النشر. في دقائق.', 40, 'Bold', C.gold, { arabic: true, align: 'RIGHT', width: 560 });
  at(typoAr, SW - PAD * 2 - 560 - 32, 60);
  typoCard.appendChild(typoAr);

  stratPage.appendChild(identity);

  // ── SECTION: MESSAGING ARCHITECTURE ──────────────────────────
  var msgH = 640;
  var msg = makeFrame('Messaging Architecture', SW, msgH, C.warm);
  at(msg, 0, yPos); yPos += msgH + 2;

  addSectionHeader(msg, 'Messaging Architecture', 'What to say.\nHow to say it.', null, C.warm, 0);

  // Proof points
  var ppData = [
    { num: '840', lbl: 'Active agencies' },
    { num: '124K+', lbl: 'Listings managed' },
    { num: '<4 min', lbl: 'Avg. publish time' },
    { num: '99.9%', lbl: 'Portal uptime' },
  ];
  var ppW = (SW - PAD * 2 - 3 * 24) / 4;
  ppData.forEach(function(pp, i) {
    var pc = makeCard(pp.lbl, ppW, 100, C.white, 12, C.border, 1, 1);
    at(pc, PAD + i * (ppW + 24), 260);
    msg.appendChild(pc);
    var numT2 = makeText(pp.num, 40, 'Black', C.gold);
    at(numT2, 24, 18);
    pc.appendChild(numT2);
    var lblT = makeText(pp.lbl, 22, 'Medium', C.muted);
    at(lblT, 24, 66);
    pc.appendChild(lblT);
  });

  // Messaging tiers
  var tierData = [
    { tier: 'Tier 1 — Primary Claim · Hero, Ads Headline', copy: 'From details to live. In minutes.', note: 'The single most important message. Use everywhere a prospect sees the brand for the first time.', size: 40 },
    { tier: 'Tier 2 — Supporting Claims · Subheads, Feature Sections', copy: 'Bilingual EN/AR copy that sounds written by a human expert\nOne-click sync to all UAE portals\nCompliance built in — no suspensions\nLead scoring that tells you who to call first', note: null, size: 28 },
    { tier: 'Tier 3 — Proof Points · Testimonials, Case Studies', copy: '"2 days to 4 minutes — that\'s 720×."\n"3× conversion rate on Palm Jumeirah listings."\n"Zero RERA suspensions. The most reliable system in our operation."', note: null, size: 26 },
  ];

  var tierW = (SW - PAD * 2 - 2 * 24) / 3;
  tierData.forEach(function(td, i) {
    var tc2 = makeCard('Tier ' + (i + 1), tierW, 200, C.ink, 16);
    at(tc2, PAD + i * (tierW + 24), 388);
    msg.appendChild(tc2);

    var tierLbl = makeLabel(td.tier, C.gold, 0.8);
    at(tierLbl, 24, 20);
    tc2.appendChild(tierLbl);

    var copyT = makeText(td.copy, td.size, 'Bold', C.white, { width: tierW - 48, lineHeight: td.size * 1.4 });
    at(copyT, 24, 52);
    tc2.appendChild(copyT);
  });

  stratPage.appendChild(msg);

  // ── SECTION: OBJECTION HANDLING ───────────────────────────────
  var objH = 800;
  var obj = makeFrame('Objection Handling', SW, objH, C.white);
  at(obj, 0, yPos); yPos += objH + 2;

  addSectionHeader(obj, 'Objection Handling', 'Every pushback.\nPre-answered.', 'Train every sales conversation around these objection-response pairs. These cover 90% of buyer hesitations in the UAE real estate market.', C.white, 0);

  var objData = [
    { q: '"We already have a copywriter for listings."', a: 'Your copywriter can\'t publish to 3 portals simultaneously in 4 minutes or generate fluent Arabic. Enlista doesn\'t replace talent — it removes drudgery so your writer focuses on narrative, not filling in bedroom counts across three backends.' },
    { q: '"The Arabic output won\'t sound right."', a: 'Our Arabic generation uses Classical Arabic with UAE property context — reviewed by native-speaking real estate professionals. Most agencies edit less than 10% of the Arabic copy generated.' },
    { q: '"We already sync portals manually — it\'s fine."', a: 'Manual sync means one portal goes live 2 hours after another. In a competitive enquiry window, you\'re losing leads to whoever listed first. Speed to live is a genuine commercial advantage.' },
    { q: '"RERA compliance is our admin team\'s job."', a: 'Your admin team misses a DLD permit check at 11pm. Enlista never does. One suspension costs more in time and fees than a full year of the Professional subscription.' },
    { q: '"799 AED is too expensive."', a: '799 AED is 15 minutes of one agent\'s commission on a single deal. If the platform saves 4 hours per listing and you list 20 properties a month, you\'ve recovered 80 hours. The ROI calculation isn\'t close.' },
  ];

  var oColW = (SW - PAD * 2 - 16) / 2;
  objData.forEach(function(o, i) {
    var row = Math.floor(i / 2);
    var col = i % 2;
    var yOffset = 340 + row * 188;
    var xOffset = PAD + col * (oColW + 16);

    var qCard2 = makeCard('Q', oColW, 80, C.red50, 10);
    qCard2.strokes = [{ type: 'SOLID', color: C.danger, opacity: 0.3 }];
    qCard2.strokeWeight = 0;
    // Left border
    var qBorder = makeRect(3, 80, C.danger);
    at(qBorder, 0, 0);
    qCard2.appendChild(qBorder);
    at(qCard2, xOffset, yOffset);
    obj.appendChild(qCard2);

    var qT = makeText(o.q, 23, 'Bold', C.danger, { width: oColW - 32 });
    at(qT, 20, 18);
    qCard2.appendChild(qT);

    var aCard = makeCard('A', oColW, 88, C.green50, 10);
    var aBorder = makeRect(3, 88, C.success);
    at(aBorder, 0, 0);
    aCard.appendChild(aBorder);
    at(aCard, xOffset, yOffset + 82);
    obj.appendChild(aCard);

    var aT = makeText(o.a, 22, 'Regular', C.muted, { width: oColW - 32, lineHeight: 36 });
    at(aT, 20, 14);
    aCard.appendChild(aT);
  });

  stratPage.appendChild(obj);

  // ── SECTION: TARGET AUDIENCES ─────────────────────────────────
  var persH = 700;
  var pers = makeFrame('Target Audiences', SW, persH, C.warm);
  at(pers, 0, yPos); yPos += persH + 2;

  addSectionHeader(pers, 'Target Audiences', 'Three buyers.\nOne platform.', 'Each persona has a distinct pain, communication style, and decision-making trigger. Primary budget directed at the Operations Manager.', C.warm, 0);

  var personaData = [
    {
      initials: 'OM', avatarBg: C.gold, name: 'The Operations Manager',
      role: 'Primary Buyer — 60% of budget',
      stats: [{ l: 'Age', v: '30–45' }, { l: 'Agency size', v: '5–50 agents' }],
      pain: 'Managing 50–300+ listings across portals. Constant re-keying. RERA suspension anxiety. Spends 2+ days per listing on admin that shouldn\'t take 4 minutes.',
      goals: 'Reduce time-to-live, keep portals current, look professional to landlords, not get suspended.',
      tags: ['LinkedIn', 'Instagram', 'WhatsApp', 'Professional tier'],
    },
    {
      initials: 'IB', avatarBg: C.blue, name: 'The Independent Broker',
      role: 'Secondary Buyer — 30% of budget',
      stats: [{ l: 'Age', v: '25–38' }, { l: 'Team size', v: '1–5 agents' }],
      pain: 'Can\'t afford a dedicated listing coordinator. Loses deals to faster competitors. Wants to look as professional as large agencies without the overhead.',
      goals: 'Level the playing field. Close more deals without more admin. Look polished to every landlord and vendor.',
      tags: ['Instagram', 'TikTok', 'LinkedIn', 'Starter tier'],
    },
    {
      initials: 'MD', avatarBg: C.goldL, name: 'The Agency Principal',
      role: 'Tertiary Buyer — 10% · Enterprise',
      stats: [{ l: 'Age', v: '38–58' }, { l: 'Agency size', v: '50–500 agents' }],
      pain: 'Scaling the agency without proportionally growing back-office headcount. Compliance risk at scale. Revenue per agent declining.',
      goals: 'Revenue per agent up. Cost per listing down. Zero compliance risk. Scalable systems that don\'t depend on one person.',
      tags: ['LinkedIn', 'In-person demo', 'Enterprise tier'],
    },
  ];

  var pCardW = (SW - PAD * 2 - 2 * 24) / 3;
  personaData.forEach(function(p, i) {
    var pc2 = makeCard(p.name, pCardW, 400, C.ink, 20);
    at(pc2, PAD + i * (pCardW + 24), 300);
    pers.appendChild(pc2);

    // Avatar
    var avatar = makeRect(56, 56, p.avatarBg, 28);
    at(avatar, 28, 28);
    pc2.appendChild(avatar);
    var avT = makeText(p.initials, 24, 'Black', C.ink);
    at(avT, 28 + 12, 28 + 16);
    pc2.appendChild(avT);

    var nameT3 = makeText(p.name, 26, 'Bold', C.white, { width: pCardW - 56 });
    at(nameT3, 28, 96);
    pc2.appendChild(nameT3);

    var roleT2 = makeText(p.role, 20, 'Regular', C.white, { opacity: 0.5 });
    at(roleT2, 28, 130);
    pc2.appendChild(roleT2);

    var divP = makeRect(32, 2, C.gold, 1, 0.3);
    at(divP, 28, 160);
    pc2.appendChild(divP);

    var statX = 28;
    p.stats.forEach(function(s) {
      var sl = makeText(s.l, 18, 'Regular', C.white, { opacity: 0.4 });
      var sv = makeText(s.v, 20, 'Bold', C.white);
      at(sl, statX, 176);
      at(sv, statX, 198);
      pc2.appendChild(sl);
      pc2.appendChild(sv);
      statX += 160;
    });

    var painLbl = makeLabel('Core Pain', C.gold, 0.6);
    at(painLbl, 28, 232);
    pc2.appendChild(painLbl);

    var painT = makeText(p.pain, 22, 'Regular', C.white, { width: pCardW - 56, opacity: 0.5, lineHeight: 36 });
    at(painT, 28, 256);
    pc2.appendChild(painT);

    // Tags
    var tagX2 = 28;
    var tagY2 = 360;
    p.tags.forEach(function(tag) {
      var tagW2 = tag.length * 10 + 24;
      var tagBg2 = makeRect(tagW2, 32, C.gold, 16, 0.15);
      at(tagBg2, tagX2, tagY2);
      pc2.appendChild(tagBg2);
      var tagT2 = makeText(tag, 18, 'Bold', C.gold);
      at(tagT2, tagX2 + 10, tagY2 + 7);
      pc2.appendChild(tagT2);
      tagX2 += tagW2 + 8;
      if (tagX2 > pCardW - 60) { tagX2 = 28; tagY2 += 40; }
    });
  });

  stratPage.appendChild(pers);

  // ── FOOTER ───────────────────────────────────────────────────
  var footer = makeFrame('Footer', SW, 80, C.ink);
  at(footer, 0, yPos);

  var ftLogo = makeText('Enlista', 28, 'Black', C.white);
  at(ftLogo, PAD, 24);
  footer.appendChild(ftLogo);

  var ftCenter = makeText('Go-To-Market Brand Strategy · 2025', 22, 'Regular', C.white, { opacity: 0.35, align: 'CENTER', width: SW });
  at(ftCenter, 0, 28);
  footer.appendChild(ftCenter);

  var ftRight = makeText('Confidential — Internal Use', 22, 'Regular', C.white, { opacity: 0.35 });
  at(ftRight, SW - PAD - 260, 28);
  footer.appendChild(ftRight);

  stratPage.appendChild(footer);

  // ─── FINALISE ─────────────────────────────────────────────────
  figma.currentPage = logoPage;
  figma.viewport.scrollAndZoomIntoView(logoPage.children);
  figma.closePlugin('✅  Done — font: ' + FONT + '\n🎨 Logo Options: 10 cards\n📋 Brand Strategy: 8 sections');

})().catch(function(err) {
  figma.closePlugin('❌  Error: ' + err.message);
});
