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
    
    // Filtrar encomendas pendentes
    const pendentes = encomendas.filter(e => e.status === 'pendente');
    
    // Concluídas este mês
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const concluidas = encomendas.filter(e => {
        if (e.status !== 'concluida') return false;
        const dataConclusao = new Date(e.concluido_em || e.data_conclusao || e.data);
        return dataConclusao.getMonth() === mesAtual && dataConclusao.getFullYear() === anoAtual;
    });
    
    // Atualizar cards
    document.getElementById('total-pendentes').textContent = pendentes.length;
    document.getElementById('concluidas-mes').textContent = concluidas.length;
}

// Cadastrar nova encomenda
async function cadastrarEncomenda() {
    const cliente = document.getElementById('cliente-nome').value.trim();
    const telefone = document.getElementById('cliente-telefone').value.trim();
    const tamanho = document.getElementById('encomenda-tamanho').value;
    const sabor = document.getElementById('sabor-encomenda').value;
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
        const resultado = await registrarEncomenda(cliente, quantidade, data, telefone, tamanho, observacoes, sabor);
        
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
    
    // Filtrar encomendas pendentes
    const pendentes = encomendas.filter(e => e.status === 'pendente');
    
    // Atualizar lista
    const listaTodas = document.getElementById('lista-todas');
    
    if (pendentes.length === 0) {
        listaTodas.innerHTML = '<p class="mensagem-vazio">Nenhuma encomenda pendente no momento 🎉</p>';
    } else {
        listaTodas.innerHTML = '';
        // Ordenar por data
        pendentes.sort((a, b) => new Date(a.data) - new Date(b.data));
        
        pendentes.forEach(encomenda => {
            listaTodas.appendChild(criarCardEncomenda(encomenda));
        });
    }
}

