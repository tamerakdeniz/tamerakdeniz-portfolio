import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {db,ADMIN,USER} from './env';
test('temporary rules retain legacy contact compatibility, private drafts and claimed admins; final rules close legacy intake',async()=>{
 const transitional=JSON.parse(await readFile('database.transition.rules.json','utf8'));
 const final=JSON.parse(await readFile('database.rules.json','utf8'));
 try{
  assert.equal((await db('PUT','.settings/rules',transitional,'owner')).status,200);
  await db('DELETE','contactSubmissions/legacy-bridge',undefined,'owner');
  assert.equal((await db('PUT','contactSubmissions/legacy-bridge',{name:'Legacy',email:'old@example.test',message:'Synthetic old client',timestamp:'2026-11-25'})).status,200);
  assert.equal((await db('GET','siteDrafts')).status,401);assert.equal((await db('GET','siteDrafts',undefined,USER)).status,401);
  assert.equal((await db('PUT','siteData/bridge-check',true,USER)).status,401);assert.equal((await db('PUT','siteData/bridge-check',true,ADMIN)).status,200);
 }finally{assert.equal((await db('PUT','.settings/rules',final,'owner')).status,200)}
 assert.equal((await db('PUT','contactSubmissions/legacy-after',{name:'Legacy'})).status,401);
});
