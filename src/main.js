import { onAuthChange, signInNutricionista, signUpNutricionista, signOut, getSession } from './auth';
import { renderAuth } from './views/AuthView';
import { renderDashboard } from './views/DashboardView';
import { renderPatientsList, updatePatientsGrid } from './views/PatientsListView';
import { renderPatientForm } from './views/PatientFormView';
import { renderPatientDetail } from './views/PatientDetailView';
import { supabase } from './lib/supabase';
import Chart from 'chart.js/auto';

const app = document.getElementById('app');
let currentMode = 'login';

/**
 * Renderiza a visualização atual
 */
async function router(session) {
    if (session) {
        const hash = window.location.hash;
        
        if (hash === '#/pacientes') {
            renderPatientsListView(session.user);
        } else if (hash === '#/novo-paciente') {
            renderPatientFormView(session.user);
        } else if (hash.startsWith('#/paciente/')) {
            const id = hash.split('/')[2];
            renderPatientDetailView(session.user, id);
        } else {
            renderDashboardView(session.user);
        }
    } else {
        renderAuthView(currentMode);
    }
}

/**
 * Views
 */
function renderAuthView(mode, message = null) {
    document.body.className = 'auth-page';
    app.innerHTML = renderAuth(mode, message);
    setupAuthListeners(mode);
}

function renderDashboardView(user) {
    document.body.className = 'dashboard-page';
    app.innerHTML = renderDashboard(user);
    setupDashboardListeners();
    loadDashboardData(user);
}

async function renderPatientsListView(user) {
    document.body.className = 'dashboard-page';
    const { data: patients } = await supabase.from('pacientes').select('*, consultas(data_consulta)').eq('nutricionista_id', user.id);
    app.innerHTML = renderPatientsList(user, patients || []);
    setupPatientsListListeners(user, patients || []);
}

function renderPatientFormView(user) {
    document.body.className = 'dashboard-page';
    app.innerHTML = renderPatientForm(user);
    setupPatientFormListeners(user);
}

async function renderPatientDetailView(user, patientId) {
    document.body.className = 'dashboard-page';
    try {
        const { data: patient, error: pError } = await supabase.from('pacientes').select('*').eq('id', patientId).single();
        if (pError) throw pError;
        
        const { data: consultations, error: cError } = await supabase.from('consultas').select('*').eq('paciente_id', patientId).order('data_consulta', { ascending: false });
        if (cError) throw cError;

        const { data: mealPlans, error: mError } = await supabase.from('planos_alimentares').select('*').eq('paciente_id', patientId).order('created_at', { ascending: false });
        
        app.innerHTML = renderPatientDetail(user, patient, consultations || [], mealPlans || []);
        setupPatientDetailListeners(user, patient, consultations || []);
    } catch (error) {
        console.error(error);
        window.location.hash = '#/pacientes';
    }
}

/**
 * Data Loading
 */
async function loadDashboardData(user) {
    try {
        const userId = user.id;

        // Total pacientes
        const { count: totalPacientes } = await supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('nutricionista_id', userId);
        const elTotal = document.getElementById('total-pacientes');
        if (elTotal) elTotal.innerText = totalPacientes || 0;

        // Consultas semana
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const { count: totalConsultas } = await supabase.from('consultas').select('id, paciente!inner(nutricionista_id)', { count: 'exact', head: true })
            .eq('paciente.nutricionista_id', userId)
            .gte('data_consulta', startOfWeek.toISOString().split('T')[0])
            .lte('data_consulta', endOfWeek.toISOString().split('T')[0]);
        const elSemana = document.getElementById('consultas-semana');
        if (elSemana) elSemana.innerText = totalConsultas || 0;

        // Sem retorno
        const { data: pacientes } = await supabase.from('pacientes').select(`id, nome, consultas (data_consulta, proximo_retorno)`).eq('nutricionista_id', userId);
        const containerSemRetorno = document.getElementById('pacientes-sem-retorno');
        if (containerSemRetorno && pacientes) {
            const trintaDiasAtrasStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const hojeStr = new Date().toISOString().split('T')[0];

            const semRetorno = pacientes.filter(p => {
                if (!p.consultas || p.consultas.length === 0) return false;
                const ultima = [...p.consultas].sort((a, b) => new Date(b.data_consulta) - new Date(a.data_consulta))[0];
                return ultima.data_consulta < trintaDiasAtrasStr && (!ultima.proximo_retorno || ultima.proximo_retorno < hojeStr);
            });

            if (semRetorno.length === 0) {
                containerSemRetorno.innerHTML = '<div class="no-data">Nenhum paciente sem retorno</div>';
            } else {
                containerSemRetorno.innerHTML = semRetorno.map(p => `
                    <a href="#/paciente/${p.id}" class="patient-item">
                        <div class="patient-avatar">${p.nome.charAt(0).toUpperCase()}</div>
                        <span>${p.nome}</span>
                    </a>
                `).join('');
            }
        }
    } catch (e) { console.error(e); }
}

