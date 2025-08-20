document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');

    generateBtn.addEventListener('click', () => {
        // Mostrar efeito de loading no botão
        const originalHTML = generateBtn.innerHTML;
        generateBtn.disabled = true;
        generateBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"></path>
                <path d="M12 8v4l2 2"></path>
            </svg>
            Redirecionando...
        `;

        // Adicionar estilo de animação para o ícone girar
        const style = document.createElement('style');
        style.textContent = `
            .spin {
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        // Coletar os escopos selecionados
        const checkboxes = document.querySelectorAll('.scope-checkbox:checked');
        const scopes = Array.from(checkboxes).map(cb => cb.value).join(' ');
        
        if (!scopes) {
            // Restaurar o botão
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalHTML;

            // Mostrar mensagem de erro
            const errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-danger fade-in';
            errorAlert.innerHTML = `
                <div class="alert-icon">❌</div>
                <div class="alert-content">
                    <div class="alert-title">Nenhum escopo selecionado</div>
                    <div class="alert-message">
                        Por favor, selecione pelo menos um escopo para continuar.
                    </div>
                </div>
            `;
            
            // Inserir o alerta antes do botão
            generateBtn.parentNode.insertBefore(errorAlert, generateBtn);
            
            // Remover o alerta após 5 segundos
            setTimeout(() => {
                errorAlert.remove();
            }, 5000);
            
            return;
        }
        
        // Redirecionar para o endpoint de autenticação com os escopos selecionados
        window.location.href = `/auth/login?scopes=${encodeURIComponent(scopes)}`;
    });

    // Opcionalmente: adicionar funcionalidade para selecionar/desselecionar todos os escopos
    // Isso poderia ser implementado adicionando um checkbox "Selecionar todos" e um handler para ele
});
