# 02 — Checkout com Validação de Entrega

**What to build:** Tela de checkout completa onde o cliente preenche nome, WhatsApp, escolhe entre Retirada ou Delivery. Se Delivery: campos de CEP (máscara), ViaCEP preenche rua/bairro automaticamente, endereço completo, ponto de referência opcional. Nominatim calcula distância do endereço até Av. Manoel Casanova, 1200, Suzano-SP. Se > 3km: alerta vermelho e botão bloqueado. Se Retirada: só nome e WhatsApp. Botão "Finalizar Pedido" monta mensagem do WhatsApp com resumo.

**Blocked by:** 01 — Scaffold + Cardápio + Carrinho

**Status:** ready-for-agent

- [ ] Tela de checkout com formulário de nome e WhatsApp (máscara `(99) 99999-9999`)
- [ ] Seletor Retirada / Delivery com toggle visual
- [ ] Campos de endereço aparecem/desaparecem conforme seleção
- [ ] Campo CEP com máscara `99999-999` e integração ViaCEP (preenche rua, bairro, cidade)
- [ ] Campo endereço completo (rua, número, bairro) — obrigatório
- [ ] Campo ponto de referência — opcional
- [ ] Integração Nominatim: converter endereço completo em coordenadas
- [ ] Cálculo de distância até Av. Manoel Casanova, 1200, Suzano-SP
- [ ] Validação: se > 3km, alerta vermelho + botão desabilitado
- [ ] Botão "Finalizar Pedido" gera link WhatsApp com resumo: itens, quantidades, total, tipo entrega, endereço