/**
 * Event Listeners
 */
function setupAuthListeners(mode) {
    const form = document.getElementById('auth-form');
    if (document.getElementById('switch-to-signup')) document.getElementById('switch-to-signup').onclick = (e) => { e.preventDefault(); currentMode = 'signup'; renderAuthView('signup'); };
    if (document.getElementById('switch-to-login')) document.getElementById('switch-to-login').onclick = (e) => { e.preventDefault(); currentMode = 'login'; renderAuthView('login'); };

    document.querySelectorAll('input[type="password"]').forEach(input => {
        const mask = input.nextElementSibling;
        if (mask && mask.classList.contains('password-mask')) {
            // Inicializa a máscara se o input já tiver valor (ex: autocompletar do navegador)
            mask.innerText = '🍌'.repeat(input.value.length);
            
            input.addEventListener('input', () => {
                mask.innerText = '🍌'.repeat(input.value.length);
            });
        }
    });

    if (form) form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        try {
            if (mode === 'login') {
                await signInNutricionista(formData.get('email'), formData.get('password'));
            } else {
                if (formData.get('password') !== formData.get('confirm-password')) throw new Error('Senhas não coincidem');
                await signUpNutricionista(formData.get('email'), formData.get('password'), formData.get('nome'));
                renderAuthView('login', { type: 'success', text: 'Conta criada!' });
            }
        } catch (err) { renderAuthView(mode, { type: 'error', text: err.message }); }
        finally { submitBtn.disabled = false; }
    };
}

function setupDashboardListeners() {
    if (document.getElementById('logout-btn')) document.getElementById('logout-btn').onclick = async () => { await signOut(); };
    if (document.getElementById('nav-dashboard')) document.getElementById('nav-dashboard').onclick = (e) => { e.preventDefault(); window.location.hash = '#/'; };
    if (document.getElementById('nav-pacientes')) document.getElementById('nav-pacientes').onclick = (e) => { e.preventDefault(); window.location.hash = '#/pacientes'; };
}

function setupPatientsListListeners(user, allPatients) {
    setupDashboardListeners();
    const search = document.getElementById('patient-search');
    if (search) search.oninput = (e) => updatePatientsGrid(allPatients.filter(p => p.nome.toLowerCase().includes(e.target.value.toLowerCase())));
    if (document.getElementById('new-patient-btn')) document.getElementById('new-patient-btn').onclick = () => { window.location.hash = '#/novo-paciente'; };
}

