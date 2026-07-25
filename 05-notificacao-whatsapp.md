# 05 — Notificação Automática no WhatsApp

**What to build:** Google Apps Script com trigger que detecta novas linhas na aba Vendas e envia automaticamente o resumo do pedido via WhatsApp para o número do Guilherme. Eles recebem a notificação sem depender do cliente clicar em nada.

**Blocked by:** 04 — Integração Google Sheets

**Status:** ready-for-agent

- [ ] Trigger no Apps Script (onEdit ou onChange ou time-driven) que detecta novas linhas na aba Vendas
- [ ] Extrai dados da nova linha: nome, produtos, total, tipo entrega
- [ ] Envia notificação via WhatsApp Business API ou webhook (CallMeBot, Twilio, ou WhatsApp Cloud API)
- [ ] Mensagem formatada e legível: "Novo pedido! Nome: ..., Produtos: ..., Total: R$ ..., Entrega: ..."
- [ ] Garantia de não enviar notificação duplicada se trigger disparar múltiplas vezes
- [ ] Teste: novo pedido na planilha → mensagem chega no celular