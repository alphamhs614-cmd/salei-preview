import * as THREE from './vendor/three.module.min.js';
const cv=document.getElementById('gl');
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
let r;try{if(rm)throw 0;r=new THREE.WebGLRenderer({canvas:cv,antialias:false,alpha:false,preserveDrawingBuffer:true});}catch(e){document.body.classList.add('static');throw new Error('static');}
const mob=innerWidth<820||matchMedia('(pointer:coarse)').matches;
r.setPixelRatio(Math.min(devicePixelRatio,mob?1.5:2));r.autoClear=false;
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(60,1,.1,400);cam.position.z=12;scene.add(cam);
// fade quad for trails
const fade=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({color:0x05050a,transparent:true,opacity:.16,depthTest:false,depthWrite:false}));
fade.position.z=-.2;fade.scale.set(5,5,1);fade.renderOrder=-1;cam.add(fade);
const tex=(draw,s=256)=>{const c=document.createElement('canvas');c.width=c.height=s;draw(c.getContext('2d'),s);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t};
const glow=tex((g,s)=>{const gr=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.15,'rgba(255,140,90,.9)');gr.addColorStop(.45,'rgba(255,61,127,.35)');gr.addColorStop(1,'rgba(124,92,255,0)');g.fillStyle=gr;g.fillRect(0,0,s,s)});
const orb=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,blending:THREE.AdditiveBlending,depthWrite:false}));orb.scale.set(4,4,1);orb.material.opacity=.75;const C=mob?new THREE.Vector3(0,5.2,0):new THREE.Vector3(7,.5,0);orb.position.copy(C);scene.add(orb);
const S=new THREE.Sprite(new THREE.SpriteMaterial({map:tex((g,s)=>{g.font=`800 ${s*.62}px system-ui,Arial,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.shadowColor='#ff6b35';g.shadowBlur=30;g.fillText('S',s/2,s/2+s*.04)}),transparent:true,depthWrite:false}));S.scale.set(1.8,1.8,1);S.position.copy(C);scene.add(S);
// swarm
const N=mob?1400:4500,pos=new Float32Array(N*3),vel=new Float32Array(N*3),col=new Float32Array(N*3);
const pal=[new THREE.Color('#ff6b35'),new THREE.Color('#ff3d7f'),new THREE.Color('#7c5cff'),new THREE.Color('#ffd0b0')];
for(let i=0;i<N;i++){const a=Math.random()*6.28,rr=2+Math.random()*6;pos[i*3]=Math.cos(a)*rr;pos[i*3+1]=Math.sin(a)*rr;pos[i*3+2]=(Math.random()-.5)*3;const c=pal[i%4];col.set([c.r,c.g,c.b],i*3)}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));pg.setAttribute('color',new THREE.BufferAttribute(col,3));
const sw=new THREE.Points(pg,new THREE.PointsMaterial({size:mob?.2:.18,map:glow,vertexColors:true,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));scene.add(sw);
// starfield along Z
const M=mob?1500:4000,sp=new Float32Array(M*3);for(let i=0;i<M;i++){sp[i*3]=(Math.random()-.5)*120;sp[i*3+1]=(Math.random()-.5)*80;sp[i*3+2]=12-Math.random()*260}
const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
scene.add(new THREE.Points(sg,new THREE.PointsMaterial({size:.25,map:glow,color:0xffb38a,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.8})));
// floating rings along path
for(let k=1;k<9;k++){const m=new THREE.Mesh(new THREE.TorusGeometry(6+k%3*2,.02,8,90),new THREE.MeshBasicMaterial({color:k%2?0xff3d7f:0x7c5cff,transparent:true,opacity:.35}));m.position.set((k%2?1:-1)*4,(k%3-1)*2,-k*28);m.rotation.set(k,k*.5,0);m.userData.s=.1+k*.02;scene.add(m)}
const mouse=new THREE.Vector2(0,0),tgt=new THREE.Vector3();
const mv=(x,y)=>{mouse.set(x/innerWidth*2-1,-(y/innerHeight)*2+1)};
addEventListener('pointermove',e=>mv(e.clientX,e.clientY),{passive:true});addEventListener('touchmove',e=>mv(e.touches[0].clientX,e.touches[0].clientY),{passive:true});
function size(){const w=innerWidth,h=innerHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}size();addEventListener('resize',size);
let run=true,t=0;document.addEventListener('visibilitychange',()=>{run=!document.hidden;if(run)loop()});
r.clear();
function loop(){if(!run)return;requestAnimationFrame(loop);t+=.016;
const sc=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
const cz=12-sc*220;cam.position.z+=(cz-cam.position.z)*.08;cam.position.x+=(mouse.x*1.5-cam.position.x)*.05;cam.position.y+=(mouse.y*1-cam.position.y)*.05;cam.lookAt(cam.position.x*.5,cam.position.y*.5,cam.position.z-12);
tgt.set(mouse.x*8,mouse.y*4.5,0);
for(let i=0;i<N;i++){const j=i*3;let dx=tgt.x-pos[j],dy=tgt.y-pos[j+1],dz=-pos[j+2];const d=Math.sqrt(dx*dx+dy*dy+dz*dz)+.3;
const f=.006/d,sw2=.05/d;vel[j]+=dx*f-dy*sw2;vel[j+1]+=dy*f+dx*sw2;vel[j+2]+=dz*f+Math.sin(t+i)*.002;
// orbit around orb
const ox=C.x-pos[j],oy=C.y-pos[j+1],od=Math.hypot(ox,oy)+.01,rr=(od-(2.2+(i%7)*.35))*.002;vel[j]+=ox/od*rr-oy/od*.012;vel[j+1]+=oy/od*rr+ox/od*.012;
vel[j]*=.96;vel[j+1]*=.96;vel[j+2]*=.96;pos[j]+=vel[j];pos[j+1]+=vel[j+1];pos[j+2]+=vel[j+2]}
pg.attributes.position.needsUpdate=true;
const p=1+Math.sin(t*2)*.06;orb.scale.set(4*p,4*p,1);
scene.children.forEach(o=>{if(o.userData.s){o.rotation.z+=o.userData.s*.02}});
r.render(scene,cam)}
loop();
