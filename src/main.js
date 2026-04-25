import { onAuthChange, signInNutricionista, signUpNutricionista, signOut, getSession } from './auth';
import { renderAuth } from './views/AuthView';
import { renderDashboard } from './views/DashboardView';
import { renderPatientsList, updatePatientsGrid } from './views/PatientsListView';
import { renderPatientForm } from './views/PatientFormView';
import { renderPatientDetail } from './views/PatientDetailView';
import { supabase } from './lib/supabase';

const app = document.getElementById('app');

// Estado da aplicação
let currentMode = 'login'; // 'login', 'signup', 'dashboard'

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
 * Renderiza view de Autenticação
 */
function renderAuthView(mode, message = null) {
    document.body.className = 'auth-page';
    app.innerHTML = renderAuth(mode, message);
    setupAuthListeners(mode);
}

/**
 * Renderiza view de Dashboard
 */
function renderDashboardView(user) {
    document.body.className = 'dashboard-page';
    app.innerHTML = renderDashboard(user);
    setupDashboardListeners();
    loadDashboardData(user);
}

/**
 * Carrega os dados reais do Dashboard a partir do Supabase
 */
async function loadDashboardData(user) {
    try {
        const userId = user.id;

        // 1. Total de pacientes cadastrados
        const { count: totalPacientes, error: errorTotal } = await supabase
            .from('pacientes')
            .select('*', { count: 'exact', head: true })
            .eq('nutricionista_id', userId);
        
        if (!errorTotal) {
            document.getElementById('total-pacientes').innerText = totalPacientes || 0;
        }

        // 2. Consultas da semana
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Precisamos buscar pacientes primeiro e depois as consultas (ou via join)
        // No Supabase JS podemos fazer um join simples:
        const { count: totalConsultas, error: errorConsultas } = await supabase
            .from('consultas')
            .select('id, paciente!inner(nutricionista_id)', { count: 'exact', head: true })
            .eq('paciente.nutricionista_id', userId)
            .gte('data_consulta', startOfWeek.toISOString().split('T')[0])
            .lte('data_consulta', endOfWeek.toISOString().split('T')[0]);

        if (!errorConsultas) {
            document.getElementById('consultas-semana').innerText = totalConsultas || 0;
        }

        // 3. Pacientes sem retorno (> 30 dias e sem agendamento futuro)
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
        const trintaDiasAtrasStr = trintaDiasAtras.toISOString().split('T')[0];
        const hojeStr = new Date().toISOString().split('T')[0];

        // Busca todos os pacientes
        const { data: pacientes, error: errorP } = await supabase
            .from('pacientes')
            .select(`
                id, 
                nome,
                consultas (
                    data_consulta,
                    proximo_retorno
                )
            `)
            .eq('nutricionista_id', userId);

        if (errorP) throw errorP;

        const containerSemRetorno = document.getElementById('pacientes-sem-retorno');
        
        const pacientesSemRetorno = (pacientes || []).filter(p => {
            if (!p.consultas || p.consultas.length === 0) return false;
            
            // Ordena consultas pela data descendente para pegar a última
            const consultasOrdenadas = [...p.consultas].sort((a, b) => 
                new Date(b.data_consulta) - new Date(a.data_consulta)
            );
            
            const ultimaConsulta = consultasOrdenadas[0];
            
            // Regra: última consulta ha mais de 30 dias E não possui retorno agendado (ou retorno já passou)
            const ultimaData = ultimaConsulta.data_consulta;
            const proximoRetorno = ultimaConsulta.proximo_retorno;
            
            const foiHaMaisDe30Dias = ultimaData < trintaDiasAtrasStr;
            const semRetornoAgendado = !proximoRetorno || proximoRetorno < hojeStr;

            return foiHaMaisDe30Dias && semRetornoAgendado;
        });

        if (pacientesSemRetorno.length === 0) {
            containerSemRetorno.innerHTML = '<div class="no-data">Nenhum paciente sem retorno no momento</div>';
        } else {
            containerSemRetorno.innerHTML = pacientesSemRetorno.map(p => `
                <a href="#/paciente/${p.id}" class="patient-item">
                    <div class="patient-avatar">${p.nome.charAt(0).toUpperCase()}</div>
                    <span>${p.nome}</span>
                </a>
            `).join('');
        }

    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
    }
}

