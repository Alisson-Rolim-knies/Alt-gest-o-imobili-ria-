import {fields as originalFields, quickFields, visible, validateQuick as validate, clean} from '/shared/proposal.js';

const fields = [quickFields[0].map(f => ({...f, wide: false, ...(f.key === 'responsavel' ? {label: 'Seu nome'} : {}), ...(f.key === 'telefone' ? {label: 'WhatsApp com DDD', placeholder: '(55) 99999-9999'} : {})}))];
const extraFields = ['cnpj', 'agua', 'gas', 'conta', 'funcionarios'].map(key => ({...originalFields.flat().find(f => f.key === key), required: false}));
const stages = ['Dados para sua proposta'];
const form = document.getElementById('proposal-form');
const lastStep = stages.length - 1;
const submissionKey = crypto.randomUUID();
const startedAt = Date.now();
let step = 0, answers = {}, consent = false, busy = false, submitted = false;

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
const banks = ['Banco do Brasil', 'Banrisul', 'Bradesco', 'Caixa Econômica Federal', 'Itaú', 'Inter', 'Nubank', 'Santander', 'Sicoob', 'Sicredi', 'Outro'];
function quickQuestion(f) {
  const wrapper = el('div', undefined, 'field');
  const reading = f.key === 'agua' || f.key === 'gas';
  const title = reading ? `Leitura individual de ${f.key === 'agua' ? 'água' : 'gás'}` : f.key === 'funcionarios' ? 'Funcionários próprios CLT?' : f.label;
  const label = el('label', title); label.htmlFor = f.key;
  const select = el('select'); select.id = f.key;
  const options = reading ? ['Não tem', 'Administradora', 'Empresa terceirizada', 'Síndico / condomínio', 'Não sei informar'] : ['Sim', 'Não', 'Não sei informar'];
  const blank = el('option', 'Selecione'); blank.value = ''; select.append(blank);
  for (const option of options) { const item = el('option', option); item.value = option; select.append(item); }
  select.value = reading ? answers[f.key] === 'Não' ? 'Não tem' : answers[f.key] === 'Não sei informar' ? 'Não sei informar' : answers[f.key + '_leitor'] || '' : answers[f.key] || '';
  select.onchange = () => {
    if (reading) {
      answers[f.key] = select.value === 'Não tem' ? 'Não' : select.value === 'Não sei informar' ? 'Não sei informar' : select.value ? 'Sim' : '';
      if (answers[f.key] === 'Sim') answers[f.key + '_leitor'] = select.value;
      else delete answers[f.key + '_leitor'];
    } else answers[f.key] = select.value;
    if (f.key === 'conta' && answers.conta !== 'Sim') delete answers.banco;
    if (f.key === 'funcionarios' && answers.funcionarios !== 'Sim') delete answers.quantidade_funcionarios;
    refreshFrom(f.key);
  };
  wrapper.append(label, select);
  if (f.key === 'funcionarios') {
    const hint = el('p', 'Contratados pelo condomínio com carteira assinada. Não inclua terceirizados.', 'field-hint');
    hint.id = 'funcionarios-hint'; select.setAttribute('aria-describedby', hint.id); wrapper.append(hint);
  }
  return wrapper;
}
function bankField() {
  const wrapper = el('div', undefined, 'field');
  const label = el('label', 'Qual banco?'); label.htmlFor = 'banco';
  const select = el('select'); select.id = 'banco';
  const blank = el('option', 'Selecione o banco'); blank.value = ''; select.append(blank);
  for (const bank of banks) { const option = el('option', bank); option.value = bank; select.append(option); }
  const custom = answers.banco && !banks.includes(answers.banco);
  select.value = custom ? 'Outro' : answers.banco || '';
  select.onchange = () => { answers.banco = select.value; refreshFrom('banco'); };
  wrapper.append(label, select);
  if (select.value === 'Outro') {
    const otherLabel = el('label', 'Nome do banco', 'other-bank-label'); otherLabel.htmlFor = 'banco-outro';
    const input = el('input'); input.id = 'banco-outro'; input.maxLength = 150; input.placeholder = 'Informe o banco'; input.value = custom ? answers.banco : '';
    input.oninput = () => { answers.banco = input.value; };
    wrapper.append(otherLabel, input);
  }
  return wrapper;
}
function render() {
  document.getElementById('stage-heading').textContent = 'Solicite sua proposta';
  document.getElementById('stage-hint').textContent = 'Preencha os campos com * e selecione as opções que souber.';
  const holder = document.getElementById('fields'); holder.replaceChildren();
  const basics = el('fieldset', undefined, 'form-section wide');
  basics.append(el('legend', 'Condomínio e contato', 'section-title'));
  const basicsGrid = el('div', undefined, 'fields section-fields');
  basicsGrid.append(...fields[0].map(field)); basics.append(basicsGrid);
  const extra = el('fieldset', undefined, 'form-section wide');
  extra.append(el('legend', 'Sobre o condomínio', 'section-title'), el('p', 'Opcional · Se não souber, pode deixar em branco.', 'section-caption'));
  const extrasGrid = el('div', undefined, 'fields section-fields');
  extrasGrid.append(field({...extraFields[0], wide: true, placeholder: '00.000.000/0000-00'}));
  for (const f of extraFields.slice(1)) {
    extrasGrid.append(quickQuestion(f));
    if (f.key === 'conta' && answers.conta === 'Sim') extrasGrid.append(bankField());
    if (f.key === 'funcionarios' && answers.funcionarios === 'Sim') extrasGrid.append(field({...originalFields.flat().find(item => item.key === 'quantidade_funcionarios'), required: false, label: 'Quantos funcionários próprios?', min: 1, placeholder: 'Ex.: 2'}));
  }
  extra.append(extrasGrid); holder.append(basics, extra);
  const review = document.getElementById('review'); review.replaceChildren();
  const label = el('label', undefined, 'consent'), box = el('input');
  box.id = 'consent'; box.type = 'checkbox'; box.checked = consent; box.required = true;
  box.onchange = () => { consent = box.checked; showError(''); };
  label.append(box, document.createTextNode('Autorizo a ALT a entrar em contato para preparar minha proposta.'));
  const privacy = el('a', 'Aviso de privacidade'); privacy.href = '/privacidade-propostas';
  const p = el('p', undefined, 'muted'); p.append(privacy);
  review.append(label, p);
  document.getElementById('back').textContent = 'Voltar ao site';
  document.getElementById('next').textContent = 'Solicitar proposta →';
  showError('');
}
function move(nextStep) {
  step = nextStep; render(); document.getElementById('stage-heading').focus();
}
function displayErrors(errors) {
  if (Object.keys(errors).some(key => fields[step].some(f => f.key === key && f.optionalDetail))) {
    render();
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
