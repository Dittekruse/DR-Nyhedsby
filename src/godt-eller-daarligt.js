import * as THREE from 'three';

const mount = document.getElementById('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#b7d6e2');
scene.fog = new THREE.Fog('#b7d6e2', 24, 75);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 150);
camera.position.set(0, 11, 27);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x658276, 2.3));
const sun = new THREE.DirectionalLight(0xffffff, 3.2);
sun.position.set(-8, 18, 9); sun.castShadow = true; scene.add(sun);

const mat = (color, roughness=0.82) => new THREE.MeshStandardMaterial({ color, roughness });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(120,120), mat('#a9c89c'));
ground.rotation.x = -Math.PI/2; ground.position.y = -0.05; ground.receiveShadow = true; scene.add(ground);

// En lille, stiliseret 3D-nyhedsplads med to tydelige sorteringszoner.
function box(w,h,d,color,x,y,z, parent=scene, bevel=0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color));
  mesh.position.set(x,y,z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function cylinder(rt,rb,h,color,x,y,z,parent=scene) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,32),mat(color));
  mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function tree(x,z,s=1) {
  cylinder(.12*s,.18*s,.75*s,'#76563a',x,.37*s,z);
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(.62*s,1),mat(['#34764e','#44885b','#286847'][Math.floor(Math.random()*3)]));
  crown.position.set(x,.95*s,z); crown.castShadow=true; scene.add(crown);
}
function building(x,z,w,h,d,color) {
  box(w,h,d,color,x,h/2,z);
  box(w*1.05,.15,d*1.05,'#e7dfcf',x,h+.07,z);
  for(let yy=.35; yy<h-.1; yy+=.45) {
    for(let xx=-w/2+.22; xx<w/2-.1; xx+=.38) {
      box(.13,.18,.035,'#d9eff1',x+xx,yy,z+d/2+.02);
    }
  }
}
building(-8,-3,2.3,3.4,2,'#e8d7bd');
building(-5.4,-5,1.8,2.5,1.8,'#d75b4c');
building(7,-4,2.2,4.4,2,'#d8c8a9');
building(9.5,-1,1.7,2.8,1.7,'#9bb7bd');
for (const [x,z,s] of [[-11,2,1.2],[-9,5,1],[-4,1,.9],[5,3,1],[10,5,1.1],[12,0,.8],[-12,-4,.8]]) tree(x,z,s);

// 3D-pladserne: grøn og rød podieplads.
const goodPlatform = new THREE.Group(); scene.add(goodPlatform);
cylinder(3.9,4.3,.45,'#28784b',-4,.18,1,goodPlatform);
cylinder(3.35,3.35,.12,'#48a86c',-4,.46,1,goodPlatform);
for(let i=0;i<7;i++) {
  const a=i*Math.PI*2/7;
  const post=cylinder(.09,.12,.55,'#f6fff7',-4+Math.cos(a)*3.1,.77,1+Math.sin(a)*2.5,goodPlatform);
}
const badPlatform = new THREE.Group(); scene.add(badPlatform);
cylinder(3.9,4.3,.45,'#a92739',4,.18,1,badPlatform);
cylinder(3.35,3.35,.12,'#e34a57',4,.46,1,badPlatform);
for(let i=0;i<7;i++) {
  const a=i*Math.PI*2/7;
  cylinder(.09,.12,.55,'#fff3f3',4+Math.cos(a)*3.1,.77,1+Math.sin(a)*2.5,badPlatform);
}
// Skulpture af en avis med en rød nyhedsmarkør i midten.
const newsPedestal = new THREE.Group(); scene.add(newsPedestal);
cylinder(1.15,1.3,.55,'#e6e0d5',0,.35,-1.8,newsPedestal);
const paper = box(1.15,1.45,.13,'#fffdf8',0,1.3,-1.8,newsPedestal);
paper.rotation.y=-.13;
for(let i=0;i<4;i++) box(.65,.055,.025,i===0?'#e31b3d':'#a4a4a4',-.03,1.65-i*.25,-1.71,newsPedestal);
const badge = cylinder(.36,.36,.12,'#e31b3d',.35,2.1,-1.8,newsPedestal); badge.rotation.x=Math.PI/2;
const star = new THREE.Mesh(new THREE.IcosahedronGeometry(.35,0),mat('#ffd15c'));
star.position.set(0,2.5,-1.8); star.castShadow=true; newsPedestal.add(star);

