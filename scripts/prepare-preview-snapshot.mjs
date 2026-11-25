import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
const { values } = parseArgs({ options: { input: { type: 'string' }, output: { type: 'string' } } });
if (!values.input) throw new Error('Supply a reviewed local siteData export with --input');
if (!values.output || !path.resolve(values.output).startsWith(path.resolve('artifacts') + path.sep)) throw new Error('Supply --output under ignored artifacts/; never overwrite the public synthetic fixture with real data');
const raw = JSON.parse(await readFile(values.input, 'utf8'));
const source = raw.siteData || raw;
const keys = ['projects','skills','timeline','aboutEntries','activeAboutId','cvFiles','activeCvId','contactInfo','homeHero','availability','profile','display'];
const snapshot = Object.fromEntries(keys.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]));
for (const key of ['projects', 'skills', 'timeline']) snapshot[key] = Object.values(snapshot[key] || {}).filter((item) => key === 'projects' ? item.published === true && !item.archived : item.published !== false);
// Omit unknown per-record fields, even if the legacy public node contains them.
const fields = {
  projects: ['id','title','description','category','techStack','githubUrl','demoUrl','liveUrl','image','order','published','slug','previousSlugs','featured','featuredOrder','role','contribution','period','status','year','links','media','presentation','sections'],
  skills: ['id','name','iconKey','category','order','published'],
  timeline: ['id','type','title','company','period','description','startDate','startDateExact','endDate','current','url','order','published'],
};
for (const [key, allowed] of Object.entries(fields)) snapshot[key] = snapshot[key].map((item) => Object.fromEntries(allowed.filter((k) => item[k] !== undefined).map((k) => [k, item[k]])));
await writeFile(values.output, JSON.stringify(snapshot, (key, value) => key === 'path' || key === 'imagePath' || key === 'uploadedAt' ? undefined : typeof value === 'string' && value.startsWith('data:') ? '' : value, 2) + '\n');
console.log(JSON.stringify({ output: values.output, publicProjects: snapshot.projects.length, skills: snapshot.skills.length, timeline: snapshot.timeline.length }));
