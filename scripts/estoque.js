// ============================================
// ESTOQUE - GESTÃO DE ESTOQUE
// ============================================

let dadosEstoque = null;

// Inicializar página
document.addEventListener('DOMContentLoaded', async function() {
    await carregarDados();
});

// Carregar dados
async function carregarDados() {
    try {
        dadosEstoque = await carregarDadosPDV();
        atualizarStatus();
        atualizarAlertas();
        atualizarHistorico();
        atualizarPrevisao();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarNotificacao('Erro ao carregar dados', 'danger');
    }
}

// Atualizar status do estoque
function atualizarStatus() {
    if (!dadosEstoque) return;
    
    document.getElementById('estoque-atual').textContent = dadosEstoque.estoque || 0;
    
    // Calcular vendidos hoje
    const vendasHoje = dadosEstoque.vendas || [];
    const vendidosHoje = vendasHoje.reduce((total, venda) => total + venda.quantidade, 0);
    document.getElementById('vendidos-hoje').textContent = vendidosHoje;
    
    // Calcular produzidos hoje (entradas do dia)
    // Por enquanto, mostrar 0, mas você pode implementar lógica de produção
    document.getElementById('produzidos-hoje').textContent = 0;
}

// Atualizar alertas
function atualizarAlertas() {
    const container = document.getElementById('alertas-estoque');
    container.innerHTML = '';
    
    if (!dadosEstoque) return;
    
    const estoque = dadosEstoque.estoque || 0;
    
    if (estoque <= 5) {
        const alerta = document.createElement('div');
        alerta.className = 'alerta alerta-danger';
        alerta.innerHTML = '🚨 <strong>ESTOQUE CRÍTICO!</strong> Apenas ' + estoque + ' pudins disponíveis. Produza mais urgentemente!';
        container.appendChild(alerta);
    } else if (estoque <= 10) {
        const alerta = document.createElement('div');
        alerta.className = 'alerta alerta-warning';
        alerta.innerHTML = '⚠️ <strong>Estoque baixo!</strong> Você tem ' + estoque + ' pudins. Considere produzir mais.';
        container.appendChild(alerta);
    } else if (estoque >= 50) {
        const alerta = document.createElement('div');
        alerta.className = 'alerta alerta-info';
        alerta.innerHTML = '✅ Estoque saudável! Você tem ' + estoque + ' pudins disponíveis.';
        container.appendChild(alerta);
    }
}

// Abastecer estoque
async function abastecer() {
    const quantidade = parseInt(document.getElementById('quantidade-abastecer').value);
    
    if (!quantidade || quantidade <= 0) {
        mostrarNotificacao('Digite uma quantidade válida', 'warning');
        return;
    }
    
    if (!confirm(`Confirma a adição de ${quantidade} pudins ao estoque?`)) {
        return;
    }
    
    try {
        const resultado = await abastecerEstoque(quantidade);
        
        if (resultado.success) {
            mostrarNotificacao('✅ Estoque abastecido com sucesso!', 'success');
            document.getElementById('quantidade-abastecer').value = 10;
            await carregarDados();
        } else {
            mostrarNotificacao('❌ Erro ao abastecer estoque', 'danger');
        }
    } catch (error) {
        console.error('Erro ao abastecer:', error);
        mostrarNotificacao('❌ Erro ao abastecer estoque', 'danger');
    }
}

// Remover do estoque
async function remover() {
    const quantidade = parseInt(document.getElementById('quantidade-remover').value);
    const motivo = document.getElementById('motivo-remocao').value;
    
    if (!quantidade || quantidade <= 0) {
        mostrarNotificacao('Digite uma quantidade válida', 'warning');
        return;
    }
    
    if (dadosEstoque && quantidade > dadosEstoque.estoque) {
        mostrarNotificacao('Quantidade maior que o estoque disponível!', 'danger');
        return;
    }
    
    if (!confirm(`Confirma a remoção de ${quantidade} pudins do estoque?\nMotivo: ${motivo}`)) {
        return;
    }
    
    try {
        const resultado = await removerEstoque(quantidade);
        
        if (resultado.success) {
            mostrarNotificacao('✅ Estoque atualizado!', 'success');
            document.getElementById('quantidade-remover').value = 1;
            await carregarDados();
        } else {
            mostrarNotificacao('❌ Erro ao remover do estoque', 'danger');
        }
    } catch (error) {
        console.error('Erro ao remover:', error);
        mostrarNotificacao('❌ Erro ao remover do estoque', 'danger');
    }
}

// Atualizar histórico de movimentações
function atualizarHistorico() {
    const tbody = document.getElementById('historico-estoque');
    tbody.innerHTML = '';
    
    if (!dadosEstoque) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Carregando...</td></tr>';
        return;
    }
    
    // Aqui você pode implementar um histórico mais completo
    // Por enquanto, mostrar apenas as vendas do dia
    const vendas = dadosEstoque.vendas || [];
    
    if (vendas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhuma movimentação hoje</td></tr>';
        return;
    }
    
    // Mostrar últimas 10 vendas
    const ultimasVendas = [...vendas].reverse().slice(0, 10);
    
    ultimasVendas.forEach(venda => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarHora(venda.data_hora)}</td>
            <td><span class="tipo-saida">🔻 Venda</span></td>
            <td><strong>-${venda.quantidade}</strong></td>
            <td>${venda.estoque_apos || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Atualizar previsão de produção
function atualizarPrevisao() {
    if (!dadosEstoque) return;
    
    // Calcular média de vendas dos últimos 7 dias
    // Por simplicidade, usar média do dia atual
    const vendas = dadosEstoque.vendas || [];
    const totalVendido = vendas.reduce((total, v) => total + v.quantidade, 0);
    const mediaVendas = Math.ceil(totalVendido || 10);
    
    document.getElementById('media-vendas').textContent = mediaVendas;
    
    // Calcular encomendas próximos 3 dias
    const hoje = new Date();
    const tresDias = new Date();
    tresDias.setDate(hoje.getDate() + 3);
    
    const encomendas = dadosEstoque.encomendas || [];
    const encomendasProximas = encomendas.filter(e => {
        if (e.status !== 'pendente') return false;
        const dataEnc = new Date(e.data);
        return dataEnc >= hoje && dataEnc <= tresDias;
    });
    
    const totalEncomendas = encomendasProximas.reduce((total, e) => total + e.quantidade, 0);
    document.getElementById('encomendas-previstas').textContent = totalEncomendas;
    
    // Calcular sugestão de produção
    // (média diária * 2 dias) + encomendas - estoque atual
    const estoqueAtual = dadosEstoque.estoque || 0;
    const sugestao = Math.max(0, (mediaVendas * 2) + totalEncomendas - estoqueAtual);
    
    document.getElementById('sugestao-producao').textContent = sugestao;
    
    // Destacar se precisar produzir urgente
    const sugestaoValor = document.getElementById('sugestao-producao');
    if (sugestao > 20) {
        sugestaoValor.style.color = 'var(--cor-danger)';
    } else if (sugestao > 10) {
        sugestaoValor.style.color = 'var(--cor-warning)';
    } else {
        sugestaoValor.style.color = 'var(--cor-success)';
    }
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
        background: ${tipo === 'success' ? '#4CAF50' : tipo === 'danger' ? '#F44336' : '#FF9800'};
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
