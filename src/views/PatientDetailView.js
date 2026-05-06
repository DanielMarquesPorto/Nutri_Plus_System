export function renderPatientDetail(user, patient, consultations = [], mealPlans = []) {
    const age = patient.data_nascimento ? calculateAge(patient.data_nascimento) : 'Não informada';
    
    return `
        <div class="dashboard-layout">
            <aside class="sidebar">
                <div class="sidebar-logo">
                    <img src="/logo.png" alt="Nutri Plus System Logo">
                    <div>Nutri Plus<span> System</span></div>
                </div>
                
                <div class="sidebar-section-title">Navegação</div>
                <nav class="nav-menu" style="flex: none; margin-bottom: 20px;">
                    <a href="#" class="nav-item" id="nav-dashboard">
                        <i class="ph-bold ph-house"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="#/pacientes" class="nav-item" id="nav-pacientes">
                        <i class="ph-bold ph-arrow-left"></i>
                        <span>Voltar a Pacientes</span>
                    </a>
                </nav>

                <div class="sidebar-section-title">Menu do Paciente</div>
                <nav class="nav-menu main-tabs-header sidebar-patient-menu" style="flex-direction: column; background: transparent; border: none; padding: 0;">
                    <button type="button" class="nav-item main-tab-btn active" data-main-tab="dados" style="width: 100%; border-bottom: none;">
                        <i class="ph-bold ph-user-circle"></i>
                        <span>Dados Pessoais</span>
                    </button>
                    <button type="button" class="nav-item main-tab-btn" data-main-tab="consultas" style="width: 100%; border-bottom: none;">
                        <i class="ph-bold ph-calendar"></i>
                        <span>Consultas</span>
                    </button>
                    <button type="button" class="nav-item main-tab-btn" data-main-tab="planos" style="width: 100%; border-bottom: none;">
                        <i class="ph-bold ph-fork-knife"></i>
                        <span>Planos Alimentares</span>
                    </button>
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
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <button id="back-to-patients" class="btn-secondary back-btn-mobile" style="display: flex; align-items: center; gap: 8px; padding: 10px 15px;">
                                <i class="ph ph-arrow-left"></i> <span>Voltar</span>
                            </button>
                            <div>
                                <h1 class="patient-name-title" style="color: var(--text-main);">${patient.nome}</h1>
                                <p class="subtitle" style="margin-bottom: 0;">${age} anos • ${patient.sexo || 'Sexo não informado'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div class="profile-tabs-container profile-section" style="border: none; box-shadow: none; background: transparent;">
                    <div class="main-tabs-content" style="padding: 0;">
                        <!-- ABA 1: DADOS DO PACIENTE -->
                        <div class="main-tab-content active" id="main-tab-dados">
                            <form id="edit-patient-form">
                                <div class="data-tabs">
                                    <button type="button" class="data-tab-btn active" data-tab="pessoal">Pessoal</button>
                                    <button type="button" class="data-tab-btn" data-tab="clinico">Clínico</button>
                                    <button type="button" class="data-tab-btn" data-tab="habitos">Hábitos</button>
                                </div>

                                <!-- Aba Pessoal -->
                                <div id="data-tab-pessoal" class="data-tab-content active">
                                    <div class="form-grid">
                                        <div class="form-group" style="grid-column: 1 / -1;">
                                            <label for="nome">Nome Completo</label>
                                            <input type="text" id="nome" name="nome" value="${patient.nome || ''}" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="data_nascimento">Data de Nascimento</label>
                                            <input type="date" id="data_nascimento" name="data_nascimento" value="${patient.data_nascimento || ''}">
                                        </div>
                                        <div class="form-group">
                                            <label for="sexo">Sexo</label>
                                            <select id="sexo" name="sexo" style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--border-color);">
                                                <option value="">Selecione</option>
                                                <option value="Feminino" ${patient.sexo === 'Feminino' ? 'selected' : ''}>Feminino</option>
                                                <option value="Masculino" ${patient.sexo === 'Masculino' ? 'selected' : ''}>Masculino</option>
                                                <option value="Outro" ${patient.sexo === 'Outro' ? 'selected' : ''}>Outro</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="telefone">Telefone</label>
                                            <input type="text" id="telefone" name="telefone" value="${patient.telefone || ''}" placeholder="(00) 00000-0000">
                                        </div>
                                        <div class="form-group">
                                            <label for="whatsapp">WhatsApp</label>
                                            <input type="text" id="whatsapp" name="whatsapp" value="${patient.whatsapp || ''}" placeholder="(00) 00000-0000">
                                        </div>
                                        <div class="form-group" style="grid-column: 1 / -1;">
                                            <label for="email">E-mail</label>
                                            <input type="email" id="email" name="email" value="${patient.email || ''}" placeholder="email@exemplo.com">
                                        </div>
                                    </div>
                                </div>

                                <!-- Aba Clínico -->
                                <div id="data-tab-clinico" class="data-tab-content">
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label for="peso_inicial">Peso inicial (kg)</label>
                                            <input type="number" id="peso_inicial" name="peso_inicial" step="0.1" value="${patient.peso_inicial || ''}">
                                        </div>
                                        <div class="form-group">
                                            <label for="altura">Altura (cm)</label>
                                            <input type="number" id="altura" name="altura" value="${patient.altura || ''}">
                                        </div>
                                        <div class="form-group" style="grid-column: 1 / -1;">
                                            <label for="nivel_atividade">Nível de atividade física</label>
                                            <select id="nivel_atividade" name="nivel_atividade" style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--border-color);">
                                                <option value="">Selecione</option>
                                                <option value="Sedentário" ${patient.nivel_atividade === 'Sedentário' ? 'selected' : ''}>Sedentário</option>
                                                <option value="Levemente ativo" ${patient.nivel_atividade === 'Levemente ativo' ? 'selected' : ''}>Levemente ativo</option>
                                                <option value="Moderadamente ativo" ${patient.nivel_atividade === 'Moderadamente ativo' ? 'selected' : ''}>Moderadamente ativo</option>
                                                <option value="Muito ativo" ${patient.nivel_atividade === 'Muito ativo' ? 'selected' : ''}>Muito ativo</option>
                                                <option value="Extremamente ativo" ${patient.nivel_atividade === 'Extremamente ativo' ? 'selected' : ''}>Extremamente ativo</option>
                                            </select>
                                        </div>
                                        
                                        <div class="form-section-title">Objetivos</div>
                                        <div class="options-grid" style="grid-column: 1 / -1;">
                                            ${['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'].map(obj => `
                                                <label class="option-item">
                                                    <input type="checkbox" name="objetivos" value="${obj}" ${patient.objetivos && patient.objetivos.includes(obj) ? 'checked' : ''}>
                                                    <span>${obj}</span>
                                                </label>
                                            `).join('')}
                                        </div>
                                        <div class="form-group" style="grid-column: 1 / -1;">
                                            <label for="objetivo_texto">Outras observações de objetivos</label>
                                            <textarea id="objetivo_texto" name="objetivo_texto" rows="2" style="width:100%; border-radius:10px; border:1px solid var(--border-color); padding:10px;">${patient.objetivo_texto || ''}</textarea>
                                        </div>

                                        <div class="form-section-title">Saúde e Condições</div>
                                        <div class="form-group" style="grid-column: 1 / -1;">
                                            <label>Patologias</label>
                                            <div class="options-grid">
                                                ${['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'SOP', 'Doença celíaca', 'Colesterol alto'].map(pat => `
                                                    <label class="option-item">
                                                        <input type="checkbox" name="patologias" value="${pat}" ${patient.patologias && patient.patologias.includes(pat) ? 'checked' : ''}>
                                                        <span>${pat}</span>
                                                    </label>
                                                `).join('')}
                                            </div>
                                        </div>
                                        <div class="form-group" style="grid-column: 1 / -1;">
                                            <label>Restrições Alimentares</label>
                                            <div class="options-grid">
                                                ${['Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar'].map(res => `
                                                    <label class="option-item">
                                                        <input type="checkbox" name="restricoes_alimentares" value="${res}" ${patient.restricoes_alimentares && patient.restricoes_alimentares.includes(res) ? 'checked' : ''}>
                                                        <span>${res}</span>
                                                    </label>
                                                `).join('')}
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label for="medicamentos">Medicamentos</label>
                                            <input type="text" id="medicamentos" name="medicamentos" value="${patient.medicamentos || ''}">
                                        </div>
                                        <div class="form-group">
                                            <label for="suplementos">Suplementos</label>
                                            <input type="text" id="suplementos" name="suplementos" value="${patient.suplementos || ''}">
                                        </div>
                                    </div>
                                </div>

                                <!-- Aba Hábitos -->
                                <div id="data-tab-habitos" class="data-tab-content">
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label for="refeicoes_por_dia">Refeições/dia</label>
                                            <input type="number" id="refeicoes_por_dia" name="refeicoes_por_dia" value="${patient.refeicoes_por_dia || ''}">
                                        </div>
                                        <div class="form-group">
                                            <label for="litros_agua">Água/dia (L)</label>
                                            <input type="number" id="litros_agua" name="litros_agua" step="0.1" value="${patient.litros_agua || ''}">
                                        </div>
                                        <div class="form-group">
                                            <label for="horario_acorda">Acorda às</label>
                                            <input type="text" id="horario_acorda" name="horario_acorda" value="${patient.horario_acorda || ''}" placeholder="00:00">
                                        </div>
                                        <div class="form-group">
                                            <label for="horario_dorme">Dorme às</label>
                                            <input type="text" id="horario_dorme" name="horario_dorme" value="${patient.horario_dorme || ''}" placeholder="00:00">
                                        </div>
                                        <div class="form-group" style="grid-column: 1 / -1;">
                                            <label for="observacoes">Observações gerais</label>
                                            <textarea id="observacoes" name="observacoes" rows="4" style="width:100%; border-radius:10px; border:1px solid var(--border-color); padding:10px;">${patient.observacoes || ''}</textarea>
                                        </div>
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: flex-end; margin-top: 30px;">
                                    <button type="submit" class="btn" style="width: auto; padding: 12px 40px;" id="save-patient-btn">
                                        <i class="ph ph-floppy-disk"></i> Salvar alterações
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- ABA 2: CONSULTAS -->
                        <div class="main-tab-content" id="main-tab-consultas">
                            <div class="profile-section-header" style="border-bottom: none; margin-bottom: 30px; padding-bottom: 0;">
                                <h2 class="profile-section-title">Histórico de Consultas</h2>
                                <button class="btn" style="width: auto;" id="new-consultation-btn">
                                    <i class="ph ph-plus"></i> Nova Consulta
                                </button>
                            </div>

                            <div class="chart-container">
                                ${consultations.length > 0 ? `
                                    <canvas id="weightChart"></canvas>
                                ` : `
                                    <div class="no-data" style="height: 100%; display: flex; align-items: center; justify-content: center;">
                                        Nenhuma consulta registrada ainda
                                    </div>
                                `}
                            </div>

                            <div class="consultation-table-container">
                                ${consultations.length > 0 ? `
                                    <table class="consultation-table">
                                        <thead>
                                            <tr>
                                                <th>Data</th>
                                                <th>Peso</th>
                                                <th>Cintura</th>
                                                <th>Quadril</th>
                                                <th>% Gordura</th>
                                                <th>Obs.</th>
                                                <th>Próximo Retorno</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${consultations.map(c => `
                                                <tr>
                                                    <td><strong>${formatDate(c.data_consulta)}</strong></td>
                                                    <td>${c.peso ? c.peso + ' kg' : '--'}</td>
                                                    <td>${c.cintura ? c.cintura + ' cm' : '--'}</td>
                                                    <td>${c.quadril ? c.quadril + ' cm' : '--'}</td>
                                                    <td>${c.percentual_gordura ? c.percentual_gordura + '%' : '--'}</td>
                                                    <td class="obs-cell" title="${c.observacoes || ''}">${c.observacoes || '--'}</td>
                                                    <td>${c.proximo_retorno ? formatDate(c.proximo_retorno) : '--'}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                ` : ''}
                            </div>
                        </div>

                        <!-- ABA 3: PLANOS ALIMENTARES -->
                        <div class="main-tab-content" id="main-tab-planos">
                            <div id="plan-list-view">
                                <div class="profile-section-header" style="border-bottom: none; margin-bottom: 30px; padding-bottom: 0;">
                                    <h2 class="profile-section-title">Planos do Paciente</h2>
                                    <button class="btn" style="width: auto; background: var(--text-main);" id="generate-plan-btn">
                                        <i class="ph ph-magic-wand"></i> Gerar Plano Alimentar
                                    </button>
                                </div>

                                <div class="meal-plan-list">
                                    ${mealPlans.length > 0 ? mealPlans.map(plan => `
                                        <div class="meal-plan-item" data-id="${plan.id}">
                                            <div style="display: flex; align-items: center; gap: 15px;">
                                                <div class="patient-avatar" style="background: var(--primary-light); color: var(--primary-color);">
                                                    <i class="ph ph-file-text"></i>
                                                </div>
                                                <div>
                                                    <div class="meal-plan-date">Plano Alimentar de ${formatDate(plan.created_at)}</div>
                                                    <div class="subtitle" style="margin: 0;">Clique para visualizar</div>
                                                </div>
                                            </div>
                                            <i class="ph ph-caret-right" style="color: var(--text-muted);"></i>
                                        </div>
                                    `).join('') : `
                                        <div class="no-data">Nenhum plano alimentar gerado ainda</div>
                                    `}
                                </div>
                            </div>

                            <div id="plan-generation-view" style="display: none;">
                                <!-- Loading state -->
                                <div id="plan-loading" style="display: none; flex-direction: column; align-items: center; justify-content: center; padding: 50px;">
                                    <div class="loader"></div>
                                    <p style="margin-top: 20px; font-weight: 600; color: var(--text-main);">Gerando plano com IA...</p>
                                    <p class="subtitle">Isso pode levar alguns segundos</p>
                                </div>

                                <!-- Editor state -->
                                <div id="plan-editor" style="display: none;">
                                    <div class="profile-section-header" style="border-bottom: none; margin-bottom: 20px; padding-bottom: 0;">
                                        <div>
                                            <h2 class="profile-section-title" id="editor-title">Plano Gerado</h2>
                                            <p class="subtitle" id="editor-subtitle" style="margin-bottom: 0;">Revise e edite as opções antes de salvar</p>
                                        </div>
                                        <div style="display: flex; gap: 12px;">
                                            <button class="btn-secondary" id="cancel-edit-btn" style="padding: 10px 20px;">
                                                <i class="ph ph-arrow-left"></i> Voltar
                                            </button>
                                            <button class="btn" id="save-generated-plan-btn" style="width: auto; padding: 10px 25px;">
                                                <i class="ph ph-floppy-disk"></i> Salvar Plano
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div id="days-tabs" class="data-tabs" style="overflow-x: auto; white-space: nowrap; padding-bottom: 5px; width: 100%; display: flex;">
                                        <!-- Tabs para dias da semana serão injetadas via JS -->
                                    </div>

                                    <div id="meals-container" class="meals-grid">
                                        <!-- Cards de refeições serão injetadas via JS -->
                                    </div>
                                    <div id="meals-controls">
                                        <!-- Controles do carrossel serão injetados aqui -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- MODAL: NOVA CONSULTA -->
        <div class="modal-overlay" id="modal-consultation">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 style="margin: 0;">Nova Consulta</h2>
                    <button class="modal-close" id="close-modal-btn">&times;</button>
                </div>
                <form id="new-consultation-form">
                    <input type="hidden" name="paciente_id" value="${patient.id}">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="c_data">Data da Consulta *</label>
                            <input type="date" id="c_data" name="data_consulta" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label for="c_peso">Peso atual (kg) *</label>
                            <input type="number" id="c_peso" name="peso" step="0.1" required placeholder="0.0">
                        </div>
                        <div class="form-group">
                            <label for="c_cintura">Cintura (cm)</label>
                            <input type="number" id="c_cintura" name="cintura" step="0.1" placeholder="0.0">
                        </div>
                        <div class="form-group">
                            <label for="c_quadril">Quadril (cm)</label>
                            <input type="number" id="c_quadril" name="quadril" step="0.1" placeholder="0.0">
                        </div>
                        <div class="form-group">
                            <label for="c_gordura">% de Gordura</label>
                            <input type="number" id="c_gordura" name="percentual_gordura" step="0.1" placeholder="0.0">
                        </div>
                        <div class="form-group">
                            <label for="c_retorno">Próximo Retorno</label>
                            <input type="date" id="c_retorno" name="proximo_retorno">
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label for="c_obs">Observações</label>
                            <textarea id="c_obs" name="observacoes" rows="3" style="width:100%; border-radius:10px; border:1px solid var(--border-color); padding:10px;"></textarea>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 30px; gap: 15px;">
                        <button type="button" class="btn-secondary" id="cancel-modal-btn">Cancelar</button>
                        <button type="submit" class="btn" style="width: auto; padding: 12px 40px;">Salvar consulta</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- TOAST DE SUCESSO -->
        <div class="save-success-toast" id="success-toast">
            <i class="ph ph-check-circle"></i>
            <span>Alterações salvas com sucesso!</span>
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

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
}
