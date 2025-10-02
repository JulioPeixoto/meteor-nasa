# APIs Necessárias — Meteor Madness

> Visão prática das **APIs externas** (NASA/USGS) e das **APIs internas** (nosso backend) com rotas, parâmetros, exemplos de payload e recomendações de cache/limite. Endpoints externos podem variar: valide sempre na documentação oficial antes do uso em produção.

---

# Como usar as APIs da NASA (e integrar ao React Three)

> Escopo: usar **NeoWs** (NASA Near Earth Object Web Service) e **SBDB/CAD** (JPL Close Approach Data) via uma única rota interna `/neo`, e **USGS 3DEP** para elevação via `/elevation`. Integração direta com o canvas 3D (React Three Fiber / Three.js) e boas práticas de chaves/limites.

---

## 1) Fontes oficiais e chaves

- **NeoWs (api.nasa.gov)**: busca/browse/lookup de NEOs (diâmetro estimado, aproximações, etc.). Requer **API key** (há `DEMO_KEY`, mas com limites menores). Limite padrão típico: **1.000 req/h** por chave (aplicado em todo `api.nasa.gov`). :contentReference[oaicite:0]{index=0}  
- **SBDB / CAD (ssd-api.jpl.nasa.gov)**: **close-approach data** e **lookup** de pequenos corpos (parâmetros orbitais e físicas). Útil para enriquecer trajetórias/aproximações. :contentReference[oaicite:1]{index=1}
- **USGS 3DEP (elevação)**: use o **EPQS** (Elevation Point Query Service) para obter elevação por lat/lon (ponto) ou serviços WMS/WCS para recortes raster. :contentReference[oaicite:2]{index=2}

> Observação: o `DEMO_KEY` é ótimo para testes, mas tem limites bem baixos; crie sua própria key no portal NASA. :contentReference[oaicite:3]{index=3}

---

## 2) Contrato das rotas internas (recomendado)

