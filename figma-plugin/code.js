// ═══════════════════════════════════════════════════════════════
// Enlista — Voice Feature Instagram Posts
// Figma Plugin — Run once to generate all editable frames
// Creates: Posts 21–23 + Carousel 21 (5 slides) + Carousel 22 (5 slides)
// Colour scheme matches the ListingAI app (blue primary, navy dark, cool gray)
// ═══════════════════════════════════════════════════════════════

(async function main() {

  // ─── FONTS ────────────────────────────────────────────────────
  // Try Plus Jakarta Sans (app font). Falls back to Inter if not installed.
  var FONT = 'Plus Jakarta Sans';
  try {
    await Promise.all([
      figma.loadFontAsync({ family: FONT, style: 'Regular' }),
      figma.loadFontAsync({ family: FONT, style: 'Medium' }),
      figma.loadFontAsync({ family: FONT, style: 'SemiBold' }),
      figma.loadFontAsync({ family: FONT, style: 'Bold' }),
      figma.loadFontAsync({ family: FONT, style: 'ExtraBold' }),
    ]);
  } catch (e) {
    FONT = 'Inter';
    await Promise.all([
      figma.loadFontAsync({ family: FONT, style: 'Regular' }),
      figma.loadFontAsync({ family: FONT, style: 'Medium' }),
      figma.loadFontAsync({ family: FONT, style: 'Semi Bold' }),
      figma.loadFontAsync({ family: FONT, style: 'Bold' }),
      figma.loadFontAsync({ family: FONT, style: 'Extra Bold' }),
    ]);
  }

  // Normalise weight name between the two fonts
  function W(w) {
    if (FONT === 'Inter') {
      if (w === 'SemiBold') return 'Semi Bold';
      if (w === 'ExtraBold') return 'Extra Bold';
    }
    return w;
  }

  // ─── COLOURS — ENLISTA BRAND PALETTE ─────────────────────────
  function rgb(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16) / 255,
      g: parseInt(hex.slice(3, 5), 16) / 255,
      b: parseInt(hex.slice(5, 7), 16) / 255,
    };
  }

  var C = {
    // Enlista brand colours (matching instagram-content.html + logo-options.html)
    dark:         rgb('#0E1F38'),  // dark navy — section backgrounds
    ink:          rgb('#0E1F38'),  // same dark for text contexts
    primary:      rgb('#C9A452'),  // gold — primary accent
    primaryLight: rgb('#E8C97A'),  // light gold
    primaryPale:  rgb('#F5EDD6'),  // very pale gold tint
    bg:           rgb('#F8F5F0'),  // warm cream — light backgrounds
    white:        rgb('#FFFFFF'),
    muted:        rgb('#64748B'),
    border:       rgb('#E2E4E9'),
    success:      rgb('#2D8A6E'),  // teal green
    warning:      rgb('#D97706'),
    // Danger / before-after helpers
    danger:       rgb('#DC2626'),
    red50:        rgb('#FFF5F5'),
    red200:       rgb('#FED7D7'),
    green50:      rgb('#F0FDF4'),
    green200:     rgb('#BBF7D0'),
    successLight: rgb('#4ADE80'),
  };

  // ─── HELPERS ──────────────────────────────────────────────────
  function solid(color, opacity) {
    return [{ type: 'SOLID', color: color, opacity: opacity !== undefined ? opacity : 1 }];
  }

  function at(node, x, y) {
    node.x = x;
    node.y = y;
    return node;
  }

  function makeFrame(name, w, h, bgColor, bgOpacity) {
    var f = figma.createFrame();
    f.name = name;
    f.resize(w, h);
    f.fills = bgColor ? solid(bgColor, bgOpacity !== undefined ? bgOpacity : 1) : [];
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

  function makeLine(w, h, color, opacity) {
    var r = figma.createRectangle();
    r.resize(w, h);
    r.fills = solid(color, opacity !== undefined ? opacity : 1);
    return r;
  }

  function makeText(str, size, style, color, opts) {
    opts = opts || {};
    var t = figma.createText();
    t.fontName = { family: FONT, style: W(style) };
    t.fontSize = size;
    t.fills = solid(color, opts.opacity !== undefined ? opts.opacity : 1);
    if (opts.width) {
      t.textAutoResize = 'HEIGHT';
      t.resize(opts.width, 100);
    }
    if (opts.lineHeight) t.lineHeight = { unit: 'PIXELS', value: opts.lineHeight };
    if (opts.letterSpacing) t.letterSpacing = { unit: 'PERCENT', value: opts.letterSpacing };
    if (opts.align) t.textAlignHorizontal = opts.align;
    if (opts.textCase) t.textCase = opts.textCase;
    t.characters = str;
    return t;
  }

  function makeLabel(text, color, opacity) {
    return makeText(text, 22, 'Bold', color, {
      opacity: opacity !== undefined ? opacity : 1,
      letterSpacing: 15,
      textCase: 'UPPER',
    });
  }

  function makeCard(name, w, h, bgColor, radius, borderColor, borderOpacity, bgOpacity) {
    var f = makeFrame(name, w, h, bgColor, bgOpacity !== undefined ? bgOpacity : 1);
    f.cornerRadius = radius !== undefined ? radius : 16;
    if (borderColor) {
      f.strokes = [{ type: 'SOLID', color: borderColor, opacity: borderOpacity !== undefined ? borderOpacity : 1 }];
      f.strokeWeight = 2;
      f.strokeAlign = 'INSIDE';
    }
    return f;
  }

  function makePill(text, bgColor, textColor, bgOpacity) {
    var approxW = text.length * 13 + 40;
    var g = makeCard('Pill: ' + text, approxW, 48, bgColor, 24, null, 1, bgOpacity !== undefined ? bgOpacity : 1);
    var t = makeText(text, 22, 'Bold', textColor);
    at(t, 20, 12);
    g.appendChild(t);
    return g;
  }

  // ─── PAGE ─────────────────────────────────────────────────────
  var page = figma.createPage();
  page.name = '🎤 Voice Feature Posts';

  var S = 1080;
  var GAP = 100;
  var ROW_H = S + 160;

  // ═══════════════════════════════════════════════════════════════
  // ROW 1 — SINGLE POSTS 21, 22, 23
  // ═══════════════════════════════════════════════════════════════

  // ─── POST 21 — YOU SPOKE. WE WROTE. ──────────────────────────
  {
    var f = makeFrame('Post 21 — You Spoke. We Wrote.', S, S, C.dark);
    at(f, 0, 0);

    // Blue radial glow
    var glow = makeRect(700, 700, C.primary, 350, 0.08);
    at(glow, (S - 700) / 2, -100);
    f.appendChild(glow);

    // "YOU SAID" label
    var ysLabel = makeLabel('You Said', C.primaryLight, 0.7);
    at(ysLabel, 80, 72);
    f.appendChild(ysLabel);

    // Voice bubble
    var bubbleW = S - 160;
    var bubble = makeCard('Voice Bubble', bubbleW, 172, C.white, 20, C.primary, 0.3, 0.06);
    at(bubble, 80, 114);
    f.appendChild(bubble);

    var micBg = makeRect(52, 52, C.primary, 26);
    at(micBg, 24, 60);
    bubble.appendChild(micBg);
    var micT = makeText('🎤', 26, 'Regular', C.white);
    at(micT, 33, 68);
    bubble.appendChild(micT);

    var voiceT = makeText(
      '"Two-bed apartment, Marina View, Emaar Beachfront.\n1,100 sqft, asking 2.2 million. Fully furnished,\nhigh floor, vacant now."',
      28, 'Regular', C.white,
      { width: bubbleW - 104, opacity: 0.75, lineHeight: 44 }
    );
    at(voiceT, 96, 22);
    bubble.appendChild(voiceT);

    // Waveform bars (blue)
    var heights = [10, 18, 28, 36, 42, 38, 32, 22, 14, 9];
    var wx = 80 + 92;
    heights.forEach(function(h, i) {
      var bar = makeRect(5, h, C.primaryLight, 3, 0.3 + i * 0.07);
      at(bar, wx, 114 + 172 + 10 + (42 - h) / 2);
      f.appendChild(bar);
      wx += 14;
    });

    // Arrow
    var arrowLine = makeLine(2, 52, C.primary, 0.35);
    at(arrowLine, S / 2 - 1, 312);
    f.appendChild(arrowLine);

    var arrowT = makeText('↓', 36, 'Bold', C.primaryLight, { align: 'CENTER', width: S });
    at(arrowT, 0, 364);
    f.appendChild(arrowT);

    var genLabel2 = makeLabel('AI Generated In 4 Seconds', C.primaryLight, 0.55);
    at(genLabel2, S / 2 - 180, 418);
    f.appendChild(genLabel2);

    // "LISTING COPY BUILT" label
    var lcLabel = makeLabel('Listing Copy Built', C.success);
    at(lcLabel, 80, 468);
    f.appendChild(lcLabel);

    // Generated listing card
    var cardW = S - 160;
    var listCard = makeCard('Listing Card', cardW, 290, C.white, 20, C.success, 0.4, 0.06);
    at(listCard, 80, 510);
    f.appendChild(listCard);

    var headT = makeText(
      'Luxury 2BR | Emaar Beachfront | Marina View',
      34, 'Bold', C.white,
      { width: cardW - 64, lineHeight: 50 }
    );
    at(headT, 32, 28);
    listCard.appendChild(headT);

    var bodyT = makeText(
      'Wake up to unobstructed marina views in this fully furnished 2-bedroom residence on a high floor at Emaar Beachfront. 1,100 sqft of refined living space, vacant and ready for immediate move-in...',
      26, 'Regular', C.white,
      { width: cardW - 64, opacity: 0.6, lineHeight: 40 }
    );
    at(bodyT, 32, 106);
    listCard.appendChild(bodyT);

    // Status tags
    var tagsData = [
      { text: 'EN ✓', bg: C.success, tc: C.successLight, bgO: 0.2 },
      { text: 'AR ✓', bg: C.success, tc: C.successLight, bgO: 0.2 },
      { text: 'Portals synced ✓', bg: C.success, tc: C.successLight, bgO: 0.2 },
    ];
    var tx = 32;
    tagsData.forEach(function(tag) {
      var pill = makePill(tag.text, tag.bg, tag.tc, tag.bgO);
      at(pill, tx, 226);
      listCard.appendChild(pill);
      tx += tag.text.length * 13 + 40 + 14;
    });

    page.appendChild(f);
  }

  // ─── POST 22 — EVERY DETAIL CAPTURED ─────────────────────────
  {
    var f = makeFrame('Post 22 — Every Detail Captured', S, S, C.bg);
    at(f, S + GAP, 0);

    var topLabel = makeLabel('Voice → Data', C.primary);
    at(topLabel, 80, 80);
    f.appendChild(topLabel);

    var heading = makeText(
      'One sentence.\nEvery detail extracted.',
      64, 'ExtraBold', C.ink,
      { width: S - 160, lineHeight: 80 }
    );
    at(heading, 80, 124);
    f.appendChild(heading);

    // Speech bubble (dark navy)
    var bW = S - 160;
    var bubble22 = makeCard('Speech Bubble', bW, 108, C.dark, 16);
    at(bubble22, 80, 302);
    f.appendChild(bubble22);

    var quoteT = makeText(
      '"3-bed villa, Jumeirah, private pool, Burj view,\n4,200 sqft, 4.5M AED, available June, PHPP available"',
      28, 'Regular', C.white,
      { width: bW - 48, opacity: 0.65, lineHeight: 44 }
    );
    at(quoteT, 24, 18);
    bubble22.appendChild(quoteT);

    // 3×2 field grid
    var fields = [
      { label: 'Type',     value: 'Villa' },
      { label: 'Beds',     value: '3 BR' },
      { label: 'Size',     value: '4,200 sqft' },
      { label: 'Price',    value: '4.5M AED' },
      { label: 'Location', value: 'Jumeirah' },
      { label: 'Avail.',   value: 'Jun 2025' },
    ];
    var cellW = (S - 160 - 24) / 3;
    var cellH = 100;
    fields.forEach(function(field, i) {
      var col = i % 3;
      var row = Math.floor(i / 3);
      var card = makeCard('Field: ' + field.label, cellW, cellH, C.white, 12, C.border, 1, 1);
      // Blue top accent strip
      var accent = makeRect(cellW, 3, C.primary, 0);
      at(accent, 0, 0);
      card.appendChild(accent);
      at(card, 80 + col * (cellW + 12), 432 + row * (cellH + 12));
      f.appendChild(card);

      var lbl = makeText(field.label, 22, 'Medium', C.muted);
      at(lbl, 16, 20);
      card.appendChild(lbl);

      var val = makeText(field.value, 28, 'ExtraBold', C.ink);
      at(val, 16, 52);
      card.appendChild(val);
    });

    // Feature tags (blue on dark)
    var featureTags = ['Burj View ✓', 'Private Pool ✓', 'PHPP ✓'];
    var fx = 80;
    var fy = 662;
    featureTags.forEach(function(tag) {
      var pill = makePill(tag, C.primary, C.white);
      at(pill, fx, fy);
      f.appendChild(pill);
      fx += tag.length * 13 + 40 + 12;
    });
    // Tone tag
    var tonePill = makePill('Luxury tone detected', C.border, C.muted, 1);
    at(tonePill, fx, fy);
    f.appendChild(tonePill);

    // Summary bar
    var bar = makeCard('Summary Bar', S - 160, 72, C.dark, 12);
    at(bar, 80, 762);
    f.appendChild(bar);

    var barLbl = makeText('Fields extracted', 24, 'Medium', C.white, { opacity: 0.5 });
    at(barLbl, 32, 20);
    bar.appendChild(barLbl);

    var barNum = makeText('9 / 9', 40, 'ExtraBold', C.primaryLight);
    at(barNum, S - 160 - 112, 13);
    bar.appendChild(barNum);

    var sub22 = makeText('Speak one sentence. Extract everything.', 28, 'SemiBold', C.muted, { width: S - 160 });
    at(sub22, 80, 860);
    f.appendChild(sub22);

    page.appendChild(f);
  }

  // ─── POST 23 — TYPE NOTHING. PUBLISH EVERYTHING. ─────────────
  {
    var f = makeFrame('Post 23 — Type Nothing. Publish Everything.', S, S, C.bg);
    at(f, (S + GAP) * 2, 0);

    var leftBg = makeRect(S / 2, S, C.red50);
    at(leftBg, 0, 0);
    f.appendChild(leftBg);

    var rightBg = makeRect(S / 2, S, C.green50);
    at(rightBg, S / 2, 0);
    f.appendChild(rightBg);

    var divider23 = makeLine(2, S, C.red200, 1);
    at(divider23, S / 2 - 1, 0);
    f.appendChild(divider23);

    var beforeLbl = makeLabel('Before', C.danger);
    at(beforeLbl, 48, 60);
    f.appendChild(beforeLbl);

    var afterLbl = makeLabel('After Enlista', C.success);
    at(afterLbl, S / 2 + 48, 60);
    f.appendChild(afterLbl);

    var beforeCards = [
      { time: '⏱ 12 min',  text: 'Open template. Copy last listing. Edit every field manually.' },
      { time: '⏱ +18 min', text: 'Write English description. Start again in Arabic (or pay translator).' },
      { time: '⏱ +15 min', text: 'Log into Bayut. Log into PF. Log into Dubizzle. Paste. Repeat.' },
    ];
    var halfCardW = S / 2 - 96;
    var by = 130;
    beforeCards.forEach(function(item) {
      var c = makeCard(item.time, halfCardW, 120, C.white, 12, C.red200, 1, 1);
      at(c, 48, by);
      f.appendChild(c);

      var timeT = makeText(item.time, 22, 'SemiBold', C.danger);
      at(timeT, 20, 16);
      c.appendChild(timeT);

      var descT = makeText(item.text, 24, 'Regular', C.muted, { width: halfCardW - 40, lineHeight: 36 });
      at(descT, 20, 48);
      c.appendChild(descT);

      by += 136;
    });

    var bBadge = makeCard('Before Badge', halfCardW, 80, C.danger, 12);
    at(bBadge, 48, by + 8);
    f.appendChild(bBadge);
    var bNum = makeText('45+ min', 38, 'ExtraBold', C.white, { align: 'CENTER', width: halfCardW });
    at(bNum, 0, 10);
    bBadge.appendChild(bNum);
    var bSub = makeText('per listing', 22, 'Regular', C.white, { opacity: 0.7, align: 'CENTER', width: halfCardW });
    at(bSub, 0, 54);
    bBadge.appendChild(bSub);

    var afterCards = [
      { time: '⚡ 30 sec', text: 'Tap mic. Describe the property out loud. Done.' },
      { time: '⚡ +20 sec', text: 'AI generates full EN + AR copy. Portal-optimised, RERA compliant.' },
      { time: '⚡ +3 min',  text: 'Review, approve. All 3 portals sync simultaneously.' },
    ];
    var ay = 130;
    afterCards.forEach(function(item) {
      var c = makeCard(item.time, halfCardW, 120, C.white, 12, C.green200, 1, 1);
      at(c, S / 2 + 48, ay);
      f.appendChild(c);

      var timeT = makeText(item.time, 22, 'SemiBold', C.success);
      at(timeT, 20, 16);
      c.appendChild(timeT);

      var descT = makeText(item.text, 24, 'Regular', C.ink, { width: halfCardW - 40, lineHeight: 36 });
      at(descT, 20, 48);
      c.appendChild(descT);

      ay += 136;
    });

    var aBadge = makeCard('After Badge', halfCardW, 80, C.success, 12);
    at(aBadge, S / 2 + 48, ay + 8);
    f.appendChild(aBadge);
    var aNum = makeText('< 4 min', 38, 'ExtraBold', C.white, { align: 'CENTER', width: halfCardW });
    at(aNum, 0, 10);
    aBadge.appendChild(aNum);
    var aSub = makeText('start to published', 22, 'Regular', C.white, { opacity: 0.75, align: 'CENTER', width: halfCardW });
    at(aSub, 0, 54);
    aBadge.appendChild(aSub);

    page.appendChild(f);
  }

  // ═══════════════════════════════════════════════════════════════
  // ROW 2 — CAROUSEL 21: 4 Properties, 4 Voice Inputs
  // ═══════════════════════════════════════════════════════════════
  var R2 = ROW_H;

  // Slide 1: Cover
  {
    var f = makeFrame('C21 – Slide 1: Cover', S, S, C.dark);
    at(f, 0, R2);

    var glow21 = makeRect(640, 640, C.primary, 320, 0.1);
    at(glow21, (S - 640) / 2, (S - 640) / 2);
    f.appendChild(glow21);

    // Waveform decoration
    var wh = [14, 24, 38, 52, 60, 52, 40, 28, 18, 12];
    var wx21 = S / 2 - (wh.length * 18) / 2;
    wh.forEach(function(h, i) {
      var bar = makeRect(6, h, C.primaryLight, 3, 0.4 + i * 0.06);
      at(bar, wx21, S / 2 - 240 + (60 - h) / 2);
      f.appendChild(bar);
      wx21 += 18;
    });

    var title21 = makeText('4 properties.\n4 voice inputs.\n4 listings built.', 72, 'ExtraBold', C.white, {
      width: S - 160, lineHeight: 88, align: 'CENTER',
    });
    at(title21, 80, S / 2 - 148);
    f.appendChild(title21);

    var sub21 = makeText('Swipe to watch →', 28, 'Regular', C.white, { opacity: 0.4, align: 'CENTER', width: S });
    at(sub21, 0, S / 2 + 190);
    f.appendChild(sub21);

    page.appendChild(f);
  }

  // Slides 2–4: property examples
  var properties = [
    {
      num: '1', type: 'Apartment',
      said: '"Studio in JVC, 450 sqft, modern kitchen,\ngym and pool, asking 650K, vacant"',
      headline: 'Modern Studio | JVC | Pool & Gym Access',
      body: 'Stylish fully-fitted studio in the heart of Jumeirah Village Circle. Vacant and move-in ready with full access to building amenities...',
      tags: ['EN+AR', '3 portals', '⚡ 4 sec'],
    },
    {
      num: '2', type: 'Villa',
      said: '"Five-bed villa on Palm Jumeirah, private beach access,\n8,000 sqft, fully furnished, price is 35 million"',
      headline: 'Signature 5BR Villa | Palm Jumeirah | Private Beach',
      body: "An extraordinary beachfront estate on Palm Jumeirah. This fully furnished 8,000 sqft villa commands direct private beach access...",
      tags: ['EN+AR', 'Luxury tone', '⚡ 4 sec'],
    },
    {
      num: '3', type: 'Off-Plan',
      said: '"2-bed off-plan, Emaar, DIFC, handover Q4 2026,\npost-handover payment plan, 2.8 million"',
      headline: '2BR Off-Plan | Emaar | DIFC | PHPP Available',
      body: "Secure your future home in Dubai's most prestigious financial district. Q4 2026 handover with flexible post-handover payment plan...",
      tags: ['EN+AR', 'PHPP noted', '⚡ 4 sec'],
    },
  ];

  properties.forEach(function(prop, idx) {
    var f = makeFrame('C21 – Slide ' + (idx + 2) + ': ' + prop.type, S, S, C.bg);
    at(f, (S + GAP) * (idx + 1), R2);

    var typeLabel = makeLabel('Property ' + prop.num + ' — ' + prop.type, C.primary);
    at(typeLabel, 80, 80);
    f.appendChild(typeLabel);

    var vW = S - 160;
    var voiceBubble = makeCard('Voice Input', vW, 190, C.dark, 16);
    at(voiceBubble, 80, 130);
    f.appendChild(voiceBubble);

    var agentLbl = makeText('🎤 Agent said:', 22, 'SemiBold', C.white, { opacity: 0.4 });
    at(agentLbl, 28, 22);
    voiceBubble.appendChild(agentLbl);

    var saidT = makeText(prop.said, 30, 'Regular', C.white, { width: vW - 56, opacity: 0.7, lineHeight: 46 });
    at(saidT, 28, 58);
    voiceBubble.appendChild(saidT);

    var arrowLbl = makeText('↓ Enlista generated:', 26, 'Bold', C.success);
    at(arrowLbl, 80, 344);
    f.appendChild(arrowLbl);

    var genCard = makeCard('Generated Copy', vW, 330, C.white, 16, C.border, 1, 1);
    at(genCard, 80, 392);
    f.appendChild(genCard);

    var genHead = makeText(prop.headline, 34, 'Bold', C.ink, { width: vW - 56, lineHeight: 50 });
    at(genHead, 28, 28);
    genCard.appendChild(genHead);

    var genBody = makeText(prop.body, 26, 'Regular', C.muted, { width: vW - 56, lineHeight: 40 });
    at(genBody, 28, 104);
    genCard.appendChild(genBody);

    var tx2 = 28;
    prop.tags.forEach(function(tag) {
      var isSpeed = tag.indexOf('⚡') === 0;
      var pill = makePill(tag, isSpeed ? C.success : C.primary, C.white, isSpeed ? 0.15 : 1);
      at(pill, tx2, 256);
      genCard.appendChild(pill);
      tx2 += tag.length * 13 + 40 + 14;
    });

    page.appendChild(f);
  });

  // Slide 5: CTA
  {
    var f = makeFrame('C21 – Slide 5: CTA', S, S, C.dark);
    at(f, (S + GAP) * 4, R2);

    var glow21b = makeRect(560, 560, C.primary, 280, 0.1);
    at(glow21b, (S - 560) / 2, (S - 560) / 2);
    f.appendChild(glow21b);

    var micT21 = makeText('🎤', 80, 'Regular', C.white, { align: 'CENTER', width: S });
    at(micT21, 0, S / 2 - 240);
    f.appendChild(micT21);

    var title21b = makeText('Any property type.\nAny community.\nAny accent.', 60, 'ExtraBold', C.white, {
      width: S - 160, lineHeight: 76, align: 'CENTER',
    });
    at(title21b, 80, S / 2 - 130);
    f.appendChild(title21b);

    var sub21b = makeText('Just speak naturally. Enlista understands Dubai.', 30, 'Regular', C.white, {
      opacity: 0.45, align: 'CENTER', width: S - 160,
    });
    at(sub21b, 80, S / 2 + 112);
    f.appendChild(sub21b);

    var ctaBg21 = makeRect(360, 72, C.primary, 12);
    at(ctaBg21, (S - 360) / 2, S / 2 + 192);
    f.appendChild(ctaBg21);

    var ctaT21 = makeText('Try free → link in bio', 28, 'Bold', C.white, { align: 'CENTER', width: 360 });
    at(ctaT21, (S - 360) / 2, S / 2 + 210);
    f.appendChild(ctaT21);

    page.appendChild(f);
  }

  // ═══════════════════════════════════════════════════════════════
  // ROW 3 — CAROUSEL 22: What Our Voice AI Listens For
  // ═══════════════════════════════════════════════════════════════
  var R3 = ROW_H * 2;

  // Slide 1: Cover
  {
    var f = makeFrame('C22 – Slide 1: Cover', S, S, C.dark);
    at(f, 0, R3);

    // Dot grid
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < 10; j++) {
        var dot = makeRect(3, 3, C.primary, 2, 0.06);
        at(dot, i * 108 + 54, j * 108 + 54);
        f.appendChild(dot);
      }
    }

    var emojiT22 = makeText('🎧', 72, 'Regular', C.white, { align: 'CENTER', width: S });
    at(emojiT22, 0, 270);
    f.appendChild(emojiT22);

    var title22 = makeText('What our voice AI\nactually listens for', 64, 'ExtraBold', C.white, {
      width: S - 160, lineHeight: 80, align: 'CENTER',
    });
    at(title22, 80, 380);
    f.appendChild(title22);

    var pillBg22 = makeRect(460, 52, C.primary, 26, 0.18);
    at(pillBg22, (S - 460) / 2, 574);
    f.appendChild(pillBg22);

    var pillT22 = makeText('30+ signals  ·  any accent  ·  any pace', 24, 'Bold', C.primaryLight, { align: 'CENTER', width: S });
    at(pillT22, 0, 587);
    f.appendChild(pillT22);

    var sub22b = makeText('Swipe to learn →', 26, 'Regular', C.white, { opacity: 0.35, align: 'CENTER', width: S });
    at(sub22b, 0, 654);
    f.appendChild(sub22b);

    page.appendChild(f);
  }

  // Slides 2–4: category breakdowns
  var categories = [
    {
      slide: 2, icon: '🏠', title: 'Property Basics',
      tags: ['🏠 Property type', '🛏 Bedrooms', '🚿 Bathrooms', '📏 Size in sqft', '🏢 Floor number', '🅿️ Parking'],
      quote: '"3-bed villa... high floor... double parking"\n→ all three fields extracted simultaneously',
    },
    {
      slide: 3, icon: '📍', title: 'Location & Price',
      tags: ['📍 23 communities', '🏗 Developer name', '🏢 Building name', '💰 Asking price (AED)', '📅 Availability date', '🗓 Handover date'],
      quote: '"Marina View... Emaar Beachfront... 2.2 million... available now"\n→ location, developer, price and availability all matched',
    },
    {
      slide: 4, icon: '✨', title: 'Features & Tone',
      tags: ['Burj View', 'Sea View', 'Private Pool', 'Smart Home', 'Fully Furnished', "Maid's Room", 'Near Metro', 'PHPP', '+22 more'],
      quote: 'Tone auto-detected: Luxury · Professional · Investment',
      isTone: true,
    },
  ];

  categories.forEach(function(cat) {
    var f = makeFrame('C22 – Slide ' + cat.slide + ': ' + cat.title, S, S, C.bg);
    at(f, (S + GAP) * (cat.slide - 1), R3);

    // Icon header
    var iconBg22 = makeRect(64, 64, C.dark, 16);
    at(iconBg22, 80, 80);
    f.appendChild(iconBg22);
    var iconT22 = makeText(cat.icon, 30, 'Regular', C.white);
    at(iconT22, 96, 92);
    f.appendChild(iconT22);
    var hdrLabel22 = makeLabel(cat.title, C.ink);
    at(hdrLabel22, 162, 98);
    f.appendChild(hdrLabel22);

    // Tag cloud
    var tagX = 80;
    var tagY = 188;
    cat.tags.forEach(function(tag, i) {
      var isExtra = tag === '+22 more';
      var isFeat = cat.isTone && !isExtra;
      var tagW = tag.length * 15 + 44;
      var tagBg = makeRect(tagW, 52, isFeat ? C.primary : (isExtra ? C.muted : C.white), 10, isExtra ? 0.1 : 1);
      if (!isFeat && !isExtra) {
        tagBg.strokes = [{ type: 'SOLID', color: C.border }];
        tagBg.strokeWeight = 1.5;
        tagBg.strokeAlign = 'INSIDE';
      }
      at(tagBg, tagX, tagY);
      f.appendChild(tagBg);

      var tagT22 = makeText(tag, 24, 'SemiBold', isFeat ? C.white : (isExtra ? C.muted : C.ink));
      at(tagT22, tagX + 16, tagY + 13);
      f.appendChild(tagT22);

      tagX += tagW + 14;
      if (tagX > S - 80 - 180 || i === 2 || i === 5) {
        tagX = 80;
        tagY += 66;
      }
    });

    // Quote / Tone card
    var qCard22 = makeCard('Quote', S - 160, 120, C.white, 12, C.border, 1, 1);
    at(qCard22, 80, cat.isTone ? 568 : 574);
    f.appendChild(qCard22);

    if (cat.isTone) {
      var toneLabelT = makeText('TONE DETECTION', 20, 'Bold', C.muted, { letterSpacing: 10, textCase: 'UPPER' });
      at(toneLabelT, 24, 18);
      qCard22.appendChild(toneLabelT);
      var tones = [
        { label: '💎 Luxury', active: true },
        { label: 'Professional', active: false },
        { label: 'Investment', active: false },
      ];
      var toneX = 24;
      tones.forEach(function(tone) {
        var tBg = makeRect(tone.label.length * 14 + 32, 46, tone.active ? C.primary : C.muted, 10, tone.active ? 0.15 : 0.08);
        at(tBg, toneX, 58);
        qCard22.appendChild(tBg);
        var tT = makeText(tone.label, 23, tone.active ? 'Bold' : 'Regular', tone.active ? C.primary : C.muted);
        at(tT, toneX + 14, 72);
        qCard22.appendChild(tT);
        toneX += tone.label.length * 14 + 32 + 14;
      });
    } else {
      var qT22 = makeText(cat.quote, 26, 'Regular', C.muted, { width: S - 160 - 48, lineHeight: 40 });
      at(qT22, 24, 20);
      qCard22.appendChild(qT22);
    }

    // Slide counter
    var counter22 = makeText('Slide ' + cat.slide + ' of 5  ·  swipe →', 22, 'Medium', C.muted);
    at(counter22, 80, S - 80);
    f.appendChild(counter22);

    page.appendChild(f);
  });

  // Slide 5: CTA
  {
    var f = makeFrame('C22 – Slide 5: CTA', S, S, C.dark);
    at(f, (S + GAP) * 4, R3);

    var glow22 = makeRect(520, 520, C.primary, 260, 0.1);
    at(glow22, (S - 520) / 2, (S - 520) / 2);
    f.appendChild(glow22);

    var bigNum22 = makeText('30+', 140, 'ExtraBold', C.primaryLight, { align: 'CENTER', width: S });
    at(bigNum22, 0, 270);
    f.appendChild(bigNum22);

    var numSub22 = makeText('signals extracted from\na single voice description', 30, 'Regular', C.white, {
      opacity: 0.45, align: 'CENTER', width: S, lineHeight: 48,
    });
    at(numSub22, 0, 448);
    f.appendChild(numSub22);

    var divLine22 = makeLine(64, 2, C.primary, 0.4);
    at(divLine22, (S - 64) / 2, 548);
    f.appendChild(divLine22);

    var tagline22 = makeText('No form. No typing.\nJust your voice.', 52, 'ExtraBold', C.white, {
      align: 'CENTER', width: S - 160, lineHeight: 68,
    });
    at(tagline22, 80, 578);
    f.appendChild(tagline22);

    var ctaBg22 = makeRect(360, 72, C.primary, 12);
    at(ctaBg22, (S - 360) / 2, 778);
    f.appendChild(ctaBg22);

    var ctaT22 = makeText('Try free → link in bio', 28, 'Bold', C.white, { align: 'CENTER', width: 360 });
    at(ctaT22, (S - 360) / 2, 796);
    f.appendChild(ctaT22);

    page.appendChild(f);
  }

  // ─── DONE ─────────────────────────────────────────────────────
  figma.currentPage = page;
  figma.viewport.scrollAndZoomIntoView(page.children);
  figma.closePlugin('✅  13 frames created — font: ' + FONT);

})().catch(function(err) {
  figma.closePlugin('❌  Error: ' + err.message);
});
