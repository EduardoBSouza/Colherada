// ============================================
// RECEITAS - GESTÃO DE RECEITAS
// ============================================

// Variável global para controlar receita atual
let receitaAtualId = null;

// Inicializar página
document.addEventListener('DOMContentLoaded', async function() {
    carregarListaReceitas();
    carregarReceitaBase();
    carregarDicasPersonalizadas();
    calcularIngredientes();
});

// ============================================
// GERENCIAR MÚLTIPLAS RECEITAS
// ============================================

function carregarListaReceitas() {
    const receitas = obterTodasReceitas();
    const select = document.getElementById('select-receita');
    
    // Limpar options existentes (exceto "Nova Receita")
    select.innerHTML = '<option value="">📝 Nova Receita</option>';
    
    // Adicionar cada receita como opção
    receitas.forEach((receita, index) => {
        const option = document.createElement('option');
        option.value = receita.id;
        option.textContent = `📖 ${receita.titulo}`;
        select.appendChild(option);
    });
    
    // Se houver receitas, carregar a primeira
    if (receitas.length > 0 && !receitaAtualId) {
        receitaAtualId = receitas[0].id;
        select.value = receitaAtualId;
        carregarReceitaPorId(receitaAtualId);
    }
}

function carregarReceitaSelecionada() {
    const select = document.getElementById('select-receita');
    const receitaId = select.value;
    
    if (receitaId === '') {
        // Nova receita
        novaReceita();
    } else {
        // Carregar receita existente
        receitaAtualId = receitaId;
        carregarReceitaPorId(receitaId);
        document.getElementById('btn-excluir').style.display = 'inline-block';
    }
}

function carregarReceitaPorId(id) {
    const receitas = obterTodasReceitas();
    const receita = receitas.find(r => r.id === id);
    
    if (receita) {
        document.getElementById('titulo-receita').value = receita.titulo;
        document.getElementById('conteudo-receita').value = receita.conteudo || '';
        document.getElementById('btn-excluir').style.display = 'inline-block';
    }
}

function novaReceita() {
    receitaAtualId = null;
    document.getElementById('titulo-receita').value = '';
    document.getElementById('conteudo-receita').value = '';
    document.getElementById('select-receita').value = '';
    document.getElementById('btn-excluir').style.display = 'none';
    document.getElementById('titulo-receita').focus();
}

function obterTodasReceitas() {
    const receitasJson = localStorage.getItem('receitas');
    return receitasJson ? JSON.parse(receitasJson) : [];
}

function salvarTodasReceitas(receitas) {
    localStorage.setItem('receitas', JSON.stringify(receitas));
}

function excluirReceita() {
    if (!receitaAtualId) {
        mostrarNotificacao('Selecione uma receita para excluir', 'warning');
        return;
    }
    
    const select = document.getElementById('select-receita');
    const tituloReceita = select.options[select.selectedIndex].textContent.replace('📖 ', '');
    
    if (!confirm(`Tem certeza que deseja excluir a receita "${tituloReceita}"?`)) {
        return;
    }
    
    const receitas = obterTodasReceitas();
    const receitasAtualizadas = receitas.filter(r => r.id !== receitaAtualId);
    salvarTodasReceitas(receitasAtualizadas);
    
    mostrarNotificacao('✅ Receita excluída com sucesso!', 'success');
    
    // Recarregar lista e limpar campos
    carregarListaReceitas();
    novaReceita();
}

// ============================================
// SALVAR E CARREGAR RECEITA
// ============================================

