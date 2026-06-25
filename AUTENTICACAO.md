# 🔐 SISTEMA DE AUTENTICAÇÃO - COLHERADA

## 🔑 CREDENCIAIS DE ACESSO

**Usuário:** `NNK`  
**Senha:** `pudimcolherada`

---

## 🚺 COMO USAR

### 1️⃣ Fazer Login

1. Acesse o sistema pela URL
2. Digite o usuário: `NNK`
3. Digite a senha: `pudimcolherada`
4. Clique em "Entrar"

### 2️⃣ Usar o Sistema

Após o login, você terá acesso completo a:
- ✅ Controle de estoque
- ✅ Registro de vendas
- ✅ Gerenciamento de encomendas
- ✅ Relatórios do dia

### 3️⃣ Sair do Sistema

- Clique no botão **"🚪 Sair"** no canto superior direito
- Confirme a saída

---

## 🔒 SEGURANÇA

### Proteção Implementada:

✅ **Tela de Login Obrigatória**  
- Ninguém acessa sem autenticação

✅ **Sessão Segura**  
- Sistema mantém você logado
- Sessão expira ao fechar o navegador

✅ **Senha Criptografada**  
- Senha armazenada com hash SHA-256
- Impossível descriptografar

✅ **Proteção de Rotas**  
- Todas as APIs protegidas
- Sem login = Sem acesso aos dados

✅ **Logout Automático**  
- Se a sessão expirar, volta para login
- Proteção contra acesso não autorizado

---

## 🔄 ALTERAR SENHA (RECOMENDADO)

### Como Alterar sua Senha:

**Opção 1 - Via API (Navegador):**

1. Faça login no sistema
2. Abra o console do navegador (F12)
3. Cole este código e execute:

```javascript
fetch('/api/alterar-senha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
        senha_atual: 'admin123',
        senha_nova: 'SUA_NOVA_SENHA_AQUI'
    })
})
.then(r => r.json())
.then(d => alert(d.message));
```

4. Substitua `SUA_NOVA_SENHA_AQUI` pela sua nova senha
5. Pressione Enter

**Opção 2 - Adicionar Interface (Futuro):**

Podemos adicionar uma tela de "Alterar Senha" no menu do sistema.

---

## 👥 ADICIONAR MAIS USUÁRIOS (Opcional)

Para adicionar mais usuários, você precisa acessar o banco de dados:

### Via Python:

```python
import sqlite3
import hashlib

# Conectar ao banco
conn = sqlite3.connect('colherada.db')
cursor = conn.cursor()

# Criar novo usuário
usuario = 'vendedor1'
senha = 'senha123'
senha_hash = hashlib.sha256(senha.encode()).hexdigest()
nome = 'Vendedor Principal'

cursor.execute('''
    INSERT INTO usuarios (usuario, senha_hash, nome)
    VALUES (?, ?, ?)
''', (usuario, senha_hash, nome))

conn.commit()
conn.close()
print(f"✅ Usuário '{usuario}' criado!")
```

---

## 📱 COMO FUNCIONA NO CELULAR

1. **Primeira Vez:**
   - Abra a URL no navegador
   - Faça login
   - Adicione à tela inicial

2. **Próximos Acessos:**
   - Abra o app da tela inicial
   - Se a sessão estiver ativa, entra direto
   - Se expirou, pede login novamente

---

## 🆘 ESQUECEU A SENHA?

### Resetar Senha do Admin:

Se esquecer a senha, você pode resetar diretamente no banco de dados:

**Método 1 - Via Python no Render:**

1. No painel do Render, vá em "Shell"
2. Execute:

```python
import sqlite3, hashlib
conn = sqlite3.connect('colherada.db')
cursor = conn.cursor()
nova_senha = hashlib.sha256('admin123'.encode()).hexdigest()
cursor.execute('UPDATE usuarios SET senha_hash = ? WHERE usuario = "admin"', (nova_senha,))
conn.commit()
conn.close()
print("Senha resetada para: admin123")
```

---

## ⚙️ CONFIGURAÇÕES AVANÇADAS

### Tempo de Sessão:

Por padrão, a sessão expira quando você fecha o navegador.

Para alterar isso, edite `app.py`:

```python
from datetime import timedelta

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)  # 7 dias
```

### Múltiplos Dispositivos:

- Você pode estar logado em vários dispositivos simultaneamente
- Cada dispositivo mantém sua própria sessão
- Fazer logout em um não afeta os outros

---

## ✅ BENEFÍCIOS DA AUTENTICAÇÃO

✔️ **Privacidade Total**  
- Só você vê seus dados de vendas
- Ninguém acessa sem permissão

✔️ **Controle de Acesso**  
- Sabe quem está usando o sistema
- Histórico de ações por usuário

✔️ **Segurança Profissional**  
- Mesma tecnologia de apps bancários
- Dados protegidos

✔️ **Tranquilidade**  
- Pode compartilhar a URL sem medo
- Senha necessária para acesso

---

## 📊 CHECKLIST DE SEGURANÇA

Após fazer o deploy:

- [ ] Fez login com `admin` / `admin123`
- [ ] Testou todas as funcionalidades
- [ ] Alterou a senha padrão
- [ ] Testou logout e login novamente
- [ ] Adicionou à tela inicial do celular
- [ ] Verificou que dados não aparecem sem login

---

**🍮 Colherada - Sistema Seguro de Vendas**  
**Suas informações protegidas com autenticação profissional**
