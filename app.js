
const FUND_MAP={
 'STO-REG-ALMED':{rc:'15-03-01-03',mfo:'200000-10000-1000',uacs:'50201010-00',desc:'Travelling Expenses - Local'},
 'STO-SEM-ALMED':{rc:'15-03-04-03',mfo:'200000-10000-1000',uacs:'50201010-00',desc:'Travelling Expenses - Local'},
 'STO-FMHFWCROP-ALMED':{rc:'15-05-01-03',mfo:'200000-10000-9000',uacs:'50201010-00',desc:'Travelling Expenses - Local'},
 'LFPA-NSHP-ALMED':{rc:'22-01-01-03',mfo:'310500-20003-2000',uacs:'50201010-00',desc:'Travelling Expenses - Local'}
};
function applyFundMap(){
 const m=FUND_MAP[val('fundCluster')]; if(!m)return;
 set('responsibilityCenter',m.rc);set('mfoPap',m.mfo);set('uacs',m.uacs);
}

let step=1; const maxStep=8;
const form=document.getElementById('tevForm');
const money=n=>Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
function clean(s){return (s||'').trim().replace(/[^\w]+/g,'_').replace(/^_+|_+$/g,'').toUpperCase()||'DESTINATION'}
function val(name){return form.elements[name]?.value||''}
function set(name,v){if(form.elements[name]) form.elements[name].value=v||''}
function dateLabel(d){if(!d)return'';return new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}).replaceAll(' ','_').replace(',','')}
function period(){let a=val('travelStart'),b=val('travelEnd');if(!a&&!b)return'';return a===b||!b?dateLabel(a):`${dateLabel(a)}-${dateLabel(b)}`}
function total(){
 let t=0; document.querySelectorAll('#itinTable tbody tr').forEach(r=>{['fare','perdiem','others'].forEach(c=>t+=Number(r.querySelector(`[data-col="${c}"]`)?.value||0))});
 document.getElementById('itinTotal').textContent=money(t); ['dvAmount','backAmount','orsAmount','orsTotal','cnrrAmount'].forEach(n=>set(n,t.toFixed(2))); return t;
}
function sync(){
 applyFundMap();
 document.querySelectorAll('[data-sync]').forEach(x=>x.value=val(x.dataset.sync));
 set('backPayee',val('payee'));set('orsPayee',val('payee'));set('orsRC',val('responsibilityCenter'));set('orsFund',val('fundCluster'));
 set('orsTO',val('toNumber'));set('orsDate',val('dvDate')||val('toDate'));set('orsDestination',val('destination'));set('orsMFO',val('mfoPap'));
 set('cnrrPayee',val('payee'));set('cnrrTO',val('toNumber'));set('cnrrDestination',val('destination'));set('accTO',val('toNumber'));set('accPeriod',period());set('accPurpose',val('purpose'));set('placesVisited',val('destination'));set('preparedBy',val('payee'));
 const t=total(),dest=clean(val('destination')),folder=`${dest}_${period()||'DATE'}_${t.toFixed(2)}`;
 document.getElementById('folderName').textContent=folder;
 document.getElementById('summary').innerHTML=`<div><small>Payee</small><b>${val('payee')||'—'}</b></div><div><small>Destination</small><b>${val('destination')||'—'}</b></div><div><small>Amount</small><b>₱ ${money(t)}</b></div>`;
}
function show(n){step=Math.max(1,Math.min(maxStep,n));document.querySelectorAll('.step').forEach(x=>x.classList.toggle('active',+x.dataset.step===step));document.querySelectorAll('#steps button').forEach(x=>x.classList.toggle('active',+x.dataset.step===step));document.getElementById('prev').style.visibility=step===1?'hidden':'visible';document.getElementById('next').style.display=step===maxStep?'none':'inline-block';sync();window.scrollTo({top:80,behavior:'smooth'})}
function addRow(data={}){
 const tr=document.createElement('tr');tr.innerHTML=['date','route','departure','arrival','transport','fare','perdiem','others'].map(c=>`<td><input ${c==='date'?'type="date"':(['fare','perdiem','others'].includes(c)?'type="number" step="0.01" min="0"':'')} data-col="${c}" value="${data[c]||''}"></td>`).join('')+`<td><button type="button" class="remove">×</button></td>`;
 tr.querySelector('.remove').onclick=()=>{tr.remove();sync()};tr.querySelectorAll('input').forEach(i=>i.oninput=sync);document.querySelector('#itinTable tbody').appendChild(tr);
}
addRow();document.getElementById('addItin').onclick=()=>addRow();
document.getElementById('next').onclick=()=>show(step+1);document.getElementById('prev').onclick=()=>show(step-1);
document.querySelectorAll('#steps button').forEach(b=>b.onclick=()=>show(+b.dataset.step));
form.addEventListener('input',sync);form.addEventListener('change',sync);
[['toFile','toFileName'],['itinFile','itinFileName']].forEach(([a,b])=>document.getElementById(a).onchange=e=>document.getElementById(b).textContent=e.target.files[0]?.name||'No file selected');
document.getElementById('photos').onchange=e=>document.getElementById('photoCount').textContent=`${e.target.files.length} photo(s) selected`;
function record(){
 const data=Object.fromEntries(new FormData(form).entries());data.cnrrRows=[...document.querySelectorAll('#cnrrTable tbody tr')].map(r=>Object.fromEntries([...r.querySelectorAll('input')].map(i=>[i.dataset.cnrr,i.value])));data.itinerary=[...document.querySelectorAll('#itinTable tbody tr')].map(r=>Object.fromEntries([...r.querySelectorAll('input')].map(i=>[i.dataset.col,i.value])));data.total=total();data.folder=document.getElementById('folderName').textContent;return data;
}
document.getElementById('savePackage').onclick=()=>{localStorage.setItem('tev-current-record',JSON.stringify(record()));alert('Travel record saved in this browser.');};
document.getElementById('exportJson').onclick=()=>{let r=record(),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(r,null,2)],{type:'application/json'}));a.download=r.folder+'_RECORD.json';a.click();URL.revokeObjectURL(a.href)};
document.getElementById('newBtn').onclick=()=>{if(confirm('Start a new travel record?')){form.reset();document.querySelector('#itinTable tbody').innerHTML='';addRow();show(1)}};
const saved=localStorage.getItem('tev-current-record'); if(saved){try{let r=JSON.parse(saved);for(const[k,v]of Object.entries(r)){if(form.elements[k]&&typeof v!=='object')form.elements[k].value=v}if(r.itinerary){document.querySelector('#itinTable tbody').innerHTML='';r.itinerary.forEach(addRow)}}catch(e){}}
show(1);
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function preview(type){
 sync(); const t=total(), panel=document.getElementById('previewPanel');
 document.querySelectorAll('.previewBtn').forEach(b=>b.classList.toggle('selected',b.dataset.preview===type));
 const head=`<div class="sheetPreview"><div class="agency">BUREAU OF SOILS AND WATER MANAGEMENT</div><h3>${esc(type)}</h3>`;
 let body='';
 if(type==='DV') body=`<div class="pgrid"><div class="label">Fund Cluster</div><div>${esc(val('fundCluster'))}</div><div class="label">Payee</div><div>${esc(val('payee'))}</div><div class="label">TIN / ID</div><div>${esc(val('tin'))} / ${esc(val('idNumber'))}</div><div class="label">TO No.</div><div>${esc(val('toNumber'))}</div><div class="label">Destination</div><div>${esc(val('destination'))}</div><div class="label">Responsibility Center</div><div>${esc(val('responsibilityCenter'))}</div><div class="label">MFO/PAP</div><div>${esc(val('mfoPap'))}</div><div class="label">Amount</div><div>₱ ${money(t)}</div><div class="label">Supervising Agriculturist</div><div>${esc(val('supervisor'))}</div></div>`;
 if(type==='ORS') body=`<div class="pgrid"><div class="label">Payee</div><div>${esc(val('payee'))}</div><div class="label">Responsibility Center</div><div>${esc(val('responsibilityCenter'))}<br>${esc(val('fundCluster'))}</div><div class="label">TO No.</div><div>${esc(val('toNumber'))}</div><div class="label">Date</div><div>${esc(val('dvDate')||val('toDate'))}</div><div class="label">Destination</div><div>${esc(val('destination'))}</div><div class="label">MFO/PAP</div><div>${esc(val('mfoPap'))}</div><div class="label">UACS Object Code</div><div>${esc(val('uacs'))}</div><div class="label">Amount / Total</div><div>₱ ${money(t)}</div></div>`;
 if(type==='ITINERARY'){let rows=[...document.querySelectorAll('#itinTable tbody tr')].map(r=>`<tr>${['date','route','departure','arrival','transport','fare','perdiem','others'].map(c=>`<td>${esc(r.querySelector(`[data-col="${c}"]`)?.value||'')}</td>`).join('')}</tr>`).join('');body=`<p><b>${esc(val('payee'))}</b> • ${esc(val('destination'))}</p><table><thead><tr><th>Date</th><th>Place/Route</th><th>Departure</th><th>Arrival</th><th>Transport</th><th>Fare</th><th>DTE</th><th>Others</th></tr></thead><tbody>${rows}</tbody></table><div class="total">Total: <b>₱ ${money(t)}</b></div>`}
 if(type==='CNRR') body=`<div class="pgrid"><div class="label">Payee</div><div>${esc(val('payee'))}</div><div class="label">Amount</div><div>₱ ${money(t)}</div><div class="label">Particulars / Explanation</div><div>${esc(val('cnrrParticulars'))}</div></div>`;
 if(type==='ACCOMPLISHMENT') body=`<div class="pgrid"><div class="label">Period</div><div>${esc(period())}</div><div class="label">T.O. No.</div><div>${esc(val('toNumber'))}</div><div class="label">Purpose</div><div>${esc(val('purpose'))}</div><div class="label">Places Visited</div><div>${esc(val('destination'))}</div><div class="label">Activities Undertaken</div><div>${esc(val('activities'))}</div><div class="label">Accomplishment</div><div>${esc(val('accomplishment'))}</div><div class="label">Remarks</div><div>${esc(val('remarks'))}</div><div class="label">Needed Action</div><div>${esc(val('neededAction'))}</div></div>`;
 panel.innerHTML=head+body+'</div>';
}
document.querySelectorAll('.previewBtn').forEach(b=>b.addEventListener('click',()=>preview(b.dataset.preview)));

