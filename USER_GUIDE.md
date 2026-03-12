# 🚀 AppZap Mobile Builder - Guia do Usuário

Bem-vindo ao AppZap! Este guia explica como utilizar as funcionalidades avançadas do seu builder mobile-first.

## 🎨 O Editor Visual

### Navegação no Canvas
O editor principal utiliza gestos naturais de design:
- **Mover a tela**: Use **dois dedos** para arrastar e navegar pelo canvas.
- **Zoom**: Utilize o gesto de **pinça** (pinch) para dar zoom in/out e focar em detalhes.
- **Selecionar**: Toque em qualquer componente no canvas para abrir o painel de propriedades.

### Inserção de Componentes
Toque no **FAB (+) flutuante** no canto inferior direito para abrir a paleta:
- Use a **busca** para encontrar componentes rapidamente.
- Toque em um componente para inseri-lo na tela ativa.

### Propriedades e Eventos
Ao selecionar um componente, um painel inferior será exibido com duas abas:
1. **Properties**: Ajuste estilos como cores, textos, tamanhos e alinhamentos.
2. **Events**: Conecte ações (como `onPress`) a fluxos de lógicas criados no Logic Editor.

---

## 🧠 Visual Logic (O Cérebro do App)

Toque no botão **Logic** na barra superior para entrar no modo de programação visual.

### Como Funciona
A lógica é baseada em **Blocos**:
- **Events (Vermelhos)**: Gatilhos iniciados pelo usuário (ex: Toque no Botão).
- **Actions (Azuis)**: Ações que o app executa (ex: Mostrar Alerta, Navegar).
- **Control (Laranja)**: Lógica condicional (If/Else).

### Passo a Passo para criar uma ação:
1. Abra o **Logic Editor**.
2. Na barra inferior, escolha um **Event** (ex: `On Press`).
3. Adicione uma **Action** (ex: `Show Alert`).
4. Edite os campos do bloco (ex: mensagem do alerta) tocando nele.
5. Volte para o editor visual, selecione o seu botão, vá na aba **Events** e selecione o bloco que você criou.

---

## 📊 Variáveis e Data Binding

O AppZap permite criar dados dinâmicos:
- **Sintaxe**: Use `{{nome_da_variavel}}` em campos de texto.
- **Atualização**: Quando você usa o bloco `SET_VARIABLE`, todos os componentes vinculados a essa variável atualizam na hora no Preview.

---

## 📱 Preview Interativo

Toque em **Preview (Play)** para testar seu app:
- O preview não é um mock estático; é um **runtime real**.
- Botões funcionam, variáveis mudam e a navegação entre telas é simulada fielmente.

---

## 🛠️ Dicas Pro
- **Undo/Redo**: Botões de desfazer/refazer estão no topo para correções rápidas.
- **Theme**: O botão de paleta no topo permite configurar as cores globais do projeto.
- **Mover Blocos**: (Em implementação) Toque e arraste os blocos de lógica para organizar seu fluxo de trabalho.
