# 📚 COMO USAR O SISTEMA COLHERADA - GUIA COMPLETO

## 🎯 O QUE É O COLHERADA?

O Colherada é um sistema para gerenciar sua fábrica de pudins. Ele controla:
- 📦 Quanto pudim você tem no estoque
- 💰 Quanto dinheiro você ganhou
- 📝 Encomendas dos clientes
- 📊 Relatórios de vendas

---

## 🍮 1. DASHBOARD (PAINEL PRINCIPAL)

### O que é?
É a primeira tela que você vê após fazer login. Mostra um resumo de tudo.

### O que mostra?
- Quanto pudim tem no estoque AGORA
- Quanto você faturou HOJE
- Quanto você lucrou HOJE
- Quantas encomendas estão pendentes

### Exemplo prático:
```
📦 Estoque Atual: 15 pudins
💰 Faturamento Hoje: R$ 150,00
💵 Lucro Hoje: R$ 75,00
📝 Encomendas Pendentes: 3
```

### Quando usar?
- Ao começar o dia de trabalho
- Para ter uma visão rápida do negócio
- Para ver se precisa produzir mais pudins

---

## 💳 2. VENDAS

### O que é?
Página para registrar quando você vende pudins.

### Como funciona?

#### Passo 1: Digite a quantidade
```
Quantidade: [5]  ← Digite quantos pudins vendeu
```

#### Passo 2: Escolha o pagamento
Clique em um dos 3 botões grandes:
- **PIX** → Cliente pagou por PIX
- **DINHEIRO** → Cliente pagou em dinheiro
- **CARTÃO** → Cliente pagou no cartão

#### Passo 3: Pronto!
O sistema automaticamente:
- Remove 5 pudins do estoque
- Adiciona o dinheiro ao faturamento
- Registra a venda no histórico

### Exemplo real:
```
Cliente comprou 5 pudins e pagou R$ 50,00 no PIX
↓
Você digita: 5
Você clica: PIX
↓
Sistema faz:
- Estoque: 20 → 15 pudins
- Faturamento: R$ 100 → R$ 150
- Cria registro: "5 pudins - PIX - R$ 50,00 - 14:30"
```

### Cálculos automáticos:
- Se cada pudim custa R$ 10
- 5 pudins = R$ 50,00
- Sistema calcula sozinho!

### Histórico de vendas:
Mostra todas as vendas do dia:
```
14:30 | 5 pudins | PIX      | R$ 50,00
13:15 | 3 pudins | Dinheiro | R$ 30,00
10:20 | 2 pudins | Cartão   | R$ 20,00
```

---

## 📦 3. ESTOQUE

### O que é?
Página para controlar quantos pudins você tem.

### Funcionalidades:

#### 🟢 ABASTECER (Produzir)
Quando você FAZ mais pudins.

**Exemplo:**
```
Você produziu 20 pudins novos
↓
Digite: 20
Clique: "Adicionar ao Estoque"
↓
Estoque: 15 → 35 pudins
```

#### 🔴 REMOVER (Perda/Consumo)
Quando algum pudim estraga, você doa, ou consome.

**Exemplo:**
```
2 pudins estragaram
↓
Digite: 2
Motivo: "Estragou"
Clique: "Remover do Estoque"
↓
Estoque: 35 → 33 pudins
```

#### 💡 PREVISÃO DE PRODUÇÃO
O sistema sugere quantos pudins fazer.

**Como funciona:**
```
Sistema analisa:
- Você vende em média 15 pudins por dia
- Tem 3 encomendas que precisam de 12 pudins
- Tem apenas 10 no estoque

Sistema sugere: "Produza 20 pudins"
```

#### 🚨 ALERTAS
O sistema avisa quando o estoque está baixo:
- **CRÍTICO** (vermelho) → ≤ 5 pudins
- **BAIXO** (amarelo) → ≤ 10 pudins
- **BOM** (verde) → > 10 pudins

---

## 📝 4. ENCOMENDAS

### O que é?
Página para gerenciar pedidos futuros dos clientes.

### Como cadastrar uma encomenda?

#### Exemplo prático:
```
Cliente: Maria Silva liga e diz:
"Quero 10 pudins para sábado"

Você preenche:
┌─────────────────────────────┐
│ Cliente: Maria Silva        │
│ Telefone: (11) 98765-4321   │
│ Quantidade: 10              │
│ Data entrega: 01/07/2026    │
│                             │
│ [Cadastrar Encomenda]       │
└─────────────────────────────┘
```

