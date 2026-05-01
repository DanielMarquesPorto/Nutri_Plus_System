export function renderPatientsList(user, patients = []) {
    return `
        <div class="dashboard-layout">
            <aside class="sidebar">
                <div class="sidebar-logo">
                    <img src="/logo.png" alt="Nutri Plus System Logo">
                    <div>Nutri Plus<span> System</span></div>
                </div>
                <nav class="nav-menu">
                    <a href="#" class="nav-item" id="nav-dashboard">
                        <i class="ph-bold ph-house"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="#/pacientes" class="nav-item active" id="nav-pacientes">
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
                <header class="card-header" style="background: transparent; box-shadow: none; padding: 0; margin-bottom: 30px;">
                    <div>
                        <h1 style="font-size: 1.875rem; color: var(--text-main);">Pacientes</h1>
                        <p class="subtitle" style="margin-bottom: 0;">Gerencie sua lista de pacientes cadastrados.</p>
                    </div>
                    <button id="new-patient-btn" class="btn" style="width: auto; padding: 12px 24px;">
                        <i class="ph ph-plus"></i> Novo Paciente
                    </button>
                </header>

                <div class="search-bar">
                    <i class="ph ph-magnifying-glass"></i>
                    <input type="text" id="patient-search" placeholder="Buscar paciente por nome...">
                </div>

                <div id="patients-grid" class="patients-grid">
                    ${patients.length === 0 
                        ? '<div class="no-data" style="grid-column: 1/-1;">Nenhum paciente cadastrado ainda.</div>' 
                        : patients.map(p => renderPatientCard(p)).join('')}
                </div>
            </main>
        </div>
    `;
}

function renderPatientCard(patient) {
    const lastConsultation = patient.consultas && patient.consultas.length > 0 
        ? new Date(patient.consultas[0].data_consulta).toLocaleDateString() 
        : 'Nenhuma consulta';

    return `
        <a href="#/paciente/${patient.id}" class="patient-card" data-id="${patient.id}">
            <h3>${patient.nome}</h3>
            <div class="patient-info">
                <div class="info-item">
                    <i class="ph ph-target"></i>
                    <span>${patient.objetivo_texto || (patient.objetivos ? patient.objetivos.join(', ') : 'Não definido')}</span>
                </div>
                <div class="info-item">
                    <i class="ph ph-calendar"></i>
                    <span>Última consulta: ${lastConsultation}</span>
                </div>
            </div>
        </a>
    `;
}

export function updatePatientsGrid(patients) {
    const grid = document.getElementById('patients-grid');
    if (grid) {
        grid.innerHTML = patients.length === 0 
            ? '<div class="no-data" style="grid-column: 1/-1;">Nenhum paciente encontrado.</div>' 
            : patients.map(p => renderPatientCard(p)).join('');
    }
}
