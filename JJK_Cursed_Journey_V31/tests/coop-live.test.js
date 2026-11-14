'use strict';
const assert=require('node:assert/strict');
const WS_URL=(process.env.TEST_URL||'ws://127.0.0.1:31377/ws').replace(/\/ws$/,'/coop');
class TestClient {
 constructor(){this.ws=null;this.inbox=[];}
 async connect(){this.ws=new WebSocket(WS_URL);this.ws.addEventListener('message',e=>{try{this.inbox.push(JSON.parse(e.data))}catch{}});await new Promise((resolve,reject)=>{this.ws.addEventListener('open',resolve,{once:true});this.ws.addEventListener('error',reject,{once:true});});await this.wait(m=>m.type==='coopWelcome');return this;}
 send(v){this.ws.send(JSON.stringify(v));}
 async wait(test,timeout=6000){const end=Date.now()+timeout;while(Date.now()<end){let i=this.inbox.findIndex(test);if(i>=0)return this.inbox.splice(i,1)[0];await new Promise(r=>setTimeout(r,20));}throw new Error('Co-op message timeout; got '+this.inbox.slice(-8).map(m=>m.type).join(','));}
 close(){this.ws?.close();}
}
(async()=>{const a=new TestClient(),b=new TestClient();try{
 await a.connect();await b.connect();
 a.send({type:'coopCreate',code:'GROUP123',capacity:2});await a.wait(m=>m.type==='coopJoined');
 b.send({type:'coopJoin',code:'GROUP123'});const j=await b.wait(m=>m.type==='coopJoined');assert.equal(j.room.players.length,2);
 a.send({type:'coopAdminAction',action:'xp',amount:999});await a.wait(m=>m.type==='coopError'&&m.message==='Admin permission required');
 a.send({type:'coopAuth',key:'NOT_VALID'});await a.wait(m=>m.type==='coopError'&&m.message==='Incorrect admin password');
 a.send({type:'coopAuth',key:'TEST_ONLY_16_CHARACTER_KEY_DO_NOT_USE'});await a.wait(m=>m.type==='coopAdminOK');
 a.send({type:'coopAdminAction',action:'xp',amount:1000});await a.wait(m=>m.type==='coopAward');const s=await b.wait(m=>m.type==='coopState'&&m.room.level>1);assert.ok(s.room.level>1);
 a.send({type:'coopAdminAction',action:'morph',scope:'all',hero:'mahito',duration:60});const morph=await b.wait(m=>m.type==='coopMorph');assert.equal(morph.hero,'mahito');
 a.send({type:'coopAdminAction',action:'boss',boss:'heian',zone:0});const boss=await b.wait(m=>m.type==='coopBossStart');assert.equal(boss.boss.id,'heian');assert.equal(boss.boss.zone,0);
 b.send({type:'coopBossPosition',x:755});b.send({type:'coopBossAttack',skill:0});const hit=await b.wait(m=>m.type==='coopBossHit');assert.ok(hit.damage>0);assert.ok(hit.boss.hp<hit.boss.max);
 console.log('PASS actual WebSocket co-op create/join, shared XP, private admin, morph, cross-map boss damage');
 }catch(err){console.error(err);process.exitCode=1;}finally{a.close();b.close();}}
)();