function setupPatientFormListeners(user) {
    setupDashboardListeners();
    document.querySelectorAll('.tab-btn').forEach(btn => btn.onclick = () => {
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });

    const form = document.getElementById('patient-form');
    if (form) form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const patientData = {
            nutricionista_id: user.id,
            nome: formData.get('nome'),
            data_nascimento: formData.get('data_nascimento') || null,
            sexo: formData.get('sexo'),
            telefone: formData.get('telefone'),
            whatsapp: formData.get('whatsapp'),
            email: formData.get('email'),
            peso_inicial: parseFloat(formData.get('peso_inicial')) || null,
            altura: parseFloat(formData.get('altura')) || null,
            objetivos: Array.from(form.querySelectorAll('input[name="objetivos"]:checked')).map(i => i.value),
            objetivo_texto: formData.get('objetivo_texto'),
            nivel_atividade: formData.get('nivel_atividade'),
            patologias: Array.from(form.querySelectorAll('input[name="patologias"]:checked')).map(i => i.value),
            restricoes_alimentares: Array.from(form.querySelectorAll('input[name="restricoes"]:checked')).map(i => i.value),
            alergias: Array.from(form.querySelectorAll('input[name="alergias"]:checked')).map(i => i.value),
            medicamentos: formData.get('medicamentos'),
            suplementos: formData.get('suplementos'),
            refeicoes_por_dia: parseInt(formData.get('refeicoes_por_dia')) || null,
            litros_agua: parseFloat(formData.get('litros_agua')) || null,
            horario_acorda: formData.get('horario_acorda'),
            horario_dorme: formData.get('horario_dorme'),
            atividade_fisica: formData.get('atividade_fisica') === 'true',
            atividade_fisica_descricao: formData.get('atividade_fisica_descricao'),
            observacoes: formData.get('observacoes')
        };
        const { data, error } = await supabase.from('pacientes').insert([patientData]).select();
        if (!error) window.location.hash = `#/paciente/${data[0].id}`;
    };
    if (document.getElementById('cancel-form')) document.getElementById('cancel-form').onclick = () => window.location.hash = '#/pacientes';
}

function setupPatientDetailListeners(user, patient, consultations) {
    setupDashboardListeners();

    // Main Tabs (Dados, Consultas, Planos)
    document.querySelectorAll('.main-tab-btn').forEach(btn => btn.onclick = () => {
        document.querySelectorAll('.main-tab-btn, .main-tab-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('main-tab-' + btn.dataset.mainTab).classList.add('active');
        
        // Re-init chart if switching to consultas tab
        if (btn.dataset.mainTab === 'consultas' && consultations.length > 0) {
            // Need a slight delay to ensure canvas is visible for Chart.js
            setTimeout(() => initWeightChart(consultations), 10);
        }
    });

    // Sub-Tabs (Dentro de Dados: Pessoal, Clínico, Hábitos)
    document.querySelectorAll('.data-tab-btn').forEach(btn => btn.onclick = () => {
        document.querySelectorAll('.data-tab-btn, .data-tab-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('data-tab-' + btn.dataset.tab).classList.add('active');
    });

    // Edits
    const editForm = document.getElementById('edit-patient-form');
    if (editForm) editForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const updateData = {
            nome: formData.get('nome'),
            data_nascimento: formData.get('data_nascimento') || null,
            sexo: formData.get('sexo'),
            telefone: formData.get('telefone'),
            whatsapp: formData.get('whatsapp'),
            email: formData.get('email'),
            peso_inicial: parseFloat(formData.get('peso_inicial')) || null,
            altura: parseFloat(formData.get('altura')) || null,
            nivel_atividade: formData.get('nivel_atividade'),
            objetivos: Array.from(editForm.querySelectorAll('input[name="objetivos"]:checked')).map(i => i.value),
            objetivo_texto: formData.get('objetivo_texto'),
            patologias: Array.from(editForm.querySelectorAll('input[name="patologias"]:checked')).map(i => i.value),
            restricoes_alimentares: Array.from(editForm.querySelectorAll('input[name="restricoes_alimentares"]:checked')).map(i => i.value),
            medicamentos: formData.get('medicamentos'),
            suplementos: formData.get('suplementos'),
            refeicoes_por_dia: parseInt(formData.get('refeicoes_por_dia')) || null,
            litros_agua: parseFloat(formData.get('litros_agua')) || null,
            horario_acorda: formData.get('horario_acorda'),
            horario_dorme: formData.get('horario_dorme'),
            observacoes: formData.get('observacoes')
        };
        const { error } = await supabase.from('pacientes').update(updateData).eq('id', patient.id);
        if (!error) showToast();
    };

    // Modal
    const modal = document.getElementById('modal-consultation');
    if (document.getElementById('new-consultation-btn')) document.getElementById('new-consultation-btn').onclick = () => modal.classList.add('active');
    if (document.getElementById('close-modal-btn')) document.getElementById('close-modal-btn').onclick = () => modal.classList.remove('active');
    if (document.getElementById('cancel-modal-btn')) document.getElementById('cancel-modal-btn').onclick = () => modal.classList.remove('active');

    const consultationForm = document.getElementById('new-consultation-form');
    if (consultationForm) consultationForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(consultationForm);
        const { error } = await supabase.from('consultas').insert([{
            paciente_id: patient.id,
            data_consulta: formData.get('data_consulta'),
            peso: parseFloat(formData.get('peso')),
            cintura: parseFloat(formData.get('cintura')) || null,
            quadril: parseFloat(formData.get('quadril')) || null,
            percentual_gordura: parseFloat(formData.get('percentual_gordura')) || null,
            observacoes: formData.get('observacoes'),
            proximo_retorno: formData.get('proximo_retorno') || null
        }]);
        if (!error) { modal.classList.remove('active'); renderPatientDetailView(user, patient.id); }
    };

    if (consultations.length > 0) initWeightChart(consultations);
    if (document.getElementById('back-to-patients')) document.getElementById('back-to-patients').onclick = () => window.location.hash = '#/pacientes';

    setupMealPlanListeners(user, patient);
}

