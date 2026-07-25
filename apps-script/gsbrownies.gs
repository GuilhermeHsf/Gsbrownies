/**
 * GS Brownies — Google Apps Script
 * ===================================
 * 
 * Este script recebe os pedidos do site via POST e escreve na aba "Vendas"
 * da planilha Gs-Brownies.
 * 
 * COMO INSTALAR:
 * 1. Abra https://script.google.com/ e clique em "Novo projeto"
 * 2. Apague o código padrão e cole este arquivo inteiro
 * 3. No menu "Editor", clique no nome do projeto e renomeie para "Gs-Brownies"
 * 4. Na linha 26 abaixo, cole o ID da sua planilha:
 *    - Abra sua planilha Gs-Brownies no Google Sheets
 *    - A URL é algo como: https://docs.google.com/spreadsheets/d/ABCDE12345/edit
 *    - Copie o ID entre /d/ e /edit  (no exemplo: ABCDE12345)
 *    - Substitua 'COLE_O_ID_AQUI' por esse valor
 * 5. Clique em "Salvar" (Ctrl+S)
 * 6. Clique em "Implantar" → "Nova implantação"
 * 7. Tipo: "Web app"
 * 8. Executar como: "Eu" (sua conta)
 * 9. Quem tem acesso: "Qualquer pessoa" (anônimo)
 * 10. Clique em "Implantar" e autorize
 * 11. Copie a URL do web app gerada
 * 12. Cole essa URL no arquivo config.js (const APPS_SCRIPT_URL = '...')
 */

// ============================================================
// CONFIGURAÇÃO
// ============================================================
const SHEET_ID = '1KGHTU5axnRHhJPReQR9h5aZwGWOeDWTzqNpFeEH3DmM';      // ← COLE O ID DA PLANILHA AQUI
const SHEET_NAME = 'Vendas';             // Nome da aba (deve existir na planilha)
const STATUS_PENDENTE = 'Pendente';      // Status inicial do pedido

// ============================================================
// NOTIFICAÇÃO — Configuração (opcional)
// ============================================================
//
// OPÇÃO A: CallMeBot (WhatsApp gratuito)
//   1. Envie "I allow callmebot to send me messages" para +34 644 41 20 85 no WhatsApp
//   2. Aguarde a resposta com sua API Key
//   3. Preencha abaixo:
//
const CALLMEBOT_API_KEY = '';           // ← Sua API Key do CallMeBot
const SEU_NUMERO = '5511999999999';     // ← Seu WhatsApp com DDD (5511...)

//
// OPÇÃO B: E-mail (sempre funciona, sem configuração extra)
//   A notificação também será enviada por e-mail para o endereço
//   da sua conta Google como fallback.
//

// ============================================================
// ENDPOINT PRINCIPAL — Recebe o POST do site
// ============================================================
function doPost(e) {
  try {
    // Parse do JSON enviado pelo frontend
    const data = JSON.parse(e.postData.contents);
    
    // Validação básica
    if (!data.nome || !data.whatsapp) {
      return errorResponse('Campos obrigatórios: nome, whatsapp');
    }
    
    // Grava na planilha
    const resultado = escreverPedido(data);
    
    // Envia notificação (WhatsApp + e-mail fallback)
    notificarNovoPedido(data, resultado);
    
    // Retorna sucesso
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', mensagem: 'Pedido registrado!', linha: resultado }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (erro) {
    return errorResponse('Erro interno: ' + erro.toString());
  }
}

// ============================================================
// ENDPOINT DE TESTE — Abrir no navegador pra ver se tá no ar
// ============================================================
function doGet(e) {
  // Se veio com ?test=1, testa a planilha
  if (e && e.parameter && e.parameter.test === '1') {
    try {
      const ss = SpreadsheetApp.openById(SHEET_ID);
      const sheet = ss.getSheetByName(SHEET_NAME);
      const ultima = sheet.getLastRow();
      const dados = ultima >= 1 ? sheet.getRange(ultima, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'ok',
          planilha: 'Conectada!',
          sheet: SHEET_NAME,
          linhas: ultima,
          ultima_linha: dados
        }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (erro) {
      return errorResponse('Erro ao acessar planilha: ' + erro.toString());
    }
  }
  
  // Página de status
  return HtmlService.createHtmlOutput(`
    <h2>🍫 GS Brownies — API</h2>
    <p>Status: ✅ No ar</p>
    <p>Planilha: ${SHEET_NAME}</p>
    <p><a href="?test=1">Testar conexão com a planilha</a></p>
  `);
}

// ============================================================
// FUNÇÃO PRINCIPAL — Escreve o pedido na planilha
// ============================================================
function escreverPedido(dados) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  // Se a aba não existir, cria com cabeçalhos
  if (!sheet) {
    const novaSheet = ss.insertSheet(SHEET_NAME);
    novaSheet.appendRow([
      'Data/Hora',
      'Nome do Cliente',
      'WhatsApp',
      'Tipo de Entrega',
      'CEP',
      'Endereço Completo',
      'Ponto de Referência',
      'Itens / Quantidades',
      'Valor Total',
      'Método de Pagamento',
      'Status'
    ]);
    novaSheet.getRange(1, 1, 1, 11).setFontWeight('bold');
  }
  
  // Monta a linha
  const linha = [
    new Date(),                                                  // Data/Hora
    dados.nome,                                                  // Nome do Cliente
    dados.whatsapp,                                              // WhatsApp
    dados.tipoEntrega === 'delivery' ? '🛵 Delivery' : '🚶 Retirada',  // Tipo de Entrega
    dados.cep || '',                                             // CEP
    dados.endereco || '',                                        // Endereço Completo
    dados.pontoRef || '',                                        // Ponto de Referência
    dados.itens || '',                                           // Itens / Quantidades
    dados.valorTotal ? parseFloat(dados.valorTotal) : 0,         // Valor Total
    'Pix',                                                       // Método de Pagamento
    STATUS_PENDENTE                                              // Status
  ];
  
  // Escreve na planilha
  sheet.appendRow(linha);
  
  // Retorna o número da linha escrita
  return sheet.getLastRow();
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function errorResponse(mensagem) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'erro', mensagem: mensagem }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// NOTIFICAÇÃO — Chamada após escrever pedido (dentro de doPost)
// ============================================================
function notificarNovoPedido(dados, linhaNum) {
  const mensagem = montarMensagem(dados);
  const assunto = '🍫 Novo pedido GS Brownies';

  // Tenta WhatsApp primeiro (CallMeBot)
  if (CALLMEBOT_API_KEY) {
    try {
      UrlFetchApp.fetch(
        'https://api.callmebot.com/whatsapp.php?' +
        'phone=' + encodeURIComponent(SEU_NUMERO) +
        '&text=' + encodeURIComponent(mensagem) +
        '&apikey=' + encodeURIComponent(CALLMEBOT_API_KEY)
      );
      Logger.log('✅ WhatsApp enviado com sucesso!');
      return;
    } catch (erro) {
      Logger.log('❌ WhatsApp falhou: ' + erro + ' — enviando e-mail...');
    }
  }

  // Fallback: e-mail
  try {
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(),
      subject: assunto,
      body: mensagem
    });
    Logger.log('✅ E-mail enviado para ' + Session.getActiveUser().getEmail());
  } catch (erro) {
    Logger.log('❌ E-mail também falhou: ' + erro);
  }
}