/**
 * Listeners para a tela de Login/Signup
 */
function setupAuthListeners(mode) {
    const form = document.getElementById('auth-form');
    const switchSignup = document.getElementById('switch-to-signup');
    const switchLogin = document.getElementById('switch-to-login');

    if (switchSignup) {
        switchSignup.onclick = (e) => {
            e.preventDefault();
            currentMode = 'signup';
            renderAuthView('signup');
        };
    }

    if (switchLogin) {
        switchLogin.onclick = (e) => {
            e.preventDefault();
            currentMode = 'login';
            renderAuthView('login');
        };
    }

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const email = formData.get('email');
            const password = formData.get('password');
            const submitBtn = document.getElementById('submit-btn');
            
            submitBtn.disabled = true;
            submitBtn.innerText = 'Processando...';

            try {
                if (mode === 'login') {
                    await signInNutricionista(email, password);
                } else {
                    const nome = formData.get('nome');
                    const confirmPassword = formData.get('confirm-password');

                    if (password !== confirmPassword) {
                        throw new Error('As senhas não coincidem');
                    }

                    await signUpNutricionista(email, password, nome);
                    renderAuthView('login', { type: 'success', text: 'Conta criada com sucesso! Redirecionando...' });
                }
            } catch (error) {
                console.error(error);
                renderAuthView(mode, { type: 'error', text: error.message || 'Ocorreu um erro inesperado' });
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = mode === 'login' ? 'Entrar' : 'Criar conta';
            }
        };
    }

    // Banana mask logic
    const passwordInputs = document.querySelectorAll('.password-wrapper input[type="password"]');
    passwordInputs.forEach(input => {
        const mask = input.nextElementSibling;
        if (mask && mask.classList.contains('password-mask')) {
            input.addEventListener('input', () => {
                mask.textContent = '🍌'.repeat(input.value.length);
            });
        }
    });
}

/**
 * Renderiza view de Listagem de Pacientes
 */
async function renderPatientsListView(user) {
    document.body.className = 'dashboard-page';
    
    // Busca pacientes no Supabase
    const { data: patients, error } = await supabase
        .from('pacientes')
        .select('*, consultas(data_consulta)')
        .eq('nutricionista_id', user.id);
    
    app.innerHTML = renderPatientsList(user, patients || []);
    setupPatientsListListeners(user, patients || []);
}

/**
 * Renderiza view de Formulário de Paciente
 */
function renderPatientFormView(user) {
    document.body.className = 'dashboard-page';
    app.innerHTML = renderPatientForm(user);
    setupPatientFormListeners(user);
}

/**
 * Renderiza view de Detalhes do Paciente
 */
async function renderPatientDetailView(user, patientId) {
    document.body.className = 'dashboard-page';
    
    try {
        // Busca dados do paciente
        const { data: patient, error: patientError } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', patientId)
            .single();
            
        if (patientError) throw patientError;
        
        // Busca consultas do paciente
        const { data: consultations, error: consultationsError } = await supabase
            .from('consultas')
            .select('*')
            .eq('paciente_id', patientId)
            .order('data_consulta', { ascending: false });
            
        if (consultationsError) throw consultationsError;
        
        app.innerHTML = renderPatientDetail(user, patient, consultations || []);
        setupPatientDetailListeners(user);
    } catch (error) {
        console.error('Erro ao carregar detalhes do paciente:', error);
        alert('Erro ao carregar paciente: ' + error.message);
        window.location.hash = '#/pacientes';
    }
}

/**
 * Listeners para a Lista de Pacientes
 */
