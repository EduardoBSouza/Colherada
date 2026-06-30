# 🏗️ ARQUITETURA DO SISTEMA COLHERADA
## Sistema Multi-Página com Sidebar de Navegação

---

## 📐 ESTRUTURA VISUAL (Wireframe)

### Layout Geral
```
┌─────────────────────────────────────────────────────────────┐
│                    COLHERADA - SISTEMA DE GESTÃO              │
├─────────────────────────────────────────────────────────────┤
│         │                                                      │
│         │                                                      │
│  🍮     │  ┌─────────────────────────────────────────────┐  │
│  MENU   │  │  📊 Dashboard Principal                      │  │
│         │  │                                               │  │
│         │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │  │
│ ┌─────┐ │  │  │📦 25 │ │💰 R$ │ │📈 R$ │ │📝  3 │        │  │
│ │📊   │ │  │  │Estoque│ │ 150  │ │ 90   │ │Encom.│        │  │
│ │Dash │ │  │  └──────┘ └──────┘ └──────┘ └──────┘        │  │
│ └─────┘ │  │                                               │  │
│         │  │  ⚠️ Estoque crítico! Apenas 25 pudins        │  │
│ ┌─────┐ │  │                                               │  │
│ │💳   │ │  │  📋 Últimas Vendas                           │  │
│ │Venda│ │  │  ┌───────────────────────────────────────┐  │  │
│ └─────┘ │  │  │ 14:30 │ 5 pudins │ PIX  │ R$ 50,00 │  │  │
│         │  │  │ 13:15 │ 2 pudins │ Dinh.│ R$ 20,00 │  │  │
│ ┌─────┐ │  │  └───────────────────────────────────────┘  │  │
│ │📦   │ │  │                                               │  │
│ │Estoq│ │  │  ⏰ Encomendas Urgentes                      │  │
│ └─────┘ │  │  • Hoje: Maria - 10 pudins                   │  │
│         │  │  • Amanhã: João - 5 pudins                   │  │
│ ┌─────┐ │  └──────────────────────────────────────────────┘  │
│ │📝   │ │                                                      │
│ │Encom│ │                                                      │
│ └─────┘ │                                                      │
│         │                                                      │
│ ┌─────┐ │                                                      │
│ │💰   │ │                                                      │
│ │Finan│ │                                                      │
│ └─────┘ │                                                      │
│         │                                                      │
│ ┌─────┐ │                                                      │
│ │📖   │ │                                                      │
│ │Recei│ │                                                      │
│ └─────┘ │                                                      │
│         │                                                      │
│ ┌─────┐ │                                                      │
│ │📈   │ │                                                      │
│ │Relat│ │                                                      │
│ └─────┘ │                                                      │
│         │                                                      │
│ ┌─────┐ │                                                      │
│ │🚪   │ │                                                      │
│ │ Sair│ │                                                      │
│ └─────┘ │                                                      │
└─────────┴──────────────────────────────────────────────────────┘
```

---

## 📱 ESTRUTURA DE NAVEGAÇÃO

### Sistema de Páginas

```
index.html (Login)
      ↓
      ↓ [Autenticação]
      ↓
dashboard.html ──┐
                  ├─→ vendas.html
                  ├─→ estoque.html
                  ├─→ encomendas.html
                  ├─→ financeiro.html
                  ├─→ receitas.html
                  └─→ relatorios.html
```

---

## 🎨 PÁGINAS DETALHADAS

### 1️⃣ **Dashboard Principal** (dashboard.html)
**Objetivo:** Visão geral rápida do dia

**Seções:**
```
┌─────────────────────────────────────┐
│ 📊 Dashboard                         │
├─────────────────────────────────────┤
│                                      │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│ │📦 25 │ │💰 150│ │📈 90 │ │📝  3 ││
│ └──────┘ └──────┘ └──────┘ └──────┘│
│                                      │
│ 🚨 Alertas:                         │
│ • Estoque crítico                   │
│ • 2 encomendas para hoje            │
│                                      │
│ 💳 Últimas 5 Vendas                 │
│ [Tabela de vendas]                  │
│                                      │
│ ⏰ Encomendas Urgentes (3 dias)     │
│ [Lista de encomendas]               │
└─────────────────────────────────────┘
```

---

### 2️⃣ **Vendas** (vendas.html)
**Objetivo:** Registrar vendas rapidamente

