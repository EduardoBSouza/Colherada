// ============================================
// FINANCEIRO - ANÁLISE FINANCEIRA
// ============================================

let dadosFinanceiros = null;
let valorVenda = 10.00;
let custoUnitario = 4.00;

// Inicializar página
document.addEventListener('DOMContentLoaded', async function() {
    carregarConfiguracoes();
    await carregarDados();
    configurarEventos();
});

// Configurar eventos
function configurarEventos() {
    document.getElementById('valor-venda').addEventListener('input', calcularMargemPadrao);
    document.getElementById('custo-unitario').addEventListener('input', calcularMargemPadrao);
}

// Carregar configurações salvas
function carregarConfiguracoes() {
    const configSalva = localStorage.getItem('config_financeira');
    if (configSalva) {
        const config = JSON.parse(configSalva);
        valorVenda = config.valorVenda || 10.00;
        custoUnitario = config.custoUnitario || 4.00;
        
        document.getElementById('valor-venda').value = valorVenda.toFixed(2);
        document.getElementById('custo-unitario').value = custoUnitario.toFixed(2);
    }
    calcularMargemPadrao();
}

// Calcular margem padrão
function calcularMargemPadrao() {
    const venda = parseFloat(document.getElementById('valor-venda').value) || 0;
    const custo = parseFloat(document.getElementById('custo-unitario').value) || 0;
    
    if (venda > 0) {
        const margem = ((venda - custo) / venda) * 100;
        document.getElementById('margem-padrao').textContent = margem.toFixed(0) + '%';
    } else {
        document.getElementById('margem-padrao').textContent = '0%';
    }
}

// Salvar configurações
function salvarConfiguracoes() {
    valorVenda = parseFloat(document.getElementById('valor-venda').value) || 10.00;
    custoUnitario = parseFloat(document.getElementById('custo-unitario').value) || 4.00;
    
    const config = {
        valorVenda: valorVenda,
        custoUnitario: custoUnitario
    };
    
    localStorage.setItem('config_financeira', JSON.stringify(config));
    mostrarNotificacao('✅ Configurações salvas com sucesso!', 'success');
    
    // Recalcular tudo
    carregarDados();
}

// Carregar dados
async function carregarDados() {
    try {
        dadosFinanceiros = await carregarDadosPDV();
        atualizarResumoDia();
        atualizarFormasPagamento();
        atualizarResumoMensal();
        atualizarDesempenho7Dias();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarNotificacao('Erro ao carregar dados', 'danger');
    }
}

// Atualizar resumo do dia
function atualizarResumoDia() {
    if (!dadosFinanceiros) return;
    
    const vendas = dadosFinanceiros.vendas || [];
    
    // Calcular totais
    const faturamento = vendas.reduce((total, v) => total + v.valor_total, 0);
    const quantidadeTotal = vendas.reduce((total, v) => total + v.quantidade, 0);
    const custos = quantidadeTotal * custoUnitario;
    const lucro = faturamento - custos;
    const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0;
    
    // Atualizar interface
    document.getElementById('faturamento-dia').textContent = formatarMoeda(faturamento);
    document.getElementById('custos-dia').textContent = formatarMoeda(custos);
    document.getElementById('lucro-dia').textContent = formatarMoeda(lucro);
    document.getElementById('margem-dia').textContent = margem.toFixed(1) + '%';
}

// Atualizar formas de pagamento
function atualizarFormasPagamento() {
    if (!dadosFinanceiros) return;
    
    const vendas = dadosFinanceiros.vendas || [];
    
    // Agrupar por forma de pagamento
    const porPagamento = {
        pix: { valor: 0, quantidade: 0 },
        dinheiro: { valor: 0, quantidade: 0 },
        cartao: { valor: 0, quantidade: 0 }
    };
    
    vendas.forEach(venda => {
        const pagamento = venda.pagamento.toLowerCase();
        if (porPagamento[pagamento]) {
            porPagamento[pagamento].valor += venda.valor_total;
            porPagamento[pagamento].quantidade += 1;
        }
    });
    
    const totalGeral = Object.values(porPagamento).reduce((t, p) => t + p.valor, 0);
    
    // Atualizar cada forma de pagamento
    ['pix', 'dinheiro', 'cartao'].forEach(tipo => {
        const dados = porPagamento[tipo];
        const percentual = totalGeral > 0 ? (dados.valor / totalGeral) * 100 : 0;
        
        document.getElementById(`valor-${tipo}`).textContent = formatarMoeda(dados.valor);
        document.getElementById(`qtd-${tipo}`).textContent = `${dados.quantidade} ${dados.quantidade === 1 ? 'venda' : 'vendas'}`;
        document.getElementById(`perc-${tipo}`).textContent = percentual.toFixed(0) + '%';
    });
}

// Atualizar resumo mensal
function atualizarResumoMensal() {
    if (!dadosFinanceiros) return;
    
    const vendas = dadosFinanceiros.vendas || [];
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    // Filtrar vendas do mês
    const vendasMes = vendas.filter(v => {
        const dataVenda = new Date(v.data_hora);
        return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
    });
    
    // Calcular totais
    const faturamento = vendasMes.reduce((total, v) => total + v.valor_total, 0);
    const quantidadeTotal = vendasMes.reduce((total, v) => total + v.quantidade, 0);
    const custos = quantidadeTotal * custoUnitario;
    const lucro = faturamento - custos;
    const ticketMedio = vendasMes.length > 0 ? faturamento / vendasMes.length : 0;
    
    // Atualizar interface
    document.getElementById('faturamento-mes').textContent = formatarMoeda(faturamento);
    document.getElementById('custos-mes').textContent = formatarMoeda(custos);
    document.getElementById('lucro-mes').textContent = formatarMoeda(lucro);
    document.getElementById('quantidade-mes').textContent = quantidadeTotal;
    document.getElementById('vendas-mes').textContent = vendasMes.length;
    document.getElementById('ticket-medio').textContent = formatarMoeda(ticketMedio);
}

// Atualizar desempenho dos últimos 7 dias
function atualizarDesempenho7Dias() {
    const tbody = document.getElementById('desempenho-7dias');
    tbody.innerHTML = '';
    
    if (!dadosFinanceiros) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Carregando...</td></tr>';
        return;
    }
    
    const vendas = dadosFinanceiros.vendas || [];
    const hoje = new Date();
    
    // Agrupar vendas por data
    const vendasPorDia = {};
    
    for (let i = 6; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const dataStr = data.toISOString().split('T')[0];
        vendasPorDia[dataStr] = [];
    }
    
    vendas.forEach(venda => {
        const dataStr = venda.data_hora.split('T')[0];
        if (vendasPorDia[dataStr] !== undefined) {
            vendasPorDia[dataStr].push(venda);
        }
    });
    
    // Renderizar tabela
    Object.keys(vendasPorDia).sort().forEach(dataStr => {
        const vendasDia = vendasPorDia[dataStr];
        const faturamento = vendasDia.reduce((total, v) => total + v.valor_total, 0);
        const quantidade = vendasDia.reduce((total, v) => total + v.quantidade, 0);
        const custos = quantidade * custoUnitario;
        const lucro = faturamento - custos;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${formatarData(dataStr)}</strong></td>
            <td>${vendasDia.length}</td>
            <td>${quantidade}</td>
            <td>${formatarMoeda(faturamento)}</td>
            <td class="lucro-positivo">${formatarMoeda(lucro)}</td>
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
