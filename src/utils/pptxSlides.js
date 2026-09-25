import { mockFileFromInput } from './mediaUpload';

const DRAWABLE_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
};
const AUDIO_TYPES = { m4a: 'audio/mp4', mp4: 'audio/mp4', mp3: 'audio/mpeg' };
const R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const RENDER_WIDTH = 1600;

function extOf(path) {
  return path.split('.').pop()?.toLowerCase() ?? '';
}

function resolveTarget(baseDir, target) {
  if (target.startsWith('/')) return target.slice(1);
  const out = [];
  for (const part of `${baseDir}/${target}`.split('/')) {
    if (part === '..') out.pop();
    else if (part && part !== '.') out.push(part);
  }
  return out.join('/');
}

function childElements(el) {
  return Array.from(el?.childNodes ?? []).filter((n) => n.nodeType === 1);
}

function child(el, name) {
  return childElements(el).find((c) => c.localName === name) ?? null;
}

function firstDescendant(el, name) {
  for (const c of childElements(el)) {
    if (c.localName === name) return c;
    const found = firstDescendant(c, name);
    if (found) return found;
  }
  return null;
}

function hasText(el) {
  for (const c of childElements(el)) {
    if (c.localName === 't' && c.textContent.trim()) return true;
    if (hasText(c)) return true;
  }
  return false;
}

function num(el, attr) {
  return Number(el?.getAttribute(attr) ?? 0);
}

function embedId(blip) {
  return blip?.getAttributeNS(R_NS, 'embed') || blip?.getAttribute('r:embed') || null;
}

async function readXml(zip, path, parseXml) {
  const entry = zip.file(path);
  return entry ? parseXml(await entry.async('string')) : null;
}

async function readRels(zip, relsPath, baseDir, parseXml) {
  const doc = await readXml(zip, relsPath, parseXml);
  const rels = {};
  if (!doc) return rels;
  for (const rel of Array.from(doc.getElementsByTagName('Relationship'))) {
    if (rel.getAttribute('TargetMode') === 'External') continue;
    rels[rel.getAttribute('Id')] = resolveTarget(baseDir, rel.getAttribute('Target'));
  }
  return rels;
}

function readXfrm(xfrm) {
  const off = child(xfrm, 'off');
  const ext = child(xfrm, 'ext');
  return {
    x: num(off, 'x'),
    y: num(off, 'y'),
    cx: num(ext, 'cx'),
    cy: num(ext, 'cy'),
    rot: num(xfrm, 'rot') / 60000,
    flipH: xfrm.getAttribute('flipH') === '1',
    flipV: xfrm.getAttribute('flipV') === '1',
    chOff: child(xfrm, 'chOff'),
    chExt: child(xfrm, 'chExt'),
  };
}

function applyTransform(tf, box) {
  return {
    ...box,
    x: tf.ox + box.x * tf.sx,
    y: tf.oy + box.y * tf.sy,
    cx: box.cx * tf.sx,
    cy: box.cy * tf.sy,
  };
}

function readCrop(container) {
  const src = firstDescendant(container, 'srcRect');
  if (!src) return null;
  return { l: num(src, 'l'), t: num(src, 't'), r: num(src, 'r'), b: num(src, 'b') };
}