// Små veje og markeringer.
box(30,.08,2.3,'#8b9698',0,.02,8);
for(let x=-13;x<14;x+=2.2) box(1,.025,.08,'#f4f1df',x,.07,8);

const news = [
  { tag:'MILJØ · 2023–24', title:'Nordic Waste går helt skævt', desc:'Et enormt jordskred med forurenet jord ved Randers. Oprydningen endte hos myndighederne.', good:false, quip:'Det var ikke lige den slags jordforbindelse, Danmark havde brug for.', source:'Randers Kommune og Danmarks Naturfredningsforening, 2024.' },
  { tag:'GRØNLAND · 2025', title:'Trump vil have Grønland', desc:'Donald Trump gentager, at USA bør få kontrol over Grønland. Grønland svarer, at landet ikke er til salg.', good:false, quip:'Når nogen siger “jeg tager bare lige Grønland”, er det sjældent en hyggelig nabosnak.', source:'Statsministeriet, 15. januar 2025; KNR, januar 2025.' },
  { tag:'KONGEHUSET · 2024', title:'Dronning Margrethe abdicerer', desc:'Efter 52 år på tronen overlader Margrethe rollen til Frederik X.', good:true, quip:'En historisk rokade — og en ret vild måde at holde nytårstale på.', source:'Kongehuset, januar 2024.' },
  { tag:'GRØN OMSTILLING', title:'Danmark bygger vindenergi', desc:'Vindkraft er en central del af Danmarks energiforsyning og grønne omstilling.', good:true, quip:'Blæser det? Ja. Kan vi bruge det til noget? Også ja.', source:'Generel faktuel baggrund om dansk vindenergi.' },
  { tag:'INFRASTRUKTUR · 2025', title:'Vejen ved Nordic Waste genåbner', desc:'Efter jordskredet blev en del af Gl. Århusvej først genåbnet i juni 2025.', good:true, quip:'Det tog sin tid, men asfaltens comeback er trods alt et comeback.', source:'Randers Kommune, opdatering om jordskredet.' },
  { tag:'GRØNLAND · 2025', title:'“Grønland er vores”', desc:'Grønlands ledere afviser amerikanske krav og understreger retten til selv at bestemme.', good:true, quip:'Selvbestemmelse: ikke en ting, man bare kan lægge i indkøbskurven.', source:'KNR og internationale nyhedsoverblik, 2025.' },
  { tag:'MILJØ · 2024', title:'Forurenet jord skaber krise', desc:'Nordic Waste-sagen rejser store spørgsmål om ansvar, miljø og hvem der betaler regningen.', good:false, quip:'En regning, der kom med ekstra meget jord på.', source:'Danmarks Naturfredningsforening, 19. januar 2024.' },
  { tag:'VERDEN · 2024', title:'Krigen i Ukraine fortsætter', desc:'Krigen fortsætter med store menneskelige konsekvenser og sikkerhedspolitiske følger for Europa.', good:false, quip:'En påmindelse om, at nyheder desværre ikke altid har en punchline.', source:'Historisk baggrund; kortet er ikke en udtømmende beskrivelse.' },
  { tag:'DANMARK · 2024', title:'Danmark får ny konge', desc:'Frederik X bliver konge den 14. januar 2024 efter Margrethes abdikation.', good:true, quip:'Nyt job, samme familiechat — bare med lidt mere guld.', source:'Kongehuset, januar 2024.' },
  { tag:'KLIMA · 2024', title:'Iltmangel i danske farvande', desc:'Iltmangel og pres på havmiljøet har været tilbagevendende store miljøhistorier i Danmark.', good:false, quip:'Havet har sendt en ret tydelig besked. Den er bare svær at læse under vand.', source:'Kortet omtaler et veldokumenteret miljøproblem; konkrete målinger varierer efter sted og år.' }
];