### O sistema mostra as encomendas em 3 grupos:

#### 🔴 URGENTES (Para hoje)
```
┌──────────────────────────────┐
│ 🚨 URGENTE - Entregar HOJE!  │
│ Maria Silva                  │
│ 📞 (11) 98765-4321           │
│ 📦 10 pudins                 │
│ [✓ Concluir] [✗ Cancelar]   │
└──────────────────────────────┘
```

#### 🟡 PRÓXIMAS (3 dias)
```
┌──────────────────────────────┐
│ ⚠️ Faltam 2 dias             │
│ João Santos                  │
│ 📞 (11) 91234-5678           │
│ 📦 5 pudins                  │
│ 📅 03/07/2026                │
│ [✓ Concluir] [✗ Cancelar]   │
└──────────────────────────────┘
```

#### ⚪ TODAS AS PENDENTES
Lista completa de todas as encomendas.

### Quando entregar:
1. Localize a encomenda
2. Clique em **"✓ Concluir"**
3. Sistema confirma: "Tem certeza?"
4. Clique "OK"
5. Pronto! Encomenda marcada como entregue

### Se o cliente cancelar:
1. Clique em **"✗ Cancelar"**
2. Encomenda fica marcada como cancelada

---

## 💰 5. FINANCEIRO

### O que é?
Página para ver quanto você está ganhando e configurar preços.

### O que mostra?

#### Resumo do dia:
```
┌─────────────────────────────┐
│ Faturamento: R$ 200,00      │
│ Custos: R$ 80,00            │
│ Lucro: R$ 120,00            │
│ Margem: 60%                 │
└─────────────────────────────┘
```

#### Vendas por forma de pagamento:
```
PIX ████████████████ 60% | R$ 120,00 | 12 vendas
Dinheiro ████████ 30% | R$ 60,00 | 6 vendas
Cartão ████ 10% | R$ 20,00 | 2 vendas
```

### Configurar valores:

#### Exemplo:
```
┌────────────────────────────────┐
│ Valor de Venda: R$ 10,00       │
│ Custo Unitário: R$ 4,00        │
│ Margem de Lucro: 60%           │ ← Calculado automaticamente
│                                │
│ [Salvar Configurações]         │
└────────────────────────────────┘
```

**Como usar:**
1. Digite quanto você vende cada pudim
2. Digite quanto custa fazer cada pudim
3. Sistema calcula a margem de lucro sozinho
4. Clique em "Salvar"

#### Exemplo de cálculo:
```
Venda: R$ 10,00
Custo: R$ 4,00
Lucro: R$ 6,00
Margem: 60% (R$ 6 ÷ R$ 10 × 100)
```

### Resumo do mês:
Mostra tudo que aconteceu no mês inteiro:
```
Julho/2026
- Total vendido: 450 pudins
- Faturamento: R$ 4.500,00
- Lucro: R$ 2.700,00
```

---

## 📖 6. RECEITAS

### O que é?
Lugar para anotar sua receita de pudim e calcular ingredientes.

### Como usar:

#### Salvar sua receita:
```
┌────────────────────────────────┐
│ Título: Pudim Tradicional      │
│                                │
│ Conteúdo:                      │
│ Ingredientes:                  │
│ - 1 leite condensado           │
│ - 2 latas de leite             │
│ - 3 ovos                       │
│ - 1 xícara de açúcar           │
│                                │
│ Modo de preparo:               │
│ 1. Bata tudo no liquidificador │
│ 2. Despeje na forma            │
│ 3. Asse em banho maria         │
│                                │
│ [💾 Salvar] (ou Ctrl+S)        │
└────────────────────────────────┘
```

### Calculadora de ingredientes:

#### Exemplo:
```
Sua receita base faz 1 pudim
Você quer fazer 10 pudins

Sistema calcula:
┌────────────────────────────────┐
│ Para fazer 10 pudins:          │
│                                │
│ ✓ 10 latas leite condensado    │
│ ✓ 20 latas de leite            │
│ ✓ 30 ovos                      │
│ ✓ 10 xícaras de açúcar         │
└────────────────────────────────┘
```

**Como usar:**
1. Digite quantos pudins quer fazer
2. Sistema multiplica os ingredientes automaticamente

