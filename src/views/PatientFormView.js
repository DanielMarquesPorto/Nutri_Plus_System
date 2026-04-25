export function renderPatientForm(user) {
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
            </aside>

            <main class="main-content">
                <header class="welcome-header">
                    <h1>Novo Paciente</h1>
                    <p class="subtitle">Preencha as informações para cadastrar um novo paciente.</p>
                </header>

                <form id="patient-form">
                    <div class="tabs-container">
                        <div class="tabs-header">
                            <button type="button" class="tab-btn active" data-tab="pessoal">Pessoal</button>
                            <button type="button" class="tab-btn" data-tab="clinico">Clínico</button>
                            <button type="button" class="tab-btn" data-tab="habitos">Hábitos</button>
                        </div>

                        <!-- Aba Pessoal -->
                        <div id="tab-pessoal" class="tab-content active">
                            <div class="form-grid">
                                <div class="form-group" style="grid-column: 1 / -1;">
                                    <label for="nome">Nome Completo *</label>
                                    <input type="text" id="nome" name="nome" required placeholder="Ex: Maria Oliveira">
                                </div>
                                <div class="form-group">
                                    <label for="data_nascimento">Data de Nascimento <span id="idade-feedback" class="calc-badge" style="display:none"></span></label>
                                    <input type="date" id="data_nascimento" name="data_nascimento">
                                </div>
                                <div class="form-group">
                                    <label for="sexo">Sexo</label>
                                    <select id="sexo" name="sexo" class="btn-secondary" style="width: 100%; text-align: left; background: white;">
                                        <option value="">Selecione</option>
                                        <option value="Feminino">Feminino</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="telefone">Telefone</label>
                                    <input type="text" id="telefone" name="telefone" placeholder="(00) 00000-0000">
                                </div>
                                <div class="form-group">
                                    <label for="whatsapp">WhatsApp</label>
                                    <input type="text" id="whatsapp" name="whatsapp" placeholder="(00) 00000-0000">
                                </div>
                                <div class="form-group" style="grid-column: 1 / -1;">
                                    <label for="email">E-mail</label>
                                    <input type="email" id="email" name="email" placeholder="email@exemplo.com">
                                </div>
                            </div>
                        </div>

                        <!-- Aba Clínico -->
                        <div id="tab-clinico" class="tab-content">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="peso_inicial">Peso atual (kg)</label>
                                    <input type="number" id="peso_inicial" name="peso_inicial" step="0.1" placeholder="0.0">
                                </div>
                                <div class="form-group">
                                    <label for="altura">Altura (cm)</label>
                                    <input type="number" id="altura" name="altura" placeholder="0">
                                </div>
                                <div class="form-group">
                                    <label>IMC <span id="imc-feedback" class="calc-badge" style="display:none"></span></label>
                                    <input type="text" id="imc-display" readonly placeholder="Calculado automaticamente" style="background: #f1f5f9;">
                                    <div id="imc-desc" class="imc-indicator"></div>
                                </div>

                                <div class="form-section-title">Objetivos</div>
                                <div class="options-grid" style="grid-column: 1 / -1;">
                                    ${['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'].map(obj => `
                                        <label class="option-item">
                                            <input type="checkbox" name="objetivos" value="${obj}">
                                            <span>${obj}</span>
                                        </label>
                                    `).join('')}
                                </div>
                                <div class="form-group" style="grid-column: 1 / -1;">
                                    <label for="objetivo_texto">Outros objetivos / Observações</label>
                                    <textarea id="objetivo_texto" name="objetivo_texto" rows="2" style="width:100%; border-radius:10px; border:1px solid var(--border-color); padding:10px;"></textarea>
                                </div>

                                <div class="form-group" style="grid-column: 1 / -1;">
                                    <label for="nivel_atividade">Nível de atividade física</label>
                                    <select id="nivel_atividade" name="nivel_atividade" style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--border-color);">
                                        <option value="">Selecione</option>
                                        <option value="Sedentário">Sedentário</option>
                                        <option value="Levemente ativo">Levemente ativo</option>
                                        <option value="Moderadamente ativo">Moderadamente ativo</option>
                                        <option value="Muito ativo">Muito ativo</option>
                                        <option value="Extremamente ativo">Extremamente ativo</option>
                                    </select>
                                </div>

                                <div class="form-section-title">Saúde e Condições</div>
                                <div class="form-group" style="grid-column: 1 / -1;">
                                    <label>Patologias ou condições</label>
                                    <div class="options-grid">
                                        <label class="option-item">
                                            <input type="checkbox" name="patologias" value="Nenhum" class="none-option">
                                            <span>Nenhum</span>
                                        </label>
                                        ${['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'SOP', 'Doença celíaca', 'Colesterol alto'].map(pat => `
                                            <label class="option-item">
                                                <input type="checkbox" name="patologias" value="${pat}">
                                                <span>${pat}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                    <input type="text" name="patologias_extra" placeholder="Outras patologias..." style="margin-top: 10px;">
                                </div>

                                <div class="form-group" style="grid-column: 1 / -1;">
                                    <label>Restrições alimentares</label>
                                    <div class="options-grid">
                                        <label class="option-item">
                                            <input type="checkbox" name="restricoes" value="Nenhum" class="none-option">
                                            <span>Nenhum</span>
                                        </label>
                                        ${['Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar'].map(res => `
                                            <label class="option-item">
                                                <input type="checkbox" name="restricoes" value="${res}">
                                                <span>${res}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                    <input type="text" name="restricoes_extra" placeholder="Outras restrições..." style="margin-top: 10px;">
                                </div>

                                <div class="form-group" style="grid-column: 1 / -1;">
                                    <label>Alergias alimentares</label>
                                    <div class="options-grid">
                                        <label class="option-item">
                                            <input type="checkbox" name="alergias" value="Nenhum" class="none-option">
                                            <span>Nenhum</span>
                                        </label>
                                        ${['Amendoim', 'Leite', 'Ovo', 'Soja', 'Trigo', 'Frutos do mar'].map(ale => `
                                            <label class="option-item">
                                                <input type="checkbox" name="alergias" value="${ale}">
                                                <span>${ale}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                    <input type="text" name="alergias_extra" placeholder="Outras alergias..." style="margin-top: 10px;">
                                </div>

                                <div class="form-group">
                                    <label for="medicamentos">Medicamentos contínuos</label>
                                    <input type="text" id="medicamentos" name="medicamentos" placeholder="Nome dos medicamentos">
                                </div>
                                <div class="form-group">
                                    <label for="suplementos">Suplementos em uso</label>
                                    <input type="text" id="suplementos" name="suplementos" placeholder="Nome dos suplementos">
                                </div>
                            </div>
                        </div>

                        <!-- Aba Hábitos -->
                        <div id="tab-habitos" class="tab-content">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="refeicoes_por_dia">Refeições por dia</label>
                                    <input type="number" id="refeicoes_por_dia" name="refeicoes_por_dia" placeholder="Ex: 5">
                                </div>
                                <div class="form-group">
                                    <label for="litros_agua">Água por dia (litros)</label>
                                    <input type="number" id="litros_agua" name="litros_agua" step="0.1" placeholder="Ex: 2.5">
                                </div>
                                <div class="form-group">
                                    <label for="horario_acorda">Horário que acorda <span class="calc-badge time-preview" id="preview-acorda"></span></label>
                                    <input type="number" id="horario_acorda" name="horario_acorda" placeholder="Ex: 6 ou 630">
                                </div>
                                <div class="form-group">
                                    <label for="horario_dorme">Horário que dorme <span class="calc-badge time-preview" id="preview-dorme"></span></label>
                                    <input type="number" id="horario_dorme" name="horario_dorme" placeholder="Ex: 23 ou 2230">
                                </div>
                                <div class="form-group" style="grid-column: 1 / -1;">
                                    <label>Pratica atividade física?</label>
                                    <div style="display:flex; gap:20px; margin-top:10px;">
                                        <label style="display:flex; align-items:center; gap:8px;">
                                            <input type="radio" name="atividade_fisica" value="true"> Sim
                                        </label>
                                        <label style="display:flex; align-items:center; gap:8px;">
                                            <input type="radio" name="atividade_fisica" value="false" checked> Não
                                        </label>
                                    </div>
                                </div>
                                <div id="atividade-desc-container" class="form-group" style="grid-column: 1 / -1; display:none;">
                                    <label for="atividade_fisica_descricao">Qual atividade e frequência?</label>
                                    <input type="text" id="atividade_fisica_descricao" name="atividade_fisica_descricao">
                                </div>
                                <div class="form-group" style="grid-column: 1 / -1;">
                                    <label for="observacoes">Observações gerais</label>
                                    <textarea id="observacoes" name="observacoes" rows="4" style="width:100%; border-radius:10px; border:1px solid var(--border-color); padding:10px;"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancel-form">Cancelar</button>
                        <button type="submit" class="btn" style="width: auto; padding: 12px 40px;">Salvar Paciente</button>
                    </div>
                </form>
            </main>
        </div>
    `;
}
