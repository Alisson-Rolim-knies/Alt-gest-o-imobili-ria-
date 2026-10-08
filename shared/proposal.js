export const stages = ["Condomínio e contato", "Estrutura", "Documentação", "Água e gás", "Financeiro", "Rotina administrativa", "Obras e planejamento", "Necessidades e envio"];
const yn = ["Sim", "Não", "Não sei informar"];
export const priorities = ["Atendimento", "Organização", "Transparência financeira", "Tecnologia", "Agilidade na resolução de problemas", "Assessoria ao síndico", "Controle financeiro", "Redução de custos", "Comunicação com moradores", "Outro"];
export const fields = [
    [{ key: "condominio", label: "Nome do condomínio", required: true, wide: true }, { key: "cnpj", label: "CNPJ (opcional)" }, { key: "cidade", label: "Cidade / UF", required: true }, { key: "endereco", label: "Endereço completo", required: true, wide: true }, { key: "responsavel", label: "Nome do síndico ou responsável", required: true, wide: true }, { key: "telefone", label: "Telefone / WhatsApp", type: "tel", required: true }, { key: "email", label: "E-mail", type: "email", required: true }],
    [{ key: "unidades", label: "Unidades residenciais", type: "number", required: true }, { key: "garagens", label: "Vagas / boxes (opcional)", type: "number" }, { key: "comerciais", label: "Possui lojas ou salas comerciais?", options: yn }, { key: "quantidade_comerciais", label: "Quantidade de lojas / salas", type: "number", required: true, when: ["comerciais", "Sim"] }, { key: "funcionarios", label: "Possui funcionários próprios?", options: yn }, { key: "quantidade_funcionarios", label: "Quantidade de funcionários", type: "number", required: true, when: ["funcionarios", "Sim"] }, { key: "funcoes", label: "Funções (opcional)", when: ["funcionarios", "Sim"], wide: true }],
    [{ key: "convencao", label: "Possui Convenção Condominial?", options: yn, wide: true }, { key: "regimento", label: "Possui Regimento Interno?", options: yn, wide: true }],
    [...["agua", "gas"].flatMap(k => [{ key: k, label: `Existe leitura individual de ${k === "agua" ? "água" : "gás"}?`, options: yn, wide: true }, { key: k + "_leitor", label: "Quem realiza a leitura?", options: ["Síndico / condomínio", "Administradora", "Empresa terceirizada", "Outro", "Não sei informar"], when: [k, "Sim"] }, { key: k + "_medidores", label: "Quantidade aproximada de medidores", type: "number", when: [k, "Sim"] }, { key: k + "_outro", label: "Qual responsável? (opcional)", when: [k + "_leitor", "Outro"] }]), { key: "gas_empresa", label: "Qual empresa realiza a leitura de gás?", when: ["gas_leitor", "Empresa terceirizada"], wide: true }],
    [{ key: "conta", label: "Possui conta bancária própria?", options: yn }, { key: "banco", label: "Banco (opcional)", when: ["conta", "Sim"] }, { key: "saldo", label: "Saldo aproximado em caixa / contas / aplicações (opcional)", type: "money", wide: true }, { key: "inadimplencia", label: "Nível aproximado de inadimplência", options: ["Até 5%", "Acima de 5% até 10%", "Acima de 10% até 20%", "Acima de 20%", "Não sei informar"], wide: true }],
    [{ key: "assembleias", label: "Assembleias por ano", options: ["1", "2", "3", "4 ou mais", "Não sei informar"] }, { key: "boletos", label: "Disponibilização dos boletos", options: ["Somente digital", "Digital e impresso", "Principalmente impresso", "Ainda não definido"] }, { key: "administradora", label: "Possui administradora atualmente?", options: yn }, { key: "administradora_nome", label: "Nome da administradora (opcional)", when: ["administradora", "Sim"] }, { key: "motivo", label: "O que motivou a busca por uma administradora? (opcional)", type: "textarea", wide: true }],
    [{ key: "pintura", label: "Existe planejamento de pintura?", options: ["Não", "Sim", "Em estudo", "Não sei informar"], wide: true }, { key: "obra_planejada", label: "Existe obra ou benfeitoria planejada?", options: yn, wide: true }, { key: "obra_planejada_desc", label: "Descreva brevemente (opcional)", type: "textarea", when: ["obra_planejada", "Sim"], wide: true }, { key: "obra_atual", label: "Existe obra em andamento?", options: yn, wide: true }, { key: "obra_atual_desc", label: "Descreva brevemente (opcional)", type: "textarea", when: ["obra_atual", "Sim"], wide: true }],
    [{ key: "necessidade", label: "Principal dificuldade ou necessidade administrativa (opcional)", type: "textarea", wide: true }, { key: "prioridades", label: "O que é mais importante para você? (opcional)", type: "multi", options: priorities, wide: true }, { key: "prioridade_outro", label: "Outra prioridade (opcional)", when: ["prioridades", "Outro"], wide: true }, { key: "adicional", label: "Gostaria de nos contar algo mais? (opcional)", type: "textarea", wide: true }]
];
export const statuses = ["Novo lead", "Em análise", "Contato realizado", "Proposta enviada", "Negociação", "Fechado", "Perdido"];
export function visible(f, a) {
    if (!f.when)
        return true;
    const parent = fields.flat().find(x => x.key === f.when[0]);
    if (parent && !visible(parent, a))
        return false;
    const v = a[f.when[0]];
    return Array.isArray(v) ? v.includes(f.when[1]) : v === f.when[1];
}
export function clean(a) {
    const result = {};
    for (const f of fields.flat())
        if (visible(f, a) && a[f.key] !== undefined)
            result[f.key] = Array.isArray(a[f.key]) ? a[f.key].filter(x => f.options?.includes(x)) : a[f.key].trim();
    return result;
}
export function cnpjValid(s) {
    const v = s.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!/^[A-Z0-9]{12}\d{2}$/.test(v) || /^(.)\1+$/.test(v))
        return false;
    const check = (base, weights) => { const rem = [...base].reduce((sum, c, i) => sum + (c.charCodeAt(0) - 48) * weights[i], 0) % 11; return String(rem < 2 ? 0 : 11 - rem); };
    return check(v.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === v[12] && check(v.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === v[13];
}
export function validate(a, step) {
    const errors = {};
    for (const f of (step === undefined ? fields.flat() : fields[step])) {
        if (!visible(f, a))
            continue;
        const value = a[f.key];
        if (value !== undefined && typeof value !== "string" && !Array.isArray(value)) {
            errors[f.key] = "Resposta inválida.";
            continue;
        }
        if (f.type === "multi") {
            if (value !== undefined && (!Array.isArray(value) || value.some(x => !f.options?.includes(x))))
                errors[f.key] = "Selecione opções válidas.";
            continue;
        }
        if (Array.isArray(value)) {
            errors[f.key] = "Resposta inválida.";
            continue;
        }
        const v = value?.trim() ?? "";
        if (f.required && !v)
            errors[f.key] = "Preencha este campo.";
        if (v.length > (f.type === "textarea" ? 2000 : f.key === "endereco" ? 300 : f.key === "email" ? 254 : 150))
            errors[f.key] = "Texto muito longo.";
        if (v && f.options && !f.options.includes(v))
            errors[f.key] = "Selecione uma opção válida.";
        if (v && f.type === "number" && (!/^\d+$/.test(v) || Number(v) > 100000 || (f.required && f.when && Number(v) < 1)))
            errors[f.key] = "Informe uma quantidade válida.";
        if (v && f.type === "money" && !/^\d{1,12}(\.\d{1,2})?$/.test(v))
            errors[f.key] = "Informe um valor válido em reais.";
        if (v && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
            errors[f.key] = "Informe um e-mail válido.";
        if (v && f.type === "tel" && !/^(?:55)?\d{10,11}$/.test(v.replace(/\D/g, "")))
            errors[f.key] = "Informe o telefone com DDD.";
        if (v && f.key === "cnpj" && !cnpjValid(v))
            errors[f.key] = "Confira o CNPJ.";
    }
    if ((step === 1 || step === undefined) && a.unidades !== undefined && Number(a.unidades) === 0 && a.comerciais !== "Não sei informar" && Number(a.quantidade_comerciais || 0) === 0)
        errors.unidades = "Informe ao menos uma unidade residencial ou comercial.";
    return errors;
}
