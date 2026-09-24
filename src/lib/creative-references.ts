import { parseImage } from './image-data';
import { validReference } from './cloud-images';
export interface CreativeReference { id: string; title: string; prompt: string; tags: string; r2_key: string; }
const words = (text: string) => new Set(text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[a-z0-9]{3,}/g) ?? []);
export function chooseReference(prompt: string, examples: CreativeReference[]): CreativeReference | null {
  const query = words(prompt);
  let best: CreativeReference | null = null, score = 0;
  const stop = new Set(['una','con','del','las','los','para','que','the','and','with','image','imagen','crear','create']);
  for (const example of examples) {
    const tokens = words(example.title + ' ' + example.tags + ' ' + example.prompt);
    const hits = [...query].filter(word => !stop.has(word) && tokens.has(word)).length;
    if (hits > score) { score = hits; best = example; }
  }
  return best;
}
export async function resolveReference(env: Env, mode: string, prompt: string) {
  if (mode === 'off') return null;
  let selected: CreativeReference | null;
  if (mode === 'auto') {
    const { results } = await env.DB.prepare('SELECT id,title,prompt,tags,r2_key FROM creative_references WHERE enabled=1 ORDER BY created_at DESC,id LIMIT 100').all<CreativeReference>();
    selected = chooseReference(prompt, results);
  } else selected = await env.DB.prepare('SELECT id,title,prompt,tags,r2_key FROM creative_references WHERE id=?1 AND enabled=1').bind(mode).first<CreativeReference>();
  if (!selected) return null;
  const object = await env.CREATIONS.get(selected.r2_key);
  if (!object || object.size > 2 * 1024 * 1024) return null;
  const bytes = new Uint8Array(await object.arrayBuffer());
  let binary = '';
  for (let i=0;i<bytes.length;i+=8192) binary += String.fromCharCode(...bytes.subarray(i,i+8192));
  const image = parseImage('data:image/png;base64,' + btoa(binary), 2 * 1024 * 1024);
  return image && validReference(image) ? { ...selected, image } : null;
}
