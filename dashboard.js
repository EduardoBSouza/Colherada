// ============================================
// DASHBOARD - PÁGINA PRINCIPAL - VERSÃO SIMPLIFICADA
// ============================================

let dadosAtuais = null;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Dashboard carregado');
    await atualizarDashboard();
    setInterval(atualizarDashboard, 30000);
});

async function atualizarDashboard() {
    try {
        dadosAtuais = await carregarDadosPDV();
        console.log('📊 Dados obtidos:', dadosAtuais);
        atualizarCards();
        atualizarAlertas();
        atualizarUltimasVendas();
        atualizarEncomendasUrgentes();
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

window.atualizarDashboard = atualizarDashboard;

function atualizarCards() {
    if (!dadosAtuais) return;
    
    const fatEl = document.getElementById('faturamento-valor');
    const lucroEl = document.getElementById('lucro-valor');
    const estoqueEl = document.getElementById('estoque-valor');
    const encEl = document.getElementById('encomendas-pendentes');
    
    if (fatEl) fatEl.textContent = formatarMoeda(dadosAtuais.faturamento_bruto || 0);
    if (lucroEl) lucroEl.textContent = formatarMoeda(dadosAtuais.lucro_liquido || 0);
    
    let estoqueTotal = 0;
    if (dadosAtuais.estoque && typeof dadosAtuais.estoque === 'object') {
        estoqueTotal = (parseInt(dadosAtuais.estoque['80g']) || 0) +
                       (parseInt(dadosAtuais.estoque['150g']) || 0) +
                       (parseInt(dadosAtuais.estoque['500g']) || 0) +
                       (parseInt(dadosAtuais.estoque['1kg']) || 0);
    }
    if (estoqueEl) estoqueEl.textContent = estoqueTotal;
    
    if (encEl) {
        const encomendas = dadosAtuais.encomendas || [];
        const pendentes = encomendas.filter(e => e.status === 'pendente').length;
        encEl.textContent = pendentes;
    }
    
    console.log('✅ Cards atualizados');
}

function atualizarAlertas() {
    const container = document.getElementById('alertas-container');
    if (!container || !dadosAtuais) return;
    
    container.innerHTML = '';
}

function atualizarUltimasVendas() {
    const tbody = document.querySelector('#ultimas-vendas tbody');
    if (!tbody || !dadosAtuais) return;
    
    tbody.innerHTML = '';
    const vendas = (dadosAtuais.vendas || []).slice(-5).reverse();
    
    vendas.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>-</td><td>${v.quantidade || 0}</td><td>${v.pagamento || '-'}</td><td>${formatarMoeda(v.valor_total || 0)}</td>`;
        tbody.appendChild(tr);
    });
}

function atualizarEncomendasUrgentes() {
    const container = document.getElementById('encomendas-urgentes-lista');
    if (!container || !dadosAtuais) return;
    
    container.innerHTML = '';
}