**Seções:**
```
┌─────────────────────────────────────┐
│ 💳 Registrar Venda                  │
├─────────────────────────────────────┤
│                                      │
│ 📊 Resumo Rápido:                   │
│ Estoque: 25 | Vendas: 12 | R$ 150  │
│                                      │
│ ➕ Nova Venda:                      │
│ ┌─────────────┬─────────────────┐  │
│ │ Quantidade: │ Valor Unitário: │  │
│ │     [5]     │    [R$ 10,00]   │  │
│ └─────────────┴─────────────────┘  │
│                                      │
│ 💰 Total: R$ 50,00                  │
│                                      │
│ ┌────────┐ ┌──────────┐ ┌────────┐│
│ │  💳    │ │   💵     │ │  💳    ││
│ │  PIX   │ │ Dinheiro │ │ Cartão ││
│ └────────┘ └──────────┘ └────────┘│
│                                      │
│ 📋 Histórico do Dia:                │
│ [Tabela completa de vendas]         │
│                                      │
│ Total: 12 vendas | 48 pudins | R$150│
└─────────────────────────────────────┘
```

---

### 3️⃣ **Estoque** (estoque.html)
**Objetivo:** Controlar entrada e saída de produtos

**Seções:**
```
┌─────────────────────────────────────┐
│ 📦 Gestão de Estoque                │
├─────────────────────────────────────┤
│                                      │
│ 📊 Status Atual:                    │
│ • Pudins Prontos: 25                │
│ • Alerta: Estoque Crítico!          │
│                                      │
│ ➕ Abastecer Estoque:               │
│ ┌─────────────┐                     │
│ │ Quantidade: │                     │
│ │    [20]     │                     │
│ └─────────────┘                     │
│ [Botão: ✅ Adicionar]               │
│                                      │
│ ➖ Remover do Estoque:              │
│ ┌─────────────┐                     │
│ │ Quantidade: │                     │
│ │     [3]     │                     │
│ └─────────────┘                     │
│ [Botão: ❌ Remover]                 │
│                                      │
│ 📊 Histórico de Movimentações:      │
│ [Tabela de entrada/saída]           │
│                                      │
│ 💡 Ingredientes & Matérias-Primas:  │
│ [Controle de ingredientes]          │
└─────────────────────────────────────┘
```

---

### 4️⃣ **Encomendas** (encomendas.html)
**Objetivo:** Agendar e gerenciar pedidos futuros

**Seções:**
```
┌─────────────────────────────────────┐
│ 📝 Gestão de Encomendas             │
├─────────────────────────────────────┤
│                                      │
│ 📅 Calendário de Encomendas         │
│ [Visualização de calendário]        │
│                                      │
│ ➕ Nova Encomenda:                  │
│ ┌─────────┬─────────┬──────┐       │
│ │ Cliente │ Quant.  │ Data │       │
│ │ [Maria] │  [10]   │[...]│       │
│ └─────────┴─────────┴──────┘       │
│ Telefone: [(11) 98765-4321]         │
│ [Botão: ✅ Cadastrar]               │
│                                      │
│ 📋 Encomendas Pendentes:            │
│                                      │
│ 🔴 URGENTE - HOJE:                  │
│ • Maria - 10 pudins - 11:00         │
│   [✅ Concluir] [❌ Cancelar]       │
│                                      │
│ 🟡 Próximos 3 dias:                 │
│ • João - 5 pudins - 25/06           │
│ • Ana - 15 pudins - 27/06           │
│                                      │
│ 📊 Estatísticas:                    │
│ • Pendentes: 5                      │
│ • Concluídas (mês): 23              │
└─────────────────────────────────────┘
```

---

### 5️⃣ **Financeiro** (financeiro.html)
**Objetivo:** Análise completa de receitas e lucros

**Seções:**
```
┌─────────────────────────────────────┐
│ 💰 Financeiro                       │
├─────────────────────────────────────┤
│                                      │
│ 📊 Resumo do Dia:                   │
│ ┌────────────┬───────────┬────────┐│
│ │ Faturamento│   Custos  │ Lucro  ││
│ │  R$ 150,00 │ R$ 60,00  │ R$90,00││
│ └────────────┴───────────┴────────┘│
│                                      │
│ 💳 Vendas por Pagamento:            │
│ • PIX: R$ 80,00 (53%)               │
│ • Dinheiro: R$ 50,00 (33%)          │
│ • Cartão: R$ 20,00 (14%)            │
│                                      │
│ 📈 Evolução Mensal:                 │
│ [Gráfico de barras]                 │
│                                      │
│ 💰 Configurações:                   │
│ • Valor Unitário: R$ 10,00          │
│ • Custo Unitário: R$ 4,00           │
│ • Margem de Lucro: 60%              │
│                                      │
│ 📊 Resumo do Mês:                   │
│ • Faturamento: R$ 3.450,00          │
│ • Lucro: R$ 2.070,00                │
│ • Pudins Vendidos: 345              │
└─────────────────────────────────────┘
```

