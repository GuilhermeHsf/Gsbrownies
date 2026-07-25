# 🍫 GS Brownies — Especificação do Site

> Resultado da sessão de grilling em 25/07/2026.
> Status: **Especificado, não implementado.**

---

## 1. Visão Geral

Site estático (GitHub Pages) para venda de brownies e cookies. O fluxo é:
- Cliente navega no cardápio → adiciona ao carrinho → checkout → pedido cai como "Pendente" no Google Sheets
- Google Apps Script detecta nova linha → envia WhatsApp automático para o Guilherme
- Guilherme confirma estoque e finaliza a venda manualmente

---

## 2. Cardápio e Preços

| Produto | Custo | Venda | Margem |
|---|---|---|---|
| Brownie de Brigadeiro | R$ 6,00 | R$ 10,00 | R$ 4,00 (40%) |
| Brownie de Ninho | R$ 6,00 | R$ 10,00 | R$ 4,00 (40%) |
| Brownie de Nutella com Ninho | R$ 7,50 | R$ 13,00 | R$ 5,50 (42%) |
| Brownie de Mousse de Maracujá | R$ 7,20 | R$ 12,50 | R$ 5,30 (42%) |
| Cookie de Nutella | R$ 6,50 | R$ 12,00 | R$ 5,50 (46%) |
| Cookie de Kinder | R$ 6,50 | R$ 12,00 | R$ 5,50 (46%) |

**Modelo:** Revenda. Compra semanal de ±30 unidades totais. Sem controle de estoque em tempo real.

---

## 3. Identidade Visual

- **Paleta de cores (extraída da logo):**
  - Fundo: `#fffaea` (creme claro)
  - Bege quente: `#e4d2bc`
  - Marrom cacau (botões/destaques): `#a68164`
- **Favicon:** Brasão circular da logo
- **Header público:** Logo completa + frase "Fresquinhos, do forno pra você"
- **Fotos:** Geradas por IA (estilo food styling Instagram) até ter fotos reais

Logo: `/home/guizin/.hermes/webui/attachments/7e7d933a0503/Gemini_Generated_Image_tjyxxrtjyxxrtjyx.png`

---

## 4. Funcionalidades

### 4.1 Cardápio Interativo (Mobile-First)
- Layout PWA-like, mobile-first
- Barra de navegação inferior fixa com ícones
- Elementos grandes para toque (thumb-friendly)
- Carrinho de compras flutuante

### 4.2 Checkout
- Formulário com duas opções: **Delivery** ou **Retirada**
- **Campos Delivery** (aparecem só se selecionado):
  - CEP (máscara `99999-999`, ViaCEP preenche rua/bairro automaticamente)
  - WhatsApp (máscara `(99) 99999-9999`)
  - Endereço completo (rua, número, bairro) — obrigatório
  - Ponto de referência — opcional
- **Validação de distância:**
  - Endereço base (Ponto Zero): **Avenida Manoel Casanova, 1200, Suzano - SP**
  - Geocodificação via Nominatim/OpenStreetMap usando endereço completo
  - Máximo 3 km do ponto zero
  - Se > 3 km: alerta vermelho "Infelizmente, este endereço está fora da nossa área de entrega (máximo 3 km). Por favor, altere para Retirada no local." + botão bloqueado
- **Campos Retirada:** apenas WhatsApp e Nome

### 4.3 Pagamento
- Apenas Pix
- Tela intermediária exibindo QR Code (estático, placeholder para imagem)
- Botão "Copiar Código Pix"

### 4.4 Confirmação do Pedido
- Spinner "Processando..." ao clicar Confirmar Pedido
- Botão desabilitado durante o processamento
- **Integração com Google Sheets:** salva na aba `Vendas` as colunas:
  - Data/Hora, Nome do Cliente, WhatsApp, Tipo de Entrega, CEP, Endereço Completo, Ponto de Referência, Itens/Quantidades, Valor Total, Método de Pagamento, Status ("Pendente")
- **Timeout 10s:** se falhar, mostra erro + botão WhatsApp como fallback
- **Sucesso:** limpa carrinho → redireciona para tela "Pedido Confirmado"
- Na tela de sucesso: botão "Enviar Resumo no WhatsApp" com mensagem pré-formatada

### 4.5 Notificação Automática
- Google Apps Script com trigger ao detectar nova linha na aba `Vendas`
- Envia mensagem automática no WhatsApp do Guilherme com resumo do pedido
- Guilherme confirma estoque → atualiza status para "Confirmado" → "Concluído"

### 4.6 Sem Painel Administrativo
- Google Sheets é o dashboard (já existe e é suficiente para o volume atual)
- Dados protegidos pela conta Google (sem exposição pública)

---

## 5. Arquitetura Técnica

```
[Cliente] → GitHub Pages (HTML/CSS/JS estático)
                ↓ (fetch)
         [Google Apps Script] → escreve na aba Vendas
                ↓ (trigger onNewRow)
         [WhatsApp do Guilherme] ← notificação automática
```

- **Frontend:** HTML + CSS + JavaScript vanilla (sem framework)
- **Hospedagem:** GitHub Pages (domínio a definir)
- **APIs externas:**
  - ViaCEP (preenchimento de endereço por CEP)
  - Nominatim/OpenStreetMap (geocodificação de endereço)
  - Google Apps Script (proxy para Google Sheets — credenciais nunca expostas no frontend)
- **Google Sheets:** arquivo `Gs-Brownies`, aba `Vendas`

---

## 6. Decisões Registradas

| # | Decisão | Alternativas rejeitadas |
|---|---|---|
| Controle de estoque | Pedido "Pendente" + confirmação manual | Estoque em tempo real (overengineering), confirmação automática (risco de overselling) |
| Pagamento | QR Code Pix estático | Telefone como chave Pix (privacidade), integração com gateway (custo) |
| Dashboard | Google Sheets como dashboard | Painel web próprio (complexidade desnecessária) |
| Notificação | Apps Script → WhatsApp automático | Depender do cliente clicar (não confiável), polling manual (atraso) |
| Geolocalização | Endereço completo via Nominatim | Só CEP (impreciso, falsos positivos/negativos) |
| Fallback de erro | Timeout 10s + botão WhatsApp | Salvamento local (complexo), sem fallback (pedido perdido) |
| Hospedagem | GitHub Pages (estático) | Vercel/Netlify, backend próprio |
| Credenciais | Google Apps Script como proxy | API key no frontend (inseguro) |

---

## 7. Próximos Passos

1. Criar repositório GitHub para o site
2. Gerar fotos IA dos 6 produtos
3. Criar o Google Apps Script (proxy Sheets + notificação WhatsApp)
4. Construir o site (HTML/CSS/JS)
5. Configurar GitHub Pages
6. Testar fluxo completo (pedido → Sheets → WhatsApp)
7. Tirar fotos reais e substituir