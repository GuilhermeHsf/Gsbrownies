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
const SHEET_ID = 'COLE_O_ID_AQUI';      // ← COLE O ID DA PLANILHA AQUI
const SHEET_NAME = 'Vendas';             // Nome da aba (deve existir na planilha)
const STATUS_PENDENTE = 'Pendente';      // Status inicial do pedido

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