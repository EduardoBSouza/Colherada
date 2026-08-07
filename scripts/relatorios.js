// ============================================
// RELATÓRIOS - ANÁLISES E RELATÓRIOS
// ============================================

let dadosRelatorio = null;
let periodoAtual = 'mes';
let vendasFiltradasAtual = [];
let periodoTextoAtual = 'Este Mês';

// Inicializar página
document.addEventListener('DOMContentLoaded', async function() {
    configurarDatas();
    await selecionarPeriodo('mes');
});

// Configurar datas padrão
function configurarDatas() {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    document.getElementById('data-inicio').value = primeiroDiaMes.toISOString().split('T')[0];
    document.getElementById('data-fim').value = hoje.toISOString().split('T')[0];
}

// Selecionar período rápido
async function selecionarPeriodo(periodo, elemento) {
    periodoAtual = periodo;
    
    // Atualizar botões ativos (sem depender do evento global, funciona também na carga inicial)
    document.querySelectorAll('.btn-periodo').forEach(btn => btn.classList.remove('active'));
    const botaoAtivo = elemento || document.querySelector(`.btn-periodo[data-periodo="${periodo}"]`);
    if (botaoAtivo) botaoAtivo.classList.add('active');
    
    // Calcular datas
    const hoje = new Date();
    let dataInicio, dataFim;
    let textoPerido;
    
    switch(periodo) {
        case 'hoje':
            dataInicio = dataFim = hoje;
            textoPerido = 'Hoje';
            break;
        case 'semana':
            const primeiroDiaSemana = new Date(hoje);
            primeiroDiaSemana.setDate(hoje.getDate() - hoje.getDay());
            dataInicio = primeiroDiaSemana;
            dataFim = hoje;
            textoPerido = 'Esta Semana';
            break;
        case 'mes':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            dataFim = hoje;
            textoPerido = 'Este Mês';
            break;
        case 'ano':
            dataInicio = new Date(hoje.getFullYear(), 0, 1);
            dataFim = hoje;
            textoPerido = 'Este Ano';
            break;
    }
    
    periodoTextoAtual = textoPerido;
    document.getElementById('periodo-texto').textContent = textoPerido;
    
    // Atualizar campos de data
    document.getElementById('data-inicio').value = dataInicio.toISOString().split('T')[0];
    document.getElementById('data-fim').value = dataFim.toISOString().split('T')[0];
    
    // Gerar relatório
    await gerarRelatorio(dataInicio, dataFim);
}

// Gerar relatório customizado
async function gerarRelatorioCustom() {
    const dataInicio = new Date(document.getElementById('data-inicio').value);
    const dataFim = new Date(document.getElementById('data-fim').value);
    
    if (dataInicio > dataFim) {
        mostrarNotificacao('A data de início não pode ser maior que a data fim', 'warning');
        return;
    }
    
    periodoTextoAtual = 'Período Personalizado';
    document.getElementById('periodo-texto').textContent = periodoTextoAtual;
    await gerarRelatorio(dataInicio, dataFim);
}

// Gerar relatório
async function gerarRelatorio(dataInicio, dataFim) {
    try {
        dadosRelatorio = await carregarDadosPDV();
        
        // Filtrar vendas do período
        const vendas = filtrarVendasPeriodo(dadosRelatorio.vendas || [], dataInicio, dataFim);
        vendasFiltradasAtual = vendas;
        
        atualizarResumoGeral(vendas);
        atualizarGrafico(vendas, dataInicio, dataFim);
        atualizarFormasPagamento(vendas);
        atualizarMelhorDia(vendas);
        atualizarDetalhamento(vendas);
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        mostrarNotificacao('Erro ao gerar relatório', 'danger');
    }
}

// Filtrar vendas por período
function filtrarVendasPeriodo(vendas, dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    inicio.setHours(0, 0, 0, 0);
    
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);
    
    return vendas.filter(v => {
        const dataVenda = new Date(v.data_hora);
        return dataVenda >= inicio && dataVenda <= fim;
    });
}

