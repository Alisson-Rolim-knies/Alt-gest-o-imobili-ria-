import {randomUUID,createHmac} from 'node:crypto';
import {clean,validate,validateQuick} from '../shared/proposal.js';
export class InputError extends Error {constructor(message,status=400){super(message);this.status=status}}
export function validateSubmission(body){
 if(!body||typeof body!=='object'||!body.answers||typeof body.answers!=='object'||Array.isArray(body.answers)||body.consent!==true||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.submissionKey||'')||body.website||!Number.isFinite(body.startedAt)||Date.now()-body.startedAt<3000)throw new InputError('Confira os dados e tente novamente.');
 if(body.formVersion!==undefined && body.formVersion!==2)throw new InputError('Versão do formulário inválida.');
 if(Object.keys((body.formVersion===2?validateQuick:validate)(body.answers)).length)throw new InputError('Confira os campos obrigatórios e os dados informados.');return clean(body.answers)
}
export function createService({store,makePdf,sendMail,rateSecret}){
 async function deliver(row){if(row.notification_state==='sent')return;const claimed=await store.claim(row.id);if(!claimed)return;try{const pdf=await makePdf(claimed);await sendMail(claimed,pdf);await store.result(row.id,'sent')}catch(error){await store.result(row.id,error.code==='MISSING_MAIL'?'configuration_required':'failed')}}
 return {deliver,async submit(body,ip){const answers=validateSubmission(body);const rateKey=createHmac('sha256',rateSecret).update(ip).digest('hex');if(!await store.rate(rateKey))throw new InputError('Muitas tentativas. Aguarde antes de tentar novamente.',429);let row=await store.find(body.submissionKey);if(!row){const id=randomUUID();row=await store.save({id,submission_key:body.submissionKey,protocol:'ALT-'+id.slice(0,8).toUpperCase(),answers,units:body.formVersion===2?Number(answers.unidades_total):answers.comerciais==='Não sei informar'?null:Number(answers.unidades)+Number(answers.quantidade_comerciais||0)})}try{await deliver(row)}catch{}return {protocol:row.protocol}}}
}