---

### 6️⃣ **Receitas** (receitas.html)
**Objetivo:** Anotações de receitas e proporções

**Seções:**
```
┌─────────────────────────────────────┐
│ 📖 Receitas                         │
├─────────────────────────────────────┤
│                                      │
│ 📝 Minhas Anotações:                │
│                                      │
│ Título: [Pudim de Leite Condensado] │
│                                      │
│ ┌────────────────────────────────┐ │
│ │ INGREDIENTES:                   │ │
│ │ • 1 lata de leite condensado    │ │
│ │ • 2 latas de leite              │ │
│ │ • 3 ovos                        │ │
│ │ • 1 xícara de açúcar (calda)    │ │
│ │                                 │ │
│ │ MODO DE PREPARO:                │ │
│ │ 1. Fazer a calda...             │ │
│ │ 2. Bater os ingredientes...     │ │
│ │ 3. Assar em banho-maria...      │ │
│ │                                 │ │
│ │ DICAS:                          │ │
│ │ • Temperatura do forno: 180°C   │ │
│ │ • Tempo: 60-70 minutos          │ │
│ └────────────────────────────────┘ │
│                                      │
│ [Botão: 💾 Salvar]                  │
│                                      │
│ 📊 Cálculo de Proporções:           │
│ Para 10 pudins, você precisa:       │
│ • 10 latas de leite condensado      │
│ • 20 latas de leite                 │
│ • 30 ovos                           │
└─────────────────────────────────────┘
```

---

### 7️⃣ **Relatórios** (relatorios.html)
**Objetivo:** Análises e gráficos de desempenho

**Seções:**
```
┌─────────────────────────────────────┐
│ 📈 Relatórios e Análises            │
├─────────────────────────────────────┤
│                                      │
│ 📅 Período:                         │
│ De: [01/06/2026] Até: [29/06/2026]  │
│ [Botão: 📊 Gerar Relatório]         │
│                                      │
│ 📊 Resumo Geral:                    │
│ • Total de Vendas: 345              │
│ • Faturamento: R$ 3.450,00          │
│ • Lucro: R$ 2.070,00                │
│ • Ticket Médio: R$ 10,00            │
│                                      │
│ 📈 Crescimento:                     │
│ [Gráfico de linhas mensal]          │
│                                      │
│ 🏆 Produtos Mais Vendidos:          │
│ 1. Pudim Tradicional - 345 un.      │
│                                      │
│ 📅 Melhor Dia:                      │
│ 15/06 - 28 vendas - R$ 280,00       │
│                                      │
│ 💳 Formas de Pagamento:             │
│ [Gráfico de pizza]                  │
│ PIX: 60% | Dinheiro: 30% | Cartão:10%│
│                                      │
│ 📥 Exportar:                        │
│ [PDF] [Excel] [Imprimir]            │
└─────────────────────────────────────┘
```

---

## 🗂️ ESTRUTURA DE ARQUIVOS

```
d:\Controle de Vendas\
│
├── index.html              # Página de login
├── dashboard.html          # Dashboard principal
├── vendas.html             # Gestão de vendas
├── estoque.html            # Controle de estoque
├── encomendas.html         # Encomendas
├── financeiro.html         # Análise financeira
├── receitas.html           # Receitas
├── relatorios.html         # Relatórios
│
├── styles/
│   ├── main.css            # Estilos globais + sidebar
│   ├── dashboard.css       # Estilos do dashboard
│   ├── vendas.css          # Estilos de vendas
│   ├── estoque.css         # Estilos de estoque
│   ├── encomendas.css      # Estilos de encomendas
│   ├── financeiro.css      # Estilos financeiro
│   ├── receitas.css        # Estilos de receitas
│   └── relatorios.css      # Estilos de relatórios
│
├── scripts/
│   ├── auth.js             # Autenticação
│   ├── api.js              # Comunicação com backend
│   ├── sidebar.js          # Controle da sidebar
│   ├── dashboard.js        # Lógica do dashboard
│   ├── vendas.js           # Lógica de vendas
│   ├── estoque.js          # Lógica de estoque
│   ├── encomendas.js       # Lógica de encomendas
│   ├── financeiro.js       # Lógica financeira
│   ├── receitas.js         # Lógica de receitas
│   └── relatorios.js       # Lógica de relatórios
│
├── app.py                  # Backend Flask (já existe)
├── servidor.py             # Servidor alternativo
├── requirements.txt        # Dependências Python
└── render.yaml             # Configuração de deploy
```

