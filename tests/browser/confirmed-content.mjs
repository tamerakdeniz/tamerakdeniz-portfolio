import assert from 'node:assert/strict';
import { readFile,writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { buildPortfolio } from '../../src/lib/content/portfolio.ts';
import { buildAssistantContext } from '../../src/lib/content/assistant-context.ts';
const root=JSON.parse(await readFile('artifacts/release-gate/reviewed-emulator-root.json','utf8'));
const portfolio=buildPortfolio(root.siteData);
assert.deepEqual(portfolio.featured.map(p=>p.id),['demo-project-1','demo-project-2','demo-project-3']);
assert.ok(portfolio.archive.some(p=>p.id==='demo-project-4'));
assert.equal(portfolio.projects.find(p=>p.id==='demo-project-1').links.source,'https://example.com/demo-source');
assert.equal(portfolio.cv.language,'en');
for(const lang of ['en','tr']){
 const context=buildAssistantContext(portfolio,lang);
 assert.match(context,lang==='en'?/Example Academy/:/Örnek Akademi/);
 for(const draft of Object.values(root.siteDrafts.projects||{})) assert.ok(!context.includes(draft.title[lang]));
}
const browser=await chromium.launch({channel:'chrome'});const page=await browser.newPage({viewport:{width:1440,height:900}});
try{
 await page.goto('http://localhost:3100/about');assert.match(await page.locator('main').innerText(),/Updated synthetic biography/);
 await page.goto('http://localhost:3100/projects/demo-project-1');assert.ok(await page.locator('a[href="https://example.com/demo-source"]').count());
 await page.goto('http://localhost:3100/resume');assert.match(await page.locator('main').innerText(),/12 Mar 2001/);
 await page.getByRole('button',{name:'TR',exact:true}).first().click();
 assert.equal(await page.locator('html').getAttribute('lang'),'tr');
 assert.match(await page.locator('main').innerText(),/12 Mar 2001/);
 assert.match(await page.locator('main').innerText(),/İngilizce/);
 await page.screenshot({path:'artifacts/release-gate/confirmed-resume.png',fullPage:true});
 await writeFile('artifacts/release-gate/confirmed-content-results.json',JSON.stringify({pass:true,featured:portfolio.featured.map(p=>p.id),cvPreserved:true,assistantDraftExclusion:true}));
 console.log('PASS confirmed featured/archive, synthetic source URL, education/assistant consistency, private-draft exclusion and English CV metadata');
}finally{await browser.close()}
