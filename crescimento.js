// ============================================
// CRESCIMENTO - VISÃO EXECUTIVA
// ============================================

const CUSTO_UNITARIO_CRESCIMENTO = 7.00;
const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

let graficoCrescimento = null;

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const dados = await carregarDadosPDV();
        const vendas = dados.vendas || [];

        const meses = agruparVendasPorMes(vendas);

        if (meses.length === 0) {
            mostrarSemDados();
            return;
        }

        atualizarKPIs(meses);
        atualizarGrafico(meses);
        atualizarTabela(meses);
        atualizarRecorde(meses);
        atualizarSaborEmAlta(meses);
    } catch (error) {
        console.error('Erro ao carregar visão de crescimento:', error);
    }
});

// Agrupa as vendas em blocos mensais ordenados cronologicamente
function agruparVendasPorMes(vendas) {
    const grupos = {};

    vendas.forEach(venda => {
        const data = new Date(venda.data_hora);
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

        if (!grupos[chave]) {
            grupos[chave] = {
                chave,
                ano: data.getFullYear(),
                mes: data.getMonth(),
                faturamento: 0,
                quantidade: 0,
                numVendas: 0,
                clientes: new Set(),
                sabores: {}
            };
        }

        const grupo = grupos[chave];
        grupo.faturamento += venda.valor_total || 0;
        grupo.quantidade += venda.quantidade || 0;
        grupo.numVendas += 1;
        if (venda.cliente) grupo.clientes.add(venda.cliente);

        const sabor = venda.sabor || 'Não informado';
        grupo.sabores[sabor] = (grupo.sabores[sabor] || 0) + (venda.quantidade || 0);
    });

    return Object.values(grupos)
        .sort((a, b) => a.chave.localeCompare(b.chave))
        .map(grupo => ({
            ...grupo,
            lucro: grupo.faturamento - (grupo.quantidade * CUSTO_UNITARIO_CRESCIMENTO),
            ticketMedio: grupo.numVendas > 0 ? grupo.faturamento / grupo.numVendas : 0,
            totalClientes: grupo.clientes.size
        }));
}

// Calcula variação percentual entre dois valores
function calcularVariacao(atual, anterior) {
    if (anterior === 0 || anterior === undefined) {
        return atual > 0 ? { valor: null, texto: '🆕 Novo', classe: 'kpi-positivo' } : { valor: 0, texto: '-', classe: '' };
    }
    const variacao = ((atual - anterior) / anterior) * 100;
    const classe = variacao > 0 ? 'kpi-positivo' : variacao < 0 ? 'kpi-negativo' : '';
    const seta = variacao > 0 ? '▲' : variacao < 0 ? '▼' : '●';
    return { valor: variacao, texto: `${seta} ${Math.abs(variacao).toFixed(1)}% vs mês anterior`, classe };
}

function nomeMes(grupo) {
    return `${MESES_ABREV[grupo.mes]}/${grupo.ano}`;
}

// Atualiza os cartões de indicadores do mês mais recente
function atualizarKPIs(meses) {
    const atual = meses[meses.length - 1];
    const anterior = meses.length > 1 ? meses[meses.length - 2] : null;

    const hoje = new Date();
    const mesEmAndamento = atual.ano === hoje.getFullYear() && atual.mes === hoje.getMonth();
    document.getElementById('mes-atual-texto').textContent = mesEmAndamento
        ? `${nomeMes(atual)} (em andamento)`
        : nomeMes(atual);

    document.getElementById('kpi-faturamento').textContent = formatarMoeda(atual.faturamento);
    document.getElementById('kpi-lucro').textContent = formatarMoeda(atual.lucro);
    document.getElementById('kpi-quantidade').textContent = atual.quantidade;
    document.getElementById('kpi-ticket').textContent = formatarMoeda(atual.ticketMedio);
    document.getElementById('kpi-clientes').textContent = atual.totalClientes;

    const variacoes = [
        ['kpi-faturamento-variacao', atual.faturamento, anterior ? anterior.faturamento : 0],
        ['kpi-lucro-variacao', atual.lucro, anterior ? anterior.lucro : 0],
        ['kpi-quantidade-variacao', atual.quantidade, anterior ? anterior.quantidade : 0],
        ['kpi-ticket-variacao', atual.ticketMedio, anterior ? anterior.ticketMedio : 0],
        ['kpi-clientes-variacao', atual.totalClientes, anterior ? anterior.totalClientes : 0]
    ];

    variacoes.forEach(([id, valorAtual, valorAnterior]) => {
        const el = document.getElementById(id);
        if (!anterior) {
            el.textContent = 'Primeiro mês com dados';
            el.className = 'kpi-variacao';
            return;
        }
        const { texto, classe } = calcularVariacao(valorAtual, valorAnterior);
        el.textContent = texto;
        el.className = `kpi-variacao ${classe}`;
    });

    // Crescimento médio mensal (média geométrica das variações de faturamento)
    const taxas = [];
    for (let i = 1; i < meses.length; i++) {
        if (meses[i - 1].faturamento > 0) {
            taxas.push(meses[i].faturamento / meses[i - 1].faturamento);
        }
    }

    const crescimentoEl = document.getElementById('kpi-crescimento-medio');
    if (taxas.length === 0) {
        crescimentoEl.textContent = '-';
        document.getElementById('kpi-crescimento-medio-info').textContent = 'Dados insuficientes';
    } else {
        const produto = taxas.reduce((acc, taxa) => acc * taxa, 1);
        const mediaGeometrica = Math.pow(produto, 1 / taxas.length) - 1;
        const percentual = mediaGeometrica * 100;
        crescimentoEl.textContent = `${percentual >= 0 ? '+' : ''}${percentual.toFixed(1)}%`;
        document.getElementById('kpi-crescimento-medio-info').textContent = `média entre ${meses.length} meses`;
    }
}