// Criar card de encomenda
function criarCardEncomenda(encomenda) {
    const div = document.createElement('div');
    div.className = 'encomenda-card';
    
    const tamanhoEmoji = {
        '80g': '🍮 80g',
        '150g': '🍮 150g',
        '500g': '🍮 500g',
        '1kg': '🍮 1kg'
    };
    const tamanhoTexto = encomenda.tamanho ? tamanhoEmoji[encomenda.tamanho] || encomenda.tamanho : '🍮 150g';
    
    div.innerHTML = `
        <div class="encomenda-info">
            <div class="encomenda-header">
                <span class="encomenda-cliente">${encomenda.cliente}</span>
            </div>
            <div class="encomenda-detalhes">
                <span>📅 <strong>${formatarData(encomenda.data)}</strong></span>
                <span>${tamanhoTexto}</span>
                ${encomenda.sabor ? `<span>🍮 ${encomenda.sabor}</span>` : ''}
                <span>📦 <strong>${encomenda.quantidade}</strong> ${encomenda.quantidade === 1 ? 'pudim' : 'pudins'}</span>
                ${encomenda.telefone ? `<span>📞 ${encomenda.telefone}</span>` : ''}
            </div>
            ${encomenda.observacoes ? `<div class="encomenda-observacoes">💬 ${encomenda.observacoes}</div>` : ''}
        </div>
        <div class="encomenda-acoes">
            <button class="btn-editar" onclick="abrirModalEditar(${encomenda.id})">
                ✏️ Editar
            </button>
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
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Carregando...</td></tr>';
        return;
    }
    
    // Filtrar concluídas
    const concluidas = dadosEncomendas.encomendas
        .filter(e => e.status === 'concluida')
        .sort((a, b) => {
            const dataA = new Date(a.concluido_em || a.data_conclusao || a.data);
            const dataB = new Date(b.concluido_em || b.data_conclusao || b.data);
            return dataB - dataA;
        })
        .slice(0, 10); // Últimas 10
    
    if (concluidas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma encomenda concluída ainda</td></tr>';
        return;
    }
    
    const tamanhoEmoji = {
        '80g': '🍮 80g',
        '150g': '🍮 150g',
        '500g': '🍮 500g',
        '1kg': '🍮 1kg'
    };
    
    concluidas.forEach(encomenda => {
        const tr = document.createElement('tr');
        const tamanhoTexto = encomenda.tamanho ? tamanhoEmoji[encomenda.tamanho] || encomenda.tamanho : '🍮 150g';
        
        // Usar concluido_em que é o campo correto do backend
        const dataConclusao = encomenda.concluido_em || encomenda.data_conclusao || encomenda.data;
        
        tr.innerHTML = `
            <td><strong>${encomenda.cliente}</strong></td>
            <td>${tamanhoTexto}</td>
            <td>${encomenda.sabor || '-'}</td>
            <td>${encomenda.quantidade} ${encomenda.quantidade === 1 ? 'pudim' : 'pudins'}</td>
            <td>${formatarData(encomenda.data)}</td>
            <td>${dataConclusao ? formatarData(dataConclusao) : '-'}</td>
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

// ============================================
// FUNÇÕES DE EDIÇÃO DE ENCOMENDAS
// ============================================

let encomendaEmEdicao = null;

// Abrir modal de edição
async function abrirModalEditar(id) {
    try {
        // Buscar dados da encomenda
        const response = await fetch(`/api/obter_encomenda/${id}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        });
        
        if (!response.ok) throw new Error('Encomenda não encontrada');
        
        const resultado = await response.json();
        if (!resultado.success) throw new Error(resultado.message);
        
        encomendaEmEdicao = resultado.encomenda;
        
        // Criar e exibir modal
        const modal = document.createElement('div');
        modal.id = 'modal-editar';
        modal.className = 'modal-editar';
        modal.innerHTML = `
            <div class="modal-content-editar">
                <div class="modal-header">
                    <h2>✏️ Editar Encomenda</h2>
                    <button class="btn-fechar" onclick="fecharModalEditar()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editar-cliente">Nome do Cliente *</label>
                            <input type="text" 
                                   id="editar-cliente" 
                                   class="form-input" 
                                   value="${encomendaEmEdicao.cliente || ''}"
                                   required>
                        </div>
                        <div class="form-group">
                            <label for="editar-telefone">Telefone</label>
                            <input type="tel" 
                                   id="editar-telefone" 
                                   class="form-input" 
                                   value="${encomendaEmEdicao.telefone || ''}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editar-tamanho">Tamanho *</label>
                            <select id="editar-tamanho" class="form-input" required>
                                <option value="80g" ${encomendaEmEdicao.tamanho === '80g' ? 'selected' : ''}>🍮 Pequeno (80g)</option>
                                <option value="150g" ${encomendaEmEdicao.tamanho === '150g' ? 'selected' : ''}>🍮 Médio (150g)</option>
                                <option value="500g" ${encomendaEmEdicao.tamanho === '500g' ? 'selected' : ''}>🍮 Grande (500g)</option>
                                <option value="1kg" ${encomendaEmEdicao.tamanho === '1kg' ? 'selected' : ''}>🍮 Família (1kg)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editar-sabor">Sabor *</label>
                            <select id="editar-sabor" class="form-input" required>
                                <option value="Leite Condensado" ${encomendaEmEdicao.sabor === 'Leite Condensado' ? 'selected' : ''}>🍮 Leite Condensado</option>
                                <option value="Coco" ${encomendaEmEdicao.sabor === 'Coco' ? 'selected' : ''}>🥥 Coco</option>
                                <option value="Chocolate" ${encomendaEmEdicao.sabor === 'Chocolate' ? 'selected' : ''}>🍫 Chocolate</option>
                                <option value="Doce de Leite" ${encomendaEmEdicao.sabor === 'Doce de Leite' ? 'selected' : ''}>🥛 Doce de Leite</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editar-quantidade">Quantidade de Pudins *</label>
                            <input type="number" 
                                   id="editar-quantidade" 
                                   class="form-input" 
                                   min="1" 
                                   value="${encomendaEmEdicao.quantidade || 1}"
                                   required>
                        </div>
                        <div class="form-group">
                            <label for="editar-data">Data de Entrega *</label>
                            <input type="date" 
                                   id="editar-data" 
                                   class="form-input"
                                   value="${encomendaEmEdicao.data || ''}"
                                   required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="editar-observacoes">Observações</label>
                        <textarea id="editar-observacoes" 
                                  class="form-textarea" 
                                  rows="3"
                                  placeholder="Anotações adicionais...">${encomendaEmEdicao.observacoes || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="fecharModalEditar()">
                        ❌ Cancelar
                    </button>
                    <button class="btn btn-success" onclick="salvarEdicaoEncomenda()">
                        ✅ Salvar Alterações
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar estilos do modal
        const style = document.createElement('style');
        style.id = 'modal-editar-style';
        style.textContent = `
            .modal-editar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: fadeIn 0.2s ease;
            }
            
            .modal-content-editar {
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                animation: slideUp 0.3s ease;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .modal-header h2 {
                margin: 0;
                color: #333;
            }
            
            .btn-fechar {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                transition: color 0.2s;
            }
            
            .btn-fechar:hover {
                color: #333;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .modal-footer {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                padding: 20px;
                border-top: 1px solid #e0e0e0;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        
        // Verificar se o estilo já existe
        if (!document.getElementById('modal-editar-style')) {
            document.head.appendChild(style);
        }
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('Erro ao abrir modal:', error);
        mostrarNotificacao('❌ Erro ao carregegar encomenda', 'danger');
    }
}

// Fechar modal de edição
function fecharModalEditar() {
    const modal = document.getElementById('modal-editar');
    if (modal) {
        modal.style.animation = 'slideUp 0.3s ease reverse';
        setTimeout(() => modal.remove(), 300);
    }
    encomendaEmEdicao = null;
}

// Salvar edição
async function salvarEdicaoEncomenda() {
    if (!encomendaEmEdicao) {
        mostrarNotificacao('❌ Erro: Nenhuma encomenda em edição', 'danger');
        return;
    }
    
    const cliente = document.getElementById('editar-cliente').value.trim();
    const telefone = document.getElementById('editar-telefone').value.trim();
    const tamanho = document.getElementById('editar-tamanho').value;
    const sabor = document.getElementById('editar-sabor').value;
    const quantidade = parseInt(document.getElementById('editar-quantidade').value);
    const data = document.getElementById('editar-data').value;
    const observacoes = document.getElementById('editar-observacoes').value.trim();
    
    // Validações
    if (!cliente) {
        mostrarNotificacao('⚠️ Digite o nome do cliente', 'warning');
        return;
    }
    
    if (!quantidade || quantidade <= 0) {
        mostrarNotificacao('⚠️ Digite uma quantidade válida', 'warning');
        return;
    }
    
    if (!data) {
        mostrarNotificacao('⚠️ Selecione a data de entrega', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/editar_encomenda', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: encomendaEmEdicao.id,
                cliente,
                telefone,
                tamanho,
                sabor,
                quantidade,
                data,
                observacoes
            })
        });
        
        if (!response.ok) throw new Error('Erro na requisição');
        
        const resultado = await response.json();
        
        if (resultado.success) {
            mostrarNotificacao('✅ Encomenda atualizada com sucesso!', 'success');
            fecharModalEditar();
            await carregarDados();
        } else {
            mostrarNotificacao('❌ ' + resultado.message, 'danger');
        }
    } catch (error) {
        console.error('Erro ao salvar:', error);
        mostrarNotificacao('❌ Erro ao atualizar encomenda', 'danger');
    }
}
