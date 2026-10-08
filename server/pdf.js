import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import {readFile} from 'node:fs/promises';
import {fields,stages,visible} from '../shared/proposal.js';
const purple=rgb(79/255,44/255,104/255),ink=rgb(.15,.14,.16),muted=rgb(.43,.41,.46);
export async function createProposalPdf(row){
 const pdf=await PDFDocument.create();pdf.setTitle('Solicitação de proposta - '+row.answers.condominio);pdf.setAuthor('ALT Gestão de Condomínios');
 const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const logo=await pdf.embedPng(await readFile(new URL('../assets/img/logo-roxa.png',import.meta.url)));
 let page,y;const width=595.28,height=841.89,margin=48;
 const safe=value=>[...String(value??'')].map(c=>{if(c==='\n')return c;try{regular.encodeText(c);return c}catch{return '?'}}).join('');
 function newPage(){page=pdf.addPage([width,height]);page.drawRectangle({x:0,y:height-5,width,height:5,color:purple});const size=logo.scaleToFit(108,72);page.drawImage(logo,{x:margin,y:height-97,width:size.width,height:size.height});page.drawText('SOLICITAÇÃO DE PROPOSTA',{x:width-255,y:height-55,size:11,font:bold,color:purple});page.drawText(safe(row.protocol),{x:width-255,y:height-74,size:9,font:regular,color:muted});page.drawLine({start:{x:margin,y:height-112},end:{x:width-margin,y:height-112},thickness:.6,color:rgb(.88,.86,.9)});y=height-143}
 function line(text,font=regular,size=10,color=ink){if(y<65)newPage();page.drawText(safe(text),{x:margin,y,size,font,color});y-=size+5}
 function wrapped(text,font=regular,size=10,color=ink){
  const available=width-margin*2;
  for(const paragraph of safe(text).split('\n')){
   let current='';
   for(const word of paragraph.split(/\s+/)){
    if(!word)continue;
    if(font.widthOfTextAtSize(word,size)>available){if(current){line(current,font,size,color);current=''}let part='';for(const char of word){if(font.widthOfTextAtSize(part+char,size)>available){line(part,font,size,color);part=char}else part+=char}current=part;continue}
    const candidate=current?current+' '+word:word;
    if(font.widthOfTextAtSize(candidate,size)>available){line(current,font,size,color);current=word}else current=candidate;
   }
   line(current,font,size,color);
  }
 }

 newPage();wrapped(row.answers.condominio,bold,20,purple);line('Recebida em '+new Date(row.created_at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}),regular,9,muted);y-=12;
 for(let i=0;i<fields.length;i++){if(y<130)newPage();wrapped(`${i+1}. ${stages[i]}`,bold,12,purple);y-=5;for(const f of fields[i].filter(f=>visible(f,row.answers))){if(y<100)newPage();wrapped(f.label,bold,9,muted);const v=row.answers[f.key];wrapped(Array.isArray(v)?v.join(', '):v||'Não informado',regular,10);y-=9}y-=8}
 if(y<145)newPage();wrapped('Confirmação de uso das informações',bold,11,purple);wrapped('O responsável confirmou o uso das informações pela ALT para análise do condomínio, elaboração de proposta e contato relacionado à solicitação.');line('Versão do aviso: '+(row.consent_version||'2026-10-08'),regular,9,muted);
 const pages=pdf.getPages();pages.forEach((p,i)=>{p.drawLine({start:{x:margin,y:42},end:{x:width-margin,y:42},thickness:.5,color:rgb(.88,.86,.9)});p.drawText('ALT Gestão de Condomínios | Uso interno',{x:margin,y:28,size:8,font:regular,color:muted});p.drawText(`${i+1} / ${pages.length}`,{x:width-margin-35,y:28,size:8,font:regular,color:muted})});return Buffer.from(await pdf.save())
}
