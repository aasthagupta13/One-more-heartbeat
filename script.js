(()=>{const KEY={camps:"omh_camps",donors:"omh_donors",volunteers:"omh_volunteers",messages:"omh_messages"};const today=new Date();today.setHours(0,0,0,0);const plus=n=>{const d=new Date(today);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};const samples=[["Community Care Blood Drive","Helping Hands Club","Ludhiana","Model Town Community Centre",5],["Share Hope Campus Camp","Campus Social Club","Jalandhar","Student Activity Hall",12],["Youth Volunteer Donation Day","Youth for Change","Chandigarh","Sector 17 Community Hall",19],["Together for Life","Community Care Circle","Amritsar","Public Community Hall",27],["Campus Blood Awareness Drive","Student Welfare Group","Patiala","College Activity Centre",34]].map((x,i)=>({id:"S"+(i+1),title:x[0],club:x[1],city:x[2],venue:x[3],date:plus(x[4]),status:"approved",sample:true}));const read=(k)=>{try{const x=JSON.parse(localStorage.getItem(k));return Array.isArray(x)?x:[]}catch{return []}};const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));const getCamps=()=>{let x=read(KEY.camps);if(!x.length){x=samples;write(KEY.camps,x)}return x};const id=p=>p+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,6);const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));const fmt=s=>new Date(s+"T12:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});const upcoming=()=>getCamps().filter(c=>c.status==="approved"&&c.date>=plus(0));const msg=(el,t,type="success")=>{if(el){el.textContent=t;el.className="message "+type}};window.LC={KEY,read,write,getCamps,upcoming,id,esc,fmt,msg,datePlus:plus,samples};document.addEventListener("DOMContentLoaded",()=>{const b=document.getElementById("menuBtn"),n=document.getElementById("nav");b?.addEventListener("click",()=>{const o=n.classList.toggle("open");b.setAttribute("aria-expanded",String(o))});n?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{n.classList.remove("open");b?.setAttribute("aria-expanded","false")}));})})();
document.addEventListener("DOMContentLoaded",()=>{const s=searchCamp,c=cityFilter,d=dateFilter,g=campGrid;[...new Set(LC.upcoming().map(x=>x.city))].sort().forEach(x=>c.add(new Option(x,x)));function render(){let a=LC.upcoming(),q=s.value.toLowerCase();if(q)a=a.filter(x=>[x.title,x.club,x.city,x.venue].join(" ").toLowerCase().includes(q));if(c.value)a=a.filter(x=>x.city===c.value);if(d.value)a=a.filter(x=>(new Date(x.date)-new Date(LC.datePlus(0)))/86400000<=+d.value);a.sort((x,y)=>x.date.localeCompare(y.date));campCount.textContent=a.length+" camp(s) found";g.innerHTML=a.length?a.map(x=>{const slots=x.slots||{"09:00 AM":8,"10:00 AM":6,"11:00 AM":4,"12:00 PM":5};const map="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(x.venue+", "+x.city);return `<article class="camp-card"><span class="tag">${x.sample?"SAMPLE EVENT":"COMMUNITY PROPOSAL"}</span><h3>${LC.esc(x.title)}</h3><div class="camp-meta"><span><b>📅 Date:</b> ${LC.fmt(x.date)}</span><span><b>⌖ Venue:</b> ${LC.esc(x.venue)}, ${LC.esc(x.city)}</span><span><b>♥ Organizer NGO:</b> ${LC.esc(x.club)}</span></div><iframe class="venue-map" loading="lazy" title="Venue map for ${LC.esc(x.title)}" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(x.venue+", "+x.city)}&output=embed"></iframe><strong style="font-size:12px">Available appointment slots</strong><div class="slot-pills">${Object.entries(slots).map(([t,n])=>`<span>${t} · ${n} left</span>`).join("")}</div><div class="camp-actions"><a href="#donor?camp=${encodeURIComponent(x.id)}">Book a slot →</a><a class="map-link" target="_blank" rel="noopener" href="${map}">View venue map ↗</a></div></article>`}).join(""):'<div class="empty">No camps match these filters.</div>'} [s,c,d].forEach(x=>x.addEventListener("input",render));window.renderCampDirectory=render;render()});
document.addEventListener("DOMContentLoaded",()=>{
 const f=document.getElementById("donorForm"),s=document.getElementById("dCamp"),slot=document.getElementById("dSlot");
 LC.upcoming().forEach(x=>s.add(new Option(`${x.title} — ${x.city} (${LC.fmt(x.date)})`,x.id)));
 s.value=new URLSearchParams((location.hash.split("?")[1]||"")).get("camp")||"";
 function updateSlots(){
  const camp=LC.getCamps().find(x=>x.id===s.value);
  const current=slot.value;
  slot.innerHTML='<option value="">Choose an available slot</option>';
  if(camp){
   const slots=camp.slots||{"09:00 AM":8,"10:00 AM":6,"11:00 AM":4,"12:00 PM":5};
   Object.entries(slots).forEach(([t,n])=>{const o=new Option(`${t} (${n} left)`,t);o.disabled=n<=0;slot.add(o)});
   if(current)slot.value=current;
  }
 }
 s.addEventListener("change",updateSlots);updateSlots();
 f.addEventListener("submit",e=>{
  e.preventDefault();if(!f.reportValidity())return;
  const age=+dAge.value,weight=+dWeight.value,hb=+dHb.value,gap=+dGap.value,phone=dPhone.value.trim();
  if(!/^[6-9]\d{9}$/.test(phone))return LC.msg(donorMsg,"Enter a valid 10-digit Indian mobile number.","error");
  if(!(age>=18&&age<=65&&weight>45&&hb>12.5&&gap>=90))return LC.msg(donorMsg,"The entered details do not meet all four demo criteria. Final medical eligibility is always decided by qualified staff.","error");
  const sc=[...document.querySelectorAll("#donorForm .screen-q")],flagged=sc.filter(q=>q.value!==q.dataset.ok);
  if(flagged.length)return LC.msg(donorMsg,"Your health pre-screening answers ("+flagged.length+" flagged) suggest you may need to wait or speak to medical staff before donating. Please consult an authorized blood centre.","error");
  const camps=LC.getCamps(),camp=camps.find(x=>x.id===s.value);
  if(!camp)return LC.msg(donorMsg,"Please choose a camp.","error");
  camp.slots=camp.slots||{"09:00 AM":8,"10:00 AM":6,"11:00 AM":4,"12:00 PM":5};
  if(!Object.prototype.hasOwnProperty.call(camp.slots,slot.value)||camp.slots[slot.value]<=0)return LC.msg(donorMsg,"That slot is no longer available. Please choose another time.","error");
  const a=LC.read(LC.KEY.donors),x={id:LC.id("APT"),name:dName.value.trim(),age,weight,hb,daysSinceLastDonation:gap,phone,email:dEmail.value.trim(),bloodGroup:dGroup.value,city:dCity.value.trim(),campId:s.value,slot:slot.value,screening:sc.map(q=>q.value)};
  if(a.some(z=>z.email===x.email&&z.campId===x.campId))return LC.msg(donorMsg,"This email already has a demo appointment for that camp.","error");
  camp.slots[slot.value]--;LC.write(LC.KEY.camps,camps);a.push(x);LC.write(LC.KEY.donors,a);
  f.reset();updateSlots();LC.msg(donorMsg,`Demo appointment ${x.id} reserved for ${x.slot}. Remaining slots have been updated. This is not a real medical appointment.`);
 });
});
document.addEventListener("DOMContentLoaded",()=>{const a=[...document.querySelectorAll("#eligChecklist input")],o=document.getElementById("eligProgress");if(!o)return;function update(){o.textContent=`${a.filter(x=>x.checked).length} of ${a.length} reviewed`}a.forEach(x=>x.addEventListener("change",update));update()});
document.addEventListener("DOMContentLoaded",()=>{const base=[["A+",18],["B+",11],["O+",24],["AB+",7],["O-",3]];let data=JSON.parse(localStorage.getItem("omh_stock")||"null")||base.map(([group,units])=>({group,units}));function render(){const f=stockFilter.value;stockGrid.innerHTML=data.filter(x=>!f||x.group===f).map(x=>`<article class="stock"><span class="tag">${x.group}</span><p>Sample units available</p><strong>${x.units}</strong><div class="bar"><span style="width:${Math.min(100,x.units/25*100)}%"></span></div><div class="stock-status ${x.units<5?"critical":x.units<15?"low":"available"}">${x.units<5?"CRITICAL STOCK":x.units<15?"LOW STOCK":"AVAILABLE"}</div><button class="btn outline" data-g="${x.group}">+ Add demo unit</button></article>`).join("");stockGrid.querySelectorAll("button").forEach(b=>b.onclick=()=>{data.find(x=>x.group===b.dataset.g).units++;localStorage.setItem("omh_stock",JSON.stringify(data));render()})}stockFilter.onchange=render;restockDemo.onclick=()=>{data=base.map(([group,units])=>({group,units}));localStorage.setItem("omh_stock",JSON.stringify(data));render()};render()});
document.addEventListener("DOMContentLoaded",()=>{volForm.addEventListener("submit",e=>{e.preventDefault();if(!volForm.reportValidity())return;const a=LC.read(LC.KEY.volunteers);a.push({id:LC.id("VOL"),name:vName.value.trim(),email:vEmail.value.trim(),city:vCity.value.trim(),availability:vTime.value,role:vRole.value});LC.write(LC.KEY.volunteers,a);volForm.reset();LC.msg(volMsg,"Thank you! Your volunteer demo sign-up has been saved.")})});
document.addEventListener("DOMContentLoaded",()=>{oDate.min=LC.datePlus(1);campForm.addEventListener("submit",e=>{e.preventDefault();if(!campForm.reportValidity())return;if(oDate.value<=LC.datePlus(0))return LC.msg(orgMsg,"Choose a future date.","error");const a=LC.getCamps();a.push({id:LC.id("CAMP"),title:oClub.value.trim()+" Community Blood Drive",club:oClub.value.trim(),city:oCity.value.trim(),date:oDate.value,venue:oVenue.value.trim(),description:oDesc.value.trim(),coordinator:oName.value.trim(),email:oEmail.value.trim(),phone:oPhone.value.trim(),status:"pending",sample:false});LC.write(LC.KEY.camps,a);campForm.reset();LC.msg(orgMsg,"Proposal saved to this browser's dashboard. It is pending review, not an approved event.")})});
document.addEventListener("DOMContentLoaded",()=>{function render(){const camps=LC.getCamps(),pending=camps.filter(x=>!x.sample),d=LC.read(LC.KEY.donors),v=LC.read(LC.KEY.volunteers),m=LC.read(LC.KEY.messages),em=LC.read("omh_emergency_interests");dashDonors.textContent=d.length;dashVols.textContent=v.length;dashProposals.textContent=pending.length;dashMessages.textContent=m.length;dashEmergency.textContent=em.length;proposalRows.innerHTML=pending.length?pending.map(x=>`<tr><td>${LC.esc(x.title)}</td><td>${LC.esc(x.city)}</td><td>${LC.fmt(x.date)}</td><td><span class="tag">${LC.esc(x.status)}</span></td><td>${x.status==="pending"?`<button class="btn primary" data-id="${x.id}">Approve</button>`:"—"}</td></tr>`).join(""):'<tr><td colspan="5">No submitted proposals yet.</td></tr>';proposalRows.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>{const x=camps.find(y=>y.id===b.dataset.id);x.status="approved";LC.write(LC.KEY.camps,camps);render();window.renderCampDirectory?.()});donorRows.innerHTML=d.length?d.slice().reverse().map(x=>`<div class="record">${LC.esc(x.name)} · ${LC.esc(x.bloodGroup)} · ${LC.esc(x.city)}</div>`).join(""):'<p class="muted">No donor interests saved.</p>';volRows.innerHTML=v.length?v.slice().reverse().map(x=>`<div class="record">${LC.esc(x.name)} · ${LC.esc(x.role)} · ${LC.esc(x.city)}</div>`).join(""):'<p class="muted">No volunteer sign-ups saved.</p>';emergencyRows.innerHTML=em.length?em.slice().reverse().map(x=>`<div class="record">${LC.esc(x.name)} · ${LC.esc(x.group)} · ${LC.esc(x.city)}</div>`).join(""):'<p class="muted">No emergency interests saved.</p>'}resetDemo.onclick=()=>{if(confirm("Clear demo submissions and restore sample camps?")){[LC.KEY.donors,LC.KEY.volunteers,LC.KEY.messages,"omh_emergency_interests"].forEach(k=>localStorage.removeItem(k));LC.write(LC.KEY.camps,LC.samples);render()}};window.renderDashboard=render;render();window.addEventListener("hashchange",()=>{if(location.hash==="#dashboard")render()})});
document.addEventListener("DOMContentLoaded",()=>{faqSearch.addEventListener("input",()=>{const q=faqSearch.value.toLowerCase();document.querySelectorAll("#faqList details").forEach(x=>x.classList.toggle("hidden",!x.textContent.toLowerCase().includes(q)))})});
document.addEventListener("DOMContentLoaded",()=>{contactForm.addEventListener("submit",e=>{e.preventDefault();if(!contactForm.reportValidity())return;const a=LC.read(LC.KEY.messages);a.push({id:LC.id("MSG"),name:cName.value.trim(),email:cEmail.value.trim(),subject:cSubject.value.trim(),message:cBody.value.trim()});LC.write(LC.KEY.messages,a);contactForm.reset();LC.msg(contactMsg,"Your demo message has been saved in this browser. No email was sent.")})});

document.addEventListener("DOMContentLoaded",()=>{
 const checker=document.getElementById("checkEligibility");
 if(checker) checker.addEventListener("click",()=>{
  const vals=["eAge","eWeight","eHb","eGap"].map(id=>document.getElementById(id).value.trim());
  const out=document.getElementById("eligibilityResult");
  if(vals.some(v=>v==="")||vals.some(v=>!Number.isFinite(Number(v))||Number(v)<0)){LC.msg(out,"Please enter valid values in all four fields.","error");return}
  const [age,weight,hb,gap]=vals.map(Number);
  const ok=age>=18&&age<=65&&weight>45&&hb>12.5&&gap>=90;
  LC.msg(out,ok?"You meet the four basic criteria in this project brief. Final eligibility must be confirmed by medical staff.":"One or more project criteria are not met. Please consult an authorized blood centre for guidance.",ok?"success":"error");
 });
 const ef=document.getElementById("emergencyForm");
 if(ef) ef.addEventListener("submit",e=>{
  e.preventDefault();if(!ef.reportValidity())return;
  const arr=LC.read("omh_emergency_interests");
  arr.push({name:emName.value.trim(),phone:emPhone.value.trim(),group:emGroup.value,city:emCity.value.trim(),created:new Date().toISOString()});
  LC.write("omh_emergency_interests",arr);ef.reset();
  LC.msg(emergencyMsg,"Your demo interest has been saved in this browser. No alert was sent.");
 });
});

(()=>{
 const names=['index','camps','donor','eligibility','inventory','emergency','volunteer','organize','resources','faq','dashboard','about','contact'];
 function show(){let raw=location.hash.slice(1)||'index';let page=raw.split('?')[0];if(!names.includes(page))page='index';document.querySelectorAll('.page-view').forEach(x=>x.hidden=x.id!=='view-'+page);document.querySelectorAll('#nav a').forEach(a=>{a.removeAttribute('aria-current');if(a.getAttribute('href')==='#'+page)a.setAttribute('aria-current','page')});document.title=page.charAt(0).toUpperCase()+page.slice(1)+' | One More Heartbeat';if(page==='donor'){const select=document.getElementById('dCamp');if(select){const q=new URLSearchParams(raw.split('?')[1]||'');if(q.has('camp'))select.value=q.get('camp')}}window.scrollTo(0,0);if(page==="camps")window.renderCampDirectory?.();if(page==="dashboard")window.renderDashboard?.();}
 document.addEventListener('DOMContentLoaded',()=>{show();window.addEventListener('hashchange',show);});
})();

/* One More Heartbeat interaction layer */
(()=>{
 const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
 ready(()=>{
  const body=document.body;
  const progress=document.createElement('div');progress.className='lc-progress';progress.setAttribute('aria-hidden','true');body.appendChild(progress);
  const top=document.createElement('button');top.className='lc-top';top.type='button';top.innerHTML='↑';top.setAttribute('aria-label','Back to top');body.appendChild(top);
  const toast=document.createElement('div');toast.className='lc-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');body.appendChild(toast);
  let toastTimer;const notify=t=>{toast.textContent=t;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2100)};
  const saved=localStorage.getItem('omh_theme');if(saved==='dark')body.classList.add('lc-dark');
  const theme=document.getElementById('themeToggle');const setTheme=()=>{body.classList.toggle('lc-dark');const dark=body.classList.contains('lc-dark');localStorage.setItem('omh_theme',dark?'dark':'light');theme.textContent=dark?'☀':'☾';theme.title=dark?'Switch to light mode':'Switch to dark mode';notify(dark?'Dark mode enabled':'Light mode enabled')};
  if(theme){theme.textContent=body.classList.contains('lc-dark')?'☀':'☾';theme.addEventListener('click',setTheme)}
  const onScroll=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%';top.classList.toggle('show',scrollY>420)};
  addEventListener('scroll',onScroll,{passive:true});onScroll();top.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
  // Animate content into view as the user explores each page.
  const revealTargets=()=>{document.querySelectorAll('.page-view:not([hidden]) .section,.page-view:not([hidden]) .panel,.page-view:not([hidden]) .tile,.page-view:not([hidden]) .camp-card,.page-view:not([hidden]) .stock,.page-view:not([hidden]) .steps article').forEach(el=>{if(!el.classList.contains('reveal'))el.classList.add('reveal')});
   const items=document.querySelectorAll('.page-view:not([hidden]) .reveal');if(!('IntersectionObserver'in window)){items.forEach(x=>x.classList.add('is-visible'));return}
   const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.08});items.forEach(x=>{if(!x.classList.contains('is-visible'))io.observe(x)});
  };
  revealTargets();addEventListener('hashchange',()=>setTimeout(revealTargets,60));
  // Give the hero heart a small burst of floating hearts.
  const heart=document.querySelector('.blood-drop');const burst=()=>{const r=heart.getBoundingClientRect();for(let i=0;i<9;i++){const el=document.createElement('span');el.className='lc-particle';el.textContent=['♥','♡','✦'][i%3];el.style.left=(r.left+r.width/2+(Math.random()*36-18))+'px';el.style.top=(r.top+r.height/2)+'px';el.style.setProperty('--dx',(Math.random()*150-75)+'px');body.appendChild(el);setTimeout(()=>el.remove(),950)}notify('A little kindness makes a big difference ♥')};
  if(heart){heart.addEventListener('click',burst)}
  // Add a soft press response to cards and make external-looking demo links explain their status.
  document.querySelectorAll('.tile,.camp-card,.stock').forEach(el=>el.addEventListener('pointerdown',()=>{el.style.transitionDuration='.12s';setTimeout(()=>el.style.transitionDuration='',180)}));
  // Keep page reveal animations working after dynamic camp/dashboard content is rendered.
  const observer=new MutationObserver(()=>{document.querySelectorAll('.page-view:not([hidden]) .camp-card,.page-view:not([hidden]) .record').forEach(el=>{if(!el.classList.contains('reveal')){el.classList.add('reveal');requestAnimationFrame(()=>el.classList.add('is-visible'))}})});
  observer.observe(document.getElementById('all-pages')||body,{childList:true,subtree:true});
 });
})();

/* Live inventory board on the Camps page: reads the shared stock store and refreshes automatically */
document.addEventListener("DOMContentLoaded",()=>{
 const box=document.getElementById("liveStock"),stamp=document.getElementById("liveStamp");if(!box)return;
 const base=[["A+",18],["B+",11],["O+",24],["AB+",7],["O-",3]];
 const get=()=>{try{const d=JSON.parse(localStorage.getItem("omh_stock"));if(Array.isArray(d)&&d.length)return d}catch{}return base.map(([group,units])=>({group,units}))};
 function draw(){
  box.innerHTML=get().map(x=>{const st=x.units<5?"critical":x.units<15?"low":"available",lb=x.units<5?"CRITICAL STOCK":x.units<15?"LOW STOCK":"AVAILABLE";return `<article class="stock"><span class="tag">${LC.esc(x.group)}</span><p>Sample units available</p><strong>${x.units}</strong><div class="bar"><span style="width:${Math.min(100,x.units/25*100)}%"></span></div><div class="stock-status ${st}">${lb}</div></article>`}).join("");
  stamp.textContent="Last updated "+new Date().toLocaleTimeString("en-IN");
 }
 draw();setInterval(draw,3000);addEventListener("storage",draw);addEventListener("hashchange",draw);
});

