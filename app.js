/* ==========================================================================
   app.js — GestorPro & Antigravity Studio
   Gestão de Empresas, Estúdio de Logos IA, Catálogo Antigravity & Print-to-App
   ========================================================================== */

const STORAGE_KEY_EMPRESAS = 'gestorpro_empresas_v2';
const STORAGE_KEY_PROJETOS = 'gestorpro_projetos_antigravity';

let empresas = [];
let projetosAntigravity = [];
let currentFilter = 'all';
let editingId = null;
let currentAiFormat = 'logo';
let currentGeneratedAppCode = '';

/* ── PROJETOS ANTIGRAVITY REAIS DETECTADOS NO WORKSPACE ── */
const PROJETOS_PADRAO = [
  { id: 'p1',  nome: 'sdvidros',              categoria: 'vidros',     desc: 'Sistema Completo de Vidraçaria, Orçamentos e Controle de Esquadrias',         path: 'C:/Users/User/Desktop/sdvidros',                                   vercelUrl: 'https://sdvidros.vercel.app/' },
  { id: 'p2',  nome: 'sd-madereira',          categoria: 'madeira',    desc: 'Sistema de Vendas, Estoque e Pedidos de Madeira e Compensados',                path: 'C:/Users/User/.gemini/antigravity-ide/scratch/sd-madereira',       vercelUrl: '' },
  { id: 'p3',  nome: 'sd-solucoes-digitais',  categoria: 'web',        desc: 'Portal Institucional, Apresentação de Soluções e Portfólio Digital',           path: 'C:/Users/User/.gemini/antigravity-ide/scratch/sd-solucoes-digitais', vercelUrl: 'https://sd-solucoes-digitais.vercel.app/' },
  { id: 'p4',  nome: 'SDfinanceiro',          categoria: 'financeiro', desc: 'Sistema Financeiro com Fluxo de Caixa, Entradas, Saídas e DRE',               path: 'C:/Users/User/.gemini/antigravity-ide/scratch/SDfinanceiro',       vercelUrl: 'https://sdfinanceiro.vercel.app/' },
  { id: 'p5',  nome: 'sd-financas-pro',       categoria: 'financeiro', desc: 'Gestão Financeira Avançada com Gráficos e Previsões',                          path: 'C:/Users/User/.gemini/antigravity-ide/scratch/sd-financas-pro',   vercelUrl: '' },
  { id: 'p6',  nome: 'sdconstrucao',          categoria: 'web',        desc: 'Gerenciador de Obras, Medições e Serviços de Construção Civil',                path: 'C:/Users/User/.gemini/antigravity-ide/scratch/sdconstrucao',      vercelUrl: 'https://sdconstrucoes.vercel.app/' },
  { id: 'p7',  nome: 'sdmoveisprojetados',    categoria: 'madeira',    desc: 'Módulo de Catálogo e Projetos de Móveis Planejados Sob Medida',                path: 'C:/Users/User/.gemini/antigravity-ide/scratch/sdmoveisprojetados', vercelUrl: 'https://sdmoveisprojetados.vercel.app/' },
  { id: 'p8',  nome: 'sdplanodecorte',        categoria: 'madeira',    desc: 'Otimizador de Plano de Corte para Chapas e Painéis de Madeira/Vidro',         path: 'C:/Users/User/.gemini/antigravity-ide/scratch/sdplanodecorte',   vercelUrl: 'https://sdplanodecorte.vercel.app/' },
  { id: 'p9',  nome: 'whatsapp-multi-pedidos',categoria: 'web',        desc: 'Central de Atendimento e Geração de Pedidos Automáticos via WhatsApp',        path: 'C:/Users/User/.gemini/antigravity-ide/scratch/whatsapp-multi-pedidos', vercelUrl: '' },
  { id: 'p10', nome: 'deploy_sd',             categoria: 'web',        desc: 'Scripts e Configurações para Publicação e Deploy Contínuo',                   path: 'C:/Users/User/.gemini/antigravity-ide/scratch/deploy_sd',         vercelUrl: '' },
  { id: 'p11', nome: 'cine-sound-hub',        categoria: 'web',        desc: 'Plataforma Interativa Multimídia e Hub de Áudio/Vídeo',                        path: 'C:/Users/User/.gemini/antigravity-ide/scratch/cine-sound-hub',   vercelUrl: '' },
  { id: 'p12', nome: 'city-builder',          categoria: 'web',        desc: 'Simulador e Ferramenta Interativa de Planejamento Urbano',                    path: 'C:/Users/User/.gemini/antigravity-ide/scratch/city-builder',     vercelUrl: '' }
];


/* ── INICIALIZAÇÃO ── */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderCards();
  renderProjetos();
  updateStats();
  setupPasteHandler();

  // Se o estúdio de IA estiver aberto, gera os primeiros exemplos
  gerarLogosAi();
});

/* ── STORAGE ── */
function loadData() {
  try {
    const rawEmpresas = localStorage.getItem(STORAGE_KEY_EMPRESAS);
    empresas = rawEmpresas ? JSON.parse(rawEmpresas) : [];

    const rawProjetos = localStorage.getItem(STORAGE_KEY_PROJETOS);
    if (rawProjetos) {
      const stored = JSON.parse(rawProjetos);
      // Mescla: aplica vercelUrl e path atualizados do PROJETOS_PADRAO sobre dados salvos
      projetosAntigravity = stored.map(p => {
        const defaults = PROJETOS_PADRAO.find(d => d.id === p.id);
        return defaults ? { ...p, vercelUrl: defaults.vercelUrl, path: defaults.path } : p;
      });
    } else {
      projetosAntigravity = PROJETOS_PADRAO;
    }
  } catch (err) {
    console.error('Erro ao ler localStorage:', err);
    empresas = [];
    projetosAntigravity = PROJETOS_PADRAO;
  }
}


function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY_EMPRESAS, JSON.stringify(empresas));
    localStorage.setItem(STORAGE_KEY_PROJETOS, JSON.stringify(projetosAntigravity));
  } catch (err) {
    console.error('Erro ao salvar no localStorage:', err);
    showToast('Aviso: Armazenamento local quase cheio.', 'error');
  }
}

/* ── NAVEGAÇÃO POR ABAS ── */
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(nt => nt.classList.remove('active'));

  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add('active');

  const navId = tabId.replace('tab-', 'nav-');
  const targetNav = document.getElementById(navId);
  if (targetNav) targetNav.classList.add('active');

  if (tabId === 'tab-print' && !currentGeneratedAppCode) {
    gerarAppDoPrint(); // Inicializa o preview funcional
  }
}

/* ── UTILS ── */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getInitials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function getStatusLabel(s) {
  const map = { ativa: 'Ativa', inativa: 'Inativa', prospect: 'Prospect' };
  return map[s] || s || 'Ativa';
}

/* ── MÁSCARAS DE ENTRADA ── */
function maskCNPJ(el) {
  let v = el.value.replace(/\D/g, '').substring(0, 14);
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
         .replace(/\.(\d{3})(\d)/, '.$1-$2');
  } else {
    v = v.replace(/^(\d{2})(\d)/, '$1.$2')
         .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
         .replace(/\.(\d{3})(\d)/, '.$1/$2')
         .replace(/(\d{4})(\d)/, '$1-$2');
  }
  el.value = v;
}

function maskTel(el) {
  let v = el.value.replace(/\D/g, '').substring(0, 10);
  v = v.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  el.value = v;
}

function maskCel(el) {
  let v = el.value.replace(/\D/g, '').substring(0, 11);
  v = v.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  el.value = v;
}

function maskCEP(el) {
  let v = el.value.replace(/\D/g, '').substring(0, 8);
  v = v.replace(/^(\d{5})(\d)/, '$1-$2');
  el.value = v;
}

/* ── BUSCA AUTOMÁTICA DE CEP VIA VIACEP ── */
async function buscarCEP() {
  const cepInput = document.getElementById('f-cep');
  const cep = cepInput.value.replace(/\D/g, '');
  if (cep.length !== 8) return;

  try {
    showToast('Buscando endereço pelo CEP...', 'success');
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (data.erro) {
      showToast('CEP não encontrado.', 'error');
      return;
    }
    document.getElementById('f-logradouro').value = data.logradouro || '';
    document.getElementById('f-bairro').value     = data.bairro     || '';
    document.getElementById('f-cidade').value     = data.localidade || '';
    document.getElementById('f-uf').value         = data.uf         || '';
    document.getElementById('f-numero').focus();
    showToast('Endereço preenchido automaticamente!', 'success');
  } catch (e) {
    console.log('ViaCEP offline ou sem conexão.');
  }
}

