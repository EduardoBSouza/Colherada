// ============================================
// VENDAS - GESTÃO DE VENDAS
// ============================================

let dadosVendas = null;

// Inicializar página
document.addEventListener('DOMContentLoaded', async function() {
    await carregarDados();
    configurarEventos();
});

// Carregar dados
async function carregarDados() {
    try {
        dadosVendas = await carregarDadosPDV();
        atualizarResumo();
        atualizarHistorico();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarNotificacao('Erro ao carregar dados', 'danger');
    }
}

// Configurar eventos
function configurarEventos() {
    const quantidadeInput = document.getElementById('quantidade-venda');
    const valorUnitarioInput = document.getElementById('valor-unitario');
    
    quantidadeInput.addEventListener('input', calcularTotal);
    valorUnitarioInput.addEventListener('input', calcularTotal);
    
    // Calcular total inicial
    calcularTotal();
}

// Calcular total da venda
function calcularTotal() {
    const quantidade = parseInt(document.getElementById('quantidade-venda').value) || 0;
    const valorUnitario = parseFloat(document.getElementById('valor-unitario').value) || 0;
    const total = quantidade * valorUnitario;
    
    document.getElementById('total-venda').textContent = formatarMoeda(total);
}

// Registrar venda rápida
async function registrarVendaRapida(pagamento) {
    const quantidade = parseInt(document.getElementById('quantidade-venda').value);
    const valorUnitario = parseFloat(document.getElementById('valor-unitario').value);
    
    if (!quantidade || quantidade <= 0) {
        mostrarNotificacao('Digite uma quantidade válida', 'warning');
        return;
    }
    
    if (!valorUnitario || valorUnitario <= 0) {
        mostrarNotificacao('Digite um valor unitário válido', 'warning');
        return;
    }
    
    // Verificar estoque
    if (dadosVendas && quantidade > dadosVendas.estoque) {
        if (!confirm(`Estoque insuficiente! Você tem apenas ${dadosVendas.estoque} pudins disponíveis. Deseja continuar mesmo assim?`)) {
            return;
        }
    }
    
    try {
        // Desabilitar botões
        desabilitarBotoesPagamento(true);
        
        const resultado = await registrarVenda(quantidade, pagamento, valorUnitario);
        
        if (resultado.success) {
            mostrarNotificacao('✅ Venda registrada com sucesso!', 'success');
            
            // Limpar formulário
            document.getElementById('quantidade-venda').value = 1;
            calcularTotal();
            
            // Recarregar dados
            await carregarDados();
        } else {
            mostrarNotificacao('❌ Erro ao registrar venda', 'danger');
        }
    } catch (error) {
        console.error('Erro ao registrar venda:', error);
        mostrarNotificacao('❌ Erro ao registrar venda', 'danger');
    } finally {
        desabilitarBotoesPagamento(false);
    }
}

// Desabilitar/habilitar botões de pagamento
function desabilitarBotoesPagamento(desabilitar) {
    const botoes = document.querySelectorAll('.btn-pagamento');
    botoes.forEach(btn => {
        btn.disabled = desabilitar;
        if (desabilitar) {
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });
}

// Atualizar resumo rápido
function atualizarResumo() {
    if (!dadosVendas) return;
    
    document.getElementById('estoque-disponivel').textContent = dadosVendas.estoque || 0;
    
    const vendasHoje = dadosVendas.vendas ? dadosVendas.vendas.length : 0;
    document.getElementById('vendas-hoje').textContent = vendasHoje;
    
    document.getElementById('faturamento-hoje').textContent = 
        formatarMoeda(dadosVendas.faturamento_bruto || 0);
}

// Atualizar histórico de vendas
function atualizarHistorico() {
    const tbody = document.getElementById('historico-vendas');
    tbody.innerHTML = '';
    
    if (!dadosVendas || !dadosVendas.vendas || dadosVendas.vendas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma venda registrada hoje</td></tr>';
        atualizarResumoHistorico(0, 0, 0);
        return;
    }
    
    // Ordenar vendas por horário (mais recente primeiro)
    const vendas = [...dadosVendas.vendas].reverse();
    
    let totalVendas = 0;
    let quantidadeTotal = 0;
    let faturamentoTotal = 0;
    
    const emojiPagamento = {
        'pix': '💳 PIX',
        'dinheiro': '💵 Dinheiro',
        'cartao': '💳 Cartão'
    };
    
    vendas.forEach(venda => {
        const tr = document.createElement('tr');
        
        totalVendas++;
        quantidadeTotal += venda.quantidade;
        faturamentoTotal += venda.valor_total;
        
        tr.innerHTML = `
            <td>${formatarHora(venda.data_hora)}</td>
            <td><strong>${venda.quantidade}</strong> ${venda.quantidade === 1 ? 'pudim' : 'pudins'}</td>
            <td>${formatarMoeda(venda.valor_unitario || 10)}</td>
            <td>${emojiPagamento[venda.pagamento] || venda.pagamento}</td>
            <td><strong>${formatarMoeda(venda.valor_total)}</strong></td>
        `;
        
        tbody.appendChild(tr);
    });
    
    atualizarResumoHistorico(totalVendas, quantidadeTotal, faturamentoTotal);
}

// Atualizar resumo do histórico
function atualizarResumoHistorico(totalVendas, quantidadeTotal, faturamentoTotal) {
    document.getElementById('total-vendas-dia').textContent = totalVendas;
    document.getElementById('quantidade-total-dia').textContent = quantidadeTotal;
    document.getElementById('faturamento-total-dia').textContent = formatarMoeda(faturamentoTotal);
}

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação
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
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
