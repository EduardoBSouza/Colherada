// ============================================
// AUTENTICAÇÃO
// ============================================

// Verificar se está autenticado
function verificarAutenticacao() {
    const token = sessionStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Fazer logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        sessionStorage.removeItem('auth_token');
        window.location.href = 'index.html';
    }
}

// Executar verificação ao carregar qualquer página
verificarAutenticacao();
