import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { getApps, deleteApp } from 'firebase-admin/app';
import { guardPublicAction, ActionDenied } from '../../src/lib/public-action-guard';
import { getServerDatabase, boundedDatabase } from '../../src/lib/server-database';
import { db, fakeToken } from './env';
const token='emulator-test-token';
const request=new Request('http://localhost/api/contact');
after(async()=>{await Promise.all(getApps().map(deleteApp));});
test('durable transactions serialize concurrent requests and survive a server app restart', async()=>{
 await db('DELETE','_serverLimits/contact',undefined,'owner');
 const outcomes=await Promise.allSettled(Array.from({length:6},()=>guardPublicAction(request,token,'contact')));
 assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,2);
 assert.equal(outcomes.filter(r=>r.status==='rejected' && r.reason instanceof ActionDenied && r.reason.status===429).length,4);
 await Promise.all(getApps().map(deleteApp));
 await assert.rejects(guardPublicAction(request,token,'contact'),(e)=>e instanceof ActionDenied && e.status===429);
 const state=await db('GET','_serverLimits/contact',undefined,'owner'); assert.equal(state.body.total,2);
 assert.equal((await db('GET','_serverLimits/contact')).status,401);
});
test('restricted server identity can create validated intake, never content or private inbox reads',async()=>{
 const intake=fakeToken('portfolio-intake-server');
 assert.equal((await db('PUT','siteData/intake-test',true,intake)).status,401);
 assert.equal((await db('GET','contactSubmissions',undefined,intake)).status,401);
 const id='intake-test'; const message={id,name:'Test',email:'test@example.test',subject:'Hello',message:'Local synthetic request',timestamp:new Date().toISOString(),read:false,createdAt:{'.sv':'timestamp'}};
 await db('DELETE',`contactSubmissions/${id}`,undefined,'owner');
 await boundedDatabase(getServerDatabase().ref(`contactSubmissions/${id}`).set(message));
 await assert.rejects(boundedDatabase(getServerDatabase().ref(`contactSubmissions/${id}`).set(message)),/PERMISSION_DENIED/);
 for(const extra of [{message:'x'.repeat(5001)},{email:'bad'},{read:true},{extra:'bad'},{createdAt:1}]) assert.equal((await db('PUT','contactSubmissions/invalid',{...message,id:'invalid',...extra},intake)).status,401);
});
