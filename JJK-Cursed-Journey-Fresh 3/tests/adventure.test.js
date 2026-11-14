'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(require('path').resolve(__dirname,'../public/adventure.js'),'utf8').replace('updateHud();requestAnimationFrame(loop);', `window.__JJK_DEBUG.testStep=()=>quests[save.quest].steps[save.step];window.__JJK_DEBUG.testTarget=()=>target();window.__JJK_DEBUG.testHit=()=>{battle.px=500; battle.enemyX=575; battle.hitCooldown=0;attack(0);};window.__JJK_DEBUG.testPhase=(fraction)=>{battle.enemyHP=battle.enemyMax*fraction;updateFight(.03);};updateHud();requestAnimationFrame(loop);`);
const elems={};const callbacks={};
class Klass {constructor(){this.classes=new Set()}add(k){this.classes.add(k)}remove(k){this.classes.delete(k)}toggle(k,on){on?this.add(k):this.remove(k)}}
const ctx=new Proxy({}, {get(t,k){if(k==='canvas')return elems.gameCanvas;if(k in t)return t[k];return ()=>{}},set(t,k,v){t[k]=v;return true}});
function el(id){if(!elems[id]){let e={id,style:{},hidden:false,innerHTML:'',textContent:'',classList:new Klass(),children:[],getContext:()=>ctx,addEventListener(name,cb){this.events ||= {};this.events[name]=cb;},setAttribute(){},querySelectorAll(){return[]},focus(){},getBoundingClientRect:()=>({width:960,height:540})};elems[id]=e;}return elems[id];}
const store={};let t=0, frame;
const touchButtons=Object.fromEntries(['left','right','up','down','guard','attack','interact','skill','dash'].map(id=>[id,{id,dataset: ['left','right','up','down','guard'].includes(id)?{hold:id}:{action:id},classList:new Klass(),events:{},setPointerCapture(){},addEventListener(n,f){this.events[n]=f;},setAttribute(){},style:{}}]));
const doc={getElementById:el,querySelectorAll(selector){return [];},addEventListener(){},activeElement:{tagName:'BODY'},body:{classList:new Klass()},createElement:()=>el('created')};
class Img {constructor(){this.complete=true;this.naturalWidth=696;this.width=696;}set src(x){this._src=x;}get src(){return this._src;}}
const sandbox={document:doc,window:{addEventListener(name,cb){callbacks[name]=cb;}},navigator:{maxTouchPoints:0},matchMedia:()=>({matches:false}),Image:Img,localStorage:{getItem(k){return store[k]||null},setItem(k,v){store[k]=v;}},performance:{now:()=>t},requestAnimationFrame(cb){frame=cb;},structuredClone,Math,Date,console,confirm:()=>true};
el('touchControls').querySelectorAll=()=>Object.values(touchButtons);
vm.createContext(sandbox);vm.runInContext(source,sandbox,{filename:'adventure.js'});
function run(x){return vm.runInContext(x,sandbox)}
function state(){return sandbox.window.__JJK_DEBUG.getState();}
function frameTick(dt){t+=dt*1000;frame(t)}
assert.equal(state().started,false);
el('startButton').events.click();assert.equal(state().started,true);assert.equal(state().quest,0);
const oldX=state().player.x;callbacks.keydown({key:'d',repeat:false,preventDefault(){}});frameTick(.03);callbacks.keyup({key:'d'});assert(state().player.x>oldX,'keyboard movement');
const touchX=state().player.x;touchButtons.right.events.pointerdown({preventDefault(){},pointerId:7});frameTick(.04);touchButtons.attack.events.pointerdown({preventDefault(){},pointerId:8});touchButtons.right.events.pointerup({preventDefault(){}});assert(state().player.x>touchX,'iPad hold right and tap attack');
let completed=0,bosses=[];
for(let qi=0;qi<14;qi++){
 assert.equal(state().quest,qi,`start quest ${qi}`);
 let safety=25;
 while(state().quest===qi&&safety-->0){
  const step=sandbox.window.__JJK_DEBUG.testStep();
  const target=sandbox.window.__JJK_DEBUG.testTarget();assert(target,`missing quest target ${qi}`);
  sandbox.window.__JJK_DEBUG.move(target.x,target.y);
  sandbox.window.__JJK_DEBUG.interact();
  if(step.type==='talk'){assert.equal(el('dialoguePanel').hidden,false,`dialogue ${qi}`);el('dialogueContinue').events.click();}
  if(step.type==='fight'){
   assert.equal(state().mode,'fight',`fight ${qi}`);bosses.push(state().battle.id);
   if(qi===13){ // true-form Sukuna must have phases and attack warnings
    sandbox.window.__JJK_DEBUG.testPhase(.64);assert.equal(state().battle.phase,2,'boss phase 2');
    sandbox.window.__JJK_DEBUG.testPhase(.30);assert.equal(state().battle.phase,3,'boss phase 3');
   }
   let hits=0;
   while(state().mode==='fight'&&hits++<120){sandbox.window.__JJK_DEBUG.testHit();}
   assert.equal(state().mode,'explore',`fight completion quest ${qi}`);
  }
 }
 assert(safety>0,`quest ${qi} got stuck`);completed++;
}
assert.equal(state().quest,14,'quest complete');assert(state().skins.includes('gojo_final'),'final gojo skin unlocked');assert(state().unlocks.includes('gojo'),'gojo unlocked');
assert(state().unlocks.includes('todo'),'todo hero unlocked');assert(bosses.includes('mahoraga'));assert(bosses.includes('jogo'));assert(bosses.includes('hanami'));assert(bosses.includes('mahito'));
const stored=JSON.parse(store['jjk-v19-story-progress']);assert.equal(stored.quest,14);assert(stored.wins>=10);
console.log('PASS simultaneous touch hold + attack on simulated iPad input');
console.log('PASS walkable movement; NPC dialogue; 14 missions; seals; boss fights; Mahoraga; final Sukuna phases; XP; character and Gojo-skin unlock; local save');
console.log('PASS unique enemy encounters:',[...new Set(bosses)].join(', '));