// Atualizar resumo geral
function atualizarResumoGeral(vendas) {
    const custoUnitario = 4.00; // Obter das configurações
    
    const faturamento = vendas.reduce((total, v) => total + v.valor_total, 0);
    const quantidade = vendas.reduce((total, v) => total + v.quantidade, 0);
    const custos = quantidade * custoUnitario;
    const lucro = faturamento - custos;
    const ticketMedio = vendas.length > 0 ? faturamento / vendas.length : 0;
    const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0;
    
    document.getElementById('resumo-faturamento').textContent = formatarMoeda(faturamento);
    document.getElementById('resumo-lucro').textContent = formatarMoeda(lucro);
    document.getElementById('resumo-quantidade').textContent = quantidade;
    document.getElementById('resumo-vendas').textContent = vendas.length;
    document.getElementById('resumo-ticket').textContent = formatarMoeda(ticketMedio);
    document.getElementById('resumo-margem').textContent = margem.toFixed(1) + '%';
}

// Atualizar gráfico simples
function atualizarGrafico(vendas, dataInicio, dataFim) {
    const container = document.getElementById('grafico-vendas');
    container.innerHTML = '';
    
    // Agrupar vendas por dia
    const vendasPorDia = {};
    let maxValor = 0;
    
    vendas.forEach(venda => {
        const data = venda.data_hora.split('T')[0];
        if (!vendasPorDia[data]) {
            vendasPorDia[data] = 0;
        }
        vendasPorDia[data] += venda.valor_total;
        maxValor = Math.max(maxValor, vendasPorDia[data]);
    });
    
    // Criar barras
    Object.keys(vendasPorDia).sort().forEach(data => {
        const valor = vendasPorDia[data];
        const altura = maxValor > 0 ? (valor / maxValor) * 100 : 0;
        
        const barra = document.createElement('div');
        barra.className = 'barra-grafico';
        barra.style.height = altura + '%';
        barra.title = `${formatarData(data)}: ${formatarMoeda(valor)}`;
        
        const label = document.createElement('span');
        label.className = 'barra-grafico-label';
        label.textContent = new Date(data).getDate();
        barra.appendChild(label);
        
        container.appendChild(barra);
    });
}

// Atualizar formas de pagamento
function atualizarFormasPagamento(vendas) {
    const porPagamento = {
        pix: 0,
        dinheiro: 0,
        cartao: 0
    };
    
    vendas.forEach(venda => {
        const tipo = venda.pagamento.toLowerCase();
        if (porPagamento[tipo] !== undefined) {
            porPagamento[tipo] += venda.valor_total;
        }
    });
    
    const total = Object.values(porPagamento).reduce((t, v) => t + v, 0);
    
    ['pix', 'dinheiro', 'cartao'].forEach(tipo => {
        const percentual = total > 0 ? (porPagamento[tipo] / total) * 100 : 0;
        document.getElementById(`barra-${tipo}`).style.width = percentual + '%';
        document.getElementById(`valor-barra-${tipo}`).textContent = percentual.toFixed(0) + '%';
    });
}

// Atualizar melhor dia
function atualizarMelhorDia(vendas) {
    const vendasPorDia = {};
    
    vendas.forEach(venda => {
        const data = venda.data_hora.split('T')[0];
        if (!vendasPorDia[data]) {
            vendasPorDia[data] = { vendas: 0, quantidade: 0, faturamento: 0 };
        }
        vendasPorDia[data].vendas++;
        vendasPorDia[data].quantidade += venda.quantidade;
        vendasPorDia[data].faturamento += venda.valor_total;
    });
    
    // Encontrar melhor dia
    let melhorDia = null;
    let maxFaturamento = 0;
    
    Object.keys(vendasPorDia).forEach(data => {
        if (vendasPorDia[data].faturamento > maxFaturamento) {
            maxFaturamento = vendasPorDia[data].faturamento;
            melhorDia = { data, ...vendasPorDia[data] };
        }
    });
    
    if (melhorDia) {
        document.getElementById('melhor-dia-data').textContent = formatarData(melhorDia.data);
        document.getElementById('melhor-dia-vendas').textContent = `${melhorDia.vendas} ${melhorDia.vendas === 1 ? 'venda' : 'vendas'}`;
        document.getElementById('melhor-dia-quantidade').textContent = `${melhorDia.quantidade} pudins`;
        document.getElementById('melhor-dia-faturamento').textContent = formatarMoeda(melhorDia.faturamento);
    } else {
        document.getElementById('melhor-dia-data').textContent = 'Sem vendas no período';
        document.getElementById('melhor-dia-vendas').textContent = '-';
        document.getElementById('melhor-dia-quantidade').textContent = '-';
        document.getElementById('melhor-dia-faturamento').textContent = '-';
    }
}

