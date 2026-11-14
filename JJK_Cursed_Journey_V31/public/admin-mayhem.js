'use strict';
// V31 Admin Mayhem: one shared catalog used by the Node server and the browser.
(function(root, factory){const catalog=factory();if(typeof module==='object'&&module.exports)module.exports=catalog;if(root)root.JJKMayhem=catalog;})(typeof window!=='undefined'?window:null, function(){
 const XP_FACTORS=Object.freeze(Array.from({length:15},(_,i)=>(i+1)*2));
 const WEATHER=Object.freeze({
  cursed_rain: {name:'CURSED RAIN',icon:'🌧️',xp:1.5,coins:2,damage:1,detail:'Double coins · 1.5× XP',color:'#67a9ff'},
  blood_moon: {name:'BLOOD MOON',icon:'🌕',xp:3,coins:1,damage:1.3,detail:'3× XP · 30% more boss damage',color:'#e45478'},
  thunderstorm: {name:'THUNDERSTORM',icon:'⚡',xp:2,coins:1.5,damage:1.4,detail:'2× XP · 40% more boss damage',color:'#a4d9ff'},
  snowfall: {name:'CURSED SNOW',icon:'❄️',xp:2,coins:2,damage:1,detail:'2× XP and coins',color:'#b9e5ff'},
  meteor_shower: {name:'METEOR SHOWER',icon:'☄️',xp:4,coins:1.5,damage:1.6,detail:'4× XP · 60% more boss damage',color:'#ff976d'},
  solar_eclipse: {name:'SOLAR ECLIPSE',icon:'🌑',xp:3,coins:1.5,damage:1.25,detail:'3× XP · shadow damage boost',color:'#b4a0fc'},
  sakura_bloom: {name:'SAKURA BLOOM',icon:'🌸',xp:2,coins:3,damage:1,detail:'2× XP · 3× coins',color:'#ffa6d7'},
  golden_hour: {name:'GOLDEN HOUR',icon:'🌟',xp:1.5,coins:5,damage:1.15,detail:'5× coins · golden strikes',color:'#ffce6e'},
  soul_fog: {name:'SOUL FOG',icon:'👻',xp:2.5,coins:2,damage:1.2,detail:'2.5× XP · 2× coins',color:'#b9d7d4'},
  domain_storm: {name:'DOMAIN STORM',icon:'🌀',xp:5,coins:3,damage:1.8,detail:'5× XP · 3× coins · 80% boss damage',color:'#b88eff'}
 });
 const EVENTS=Object.freeze({
  jackpot:{name:'CURSED JACKPOT',icon:'💰',detail:'Bonus coins + Golden Hour + coin boost'},
  king_rampage:{name:'KING OF CURSES',icon:'👹',detail:'Heian Sukuna raid + Blood Moon + XP frenzy'},
  boss_rush:{name:'BOSS RUSH',icon:'⚔️',detail:'Fight Finger Bearer, Jogo, then Heian Sukuna'},
  meteor_madness:{name:'METEOR MADNESS',icon:'☄️',detail:'Meteor weather + 8× XP'},
  domain_collapse:{name:'DOMAIN COLLAPSE',icon:'🌀',detail:'Domain Storm + 10× XP'},
  blossom_festival:{name:'BLOSSOM FESTIVAL',icon:'🌸',detail:'Sakura weather + party coins + 4× XP'},
  thunder_surge:{name:'THUNDER SURGE',icon:'⚡',detail:'Thunderstorm + full energy + 6× XP'},
  boss_takeover:{name:'BOSS TAKEOVER',icon:'🎭',detail:'Everyone becomes a boss with empowered attacks'},
  training_day:{name:'GOD-TIER TRAINING',icon:'📈',detail:'12× XP + heal everyone + Golden Hour'},
  chaos_roulette:{name:'CHAOS ROULETTE',icon:'🎰',detail:'Mystery weather + 14× XP + random boss form'}
 });
 const BOSS_FORMS=Object.freeze({finger:'Finger Bearer',jogo:'Jogo',hanami:'Hanami',mahito:'Mahito',dagon:'Dagon',kenjaku:'Kenjaku',mahoraga:'Mahoraga',sukuna:'Sukuna',heian:'Heian Sukuna'});
 return Object.freeze({XP_FACTORS,WEATHER,EVENTS,BOSS_FORMS});
});
