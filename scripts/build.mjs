import {cp,mkdir,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist');
for(const p of ['index.html','solicitar-proposta.html','privacidade-propostas.html','assets','shared']) await cp(p,'dist/'+p,{recursive:true});
console.log('Site estático e formulário preparados em dist.');
