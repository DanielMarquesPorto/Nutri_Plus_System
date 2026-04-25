export function renderAuth(mode = 'login', message = null) {
    const isLogin = mode === 'login';
    
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="logo">
                    <img src="/logo.png" alt="Nutri Plus System Logo">
                    <div>Nutri Plus<span> System</span></div>
                </div>
                
                <h2>${isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
                <p class="subtitle">${isLogin ? 'Acesse sua conta para gerenciar seus pacientes' : 'Comece a transformar a vida de seus pacientes hoje'}</p>

                ${message ? `<div class="message ${message.type}">${message.text}</div>` : ''}

                <form id="auth-form">
                    ${!isLogin ? `
                        <div class="form-group">
                            <label for="nome">Nome Completo</label>
                            <input type="text" id="nome" name="nome" placeholder="Seu nome" required autocomplete="name">
                        </div>
                    ` : ''}

                    <div class="form-group">
                        <label for="email">E-mail</label>
                        <input type="email" id="email" name="email" placeholder="seu@email.com" required autocomplete="email">
                    </div>

                    <div class="form-group">
                        <label for="password">Senha</label>
                        <div class="password-wrapper">
                            <input type="password" id="password" name="password" placeholder="••••••••" required minlength="6" autocomplete="${isLogin ? 'current-password' : 'new-password'}">
                            <div class="password-mask"></div>
                        </div>
                    </div>

                    ${!isLogin ? `
                        <div class="form-group">
                            <label for="confirm-password">Confirmar Senha</label>
                            <div class="password-wrapper">
                                <input type="password" id="confirm-password" name="confirm-password" placeholder="••••••••" required minlength="6" autocomplete="new-password">
                                <div class="password-mask"></div>
                            </div>
                        </div>
                    ` : ''}

                    <button type="submit" class="btn" id="submit-btn">
                        ${isLogin ? 'Entrar' : 'Criar conta'}
                    </button>
                </form>

                <div class="footer-link">
                    ${isLogin 
                        ? 'Não tem uma conta? <a href="#" id="switch-to-signup">Cadastre-se</a>' 
                        : 'Já possui uma conta? <a href="#" id="switch-to-login">Faça login</a>'}
                </div>
            </div>
        </div>
    `;
}