function setupPatientsListListeners(user, allPatients) {
    setupDashboardListeners(); // Logout and common nav

    const searchInput = document.getElementById('patient-search');
    if (searchInput) {
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allPatients.filter(p => p.nome.toLowerCase().includes(term));
            updatePatientsGrid(filtered);
        };
    }

    const newBtn = document.getElementById('new-patient-btn');
    if (newBtn) {
        newBtn.onclick = () => {
            window.location.hash = '#/novo-paciente';
        };
    }
}

/**
 * Listeners para o Formulário de Cadastro
 */
function setupPatientFormListeners(user) {
    setupDashboardListeners();

    // Lógica das Abas
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.onclick = () => {
            const target = tab.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`tab-${target}`).classList.add('active');
        };
    });

    // Cálculos Automáticos: Idade
    const dataNasc = document.getElementById('data_nascimento');
    const idadeFeedback = document.getElementById('idade-feedback');
    if (dataNasc) {
        dataNasc.onchange = () => {
            if (!dataNasc.value) return;
            const birth = new Date(dataNasc.value);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
            
            idadeFeedback.innerText = `${age} anos`;
            idadeFeedback.style.display = 'inline-block';
        };
    }

    // Cálculos Automáticos: IMC
    const pesoInput = document.getElementById('peso_inicial');
    const alturaInput = document.getElementById('altura');
    const imcDisplay = document.getElementById('imc-display');
    const imcFeedback = document.getElementById('imc-feedback');
    const imcDesc = document.getElementById('imc-desc');

    const updateIMC = () => {
        const peso = parseFloat(pesoInput.value);
        const alturaCm = parseFloat(alturaInput.value);
        if (peso && alturaCm) {
            const alturaM = alturaCm / 100;
            const imc = (peso / (alturaM * alturaM)).toFixed(1);
            imcDisplay.value = imc;
            imcFeedback.innerText = `IMC: ${imc}`;
            imcFeedback.style.display = 'inline-block';

            if (imc < 18.5) { imcDesc.innerText = 'Abaixo do peso'; imcDesc.className = 'imc-indicator imc-alerta'; }
            else if (imc < 25) { imcDesc.innerText = 'Peso normal'; imcDesc.className = 'imc-indicator imc-normal'; }
            else if (imc < 30) { imcDesc.innerText = 'Sobrepeso'; imcDesc.className = 'imc-indicator imc-alerta'; }
            else { imcDesc.innerText = 'Obesidade'; imcDesc.className = 'imc-indicator imc-perigo'; }
        }
    };

    if (pesoInput) pesoInput.oninput = updateIMC;
    if (alturaInput) alturaInput.oninput = updateIMC;

    // Formatação de Horas (6 -> 06:00, 630 -> 06:30)
    const formatTime = (val) => {
        if (!val) return '';
        let s = val.toString().replace(/\D/g, '');
        if (s.length <= 2) return s.padStart(2, '0') + ':00';
        if (s.length === 3) return s.slice(0, 1).padStart(2, '0') + ':' + s.slice(1);
        return s.slice(0, 2) + ':' + s.slice(2, 4);
    };

    const acordaInput = document.getElementById('horario_acorda');
    const dormeInput = document.getElementById('horario_dorme');
    const previewAcorda = document.getElementById('preview-acorda');
    const previewDorme = document.getElementById('preview-dorme');

    if (acordaInput) {
        acordaInput.oninput = () => { previewAcorda.innerText = formatTime(acordaInput.value); };
    }
    if (dormeInput) {
        dormeInput.oninput = () => { previewDorme.innerText = formatTime(dormeInput.value); };
    }

    // Máscara de Telefone: (xx) XXXXX-XXXX
    const applyPhoneMask = (input) => {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        if (value.length > 10) {
            value = `${value.slice(0, 10)}-${value.slice(10)}`;
        }
        input.value = value;
    };

    const telInput = document.getElementById('telefone');
    const whatsappInput = document.getElementById('whatsapp');

    if (telInput) {
        telInput.addEventListener('input', () => applyPhoneMask(telInput));
    }
    if (whatsappInput) {
        whatsappInput.addEventListener('input', () => applyPhoneMask(whatsappInput));
    }

    // Lógica 'Nenhum' (Desmarcar outros ao selecionar Nenhum)
    const setupNoneLogic = (name) => {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
        const noneBox = Array.from(checkboxes).find(c => c.classList.contains('none-option'));
        
        checkboxes.forEach(cb => {
            cb.onchange = () => {
                if (cb === noneBox && cb.checked) {
                    checkboxes.forEach(other => { if (other !== noneBox) other.checked = false; });
                } else if (cb !== noneBox && cb.checked) {
                    if (noneBox) noneBox.checked = false;
                }
            };
        });
    };

    setupNoneLogic('patologias');
    setupNoneLogic('restricoes');
    setupNoneLogic('alergias');

    // Toggle Atividade Física
    const radioAtividade = document.querySelectorAll('input[name="atividade_fisica"]');
    radioAtividade.forEach(r => {
        r.onchange = () => {
            const container = document.getElementById('atividade-desc-container');
            container.style.display = r.value === 'true' ? 'block' : 'none';
        };
    });

    // Form Submisson
    const form = document.getElementById('patient-form');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            // Multiselect data collection
            const collectList = (name, extraName) => {
                const list = Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(i => i.value);
                const extra = formData.get(extraName);
                if (extra) list.push(extra);
                return list.filter(v => v !== 'Nenhum'); // Remove 'Nenhum' from final array
            };

            const objetivos = collectList('objetivos', 'objetivo_texto_extra'); // Adjusted if needed
            const patologias = collectList('patologias', 'patologias_extra');
            const restricoes = collectList('restricoes', 'restricoes_extra');
            const alergias = collectList('alergias', 'alergias_extra');

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
                patologias: patologias,
                restricoes_alimentares: restricoes,
                alergias: alergias,
                medicamentos: formData.get('medicamentos'),
                suplementos: formData.get('suplementos'),
                refeicoes_por_dia: parseInt(formData.get('refeicoes_por_dia')) || null,
                litros_agua: parseFloat(formData.get('litros_agua')) || null,
                horario_acorda: formatTime(formData.get('horario_acorda')),
                horario_dorme: formatTime(formData.get('horario_dorme')),
                atividade_fisica: formData.get('atividade_fisica') === 'true',
                atividade_fisica_descricao: formData.get('atividade_fisica_descricao'),
                observacoes: formData.get('observacoes')
            };

            try {
                const { data, error } = await supabase
                    .from('pacientes')
                    .insert([patientData])
                    .select();

                if (error) throw error;

                alert('Paciente cadastrado com sucesso!');
                window.location.hash = `#/paciente/${data[0].id}`;
            } catch (error) {
                alert('Erro ao salvar paciente: ' + error.message);
            }
        };
    }

    const cancelBtn = document.getElementById('cancel-form');
    if (cancelBtn) {
        cancelBtn.onclick = () => window.location.hash = '#/pacientes';
    }
}

/**
 * Listeners para a Tela de Detalhes
 */
function setupPatientDetailListeners(user) {
    setupDashboardListeners();

    // Lógica das Abas
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.onclick = () => {
            const target = tab.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`tab-${target}`).classList.add('active');
        };
    });

    const backBtn = document.getElementById('back-to-patients');
    if (backBtn) {
        backBtn.onclick = () => {
            window.location.hash = '#/pacientes';
        };
    }
}

/**
 * Listeners para o Dashboard
 */
function setupDashboardListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await signOut();
        };
    }

    const navDashboard = document.getElementById('nav-dashboard');
    if (navDashboard) {
        navDashboard.onclick = (e) => {
            e.preventDefault();
            window.location.hash = '#/';
        };
    }

    const navPacientes = document.getElementById('nav-pacientes');
    if (navPacientes) {
        navPacientes.onclick = (e) => {
            e.preventDefault();
            window.location.hash = '#/pacientes';
        };
    }
}

// Escuta mudanças na hash da URL para navegação
window.addEventListener('hashchange', () => {
    getSession().then(router);
});

// Inicialização
onAuthChange((event, session) => {
    router(session);
});

// Checagem inicial
getSession().then(router);
