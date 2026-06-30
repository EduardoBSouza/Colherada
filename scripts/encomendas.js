// ============================================
// ENCOMENDAS - GESTÃO DE ENCOMENDAS
// ============================================

let dadosEncomendas = null;

// Inicializar página
document.addEventListener('DOMContentLoaded', async function() {
    await carregarDados();
    configurarDataMinima();
});

// Configurar data mínima (hoje)
function configurarDataMinima() {
    const dataInput = document.getElementById('encomenda-data');
    const hoje = new Date().toISOString().split('T')[0];
    dataInput.min = hoje;
    dataInput.value = hoje;
}

// Carregar dados
async function carregarDados() {
    try {
        dadosEncomendas = await carregarDadosPDV();
        atualizarResumo();
        atualizarEncomendas();
        atualizarHistorico();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarNotificacao('Erro ao carregar dados', 'danger');
    }
}

// Atualizar resumo
function atualizarResumo() {
    if (!dadosEncomendas || !dadosEncomendas.encomendas) return;
    
    const encomendas = dadosEncomendas.encomendas;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const tresDias = new Date();
    tresDias.setDate(hoje.getDate() + 3);
    tresDias.setHours(23, 59, 59, 999);
    
    // Filtrar encomendas pendentes
    const pendentes = encomendas.filter(e => e.status === 'pendente');
    
    // Urgentes (hoje)
    const urgentes = pendentes.filter(e => {
        const dataEnc = new Date(e.data);
        dataEnc.setHours(0, 0, 0, 0);
        return dataEnc.getTime() === hoje.getTime();
    });
    
    // Próximos 3 dias (excluindo hoje)
    const proximas = pendentes.filter(e => {
        const dataEnc = new Date(e.data);
        return dataEnc > hoje && dataEnc <= tresDias;
    });
    
    // Concluídas este mês
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const concluidas = encomendas.filter(e => {
        if (e.status !== 'concluida') return false;
        const dataConclusao = new Date(e.data_conclusao || e.data);
        return dataConclusao.getMonth() === mesAtual && dataConclusao.getFullYear() === anoAtual;
    });
    
    // Atualizar cards
    document.getElementById('urgentes-hoje').textContent = urgentes.length;
    document.getElementById('proximas-3dias').textContent = proximas.length;
    document.getElementById('total-pendentes').textContent = pendentes.length;
    document.getElementById('concluidas-mes').textContent = concluidas.length;
}

// Cadastrar nova encomenda
async function cadastrarEncomenda() {
    const cliente = document.getElementById('cliente-nome').value.trim();
    const telefone = document.getElementById('cliente-telefone').value.trim();
    const quantidade = parseInt(document.getElementById('encomenda-quantidade').value);
    const data = document.getElementById('encomenda-data').value;
    const observacoes = document.getElementById('encomenda-observacoes').value.trim();
    
    // Validações
    if (!cliente) {
        mostrarNotificacao('Digite o nome do cliente', 'warning');
        document.getElementById('cliente-nome').focus();
        return;
    }
    
    if (!quantidade || quantidade <= 0) {
        mostrarNotificacao('Digite uma quantidade válida', 'warning');
        return;
    }
    
    if (!data) {
        mostrarNotificacao('Selecione a data de entrega', 'warning');
        return;
    }
    
    try {
        const resultado = await registrarEncomenda(cliente, quantidade, data, telefone);
        
        if (resultado.success) {
            mostrarNotificacao('✅ Encomenda cadastrada com sucesso!', 'success');
            
            // Limpar formulário
            document.getElementById('cliente-nome').value = '';
            document.getElementById('cliente-telefone').value = '';
            document.getElementById('encomenda-quantidade').value = '5';
            document.getElementById('encomenda-observacoes').value = '';
            configurarDataMinima();
            
            // Recarregar dados
            await carregarDados();
        } else {
            mostrarNotificacao('❌ Erro ao cadastrar encomenda', 'danger');
        }
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        mostrarNotificacao('❌ Erro ao cadastrar encomenda', 'danger');
    }
}