// ============================================================
// MONTA MENSAGEM FORMATADA
// ============================================================
function montarMensagem(dados) {
  let msg = '🍫 *NOVO PEDIDO - GS Brownies*\n';
  msg += '═══════════════════════\n\n';
  msg += '👤 ' + dados.nome + '\n';
  msg += '📱 ' + dados.whatsapp + '\n';
  msg += '🚚 ' + (dados.tipoEntrega === 'delivery' ? '🛵 Delivery' : '🚶 Retirada') + '\n';

  if (dados.tipoEntrega === 'delivery' && dados.endereco) {
    msg += '📍 ' + dados.endereco + '\n';
    if (dados.pontoRef) msg += '📍 Ref: ' + dados.pontoRef + '\n';
  }

  msg += '\n📦 *Itens:*\n';
  msg += dados.itens + '\n\n';
  msg += '💰 *Total: R$ ' + dados.valorTotal + '*\n';
  msg += '💳 Pix\n';
  msg += '📋 Status: Pendente\n\n';
  msg += '➡️ Acesse a planilha para confirmar:\n';
  msg += 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '\n';

  return msg;
}

// ============================================================
// INSTALAR TRIGGER AUTOMÁTICO (executar 1 vez no editor)
// ============================================================
//
// Esta função cria um trigger que monitora a planilha e envia
// notificação quando um novo pedido é adicionado manualmente
// (fora do site).
//
// COMO USAR:
// 1. No editor do Apps Script, selecione a função "instalarTrigger"
// 2. Clique em "Executar" (▶)
// 3. Autorize as permissões na primeira vez
// 4. Pronto! O trigger vai monitorar a aba Vendas a cada minuto
//
function instalarTrigger() {
  // Remove triggers existentes para evitar duplicatas
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'verificarNovosPedidos') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // Cria trigger baseado em tempo (a cada 1 minuto)
  ScriptApp.newTrigger('verificarNovosPedidos')
    .timeBased()
    .everyMinutes(1)
    .create();

  Logger.log('✅ Trigger instalado! Verificará novos pedidos a cada 1 minuto.');
}

// ============================================================
// VERIFICAR NOVOS PEDIDOS (chamado pelo trigger)
// ============================================================
function verificarNovosPedidos() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return;

    const ultimaLinha = sheet.getLastRow();
    if (ultimaLinha < 2) return; // Só cabeçalho

    // Pega o status da última linha (coluna 11)
    const status = sheet.getRange(ultimaLinha, 11).getValue();

    if (status !== STATUS_PENDENTE) return;

    // Verifica se já foi notificada (evita duplicatas)
    const jaNotificado = PropertiesService.getScriptProperties()
      .getProperty('notificado_linha_' + ultimaLinha);

    if (jaNotificado) return;

    // Lê os dados da linha
    const dados = sheet.getRange(ultimaLinha, 1, 1, 11).getValues()[0];

    // Constrói objeto de dados similar ao do doPost
    const pedido = {
      nome: dados[1] || '',
      whatsapp: dados[2] || '',
      tipoEntrega: dados[3]?.includes('Delivery') ? 'delivery' : 'retirada',
      cep: dados[4] || '',
      endereco: dados[5] || '',
      pontoRef: dados[6] || '',
      itens: dados[7] || '',
      valorTotal: dados[8] ? dados[8].toString().replace('.', ',') : '0,00'
    };

    // Envia notificação
    notificarNovoPedido(pedido, ultimaLinha);

    // Marca como notificada
    PropertiesService.getScriptProperties()
      .setProperty('notificado_linha_' + ultimaLinha, 'ok');

  } catch (erro) {
    Logger.log('❌ Erro no trigger: ' + erro.toString());
  }
}