---

## 🎯 FLUXO DE NAVEGAÇÃO

```
          ┌─────────────┐
          │   LOGIN     │
          │ index.html  │
          └──────┬──────┘
                 │
         [Autenticação]
                 │
                 ↓
          ┌─────────────┐
     ┌────│  DASHBOARD  │────┐
     │    │ dashboard   │    │
     │    └─────────────┘    │
     │                       │
┌────┴────┐           ┌─────┴─────┐
│ VENDAS  │           │  ESTOQUE  │
│ vendas  │           │  estoque  │
└────┬────┘           └─────┬─────┘
     │                      │
┌────┴────────┐      ┌─────┴──────┐
│ ENCOMENDAS  │      │ FINANCEIRO │
│ encomendas  │      │ financeiro │
└────┬────────┘      └─────┬──────┘
     │                      │
┌────┴────────┐      ┌─────┴──────┐
│  RECEITAS   │      │ RELATÓRIOS │
│  receitas   │      │ relatorios │
└─────────────┘      └────────────┘
```

---

## 📱 RESPONSIVIDADE

### Desktop (> 768px)
```
┌─────────┬──────────────────────────┐
│         │                          │
│ SIDEBAR │    CONTEÚDO PRINCIPAL    │
│  260px  │      (flex width)        │
│         │                          │
│  FIXA   │      ROLÁVEL             │
│         │                          │
└─────────┴──────────────────────────┘
```

### Mobile (≤ 768px)
```
┌──────────────────────────────────┐
│  ☰ [Toggle Button]               │
├──────────────────────────────────┤
│                                  │
│     CONTEÚDO PRINCIPAL           │
│     (largura total)              │
│                                  │
│                                  │
└──────────────────────────────────┘

[Sidebar aparece em overlay ao clicar no ☰]
```

---

## 🔐 FLUXO DE AUTENTICAÇÃO

```
1. Usuário acessa index.html
2. Digita: usuário = "NNK" | senha = "pudimcolherada"
3. Backend valida credenciais
4. Token salvo em sessionStorage
5. Redirecionamento para dashboard.html
6. Todas as páginas verificam token ao carregar
7. Se não autenticado → redirect para index.html
```

---

## ⚙️ COMUNICAÇÃO COM BACKEND

```
┌─────────────┐         ┌─────────────┐
│   Frontend  │         │   Backend   │
│  (HTML/JS)  │ ←────→  │  (Flask)    │
└─────────────┘         └─────────────┘
                              │
                              ↓
                        ┌──────────┐
                        │ SQLite   │
                        │   DB     │
                        └──────────┘

APIs Disponíveis:
• GET  /api/dados
• POST /api/venda
• POST /api/abastecer
• POST /api/remover_estoque
• POST /api/encomenda
• POST /api/concluir_encomenda
• POST /api/cancelar_encomenda
• POST /api/relatorio
• POST /api/fechar_caixa
• POST /api/salvar_receita
• GET  /api/receita
```

---

## 🎨 PALETA DE CORES

```
Marrom Principal:    #8B4513  ████
Marrom Secundário:   #D2691E  ████
Dourado:             #DAA520  ████
Fundo:               #F5F5F0  ████
Branco (Cards):      #FFFFFF  ████

PIX (Verde):         #00C853  ████
Dinheiro (Azul):     #2196F3  ████
Cartão (Roxo):       #9C27B0  ████
Alerta (Amarelo):    #FFC107  ████
Sucesso (Verde):     #4CAF50  ████
Perigo (Vermelho):   #F44336  ████
```

---

## ✅ VANTAGENS DESTA ARQUITETURA

1. **Organização:** Cada funcionalidade em sua própria página
2. **Performance:** Carrega apenas o necessário
3. **Manutenção:** Código modular e fácil de atualizar
4. **Usabilidade:** Navegação intuitiva com sidebar
5. **Responsivo:** Funciona perfeitamente em mobile e desktop
6. **Escalável:** Fácil adicionar novas páginas
7. **Profissional:** Interface moderna e limpa
8. **Rápido:** Transições suaves entre páginas

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Criar páginas restantes (estoque, encomendas, financeiro, receitas, relatórios)
2. ✅ Implementar lógica JavaScript para cada página
3. ✅ Conectar com o backend existente (app.py)
4. ✅ Testar autenticação e navegação
5. ✅ Otimizar para mobile
6. ✅ Deploy no Render.com

---

**Desenvolvido para Colherada 🍮**  
*Sistema profissional de gestão de vendas*
