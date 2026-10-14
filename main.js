const m=document.querySelector('.menu'),u=document.querySelector('nav ul');
m.onclick=()=>{const o=u.classList.toggle('open');m.setAttribute('aria-expanded',o)};
u.querySelectorAll('a').forEach(a=>a.onclick=()=>u.classList.remove('open'));
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target)}}),{threshold:.12});
document.querySelectorAll('.rv').forEach(el=>rm?el.classList.add('on'):io.observe(el));
const w=document.querySelector('.word'),ws=['Restaurants','Shops','Handwerker','Praxen','Startups'];let i=0;
if(!rm)setInterval(()=>{i=(i+1)%ws.length;w.textContent=ws[i]},2200);
document.getElementById('f').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);
const b=`Name: ${d.get('n')}\nFirma: ${d.get('c')}\nProjekt: ${d.get('t')}\n\n${d.get('m')}`;
location.href='mailto:'+e.target.dataset.mail+'?subject='+encodeURIComponent('Anfrage: '+d.get('t'))+'&body='+encodeURIComponent(b)};
document.getElementById('y').textContent=new Date().getFullYear();
// 3D carousel
const ring=document.querySelector('.ring'),all=[...ring.querySelectorAll('.proj')];let cur=0,vis=all;
function lay(){vis.forEach((c,k)=>{let d=k-cur;const n=vis.length;if(d>n/2)d-=n;if(d<-n/2)d+=n;const a=Math.abs(d);
c.style.transform=`translateX(${d*62}%) translateZ(${-a*260}px) rotateY(${-d*28}deg)`;c.style.filter=a?`blur(${a*3}px) brightness(.6)`:'none';c.style.zIndex=10-a;c.tabIndex=a?-1:0});}
function filt(f){all.forEach(c=>c.classList.toggle('hide',f!=='all'&&!c.dataset.cat.includes(f)));vis=all.filter(c=>!c.classList.contains('hide'));cur=0;lay()}
document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filters button').forEach(x=>x.setAttribute('aria-pressed',x===b));filt(b.dataset.f)});
document.querySelector('.next').onclick=()=>{cur=(cur+1)%vis.length;lay()};document.querySelector('.prev').onclick=()=>{cur=(cur-1+vis.length)%vis.length;lay()};
lay();