// Renderiza o gráfico de evolução com Chart.js
function atualizarGrafico(meses) {
    const canvas = document.getElementById('grafico-crescimento');
    if (typeof Chart === 'undefined' || !canvas) return;

    const labels = meses.map(nomeMes);
    const faturamentos = meses.map(m => m.faturamento);
    const lucros = meses.map(m => m.lucro);

    if (graficoCrescimento) {
        graficoCrescimento.destroy();
    }

    graficoCrescimento = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Faturamento',
                    data: faturamentos,
                    borderColor: '#8B4513',
                    backgroundColor: 'rgba(139, 69, 19, 0.15)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Lucro',
                    data: lucros,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.15)',
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${formatarMoeda(ctx.parsed.y)}`
                    }
                }
            },
            scales: {
                y: {
                    ticks: { callback: valor => formatarMoeda(valor) }
                }
            }
        }
    });
}

// Preenche a tabela comparativa mês a mês
function atualizarTabela(meses) {
    const tbody = document.getElementById('tabela-meses');
    tbody.innerHTML = '';

    meses.slice().reverse().forEach((mes, indexReverso) => {
        const indexReal = meses.length - 1 - indexReverso;
        const anterior = indexReal > 0 ? meses[indexReal - 1] : null;
        const variacao = anterior ? calcularVariacao(mes.faturamento, anterior.faturamento) : { texto: '-', classe: '' };

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${nomeMes(mes)}</strong></td>
            <td>${formatarMoeda(mes.faturamento)}</td>
            <td>${formatarMoeda(mes.lucro)}</td>
            <td>${mes.quantidade}</td>
            <td>${formatarMoeda(mes.ticketMedio)}</td>
            <td class="${variacao.classe}">${variacao.texto}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Exibe o melhor mês da história (maior faturamento)
function atualizarRecorde(meses) {
    const melhor = meses.reduce((max, mes) => mes.faturamento > max.faturamento ? mes : max, meses[0]);
    const container = document.getElementById('recorde-mes');

    container.innerHTML = `
        <div class="melhor-dia-icon">🎉</div>
        <div class="melhor-dia-info">
            <h3>${nomeMes(melhor)}</h3>
            <div class="melhor-dia-stats">
                <span class="destaque">${formatarMoeda(melhor.faturamento)}</span>
                <span>•</span>
                <span>${melhor.quantidade} pudins vendidos</span>
                <span>•</span>
                <span>${melhor.numVendas} vendas</span>
            </div>
        </div>
    `;
}

// Compara o mix de sabores do mês atual com o anterior e aponta o destaque
function atualizarSaborEmAlta(meses) {
    const container = document.getElementById('sabor-em-alta');

    if (meses.length < 2) {
        container.innerHTML = '<p class="mensagem-vazio">É preciso ao menos 2 meses de dados para comparar</p>';
        return;
    }

    const atual = meses[meses.length - 1];
    const anterior = meses[meses.length - 2];

    let melhorSabor = null;
    let melhorVariacao = -Infinity;

    Object.keys(atual.sabores).forEach(sabor => {
        const qtdAtual = atual.sabores[sabor];
        const qtdAnterior = anterior.sabores[sabor] || 0;
        const variacao = qtdAnterior === 0 ? qtdAtual : ((qtdAtual - qtdAnterior) / qtdAnterior) * 100;

        if (variacao > melhorVariacao) {
            melhorVariacao = variacao;
            melhorSabor = { sabor, qtdAtual, qtdAnterior, variacao, novo: qtdAnterior === 0 };
        }
    });

    if (!melhorSabor) {
        container.innerHTML = '<p class="mensagem-vazio">Sem dados suficientes</p>';
        return;
    }

    const cresceu = melhorSabor.novo || melhorSabor.variacao > 0;
    const seta = melhorSabor.novo ? '🆕 Novo destaque' : `${melhorSabor.variacao > 0 ? '▲' : '▼'} ${Math.abs(melhorSabor.variacao).toFixed(0)}%`;

    container.innerHTML = `
        <div class="melhor-dia-icon">🍮</div>
        <div class="melhor-dia-info">
            <h3>${melhorSabor.sabor}</h3>
            ${!cresceu ? '<p class="mensagem-vazio">Nenhum sabor cresceu este mês — menor queda:</p>' : ''}
            <div class="melhor-dia-stats">
                <span class="destaque">${seta}</span>
                <span>•</span>
                <span>${melhorSabor.qtdAtual} vendidos em ${nomeMes(atual)}</span>
                <span>•</span>
                <span>${melhorSabor.qtdAnterior} vendidos em ${nomeMes(anterior)}</span>
            </div>
        </div>
    `;
}

function mostrarSemDados() {
    document.getElementById('mes-atual-texto').textContent = 'Sem dados';
    document.getElementById('tabela-meses').innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma venda registrada ainda</td></tr>';
    document.getElementById('recorde-mes').innerHTML = '<p class="mensagem-vazio">Nenhuma venda registrada ainda</p>';
    document.getElementById('sabor-em-alta').innerHTML = '<p class="mensagem-vazio">Nenhuma venda registrada ainda</p>';
}
