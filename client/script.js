document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const clientIdInput = document.getElementById('client-id');
  const clientSecretInput = document.getElementById('client-secret');
  const toggleSecretBtn = document.getElementById('toggle-secret');

  // Função para mostrar/esconder o CLIENT SECRET
  if (toggleSecretBtn) {
    toggleSecretBtn.addEventListener('click', () => {
      const secretInput = document.getElementById('client-secret');
      const type = secretInput.type === 'password' ? 'text' : 'password';
      secretInput.type = type;

      // Atualizar texto do botão
      toggleSecretBtn.innerHTML =
        type === 'password'
          ? `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Mostrar
            `
          : `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                Hide
            `;
    });
  }

  generateBtn.addEventListener('click', () => {
    // Verificar se os campos obrigatórios foram preenchidos
    const clientId = clientIdInput.value.trim();
    const clientSecret = clientSecretInput.value.trim();

    if (!clientId || !clientSecret) {
      // Mostrar mensagem de erro
      const errorAlert = document.createElement('div');
      errorAlert.className = 'alert alert-danger fade-in';
      errorAlert.innerHTML = `
                <div class="alert-icon">❌</div>
                <div class="alert-content">
                    <div class="alert-title">Required fields</div>
                    <div class="alert-message">
                        Please fill in the CLIENT ID and CLIENT SECRET to continue.
                    </div>
                </div>
            `;

      // Inserir o alerta antes do botão
      generateBtn.parentNode.insertBefore(errorAlert, generateBtn);

      // Remover o alerta após 5 segundos
      setTimeout(() => {
        errorAlert.remove();
      }, 5000);

      // Destacar os campos não preenchidos
      if (!clientId) {
        clientIdInput.style.borderColor = 'var(--error-color)';
        setTimeout(() => {
          clientIdInput.style.borderColor = '';
        }, 3000);
      }

      if (!clientSecret) {
        clientSecretInput.style.borderColor = 'var(--error-color)';
        setTimeout(() => {
          clientSecretInput.style.borderColor = '';
        }, 3000);
      }

      return;
    }

    // Mostrar efeito de loading no botão
    const originalHTML = generateBtn.innerHTML;
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"></path>
                <path d="M12 8v4l2 2"></path>
            </svg>
            Redirecting...
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
    const scopes = Array.from(checkboxes)
      .map((cb) => cb.value)
      .join(' ');

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
                    <div class="alert-title">No scope selected</div>
                    <div class="alert-message">
                        Please select at least one scope to continue.
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

    // Salvar as credenciais temporariamente na sessão (sessionStorage é temporário para a aba)
    sessionStorage.setItem('kick_client_id', clientId);
    sessionStorage.setItem('kick_client_secret', clientSecret);

    // Redirecionar para o endpoint de autenticação com os escopos selecionados
    window.location.href = `/auth/login?scopes=${encodeURIComponent(scopes)}&clientId=${encodeURIComponent(clientId)}&clientSecret=${encodeURIComponent(clientSecret)}`;
  });

  // Recuperar credenciais da sessão se existirem (para caso de voltar na página)
  const savedClientId = sessionStorage.getItem('kick_client_id');
  const savedClientSecret = sessionStorage.getItem('kick_client_secret');

  if (savedClientId) {
    clientIdInput.value = savedClientId;
  }

  if (savedClientSecret) {
    clientSecretInput.value = savedClientSecret;
  }
});
