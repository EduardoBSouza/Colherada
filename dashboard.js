// ============================================
// DASHBOARD - PÁGINA PRINCIPAL
// ============================================

let dadosAtuais = null;

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', async function() {
    await atualizarDashboard();
    
    // Atualizar a cada 30 segundos
    setInterval(atualizarDashboard, 30000);
});

// Atualizar todos os dados do dashboard
async function atualizarDashboard() {
    try {
        dadosAtuais = await carregarDadosPDV();
        
        atualizarCards();
        atualizarAlertas();
        atualizarUltimasVendas();
        atualizarEncomendasUrgentes();
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
        mostrarErro('Erro ao carregar dados do sistema');
    }
}

// Expor globalmente para uso no HTML
window.atualizarDashboard = atualizarDashboard;

// Atualizar cards de resumo
function atualizarCards() {
    if (!dadosAtuais) return;
    
    const estoqueValor = document.getElementById('estoque-valor');
    const cardEstoque = document.getElementById('card-estoque');
    const alertaEstoque = cardEstoque.querySelector('.card-alert');
    
    // Usar estoque_total calculado pelo backend (sempre é número)
    let estoqueTotal = dadosAtuais.estoque_total;
    
    // Fallback: calcular no frontend se necessário
    if (estoqueTotal === undefined || estoqueTotal === null) {
        const estoque = dadosAtuais.estoque;
        if (estoque && typeof estoque === 'object') {
            estoqueTotal = (parseInt(estoque['80g']) || 0) +
                           (parseInt(estoque['150g']) || 0) +
                           (parseInt(estoque['500g']) || 0);
        } else {
            estoqueTotal = parseInt(estoque) || 0;
        }
    }
    
    estoqueValor.textContent = estoqueTotal;
    
    if (estoqueTotal <= 10) {
        alertaEstoque.style.display = 'flex';
        cardEstoque.style.borderLeftColor = 'var(--cor-danger)';
    } else {
        alertaEstoque.style.display = 'none';
        cardEstoque.style.borderLeftColor = 'var(--cor-principal)';
    }
    
    document.getElementById('faturamento-valor').textContent = 
        formatarMoeda(dadosAtuais.faturamento_bruto || 0);
    
    document.getElementById('lucro-valor').textContent = 
        formatarMoeda(dadosAtuais.lucro_liquido || 0);
    
    const encomendas = dadosAtuais.encomendas || [];
    const encomendasPendentes = encomendas.filter(e => e.status === 'pendente').length;
    document.getElementById('encomendas-pendentes').textContent = encomendasPendentes;
}

// Atualizar alertas importantes
function atualizarAlertas() {
    const container = document.getElementById('alertas-container');
    container.innerHTML = '';
    
    if (!dadosAtuais) return;
    
    const alertas = [];
    
    // Calcular estoque total sempre como número
    let estoqueTotal = 0;
    
    if (dadosAtuais.estoque && typeof dadosAtuais.estoque === 'object') {
        // Somar os 3 tamanhos
        estoqueTotal = (parseInt(dadosAtuais.estoque['80g']) || 0) + 
                       (parseInt(dadosAtuais.estoque['150g']) || 0) + 
                       (parseInt(dadosAtuais.estoque['500g']) || 0);
    } else {
        // Estoque como número único
        estoqueTotal = parseInt(dadosAtuais.estoque) || 0;
    }
    
    // Alerta de estoque crítico
    if (estoqueTotal <= 10) {
        alertas.push({
            tipo: 'danger',
            mensagem: `⚠️ Estoque crítico! Apenas ${estoqueTotal} pudins disponíveis.`
        });
    } else if (estoqueTotal <= 20) {
        alertas.push({
            tipo: 'warning',
            mensagem: `⚠️ Estoque baixo! ${estoqueTotal} pudins disponíveis.`
        });
    }
        });
    }
    
    // Alerta de encomendas para hoje
    const hoje = new Date().toISOString().split('T')[0];
    const encomendasHoje = (dadosAtuais.encomendas || []).filter(e => 
        e.data === hoje && e.status === 'pendente'
    );
    
    if (encomendasHoje.length > 0) {
        alertas.push({
            tipo: 'info',
            mensagem: `📝 Você tem ${encomendasHoje.length} encomenda(s) para entregar hoje!`
        });
    }
    
    // Renderizar alertas
    alertas.forEach(alerta => {
        const div = document.createElement('div');
        div.className = `alerta alerta-${alerta.tipo}`;
        div.textContent = alerta.mensagem;
        container.appendChild(div);
    });
}

