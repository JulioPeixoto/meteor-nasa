# O que as APIs retornam — e o que vamos gerar com elas

## 1) NASA NeoWs (Near Earth Object Web Service) — `api.nasa.gov/neo/*`
**O que retorna (principais campos):**
- **Feed/Lookup/Browse** de NEOs com: `neo_reference_id`, `name`, **diâmetro estimado** (min/max em metros), **perigosidade**, **dados de aproximação** (`close_approach_data`: data, **velocidade relativa** em km/s, **distância mínima** em km/AU, corpo orbitado) e, em algumas respostas, **dados orbitais** básicos. Limita janelas a 7 dias no *feed* e exige **API key** (evitar `DEMO_KEY` em produção). :contentReference[oaicite:0]{index=0}

**O que geramos a partir disso:**
- **Preset “Impactor-2025”** realista: inicializamos **D (m)**, **v (km/s)**, data-alvo e um rascunho de **elementos orbitais** quando disponíveis.
- **Normalização de unidades** para o front (km, km/s, m, AU → km). 
- **Painel de parâmetros** pré-preenchido no simulador e *links* para o objeto na base JPL. :contentReference[oaicite:1]{index=1}

---

## 2) JPL SBDB / CAD (Close-Approach Data) — `ssd-api.jpl.nasa.gov`
**O que retorna (principais campos):**
- **CAD**: lista de **passagens próximas** (por objeto ou por filtros), com **época**, **distância** (AU/km), **velocidade relativa**, **índices de incerteza** e metadados; ideal para enriquecer o cenário de aproximação. :contentReference[oaicite:2]{index=2}
- **SBDB** (lookup/query): **elementos orbitais Keplerianos** (a, e, i, Ω, ω, M) no **epoch** indicado; propriedades físicas e outros metadados do corpo pequeno. :contentReference[oaicite:3]{index=3}

**O que geramos a partir disso:**
- **Trajetória simplificada** (amostragem paramétrica com elementos orbitais) para **plotar o caminho** até a vizinhança da Terra no globo 3D.
- **Validação de velocidade/distância** do preset contra CAD (coerência temporal).
- **Resumo “orbital”** no painel de resultados (a/e/i e epoch) e base para **modo mitigação (Δv)**. :contentReference[oaicite:4]{index=4}

---

## 3) USGS 3DEP / EPQS (Elevation Point Query Service)
**O que retorna (principais campos):**
- **EPQS**: **elevação** em **metros ou pés** para um **ponto lat/lon** (NAD83), interpolada a partir do serviço dinâmico 3DEP; acurácia varia conforme a fonte (ex.: DEM de 1 m lidar onde disponível, 1/3 arc-second como malha contínua). :contentReference[oaicite:5]{index=5}
- **3DEP ImageServer / WMS/WCS**: acesso a **rasters dinâmicos** (DEM) com *endpoints* OGC para recortes maiores (se quisermos amostrar área e não só ponto). :contentReference[oaicite:6]{index=6}

**O que geramos a partir disso:**
- **Classificação “mar vs. terra”** no ponto de impacto (ou **fração mar/terra** em raio pequeno) — para escolher **ramo costeiro** (risco de tsunami *didático*) vs **ramo terrestre** (proxy sísmico leve).
- **Anotações no mapa** (altitude média local) e **mensagens de contexto** (não é modelagem oficial de tsunami/sismicidade). :contentReference[oaicite:7]{index=7}

---

## 4) Integração com o React Three (R3F/Three.js)
**Como consumimos no front:**
1. **Preset/busca** → `GET /neo` (nosso *proxy/cache*) monta o cenário com `D, v, data` e orbitais básicos. Plotamos **trajetória** e **ponto de impacto**. :contentReference[oaicite:8]{index=8}  
2. **Cálculos locais**: com `D, ρ, v` calculamos **massa** e **energia** (J) → **equivalente TNT (kt)** → **3 anéis de proxy de dano** (1/3/5 níveis).  
3. **Classificação local** → `GET /elevation` (nosso *proxy* EPQS) para decidir **mar/terra** e exibir notas. :contentReference[oaicite:9]{index=9}  

**O que o usuário vê/baixa:**
- **Anéis geodésicos** sobre o globo (Three.js), **trajetória animada** e **métricas** (energia, raios, unidades).  
- **Export**: **PNG** (canvas), **GeoJSON** (anéis) e **PDF** (relatório com parâmetros e fontes). *(Nosso backend agrega e entrega os arquivos.)*

---