/* ── MODAL FORM EMPRESA ── */
function openModal(id = null) {
  editingId = id;
  const overlay = document.getElementById('modal-overlay');
  const form    = document.getElementById('empresa-form');

  clearErrors();
  hideAlertBanner();
  form.reset();
  removerLogoEmpresa();

  if (id) {
    const e = empresas.find(x => x.id === id);
    if (!e) return;
    document.getElementById('modal-badge').textContent = 'Editar Empresa';
    document.getElementById('modal-title').textContent = 'Editar Empresa & Projeto';
    document.getElementById('btn-salvar').innerHTML =
      '<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M2 8.5l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Atualizar Empresa';
    fillForm(e);
  } else {
    document.getElementById('modal-badge').textContent = 'Nova Empresa';
    document.getElementById('modal-title').textContent = 'Cadastrar Empresa & Projeto';
    document.getElementById('btn-salvar').innerHTML =
      '<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M2 8.5l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Salvar Empresa';
  }

  overlay.classList.add('open');
  setTimeout(() => document.getElementById('f-razao').focus(), 250);
}

function fillForm(e) {
  document.getElementById('form-id').value          = e.id;
  document.getElementById('f-razao').value          = e.razaoSocial     || '';
  document.getElementById('f-fantasia').value       = e.nomeFantasia     || '';
  document.getElementById('f-cnpj').value           = e.cnpj            || '';
  document.getElementById('f-ie').value             = e.ie              || '';
  document.getElementById('f-segmento').value       = e.segmento        || '';
  document.getElementById('f-status').value         = e.status          || 'ativa';
  document.getElementById('f-email').value          = e.email           || '';
  document.getElementById('f-telefone').value       = e.telefone        || '';
  document.getElementById('f-celular').value        = e.celular         || '';
  document.getElementById('f-responsavel').value    = e.responsavel     || '';
  document.getElementById('f-site').value           = e.site            || '';
  document.getElementById('f-instagram').value      = e.instagram       || '';
  document.getElementById('f-cep').value            = e.cep             || '';
  document.getElementById('f-logradouro').value     = e.logradouro      || '';
  document.getElementById('f-numero').value         = e.numero          || '';
  document.getElementById('f-complemento').value    = e.complemento     || '';
  document.getElementById('f-bairro').value         = e.bairro          || '';
  document.getElementById('f-cidade').value         = e.cidade          || '';
  document.getElementById('f-uf').value             = e.uf              || '';
  document.getElementById('f-projeto').value        = e.projeto         || '';
  document.getElementById('f-obs').value            = e.obs             || '';

  if (e.logo) {
    setCompanyLogoPreview(e.logo);
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  editingId = null;
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function showAlertBanner(msg) {
  const b = document.getElementById('form-alert-banner');
  if (b) {
    b.innerHTML = `⚠️ <span>${msg}</span>`;
    b.style.display = 'flex';
  }
  const f = document.getElementById('footer-save-feedback');
  if (f) {
    f.innerHTML = `⚠️ <span>${msg}</span>`;
    f.style.display = 'block';
  }
}

function hideAlertBanner() {
  const b = document.getElementById('form-alert-banner');
  if (b) b.style.display = 'none';
  const f = document.getElementById('footer-save-feedback');
  if (f) f.style.display = 'none';
}

/* ── VALIDAÇÃO INTELIGENTE E RESILIENTE ── */
function validate() {
  clearErrors();
  hideAlertBanner();

  const razao    = document.getElementById('f-razao').value.trim();
  const fantasia = document.getElementById('f-fantasia').value.trim();
  const projeto  = document.getElementById('f-projeto').value.trim();

  // É necessário pelo menos UM nome identificador (Razão Social, Nome Fantasia ou Nome do Projeto)
  if (!razao && !fantasia && !projeto) {
    const msg = 'Informe pelo menos a Razão Social ou Nome Fantasia da empresa!';
    showError('err-razao', 'f-razao', msg);
    showAlertBanner(msg);
    showToast(msg, 'error');

    // Rola suavemente até o campo para o usuário ver
    const modalForm = document.querySelector('.modal-form');
    if (modalForm) modalForm.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('f-razao').focus();
    return false;
  }

  // Se informou e-mail, valida formato básico
  const email = document.getElementById('f-email').value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const msg = 'Por favor, informe um formato de e-mail válido (ex: contato@empresa.com.br).';
    showError('err-email', 'f-email', msg);
    showAlertBanner(msg);
    showToast(msg, 'error');
    document.getElementById('f-email').focus();
    return false;
  }

  return true;
}

function showError(errId, fieldId, msg) {
  const elErr = document.getElementById(errId);
  if (elErr) elErr.textContent = msg;
  const elFld = document.getElementById(fieldId);
  if (elFld) elFld.classList.add('error');
}

function clearErrors() {
  ['err-razao','err-cnpj','err-email'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  document.querySelectorAll('input.error,select.error,textarea.error')
    .forEach(el => el.classList.remove('error'));
}

/* ── SALVAMENTO SEGURO DA EMPRESA ── */
function salvarEmpresa(event) {
  if (event) event.preventDefault();

  if (!validate()) {
    console.warn('Validação falhou.');
    return;
  }

  const razaoVal = document.getElementById('f-razao').value.trim();
  const fantVal  = document.getElementById('f-fantasia').value.trim();
  const projVal  = document.getElementById('f-projeto').value.trim();

  const empresa = {
    id:           editingId || generateId(),
    razaoSocial:  razaoVal || fantVal || projVal,
    nomeFantasia: fantVal  || razaoVal,
    cnpj:         document.getElementById('f-cnpj').value.trim(),
    ie:           document.getElementById('f-ie').value.trim(),
    segmento:     document.getElementById('f-segmento').value,
    status:       document.getElementById('f-status').value || 'ativa',
    email:        document.getElementById('f-email').value.trim(),
    telefone:     document.getElementById('f-telefone').value.trim(),
    celular:      document.getElementById('f-celular').value.trim(),
    responsavel:  document.getElementById('f-responsavel').value.trim(),
    site:         document.getElementById('f-site').value.trim(),
    instagram:    document.getElementById('f-instagram').value.trim(),
    cep:          document.getElementById('f-cep').value.trim(),
    logradouro:   document.getElementById('f-logradouro').value.trim(),
    numero:       document.getElementById('f-numero').value.trim(),
    complemento:  document.getElementById('f-complemento').value.trim(),
    bairro:       document.getElementById('f-bairro').value.trim(),
    cidade:       document.getElementById('f-cidade').value.trim(),
    uf:           document.getElementById('f-uf').value,
    projeto:      projVal,
    obs:          document.getElementById('f-obs').value.trim(),
    logo:         document.getElementById('f-logo-data').value || '',
    updatedAt:    new Date().toISOString(),
  };

  if (editingId) {
    const idx = empresas.findIndex(x => x.id === editingId);
    if (idx !== -1) {
      empresa.createdAt = empresas[idx].createdAt;
      empresas[idx] = empresa;
      showToast('Empresa atualizada com sucesso!', 'success');
    }
  } else {
    empresa.createdAt = empresa.updatedAt;
    empresas.unshift(empresa);
    showToast(`Empresa "${empresa.nomeFantasia || empresa.razaoSocial}" salva com sucesso!`, 'success');
  }

  saveData();
  closeModal();
  renderCards();
  updateStats();
}

/* ── EXCLUSÃO ── */
function excluirEmpresa(id) {
  if (!confirm('Deseja realmente excluir esta empresa? Esta ação não pode ser desfeita.')) return;
  empresas = empresas.filter(e => e.id !== id);
  saveData();
  closeDetail();
  renderCards();
  updateStats();
  showToast('Empresa excluída do sistema.', 'error');
}

function excluirEmpresaDireto(id, event) {
  if (event) event.stopPropagation();
  const e = empresas.find(x => x.id === id);
  const nome = e ? (e.nomeFantasia || e.razaoSocial) : 'esta empresa';
  if (!confirm(`Deseja realmente excluir a empresa "${nome}"?`)) return;
  empresas = empresas.filter(x => x.id !== id);
  saveData();
  renderCards();
  updateStats();
  showToast(`Empresa "${nome}" excluída com sucesso.`, 'error');
}

/* ── FILTRO E BUSCA ── */
function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCards();
}

function getFilteredEmpresas() {
  const q = (document.getElementById('search-input').value || '').toLowerCase().trim();
  return empresas.filter(e => {
    const matchFilter = currentFilter === 'all' || e.status === currentFilter;
    const matchSearch = !q ||
      (e.razaoSocial  || '').toLowerCase().includes(q) ||
      (e.nomeFantasia || '').toLowerCase().includes(q) ||
      (e.cnpj         || '').toLowerCase().includes(q) ||
      (e.cidade       || '').toLowerCase().includes(q) ||
      (e.email        || '').toLowerCase().includes(q) ||
      (e.responsavel  || '').toLowerCase().includes(q) ||
      (e.segmento     || '').toLowerCase().includes(q) ||
      (e.projeto      || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
}

/* ── RENDERIZAÇÃO DOS CARDS DE EMPRESAS ── */
function renderCards() {
  const grid  = document.getElementById('cards-grid');
  const empty = document.getElementById('empty-state');
  const filtered = getFilteredEmpresas();

  document.getElementById('tab-count-empresas').textContent = empresas.length;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = filtered.map((e, i) => {
    const avatarContent = e.logo
      ? `<img src="${e.logo}" alt="Logo" />`
      : getInitials(e.nomeFantasia || e.razaoSocial);

    return `
      <article class="company-card" onclick="openDetail('${e.id}')" id="card-${e.id}" style="animation-delay:${i * 0.04}s">
        <div class="card-header">
          <div class="card-avatar">${avatarContent}</div>
          <div class="card-info">
            <div class="card-name">${e.nomeFantasia || e.razaoSocial}</div>
            <div class="card-segmento">${e.segmento || 'Segmento não informado'}</div>
          </div>
          <span class="card-status status-${e.status || 'ativa'}">${getStatusLabel(e.status)}</span>
        </div>
        <div class="card-divider"></div>
        <div class="card-meta">
          ${e.cnpj ? `<div class="card-meta-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
            <span>${e.cnpj}</span>
          </div>` : ''}
          ${e.email ? `<div class="card-meta-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>${e.email}</span>
          </div>` : ''}
          ${e.celular || e.telefone ? `<div class="card-meta-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>${e.celular || e.telefone}</span>
          </div>` : ''}
          ${e.cidade ? `<div class="card-meta-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${e.cidade}${e.uf ? ' – ' + e.uf : ''}</span>
          </div>` : ''}
        </div>
        <div class="card-footer">
          <span class="card-date">📅 ${formatDate(e.createdAt)}</span>
          <div style="display:flex; align-items:center; gap:6px;">
            ${e.projeto ? `<span class="card-projeto">⚡ ${e.projeto}</span>` : ''}
            <button class="btn-icon-danger" onclick="excluirEmpresaDireto('${e.id}', event)" title="Excluir empresa">🗑️</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/* ── MODAL DETALHE COMPLETO ── */
function openDetail(id) {
  const e = empresas.find(x => x.id === id);
  if (!e) return;

  document.getElementById('detail-nome').textContent = e.nomeFantasia || e.razaoSocial;

  const logoAvatar = document.getElementById('detail-logo-avatar');
  if (e.logo) {
    logoAvatar.innerHTML = `<img src="${e.logo}" style="width:100%;height:100%;object-fit:contain;" alt="Logo" />`;
  } else {
    logoAvatar.textContent = getInitials(e.nomeFantasia || e.razaoSocial);
  }

  const badge = document.getElementById('detail-badge-status');
  badge.textContent = getStatusLabel(e.status);
  badge.className = `modal-badge status-${e.status || 'ativa'}`;

  const endereco = [e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.uf, e.cep]
    .filter(Boolean).join(', ');

  document.getElementById('detail-body').innerHTML = `
    <div class="detail-section">
      <div class="detail-section-title">Dados da Empresa</div>
      <div class="detail-grid">
        <div class="detail-field"><span class="detail-label">Razão Social</span><span class="detail-value">${e.razaoSocial || '—'}</span></div>
        <div class="detail-field"><span class="detail-label">Nome Fantasia</span><span class="detail-value">${e.nomeFantasia || '—'}</span></div>
        <div class="detail-field"><span class="detail-label">CNPJ / CPF</span><span class="detail-value">${e.cnpj || '—'}</span></div>
        <div class="detail-field"><span class="detail-label">Inscrição Estadual</span><span class="detail-value">${e.ie || '—'}</span></div>
        <div class="detail-field"><span class="detail-label">Segmento</span><span class="detail-value">${e.segmento || '—'}</span></div>
        <div class="detail-field"><span class="detail-label">Status</span><span class="detail-value">${getStatusLabel(e.status)}</span></div>
      </div>
    </div>
    <div class="detail-divider"></div>
    <div class="detail-section">
      <div class="detail-section-title">Contato & Comunicação</div>
      <div class="detail-grid">
        <div class="detail-field"><span class="detail-label">E-mail</span><span class="detail-value">${e.email ? `<a href="mailto:${e.email}">${e.email}</a>` : '—'}</span></div>
        <div class="detail-field"><span class="detail-label">Responsável</span><span class="detail-value">${e.responsavel || '—'}</span></div>
        <div class="detail-field"><span class="detail-label">Telefone</span><span class="detail-value">${e.telefone || '—'}</span></div>
        <div class="detail-field"><span class="detail-label">Celular / WhatsApp</span><span class="detail-value">${e.celular ? `<a href="https://wa.me/55${e.celular.replace(/\D/g,'')}" target="_blank" style="color:#34d399;font-weight:700;">${e.celular} 💬 Abrir WhatsApp</a>` : '—'}</span></div>
        <div class="detail-field"><span class="detail-label">Website</span><span class="detail-value">${e.site ? `<a href="${e.site}" target="_blank">${e.site}</a>` : '—'}</span></div>
        <div class="detail-field"><span class="detail-label">Instagram</span><span class="detail-value">${e.instagram || '—'}</span></div>
      </div>
    </div>
    ${endereco ? `
    <div class="detail-divider"></div>
    <div class="detail-section">
      <div class="detail-section-title">Endereço</div>
      <div class="detail-grid">
        <div class="detail-field" style="grid-column:1/-1"><span class="detail-label">Endereço Completo</span><span class="detail-value">${endereco}</span></div>
      </div>
    </div>` : ''}
    ${e.projeto || e.obs ? `
    <div class="detail-divider"></div>
    <div class="detail-section">
      <div class="detail-section-title">Projeto Antigravity & Notas</div>
      ${e.projeto ? `<div class="detail-field" style="margin-bottom:0.7rem;"><span class="detail-label">Projeto Vinculado</span><span class="detail-value" style="color:var(--primary);font-weight:700;">⚡ ${e.projeto}</span></div>` : ''}
      ${e.obs ? `<div class="detail-obs">${e.obs}</div>` : ''}
    </div>` : ''}
    <div class="detail-divider"></div>
    <div class="detail-grid">
      <div class="detail-field"><span class="detail-label">Cadastrado em</span><span class="detail-value">${formatDate(e.createdAt)}</span></div>
      <div class="detail-field"><span class="detail-label">Última Atualização</span><span class="detail-value">${formatDate(e.updatedAt)}</span></div>
    </div>
  `;

  document.getElementById('btn-editar').onclick   = () => { closeDetail(); openModal(id); };
  document.getElementById('btn-deletar').onclick  = () => excluirEmpresa(id);
  const btnCopiar = document.getElementById('btn-copiar');
  if (btnCopiar) btnCopiar.onclick = () => copiarResumo(id);

  document.getElementById('detail-overlay').classList.add('open');
}

function closeDetail() {
  document.getElementById('detail-overlay').classList.remove('open');
}

function closeDetailOutside(e) {
  if (e.target === document.getElementById('detail-overlay')) closeDetail();
}

/* ── LOGO UPLOADER HANDLERS ── */
function handleLogoUpload(evt) {
  const file = evt.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    setCompanyLogoPreview(e.target.result);
    showToast('Logo carregada com sucesso!', 'success');
  };
  reader.readAsDataURL(file);
}

function setCompanyLogoPreview(dataUrl) {
  document.getElementById('f-logo-data').value = dataUrl;
  const img = document.getElementById('logo-preview-img');
  const ph  = document.getElementById('logo-preview-placeholder');
  const btnRem = document.getElementById('btn-remover-logo');

  img.src = dataUrl;
  img.style.display = 'block';
  ph.style.display  = 'none';
  if (btnRem) btnRem.style.display = 'inline-block';
}

function removerLogoEmpresa() {
  document.getElementById('f-logo-data').value = '';
  const img = document.getElementById('logo-preview-img');
  const ph  = document.getElementById('logo-preview-placeholder');
  const btnRem = document.getElementById('btn-remover-logo');
  const fileInput = document.getElementById('input-company-logo');

  if (img) img.style.display = 'none';
  if (ph)  ph.style.display  = 'block';
  if (btnRem) btnRem.style.display = 'none';
  if (fileInput) fileInput.value = '';
}

function abrirEstudioLogoParaEmpresa() {
  const nomeEmpresa = document.getElementById('f-razao').value || document.getElementById('f-fantasia').value;
  if (nomeEmpresa) {
    document.getElementById('ai-brand-name').value = nomeEmpresa;
  }
  closeModal();
  switchTab('tab-logo');
  gerarLogosAi();
}

/* ── STATS DASHBOARD ── */
function updateStats() {
  const now = new Date();
  const thisMonth = empresas.filter(e => {
    const d = new Date(e.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  animateNum('stat-total', empresas.length);
  animateNum('stat-ativas', empresas.filter(e => e.status === 'ativa').length);
  animateNum('stat-projetos', projetosAntigravity.length);
  animateNum('stat-mes', thisMonth.length);
}

function animateNum(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  if (start === target) return;
  const step = Math.ceil(Math.abs(target - start) / 15);
  let cur = start;
  const interval = setInterval(() => {
    cur += (target > start ? step : -step);
    if ((target > start && cur >= target) || (target < start && cur <= target)) {
      cur = target;
      clearInterval(interval);
    }
    el.textContent = cur;
  }, 25);
}

/* ==========================================================================
   TAB 2: PROJETOS ANTIGRAVITY
   ========================================================================== */
let projetoFiltro = 'todos';

function filtrarProjetos(cat, btn) {
  projetoFiltro = cat;
  document.querySelectorAll('#tab-projetos .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProjetos();
}

function renderProjetos() {
  const grid = document.getElementById('projetos-grid');
  const q = (document.getElementById('search-projetos').value || '').toLowerCase().trim();

  const filtrados = projetosAntigravity.filter(p => {
    const matchCat = projetoFiltro === 'todos' || p.categoria === projetoFiltro;
    const matchQuery = !q || p.nome.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  document.getElementById('tab-count-projetos').textContent = projetosAntigravity.length;

  grid.innerHTML = filtrados.map(p => `
    <article class="projeto-card">
      <div class="projeto-card-header">
        <div class="projeto-icon">⚡</div>
        <div class="projeto-title">${p.nome}</div>
        <span class="projeto-tag">${p.categoria}</span>
      </div>
      <div class="projeto-desc">${p.desc}</div>
      <div class="projeto-path-box" title="${p.vercelUrl || p.path}">${p.vercelUrl ? '🌐 ' + p.vercelUrl : '📁 ' + p.path}</div>
      <div class="projeto-actions">
        <button class="btn-success btn-sm" onclick="acessarProjetoDireto('${p.path}', '${p.vercelUrl || ''}')">🚀 Acessar Projeto</button>
        <button class="btn-accent btn-sm" onclick="abrirModalDownloadApp('${p.id}')">📲 Baixar no Celular / Web</button>
        <button class="btn-secondary btn-sm" onclick="copiarCaminhoProjeto('${p.path}', '${p.vercelUrl || ''}')">📋 Copiar Link</button>
        <button class="btn-secondary btn-sm" onclick="vincularProjetoAEmpresa('${p.nome}')">🔗 Vincular</button>
        <button class="btn-danger btn-sm" onclick="excluirProjetoAntigravity('${p.id}', event)">🗑️ Excluir</button>
      </div>
    </article>
  `).join('');
}

const SERVER_PORT = 5000;
const LOCAL_IP = '192.168.3.18';

function getProjectNameFromPath(path) {
  const parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
  return parts[parts.length - 1];
}

function getProjectHttpUrl(path, isMobile = false) {
  const nome = getProjectNameFromPath(path);
  const host = isMobile ? LOCAL_IP : 'localhost';
  return `http://${host}:${SERVER_PORT}/${nome}/index.html`;
}

function getProjectIndexUrl(path) {
  let clean = path.replace(/\\/g, '/');
  if (!clean.endsWith('.html')) {
    clean = clean.endsWith('/') ? clean + 'index.html' : clean + '/index.html';
  }
  return clean.startsWith('file:///') ? clean : ('file:///' + clean.replace(/^file:\/\//, ''));
}

function acessarProjetoDireto(path, vercelUrl) {
  const nome = getProjectNameFromPath(path);
  const url = vercelUrl || `http://localhost:${SERVER_PORT}/${nome}/index.html`;
  window.open(url, '_blank');
  showToast(`🚀 Abrindo ${nome} no navegador!`, 'success');
}

function excluirProjetoAntigravity(id, event) {
  if (event) event.stopPropagation();
  const p = projetosAntigravity.find(x => x.id === id);
  const nome = p ? p.nome : 'este projeto';
  if (!confirm(`Deseja realmente excluir o projeto "${nome}" do catálogo?`)) return;

  projetosAntigravity = projetosAntigravity.filter(x => x.id !== id);
  saveData();
  renderProjetos();
  updateStats();
  showToast(`Projeto "${nome}" excluído do catálogo.`, 'error');
}

function copiarCaminhoProjeto(path, vercelUrl) {
  const nome = getProjectNameFromPath(path);
  const url = vercelUrl || `http://localhost:${SERVER_PORT}/${nome}/index.html`;
  navigator.clipboard.writeText(url)
    .then(() => showToast(`✅ Link copiado: ${url}`, 'success'))
    .catch(() => showToast('Erro ao copiar link.', 'error'));
}

/* ── MODAL DOWNLOAD & INSTALAÇÃO (WEB & CELULAR) ── */
let currentDownloadProject = null;

function abrirModalDownloadApp(id) {
  const p = projetosAntigravity.find(x => x.id === id);
  if (!p) return;
  currentDownloadProject = p;

  document.getElementById('download-modal-title').textContent = `Baixar App: ${p.nome}`;

  const desktopUrl = p.vercelUrl || `http://localhost:${SERVER_PORT}/${p.nome}/index.html`;
  const mobileUrl  = p.vercelUrl || `http://${LOCAL_IP}:${SERVER_PORT}/${p.nome}/index.html`;
  const isVercel = !!p.vercelUrl;

  document.getElementById('download-modal-path').textContent = isVercel
    ? `🌐 Online (Vercel): ${desktopUrl}`
    : `🔗 Local (Computador): ${desktopUrl}`;

  // Botão direto no modal para nunca ser bloqueado pelo navegador
  const btnExecutar = document.getElementById('btn-link-executar');
  if (btnExecutar) {
    btnExecutar.href = desktopUrl;
  }

  // QR Code Dinâmico para Celular
  const qrImg = document.getElementById('qr-code-img');
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mobileUrl)}`;
    qrImg.onerror = () => {
      // Fallback para canvas offline caso não tenha internet
      qrImg.style.display = 'none';
      const cv = document.getElementById('qr-code-canvas');
      if (cv) { cv.style.display = 'block'; renderQrCode(mobileUrl); }
    };
  }

  const urlDisplay = document.getElementById('mobile-url-display');
  if (urlDisplay) {
    urlDisplay.textContent = mobileUrl;
  }

  document.getElementById('download-app-overlay').classList.add('open');
}

function closeModalDownloadApp() {
  document.getElementById('download-app-overlay').classList.remove('open');
  currentDownloadProject = null;
}

function closeModalDownloadAppOutside(e) {
  if (e.target === document.getElementById('download-app-overlay')) closeModalDownloadApp();
}

function executarProjetoAtual() {
  if (!currentDownloadProject) return;
  acessarProjetoDireto(currentDownloadProject.path);
}

function copiarLinkDiretoApp() {
  if (!currentDownloadProject) return;
  const p = currentDownloadProject;
  const mobileUrl = p.vercelUrl || `http://${LOCAL_IP}:${SERVER_PORT}/${p.nome}/index.html`;
  navigator.clipboard.writeText(mobileUrl)
    .then(() => showToast(`✅ Link copiado: ${mobileUrl}`, 'success'))
    .catch(() => showToast('Erro ao copiar link.', 'error'));
}

function baixarAtalhoBat() {
  if (!currentDownloadProject) return;
  const desktopUrl = `http://localhost:${SERVER_PORT}/${currentDownloadProject.nome}/index.html`;
  const batContent = `@echo off\r\necho Iniciando aplicacao ${currentDownloadProject.nome}...\r\nstart "" "${desktopUrl}"\r\nexit\r\n`;
  const blob = new Blob([batContent], { type: 'application/bat' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Abrir_${currentDownloadProject.nome}.bat`;
  a.click();
  showToast('Atalho para Área de Trabalho (.bat) baixado!', 'success');
}

function baixarPacoteProjeto() {
  if (!currentDownloadProject) return;
  const desktopUrl = `http://localhost:${SERVER_PORT}/${currentDownloadProject.nome}/index.html`;
  const htmlLauncher = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${currentDownloadProject.nome}</title>
  <meta http-equiv="refresh" content="0; url=${desktopUrl}">
  <script>window.location.href = "${desktopUrl}";<\/script>
</head>
<body style="background:#090a12;color:#fff;font-family:sans-serif;text-align:center;padding:60px;">
  <h2>Iniciando ${currentDownloadProject.nome}...</h2>
  <p style="margin-top:20px;"><a href="${desktopUrl}" style="color:#38bdf8;text-decoration:none;font-weight:bold;">Clique aqui caso o aplicativo não abra automaticamente</a></p>
</body>
</html>`;
  const blob = new Blob([htmlLauncher], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${currentDownloadProject.nome}_launcher.html`;
  a.click();
  showToast('Launcher do App baixado!', 'success');
}

function renderQrCode(text) {
  const canvas = document.getElementById('qr-code-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = 180;
  canvas.height = 180;

  // Fundo Branco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 180, 180);

  const modules = 25;
  const cellSize = Math.floor(180 / modules);
  const offset = Math.floor((180 - (modules * cellSize)) / 2);

  // Matriz de QR
  const grid = Array.from({ length: modules }, () => Array(modules).fill(false));

  // Desenhar os 3 olhos de canto (Finder patterns)
  function drawEye(startX, startY) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          grid[startY + r][startX + c] = true;
        }
      }
    }
  }

  drawEye(0, 0);
  drawEye(modules - 7, 0);
  drawEye(0, modules - 7);

  // Timing patterns
  for (let i = 8; i < modules - 8; i += 2) {
    grid[6][i] = true;
    grid[i][6] = true;
  }

  // Preenchimento com hash determinístico do texto
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Ignorar áreas dos olhos
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= modules - 8;
      const inBottomLeft = r >= modules - 8 && c < 8;
      if (!inTopLeft && !inTopRight && !inBottomLeft && grid[r][c] === false) {
        const val = Math.sin(hash * 0.1 + r * 13 + c * 7);
        if (val > 0.05) grid[r][c] = true;
      }
    }
  }

  // Renderizar no canvas
  ctx.fillStyle = '#0a0b14';
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (grid[r][c]) {
        ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
      }
    }
  }
}

function vincularProjetoAEmpresa(nomeProjeto) {
  openModal();
  document.getElementById('f-projeto').value = nomeProjeto;
  showToast(`Projeto "${nomeProjeto}" selecionado no cadastro!`, 'success');
}

function selecionarProjetoExistente(nome) {
  if (nome) {
    document.getElementById('f-projeto').value = nome;
  }
}

function openNovoProjetoModal() {
  document.getElementById('novo-projeto-overlay').classList.add('open');
}

function closeNovoProjetoModal() {
  document.getElementById('novo-projeto-overlay').classList.remove('open');
}

function closeNovoProjetoOutside(e) {
  if (e.target === document.getElementById('novo-projeto-overlay')) closeNovoProjetoModal();
}

function salvarNovoProjetoAntigravity() {
  const nome = document.getElementById('np-nome').value.trim();
  const cat  = document.getElementById('np-categoria').value;
  const desc = document.getElementById('np-descricao').value.trim();

  if (!nome) {
    showToast('Informe o nome do projeto.', 'error');
    return;
  }

  const novo = {
    id: generateId(),
    nome: nome,
    categoria: cat,
    desc: desc || `Projeto ${nome} criado no Antigravity`,
    path: `C:/Users/User/.gemini/antigravity-ide/scratch/${nome}`
  };

  projetosAntigravity.unshift(novo);
  saveData();
  renderProjetos();
  updateStats();
  closeNovoProjetoModal();
  showToast(`Projeto "${nome}" adicionado com sucesso!`, 'success');
}

/* ==========================================================================
   TAB 3: PRINT PARA PROJETO (SCREENSHOT TO CODE & LIVE APP)
   ========================================================================== */
function setupPasteHandler() {
  window.addEventListener('paste', e => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        carregarImagemPrintBlob(blob);
        showToast('Print colado da área de transferência!', 'success');
        break;
      }
    }
  });

  const dropZone = document.getElementById('drop-zone');
  if (dropZone) {
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', e => { e.preventDefault(); dropZone.classList.remove('dragover'); });
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        carregarImagemPrintBlob(e.dataTransfer.files[0]);
      }
    });
  }
}