async function salvarReceita() {
    const titulo = document.getElementById('titulo-receita').value.trim();
    const conteudo = document.getElementById('conteudo-receita').value.trim();
    
    if (!titulo) {
        mostrarNotificacao('Digite um título para a receita', 'warning');
        document.getElementById('titulo-receita').focus();
        return;
    }
    
    if (!conteudo) {
        mostrarNotificacao('Escreva o conteúdo da receita', 'warning');
        document.getElementById('conteudo-receita').focus();
        return;
    }
    
    const receitas = obterTodasReceitas();
    
    if (receitaAtualId) {
        // Atualizar receita existente
        const index = receitas.findIndex(r => r.id === receitaAtualId);
        if (index !== -1) {
            receitas[index].titulo = titulo;
            receitas[index].conteudo = conteudo;
            receitas[index].atualizado_em = new Date().toISOString();
        }
        mostrarNotificacao('✅ Receita atualizada com sucesso!', 'success');
    } else {
        // Criar nova receita
        const novaReceita = {
            id: 'receita_' + Date.now(),
            titulo: titulo,
            conteudo: conteudo,
            criado_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
        };
        receitas.push(novaReceita);
        receitaAtualId = novaReceita.id;
        mostrarNotificacao('✅ Receita salva com sucesso!', 'success');
    }
    
    salvarTodasReceitas(receitas);
    carregarListaReceitas();
    
    // Selecionar a receita recém salva
    document.getElementById('select-receita').value = receitaAtualId;
    document.getElementById('btn-excluir').style.display = 'inline-block';
    
    // Tentar salvar no backend também
    try {
        await salvarReceitaAPI(titulo, conteudo);
    } catch (error) {
        console.log('Receita salva localmente');
    }
}

// Função auxiliar para salvar via API (fallback)
async function salvarReceitaAPI(titulo, conteudo) {
    try {
        const resultado = await apiPost('/api/salvar_receita', {
            titulo: titulo,
            conteudo: conteudo
        });
        return resultado;
    } catch (error) {
        console.error('Erro ao salvar receita no servidor:', error);
        return { sucesso: false };
    }
}

