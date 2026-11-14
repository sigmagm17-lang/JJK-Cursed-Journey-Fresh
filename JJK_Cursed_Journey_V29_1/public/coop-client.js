'use strict';
// Cooperative story room UI. All privileged operations require server-side ADMIN_KEY.
(() => {
const $=id=>document.getElementById(id);
let socket=null,room=null,me=null,bridge=null,admin=false,session=false,updates=[],currentMorph={},connecting=false,displayName="SORCERER";
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isActive=()=>session&&socket?.readyState===1&&room;
const send=data=>{if(socket?.readyState===1){socket.send(JSON.stringify(data));return true;}return false;};
function flash(message){$('coopMessage').textContent=message;$('coopMessage').hidden=false;}
function clearFlash(){$('coopMessage').hidden=true;}
const hideIntro=()=>{$('intro').hidden=true;};
function showRoster(){const status=$('coopStatus');status.hidden=!session;$('coopRoomOpen').hidden=!session;if(!room)return;
 $('coopCode').textContent=room.code;$('roomCodeDisplay').textContent=room.code;$('coopPlayers').textContent=`${room.players.length}/${room.capacity} PLAYERS`;
 $('coopLevel').textContent='PARTY LV '+room.level;
 $('coopDifficulty').textContent=`XP x${room.xpMultiplier.toFixed(1)}`;
 $('coopRoomList').innerHTML=room.players.map(p=>`<div><b>${esc(p.name)}</b> <span>LV ${room.level} · ${esc(p.hero)} · ${p.zone===undefined?'?':esc(['High','Streets','Shibuya','Subway','Forest','Ruins','Shrine'][p.zone]||'Map')}</span></div>`).join('');
}
function handle(event){let m;try{m=JSON.parse(event.data);}catch{return;}if(!m||typeof m!=='object')return;
 if(m.type==='coopWelcome'){me=m.id;return;}
 if(m.type==='coopError'){connecting=false;flash(m.message||'Something went wrong');return;}
 if(m.type==='coopJoined'){session=true;room=m.room;me=m.id;connecting=false;clearFlash();hideIntro();$('coopStatus').hidden=false;$('coopAdminOpen').hidden=!admin;showRoster();bridge?.onJoined?.(room,me);send({type:'coopName',name:displayName});return;}
 if(m.type==='coopState'){room=m.room;showRoster();bridge?.onRoom?.(room,me);return;}
 if(m.type==='coopPosition'){bridge?.onPosition?.(m,me);return;}
 if(m.type==='coopAward'){bridge?.onAward?.(m);return;}
 if(m.type==='coopBossStart'){bridge?.onBossStart?.(m.boss);return;}
 if(m.type==='coopBossState'||m.type==='coopBossHit'){bridge?.onBossState?.(m.boss,m);return;}
 if(m.type==='coopBossWon'){bridge?.onBossWon?.(m);return;}
 if(m.type==='coopQuestProgress'){bridge?.onQuestProgress?.(m);return;}
 if(m.type==='coopQuestClaimed'){bridge?.onQuestClaimed?.();return;}
 if(m.type==='coopAdminOK'){admin=true;$('coopAdminOpen').hidden=false;$('adminAuth').hidden=true;$('adminTools').hidden=false;$('adminUnlock').value='';flash('Admin access granted for this session');return;}
 if(m.type==='coopAnnouncement'){bridge?.onAnnouncement?.(m.message);return;}
 if(m.type==='coopMorph'){for(const id of m.targets||[])currentMorph[id]={hero:m.hero,until:m.until};bridge?.onMorph?.(m.targets,m.hero,m.until,me);return;}
 if(m.type==='coopMorphEnd'){for(const id of m.targets||[])delete currentMorph[id];bridge?.onMorphEnd?.(m.targets||[],me);return;}
 if(m.type==='coopLeft'){cleanup(false);return;}
}
function cleanup(disconnected){const wasActive=session;session=false;room=null;me=null;admin=false;connecting=false;currentMorph={};$('coopStatus').hidden=true;$('coopRoomOpen').hidden=true;$('coopRoomSheet').hidden=true;$('adminSheet').hidden=true;$('coopAdminOpen').hidden=true;$('adminAuth').hidden=false;$('adminTools').hidden=true;
 if(wasActive)bridge?.onLeft?.(disconnected);if(disconnected)flash('Room disconnected. Your solo save is safe. Create or join again.');}
function connection(mode,payload){if(connecting)return;connecting=true;clearFlash();const old=socket;if(old){old.onclose=null;old.close();}let proto=location.protocol==='https:'?'wss:':'ws:';try{socket=new WebSocket(proto+'//'+location.host+'/coop');}catch{connecting=false;return flash('WebSocket failed to open');}
 socket.onmessage=handle;socket.onopen=()=>{send({...payload,type:mode});};socket.onerror=()=>{if(!session)flash('Could not connect to the co-op server');};socket.onclose=()=>{if(socket===old)return;cleanup(true);};}
function openAdmin() {if(!isActive()){flash('Start a friend room first, or use Create with 1 player for admin solo mode');return;}$('adminSheet').hidden=false;$('adminAuth').hidden=admin;$('adminTools').hidden=!admin;}
function setup(){
 $('createRoom').onclick=()=>{const code=$('createCode').value.trim().toUpperCase(),capacity=Number($('partySize').value),name=$('playerName').value.trim();if(code&&!/^[A-Z0-9]{4,12}$/.test(code))return flash('Room code needs 4–12 letters or numbers');connection('coopCreate',{code,capacity});displayName=name||'SORCERER';};
 $('joinRoom').onclick=()=>{const code=$('joinCode').value.trim().toUpperCase(),name=$('playerName').value.trim();if(!/^[A-Z0-9]{4,12}$/.test(code))return flash('Enter a 4–12 character room code');connection('coopJoin',{code});displayName=name||'SORCERER';};
 $('coopRoomOpen').onclick=()=>{$('coopRoomSheet').hidden=false;};$('roomClose').onclick=()=>{$('coopRoomSheet').hidden=true;};
 $('roomCopy').onclick=()=>{if(navigator.clipboard?.writeText)navigator.clipboard.writeText(room?.code||'').then(()=>{const o=$('roomCopy');o.textContent='COPIED!';setTimeout(()=>o.textContent='COPY CODE',1300);}).catch(()=>flash('Select and copy the code manually'));else flash('Select and copy the code manually');};
 $('roomLeave').onclick=()=>{send({type:'coopLeave'});socket?.close();cleanup(false);};
 $('coopAdminOpen').onclick=openAdmin;$('adminClose').onclick=()=>{$('adminSheet').hidden=true;};
 $('adminLogin').onclick=()=>{const key=$('adminUnlock').value;send({type:'coopAuth',key});};
 $('adminXp').onclick=()=>send({type:'coopAdminAction',action:'xp',amount:Number($('adminXpAmount').value)});
 $('adminBoss').onclick=()=>send({type:'coopAdminAction',action:'boss',boss:$('adminBossChoice').value,zone:Number($('adminBossZone').value)});
 $('adminMorph').onclick=()=>send({type:'coopAdminAction',action:'morph',hero:$('adminCharacter').value,scope:$('adminScope').value,duration:Number($('adminDuration').value)});
 document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='a'){e.preventDefault();openAdmin();}if(e.key==='Escape'){$('coopRoomSheet').hidden=true;$('adminSheet').hidden=true;}});
 $('coopRoomSheet').onclick=e=>{if(e.target===$('coopRoomSheet'))$('coopRoomSheet').hidden=true;};$('adminSheet').onclick=e=>{if(e.target===$('adminSheet'))$('adminSheet').hidden=true;};
}
window.JJKCoop={init(cb){bridge=cb;setup();},isActive,send,room:()=>room,me:()=>me,morphFor:id=>currentMorph[id],openAdmin};
})();