// Atualizar últimas vendas
function atualizarUltimasVendas() {
    const tbody = document.querySelector('#ultimas-vendas tbody');
    tbody.innerHTML = '';
    
    if (!dadosAtuais || !dadosAtuais.vendas || dadosAtuais.vendas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhuma venda registrada hoje</td></tr>';
        return;
    }
    
    // Pegar últimas 5 vendas
    const ultimasVendas = dadosAtuais.vendas.slice(-5).reverse();
    
    ultimasVendas.forEach(venda => {
        const tr = document.createElement('tr');
        
        const emojiPagamento = {
            'pix': '💳 PIX',
            'dinheiro': '💵 Dinheiro',
            'cartao': '💳 Cartão'
        };
        
        tr.innerHTML = `
            <td>${formatarHora(venda.data_hora)}</td>
            <td>${venda.quantidade} ${venda.quantidade === 1 ? 'pudim' : 'pudins'}</td>
            <td>${emojiPagamento[venda.pagamento] || venda.pagamento}</td>
            <td><strong>${formatarMoeda(venda.valor_total)}</strong></td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Atualizar encomendas urgentes (próximas 3 dias)
function atualizarEncomendasUrgentes() {
    const container = document.getElementById('encomendas-urgentes-lista');
    container.innerHTML = '';
    
    if (!dadosAtuais || !dadosAtuais.encomendas) {
        container.innerHTML = '<p class="mensagem-vazio">Nenhuma encomenda urgente</p>';
        return;
    }
    
    // Filtrar encomendas urgentes (próximos 3 dias)
    const hoje = new Date();
    const tresDias = new Date();
    tresDias.setDate(hoje.getDate() + 3);
    
    const encomendasUrgentes = dadosAtuais.encomendas.filter(e => {
        if (e.status !== 'pendente') return false;
        
        const dataEncomenda = new Date(e.data);
        return dataEncomenda >= hoje && dataEncomenda <= tresDias;
    });
    
    if (encomendasUrgentes.length === 0) {
        container.innerHTML = '<p class="mensagem-vazio">Nenhuma encomenda urgente</p>';
        return;
    }
    
    // Ordenar por data
    encomendasUrgentes.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    encomendasUrgentes.forEach(encomenda => {
        const div = document.createElement('div');
        div.className = 'encomenda-urgente';
        
        const dataEncomenda = new Date(encomenda.data);
        const isHoje = dataEncomenda.toDateString() === hoje.toDateString();
        
        div.innerHTML = `
            <div class="encomenda-urgente-info">
                <div class="encomenda-urgente-data">📅 ${formatarData(encomenda.data)}</div>
                <div class="encomenda-urgente-detalhes">
                    <strong>${encomenda.cliente}</strong> - ${encomenda.quantidade} ${encomenda.quantidade === 1 ? 'pudim' : 'pudins'}
                </div>
                ${encomenda.telefone ? `<div class="encomenda-urgente-data">📞 ${encomenda.telefone}</div>` : ''}
            </div>
            ${isHoje ? '<span class="badge-urgente">HOJE</span>' : ''}
        `;
        
        container.appendChild(div);
    });
}

// Mostrar mensagem de erro
function mostrarErro(mensagem) {
    const container = document.getElementById('alertas-container');
    const div = document.createElement('div');
    div.className = 'alerta alerta-danger';
    div.textContent = mensagem;
    container.appendChild(div);
    
    // Remover após 5 segundos
    setTimeout(() => div.remove(), 5000);
}
