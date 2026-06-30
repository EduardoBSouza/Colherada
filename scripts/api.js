// ============================================
// API - COMUNICAÇÃO COM O BACKEND
// ============================================

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : ''; // Usar URL relativa em produção

// Fazer requisição GET
async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição GET:', error);
        throw error;
    }
}

// Fazer requisição POST
async function apiPost(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição POST:', error);
        throw error;
    }
}

// Carregar dados do PDV
async function carregarDadosPDV() {
    try {
        const dados = await apiGet('/api/dados');
        return dados;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Retornar dados padrão em caso de erro
        return {
            estoque: 0,
            vendas: [],
            encomendas: [],
            faturamento_bruto: 0,
            lucro_liquido: 0
        };
    }
}

// Registrar venda
async function registrarVenda(quantidade, pagamento, valorUnitario) {
    try {
        const resultado = await apiPost('/api/venda', {
            quantidade: parseInt(quantidade),
            pagamento: pagamento,
            valor_unitario: parseFloat(valorUnitario)
        });
        return resultado;
    } catch (error) {
        console.error('Erro ao registrar venda:', error);
        throw error;
    }
}

// Abastecer estoque
async function abastecerEstoque(quantidade) {
    try {
        const resultado = await apiPost('/api/abastecer', {
            quantidade: parseInt(quantidade)
        });
        return resultado;
    } catch (error) {
        console.error('Erro ao abastecer estoque:', error);
        throw error;
    }
}

// Remover do estoque
async function removerEstoque(quantidade) {
    try {
        const resultado = await apiPost('/api/remover_estoque', {
            quantidade: parseInt(quantidade)
        });
        return resultado;
    } catch (error) {
        console.error('Erro ao remover do estoque:', error);
        throw error;
    }
}

// Registrar encomenda
async function registrarEncomenda(cliente, quantidade, data, telefone) {
    try {
        const resultado = await apiPost('/api/encomenda', {
            cliente: cliente,
            quantidade: parseInt(quantidade),
            data: data,
            telefone: telefone
        });
        return resultado;
    } catch (error) {
        console.error('Erro ao registrar encomenda:', error);
        throw error;
    }
}

// Concluir encomenda
async function concluirEncomenda(id) {
    try {
        const resultado = await apiPost('/api/concluir_encomenda', {
            id: parseInt(id)
        });
        return resultado;
    } catch (error) {
        console.error('Erro ao concluir encomenda:', error);
        throw error;
    }
}

// Cancelar encomenda
async function cancelarEncomenda(id) {
    try {
        const resultado = await apiPost('/api/cancelar_encomenda', {
            id: parseInt(id)
        });
        return resultado;
    } catch (error) {
        console.error('Erro ao cancelar encomenda:', error);
        throw error;
    }
}

// Gerar relatório
async function gerarRelatorio(dataInicio, dataFim) {
    try {
        const resultado = await apiPost('/api/relatorio', {
            data_inicio: dataInicio,
            data_fim: dataFim
        });
        return resultado;
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        throw error;
    }
}

// Fechar caixa
async function fecharCaixa() {
    try {
        const resultado = await apiPost('/api/fechar_caixa', {});
        return resultado;
    } catch (error) {
        console.error('Erro ao fechar caixa:', error);
        throw error;
    }
}

// Salvar receita
async function salvarReceita(titulo, conteudo) {
    try {
        const resultado = await apiPost('/api/salvar_receita', {
            titulo: titulo,
            conteudo: conteudo
        });
        return resultado;
    } catch (error) {
        console.error('Erro ao salvar receita:', error);
        throw error;
    }
}

// Carregar receita
async function carregarReceita() {
    try {
        const receita = await apiGet('/api/receita');
        return receita;
    } catch (error) {
        console.error('Erro ao carregar receita:', error);
        return { titulo: '', conteudo: '' };
    }
}

// Formatar moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(data);
}

// Formatar hora
function formatarHora(dataString) {
    const data = new Date(dataString);
    return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(data);
}