### Dicas de produção:
O sistema dá dicas úteis:
- Temperatura ideal do forno
- Tempo de cozimento
- Como armazenar
- Como desenformar

---

## 📊 7. RELATÓRIOS

### O que é?
Página para ver análises detalhadas das vendas.

### Períodos rápidos:

#### Botões de atalho:
```
[Hoje] [Esta Semana] [Este Mês] [Este Ano]
```

**Exemplo:**
- Clica em "Este Mês"
- Sistema mostra tudo de julho/2026

### Período personalizado:

#### Exemplo:
```
┌────────────────────────────────┐
│ De: [01/06/2026]               │
│ Até: [30/06/2026]              │
│                                │
│ [Gerar Relatório]              │
└────────────────────────────────┘
```

Mostra tudo entre 1º e 30 de junho.

### O que o relatório mostra:

#### Resumo geral:
```
Período: 01/06 a 30/06

┌────────────────────────────────┐
│ Faturamento: R$ 3.000,00       │
│ Lucro: R$ 1.800,00             │
│ Quantidade: 300 pudins         │
│ Total vendas: 50 transações    │
│ Ticket médio: R$ 60,00         │
│ Margem: 60%                    │
└────────────────────────────────┘
```

#### Gráfico de crescimento:
```
Vendas por semana:
Semana 1 ████████ 60 pudins
Semana 2 ████████████ 80 pudins
Semana 3 ████████████████ 100 pudins
Semana 4 ████████████ 60 pudins
```

#### Melhor dia:
```
🏆 DIA COM MAIS VENDAS

15/06/2026 (Sábado)
25 pudins vendidos
R$ 250,00 em vendas
```

#### Detalhamento de vendas:
Lista TODAS as vendas do período:
```
30/06 14:30 | 5 pudins | PIX      | R$ 50,00
30/06 10:15 | 3 pudins | Dinheiro | R$ 30,00
29/06 16:45 | 2 pudins | Cartão   | R$ 20,00
... (continua)
```

### Exportar relatório:

#### 3 opções:
```
[📄 Exportar PDF] [📊 Exportar Excel] [🖨️ Imprimir]
```

**Quando usar:**
- PDF: Para enviar por WhatsApp
- Excel: Para fazer análises no computador
- Imprimir: Para arquivo físico

---

## 🔑 8. LOGIN E SEGURANÇA

### Por que tem login?
Para proteger seus dados! Só quem sabe a senha pode entrar.

### Credenciais padrão:
```
Usuário: NNK
Senha: pudimcolherada
```

### Como funciona?
```
1. Você abre: http://localhost:5000
2. Digita usuário e senha
3. Clica em "Entrar"
4. Sistema verifica se está correto
5. Se estiver certo → Vai para Dashboard
   Se estiver errado → Mostra erro
```

### Sair do sistema:
1. Clique em "Sair" (no canto superior)
2. Volta para tela de login
3. Precisa digitar senha novamente para entrar

---

## 💡 EXEMPLOS DE USO DO DIA A DIA

### 📅 SEGUNDA-FEIRA (Dia de produção)

#### 8h - Chega na cozinha
```
1. Abre navegador → http://localhost:5000
2. Login: NNK / pudimcolherada
3. Dashboard mostra:
   - Estoque: 5 pudins (CRÍTICO!)
   - Encomendas pendentes: 3 (total 15 pudins)
```

#### 9h - Produzir
```
1. Vai em ESTOQUE
2. Vê previsão: "Produza 25 pudins"
3. Faz 25 pudins
4. Digita: 25
5. Clica: "Adicionar ao Estoque"
6. Estoque agora: 30 pudins ✅
```

### 📅 TERÇA-FEIRA (Dia de vendas)

#### 10h - Primeira venda
```
Cliente compra 3 pudins no PIX

1. Vai em VENDAS
2. Digita: 3
3. Clica: PIX
4. Pronto! Sistema registrou
```

#### 14h - Segunda venda
```
Cliente compra 5 pudins em dinheiro

1. Digita: 5
2. Clica: DINHEIRO
3. Registrado!
```

#### 18h - Ver quanto vendeu
```
1. Vai em RELATÓRIOS
2. Clica: "Hoje"
3. Vê:
   - Vendeu 8 pudins
   - Faturou R$ 80,00
   - Lucrou R$ 48,00
```

### 📅 QUARTA-FEIRA (Dia de encomenda)