function setupMealPlanListeners(user, patient) {
    const generateBtn = document.getElementById('generate-plan-btn');
    const listView = document.getElementById('plan-list-view');
    const genView = document.getElementById('plan-generation-view');
    const loading = document.getElementById('plan-loading');
    const editor = document.getElementById('plan-editor');
    const saveBtn = document.getElementById('save-generated-plan-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const daysTabs = document.getElementById('days-tabs');
    const mealsContainer = document.getElementById('meals-container');
    const editorTitle = document.getElementById('editor-title');
    const editorSubtitle = document.getElementById('editor-subtitle');

    let currentPlanData = null;
    let activeDayIndex = 0;

    const renderEditor = (plan, isHistory = false) => {
        let normalizedPlan = { plano_semanal: [] };
        
        // 1. Se já for o formato correto
        if (plan.plano_semanal && Array.isArray(plan.plano_semanal)) {
            normalizedPlan = plan;
        } 
        // 2. Se for uma lista direta de dias
        else if (Array.isArray(plan)) {
            normalizedPlan.plano_semanal = plan;
        }
        // 3. Se for um objeto com dias como chaves (o caso atual)
        else {
            const possibleData = plan.plano_alimentar || plan.plano_semanal || plan;
            const diasMap = {
                'segunda': 'Segunda-feira', 'terca': 'Terça-feira', 'quarta': 'Quarta-feira',
                'quinta': 'Quinta-feira', 'sexta': 'Sexta-feira', 'sabado': 'Sábado', 'domingo': 'Domingo'
            };
            
            normalizedPlan.plano_semanal = Object.entries(possibleData).map(([key, value]) => ({
                dia: diasMap[key.toLowerCase()] || key,
                refeicoes: value
            }));
        }
        
        currentPlanData = normalizedPlan;
        listView.style.display = 'none';
        genView.style.display = 'block';
        loading.style.display = 'none';
        editor.style.display = 'block';
        
        if (isHistory) {
            editorTitle.innerText = 'Visualizando Plano';
            editorSubtitle.innerText = 'Plano salvo anteriormente';
            saveBtn.style.display = 'none';
        } else {
            editorTitle.innerText = 'Plano Gerado';
            editorSubtitle.innerText = 'Revise e edite as opções antes de salvar';
            saveBtn.style.display = 'block';
        }

        renderDaysTabs();
        renderMeals(normalizedPlan.plano_semanal[activeDayIndex], activeDayIndex);
    };

    const renderDaysTabs = () => {
        // Se a IA retornar o objeto direto ou dentro de plano_semanal
        const dias = currentPlanData.plano_semanal || (Array.isArray(currentPlanData) ? currentPlanData : null);
        
        if (!dias) {
            console.error("Formato de plano inválido:", currentPlanData);
            mealsContainer.innerHTML = '<div class="no-data">Erro: Formato de plano gerado é inválido.</div>';
            return;
        }
        
        daysTabs.innerHTML = dias.map((dia, index) => `
            <button type="button" class="data-tab-btn ${index === activeDayIndex ? 'active' : ''}" data-day="${index}">
                ${dia.dia || `Dia ${index + 1}`}
            </button>
        `).join('');

        daysTabs.querySelectorAll('.data-tab-btn').forEach(btn => {
            btn.onclick = () => {
                activeDayIndex = parseInt(btn.dataset.day);
                renderDaysTabs();
                renderMeals(currentPlanData.plano_semanal[activeDayIndex], activeDayIndex);
            };
        });
    };

    let activeMealIndex = 0;

    const renderMeals = (dia, dayIndex) => {
        const mealsContainer = document.getElementById('meals-container');
        const mealsControls = document.getElementById('meals-controls');
        const mealsKeys = Object.keys(dia.refeicoes);
        activeMealIndex = 0; // Reset ao mudar de dia

        const mealsMap = {
            'cafe_da_manha': { title: 'Café da Manhã', icon: '☕' },
            'lanche_manha': { title: 'Lanche da Manhã', icon: '🍎' },
            'almoco': { title: 'Almoço', icon: '🍛' },
            'lanche_tarde': { title: 'Lanche da Tarde', icon: '🥪' },
            'jantar': { title: 'Jantar', icon: '🥗' }
        };

        const saveBtn = document.getElementById('save-generated-plan-btn');

        // Renderiza os cards das refeições
        const mealsHTML = mealsKeys.map((key) => {
            const options = dia.refeicoes[key];
            return `
                <div class="meal-card" data-meal-key="${key}">
                    <div class="meal-card-header">
                        <span class="meal-icon">${mealsMap[key]?.icon || '🍴'}</span>
                        <span class="meal-title">${mealsMap[key]?.title || key}</span>
                    </div>
                    <div class="meal-options-list">
                        <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 5px; text-transform: uppercase;">Opções:</p>
                        ${(Array.isArray(options) ? options : [options]).map((opt, i) => `
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <span style="font-weight: 700; color: var(--primary-color); font-size: 0.9rem;">${i + 1}.</span>
                                <input type="text" class="meal-option-input" 
                                    data-day="${dayIndex}" 
                                    data-meal="${key}" 
                                    data-index="${i}" 
                                    value="${opt}"
                                    style="margin-bottom: 0;"
                                    ${saveBtn.style.display === 'none' ? 'readonly' : ''}
                                >
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Renderiza os controles do carrossel
        const controlsHTML = `
            <div class="carousel-nav">
                <button class="carousel-btn" id="prev-meal" ${activeMealIndex === 0 ? 'disabled' : ''}>
                    <i class="ph-bold ph-caret-left"></i>
                </button>
                <div class="carousel-dots">
                    ${mealsKeys.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
                </div>
                <button class="carousel-btn" id="next-meal" ${activeMealIndex === mealsKeys.length - 1 ? 'disabled' : ''}>
                    <i class="ph-bold ph-caret-right"></i>
                </button>
            </div>
        `;

        mealsContainer.innerHTML = mealsHTML;
        mealsControls.innerHTML = controlsHTML;

        // Configura os eventos do carrossel
        const setupCarousel = () => {
            const prevBtn = document.getElementById('prev-meal');
            const nextBtn = document.getElementById('next-meal');
            const dots = document.querySelectorAll('.dot');
            const cards = document.querySelectorAll('.meal-card');

            // --- LÓGICA DE ARRASTE COM O MOUSE ---
            let isDown = false;
            let startX;
            let scrollLeft;

            mealsContainer.addEventListener('mousedown', (e) => {
                isDown = true;
                mealsContainer.style.scrollSnapType = 'none'; // Desativa snap ao arrastar
                startX = e.pageX - mealsContainer.offsetLeft;
                scrollLeft = mealsContainer.scrollLeft;
            });

            mealsContainer.addEventListener('mouseleave', () => {
                isDown = false;
            });

            mealsContainer.addEventListener('mouseup', () => {
                isDown = false;
                mealsContainer.style.scrollSnapType = 'x mandatory'; // Reativa snap
            });

            mealsContainer.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - mealsContainer.offsetLeft;
                const walk = (x - startX) * 2; // Velocidade do arraste
                mealsContainer.scrollLeft = scrollLeft - walk;
            });
            // -------------------------------------

            const updateCarousel = () => {
                const card = cards[activeMealIndex];
                const scrollLeft = card.offsetLeft - (mealsContainer.offsetWidth - card.offsetWidth) / 2;
                
                mealsContainer.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            };

            // Detecta scroll manual para atualizar os dots
            mealsContainer.addEventListener('scroll', () => {
                const scrollCenter = mealsContainer.scrollLeft + (mealsContainer.offsetWidth / 2);
                cards.forEach((card, i) => {
                    if (scrollCenter >= card.offsetLeft && scrollCenter <= (card.offsetLeft + card.offsetWidth)) {
                        activeMealIndex = i;
                        dots.forEach((dot, dIdx) => dot.classList.toggle('active', dIdx === i));
                        prevBtn.disabled = i === 0;
                        nextBtn.disabled = i === mealsKeys.length - 1;
                    }
                });
            }, { passive: true });

            prevBtn.addEventListener('click', () => {
                if (activeMealIndex > 0) {
                    activeMealIndex--;
                    updateCarousel();
                }
            });

            nextBtn.addEventListener('click', () => {
                if (activeMealIndex < mealsKeys.length - 1) {
                    activeMealIndex++;
                    updateCarousel();
                }
            });

            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    activeMealIndex = parseInt(dot.dataset.index);
                    updateCarousel();
                });
            });
        };

        // Pequeno delay para garantir que o DOM renderizou e as larguras estão disponíveis
        setTimeout(setupCarousel, 50);

        // Re-vincula os eventos de input (pois o innerHTML foi resetado)
        document.querySelectorAll('.meal-option-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const { day, meal, index } = e.target.dataset;
                currentPlanData.plano_semanal[day].refeicoes[meal][index] = e.target.value;
            });
        });
    };

    if (generateBtn) generateBtn.onclick = async () => {
        listView.style.display = 'none';
        genView.style.display = 'block';
        loading.style.display = 'flex';
        editor.style.display = 'none';

        try {
            const response = await fetch('/api/gerar-plano', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ patientData: patient })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro na geração do plano');
            }

            const data = await response.json();
            activeDayIndex = 0;
            renderEditor(data);
        } catch (err) {
            console.error(err);
            alert('Erro ao gerar plano: ' + err.message);
            listView.style.display = 'block';
            genView.style.display = 'none';
        }
    };

    if (cancelBtn) cancelBtn.onclick = () => {
        listView.style.display = 'block';
        genView.style.display = 'none';
    };

    if (saveBtn) saveBtn.onclick = async () => {
        saveBtn.disabled = true;
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Salvando...';
        
        try {
            const { error } = await supabase.from('planos_alimentares').insert([{
                paciente_id: patient.id,
                conteudo: currentPlanData
            }]);

            if (error) throw error;
            
            showToast();
            // Refresh detail view to show the new plan in list
            renderPatientDetailView(user, patient.id);
        } catch (err) {
            alert('Erro ao salvar: ' + err.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    };

    // History items
    document.querySelectorAll('.meal-plan-item').forEach(item => {
        item.onclick = async () => {
            const planId = item.dataset.id;
            const { data, error } = await supabase.from('planos_alimentares').select('*').eq('id', planId).single();
            if (!error && data) {
                activeDayIndex = 0;
                renderEditor(data.conteudo, true);
            }
        };
    });
}

let weightChartInstance = null;
function initWeightChart(consultations) {
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;
    
    if (weightChartInstance) {
        weightChartInstance.destroy();
    }

    const sorted = [...consultations].sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta));
    weightChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sorted.map(c => new Date(c.data_consulta).toLocaleDateString('pt-BR')),
            datasets: [{
                label: 'Peso (kg)',
                data: sorted.map(c => c.peso),
                borderColor: '#84cc16',
                backgroundColor: 'rgba(132, 204, 22, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#84cc16'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } }
        }
    });
}

function showToast() {
    const toast = document.getElementById('success-toast');
    if (toast) {
        toast.style.display = 'flex';
        setTimeout(() => toast.style.display = 'none', 3000);
    }
}

// Navigation
window.addEventListener('hashchange', () => getSession().then(router));
onAuthChange((event, session) => router(session));
getSession().then(router);
