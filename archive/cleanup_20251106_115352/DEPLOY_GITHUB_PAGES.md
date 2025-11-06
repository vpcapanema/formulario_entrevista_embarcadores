# 🚀 Guia de Implantação no GitHub Pages

## Passo a Passo

### 1. Criar Repositório no GitHub

1. Acesse https://github.com e faça login
2. Clique no botão **+** (canto superior direito) e selecione **New repository**
3. Preencha:
   - **Repository name**: `pli2050-formularios` (ou o nome que preferir)
   - **Description**: "Sistema de Formulários PLI 2050 - Entrevistas com Embarcadores"
   - Marque **Public** (necessário para GitHub Pages gratuito)
   - **NÃO** marque "Add a README file" (já temos um)
4. Clique em **Create repository**

### 2. Fazer Upload dos Arquivos

#### Opção A: Via Interface Web (Mais Fácil)

1. No repositório recém-criado, clique em **uploading an existing file**
2. Arraste os seguintes arquivos:
   - `index.html`
   - `styles.css`
   - `database.js`
   - `app.js`
   - `analytics.js`
   - `README.md`
3. Adicione uma mensagem de commit: "Initial commit - PLI 2050 Application"
4. Clique em **Commit changes**

#### Opção B: Via Git (Para Usuários Avançados)

```bash
# No terminal, dentro da pasta do projeto
git init
git add index.html styles.css database.js app.js analytics.js README.md
git commit -m "Initial commit - PLI 2050 Application"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/pli2050-formularios.git
git push -u origin main
```

### 3. Ativar GitHub Pages

1. No repositório, clique em **Settings** (Configurações)
2. No menu lateral esquerdo, clique em **Pages**
3. Em **Source** (Origem):
   - Selecione **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
4. Clique em **Save**
5. Aguarde 1-2 minutos

### 4. Acessar sua Aplicação

Após alguns minutos, a aplicação estará disponível em:

```
https://SEU-USUARIO.github.io/pli2050-formularios/
```

Substitua `SEU-USUARIO` pelo seu nome de usuário do GitHub.

## 🔄 Atualizações Futuras

Para atualizar a aplicação depois:

### Via Interface Web:
1. Clique no arquivo que deseja atualizar
2. Clique no ícone de lápis (Edit)
3. Faça as alterações
4. Clique em **Commit changes**

### Via Git:
```bash
git add .
git commit -m "Descrição da atualização"
git push
```

As alterações aparecerão no site em 1-2 minutos.

## ✅ Verificação

Para verificar se está tudo funcionando:

1. ✅ Acesse a URL do GitHub Pages
2. ✅ Preencha um formulário de teste
3. ✅ Verifique se salva corretamente
4. ✅ Vá para a página de Respostas
5. ✅ Vá para a página de Analytics
6. ✅ Teste as exportações (Excel, CSV, PDF)

## 🛠️ Solução de Problemas

### Página não carrega
- Aguarde 5 minutos após ativar o GitHub Pages
- Limpe o cache do navegador (Ctrl + F5)
- Verifique se todos os arquivos foram enviados

### Erros no console do navegador
- Abra o DevTools (F12)
- Verifique a aba Console
- Certifique-se de que todos os arquivos .js estão presentes

### Dados não salvam
- Verifique se está usando HTTPS (GitHub Pages usa automaticamente)
- Teste em um navegador moderno (Chrome, Firefox, Edge)
- Limpe os dados do site e tente novamente

## 📱 Compartilhamento

Depois de implantado, você pode compartilhar o link:

```
https://SEU-USUARIO.github.io/pli2050-formularios/
```

Qualquer pessoa com acesso à internet poderá usar o formulário!

## 🔒 Importante

- Os dados ficam salvos **localmente** no navegador de cada usuário
- Para consolidar dados de múltiplos usuários, peça que exportem em Excel/CSV
- Faça backup regular dos dados exportados

## 💡 Dicas

1. **Domínio Personalizado**: Em Settings > Pages, você pode configurar um domínio personalizado
2. **Analytics**: Adicione Google Analytics para monitorar acessos
3. **Atualizações**: Sempre teste localmente antes de fazer push
4. **Versionamento**: Use commits descritivos para rastrear mudanças

---

Pronto! Sua aplicação estará no ar 🎉
