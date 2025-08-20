document.getElementById('generateBtn').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const scopes = Array.from(checkboxes).map(cb => cb.value).join(' ');
    
    if (!scopes) {
        alert('Selecione pelo menos um scope!');
        return;
    }
    
    // Redireciona para o endpoint de login
    window.location.href = `/auth/login?scopes=${encodeURIComponent(scopes)}`;
});