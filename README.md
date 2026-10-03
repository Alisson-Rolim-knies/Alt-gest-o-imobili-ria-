# Alt Gestão de Condomínios

Site institucional estático, em português, com layout responsivo, carrossel de condomínios e formulário que prepara uma mensagem no WhatsApp. Não exige instalação de pacotes, banco de dados ou etapa de compilação.

## Abrir e visualizar

1. Extraia o pacote em uma nova pasta para preservar a versão que você já tem.
2. No VS Code, selecione **Arquivo → Abrir Pasta** e abra a pasta `ALT-site` extraída.
3. Abra `index.html` no navegador. Opcionalmente, use a configuração **Abrir site Alt no Chrome** na área Executar e Depurar do VS Code.

Para servir localmente, se Python estiver instalado, execute na raiz:

```bash
python -m http.server 8000
```

Depois, abra `http://localhost:8000` no navegador. No Windows, se `python` não for reconhecido, tente `py -m http.server 8000`.

## Organização

| Caminho | Finalidade |
| --- | --- |
| `index.html` | Textos, seções, navegação e formulário |
| `assets/css/styles.css` | Todos os estilos, incluindo regras para celular |
| `assets/js/script.js` | Menu, mensagem do WhatsApp e carrossel |
| `assets/img/` | Fotos em WebP e logotipos em PNG |
| `.vscode/` | Preferências do editor e configuração para abrir no Chrome |
| `.gitignore` | Exclusões para versionamento com Git |

## Alterações comuns

### Textos e contato

Edite o texto correspondente em `index.html`. Preserve os atributos `id`, as classes e os nomes dos campos utilizados pelo JavaScript.

O número do WhatsApp está em `ALT_CONFIG.whatsapp`, no início de `assets/js/script.js`, e nos links diretos de `index.html`. Se o número mudar, atualize os dois locais. Atualize também o link `tel:` e o telefone visível. O e-mail, endereço, Instagram e acesso à uCondo ficam no HTML.

### Cores

As variáveis em `:root`, no CSS, definem as cores principais:

- `--color-primary`: roxo oficial `#4f2c68`.
- `--color-text`: texto principal.
- `--color-text-muted`: texto secundário.
- `--color-border`: divisórias.
- `--color-surface`: fundos claros.
- `--color-accent`: cor de realce.

Alguns valores compostos, gradientes e cores de superfícies específicas permanecem declarados nas respectivas seções.

### Carrossel

`ALT_CONFIG.carouselInterval` define o intervalo em milissegundos: `5500` corresponde a 5,5 segundos. Os nomes em `ALT_CONFIG.condominiums` devem seguir a mesma ordem das fotos `.hero-slide` e dos botões `.carousel-dot` no HTML.

A frase “Gestão de verdade. Parceria todos os dias.” fica fixa. Somente as fotos e o nome do condomínio mudam. A troca pausa com foco de teclado, mouse sobre a área ou aba oculta. Quem prefere movimento reduzido inicia com a troca pausada e pode reproduzir manualmente.

Ao trocar uma foto, mantenha o nome do arquivo ou atualize seu caminho no HTML. Atualize o texto `alt` e as dimensões `width` e `height` quando necessário.

### Formulário

O formulário abre o WhatsApp com uma mensagem preenchida. O visitante revisa e envia a mensagem no WhatsApp; o site não armazena os dados nem confirma envio. O e-mail usa o programa de e-mail do visitante.

## Publicar

Guarde uma cópia do site que já está no ar. Na hospedagem estática do domínio, envie `index.html` e a pasta `assets` para a pasta pública, mantendo a estrutura. A pasta `.vscode`, este README e o `.gitignore` são ferramentas de desenvolvimento e não precisam ser publicados.

A publicação no domínio depende da hospedagem escolhida. Este pacote não altera configurações de domínio nem envia arquivos automaticamente.

## Versionar com Git

Se Git estiver instalado, na raiz do projeto:

```bash
git init
git add .
git commit -m "Organiza e otimiza o site da Alt"
```

Para alterações futuras, confira `git diff`, depois faça novos commits. A conexão a um repositório remoto depende da conta e do repositório que você escolher.

## Conferir após alterações

- Abrir o site no computador e no celular.
- Testar menu, links de contato e acesso ao cliente.
- Percorrer os controles com Tab e fechar o menu com Escape.
- Conferir todos os nomes e fotos do carrossel e o botão de pausa.
- Preencher o formulário e conferir a mensagem preparada no WhatsApp.

## Melhorias deste pacote

Direção visual editorial aprovada: abertura assimétrica, foto vertical do Vista do Vale e carrossel com Ocean, Vista do Vale, Vale das Pedras e Oliveiras; serviços com divisórias leves, história em grafite, três pilares com igual destaque e formulário simplificado. CSS em um arquivo, JavaScript separado em funções, tratamento de fotos indisponíveis, imagens em WebP e configurações para o VS Code.

As fotos usam compressão WebP com perda de qualidade moderada; preserve os arquivos originais fornecidos separadamente para futuras edições. As fontes externas usam alternativas locais caso não carreguem.

## Novas fotos

O carrossel contém nove fotos. As cinco novas legendas são Tassia, Torre de Vicenza, Sol da Montanha, Bella Vista e Di Trento. Torre de Vicenza e Bella Vista foram lidos nas fachadas; os demais nomes foram obtidos dos arquivos fornecidos. A listagem de quatro destaques abaixo do carrossel permanece como seleção.

## Posição do carrossel

No computador, a foto grande à direita alterna os nove condomínios e seus nomes. A frase sobre a foto fica fixa. O bloco menor à esquerda é um banner institucional da Alt. No celular, o carrossel aparece abaixo do texto principal.

O banner institucional é texto e CSS: para alterar sua mensagem, edite o bloco `alt-banner` em `index.html`.