// Atualizar listas de encomendas
function atualizarEncomendas() {
    if (!dadosEncomendas || !dadosEncomendas.encomendas) return;
    
    const encomendas = dadosEncomendas.encomendas;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const tresDias = new Date();
    tresDias.setDate(hoje.getDate() + 3);
    tresDias.setHours(23, 59, 59, 999);
    
    // Filtrar encomendas pendentes
    const pendentes = encomendas.filter(e => e.status === 'pendente');
    
    // Urgentes (hoje)
    const urgentes = pendentes.filter(e => {
        const dataEnc = new Date(e.data);
        dataEnc.setHours(0, 0, 0, 0);
        return dataEnc.getTime() === hoje.getTime();
    });
    
    // Próximos 3 dias
    const proximas = pendentes.filter(e => {
        const dataEnc = new Date(e.data);
        return dataEnc > hoje && dataEnc <= tresDias;
    });
    
    // Atualizar seção de urgentes
    const secaoUrgentes = document.getElementById('secao-urgentes');
    const listaUrgentes = document.getElementById('lista-urgentes');
    
    if (urgentes.length > 0) {
        secaoUrgentes.style.display = 'block';
        listaUrgentes.innerHTML = '';
        urgentes.forEach(encomenda => {
            listaUrgentes.appendChild(criarCardEncomenda(encomenda, 'urgente'));
        });
    } else {
        secaoUrgentes.style.display = 'none';
    }
    
    // Atualizar seção de próximas
    const secaoProximas = document.getElementById('secao-proximas');
    const listaProximas = document.getElementById('lista-proximas');
    
    if (proximas.length > 0) {
        secaoProximas.style.display = 'block';
        listaProximas.innerHTML = '';
        proximas.forEach(encomenda => {
            listaProximas.appendChild(criarCardEncomenda(encomenda, 'proxima'));
        });
    } else {
        secaoProximas.style.display = 'none';
    }
    
    // Atualizar lista completa
    const listaTodas = document.getElementById('lista-todas');
    
    if (pendentes.length === 0) {
        listaTodas.innerHTML = '<p class="mensagem-vazio">Nenhuma encomenda pendente no momento 🎉</p>';
    } else {
        listaTodas.innerHTML = '';
        // Ordenar por data
        pendentes.sort((a, b) => new Date(a.data) - new Date(b.data));
        
        pendentes.forEach(encomenda => {
            const dataEnc = new Date(encomenda.data);
            dataEnc.setHours(0, 0, 0, 0);
            
            let tipo = 'normal';
            if (dataEnc.getTime() === hoje.getTime()) {
                tipo = 'urgente';
            } else if (dataEnc <= tresDias) {
                tipo = 'proxima';
            }
            
            listaTodas.appendChild(criarCardEncomenda(encomenda, tipo));
        });
    }
}

// Criar card de encomenda
function criarCardEncomenda(encomenda, tipo) {
    const div = document.createElement('div');
    div.className = `encomenda-card ${tipo}`;
    
    const badge = tipo === 'urgente' 
        ? '<span class="badge-urgente">HOJE</span>'
        : tipo === 'proxima'
        ? '<span class="badge-proxima">PRÓXIMA</span>'
        : '';
    
    div.innerHTML = `
        <div class="encomenda-info">
            <div class="encomenda-header">
                <span class="encomenda-cliente">${encomenda.cliente}</span>
                ${badge}
            </div>
            <div class="encomenda-detalhes">
                <span>📅 <strong>${formatarData(encomenda.data)}</strong></span>
                <span>📦 <strong>${encomenda.quantidade}</strong> ${encomenda.quantidade === 1 ? 'pudim' : 'pudins'}</span>
                ${encomenda.telefone ? `<span>📞 ${encomenda.telefone}</span>` : ''}
            </div>
            ${encomenda.observacoes ? `<div class="encomenda-observacoes">💬 ${encomenda.observacoes}</div>` : ''}
        </div>
        <div class="encomenda-acoes">
            <button class="btn-concluir" onclick="concluir(${encomenda.id})">
                ✅ Concluir
            </button>
            <button class="btn-cancelar" onclick="cancelar(${encomenda.id})">
                ❌ Cancelar
            </button>
        </div>
    `;
    
    return div;
}

// Concluir encomenda
async function concluir(id) {
    if (!confirm('Confirma a conclusão desta encomenda?')) {
        return;
    }
    
    try {
        const resultado = await concluirEncomenda(id);
        
        if (resultado.success) {
            mostrarNotificacao('✅ Encomenda concluída!', 'success');
            await carregarDados();
        } else {
            mostrarNotificacao('❌ Erro ao concluir encomenda', 'danger');
        }
    } catch (error) {
        console.error('Erro ao concluir:', error);
        mostrarNotificacao('❌ Erro ao concluir encomenda', 'danger');
    }
}

// Cancelar encomenda
async function cancelar(id) {
    if (!confirm('Tem certeza que deseja CANCELAR esta encomenda?')) {
        return;
    }
    
    try {
        const resultado = await cancelarEncomenda(id);
        
        if (resultado.success) {
            mostrarNotificacao('Encomenda cancelada', 'info');
            await carregarDados();
        } else {
            mostrarNotificacao('❌ Erro ao cancelar encomenda', 'danger');
        }
    } catch (error) {
        console.error('Erro ao cancelar:', error);
        mostrarNotificacao('❌ Erro ao cancelar encomenda', 'danger');
    }
}

// Atualizar histórico de concluídas
function atualizarHistorico() {
    const tbody = document.getElementById('historico-concluidas');
    tbody.innerHTML = '';
    
    if (!dadosEncomendas || !dadosEncomendas.encomendas) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Carregando...</td></tr>';
        return;
    }
    
    // Filtrar concluídas
    const concluidas = dadosEncomendas.encomendas
        .filter(e => e.status === 'concluida')
        .sort((a, b) => new Date(b.data_conclusao || b.data) - new Date(a.data_conclusao || a.data))
        .slice(0, 10); // Últimas 10
    
    if (concluidas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhuma encomenda concluída ainda</td></tr>';
        return;
    }
    
    concluidas.forEach(encomenda => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${encomenda.cliente}</strong></td>
            <td>${encomenda.quantidade} ${encomenda.quantidade === 1 ? 'pudim' : 'pudins'}</td>
            <td>${formatarData(encomenda.data)}</td>
            <td>${encomenda.data_conclusao ? formatarData(encomenda.data_conclusao) : '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

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