let deck=[], index=0, score=0, seconds=45, running=false, interval=null, answered=0;
const $ = id => document.getElementById(id);
function shuffle(items) { return [...items].sort(()=>Math.random()-.5); }
function displayCard() {
  if (index >= deck.length) deck = deck.concat(shuffle(news));
  const n=deck[index];
  $('category').textContent=n.tag;
  $('headline').textContent=n.title;
  $('description').textContent=n.desc;
  $('feedback').textContent='Hvor hører den hjemme?';
  $('newsCard').style.transform='translateY(0) rotate(0deg)';
  $('newsCard').style.opacity='1';
  paper.rotation.y = (Math.random()-.5)*.28;
  star.rotation.y += .8;
}
function answer(isGood) {
  if(!running) return;
  const n=deck[index];
  const correct = isGood===n.good;
  answered++;
  if(correct) { score+=10; $('feedback').textContent='Rigtigt! '+n.quip; $('feedback').style.color='#164e32'; }
  else { $('feedback').textContent='Av, den landede forkert. '+n.quip; $('feedback').style.color='#8f1e2a'; }
  $('score').textContent='Point: '+score;
  $('newsCard').style.transform=`translateY(-8px) rotate(${isGood?-2:2}deg)`;
  $('newsCard').style.opacity='.35';
  index++;
  setTimeout(()=>{ if(running) displayCard(); },230);
  if(correct) {
    const platform=isGood?goodPlatform:badPlatform;
    platform.position.y=.22; setTimeout(()=>platform.position.y=0,180);
  }
}
function finish() {
  running=false; clearInterval(interval);
  const earned=Math.floor(score/10)*5;
  const current=Number(localStorage.getItem('drNyhedsbyCoins') ?? 500);
  localStorage.setItem('drNyhedsbyCoins',String(current+earned));
  $('endTitle').textContent=score>=70?'Danmark overlever endnu en dag.':score>=40?'En blandet dansk nyhedspakke.':'Der er vist brug for en pressebriefing.';
  $('endText').textContent=`Du fik ${score} point og sorterede ${answered} nyheder. Du har tjent ${earned} mønter til din by. ${score>=70?'Du har tydeligvis fulgt med.':score>=40?'Du ramte nogle — og sendte andre direkte i den forkerte bunke.':'Det var en hård nyhedsdag. Prøv igen og få styr på butikken.'}`;
  $('coins').textContent='🪙 '+(current+earned);
  $('endOverlay').classList.remove('hidden');
}
function start() {
  clearInterval(interval); deck=shuffle(news); index=0; score=0; seconds=45; answered=0; running=true;
  $('score').textContent='Point: 0'; $('timer').textContent='⏱ 45';
  $('coins').textContent='🪙 '+Number(localStorage.getItem('drNyhedsbyCoins') ?? 500);
  $('startOverlay').classList.add('hidden'); $('endOverlay').classList.add('hidden');
  displayCard();
  interval=setInterval(()=>{ seconds--; $('timer').textContent='⏱ '+seconds; if(seconds<=0) finish(); },1000);
}
$('goodBtn').addEventListener('click',()=>answer(true));
$('badBtn').addEventListener('click',()=>answer(false));
$('startBtn').addEventListener('click',start);
$('againBtn').addEventListener('click',start);

window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});
function animate() {
  requestAnimationFrame(animate);
  const t=performance.now()*.001;
  newsPedestal.position.y=.07+Math.sin(t*1.5)*.08;
  newsPedestal.rotation.y=Math.sin(t*.3)*.08;
  star.rotation.y=t*.8; star.rotation.x=Math.sin(t)*.18;
  goodPlatform.rotation.y=Math.sin(t*.35)*.025;
  badPlatform.rotation.y=-Math.sin(t*.35)*.025;
  renderer.render(scene,camera);
}
animate();
