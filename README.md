# Plano de Execução — Meteor Madness (3 pessoas)

## Equipe (3 papéis)

**1) FE/3D — Front-end & Visualização (líder de UI/UX)**

* React + Three.js (preferencialmente via React Three Fiber) e Drei.
* Globo 3D, trajetória, anéis de dano, heatmap simplificado.
* UI com sliders/presets, acessibilidade (PT/EN), export (PNG/GeoJSON).

**2) BE/Dados — Back-end & Integrações**

* Next.js API Routes (ou Node/FastAPI), cache in-memory e edge.
* Integração NASA NEO/JPL (parâmetros de asteroides) e USGS (elevação/sismicidade).
* Normalização de unidades, rate-limit, logs e tratamento de erros.

**3) Modelagem/Produto — Física simplificada & PM**

* Fórmulas/assunções: massa, energia cinética, anéis de sobrepressão (proxy de dano).
* Presets (ex.: "Impactor-2025"), copy do app, roteiro de demo, QA.
* Documento de limitações, tooltips/glossário.

---

## Entregáveis

* **App web** responsivo (PT/EN):

  * Presets e modo livre (tamanho, densidade, velocidade, ângulo, lat/lon).
  * Visual 3D: trajetória + ponto de impacto + anéis geodésicos (1/3/5 níveis).
  * Mapa 2D opcional: zonas de risco/tsunami; comparação antes/depois.
  * Export: **PNG** (canvas), **GeoJSON** (anéis), **PDF** (relatório resumo).
* **API** com rotas de dados (proxy/cache) e relatório.
* **README** com fontes de dados, limitações e transparência científica.

---

## Plano de execução (48h)

**Dia 1 — Fundações**

1. **Setup & Deploy**: Next.js + TS; página 3D como Client Component e/ou `dynamic(..., { ssr:false })`; deploy na Vercel.
2. **Cena 3D mínima (FE/3D)**: globo + luzes + OrbitControls; marcador de impacto; função `latLon→vec3`.
3. **Modelo mínimo (Modelagem/Produto)**: massa/energia (J), conversão ~kt TNT, 3 raios de proxy de dano; documentar simplificações.
4. **APIs (BE/Dados)**: rotas `/api/neo` (NeoWs/JPL) e `/api/elevation` (DEM); cache, validação de unidades e tratamento de erros.

**Dia 2 — Valor & Polimento**
5. **Interatividade & Mitigação**: sliders; presets; Δv/tempo de aviso; comparação antes/depois.
6. **UX & Acesso**: tooltips, legendas, export PNG/GeoJSON; i18n PT/EN.
7. **Qualidade & Transparência**: README com fontes, escopo, limitações; tela "About" educativa.
8. **Demo**: cenário Impactor-2025; variação de velocidade e efeito na área/impacto; vídeo curto.

---

## Auth, API, Dados e Segurança

**Auth (opcional)**

* Sem conta: app público e pronto.
* Com conta: OAuth apenas se for salvar cenários; rate-limit por IP/usuário.

**API**

* `/api/neo`: normaliza NeoWs/SBDB (id, D, ρ estimada, v, data de close approach).
* `/api/elevation`: amostra DEM 3DEP (lat/lon → alt média; binário terra/água para branch de tsunami simplificado).
* `/api/report`: gera JSON/Markdown → PDF (serverless).
* Cache com `s-maxage`, timeouts curtos, logs e validação de entrada.

**Dados**

* NASA NeoWs: feed/lookup com chave pública.
* JPL SBDB: query para parâmetros orbitais/físicos adicionais.
* USGS 3DEP: serviços OGC/WMS/WCS para DEM; Earthquake (opcional) para contexto.

---

## Modelagem (mínimo viável)

* Massa (D, ρ) → Energia (E = ½ m v²) → 3 anéis de "sobrepressão" (proxy didático de dano).
* Ramos (opcional): impacto em mar (risco de tsunami por relevo costeiro) vs terra (proxy sísmico leve).
* Assumir: entrada direta sem fragmentação; sem atmosfera/CFD; caráter educativo (não ferramenta oficial de defesa civil).

---

## UI/UX (must-haves)

* Presets: Impactor-2025 + 2 cenários extras.
* Sliders: diâmetro, densidade, velocidade, ângulo, Δv e tempo de aviso.
* Mapa 3D: anéis coloridos + legenda; tooltip com valores; foco automático no impacto.
* Comparar: toggle "mitigado vs não mitigado".
* Export: PNG e GeoJSON; botão "copiar link" com query params.

---

## DevOps & Deploy

* Next.js na Vercel; cena 3D como Client Component e/ou `ssr:false`.
* CI: lint + typecheck + build; preview por PR.
* Observabilidade: logs mínimos de API (latência, cache hits/miss).
* Privacidade: sem PII; se houver contas, política simples no README.

---

## Riscos & Armadilhas (e mitigação)

* SSR de WebGL quebrando build → isolar cena 3D como Client/dynamic import.
* Limites/instabilidade de APIs → cache de 1–6h e presets offline.
* Dados USGS pesados → amostrar DEM só perto do impacto; fallback sem DEM.
* Expectativa de "precisão científica" → seção de limitações + linguagem clara + fontes.

---

## Critérios de sucesso (demo)

1. Em <10s, preset Impactor-2025 mostra trajetória + anéis.
2. Alterar velocidade (+5%) muda ponto/área visível.
3. Mitigar (Δv pequeno, antecedência) atualiza cenário e compara antes/depois.
4. Export de PNG e GeoJSON; README com fontes e limitações.
