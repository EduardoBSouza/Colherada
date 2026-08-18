// ============================================
// DASHBOARD - PÁGINA PRINCIPAL
// ============================================

let dadosAtuais = null;
let mesSelecionado = ''; // Vazio = todos os meses
let dadosFiltrados = null; // Dados filtrados por mês

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', async function() {
    await atualizarDashboard();
    
    // Atualizar a cada 30 segundos
    setInterval(atualizarDashboard, 30000);
});

// Função para extrair mês de uma data (formato: "2026-06-24" ou "2026-06-24 00:00:00")
function extrairMes(dataString) {
    if (!dataString) return '';
    // Pega os primeiros 7 caracteres (yyyy-mm)
    return dataString.substring(0, 7).substring(5, 7); // Extrai o mês
}

// Função para filtrar dados por mês
function filtrarDadosPorMes() {
    if (!dadosAtuais) {
        dadosFiltrados = null;
        return;
    }
    
    // Se nenhum mês foi selecionado, usar todos os dados
    if (!mesSelecionado) {
        dadosFiltrados = JSON.parse(JSON.stringify(dadosAtuais));
        return;
    }
    
    // Copiar estrutura dos dados
    dadosFiltrados = JSON.parse(JSON.stringify(dadosAtuais));
    
    // Filtrar vendas por mês
    if (dadosFiltrados.vendas && Array.isArray(dadosFiltrados.vendas)) {
        dadosFiltrados.vendas = dadosFiltrados.vendas.filter(venda => {
            const mesVenda = extrairMes(venda.data_hora);
            return mesVenda === mesSelecionado;
        });
    }
    
    // Filtrar encomendas por mês
    if (dadosFiltrados.encomendas && Array.isArray(dadosFiltrados.encomendas)) {
        dadosFiltrados.encomendas = dadosFiltrados.encomendas.filter(encomenda => {
            const mesEncomenda = extrairMes(encomenda.data);
            return mesEncomenda === mesSelecionado;
        });
    }
    
    // Recalcular faturamento e lucro para o mês selecionado
    if (dadosFiltrados.vendas && dadosFiltrados.vendas.length > 0) {
        const faturamentoBruto = dadosFiltrados.vendas.reduce((total, venda) => {
            return total + (venda.valor_total || 0);
        }, 0);
        dadosFiltrados.faturamento_bruto = parseFloat(faturamentoBruto.toFixed(2));
        
        // Calcular lucro (assumindo que é faturamento - (quantidade * custo unitário))
        const custTotal = dadosFiltrados.vendas.reduce((total, venda) => {
            return total + (venda.quantidade * 7.00); // Custo unitário é 7.00
        }, 0);
        dadosFiltrados.lucro_liquido = parseFloat((faturamentoBruto - custTotal).toFixed(2));
    } else {
        dadosFiltrados.faturamento_bruto = 0;
        dadosFiltrados.lucro_liquido = 0;
    }
}

// Função chamada quando o usuário muda o mês
window.alterarMes = function() {
    const select = document.getElementById('filtro-mes');
    mesSelecionado = select.value;
    
    filtrarDadosPorMes();
    
    // Atualizar o dashboard com os dados filtrados
    atualizarCards();
    atualizarAlertas();
    atualizarUltimasVendas();
    atualizarEncomendasUrgentes();
}