function cnrrTotal(){
 let t=0;document.querySelectorAll('#cnrrTable tbody [data-cnrr="amount"]').forEach(i=>t+=Number(i.value||0));
 const el=document.getElementById('cnrrTotal');if(el)el.textContent=money(t);return t;
}
function addCnrrRow(data={}){
 const tr=document.createElement('tr');
 tr.innerHTML=`<td><input type="date" data-cnrr="date" value="${data.date||''}"></td><td><input data-cnrr="particulars" value="${data.particulars||''}" placeholder="e.g. tricycle fare"></td><td><input type="number" step="0.01" min="0" data-cnrr="amount" value="${data.amount||''}"></td><td><button type="button" class="remove">×</button></td>`;
 tr.querySelector('.remove').onclick=()=>{tr.remove();cnrrTotal()};
 tr.querySelectorAll('input').forEach(i=>i.addEventListener('input',cnrrTotal));
 document.querySelector('#cnrrTable tbody').appendChild(tr);
}
if(document.getElementById('addCnrr')){addCnrrRow();document.getElementById('addCnrr').onclick=()=>addCnrrRow();}

async function extractTO_legacy(file){
 const status=document.getElementById('toDetectStatus'), sel=document.getElementById('employeeSelect');
 status.className='detectStatus';status.textContent='Reading Approved TO...';
 let quick=file.name.match(/(20\d{2}-\d{2}-\d{4,6})(?=_|\.|\s|$)/);
 if(quick){set('toNumber',quick[1]);status.textContent='TO Number detected from filename. Reading the TO details...';}
 if(!file){return}
 if(file.type!=='application/pdf' && !file.name.toLowerCase().endsWith('.pdf')){
   status.className='detectStatus warn';status.textContent='Automatic extraction currently supports text-based PDF TO. For scanned/image TO, OCR will be added in the next build.';
   return;
 }
 try{
   const pdfjsLib=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
   pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
   const buf=await file.arrayBuffer(), pdf=await pdfjsLib.getDocument({data:buf}).promise;
   let text='';
   for(let n=1;n<=pdf.numPages;n++){const pg=await pdf.getPage(n),tc=await pg.getTextContent();text+=' '+tc.items.map(x=>x.str).join(' ');}
   const flat=text.replace(/\s+/g,' ').trim();
   const to=(flat.match(/(?:T\.?\s*O\.?|Travel\s*Order)\s*(?:No\.?|#|Number)?\s*[:\-]?\s*([A-Z0-9\-\/]+)/i)||[])[1]||'';
   set('toNumber',to);
   const dates=[...flat.matchAll(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+20\d{2}\b/gi)].map(m=>m[0]);
   if(dates[0]){const d=new Date(dates[0]);if(!isNaN(d))set('travelStart',d.toISOString().slice(0,10));}
   let candidates=[...new Set((flat.match(/\b[A-Z][A-Z.\-']+(?:\s+[A-Z][A-Z.\-']+){2,4}\b/g)||[])
     .map(x=>x.trim()).filter(x=>x.length<55 && !/BUREAU|MANAGEMENT|DEPARTMENT|SECRETARY|TRAVEL ORDER|QUEZON CITY|REPUBLIC|PHILIPPINES/.test(x)))];
   sel.innerHTML='';
   if(candidates.length){
     candidates.forEach(n=>{let o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o)});
     sel.disabled=false;set('payee',candidates[0]);
   }else{sel.innerHTML='<option value="">No employee name detected</option>';sel.disabled=true}
   // Purpose and destination are format-dependent: capture common labeled sections when present.
   const pm=flat.match(/Purpose(?:\s+of\s+Travel)?\s*[:\-]\s*(.{10,220}?)(?=\s(?:Destination|Place|Date|Period|Name|Employee)\s*[:\-]|$)/i);
   if(pm)set('purpose',pm[1].trim());
   const dm=flat.match(/(?:Destination|Place(?:s)?\s+to\s+Visit)\s*[:\-]\s*(.{3,140}?)(?=\s(?:Purpose|Date|Period|Name|Employee)\s*[:\-]|$)/i);
   if(dm)set('destination',dm[1].trim());
   status.className='detectStatus ok';
   status.textContent=`TO read. ${candidates.length} possible employee name(s) detected${candidates.length>1?' — select the correct employee from the dropdown.':'.'} Review the extracted details before continuing.`;
   sync();
 }catch(e){
   status.className='detectStatus warn';status.textContent='Could not automatically read this TO. It may be scanned/image-based or use a different PDF structure.';
 }
}
const tof=document.getElementById('toFile');
if(tof)tof.addEventListener('change',e=>extractTO_v2(e.target.files[0]));
const es=document.getElementById('employeeSelect');
if(es)es.addEventListener('change',()=>sync());


// v0.6 Approved TO reader tailored to the actual BSWM TO layout.
// Supports text PDFs first; if the PDF is scanned, it renders pages and runs OCR.
function normTOText(s){return String(s||'').replace(/\r/g,'\n').replace(/[ \t]+/g,' ').replace(/\n{2,}/g,'\n').trim()}
function toISODate(s){
 if(!s)return '';
 let m=s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})/);
 if(m)return `${m[3]}-${String(m[1]).padStart(2,'0')}-${String(m[2]).padStart(2,'0')}`;
 let d=new Date(s);return isNaN(d)?'':d.toISOString().slice(0,10)
}
function captureLabel(text,label,nextLabels){
 const escLabel=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const next=nextLabels.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
 let re=new RegExp(escLabel+'\\s*:?\\s*([\\s\\S]*?)(?=\\n?\\s*(?:'+next+')\\s*:|$)','i');
 let m=text.match(re);return m?m[1].replace(/\n/g,' ').replace(/\s+/g,' ').trim():'';
}
function extractNamesFromBSWMTO(text){
 const upper=text.toUpperCase();
 let block='';
 let m=upper.match(/NAMES?\s+POSITION\s+MONTHLY\s+SALARY[\s\S]*?(?=OFFICIAL\s+STATION)/i);
 if(m) block=m[0];
 if(!block){
   m=upper.match(/NAMES?[\s\S]*?(?=OFFICIAL\s+STATION)/i); if(m)block=m[0];
 }
 if(!block)return [];
 let names=[];
 // Name rows are before common position terms. Handles WARREN A. DEL ROSARIO and multiple rows.
 const pos=/\b(?:AGRICULTURIST|ENGINEER|SCIENCE RESEARCH|PROJECT|ADMINISTRATIVE|SUPERVISING|SENIOR|CHIEF|OIC|DIRECTOR|TECHNICAL|LABORATORY|SOIL)\b/i;
 for(const raw of block.split(/\n+/)){
   let line=raw.trim().replace(/\s+/g,' ');
   if(!line || /NAMES?|POSITION|MONTHLY|SALARY|STATUS|APPOINTMENT/.test(line))continue;
   let before=line.split(pos)[0].trim();
   if(before && /^[A-ZÑ][A-ZÑ.' -]{5,60}$/.test(before) && before.split(/\s+/).length>=2)names.push(before);
 }
 // OCR often collapses the row into one line.
 if(!names.length){
   let row=block.replace(/\n/g,' ').replace(/\s+/g,' ');
   let mm=row.match(/(?:APPOINTMENT\s*)?([A-ZÑ][A-ZÑ.' -]{5,60}?)(?=\s+(?:AGRICULTURIST|ENGINEER|SCIENCE RESEARCH|PROJECT|ADMINISTRATIVE|SUPERVISING|SENIOR|CHIEF|OIC|DIRECTOR|TECHNICAL|LABORATORY|SOIL)\b)/i);
   if(mm)names.push(mm[1].trim());
 }
 return [...new Set(names.map(n=>n.replace(/\s+/g,' ').trim()))];
}
function parseBSWMTO(raw){
 const text=normTOText(raw), flat=text.replace(/\n/g,' ').replace(/\s+/g,' ');
 let toNo='';
 // Filename-style/visible TO number such as 2026-07-11246.
 let m=flat.match(/\b(20\d{2}-\d{2}-\d{4,6})\b/); if(m)toNo=m[1];
 if(!toNo){m=flat.match(/(?:TRAVEL\s*ORDER|T\.?\s*O\.?)\s*(?:NO\.?|#)?\s*[:\-]?\s*([A-Z0-9\-\/]+)/i);if(m)toNo=m[1]}
 const labels=['Official Station','Departure Date','Return Date','Destination','Specific purpose of the trip','Objective(s)','Per diems expenses allowed','Assistant or laborers allowed','Appropriation to which travel should be charged','Remarks or special instruction','RECOMMENDING APPROVAL','APPROVED'];
 let departure=captureLabel(text,'Departure Date',labels.filter(x=>x!=='Departure Date'));
 let ret=captureLabel(text,'Return Date',labels.filter(x=>x!=='Return Date'));
 let destination=captureLabel(text,'Destination',labels.filter(x=>x!=='Destination'));
 let purpose=captureLabel(text,'Specific purpose of the trip',labels.filter(x=>x!=='Specific purpose of the trip'));
 let names=extractNamesFromBSWMTO(text);
 return {toNo,departure:toISODate(departure),returnDate:toISODate(ret),destination,purpose,names,text};
}
async function pdfText(file){
 const pdfjsLib=window.pdfjsLib;
 pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;
 let text='';
 for(let n=1;n<=pdf.numPages;n++){
   const page=await pdf.getPage(n),tc=await page.getTextContent();
   // preserve rough lines using transform Y positions
   let lastY=null,line=[];
   for(const it of tc.items){
     let y=Math.round(it.transform?.[5]||0);
     if(lastY!==null && Math.abs(y-lastY)>3){text+=line.join(' ')+'\n';line=[]}
     line.push(it.str);lastY=y;
   }
   text+=line.join(' ')+'\n';
 }
 return {text,pdf};
}
async function ocrPdf(pdf,status){
 let all='';
 for(let n=1;n<=pdf.numPages;n++){
   status.textContent=`Scanned TO detected. Reading page ${n} of ${pdf.numPages}...`;
   const page=await pdf.getPage(n),vp=page.getViewport({scale:2});
   const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;
   await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
   const r=await Tesseract.recognize(c,'eng',{logger:m=>{if(m.status==='recognizing text')status.textContent=`Reading TO page ${n}: ${Math.round((m.progress||0)*100)}%`}});
   all+=r.data.text+'\n';
 }
 return all;
}
async function ocrImage(file,status){
 status.textContent='Reading scanned/image TO...';
 const r=await Tesseract.recognize(file,'eng',{logger:m=>{if(m.status==='recognizing text')status.textContent=`Reading TO: ${Math.round((m.progress||0)*100)}%`}});
 return r.data.text;
}
async function extractTO_v2(file){
 const status=document.getElementById('toDetectStatus'),sel=document.getElementById('employeeSelect');
 if(!file)return;
 status.className='detectStatus';status.textContent='Reading Approved TO...';
 try{
   let raw='',pdf=null;
   if(file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')){
     let r=await pdfText(file);raw=r.text;pdf=r.pdf;
     if(raw.replace(/\s/g,'').length<120)raw=await ocrPdf(pdf,status);
   }else if(file.type.startsWith('image/')||/\.(png|jpe?g)$/i.test(file.name)){
     raw=await ocrImage(file,status);
   }else{
     status.className='detectStatus warn';status.textContent='Use PDF, JPG or PNG for automatic TO reading.';return;
   }
   let d=parseBSWMTO_v7(raw,file.name);
   // Fallback TO no. from filename, e.g. 2026-07-11246_signed.pdf
   if(!d.toNo){let fm=file.name.match(/(20\d{2}-\d{2}-\d{4,6})(?=_|\.|\s|$)/);if(fm)d.toNo=fm[1]}
   set('toNumber',d.toNo);set('travelStart',d.departure);set('destination',d.destination);set('purpose',d.purpose);
   sel.innerHTML='';
   if(d.names.length){
     d.names.forEach(n=>{let o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o)});
     sel.disabled=false;sel.value=d.names[0];
   }else{sel.innerHTML='<option value="">No employee name detected</option>';sel.disabled=true}
   const found=[d.toNo&&'TO Number',d.names.length&&`${d.names.length} employee name(s)`,d.departure&&'Departure Date',d.destination&&'Destination',d.purpose&&'Purpose'].filter(Boolean);
   status.className=found.length>=4?'detectStatus ok':'detectStatus warn';
   status.textContent=`Detected: ${found.join(', ')||'no fields'}. ${d.names.length>1?'Select the correct employee from the dropdown. ':''}Review the extracted details before continuing.`;
   sync();
 }catch(err){
   status.className='detectStatus warn';status.textContent='TO could not be read automatically. Please check that the file is a clear PDF/JPG/PNG.';
 }
}


// v0.7 robust BSWM parser: works even when PDF extraction/OCR collapses the page into one line.
function parseBSWMTO_v7(raw,fileName){
 const text=String(raw||'').replace(/\s+/g,' ').trim();
 const result={toNo:'',departure:'',returnDate:'',destination:'',purpose:'',names:[],text};
 let fm=String(fileName||'').match(/(20\d{2}-\d{2}-\d{4,6})(?=_|\.|\s|$)/);
 let tm=text.match(/(?:TRAVEL\s*ORDER|T\.?\s*O\.?)\s*(?:NO\.?|#)?\s*[:\-]?\s*(20\d{2}-\d{2}-\d{4,6})/i) ||
        text.match(/(20\d{2}-\d{2}-\d{4,6})/);
 result.toNo=(tm&&tm[1])||(fm&&fm[1])||'';

 function between(label,next){
   let re=new RegExp(label+'\\s*:?\\s*(.*?)(?=\\s+(?:'+next+')\\s*:|$)','i');
   let m=text.match(re);return m?m[1].trim():'';
 }
 result.departure=toISODate(between('Departure\\s*Date','Return\\s*Date'));
 result.returnDate=toISODate(between('Return\\s*Date','Destination'));
 result.destination=between('Destination','Specific\\s+purpose\\s+of\\s+the\\s+trip');
 result.purpose=between('Specific\\s+purpose\\s+of\\s+the\\s+trip','Objective\\s*\\(s\\)|Objectives?');

 // Pull names from the area between NAMES and Official Station.
 let nm=text.match(/NAMES?\s+(?:POSITION\s+)?(?:MONTHLY\s+SALARY\s+)?(?:STATUS\s+OF\s+APPOINTMENT\s+)?(.*?)(?=\s+Official\s+Station\s*:)/i);
 let block=nm?nm[1]:'';
 if(block){
   // Split before known position titles. Supports multiple employee rows.
   let rx=/([A-ZÑ][A-ZÑ.' -]{4,70}?)(?=\s+(?:AGRICULTURIST|ENGINEER|SCIENCE\s+RESEARCH|PROJECT|ADMINISTRATIVE|SUPERVISING|SENIOR|CHIEF|TECHNICAL|LABORATORY|SOIL)\b)/gi;
   let mm;while((mm=rx.exec(block))!==null){
     let n=mm[1].replace(/\b(?:Permanent|Temporary|Contractual|Coterminous)\b/gi,'').trim();
     if(n.split(/\s+/).length>=2 && !/POSITION|SALARY|STATUS|APPOINTMENT/.test(n))result.names.push(n.toUpperCase());
   }
 }
 result.names=[...new Set(result.names)];
 return result;
}