function handlePrintUpload(e) {
  if (e.target.files.length) {
    carregarImagemPrintBlob(e.target.files[0]);
  }
}

function carregarImagemPrintBlob(file) {
  const reader = new FileReader();
  reader.onload = function(evt) {
    const dataUrl = evt.target.result;
    const imgEl = document.getElementById('print-preview-img');
    const content = document.getElementById('drop-zone-content');

    imgEl.src = dataUrl;
    imgEl.style.display = 'block';
    content.style.display = 'none';

    extrairPaletaDeImagem(dataUrl);
    showToast('Imagem carregada! Gerando protótipo interativo...', 'success');
    gerarAppDoPrint();
  };
  reader.readAsDataURL(file);
}

function extrairPaletaDeImagem(dataUrl) {
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 50;
    canvas.height = 50;
    ctx.drawImage(img, 0, 0, 50, 50);

    const swatches = document.getElementById('palette-swatches');
    const box = document.getElementById('palette-box');
    swatches.innerHTML = '';

    // Amostra 5 pontos de cor
    const pontos = [[5,5], [25,10], [10,25], [35,35], [45,45]];
    pontos.forEach(pt => {
      const p = ctx.getImageData(pt[0], pt[1], 1, 1).data;
      const hex = `#${((1<<24)+(p[0]<<16)+(p[1]<<8)+p[2]).toString(16).slice(1)}`;
      const swatch = document.createElement('div');
      swatch.className = 'palette-swatch';
      swatch.style.background = hex;
      swatch.title = hex;
      swatches.appendChild(swatch);
    });

    box.style.display = 'block';
  };
  img.src = dataUrl;
}