#### 11h - Cliente liga
```
Cliente: "Quero 10 pudins pra sábado"

1. Vai em ENCOMENDAS
2. Preenche:
   - Cliente: João Silva
   - Telefone: (11) 98888-7777
   - Quantidade: 10
   - Data: 06/07/2026
3. Clica: "Cadastrar Encomenda"
4. Sistema salva ✅
```

#### 15h - Verificar encomendas urgentes
```
1. Vai em ENCOMENDAS
2. Vê seção "URGENTES"
3. Tem 1 para entregar hoje!
4. Separa os 5 pudins
5. Clica: "✓ Concluir"
```

### 📅 SÁBADO (Fim de semana)

#### 20h - Fechar o dia
```
1. Vai em RELATÓRIOS
2. Clica: "Esta Semana"
3. Vê resultado da semana:
   - 85 pudins vendidos
   - R$ 850,00 faturados
   - R$ 510,00 de lucro
4. Clica: "Exportar PDF"
5. Salva para guardar
```

---

## 🎯 DICAS IMPORTANTES

### ✅ Boas práticas:

1. **Registre vendas na hora**
   - Não deixe acumular
   - Evita esquecer

2. **Verifique estoque todo dia**
   - Veja se precisa produzir
   - Não deixe acabar

3. **Confira encomendas pela manhã**
   - Veja o que tem para entregar
   - Separe com antecedência

4. **Atualize preços no Financeiro**
   - Se mudar o valor de venda
   - Se mudar o custo

5. **Gere relatórios semanais**
   - Acompanhe crescimento
   - Veja se está lucrando

### ⚠️ Cuidados:

1. **Não feche o terminal**
   - Onde está escrito "Press CTRL+C to quit"
   - Se fechar, servidor para

2. **Salve suas receitas**
   - Clique no botão Salvar
   - Ou pressione Ctrl+S

3. **Confirme ações importantes**
   - Concluir encomenda
   - Cancelar encomenda
   - Sistema sempre pede confirmação

4. **Mantenha senha segura**
   - Não compartilhe com estranhos
   - Mude a senha padrão se quiser

---

## 📱 USANDO NO CELULAR

### Tudo funciona igual!

A diferença:
- **Desktop**: Sidebar (menu) fica do lado esquerdo
- **Mobile**: Sidebar vira botão ☰ no canto

### No celular:
```
1. Abre navegador
2. Digita: http://192.168.15.173:5000
3. Faz login
4. Clica no ☰ para abrir menu
5. Escolhe página
6. Menu fecha sozinho
```

### Adicionar à tela inicial:
```
Android:
Menu (⋮) → Adicionar à tela inicial

iPhone:
Compartilhar → Adicionar à Tela de Início
```

Fica como um app! 📱

---

## 🆘 SE TIVER PROBLEMA

### Site não abre?
```
✓ Servidor está rodando?
✓ Terminal aberto com "Press CTRL+C"?
✓ Digitou http://localhost:5000 certo?
✓ Tentou F5 para atualizar?
```

### Login não funciona?
```
✓ Usuário: NNK (maiúsculo)
✓ Senha: pudimcolherada (tudo minúsculo, sem espaço)
✓ Servidor está rodando?
```

### Dados não aparecem?
```
✓ Aguarde 2 segundos
✓ Clique em botão Atualizar
✓ Recarregue a página (F5)
```

---

## 🎓 RESUMO RÁPIDO

### Para que serve cada página:

| Página | Uso | Quando |
|--------|-----|--------|
| **Dashboard** | Ver tudo rapidinho | Ao começar o dia |
| **Vendas** | Registrar vendas | Sempre que vender |
| **Estoque** | Controlar pudins | Ao produzir ou perder |
| **Encomendas** | Gerenciar pedidos | Ao receber/entregar |
| **Financeiro** | Ver lucro | Todo dia, ao fechar |
| **Receitas** | Guardar receita | Quando precisar consultar |
| **Relatórios** | Análises completas | Fim de semana/mês |

---

## 🍮 PRONTO!

Agora você sabe usar TUDO do sistema Colherada!

**Qualquer dúvida:**
1. Releia este documento
2. Teste no sistema
3. Pratique com exemplos

**Boa sorte com suas vendas! 🚀**

---

**🍮 Colherada - Sistema Completo de Gestão**  
**Simples. Poderoso. Fácil de usar.**
