import {fields,stages,visible,validate,clean} from '/shared/proposal.js';
const form=document.getElementById('proposal-form');
let step=0,answers={},consent=false,busy=false,submitted=false;
const submissionKey=crypto.randomUUID(),startedAt=Date.now();
const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n};
function showError(message){document.getElementById('form-error').textContent=message}
function render(){
 document.getElementById('step-label').textContent=`Etapa ${step+1} de 8`;
 document.querySelector('.progress').setAttribute('aria-valuenow',step+1);document.getElementById('progress-fill').style.width=`${(step+1)/8*100}%`;
 document.getElementById('stage-heading').textContent=stages[step];
 document.getElementById('stage-hint').textContent=step===0?'Campos com * são obrigatórios.':step===4?'As informações financeiras são opcionais. Se não souber o saldo, deixe em branco.':'Responda o que souber. Os campos opcionais podem ficar em branco.';
 const nav=document.getElementById('steps');nav.replaceChildren(...stages.map((s,i)=>{const li=el('li',undefined,i===step?'current':'');li.append(el('span',i+1),document.createTextNode(s));return li}));
 const holder=document.getElementById('fields');holder.replaceChildren();
 for(const f of fields[step].filter(f=>visible(f,answers))){
  const wrapper=el('div',undefined,'field'+(f.wide?' wide':''));const label=el('label',f.label+(f.required?' *':''));label.htmlFor=f.key;wrapper.append(label);
  if(f.type==='multi'){
   const checks=el('div',undefined,'checks');for(const o of f.options){const l=el('label');const box=el('input');box.type='checkbox';box.checked=(answers[f.key]||[]).includes(o);box.addEventListener('change',()=>{answers[f.key]=box.checked?[...(answers[f.key]||[]),o]:(answers[f.key]||[]).filter(x=>x!==o);render()});l.append(box,document.createTextNode(o));checks.append(l)}wrapper.append(checks);
  }else{
   let input;
   if(f.options){input=el('select');const blank=el('option','Selecione (opcional)');blank.value='';input.append(blank,...f.options.map(o=>{const n=el('option',o);n.value=o;return n}));}
   else if(f.type==='textarea'){input=el('textarea');input.maxLength=2000;}
   else{input=el('input');input.type=f.type==='money'?'number':f.type||'text';input.maxLength=f.key==='endereco'?300:254;if(f.type==='number'||f.type==='money'){input.min='0';input.step=f.type==='money'?'0.01':'1';input.inputMode=f.type==='money'?'decimal':'numeric'}input.autocomplete=f.type==='email'?'email':f.type==='tel'?'tel':f.key==='responsavel'?'name':'off'}
   input.id=f.key;input.value=answers[f.key]||'';input.required=!!f.required;input.addEventListener('input',()=>{answers[f.key]=input.value;input.removeAttribute('aria-invalid');wrapper.querySelector('.error')?.remove()});
   if(f.options)input.addEventListener('change',render);
   if(f.key==='cnpj')input.addEventListener('blur',()=>{const v=input.value.toUpperCase().replace(/[^A-Z0-9]/g,'');if(v.length===14)input.value=answers[f.key]=`${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8,12)}-${v.slice(12)}`});
   if(f.key==='telefone')input.addEventListener('blur',()=>{let v=input.value.replace(/\D/g,'');if(v.startsWith('55')&&v.length>11)v=v.slice(2);if(v.length===10||v.length===11)input.value=answers[f.key]=`(${v.slice(0,2)}) ${v.slice(2,-4)}-${v.slice(-4)}`});
   wrapper.append(input);
  }holder.append(wrapper);
 }
 const review=document.getElementById('review');review.replaceChildren();
 if(step===7){const details=el('details',undefined,'summary');details.append(el('summary','Conferir suas respostas'));
 for(const [i,group] of fields.entries()){const section=el('section');section.append(el('h3',stages[i]));const edit=el('button',`Editar etapa ${i+1}`,'secondary');edit.type='button';edit.onclick=()=>move(i);section.append(edit);const dl=el('dl');for(const f of group.filter(f=>visible(f,answers))){dl.append(el('dt',f.label),el('dd',Array.isArray(answers[f.key])?answers[f.key].join(', '):answers[f.key]||'Não informado'))}section.append(dl);details.append(section)}review.append(details);
 const label=el('label',undefined,'consent'),box=el('input');box.type='checkbox';box.checked=consent;box.onchange=()=>{consent=box.checked};label.append(box,document.createTextNode('Declaro que as informações fornecidas poderão ser utilizadas pela ALT Gestão de Condomínios para análise do condomínio, elaboração de proposta comercial e contato relacionado a esta solicitação.'));review.append(label);const p=el('p',undefined,'muted'),a=el('a','Aviso de privacidade');a.href='/privacidade-propostas';p.append(a);review.append(p);
 }
 document.getElementById('back').textContent=step?'← Voltar':'Voltar ao site';document.getElementById('next').textContent=step===7?'Solicitar minha proposta':'Continuar →';showError('');
}
function move(n){step=n;render();document.getElementById('stage-heading').focus()}
function displayErrors(errors){for(const [key,message]of Object.entries(errors)){const input=document.getElementById(key);if(input){input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby',key+'-error');const err=el('p',message,'error');err.id=key+'-error';input.parentElement.append(err)}}document.getElementById(Object.keys(errors)[0])?.focus()}
form.addEventListener('submit',async e=>{e.preventDefault();if(busy)return;const errors=validate(answers,step);if(Object.keys(errors).length){displayErrors(errors);return}if(step<7){move(step+1);return}const all=validate(answers);if(Object.keys(all).length){move(fields.findIndex(g=>g.some(f=>all[f.key])));displayErrors(all);return}if(!consent){showError('Confirme a utilização das informações para solicitar a proposta.');return}
 busy=true;showError('');for(const b of form.querySelectorAll('button'))b.disabled=true;document.getElementById('next').textContent='Enviando…';
 try{const response=await fetch('/api/propostas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answers:clean(answers),consent,submissionKey,startedAt,website:form.elements.website.value})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Não foi possível registrar agora. Tente novamente.');submitted=true;const card=form.parentElement;card.replaceChildren(el('div','✓','success-mark'),el('h2','Recebemos as informações do seu condomínio!'),el('p','Obrigado pelo interesse na ALT Gestão de Condomínios. Nossa equipe analisará as informações fornecidas e entrará em contato para dar continuidade à elaboração da proposta.'),el('p',`Protocolo: ${data.protocol}`,'muted'));const a=el('a','Falar com a ALT pelo WhatsApp ↗','button');a.href='https://wa.me/5555991016243';card.append(a)}catch(error){showError(error.message+' Suas respostas foram mantidas.')}finally{busy=false;for(const b of form.querySelectorAll('button'))b.disabled=false;document.getElementById('next')&&(document.getElementById('next').textContent='Solicitar minha proposta')}
});
document.getElementById('back').onclick=()=>step?move(step-1):location.assign('/');
window.addEventListener('beforeunload',e=>{if(Object.keys(answers).length&&!submitted){e.preventDefault();e.returnValue=''}});render();