/** Collects pictures (z-order) and text presence from a slide's shape tree. */
function walkShapes(node, tf, out) {
  for (const el of childElements(node)) {
    const name = el.localName;
    if (name === 'pic' || name === 'sp') {
      const isMediaIcon =
        firstDescendant(el, 'audioFile') || firstDescendant(el, 'videoFile') || firstDescendant(el, 'media');
      if (name === 'sp' && hasText(el)) out.hasText = true;
      if (isMediaIcon) continue;
      const blip = name === 'pic' ? firstDescendant(el, 'blip') : firstDescendant(child(el, 'spPr'), 'blip');
      const xfrm = firstDescendant(child(el, 'spPr'), 'xfrm');
      const rId = embedId(blip);
      if (rId && xfrm) {
        out.pictures.push({ rId, box: applyTransform(tf, readXfrm(xfrm)), crop: readCrop(el) });
      }
    } else if (name === 'grpSp') {
      const xfrm = firstDescendant(child(el, 'grpSpPr'), 'xfrm');
      if (!xfrm) {
        walkShapes(el, tf, out);
        continue;
      }
      const g = readXfrm(xfrm);
      const chX = num(g.chOff, 'x');
      const chY = num(g.chOff, 'y');
      const scaleX = num(g.chExt, 'cx') ? g.cx / num(g.chExt, 'cx') : 1;
      const scaleY = num(g.chExt, 'cy') ? g.cy / num(g.chExt, 'cy') : 1;
      walkShapes(
        el,
        {
          ox: tf.ox + (g.x - chX * scaleX) * tf.sx,
          oy: tf.oy + (g.y - chY * scaleY) * tf.sy,
          sx: tf.sx * scaleX,
          sy: tf.sy * scaleY,
        },
        out,
      );
    } else if (name === 'graphicFrame') {
      if (hasText(el)) out.hasText = true;
    } else if (name === 'AlternateContent') {
      const choice = child(el, 'Choice') ?? child(el, 'Fallback');
      if (choice) walkShapes(choice, tf, out);
    }
  }
}

/**
 * يقرأ ترتيب الشرائح ومحتوى كل شريحة (الصور بمواضعها + الصوت) بدون رسم.
 * @param parseXml (xml: string) => Document
 */
export async function parsePptx(zip, parseXml) {
  const presentation = await readXml(zip, 'ppt/presentation.xml', parseXml);
  if (!presentation) return null;

  const sldSz = firstDescendant(presentation.documentElement, 'sldSz');
  const size = { cx: num(sldSz, 'cx') || 12192000, cy: num(sldSz, 'cy') || 6858000 };

  const presRels = await readRels(zip, 'ppt/_rels/presentation.xml.rels', 'ppt', parseXml);
  const sldIdLst = firstDescendant(presentation.documentElement, 'sldIdLst');
  const slidePaths = childElements(sldIdLst)
    .map((s) => presRels[s.getAttributeNS(R_NS, 'id') || s.getAttribute('r:id')])
    .filter((p) => p && zip.file(p));

  const slides = [];
  for (const [i, path] of slidePaths.entries()) {
    const fileName = path.split('/').pop();
    const rels = await readRels(zip, `ppt/slides/_rels/${fileName}.rels`, 'ppt/slides', parseXml);
    const doc = await readXml(zip, path, parseXml);
    const cSld = firstDescendant(doc.documentElement, 'cSld');

    const out = { pictures: [], hasText: false };
    const bgBlip = firstDescendant(child(cSld, 'bg'), 'blip');
    if (embedId(bgBlip)) {
      out.pictures.push({
        rId: embedId(bgBlip),
        box: { x: 0, y: 0, cx: size.cx, cy: size.cy, rot: 0 },
        crop: null,
      });
    }
    walkShapes(child(cSld, 'spTree'), { ox: 0, oy: 0, sx: 1, sy: 1 }, out);

    const warnings = [];
    const pictures = [];
    for (const pic of out.pictures) {
      const mediaPath = rels[pic.rId];
      if (!mediaPath || !zip.file(mediaPath)) continue;
      const type = DRAWABLE_TYPES[extOf(mediaPath)];
      if (!type) {
        warnings.push(`صورة بصيغة ${extOf(mediaPath).toUpperCase()} غير مدعومة`);
        continue;
      }
      pictures.push({ ...pic, path: mediaPath, type });
    }

    const audioPath = Object.values(rels).find((p) => AUDIO_TYPES[extOf(p)] && zip.file(p)) ?? null;
    const unsupportedAudio = Object.values(rels).find((p) => ['wav', 'wma', 'aac'].includes(extOf(p)));
    if (!audioPath && unsupportedAudio) {
      warnings.push(`صوت بصيغة ${extOf(unsupportedAudio).toUpperCase()} غير مدعوم — استخدمي m4a أو mp3`);
    }
    if (out.hasText) warnings.push('فيها نص مكتوب لن يظهر — حوّليه لصورة داخل الشريحة');

    slides.push({
      number: i + 1,
      pictures,
      audio: audioPath ? { path: audioPath, type: AUDIO_TYPES[extOf(audioPath)] } : null,
      warnings,
    });
  }

  return { size, slides };
}