### `GET /neo`
- **Objetivo**: consolidar **NeoWs** (feed/browse/lookup) e, quando necessário, **CAD/SBDB** (JPL) num único payload normalizado para o front.
- **Query**: `q?` (nome/designação), `start?`, `end?`, `page?`, `size?`.
- **Retorno** (exemplo):
  ```json
  {
    "items": [
      {
        "id": "neo:1234567",
        "name": "(2025 AB)",
        "est_diameter_m": {"min": 35.1, "max": 78.3},
        "close_approach": [
          {"date": "2025-10-01", "v_kms": 18.2, "miss_km": 450000}
        ],
        "orbit": {"a_au": 1.2, "e": 0.15, "i_deg": 5.3}
      }
    ],
    "page": {"number": 1, "size": 20, "total": 120},
    "units": {"distance": "km", "speed": "km/s"}
  }

---

## 1) Externas (dados oficiais)

### 1.1 NASA — Near Earth Object Web Service (NeoWs)

**Para quê:** listar/consultar asteroides próximos da Terra e obter atributos básicos.

* **Principais rotas (padrões):**

  * `GET /neo/feed` — feed por intervalo de datas (próximas aproximações).
  * `GET /neo/{id}` — detalhes de um NEO por `id`.
  * `GET /neo/browse` — paginação geral de NEOs.
* **Parâmetros comuns:** `start_date`, `end_date` (YYYY-MM-DD), `page`, `size`, `api_key`.
* **Campos úteis:** `name`, `neo_reference_id`, `absolute_magnitude_h`, `estimated_diameter`, `is_potentially_hazardous_asteroid`, `close_approach_data[*]` (velocidade relativa, distância mínima, data), `orbital_data` (quando disponível).
* **Notas:** use **cache** (ex.: 1–6h) e sempre **verifique unidades** (km vs au, km/s vs m/s).

**Exemplo (resumo de resposta):**

```json
{
  "near_earth_objects": {
    "2025-10-01": [
      {
        "neo_reference_id": "1234567",
        "name": "(2025 AB)",
        "estimated_diameter": {"meters": {"estimated_diameter_min": 35.1, "estimated_diameter_max": 78.3}},
        "is_potentially_hazardous_asteroid": false,
        "close_approach_data": [
          {
            "close_approach_date": "2025-10-01",
            "relative_velocity": {"kilometers_per_second": "18.2"},
            "miss_distance": {"kilometers": "450000"},
            "orbiting_body": "Earth"
          }
        ]
      }
    ]
  }
}
```

---

### 1.2 NASA/JPL — Small-Body Database (SBDB)

**Para quê:** parâmetros orbitais/físicos detalhados (quando disponíveis) e dados de aproximação.

* **Rotas típicas:**

  * `GET /sbdb` — detalhes de um corpo pequeno por designação/id (elementos orbitais, epoch, incertezas).
  * `GET /cad` — *close approach data* paramétrico (por objeto, data, distância mínima, etc.).
* **Parâmetros comuns:** `des` (designação), `spk`, `date-min`, `date-max`, `dist-max`, `fullname`.
* **Campos úteis:** elementos keplerianos (a, e, i, Ω, ω, M), epoch, `H` (mag abs.), `GM` (quando aplicável).
* **Notas:** combine com NeoWs para preencher lacunas; normalize unidades (UA, graus, dias julianos).

---

### 1.3 USGS — Elevação / Modelos de Terreno (3DEP)

**Para quê:** classificar **mar vs terra** perto do impacto e apoiar visual de risco costeiro/tsunami simplificado.

* **Rotas comuns (variantes OGC):**

  * **Ponto**: consulta de elevação por lat/lon.
  * **Raster**: tiles/recortes por bbox/zoom (WMS/WCS/XYZ), retorno em GeoTIFF/PNG.
* **Parâmetros comuns:** `lat`, `lon`, ou `bbox`, `width/height` (raster), referência espacial.
* **Notas:** use **amostragem** local (raio do impacto) para reduzir tráfego; armazene um **cache** temporal.

---

### 1.4 USGS — Catálogo Sísmico (opcional/educativo)

**Para quê:** contexto de sismicidade regional (educativo; não diretamente o efeito do impacto).

* **Rotas típicas:** `GET /query` com filtros `starttime`, `endtime`, `minmagnitude`, `latitude`, `longitude`, `maxradiuskm`.
* **Notas:** mantenha este uso como **contexto** e explique que não é simulação sísmica do impacto.

---

## 2) Internas (nosso backend)

> Padrão de resposta: `application/json`. Todas as rotas retornam `traceId`/`timestamp` e `units` quando houver grandezas físicas. **Rate-limit** (ex.: 60 rpm por IP). **Cache** com `s-maxage` em respostas de dados externos.

### 2.1 `/api/neo/search`

Busca consolidada (NeoWs + SBDB) por janela de datas ou termo.

* **Query:** `q?` (texto/designação), `start?`, `end?`, `page?`, `size?`.
* **200 OK**

```json
{
  "items": [
    {
      "id": "neo:1234567",
      "name": "(2025 AB)",
      "est_diameter_m": {"min": 35.1, "max": 78.3},
      "close_approach": [{"date": "2025-10-01", "v_kms": 18.2, "miss_km": 450000}],
      "orbit": {"a_au": 1.2, "e": 0.15, "i_deg": 5.3}
    }
  ],
  "page": {"number": 1, "size": 20, "total": 120}
}
```

### 2.2 `/api/neo/{id}`

Detalhe consolidado por `id`.

* **Path:** `{id}` (id interno mapeado p/ NeoWs/SBDB).
* **200 OK**: objeto com `physical` (D estimado, densidade inferida se houver), `orbit` e `approaches` normalizados.

### 2.3 `/api/trajectory`

Calcula **trajetória paramétrica simplificada** (não n-corpos) e projeta o ponto de interseção.

* **Body (JSON):**

```json
{
  "epoch": "2025-10-01T00:00:00Z",
  "elements": {"a_au": 1.15, "e": 0.12, "i_deg": 4.9, "Omega_deg": 80.2, "omega_deg": 110.5, "M_deg": 15.0},
  "perturbations": false
}
```

* **200 OK:** polilinha amostrada (ECEF/ECI) + estimativa de ponto de interseção com a Terra, se existir.

### 2.4 `/api/elevation`

Amostra **elevação** para classificar **mar/terra** perto do impacto e gerar estatísticas simples.

* **Query:** `lat`, `lon`, `radiusKm?` (default 50).
* **200 OK**

```json
{
  "center": {"lat": -10.9, "lon": -37.1},
  "radius_km": 50,
  "samples": 128,
  "summary": {"sea_fraction": 0.12, "land_fraction": 0.88, "mean_elevation_m": 142}
}
```

### 2.5 `/api/impact/rings`

Gera **anéis de proxy de dano** (1/3/5 níveis) a partir de parâmetros físicos.

* **Body (JSON):**

```json
{
  "lat": -10.9,
  "lon": -37.1,
  "diameter_m": 50,
  "density_kg_m3": 3000,
  "velocity_km_s": 20,
  "angle_deg": 45
}
```

* **200 OK**

```json
{
  "energy_j": 1.2e15,
  "yield_kt": 286.9,
  "rings": [
    {"label": "level1", "radius_km": 120.5, "geojson": {"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [...]}}},
    {"label": "level3", "radius_km": 72.3,  "geojson": {...}},
    {"label": "level5", "radius_km": 51.0,  "geojson": {...}}
  ],
  "units": {"energy": "J", "yield": "kt", "radius": "km"}
}
```

### 2.6 `/api/mitigation/apply`

Aplica **Δv** e **janela de aviso** ao estado orbital simplificado e retorna novo ponto/área estimados.

* **Body (JSON):** `dv_fraction`, `notice_days`, parâmetros do corpo.
* **200 OK:** novo conjunto de `rings`/`impact_point` + deltas vs cenário base.

### 2.7 `/api/export/png`

Renderiza **PNG** do estado atual do canvas (client captura → envia base64 ou usa *server screenshot* se houver headless).

* **Body:** imagem base64 + metadados.
* **200 OK:** `{ url: ".../export/....png" }`.

### 2.8 `/api/export/geojson`

Entrega **GeoJSON** com os anéis/centro.

* **Query/Body:** id de sessão ou payload de anéis.
* **200 OK:** arquivo `.geojson` baixável.

### 2.9 `/api/report`

Gera **relatório** (Markdown → PDF) com parâmetros, resultados, imagens e referências.

* **Body:** JSON com cenário; opção `lang`.
* **200 OK:** `{ url: ".../report/....pdf" }`.

### 2.10 `/api/health`

Ping de saúde com info de cache e status das integrações externas.

---

## 3) Autenticação & Cotas (opcional)

* **Sem login** por padrão; **OAuth** (Auth.js/Clerk/etc.) se quiser salvar cenários.
* **Rate-limit** (ex.: 60 rpm por IP; 200 rpm autenticado). **Chaves externas** protegidas em variáveis de ambiente.
* **CORS**: restrito a nosso domínio em produção.

---

## 4) Cache & Resiliência

* **Cache externo** (NASA/USGS): `s-maxage`/`stale-while-revalidate` 1–6h.
* **Fallback**: se falhar, retornar `preset` local (Impactor-2025) e banner informativo.
* **Timeouts** curtos (ex.: 3–6s) + **retries** exponenciais nas chamadas externas.

---

## 5) Unidades & Validação

* Sempre retorne `units` no payload quando houver grandezas.
* **Normalização**: km ↔ m, km/s ↔ m/s, AU ↔ km, graus ↔ rad.
* **Ranges**: valide `diameter_m`, `density_kg_m3`, `velocity_km_s`, `angle_deg`, `dv_fraction` e `notice_days` (clamp + mensagens amigáveis).

---

## 6) Segurança & Observabilidade

* **Sem PII**; logs sem dados sensíveis; mascarar chaves.
* **Headers**: `X-RateLimit-*`, `Cache-Control`, `ETag`.
* **Logs**: tempo de resposta, cache hit/miss, erros externos, `traceId` por requisição.

---

## 7) Contratos TypeScript (exemplo)

```ts
// ImpactRequest
export type ImpactRequest = {
  lat: number; lon: number;
  diameter_m: number; density_kg_m3: number; velocity_km_s: number; angle_deg: number;
};

// RingFeature (GeoJSON minimal)
export type RingFeature = {
  label: 'level1' | 'level3' | 'level5';
  radius_km: number;
  geojson: { type: 'Feature'; geometry: { type: 'Polygon'; coordinates: number[][][] }; properties?: Record<string, any> };
};

// ImpactResponse
export type ImpactResponse = {
  energy_j: number; yield_kt: number; rings: RingFeature[];
  units: { energy: 'J'; yield: 'kt'; radius: 'km' };
};
```

---

## 8) Sequência típica (happy path)

1. FE chama `/api/neo/search` (preset) → recebe NEO base.
2. Usuário ajusta sliders → FE chama `/api/impact/rings` com parâmetros atuais.
3. Usuário liga mitigação (Δv/aviso) → FE chama `/api/mitigation/apply` e plota A/B.
4. Export PNG/GeoJSON → `/api/export/*`.
5. (Opcional) Salvar cenário → rota protegida com OAuth.
