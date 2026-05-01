export function renderDashboard(user) {
    const name = user.user_metadata?.full_name || user.email;
    
    return `
        <div class="dashboard-layout">
            <aside class="sidebar">
                <div class="sidebar-logo">
                    <img src="/logo.png" alt="Nutri Plus System Logo">
                    <div>Nutri Plus<span> System</span></div>
                </div>
                <nav class="nav-menu">
                    <a href="#" class="nav-item active" id="nav-dashboard">
                        <i class="ph-bold ph-house"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="#/pacientes" class="nav-item" id="nav-pacientes">
                        <i class="ph-bold ph-users"></i>
                        <span>Pacientes</span>
                    </a>
                </nav>
                <div class="sidebar-footer">
                    <button id="logout-btn" class="btn-secondary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <i class="ph-bold ph-sign-out"></i>
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            <main class="main-content">
                <header class="welcome-header">
                    <h1>Olá, ${name}</h1>
                    <p class="subtitle">Bem-vindo(a) de volta ao seu painel nutricional.</p>
                </header>

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-title">Total de pacientes</span>
                        <div class="stat-value" id="total-pacientes">--</div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-title">Consultas da semana</span>
                        <div class="stat-value" id="consultas-semana">--</div>
                    </div>
                </div>

                <div class="large-card">
                    <div class="card-header">
                        <h2 class="card-title">Pacientes sem retorno</h2>
                    </div>
                    <div id="pacientes-sem-retorno" class="patient-list">
                        <div class="no-data">Carregando pacientes...</div>
                    </div>
                </div>
            </main>
        </div>
    `;
}

