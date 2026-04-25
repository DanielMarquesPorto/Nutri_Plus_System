export function renderPatientDetail(user, patient, consultations = []) {
    const age = patient.data_nascimento ? calculateAge(patient.data_nascimento) : 'Não informada';
    
    return `
        <div class="dashboard-layout">
            <aside class="sidebar">
                <div class="sidebar-logo">
                    <img src="/logo.png" alt="Nutri Plus System Logo">
                    <div>Nutri Plus<span> System</span></div>
                </div>
                <nav class="nav-menu">
                    <a href="#" class="nav-item" id="nav-dashboard">
                        <i class="ph ph-house"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="#" class="nav-item active" id="nav-pacientes">
                        <i class="ph ph-users"></i>
                        <span>Pacientes</span>
                    </a>
                </nav>
                <div class="sidebar-footer">
                    <button id="logout-btn" class="btn-secondary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="ph ph-sign-out"></i>
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            <main class="main-content">
                <header class="card-header" style="background: transparent; box-shadow: none; padding: 0; margin-bottom: 30px;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <button id="back-to-patients" class="btn-secondary" style="display: flex; align-items: center; gap: 8px; padding: 10px 15px;">
                            <i class="ph ph-arrow-left"></i> Voltar
                        </button>
                        <div>
                            <h1 style="font-size: 1.875rem; color: var(--text-main);">${patient.nome}</h1>
                            <p class="subtitle" style="margin-bottom: 0;">${age} anos • ${patient.sexo || 'Sexo não informado'}</p>
                        </div>
                    </div>
                </header>

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-title">Objetivo Principal</span>
                        <span class="stat-value" style="font-size: 1.25rem;">${patient.objetivo_texto || (patient.objetivos && patient.objetivos.length > 0 ? patient.objetivos[0] : 'Não definido')}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-title">Peso Inicial</span>
                        <span class="stat-value">${patient.peso_inicial ? patient.peso_inicial + ' kg' : '--'}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-title">Altura</span>
                        <span class="stat-value">${patient.altura ? patient.altura + ' cm' : '--'}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-title">Consultas</span>
                        <span class="stat-value">${consultations.length}</span>
                    </div>
                </div>

                <div class="tabs-container" style="margin-bottom: 40px;">
                    <div class="tabs-header">
                        <button type="button" class="tab-btn active" data-tab="resumo">Resumo do Paciente</button>
                        <button type="button" class="tab-btn" data-tab="historico">Histórico de Consultas</button>
                    </div>

                    <!-- Aba Resumo -->
                    <div id="tab-resumo" class="tab-content active">
                        <div class="form-grid">
                            <div class="detail-section">
                                <h3 class="form-section-title">Informações de Contato</h3>
                                <div class="info-list" style="margin-top: 15px; display: grid; gap: 10px;">
                                    <div class="info-item"><i class="ph ph-phone"></i> <strong>Telefone:</strong> ${patient.telefone || 'N/A'}</div>
                                    <div class="info-item"><i class="ph ph-whatsapp-logo"></i> <strong>WhatsApp:</strong> ${patient.whatsapp || 'N/A'}</div>
                                    <div class="info-item"><i class="ph ph-envelope"></i> <strong>E-mail:</strong> ${patient.email || 'N/A'}</div>
                                </div>
                            </div>

                            <div class="detail-section">
                                <h3 class="form-section-title">Dados Clínicos</h3>
                                <div class="info-list" style="margin-top: 15px; display: grid; gap: 10px;">
                                    <div class="info-item"><strong>Nível de atividade:</strong> ${patient.nivel_atividade || 'Não informado'}</div>
                                    <div class="info-item"><strong>Patologias:</strong> ${patient.patologias ? patient.patologias.join(', ') : 'Nenhuma'}</div>
                                    <div class="info-item"><strong>Alergias:</strong> ${patient.alergias ? patient.alergias.join(', ') : 'Nenhuma'}</div>
                                    <div class="info-item"><strong>Restrições:</strong> ${patient.restricoes_alimentares ? patient.restricoes_alimentares.join(', ') : 'Nenhuma'}</div>
                                </div>
                            </div>

                            <div class="detail-section" style="grid-column: 1 / -1;">
                                <h3 class="form-section-title">Hábitos e Estilo de Vida</h3>
                                <div class="options-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                                    <div class="option-item" style="cursor: default">
                                        <i class="ph ph-fork-knife"></i>
                                        <span>${patient.refeicoes_por_dia || '--'} refeições/dia</span>
                                    </div>
                                    <div class="option-item" style="cursor: default">
                                        <i class="ph ph-drop"></i>
                                        <span>${patient.litros_agua || '--'}L de água/dia</span>
                                    </div>
                                    <div class="option-item" style="cursor: default">
                                        <i class="ph ph-sun"></i>
                                        <span>Acorda às ${patient.horario_acorda || '--'}</span>
                                    </div>
                                    <div class="option-item" style="cursor: default">
                                        <i class="ph ph-moon"></i>
                                        <span>Dorme às ${patient.horario_dorme || '--'}</span>
                                    </div>
                                </div>
                            </div>

                            ${patient.observacoes ? `
                                <div class="detail-section" style="grid-column: 1 / -1;">
                                    <h3 class="form-section-title">Observações</h3>
                                    <p style="margin-top: 15px; background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid var(--border-color);">${patient.observacoes}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Aba Histórico de Consultas -->
                    <div id="tab-historico" class="tab-content">
                        ${consultations.length === 0 ? `
                            <div class="no-data">Nenhuma consulta registrada para este paciente.</div>
                        ` : `
                            <div style="overflow-x: auto;">
                                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                                    <thead>
                                        <tr style="text-align: left; background: #f8fafc; border-bottom: 2px solid var(--border-color);">
                                            <th style="padding: 15px;">Data</th>
                                            <th style="padding: 15px;">Peso (kg)</th>
                                            <th style="padding: 15px;">Cintura (cm)</th>
                                            <th style="padding: 15px;">Quadril (cm)</th>
                                            <th style="padding: 15px;">% Gordura</th>
                                            <th style="padding: 15px;">Próximo Retorno</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${consultations.map(c => `
                                            <tr style="border-bottom: 1px solid var(--border-color);">
                                                <td style="padding: 15px;">${new Date(c.data_consulta).toLocaleDateString()}</td>
                                                <td style="padding: 15px;">${c.peso || '--'}</td>
                                                <td style="padding: 15px;">${c.cintura || '--'}</td>
                                                <td style="padding: 15px;">${c.quadril || '--'}</td>
                                                <td style="padding: 15px;">${c.percentual_gordura ? c.percentual_gordura + '%' : '--'}</td>
                                                <td style="padding: 15px;">${c.proximo_retorno ? new Date(c.proximo_retorno).toLocaleDateString() : '--'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                </div>
            </main>
        </div>
    `;
}

function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}
