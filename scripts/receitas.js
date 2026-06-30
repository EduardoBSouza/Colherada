// ============================================
// RECEITAS - GESTÃO DE RECEITAS
// ============================================

// Inicializar página
document.addEventListener('DOMContentLoaded', async function() {
    await carregarReceitaSalva();
    calcularIngredientes();
});

// Carregar receita salva
async function carregarReceitaSalva() {
    try {
        const receita = await carregarReceita();
        
        if (receita && receita.titulo) {
            document.getElementById('titulo-receita').value = receita.titulo;
            document.getElementById('conteudo-receita').value = receita.conteudo || '';
        }
    } catch (error) {
        console.error('Erro ao carregar receita:', error);
    }
}

// Salvar receita
async function salvarReceita() {
    const titulo = document.getElementById('titulo-receita').value.trim();
    const conteudo = document.getElementById('conteudo-receita').value.trim();
    
    if (!titulo) {
        mostrarNotificacao('Digite um título para a receita', 'warning');
        document.getElementById('titulo-receita').focus();
        return;
    }
    
    if (!conteudo) {
        mostrarNotificacao('Escreva o conteúdo da receita', 'warning');
        document.getElementById('conteudo-receita').focus();
        return;
    }
    
    try {
        const resultado = await salvarReceitaAPI(titulo, conteudo);
        
        if (resultado.success) {
            mostrarNotificacao('✅ Receita salva com sucesso!', 'success');
        } else {
            mostrarNotificacao('❌ Erro ao salvar receita', 'danger');
        }
    } catch (error) {
        console.error('Erro ao salvar:', error);
        mostrarNotificacao('❌ Erro ao salvar receita', 'danger');
    }
}

// Função auxiliar para salvar via API
async function salvarReceitaAPI(titulo, conteudo) {
    try {
        const resultado = await apiPost('/api/salvar_receita', {
            titulo: titulo,
            conteudo: conteudo
        });
        return resultado;
    } catch (error) {
        console.error('Erro ao salvar receita:', error);
        // Fallback: salvar localmente
        localStorage.setItem('receita', JSON.stringify({ titulo, conteudo }));
        return { sucesso: true };
    }
}

// Limpar receita
function limparReceita() {
    if (!confirm('Tem certeza que deseja limpar tudo? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    document.getElementById('titulo-receita').value = '';
    document.getElementById('conteudo-receita').value = '';
    document.getElementById('titulo-receita').focus();
    
    mostrarNotificacao('Receita limpa', 'info');
}

// Calcular ingredientes
function calcularIngredientes() {
    const quantidade = parseInt(document.getElementById('quantidade-pudins').value) || 1;
    
    // Proporções base (para 1 pudim)
    const leiteCondensado = quantidade * 1;
    const leite = quantidade * 2;
    const ovos = quantidade * 3;
    const acucar = quantidade * 1;
    
    // Atualizar interface
    document.getElementById('qtd-leite-condensado').textContent = 
        `${leiteCondensado} ${leiteCondensado === 1 ? 'lata' : 'latas'}`;
    
    document.getElementById('qtd-leite').textContent = 
        `${leite} ${leite === 1 ? 'lata' : 'latas'}`;
    
    document.getElementById('qtd-ovos').textContent = 
        `${ovos} ${ovos === 1 ? 'unidade' : 'unidades'}`;
    
    document.getElementById('qtd-acucar').textContent = 
        `${acucar} ${acucar === 1 ? 'xícara' : 'xícaras'}`;
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

// Adicionar atalhos de teclado
document.addEventListener('keydown', function(e) {
    // Ctrl + S para salvar
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        salvarReceita();
    }
});
