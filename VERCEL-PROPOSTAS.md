# Propostas com PDF por e-mail — ALT / Vercel

## O que mudou

A página inicial e os assets existentes continuam estáticos. Os botões de solicitar proposta abrem /solicitar-proposta. A nova página mantém as oito etapas aprovadas e a pergunta sobre a empresa terceirizada de leitura de gás. O contato rápido por WhatsApp permanece independente.

O backend é composto pelas funções api/propostas.js e api/reenviar-proposta.js, módulos em server e regras compartilhadas em shared/proposal.js. O PDF usa o logo roxo oficial, data em horário de Brasília, protocolo, perguntas e todas as respostas aplicáveis. Não contém preço calculado.

## Configurar antes de publicar

1. Vercel → projeto → Storage / Marketplace: conectar Neon PostgreSQL (ou informar uma conexão Neon existente).
2. No SQL Editor do Neon, executar database/001_propostas.sql. Use bancos diferentes para Preview e Production, para que testes não gerem leads reais.
3. Criar conta no Resend e verificar um domínio remetente. Cadastrar exatamente os registros DNS fornecidos pelo serviço. Não remover registros MX do e-mail da ALT.
4. Em Settings → Environment Variables, definir as variáveis abaixo para os ambientes desejados. Nunca colocar valores secretos no repositório.
5. Framework Preset: Other. Build Command: npm run build. Output Directory: dist. Usar Node 22 ou superior. vercel.json já declara essas opções.
6. Gerar uma nova implantação após configurar as variáveis. Testar com dados fictícios em Preview; conferir o PDF recebido, o registro no Neon e a ausência de duplicidade ao repetir o envio.
7. Revisar o aviso de privacidade, definir conservação dos registros e publicar após validar os testes reais de integração.

| Variável | Valor / finalidade |
| --- | --- |
| DATABASE_URL | Conexão PostgreSQL do Neon, somente no servidor |
| RESEND_API_KEY | Chave de envio do Resend |
| ALT_MAIL_FROM | Remetente de domínio verificado, ex.: ALT <propostas@altgestaodecondominios.com> |
| ALT_MAIL_TO | administrativo@altgestaodecondominios.com ou caixa escolhida pela ALT |
| ALT_SITE_URL | URL pública exata, ex.: https://www.altgestaodecondominios.com |
| RATE_LIMIT_SECRET | Valor aleatório de pelo menos 32 caracteres para identificar limites sem armazenar o IP em claro |
| ALT_RETRY_TOKEN | Token aleatório de pelo menos 32 caracteres para reenvio administrativo |

Gerar valores aleatórios no terminal: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))". Gerar valores distintos para os dois segredos. Não enviar chaves por mensagens ou adicionar em HTML.

## Como a ALT fica sabendo

Após o envio, as respostas são gravadas em proposal_requests. Em seguida o servidor gera o PDF e o envia anexado pelo Resend. O cliente recebe o protocolo depois da gravação. Falha no PDF/e-mail não apaga a solicitação: notification_state fica failed. Estado sent indica aceitação pelo serviço, não prova de leitura nem entrega na caixa de entrada; verificar também o painel do Resend.

Registros no Neon têm ID, datas, origem Site ALT, status Novo lead, contato, unidades, respostas JSON, versão do aviso e estado/tentativas da notificação. proposal_rate_limits controla até oito tentativas por IP por hora. Não há rota pública para consultar respostas. Esta integração não migra o painel administrativo nem a autenticação do Sites; a consulta nesta entrega é pelo console protegido do Neon e pelos e-mails. O painel próprio na Vercel exige uma implementação separada de autenticação.

## Reenvio de falhas

Após corrigir a configuração, consultar o ID no Neon e enviar POST /api/reenviar-proposta com Authorization: Bearer <ALT_RETRY_TOKEN> e JSON {"id":"ID_DA_SOLICITACAO"}. Não expor esse token no navegador. O endpoint ignora solicitações já enviadas; uma trava no banco evita concorrência e a chave de idempotência do Resend evita duplicação em tentativas próximas. Não há rotina automática de reenvio nesta entrega.

## Rodar no VS Code

Instalar Node 22+. Na pasta do projeto:

```powershell
npm install
npm run build
```

Copiar .env.example para .env.local e preencher com credenciais de TESTE. Preparar o banco de teste com o SQL. Depois:

```powershell
npm run dev
```

Abrir http://localhost:3000/solicitar-proposta. Sem configuração do banco ou do segredo de limite, a página abre, mas o envio retorna erro e mantém as respostas. Sem configuração de e-mail, a solicitação é salva e fica com notification_state=configuration_required para reenvio posterior. npm test verifica regras e fluxo com banco/e-mail simulados; não substitui teste real na Vercel.

## Arquivos e limites

Novos: formulário HTML, aviso de privacidade, CSS/JS específicos, shared/proposal.js, api, server, database, scripts, tests, package.json/package-lock.json, vercel.json e .env.example. Alterados: links de proposta em index.html e exclusões de Git. Fotos e o carrossel não são alterados nesta integração.

PDFs são gerados em memória, sem arquivo público. A fonte padrão suporta português; caracteres fora de seu conjunto, como alguns emojis, são substituídos por ?. Logs não contêm respostas ou chaves. O site não afirma ter recebido antes de gravar no banco.

## Verificações desta implementação

Nove testes automatizados passaram: condições dos campos, validação no servidor, gravação antes do envio, duplicidade, retenção em falhas, configuração ausente, limite de tentativas, proteção HTTP e anexo PDF. O PDF de teste foi gerado e inspecionado visualmente. O build estático passou. Neon e entrega real pelo Resend não foram testados sem credenciais do projeto; precisam de validação em Preview.
