import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base='http://localhost:3101';
const browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage();const forbidden=[];const errors=[];
page.on('request',r=>{if(/identitytoolkit|securetoken|firebaseio|firebasedatabase|generativelanguage/.test(r.url()))forbidden.push(r.url())});
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(base);await page.waitForLoadState('networkidle');assert.ok((await page.title()).length);
 await page.goto(base+'/admin');await page.waitForLoadState('networkidle');assert.equal(await page.locator('input[type=password]').count(),0);assert.match(await page.locator('body').innerText(),/read.only/i);
 assert.equal((await fetch(base+'/api/revalidate',{method:'POST'})).status,403);
 assert.equal((await fetch(base+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Test',email:'test@example.test',subject:'Test',message:'Test',challengeToken:'emulator-test-token'})})).status,503);
 assert.equal((await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Hello',challengeToken:'emulator-test-token'})})).status,503);
 assert.deepEqual(forbidden,[]);assert.deepEqual(errors,[]);
 await mkdir('artifacts/release-gate',{recursive:true});await page.screenshot({path:'artifacts/release-gate/preview-readonly.png'});
 await writeFile('artifacts/release-gate/preview-results.json',JSON.stringify({pass:true,checks:6,forbiddenRequests:0,pageErrors:0}));console.log('PASS snapshot pages, admin read-only, revalidate/contact/chat blocked, no Firebase Auth/RTDB or AI requests');
}finally{await browser.close()}
