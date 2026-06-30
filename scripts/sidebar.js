// ============================================
// SIDEBAR - CONTROLE DE NAVEGAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mainContent = document.getElementById('main-content');
    
    // Toggle sidebar em mobile
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            
            // Adicionar overlay se necessário
            if (sidebar.classList.contains('active')) {
                criarOverlay();
            } else {
                removerOverlay();
            }
        });
    }
    
    // Criar overlay para fechar sidebar ao clicar fora
    function criarOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        `;
        
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            removerOverlay();
        });
        
        document.body.appendChild(overlay);
    }
    
    function removerOverlay() {
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    // Marcar item ativo do menu
    const paginaAtual = window.location.pathname.split('/').pop();
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === paginaAtual) {
            item.parentElement.classList.add('active');
        } else {
            item.parentElement.classList.remove('active');
        }
    });
    
    // Fechar sidebar ao clicar em um link (mobile)
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                removerOverlay();
            }
        });
    });
});