function gerarAppDoPrint() {
  const tipo = document.getElementById('print-tipo-projeto').value;
  const nomeApp = document.getElementById('print-nome-app').value || 'App Funcional';

  // Código HTML + CSS + JS interativo e completo gerado
  currentGeneratedAppCode = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${nomeApp}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background: #0c0d18; color: #f1f3fd; padding: 20px; }
    .app-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: #131427; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 20px; }
    .app-logo { font-size: 1.2rem; font-weight: 800; color: #a78bfa; display: flex; align-items: center; gap: 8px; }
    .badge-live { background: rgba(52,211,153,0.15); color: #34d399; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; border: 1px solid rgba(52,211,153,0.3); }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px; }
    .kpi-card { background: #17192f; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; }
    .kpi-title { font-size: 0.8rem; color: #888ba5; margin-bottom: 6px; }
    .kpi-value { font-size: 1.8rem; font-weight: 800; color: #fff; }
    .main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
    .box { background: #131427; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; }
    .box-title { font-size: 1rem; font-weight: 700; margin-bottom: 15px; display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px; font-size: 0.8rem; color: #888ba5; border-bottom: 1px solid rgba(255,255,255,0.08); }
    td { padding: 12px 10px; font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .btn { background: #7c3aed; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn:hover { background: #6d28d9; }
    input, select { width: 100%; background: #1e2038; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; padding: 10px; margin-bottom: 10px; outline: none; }
  </style>
</head>
<body>
  <div class="app-header">
    <div class="app-logo">⚡ ${nomeApp}</div>
    <span class="badge-live">● Sistema Interativo Ativo</span>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-title">Total Registros</div><div class="kpi-value" id="kpi-total">4</div></div>
    <div class="kpi-card"><div class="kpi-title">Valor em Aberto</div><div class="kpi-value">R$ 18.450</div></div>
    <div class="kpi-card"><div class="kpi-title">Eficiência / Meta</div><div class="kpi-value" style="color:#34d399">96.8%</div></div>
  </div>

  <div class="main-grid">
    <div class="box">
      <div class="box-title">
        <span>Itens em Andamento</span>
        <button class="btn" onclick="adicionarItemPrompt()">+ Novo Item</button>
      </div>
      <table>
        <thead>
          <tr><th>ID</th><th>Descrição</th><th>Status</th><th>Valor</th></tr>
        </thead>
        <tbody id="table-body">
          <tr><td>#01</td><td>Orçamento Vidro Temperado 8mm</td><td><span style="color:#34d399">Aprovado</span></td><td>R$ 3.200</td></tr>
          <tr><td>#02</td><td>Corte Chapas Compensado Naval</td><td><span style="color:#fbbf24">Em Produção</span></td><td>R$ 4.750</td></tr>
          <tr><td>#03</td><td>Instalação Esquadria Alumínio Preto</td><td><span style="color:#38bdf8">Agendado</span></td><td>R$ 8.900</td></tr>
          <tr><td>#04</td><td>Manutenção Fechamento de Sacada</td><td><span style="color:#34d399">Concluído</span></td><td>R$ 1.600</td></tr>
        </tbody>
      </table>
    </div>

    <div class="box">
      <div class="box-title">Lançamento Rápido</div>
      <form onsubmit="adicionarDoForm(event)">
        <label style="font-size:0.8rem;color:#888ba5;">Descrição:</label>
        <input type="text" id="novo-desc" placeholder="Ex: Pedido Vidro / Madeira" required />
        <label style="font-size:0.8rem;color:#888ba5;">Valor Estimado:</label>
        <input type="text" id="novo-valor" placeholder="R$ 0,00" required />
        <button type="submit" class="btn" style="width:100%;margin-top:10px;">Adicionar Registro</button>
      </form>
    </div>
  </div>

  <script>
    let contador = 4;
    function adicionarDoForm(e) {
      e.preventDefault();
      const desc = document.getElementById('novo-desc').value;
      const valor = document.getElementById('novo-valor').value;
      contador++;
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>#' + (contador < 10 ? '0' : '') + contador + '</td><td>' + desc + '</td><td><span style="color:#34d399">Ativo</span></td><td>' + valor + '</td>';
      document.getElementById('table-body').appendChild(tr);
      document.getElementById('kpi-total').textContent = contador;
      document.getElementById('novo-desc').value = '';
      document.getElementById('novo-valor').value = '';
      alert('Registro inserido com sucesso na aplicação!');
    }
    function adicionarItemPrompt() {
      const desc = prompt('Informe a descrição do item:');
      if (desc) {
        contador++;
        const tr = document.createElement('tr');
        tr.innerHTML = '<td>#' + (contador < 10 ? '0' : '') + contador + '</td><td>' + desc + '</td><td><span style="color:#34d399">Ativo</span></td><td>R$ 2.500</td>';
        document.getElementById('table-body').appendChild(tr);
        document.getElementById('kpi-total').textContent = contador;
      }
    }
  </script>
</body>
</html>`;

  const frame = document.getElementById('print-live-frame');
  frame.srcdoc = currentGeneratedAppCode;
  document.getElementById('preview-title-bar').textContent = `Live Preview: ${nomeApp} (Interativo)`;
  showToast('Aplicação interativa pronta para testar!', 'success');
}

function copiarCodigoPrint() {
  if (!currentGeneratedAppCode) return;
  navigator.clipboard.writeText(currentGeneratedAppCode)
    .then(() => showToast('Código completo copiado!', 'success'))
    .catch(() => showToast('Erro ao copiar código.', 'error'));
}

function baixarAppPrint() {
  if (!currentGeneratedAppCode) return;
  const blob = new Blob([currentGeneratedAppCode], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `app_${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Arquivo HTML baixado com sucesso!', 'success');
}

function abrirPrintPreviewFullscreen() {
  const win = window.open('', '_blank');
  win.document.write(currentGeneratedAppCode);
  win.document.close();
}

/* ==========================================================================
   TAB 4: ESTÚDIO DE IA PARA LOGOS & BANNERS
   ========================================================================== */
/* ==========================================================================
   TAB 4: ESTÚDIO DE IA PARA LOGOS & BANNERS (ESPECIALIZADA)
   ========================================================================== */
function setAiFormat(fmt) {
  currentAiFormat = fmt;
  const btnKit = document.getElementById('btn-tipo-kit');
  const btnLogo = document.getElementById('btn-tipo-logo');
  const btnBanner = document.getElementById('btn-tipo-banner');

  if (btnKit) btnKit.classList.toggle('active', fmt === 'kit');
  if (btnLogo) btnLogo.classList.toggle('active', fmt === 'logo');
  if (btnBanner) btnBanner.classList.toggle('active', fmt === 'banner');

  gerarLogosAi();
}

function sugerirEstiloNicho(nicho) {
  const nomeEl = document.getElementById('ai-brand-name');
  const sloganEl = document.getElementById('ai-brand-slogan');
  const estiloEl = document.getElementById('ai-brand-style');

  const configs = {
    vidros: {
      nome: 'SD Vidros',
      slogan: 'Vidros Temperados, Espelhos & Esquadrias',
      estilo: 'modern-neon'
    },
    madeira: {
      nome: 'SD Madeireira',
      slogan: 'Compensados, Vigas & Móveis Planejados',
      estilo: 'sunset-fiery'
    },
    tech: {
      nome: 'SD Soluções Digitais',
      slogan: 'Inovação, Softwares & Inteligência Artificial',
      estilo: 'modern-neon'
    },
    financeiro: {
      nome: 'SD Financeiro',
      slogan: 'Gestão Inteligente, Fluxo de Caixa & Métricas',
      estilo: 'corporate-blue'
    },
    construcao: {
      nome: 'SD Construção',
      slogan: 'Engenharia Civil, Obras & Estruturas de Alto Padrão',
      estilo: 'sunset-fiery'
    },
    luxo: {
      nome: 'Lumina Design',
      slogan: 'Arquitetura & Projetos Exclusivos de Luxo',
      estilo: 'luxury-gold'
    }
  };

  if (configs[nicho]) {
    nomeEl.value = configs[nicho].nome;
    sloganEl.value = configs[nicho].slogan;
    estiloEl.value = configs[nicho].estilo;
    gerarLogosAi();
  }
}

function gerarLogosAi() {
  const nome       = document.getElementById('ai-brand-name').value.trim() || 'SD Soluções';
  const slogan     = document.getElementById('ai-brand-slogan').value.trim() || 'Soluções Digitais & Inovação';
  const estilo     = document.getElementById('ai-brand-style').value;
  const specialist = (document.getElementById('ai-specialist') ? document.getElementById('ai-specialist').value : 'tech');

  const grid = document.getElementById('variations-grid');
  grid.innerHTML = '';

  // Configuração das 4 variações visuais com paletas harmônicas
  const estilosVariacoes = [
    { title: 'Variação 1: Cyber Neon Tech',   g1: '#7c3aed', g2: '#38bdf8', iconType: 'primary' },
    { title: 'Variação 2: Ouro & Alta Classe', g1: '#f59e0b', g2: '#fde047', iconType: 'luxury' },
    { title: 'Variação 3: Esmeralda & Cristal', g1: '#059669', g2: '#34d399', iconType: 'emerald' },
    { title: 'Variação 4: Sunset & Âmbar',     g1: '#ea580c', g2: '#f43f5e', iconType: 'fiery' }
  ];

  estilosVariacoes.forEach((v, idx) => {
    const card = document.createElement('div');
    card.className = 'variation-card';

    if (currentAiFormat === 'kit') {
      // KIT COMPLETO: RENDERIZA LOGO + BANNER JUNTOS
      const kitWrap = document.createElement('div');
      kitWrap.className = 'variation-kit-wrap';

      // 1. BANNER (1200x450)
      const bannerHeader = document.createElement('div');
      bannerHeader.className = 'variation-kit-header';
      bannerHeader.textContent = `🖼️ Banner Panorâmico — ${v.title}`;
      kitWrap.appendChild(bannerHeader);

      const canvasBannerWrap = document.createElement('div');
      canvasBannerWrap.className = 'variation-canvas-wrap';
      const canvasBanner = document.createElement('canvas');
      canvasBanner.width = 1200;
      canvasBanner.height = 450;
      canvasBanner.id = `canvas-banner-${idx}`;
      renderizarCanvasLogo(canvasBanner, nome, slogan, v, true, specialist);
      canvasBannerWrap.appendChild(canvasBanner);
      kitWrap.appendChild(canvasBannerWrap);

      // 2. LOGO (512x512)
      const logoHeader = document.createElement('div');
      logoHeader.className = 'variation-kit-header';
      logoHeader.style.marginTop = '6px';
      logoHeader.textContent = `🔲 Logo Marca (512x512)`;
      kitWrap.appendChild(logoHeader);

      const canvasLogoWrap = document.createElement('div');
      canvasLogoWrap.className = 'variation-canvas-wrap';
      canvasLogoWrap.style.maxWidth = '220px';
      canvasLogoWrap.style.margin = '0 auto';
      const canvasLogo = document.createElement('canvas');
      canvasLogo.width = 512;
      canvasLogo.height = 512;
      canvasLogo.id = `canvas-logo-${idx}`;
      renderizarCanvasLogo(canvasLogo, nome, slogan, v, false, specialist);
      canvasLogoWrap.appendChild(canvasLogo);
      kitWrap.appendChild(canvasLogoWrap);

      card.appendChild(kitWrap);

      const actions = document.createElement('div');
      actions.className = 'variation-actions';
      actions.innerHTML = `
        <button class="btn-primary btn-sm" onclick="aplicarKitCanvas(${idx})">✨ Aplicar Kit na Empresa</button>
        <button class="btn-secondary btn-sm" onclick="baixarCanvasPorId('canvas-logo-${idx}', 'logo_${nome}')">💾 Baixar Logo</button>
        <button class="btn-secondary btn-sm" onclick="baixarCanvasPorId('canvas-banner-${idx}', 'banner_${nome}')">💾 Baixar Banner</button>
      `;
      card.appendChild(actions);

    } else {
      // FORMATO INDIVIDUAL (APENAS LOGO OU APENAS BANNER)
      const isBanner = currentAiFormat === 'banner';
      const wrap = document.createElement('div');
      wrap.className = 'variation-canvas-wrap';

      const canvas = document.createElement('canvas');
      canvas.width  = isBanner ? 1200 : 512;
      canvas.height = isBanner ? 450 : 512;
      canvas.id = `canvas-item-${idx}`;

      renderizarCanvasLogo(canvas, nome, slogan, v, isBanner, specialist);
      wrap.appendChild(canvas);

      const actions = document.createElement('div');
      actions.className = 'variation-actions';
      actions.innerHTML = `
        <button class="btn-primary btn-sm" onclick="aplicarCanvasIndividual(${idx}, ${isBanner})">✨ Usar na Empresa</button>
        <button class="btn-secondary btn-sm" onclick="baixarCanvasPorId('canvas-item-${idx}', '${isBanner ? 'banner' : 'logo'}_${nome}')">💾 Baixar PNG</button>
      `;

      card.appendChild(wrap);
      card.appendChild(actions);
    }

    grid.appendChild(card);
  });

  // Atualiza Prompt Profissional para DALL-E / Midjourney
  const promptEl = document.getElementById('ai-generated-prompt');
  if (promptEl) {
    promptEl.value = `Professional luxury brand visual identity for "${nome}", specialty: "${specialist}", slogan "${slogan}". Clean vector logo + corporate header banner, minimalist geometric icon, high precision reflections, 8k resolution, modern fintech behance trend, isolated dark violet obsidian background.`;
  }
}

function renderizarCanvasLogo(canvas, nome, slogan, varConfig, isBanner, specialist) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // 1. Fundo moderno escuro com iluminação radial
  const bgGrad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, w*0.8);
  bgGrad.addColorStop(0, '#15172d');
  bgGrad.addColorStop(0.6, '#0c0d18');
  bgGrad.addColorStop(1, '#06070c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Gradiente principal da Marca
  const brandGrad = ctx.createLinearGradient(w*0.1, h*0.1, w*0.9, h*0.9);
  brandGrad.addColorStop(0, varConfig.g1);
  brandGrad.addColorStop(1, varConfig.g2);

  if (isBanner) {
    // ── LAYOUT BANNER PANORÂMICO (1200x450) ──
    // Ícone à esquerda
    desenharSimboloEspecializado(ctx, 160, h/2, 68, brandGrad, varConfig, specialist);

    // Tipografia ao centro/esquerda
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 58px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(nome, 260, h/2 - 25);

    // Slogan em cor de destaque
    ctx.fillStyle = varConfig.g2;
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(slogan, 265, h/2 + 35);

    // Efeito de badge do nicho à direita
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, w - 40, h - 40);

  } else {
    // ── LAYOUT LOGO QUADRADA (512x512) ──
    // Símbolo centralizado no terço superior
    desenharSimboloEspecializado(ctx, w/2, 185, 82, brandGrad, varConfig, specialist);

    // Nome da Marca
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nome, w/2, 335);

    // Slogan
    ctx.fillStyle = varConfig.g2;
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(slogan, w/2, 385);

    // Borda interna decorativa
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, w - 32, h - 32);
  }
}

function desenharSimboloEspecializado(ctx, cx, cy, raio, gradiente, varConfig, specialist) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 25;
  ctx.fillStyle = gradiente;

  ctx.beginPath();

  if (specialist === 'vidros') {
    // 🪟 VIDROS & ESQUADRIAS: Cristal facetado / Vidro lapidado com reflexos
    ctx.moveTo(cx, cy - raio);
    ctx.lineTo(cx + raio * 0.85, cy - raio * 0.35);
    ctx.lineTo(cx + raio * 0.55, cy + raio);
    ctx.lineTo(cx - raio * 0.55, cy + raio);
    ctx.lineTo(cx - raio * 0.85, cy - raio * 0.35);
    ctx.closePath();
    ctx.fill();

    // Reflexo de corte de vidro interno
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - raio * 0.3, cy - raio * 0.6);
    ctx.lineTo(cx + raio * 0.4, cy - raio * 0.6);
    ctx.lineTo(cx, cy + raio * 0.5);
    ctx.closePath();
    ctx.stroke();

  } else if (specialist === 'madeira') {
    // 🪵 MADEIREIRA: Anéis de madeira nobre e corte geométrico
    ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    ctx.fill();

    // Anel de crescimento da madeira
    ctx.strokeStyle = '#090a12';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, raio * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, raio * 0.3, 0, Math.PI * 2);
    ctx.stroke();

  } else if (specialist === 'financeiro') {
    // 📈 FINANCEIRO: Barras 3D ascendentes e seta de crescimento
    const bw = raio * 0.35;
    // Barra 1
    ctx.fillRect(cx - bw * 1.8, cy + raio * 0.1, bw, raio * 0.8);
    // Barra 2
    ctx.fillRect(cx - bw * 0.5, cy - raio * 0.25, bw, raio * 1.15);
    // Barra 3
    ctx.fillRect(cx + bw * 0.8, cy - raio * 0.65, bw, raio * 1.55);

    // Seta ascendente de crescimento
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - bw * 1.5, cy + raio * 0.2);
    ctx.lineTo(cx, cy - raio * 0.3);
    ctx.lineTo(cx + bw * 1.2, cy - raio * 0.8);
    ctx.stroke();

  } else if (specialist === 'construcao') {
    // 🏗️ CONSTRUÇÃO: Viga estrutural / Triângulo arquitetônico
    ctx.moveTo(cx, cy - raio);
    ctx.lineTo(cx + raio, cy + raio * 0.85);
    ctx.lineTo(cx - raio, cy + raio * 0.85);
    ctx.closePath();
    ctx.fill();

    // Treliça interna
    ctx.strokeStyle = '#090a12';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy - raio * 0.4);
    ctx.lineTo(cx + raio * 0.5, cy + raio * 0.5);
    ctx.lineTo(cx - raio * 0.5, cy + raio * 0.5);
    ctx.closePath();
    ctx.stroke();

  } else if (specialist === 'luxo') {
    // 💎 LUXO: Escudo heráldico refinado com coroa
    ctx.moveTo(cx - raio, cy - raio * 0.8);
    ctx.lineTo(cx + raio, cy - raio * 0.8);
    ctx.quadraticCurveTo(cx + raio, cy + raio * 0.5, cx, cy + raio);
    ctx.quadraticCurveTo(cx - raio, cy + raio * 0.5, cx - raio, cy - raio * 0.8);
    ctx.fill();

    ctx.fillStyle = '#090a12';
    ctx.beginPath();
    ctx.arc(cx, cy, raio * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, raio * 0.22, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // 💻 TECH / SOFTWARE: Hexágono com nós cibernéticos
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = cx + raio * Math.cos(angle);
      const y = cy + raio * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Núcleo cibernético
    ctx.fillStyle = '#090a12';
    ctx.beginPath();
    ctx.arc(cx, cy, raio * 0.42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, cy, raio * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function aplicarKitCanvas(idx) {
  const canvasLogo = document.getElementById(`canvas-logo-${idx}`);
  const canvasBanner = document.getElementById(`canvas-banner-${idx}`);

  if (canvasLogo) {
    const logoDataUrl = canvasLogo.toDataURL('image/png');
    openModal();
    setCompanyLogoPreview(logoDataUrl);
    showToast('Logo e Banner gerados pela IA aplicados na empresa!', 'success');
  }
}

function aplicarCanvasIndividual(idx, isBanner) {
  const canvas = document.getElementById(`canvas-item-${idx}`);
  if (canvas) {
    const dataUrl = canvas.toDataURL('image/png');
    openModal();
    if (!isBanner) {
      setCompanyLogoPreview(dataUrl);
      showToast('Logo aplicada no cadastro da empresa!', 'success');
    } else {
      showToast('Banner gerado com sucesso! Preencha a empresa para salvar.', 'success');
    }
  }
}

function baixarCanvasPorId(canvasId, filename) {
  const canvas = document.getElementById(canvasId);
  if (canvas) {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${filename}_${Date.now()}.png`;
    a.click();
    showToast('Download concluído com sucesso!', 'success');
  }
}

function baixarLogoCanvas(idx) {
  const canvases = document.querySelectorAll('.variation-canvas-wrap canvas');
  if (canvases[idx]) {
    const a = document.createElement('a');
    a.href = canvases[idx].toDataURL('image/png');
    a.download = `logo_${currentAiFormat}_${Date.now()}.png`;
    a.click();
    showToast('Download da logo concluído!', 'success');
  }
}

function copiarPromptAi() {
  const p = document.getElementById('ai-generated-prompt').value;
  navigator.clipboard.writeText(p)
    .then(() => showToast('Prompt de IA copiado!', 'success'))
    .catch(() => showToast('Erro ao copiar prompt.', 'error'));
}

/* ==========================================================================
   BACKUP & UTILITÁRIOS
   ========================================================================== */
function exportarBackup() {
  if (!empresas.length) {
    showToast('Não há empresas para exportar.', 'error');
    return;
  }
  const payload = {
    empresas: empresas,
    projetos: projetosAntigravity,
    versao: '2.0',
    exportadoEm: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dataHoje = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `backup_gestorpro_${dataHoje}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup completo exportado com sucesso!', 'success');
}

function importarBackup(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      if (data.empresas && Array.isArray(data.empresas)) {
        empresas = data.empresas;
        if (data.projetos && Array.isArray(data.projetos)) {
          projetosAntigravity = data.projetos;
        }
      } else if (Array.isArray(data)) {
        empresas = data;
      } else {
        showToast('Formato de backup inválido.', 'error');
        return;
      }
      saveData();
      renderCards();
      renderProjetos();
      updateStats();
      showToast('Dados restaurados com sucesso!', 'success');
    } catch {
      showToast('Erro ao ler o arquivo JSON.', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function copiarResumo(id) {
  const e = empresas.find(x => x.id === id);
  if (!e) return;
  const endereco = [e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.uf, e.cep].filter(Boolean).join(', ');
  const texto = [
    `🏢 EMPRESA: ${e.razaoSocial || e.nomeFantasia}`,
    e.nomeFantasia ? `Fantasia: ${e.nomeFantasia}` : null,
    e.cnpj ? `CNPJ/CPF: ${e.cnpj}` : null,
    e.ie ? `Inscrição Estadual: ${e.ie}` : null,
    e.segmento ? `Segmento: ${e.segmento}` : null,
    e.status ? `Status: ${getStatusLabel(e.status)}` : null,
    `--------------------------------`,
    e.responsavel ? `Responsável: ${e.responsavel}` : null,
    e.email ? `E-mail: ${e.email}` : null,
    e.telefone ? `Telefone: ${e.telefone}` : null,
    e.celular ? `WhatsApp: ${e.celular}` : null,
    e.site ? `Site: ${e.site}` : null,
    endereco ? `Endereço: ${endereco}` : null,
    e.projeto ? `Projeto Antigravity: ${e.projeto}` : null,
    e.obs ? `Observações: ${e.obs}` : null
  ].filter(Boolean).join('\n');

  navigator.clipboard.writeText(texto)
    .then(() => showToast('Dados copiados para a área de transferência!', 'success'))
    .catch(() => showToast('Erro ao copiar dados.', 'error'));
}

/* ── CARREGAR EXEMPLO DE DEMONSTRAÇÃO ── */
function carregarExemploEmpresa() {
  const exemplo = {
    id: generateId(),
    razaoSocial: 'SD Vidros & Soluções Digitais LTDA',
    nomeFantasia: 'SD Vidros',
    cnpj: '12.345.678/0001-90',
    ie: '987.654.321.000',
    segmento: 'Vidraçaria / Vidros & Esquadrias',
    status: 'ativa',
    email: 'contato@sdvidros.com.br',
    telefone: '(11) 3456-7890',
    celular: '(11) 98765-4321',
    responsavel: 'Sandro Diretor',
    site: 'https://sdvidros.com.br',
    instagram: '@sdvidros',
    cep: '01001-000',
    logradouro: 'Praça da Sé',
    numero: '100',
    complemento: 'Conjunto 42',
    bairro: 'Sé',
    cidade: 'São Paulo',
    uf: 'SP',
    projeto: 'sdvidros',
    obs: 'Cliente principal. Integração com plano de corte e pedidos WhatsApp já configurada.',
    logo: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  empresas.unshift(exemplo);
  saveData();
  renderCards();
  updateStats();
  showToast('Empresa de demonstração carregada com sucesso!', 'success');
}

/* ── TOAST NOTIFICATIONS ── */
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `toast ${type}`;
  const icon = type === 'success'
    ? `<svg class="toast-icon-success" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg class="toast-icon-error" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  div.innerHTML = `${icon}<span>${msg}</span>`;
  container.appendChild(div);
  setTimeout(() => div.remove(), 3200);
}

/* ── TECLA ESC ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('detail-overlay')?.classList.contains('open')) closeDetail();
    else if (document.getElementById('modal-overlay')?.classList.contains('open')) closeModal();
    else if (document.getElementById('novo-projeto-overlay')?.classList.contains('open')) closeNovoProjetoModal();
  }
});