// Atualizar detalhamento
function atualizarDetalhamento(vendas) {
    const tbody = document.getElementById('detalhamento-vendas');
    tbody.innerHTML = '';
    
    if (vendas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma venda no período selecionado</td></tr>';
        return;
    }
    
    const emojiPagamento = {
        'pix': '💳 PIX',
        'dinheiro': '💵 Dinheiro',
        'cartao': '💳 Cartão'
    };
    
    vendas.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));
    
    vendas.forEach(venda => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarData(venda.data_hora)}</td>
            <td>${formatarHora(venda.data_hora)}</td>
            <td><strong>${venda.quantidade}</strong></td>
            <td>${formatarMoeda(venda.valor_unitario || 10)}</td>
            <td>${emojiPagamento[venda.pagamento] || venda.pagamento}</td>
            <td><strong>${formatarMoeda(venda.valor_total)}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

// Exportar PDF
function exportarPDF() {
    if (vendasFiltradasAtual.length === 0) {
        mostrarNotificacao('Não há vendas no período para exportar', 'warning');
        return;
    }

    if (typeof window.jspdf === 'undefined') {
        mostrarNotificacao('Erro ao carregar biblioteca de PDF', 'danger');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('🍮 Colherada - Relatório de Vendas', 14, 18);
    doc.setFontSize(11);
    doc.text(`Período: ${periodoTextoAtual}`, 14, 26);

    const faturamento = document.getElementById('resumo-faturamento').textContent;
    const lucro = document.getElementById('resumo-lucro').textContent;
    const quantidade = document.getElementById('resumo-quantidade').textContent;
    const totalVendas = document.getElementById('resumo-vendas').textContent;
    doc.text(`Faturamento: ${faturamento}   Lucro: ${lucro}   Pudins vendidos: ${quantidade}   Total de vendas: ${totalVendas}`, 14, 33);

    const emojiPagamento = { pix: 'PIX', dinheiro: 'Dinheiro', cartao: 'Cartão' };
    const linhas = vendasFiltradasAtual
        .slice()
        .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
        .map(v => [
            formatarData(v.data_hora),
            formatarHora(v.data_hora),
            String(v.quantidade),
            formatarMoeda(v.valor_unitario || 0),
            emojiPagamento[v.pagamento] || v.pagamento || '-',
            formatarMoeda(v.valor_total || 0)
        ]);

    doc.autoTable({
        startY: 40,
        head: [['Data', 'Horário', 'Quantidade', 'Valor Unit.', 'Pagamento', 'Total']],
        body: linhas,
        headStyles: { fillColor: [139, 69, 19] }
    });

    doc.save(`relatorio-colherada-${new Date().toISOString().split('T')[0]}.pdf`);
    mostrarNotificacao('✅ PDF exportado com sucesso!', 'success');
}

// Exportar Excel
function exportarExcel() {
    if (vendasFiltradasAtual.length === 0) {
        mostrarNotificacao('Não há vendas no período para exportar', 'warning');
        return;
    }

    if (typeof XLSX === 'undefined') {
        mostrarNotificacao('Erro ao carregar biblioteca de Excel', 'danger');
        return;
    }

    const emojiPagamento = { pix: 'PIX', dinheiro: 'Dinheiro', cartao: 'Cartão' };
    const linhas = vendasFiltradasAtual
        .slice()
        .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
        .map(v => ({
            'Data': formatarData(v.data_hora),
            'Horário': formatarHora(v.data_hora),
            'Cliente': v.cliente || '-',
            'Tamanho': v.tamanho || '-',
            'Sabor': v.sabor || '-',
            'Quantidade': v.quantidade,
            'Valor Unit.': v.valor_unitario || 0,
            'Pagamento': emojiPagamento[v.pagamento] || v.pagamento || '-',
            'Total': v.valor_total || 0
        }));

    const planilha = XLSX.utils.json_to_sheet(linhas);
    planilha['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 12 }];

    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, 'Vendas');

    XLSX.writeFile(livro, `relatorio-colherada-${new Date().toISOString().split('T')[0]}.xlsx`);
    mostrarNotificacao('✅ Excel exportado com sucesso!', 'success');
}

// Imprimir relatório
function imprimirRelatorio() {
    window.print();
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
