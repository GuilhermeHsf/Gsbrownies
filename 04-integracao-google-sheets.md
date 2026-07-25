# 04 — Integração Google Sheets

**What to build:** Google Apps Script que recebe os dados do pedido via POST e escreve na aba Vendas. O frontend chama o script via fetch. Spinner "Processando..." enquanto grava. Timeout de 10s: se falhar, mostra erro e botão WhatsApp como fallback. Se sucesso: limpa carrinho, mostra tela "Pedido Confirmado" com botão "Enviar Resumo no WhatsApp".

**Blocked by:** 02 — Checkout com Validação de Entrega

**Status:** ready-for-agent

- [ ] Google Apps Script criado, deploy como web app (executar como dono, acesso anônimo)
- [ ] Script recebe payload JSON e escreve nova linha na aba Vendas
- [ ] Colunas gravadas: Data/Hora, Nome, WhatsApp, Tipo Entrega, CEP, Endereço, Ponto Ref, Itens/Quantidades, Valor Total, Método Pagamento, Status ("Pendente")
- [ ] Frontend chama o Apps Script via fetch POST com timeout de 10s
- [ ] Spinner "Processando..." + botão desabilitado durante a gravação
- [ ] Sucesso: limpa carrinho, redireciona para "Pedido Confirmado"
- [ ] Fallback de erro: exibe mensagem + botão WhatsApp para reportar manualmente
- [ ] Tela "Pedido Confirmado" com resumo e botão "Enviar Pedido no WhatsApp"
- [ ] Nenhuma chave de API exposta no frontend (só URL do web app)