async function renderSlideImage(zip, size, pictures) {
  if (pictures.length === 0) return null;

  const scale = RENDER_WIDTH / size.cx;
  const canvas = document.createElement('canvas');
  canvas.width = RENDER_WIDTH;
  canvas.height = Math.round(size.cy * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let drawn = 0;
  for (const pic of pictures) {
    const data = await zip.file(pic.path).async('blob');
    let bitmap;
    try {
      bitmap = await createImageBitmap(new Blob([data], { type: pic.type }));
    } catch {
      continue;
    }
    const { box, crop } = pic;
    const sx = crop ? (bitmap.width * crop.l) / 100000 : 0;
    const sy = crop ? (bitmap.height * crop.t) / 100000 : 0;
    const sw = crop ? bitmap.width * (1 - (crop.l + crop.r) / 100000) : bitmap.width;
    const sh = crop ? bitmap.height * (1 - (crop.t + crop.b) / 100000) : bitmap.height;
    const w = box.cx * scale;
    const h = box.cy * scale;

    ctx.save();
    ctx.translate(box.x * scale + w / 2, box.y * scale + h / 2);
    if (box.rot) ctx.rotate((box.rot * Math.PI) / 180);
    ctx.scale(box.flipH ? -1 : 1, box.flipV ? -1 : 1);
    ctx.drawImage(bitmap, sx, sy, Math.max(sw, 1), Math.max(sh, 1), -w / 2, -h / 2, w, h);
    ctx.restore();
    bitmap.close?.();
    drawn += 1;
  }

  if (drawn === 0) return null;
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
}

/**
 * يحوّل كل شريحة في ملف .pptx إلى صورة (تركيب كل صور الشريحة بمواضعها) + التعليق الصوتي.
 * @returns {Promise<{ pptxFile, slides: Array<{ number, imageFile, audioFile, warnings }> } | { error: string }>}
 */
export async function extractPptxSlides(file) {
  if (!file) return { error: 'لم يتم اختيار ملف.' };

  const { default: JSZip } = await import('jszip');
  let zip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    return { error: 'الملف ليس PowerPoint صالحاً (.pptx).' };
  }

  const parser = new DOMParser();
  const parsed = await parsePptx(zip, (xml) => parser.parseFromString(xml, 'application/xml'));
  if (!parsed || parsed.slides.length === 0) {
    return { error: 'لم نجد شرائح داخل الملف.' };
  }

  const base = file.name.replace(/\.pptx$/i, '') || 'slide';
  const tag = (picked, suffix) => ({ ...picked, extractedFrom: file.name, source: 'pptx', label: suffix });

  const slides = [];
  for (const slide of parsed.slides) {
    const padded = String(slide.number).padStart(2, '0');
    const imageBlob = await renderSlideImage(zip, parsed.size, slide.pictures);
    const imageFile = imageBlob
      ? tag(mockFileFromInput(new File([imageBlob], `${base}_${padded}.jpg`, { type: 'image/jpeg' })), 'image')
      : null;

    let audioFile = null;
    if (slide.audio) {
      const audioBlob = await zip.file(slide.audio.path).async('blob');
      const name = `${base}_${padded}.${extOf(slide.audio.path)}`;
      audioFile = tag(mockFileFromInput(new File([audioBlob], name, { type: slide.audio.type })), 'audio');
    }

    const warnings = [...slide.warnings];
    if (!imageFile) warnings.unshift('لا توجد صورة في الشريحة');
    if (!audioFile) warnings.unshift('لا يوجد صوت في الشريحة');

    slides.push({ number: slide.number, imageFile, audioFile, warnings });
  }

  if (!slides.some((s) => s.imageFile || s.audioFile)) {
    return {
      error: 'لم نجد صوراً أو أصواتاً داخل الشرائح — تأكدي أن الصور مُدرجة (Insert › Pictures) والصوت m4a/mp3.',
    };
  }

  return { pptxFile: mockFileFromInput(file), slides };
}