// Limpar receita
function limparReceita() {
    if (!confirm('Tem certeza que deseja limpar tudo? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    novaReceita();
    mostrarNotificacao('Receita limpa', 'info');
}

// ============================================
// EDITAR E SALVAR RECEITA BASE
// ============================================

function editarReceitaBase() {
    // Habilitar edição dos inputs
    const inputs = document.querySelectorAll('.input-base-readonly');
    inputs.forEach(input => {
        input.readOnly = false;
        input.classList.remove('input-base-readonly');
        input.classList.add('input-base-editable');
    });
    
    // Mostrar botão salvar
    document.getElementById('btn-salvar-base').style.display = 'inline-block';
    
    mostrarNotificacao('✏️ Modo de edição ativado! Use números como 2.5 (latas) ou 500 (ml)', 'info');
}

function salvarReceitaBase() {
    const receitaBase = {
        leiteCondensado: parseFloat(document.getElementById('base-leite-condensado').value) || 1,
        leite: parseFloat(document.getElementById('base-leite').value) || 790,
        ovos: parseFloat(document.getElementById('base-ovos').value) || 3,
        acucar: parseFloat(document.getElementById('base-acucar').value) || 1
    };
    
    // Salvar no localStorage
    localStorage.setItem('receitaBase', JSON.stringify(receitaBase));
    
    // Desabilitar edição
    const inputs = document.querySelectorAll('.input-base-editable');
    inputs.forEach(input => {
        input.readOnly = true;
        input.classList.remove('input-base-editable');
        input.classList.add('input-base-readonly');
    });
    
    // Ocultar botão salvar
    document.getElementById('btn-salvar-base').style.display = 'none';
    
    // Recalcular ingredientes
    calcularIngredientes();
    
    mostrarNotificacao('✅ Receita base salva com sucesso!', 'success');
}

function carregarReceitaBase() {
    const receitaBaseSalva = localStorage.getItem('receitaBase');
    
    if (receitaBaseSalva) {
        const receita = JSON.parse(receitaBaseSalva);
        document.getElementById('base-leite-condensado').value = receita.leiteCondensado;
        
        // Migração: converter latas antigas para ml (1 lata = 395ml, 2 latas = 790ml)
        let leiteValor = receita.leite;
        if (leiteValor <= 10) {
            // Provavelmente está em latas, converter para ml
            leiteValor = leiteValor * 395;
        }
        document.getElementById('base-leite').value = leiteValor;
        
        document.getElementById('base-ovos').value = receita.ovos;
        document.getElementById('base-acucar').value = receita.acucar;
    } else {
        // Valores padrão
        document.getElementById('base-leite').value = 790;
    }
}

// ============================================
// EDITAR E SALVAR DICAS
// ============================================

function editarDicas() {
    const dicas = ['temperatura', 'tempo', 'resfriamento', 'armazenamento', 'desenformar', 'qualidade'];
    
    dicas.forEach(dica => {
        const texto = document.getElementById(`dica-${dica}`);
        const textarea = document.getElementById(`edit-${dica}`);
        
        texto.style.display = 'none';
        textarea.style.display = 'block';
        textarea.value = texto.textContent;
    });
    
    document.getElementById('btn-salvar-dicas').style.display = 'inline-block';
    
    mostrarNotificacao('✏️ Modo de edição ativado! Personalize suas dicas', 'info');
}

function salvarDicas() {
    const dicas = ['temperatura', 'tempo', 'resfriamento', 'armazenamento', 'desenformar', 'qualidade'];
    const dicasPersonalizadas = {};
    
    dicas.forEach(dica => {
        const texto = document.getElementById(`dica-${dica}`);
        const textarea = document.getElementById(`edit-${dica}`);
        
        const novoTexto = textarea.value.trim();
        texto.textContent = novoTexto;
        dicasPersonalizadas[dica] = novoTexto;
        
        texto.style.display = 'block';
        textarea.style.display = 'none';
    });
    
    // Salvar no localStorage
    localStorage.setItem('dicasPersonalizadas', JSON.stringify(dicasPersonalizadas));
    
    document.getElementById('btn-salvar-dicas').style.display = 'none';
    
    mostrarNotificacao('✅ Dicas salvas com sucesso!', 'success');
}

function carregarDicasPersonalizadas() {
    const dicasSalvas = localStorage.getItem('dicasPersonalizadas');
    
    if (dicasSalvas) {
        const dicas = JSON.parse(dicasSalvas);
        
        Object.keys(dicas).forEach(dica => {
            const elemento = document.getElementById(`dica-${dica}`);
            const textarea = document.getElementById(`edit-${dica}`);
            
            if (elemento && dicas[dica]) {
                elemento.textContent = dicas[dica];
                if (textarea) {
                    textarea.value = dicas[dica];
                }
            }
        });
    }
}

// ============================================
// CALCULADORA DE INGREDIENTES
// ============================================

function calcularIngredientes() {
    const quantidade = parseInt(document.getElementById('quantidade-pudins').value) || 1;
    
    // Carregar receita base personalizada
    const receitaBase = {
        leiteCondensado: parseFloat(document.getElementById('base-leite-condensado').value) || 1,
        leite: parseFloat(document.getElementById('base-leite').value) || 790,
        ovos: parseFloat(document.getElementById('base-ovos').value) || 3,
        acucar: parseFloat(document.getElementById('base-acucar').value) || 1
    };
    
    // Calcular proporções
    const leiteCondensado = quantidade * receitaBase.leiteCondensado;
    const leite = quantidade * receitaBase.leite;
    const ovos = quantidade * receitaBase.ovos;
    const acucar = quantidade * receitaBase.acucar;
    
    // Atualizar interface
    document.getElementById('qtd-leite-condensado').textContent = 
        formatarQuantidade(leiteCondensado, 'lata');
    
    document.getElementById('qtd-leite').textContent = 
        formatarQuantidade(leite, 'ml');
    
    document.getElementById('qtd-ovos').textContent = 
        formatarQuantidade(ovos, 'unidade');
    
    document.getElementById('qtd-acucar').textContent = 
        formatarQuantidade(acucar, 'xícara');
}

function formatarQuantidade(valor, unidade) {
    // Para ml, formatar com ponto de milhar e sem decimais desnecessários
    if (unidade === 'ml') {
        const valorInteiro = Math.round(valor);
        const valorFormatado = valorInteiro.toLocaleString('pt-BR');
        return `${valorFormatado} ml`;
    }
    
    // Formatar número com vírgula se for decimal
    const valorFormatado = valor % 1 === 0 ? valor : valor.toFixed(1).replace('.', ',');
    
    // Escolher singular ou plural
    const unidadePlural = {
        'lata': 'latas',
        'unidade': 'unidades',
        'xícara': 'xícaras'
    };
    
    return `${valorFormatado} ${valor === 1 ? unidade : unidadePlural[unidade]}`;
}

// ============================================
// GERENCIAR RECEITAS
// ============================================

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.textContent = mensagem;
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${tipo === 'success' ? '#4CAF50' : tipo === 'danger' ? '#F44336' : tipo === 'info' ? '#2196F3' : '#FF9800'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

// Adicionar atalhos de teclado
document.addEventListener('keydown', function(e) {
    // Ctrl + S para salvar
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        salvarReceita();
    }
});
