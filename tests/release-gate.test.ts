import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planLegacyDrafts, digest } from '../scripts/legacy-draft-plan.mjs';
import { planConfirmedContent } from '../scripts/confirmed-content-plan.mjs';
import { reserveAction, ACTION_LIMITS } from '../src/lib/public-action-guard';
import { classifiedCaption } from '../src/lib/content/media-classification';
import { timelinePeriod } from '../src/lib/content/timeline';

const fixture = () => ({ siteData: { projects: { a: { id: 'a', published: true, media: [{url:'public'}] }, b: { id:'b', published:false, description:'private' }, c:{id:'c'} }, skills: { x:{name:'hidden',published:false}, y:{name:'public'} }, timeline: [] }, siteDrafts: { projects:[] as {id:string,published:boolean,description:string}[], timeline:[{id:'existing',published:false}] }, contactSubmissions:{one:{message:'keep'}}, unknown:{keep:true} });
test('migration preserves unrelated paths, moves all hidden records, assigns stable IDs and is idempotent', () => {
 const root=fixture(); const result=planLegacyDrafts(root); assert.equal(result.summary[0].moved,2); assert.equal(result.summary[1].moved,1);
 assert.deepEqual(result.next.siteData.projects,{a:root.siteData.projects.a}); assert.deepEqual(result.next.contactSubmissions,root.contactSubmissions); assert.deepEqual(result.next.unknown,root.unknown);
 assert.equal(result.next.siteDrafts.skills[0].id,planLegacyDrafts(root).next.siteDrafts.skills[0].id); assert.equal(planLegacyDrafts(result.next).changed,false); assert.equal(root.siteData.projects.b.description,'private');
 assert.equal(digest({b:2,a:1}),digest({a:1,b:2}));
});
test('migration rejects conflicting IDs and never mutates input', () => {
 const root=fixture(); root.siteDrafts.projects=[{id:'b',published:false,description:'other'}]; assert.throws(()=>planLegacyDrafts(root),/Conflicting/);
});
test('confirmed patch preserves CV/photos, rejects stale targets and repeats safely', () => {
 const root={siteData:{projects:[{id:'p',featured:true,image:'keep'}],aboutEntries:[{id:'a',avatar:'photo'}],homeHero:{icon:'hero'},cvFiles:[{id:'cv',dataUrl:'pdf',name:'original.pdf'}],activeCvId:'cv'}};
 const proposal={format:'confirmed-content-patch-v1',operations:[{op:'merge-record',collection:'projects',match:{id:'p'},expectedFields:{featured:true},set:{featured:false},removeFields:['liveUrl']}]};
 const result=planConfirmedContent(root,proposal,{});assert.equal(result.next.siteData.projects[0].image,'keep');assert.equal(result.next.siteData.cvFiles[0].dataUrl,'pdf');assert.equal(result.next.siteData.cvFiles[0].language,'en');assert.equal(planConfirmedContent(result.next,proposal,{}).changed,false);
 root.siteData.projects[0].featured=false; root.siteData.projects[0].image='changed'; proposal.operations[0].expectedFields={featured:true}; proposal.operations[0].set={featured:true};assert.throws(()=>planConfirmedContent(root,proposal,{}),/Stale/);
});
test('durable quota transition enforces client windows, daily totals and day reset', () => {
 let state=null; const now=100*86400000;
 for(let i=0;i<ACTION_LIMITS.chat.daily;i++){state=reserveAction(state,'client'+i,'chat',now); assert.ok(state);}
 assert.equal(reserveAction(state,'new','chat',now),undefined);assert.equal(reserveAction(state,'new','chat',now+86400000)?.total,1);
 state=reserveAction(null,'same','contact',now)!;state=reserveAction(state,'same','contact',now)!;assert.equal(reserveAction(state,'same','contact',now),undefined);assert.equal(reserveAction(state,'same','contact',now+600000)?.total,3);
});
test('concept and mock media always carry bilingual disclosure', () => {
 assert.match(classifiedCaption({id:'m',kind:'cover',url:'/cover.webp',classification:'ai-concept',caption:{en:'Cover',tr:'Kapak'}})!.en,/not a product screenshot/);
 assert.match(classifiedCaption({id:'m',kind:'cover',url:'/cover.webp',classification:'simulated-demo'})!.tr,/Simüle/);
});
test('synthetic exact start date stays bilingual and ongoing', () => {
 const period=timelinePeriod({id:'demo-school',published:true,type:'education',title:{en:'demo-school',tr:'demo-school'},company:{en:'demo-school',tr:'demo-school'},period:{en:'',tr:''},description:{en:'',tr:''},order:0,startDate:'2001-03',startDateExact:'2001-03-12',current:true}).period;assert.match(period.en,/12 Mar/);assert.match(period.tr,/12 Mar/);
});

test('Turnstile requires matching hostname/action and rejects failed verification before intake', async () => {
 const {verifyChallenge,ActionDenied}=await import('../src/lib/public-action-guard');
 const saved={fetch:globalThis.fetch,secret:process.env.TURNSTILE_SECRET_KEY,hosts:process.env.TURNSTILE_ALLOWED_HOSTNAMES,key:process.env.PUBLIC_ACTION_IP_HASH_KEY};
 process.env.TURNSTILE_SECRET_KEY='mock-secret';process.env.TURNSTILE_ALLOWED_HOSTNAMES='portfolio.example';process.env.PUBLIC_ACTION_IP_HASH_KEY='mock-hash-key';
 try {
  for(const result of [{success:false},{success:true,hostname:'wrong.example',action:'contact'},{success:true,hostname:'portfolio.example',action:'chat'}]){
   globalThis.fetch=async()=>Response.json(result);await assert.rejects(verifyChallenge('synthetic','contact'),e=>e instanceof ActionDenied && e.status===403);
  }
  globalThis.fetch=async()=>Response.json({success:true,hostname:'portfolio.example',action:'contact'});await verifyChallenge('synthetic','contact');
  await assert.rejects(verifyChallenge('', 'contact'),e=>e instanceof ActionDenied && e.status===403);
 }finally{
  globalThis.fetch=saved.fetch;
  for(const [key,value] of Object.entries({TURNSTILE_SECRET_KEY:saved.secret,TURNSTILE_ALLOWED_HOSTNAMES:saved.hosts,PUBLIC_ACTION_IP_HASH_KEY:saved.key})) {if(value===undefined)delete process.env[key];else process.env[key]=value;}
 }
});
