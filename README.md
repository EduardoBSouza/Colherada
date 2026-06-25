# 🍮 Colherada - Sistema de Vendas na Nuvem

Sistema completo de controle de vendas de pudim artesanal com sincronização em tempo real entre múltiplos dispositivos e **autenticação segura**.

## 🔐 Acesso Seguro

O sistema possui **tela de login obrigatória** para proteger suas informações de vendas.

**Credenciais Padrão:**
- **Usuário:** `admin`
- **Senha:** `admin123`

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login! Veja [AUTENTICACAO.md](AUTENTICACAO.md) para detalhes.

## ☁️ Deploy no Render.com (GRATUITO)

### 📋 Pré-requisitos

1. Conta no GitHub (criar em https://github.com)
2. Conta no Render.com (criar em https://render.com)

### 🚀 Passo a Passo para Deploy

#### 1️⃣ Criar Repositório no GitHub

1. Acesse https://github.com
2. Clique em "New repository" (botão verde)
3. Nome do repositório: `colherada`
4. Deixe como **Public**
5. Clique em "Create repository"

#### 2️⃣ Fazer Upload dos Arquivos

**Opção A - Via Interface Web (Mais Fácil):**

1. Na página do repositório criado, clique em "uploading an existing file"
2. Arraste TODOS os arquivos desta pasta:
   - `app.py`
   - `index.html`
   - `pdv-offline.html`
   - `requirements.txt`
   - `render.yaml`
   - `.gitignore`
3. Clique em "Commit changes"

**Opção B - Via Git (Se souber usar):**

```bash
cd "d:\Controle de Vendas"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/colherada.git
git push -u origin main
```

#### 3️⃣ Deploy no Render

1. Acesse https://render.com
2. Faça login (pode usar sua conta GitHub)
3. Clique em "New +" → "Web Service"
4. Conecte seu repositório GitHub `colherada`
5. Configure:
   - **Name:** colherada
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Instance Type:** Free
6. Clique em "Create Web Service"
7. Aguarde 5-10 minutos para o deploy

#### 4️⃣ Acessar Seu Sistema

Após o deploy, você receberá uma URL como:

```
https://colherada.onrender.com
```

**Acesse de qualquer dispositivo!** 📱💻

### 📱 Adicionar à Tela Inicial do Celular

1. Abra a URL no navegador do celular
2. Chrome: Menu (⋮) → "Adicionar à tela inicial"
3. Safari (iPhone): Compartilhar → "Adicionar à tela de início"

## ✨ Recursos

- 🔐 **Autenticação segura** com login e senha
- ✅ Sincronização em tempo real entre dispositivos
- ✅ Acesso de qualquer lugar
- ✅ Dados salvos na nuvem
- ✅ Controle de estoque
- ✅ Registro de vendas (PIX, Dinheiro, Cartão)
- ✅ Gerenciamento de encomendas
- ✅ Relatórios diários
- ✅ 100% responsivo (mobile + desktop)
- 🔒 **Privacidade total** - só você acessa seus dados

## 🔧 Tecnologias

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python + Flask
- **Banco de Dados:** SQLite
- **Hospedagem:** Render.com

## 📊 API Endpoints

- `GET /` - Interface principal
- `GET /api/dados` - Obter dados do dia
- `POST /api/dados` - Salvar dados
- `GET /api/status` - Status do servidor
- `GET /api/estatisticas` - Estatísticas gerais

## 🆘 Precisa de Ajuda?

Se tiver problemas no deploy:

1. Verifique se todos os arquivos foram enviados ao GitHub
2. Confira os logs no painel do Render
3. Certifique-se de que escolheu "Python 3" como ambiente

## 📄 Licença

Uso livre para fins pessoais e comerciais.

---

**🍮 Colherada - Pudim perfeito no Vidro 150ml**
