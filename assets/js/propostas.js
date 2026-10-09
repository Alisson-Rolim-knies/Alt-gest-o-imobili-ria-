import {quickFields as fields, quickStages as stages, visible, validateQuick as validate, clean} from '/shared/proposal.js';

const form = document.getElementById('proposal-form');
const lastStep = stages.length - 1;
const submissionKey = crypto.randomUUID();
const startedAt = Date.now();
let step = 0, answers = {}, consent = false, busy = false, submitted = false, detailsOpen = false;

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function showError(message) { document.getElementById('form-error').textContent = message; }
function refreshFrom(id) {
  render();
  document.getElementById(id)?.focus({preventScroll: true});
}
function field(f) {
  const wrapper = el('div', undefined, 'field' + (f.wide ? ' wide' : ''));
  if (f.type === 'multi') {
    const group = el('fieldset');
    group.append(el('legend', f.label, 'label'));
    const checks = el('div', undefined, 'checks');
    for (const [i, option] of f.options.entries()) {
      const label = el('label'), box = el('input');
      box.type = 'checkbox'; box.id = `${f.key}-${i}`;
      box.checked = (answers[f.key] || []).includes(option);
      box.onchange = () => {
        answers[f.key] = box.checked ? [...(answers[f.key] || []), option] : (answers[f.key] || []).filter(x => x !== option);
        refreshFrom(box.id);
      };
      label.append(box, document.createTextNode(option)); checks.append(label);
    }
    group.append(checks); wrapper.append(group);
    return wrapper;
  }
  const label = el('label', f.label + (f.required ? ' *' : ''));
  label.htmlFor = f.key; wrapper.append(label);
  let input;
  if (f.options) {
    input = el('select');
    const blank = el('option', 'Selecione se souber'); blank.value = '';
    input.append(blank, ...f.options.map(option => { const n = el('option', option); n.value = option; return n; }));
  } else if (f.type === 'textarea') {
    input = el('textarea'); input.maxLength = 2000;
  } else {
    input = el('input'); input.type = f.type || 'text'; input.maxLength = f.type === 'email' ? 254 : 150;
    if (f.type === 'number') { input.min = String(f.min ?? 0); input.step = '1'; input.inputMode = 'numeric'; }
    input.autocomplete = f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : f.key === 'responsavel' ? 'name' : f.key === 'cidade' ? 'address-level2' : 'off';
  }
  input.id = f.key; input.value = answers[f.key] || ''; input.required = !!f.required;
  if (f.placeholder) input.placeholder = f.placeholder;
  input.addEventListener('input', () => {
    answers[f.key] = input.value;
    input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby');
    wrapper.querySelector('.error')?.remove();
  });
  if (f.options) input.onchange = () => refreshFrom(f.key);
  if (f.key === 'telefone') input.onblur = () => {
    let digits = input.value.replace(/\D/g, '');
    if (digits.startsWith('55') && digits.length > 11) digits = digits.slice(2);
    if (digits.length === 10 || digits.length === 11) input.value = answers[f.key] = `(${digits.slice(0, 2)}) ${digits.slice(2, -4)}-${digits.slice(-4)}`;
  };
  wrapper.append(input);
  if (f.hint) {
    const hint = el('p', f.hint, 'field-hint'); hint.id = f.key + '-hint';
    input.setAttribute('aria-describedby', hint.id); wrapper.append(hint);
  }
  return wrapper;
}
function render() {
  document.getElementById('step-label').textContent = `Etapa ${step + 1} de ${stages.length}`;
  const progress = document.querySelector('.progress');
  progress.setAttribute('aria-valuemax', stages.length); progress.setAttribute('aria-valuenow', step + 1);
  document.getElementById('progress-fill').style.width = `${(step + 1) / stages.length * 100}%`;
  document.getElementById('stage-heading').textContent = stages[step];
  document.getElementById('stage-hint').textContent = step === 0 ? 'Só os dados essenciais para começarmos. Campos com * são obrigatórios.' : 'Esta etapa é opcional. Você já pode confirmar e enviar sua solicitação.';
  document.getElementById('steps').replaceChildren(...stages.map((name, i) => {
    const li = el('li', undefined, i === step ? 'current' : '');
    if (i === step) li.setAttribute('aria-current', 'step');
    li.append(el('span', i < step ? '✓' : i + 1), document.createTextNode(name)); return li;
  }));
  const holder = document.getElementById('fields');
  holder.replaceChildren(...fields[step].filter(f => !f.optionalDetail && visible(f, answers)).map(field));
  if (step === lastStep) {
    const details = el('details', undefined, 'optional-details wide'); details.open = detailsOpen;
    details.append(el('summary', 'Adicionar detalhes do condomínio (opcional)'));
    details.append(el('p', 'Preencha apenas se quiser. Podemos conversar sobre isso depois.', 'muted'));
    const extra = el('div', undefined, 'fields');
    extra.append(...fields[step].filter(f => f.optionalDetail && visible(f, answers)).map(field));
    details.append(extra); details.ontoggle = () => { detailsOpen = details.open; }; holder.append(details);
  }
  const review = document.getElementById('review'); review.replaceChildren();
  if (step === lastStep) {
    const summary = el('details', undefined, 'summary'); summary.append(el('summary', 'Conferir meus dados'));
    const dl = el('dl');
    for (const f of fields.flat().filter(f => visible(f, answers))) {
      const value = Array.isArray(answers[f.key]) ? answers[f.key].join(', ') : answers[f.key];
      if (value) dl.append(el('dt', f.label), el('dd', value));
    }
    summary.append(dl);
    const edit = el('button', 'Editar condomínio e contato', 'secondary'); edit.type = 'button'; edit.onclick = () => move(0);
    summary.append(edit); review.append(summary);
    const label = el('label', undefined, 'consent'), box = el('input');
    box.id = 'consent'; box.type = 'checkbox'; box.checked = consent; box.required = true;
    box.onchange = () => { consent = box.checked; showError(''); };
    label.append(box, document.createTextNode('Autorizo a ALT a usar os dados informados para elaborar a proposta e entrar em contato comigo.'));
    const privacy = el('a', 'Aviso de privacidade'); privacy.href = '/privacidade-propostas';
    const p = el('p', undefined, 'muted'); p.append(privacy);
    review.append(label, p);
  }
  document.getElementById('back').textContent = step ? '← Voltar' : 'Voltar ao site';
  document.getElementById('next').textContent = step === lastStep ? 'Solicitar proposta →' : 'Continuar →';
  showError('');
}
function move(nextStep) {
  step = nextStep; render(); document.getElementById('stage-heading').focus();
}
function displayErrors(errors) {
  if (Object.keys(errors).some(key => fields[step].some(f => f.key === key && f.optionalDetail))) {
    detailsOpen = true; render();
  }
  for (const [key, message] of Object.entries(errors)) {
    const input = document.getElementById(key);
    if (!input) continue;
    document.getElementById(key + '-error')?.remove();
    input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', key + '-error');
    const error = el('p', message, 'error'); error.id = key + '-error'; input.parentElement.append(error);
  }
  document.getElementById(Object.keys(errors)[0])?.focus();
}
form.addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  const errors = validate(answers, step);
  if (Object.keys(errors).length) { displayErrors(errors); return; }
  if (step < lastStep) { move(step + 1); return; }
  const allErrors = validate(answers);
  if (Object.keys(allErrors).length) {
    const errorStep = fields.findIndex(group => group.some(f => allErrors[f.key]));
    move(Math.max(0, errorStep)); displayErrors(allErrors); return;
  }
  if (!consent) { showError('Autorize o contato para enviar sua solicitação.'); document.getElementById('consent').focus(); return; }
  const payload = {formVersion: 2, answers: clean(answers), consent, submissionKey, startedAt, website: form.elements.website.value};
  busy = true; showError('');
  for (const control of form.querySelectorAll('button,input,select,textarea')) control.disabled = true;
  document.getElementById('next').textContent = 'Enviando…';
  try {
    const response = await fetch('/api/propostas', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload), signal: AbortSignal.timeout(35000)});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível registrar agora. Tente novamente.');
    submitted = true;
    const card = form.parentElement;
    card.replaceChildren(el('div', '✓', 'success-mark'), el('h2', 'Solicitação recebida!'), el('p', 'Nossa equipe entrará em contato para entender os detalhes e preparar a proposta do seu condomínio.'), el('p', `Protocolo: ${data.protocol}`, 'muted'));
    const contact = el('a', 'Falar com a ALT pelo WhatsApp ↗', 'button'); contact.href = 'https://wa.me/5555991016243'; card.append(contact);
  } catch (error) {
    showError((error.name === 'TimeoutError' ? 'O envio demorou mais que o esperado. Tente novamente.' : error.message) + ' Suas respostas foram mantidas.');
  } finally {
    busy = false;
    for (const control of form.querySelectorAll('button,input,select,textarea')) control.disabled = false;
    const next = document.getElementById('next'); if (next) next.textContent = 'Solicitar proposta →';
  }
});
document.getElementById('back').onclick = () => step ? move(step - 1) : location.assign('/');
window.addEventListener('beforeunload', event => {
  if (Object.keys(answers).length && !submitted) { event.preventDefault(); event.returnValue = ''; }
});
render();
