# 🗄️ GUIA DE CONFIGURAÇÃO DO BANCO DE DADOS NO RENDER

## 📌 POR QUE PRECISO DISSO?

No Render, quando você faz um novo deploy, todos os arquivos são apagados e recriados do zero. Por isso, se você usar apenas arquivos JSON, **seus dados de vendas, estoque e encomendas serão perdidos a cada atualização**.

Para resolver isso, vamos usar um banco de dados PostgreSQL gratuito que o Render oferece. Assim, seus dados ficam salvos permanentemente! 🎉

---

## ✅ PASSO A PASSO

### 1️⃣ CRIAR BANCO DE DADOS POSTGRESQL NO RENDER

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** (botão azul no canto superior direito)
3. Selecione **"PostgreSQL"**
4. Preencha os dados:
   - **Name:** `colherada-db`
   - **Database:** `colherada`
   - **User:** (deixe o padrão)
   - **Region:** `Ohio (US East)` (ou mais próximo de você)
   - **PostgreSQL Version:** `16` (mais recente)
   - **Instance Type:** **FREE** ✅ (gratuito)
5. Clique em **"Create Database"** (botão azul)
6. Aguarde 2-3 minutos até aparecer **"Available"**

---

### 2️⃣ COPIAR URL DO BANCO DE DADOS

1. Na página do banco de dados que você criou
2. Role para baixo até a seção **"Connections"**
3. Você verá **"Internal Database URL"**
4. Clique no botão **"Copy"** ao lado da URL
5. A URL copiada será algo como:
   ```
   postgres://colherada_user:abc123xyz@dpg-xxxxx.oregon-postgres.render.com/colherada
   ```

---

### 3️⃣ CONFIGURAR A URL NO SEU WEB SERVICE

1. Volte para: https://dashboard.render.com
2. Clique no seu serviço **"colherada"** (o Web Service, não o banco)
3. No menu lateral esquerdo, clique em **"Environment"**
4. Clique em **"Add Environment Variable"**
5. Preencha:
   - **Key:** `DATABASE_URL`
   - **Value:** Cole a URL que você copiou no passo anterior
6. Clique em **"Save Changes"**

---

### 4️⃣ FAZER O DEPLOY

1. Ainda na página do seu Web Service
2. Vá em **"Manual Deploy"** (no topo)
3. Clique em **"Deploy latest commit"**
4. Aguarde 3-5 minutos
5. Quando aparecer **"Live"** → Pronto! ✅

---

## 🎉 PRONTO!

Agora seus dados estão salvos no PostgreSQL e **NÃO serão mais apagados** quando você fizer atualizações!

### O que acontece agora:

✅ Seus dados de vendas, estoque e encomendas ficam salvos permanentemente  
✅ Você pode fazer quantos deploys quiser sem perder dados  
✅ O sistema detecta automaticamente se está no Render e usa PostgreSQL  
✅ Localmente (no seu computador), continua usando arquivos JSON normais  
✅ 100% gratuito!  

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

1. Acesse seu sistema na URL do Render
2. Faça login
3. Registre uma venda ou adicione estoque
4. Vá no painel do Render e faça um novo deploy
5. Aguarde o deploy terminar
6. Acesse seu sistema novamente
7. **Os dados devem continuar lá!** 🎉

---

## 🆘 PROBLEMAS COMUNS

### ❌ Erro "could not connect to server"

- Aguarde 5 minutos após criar o banco de dados
- Verifique se copiou a URL correta (Internal Database URL)
- Confirme que adicionou a variável DATABASE_URL no Web Service

### ❌ Dados ainda são apagados

- Verifique se a variável DATABASE_URL está configurada corretamente
- Vá em Environment e confirme que DATABASE_URL existe
- Faça um novo deploy após adicionar a variável

### ❌ Site não carrega após configurar

- Verifique os logs no painel do Render
- Pode ser que o banco ainda esteja inicializando
- Aguarde 2-3 minutos e recarregue a página

---

## 💡 DICA IMPORTANTE

**NÃO delete o banco de dados PostgreSQL!** Se você deletar, todos os seus dados serão perdidos permanentemente. O banco de dados é gratuito e pode ter até 1GB de dados (mais que suficiente para anos de vendas!).

---

**🍮 Colherada - Dados Seguros na Nuvem**  
**Banco de dados configurado com sucesso!**