// Atualizar todos os dados do dashboard
async function atualizarDashboard() {
    try {
        dadosAtuais = await carregarDadosPDV();
        filtrarDadosPorMes(); // Aplicar filtro atual
        
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
    const dados = dadosFiltrados || dadosAtuais;
    if (!dados) return;
    
    const estoqueValor = document.getElementById('estoque-valor');
    const cardEstoque = document.getElementById('card-estoque');
    const alertaEstoque = cardEstoque.querySelector('.card-alert');
    
    // Usar estoque_total calculado pelo backend (sempre é número)
    let estoqueTotal = dados.estoque_total;
    
    // Fallback: calcular no frontend se necessário
    if (estoqueTotal === undefined || estoqueTotal === null) {
        const estoque = dados.estoque;
        if (estoque && typeof estoque === 'object') {
            estoqueTotal = (parseInt(estoque['80g']) || 0) +
                           (parseInt(estoque['150g']) || 0) +
                           (parseInt(estoque['500g']) || 0) +
                           (parseInt(estoque['1kg']) || 0);
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
        formatarMoeda(dados.faturamento_bruto || 0);
    
    document.getElementById('lucro-valor').textContent = 
        formatarMoeda(dados.lucro_liquido || 0);
    
    const encomendas = dados.encomendas || [];
    const encomendasPendentes = encomendas.filter(e => e.status === 'pendente').length;
    document.getElementById('encomendas-pendentes').textContent = encomendasPendentes;
}

// Atualizar alertas importantes
function atualizarAlertas() {
    const container = document.getElementById('alertas-container');
    container.innerHTML = '';
    
    const dados = dadosFiltrados || dadosAtuais;
    if (!dados) return;
    
    const alertas = [];
    
    // Calcular estoque total sempre como número
    let estoqueTotal = 0;
    
    if (dados.estoque && typeof dados.estoque === 'object') {
        // Somar os 3 tamanhos
        estoqueTotal = (parseInt(dados.estoque['80g']) || 0) + 
                       (parseInt(dados.estoque['150g']) || 0) + 
                       (parseInt(dados.estoque['500g']) || 0) +
                       (parseInt(dados.estoque['1kg']) || 0);
    } else {
        // Estoque como número único
        estoqueTotal = parseInt(dados.estoque) || 0;
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
    
    // Alerta de encomendas para hoje (somente quando não há filtro de mês)
    if (!mesSelecionado) {
        const hoje = new Date().toISOString().split('T')[0];
        const encomendasHoje = (dados.encomendas || []).filter(e => 
            e.data === hoje && e.status === 'pendente'
        );
        
        if (encomendasHoje.length > 0) {
            alertas.push({
                tipo: 'info',
                mensagem: `📝 Você tem ${encomendasHoje.length} encomenda(s) para entregar hoje!`
            });
        }
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
    
    const dados = dadosFiltrados || dadosAtuais;
    if (!dados || !dados.vendas || dados.vendas.length === 0) {
        const mensagem = mesSelecionado ? 'Nenhuma venda registrada neste mês' : 'Nenhuma venda registrada hoje';
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">${mensagem}</td></tr>`;
        return;
    }
    
    // Pegar últimas 5 vendas
    const ultimasVendas = dados.vendas.slice(-5).reverse();
    
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

// Atualizar encomendas urgentes (próximas 3 dias ou do mês selecionado)
function atualizarEncomendasUrgentes() {
    const container = document.getElementById('encomendas-urgentes-lista');
    container.innerHTML = '';
    
    const dados = dadosFiltrados || dadosAtuais;
    if (!dados || !dados.encomendas) {
        container.innerHTML = '<p class="mensagem-vazio">Nenhuma encomenda urgente</p>';
        return;
    }
    
    let encomendasFiltradas;
    
    if (mesSelecionado) {
        // Se há filtro de mês, mostrar todas as encomendas do mês que estão pendentes
        encomendasFiltradas = dados.encomendas.filter(e => e.status === 'pendente');
    } else {
        // Se não há filtro, mostrar encomendas urgentes (próximos 3 dias)
        const hoje = new Date();
        const tresDias = new Date();
        tresDias.setDate(hoje.getDate() + 3);
        
        encomendasFiltradas = dados.encomendas.filter(e => {
            if (e.status !== 'pendente') return false;
            
            const dataEncomenda = new Date(e.data);
            return dataEncomenda >= hoje && dataEncomenda <= tresDias;
        });
    }
    
    if (encomendasFiltradas.length === 0) {
        container.innerHTML = '<p class="mensagem-vazio">Nenhuma encomenda urgente</p>';
        return;
    }
    
    // Ordenar por data
    encomendasFiltradas.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    const hoje = new Date();
    encomendasFiltradas.forEach(encomenda => {
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
            ${isHoje && !mesSelecionado ? '<span class="badge-urgente">HOJE</span>' : ''}
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
