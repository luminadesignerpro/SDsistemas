# GestorPro — Cadastro e Gestão de Empresas & Projetos

Aplicativo web completo, rápido e responsivo para cadastrar empresas e gerenciar projetos, salvando todos os dados localmente no navegador (sem necessidade de banco de dados externo ou servidor).

## 🚀 Como Abrir o Aplicativo

Basta dar um duplo clique no arquivo **`index.html`** para abrir no seu navegador preferido (Google Chrome, Edge, Firefox, Brave, etc.), ou abrir o caminho:
`C:\Users\User\.gemini\antigravity-ide\scratch\projeto-empresas\index.html`

---

## ✨ Funcionalidades Principais

### 1. 🏢 Cadastro Completo de Empresas & Projetos
- **Dados da Empresa**:
  - Razão Social (obrigatório)
  - Nome Fantasia
  - CNPJ / CPF (com máscara automática)
  - Inscrição Estadual
  - Segmento / Ramo de atividade (Tecnologia, Comércio, Indústria, Vidraçaria, etc.)
  - Status (Ativa, Inativa, Prospect)
- **Contato**:
  - E-mail comercial (obrigatório e validado)
  - Telefone fixo (com máscara)
  - Celular / WhatsApp (com máscara e link direto para conversa no WhatsApp)
  - Nome do Responsável / Contato
  - Site e Instagram
- **Endereço Completo**:
  - CEP com **busca automática pelo ViaCEP** (preenche rua, bairro, cidade e UF automaticamente)
  - Logradouro, Número, Complemento, Bairro, Cidade e UF
- **Projeto & Observações**:
  - Nome do Projeto vinculado
  - Observações gerais e histórico

### 2. 💾 Armazenamento & Persistência
- Todos os dados são salvos em tempo real no `localStorage` do seu navegador.
- Os dados continuam salvos mesmo se você fechar a janela ou reiniciar o computador.

### 3. 🔍 Filtros & Busca Instantânea
- Pesquisa em tempo real por qualquer termo: Razão Social, Fantasia, CNPJ, Cidade, E-mail ou Segmento.
- Abas de filtro rápido: *Todas*, *Ativas*, *Inativas* e *Prospects*.

### 4. 📊 Dashboard & Métricas
- Contadores animados no topo: Total de Empresas, Empresas Ativas e Cadastros no mês atual.

### 5. 📦 Exportação & Backup
- **Exportar Backup**: Baixa um arquivo `.json` com todos os cadastros com 1 clique.
- **Importar Backup**: Permite restaurar seus dados em outro computador ou navegador.
- **Copiar Dados**: Copia a ficha da empresa já formatada para colar no WhatsApp ou relatórios.
- **Imprimir / Salvar em PDF**: Ficha da empresa otimizada para impressão física ou PDF.

---

## 📁 Estrutura dos Arquivos

- `index.html` — Estrutura semântica e acessível da aplicação.
- `style.css` — Design system moderno em Dark Mode com glassmorphism, tipografia Inter e micro-interações.
- `app.js` — Lógica do CRUD, persistência, máscaras de formulário, integração ViaCEP e utilitários.
