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
test('conceptual covers suppress boilerplate AI notices while screenshots, diagrams and provenance stay honest', async () => {
 const {CONCEPTUAL_PROVENANCE,isConceptualMedia}=await import('../src/lib/content/media-classification');
 const {COPY}=await import('../src/lib/content/copy');
 assert.equal(classifiedCaption({id:'m',kind:'cover',url:'/cover.webp',classification:'ai-concept',caption:{en:'Conceptual artwork; not a product screenshot.',tr:'Kavramsal görsel; ürün ekran görüntüsü değildir.'}}),undefined);
 assert.equal(classifiedCaption({id:'m2',kind:'cover',url:'/cover.webp',classification:'editorial-illustration',caption:{en:'Editorial illustration — not a product screenshot',tr:'Editoryal illüstrasyon — ürün ekran görüntüsü değildir'}}),undefined);
 assert.deepEqual(classifiedCaption({id:'m3',kind:'cover',url:'/cover.webp',classification:'ai-concept',caption:{en:'Lighting study for arena lobby',tr:'Arena lobisi ışık çalışması'}}),{en:'Lighting study for arena lobby',tr:'Arena lobisi ışık çalışması'});
 assert.equal(isConceptualMedia({classification:'ai-concept'}),true);
 assert.equal(isConceptualMedia({classification:'authentic-web'}),false);
 assert.deepEqual(CONCEPTUAL_PROVENANCE,{en:'Concept art',tr:'Kavramsal görsel'});
 assert.match(classifiedCaption({id:'m4',kind:'desktop',url:'/demo.webp',classification:'simulated-demo',caption:{en:'Sandbox flow',tr:'Deneme akışı'}})!.tr,/Simüle edilmiş gösterim\. Deneme akışı/);
 assert.equal(classifiedCaption({id:'m5',kind:'diagram',url:'/arch.webp',classification:'architecture-diagram',caption:{en:'Architecture diagram. Event bus',tr:'Mimari diyagram. Olay veri yolu'}})!.en,'Architecture diagram. Event bus');
 assert.equal('colophon' in COPY.footer,false);
});
test('synthetic exact start date stays bilingual and ongoing', () => {
 const period=timelinePeriod({id:'demo-school',published:true,type:'education',title:{en:'demo-school',tr:'demo-school'},company:{en:'demo-school',tr:'demo-school'},period:{en:'',tr:''},description:{en:'',tr:''},order:0,startDate:'2001-03',startDateExact:'2001-03-12',current:true}).period;assert.match(period.en,/12 Mar/);assert.match(period.tr,/12 Mar/);
});

test('BotID Basic requires matching endpoint headers, rejects bots/bypasses and fails closed when unavailable', async () => {
 const {verifyChallenge,ActionDenied}=await import('../src/lib/public-action-guard');
 const savedKey=process.env.PUBLIC_ACTION_IP_HASH_KEY;
 const validReq=(path='/api/contact',method='POST',human='{"v":"1"}')=>new Request(`https://www.tamerakdeniz.com${path}`,{method,headers:{...(human?{'x-is-human':human}:{}),'x-path':path,'x-method':method}});
 try {
  delete process.env.PUBLIC_ACTION_IP_HASH_KEY;
  await assert.rejects(verifyChallenge(validReq(),'', 'contact', async()=>({isHuman:true,isBot:false,isVerifiedBot:false,bypassed:false})),e=>e instanceof ActionDenied && e.status===503);
  process.env.PUBLIC_ACTION_IP_HASH_KEY='mock-hash-key';

  let called=0;
  const countingChecker=async()=>{called++;return {isHuman:true,isBot:false,isVerifiedBot:false,bypassed:false};};
  for(const badReq of [
   new Request('https://www.tamerakdeniz.com/api/contact',{method:'POST'}),
   validReq('/api/chat','POST'),
   validReq('/api/contact','GET'),
   validReq('/api/contact','POST','x'.repeat(16_385)),
  ]){
   await assert.rejects(verifyChallenge(badReq,'','contact',countingChecker),e=>e instanceof ActionDenied && e.status===403);
  }
  assert.equal(called,0,'Malformed or missing BotID headers are rejected before upstream verification');

  for(const verdict of [
   {isHuman:false,isBot:true,isVerifiedBot:false,bypassed:false},
   {isHuman:true,isBot:false,isVerifiedBot:true,bypassed:false},
   {isHuman:true,isBot:false,isVerifiedBot:false,bypassed:true},
  ]){
   await assert.rejects(verifyChallenge(validReq(),'','contact',async()=>verdict),e=>e instanceof ActionDenied && e.status===403);
  }

  await assert.rejects(verifyChallenge(validReq(),'','contact',async()=>{throw new Error('OIDC unavailable');}),e=>e instanceof ActionDenied && e.status===503);
  await assert.rejects(verifyChallenge(validReq(),'','contact',async()=>({isHuman:true,isBot:undefined as unknown as boolean,isVerifiedBot:false,bypassed:false})),e=>e instanceof ActionDenied && e.status===503);

  let seenOpts: unknown;
  await verifyChallenge(validReq('/api/chat'),'','chat',async(opts)=>{seenOpts=opts;return {isHuman:true,isBot:false,isVerifiedBot:false,bypassed:false};});
  assert.deepEqual(seenOpts,{developmentOptions:{isDevelopment:false},advancedOptions:{checkLevel:'basic'}});
 }finally{
  if(savedKey===undefined)delete process.env.PUBLIC_ACTION_IP_HASH_KEY;else process.env.PUBLIC_ACTION_IP_HASH_KEY=savedKey;
 }
});
