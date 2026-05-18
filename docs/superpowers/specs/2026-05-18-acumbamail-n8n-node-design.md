# n8n-nodes-acumbamail — Especificación de diseño

**Fecha:** 2026-05-18
**Repo:** https://github.com/cr0hn/n8n-nodes-acumbamail.git
**Paquete npm:** `n8n-nodes-acumbamail`
**Versión inicial:** 0.1.0

---

## 1. Objetivo

Crear un paquete de nodo comunitario n8n que exponga la API pública de Acumbamail (servicio de email marketing español). El paquete incluye un nodo de acción con 46 operaciones repartidas en 6 recursos, y un nodo trigger que recibe webhooks de Acumbamail.

---

## 2. Estructura de ficheros

```
n8n-nodes-acumbamail/
├── credentials/
│   └── AcumbamailApi.credentials.ts
├── nodes/
│   ├── Acumbamail/
│   │   ├── Acumbamail.node.ts
│   │   ├── acumbamail.svg
│   │   ├── GenericFunctions.ts
│   │   └── descriptions/
│   │       ├── ListDescription.ts
│   │       ├── SubscriberDescription.ts
│   │       ├── CampaignDescription.ts
│   │       ├── TemplateDescription.ts
│   │       ├── SmtpDescription.ts
│   │       └── WebhookDescription.ts
│   └── AcumbamailTrigger/
│       ├── AcumbamailTrigger.node.ts
│       └── acumbamail.svg
├── __tests__/
│   ├── unit/
│   │   ├── GenericFunctions.test.ts
│   │   ├── ListDescription.test.ts
│   │   ├── SubscriberDescription.test.ts
│   │   ├── CampaignDescription.test.ts
│   │   ├── TemplateDescription.test.ts
│   │   ├── SmtpDescription.test.ts
│   │   └── WebhookDescription.test.ts
│   └── integration/
│       └── Acumbamail.integration.test.ts
├── docs/
│   └── superpowers/specs/
├── package.json
├── tsconfig.json
├── gulpfile.js
├── jest.config.js
└── CHANGELOG.md
```

---

## 3. Autenticación

**Tipo:** API Token enviado como parámetro `auth_token` en el body de cada request (no en header).

**Credential type:** `AcumbamailApi`
- Campo `auth_token`: string, tipo password, requerido.

**Test de credencial:** POST a `getLists` con solo el token. HTTP 200 → válido. HTTP 401/403 → inválido.

**Base URL:** `https://acumbamail.com/api/1/`

**`GenericFunctions.ts`** — función `acumbamailApiRequest(this, method, endpoint, body)`:
- Lee `auth_token` de las credenciales del nodo.
- Inyecta el token en el body de cada request.
- Construye la URL completa concatenando la base URL con el endpoint.
- Mapea códigos HTTP a mensajes de error legibles (401 → "Token inválido", 429 → "Rate limit alcanzado", 5xx → "Error del servidor").
- Rate limit de la API: 10 req/min por endpoint. Los errores 429 se lanzan directamente; n8n gestiona el retry si el usuario lo configura.

---

## 4. Nodo de acción — Acumbamail.node.ts

Patrón estándar n8n: dropdown **Resource** → dropdown **Operation** → parámetros dinámicos vía `displayOptions`.

### 4.1 Recurso: List (11 operaciones)

| Operación | Endpoint API | Parámetros principales |
|---|---|---|
| Get All | `getLists` | — |
| Create | `createList` | name (req), description, senderName, senderEmail, country |
| Delete | `deleteList` | listId (req) |
| Get Stats | `getListStats` | listId (req) |
| Get Fields | `getFields` | listId (req) |
| Get Segments | `getListSegments` | listId (req) |
| Get Merge Fields | `getMergeFields` | listId (req) |
| Add Merge Tag | `addMergeTag` | listId (req), fieldName (req), fieldType (req: text/number/date/boolean) |
| Get Subs Stats | `getListSubsStats` | listId (req), blockIndex (default 0) |
| Get Subs Stats | `getListSubsStats` | listId (req), blockIndex (default 0) |
| Get Forms | `getForms` | listId (req) |
| Get Field Types | `getFields` | listId (req) |

### 4.2 Recurso: Subscriber (10 operaciones)

| Operación | Endpoint API | Parámetros principales |
|---|---|---|
| Get All | `getSubscribers` | listId (req), blockIndex, allFields, completeJson |
| Add | `addSubscriber` | email (req), listId (req), fields (key-value collection), doubleOptin, updateSubscriber |
| Delete | `deleteSubscriber` | email (req), listId (req) |
| Unsubscribe | `unsubscribeSubscriber` | email (req), listId (req) |
| Batch Add | `addSubscribersMany` | listId (req), subscribers (JSON array), updateSubscriber |
| Delete All | `deleteSubscribers` | listId (req) |
| Get Details | `getSubscriberDetails` | email (req), listId (req) |
| Search | `searchSubscriber` | query (req) |
| Get Inactive | `getInactiveSubscribers` | dateFrom (req), dateTo (req), fullInfo |

### 4.3 Recurso: Campaign (13 operaciones)

| Operación | Endpoint API | Parámetros principales |
|---|---|---|
| Get All | `getCampaigns` | completeJson |
| Create | `createCampaign` | name (req), subject (req), content (req), listIds (req), fromName, fromEmail, scheduledAt, trackingEnabled, trackingDomain, https |
| Get Basic Info | `getCampaignBasicInformation` | campaignId (req) |
| Get Total Info | `getCampaignTotalInformation` | campaignId (req) |
| Get Clicks | `getCampaignClicks` | campaignId (req) |
| Get Openers | `getCampaignOpeners` | campaignId (req) |
| Get Openers By Browser | `getCampaignOpenersByBrowser` | campaignId (req) |
| Get Openers By OS | `getCampaignOpenersByOs` | campaignId (req) |
| Get Openers By Country | `getCampaignOpenersByCountries` | campaignId (req) |
| Get Soft Bounces | `getCampaignSoftBounces` | campaignId (req) |
| Get By ISP | `getCampaignInformationByIsp` | campaignId (req) |
| Get Links | `getCampaignLinks` | campaignId (req) |
| Get Stats By Date | `getStatsByDate` | listId (req), dateFrom (req), dateTo (req) |

### 4.4 Recurso: Template (4 operaciones)

| Operación | Endpoint API | Parámetros principales |
|---|---|---|
| Get All | `getTemplates` | — |
| Create | `createTemplate` | templateName (req), htmlContent (req), subject (req), customCategory |
| Duplicate | `duplicateTemplate` | templateName (req), originTemplateId (req) |
| Send Campaign | `sendTemplateCampaign` | name (req), subject (req), templateId (req), listIds (req), fromName, fromEmail, scheduledAt, https |

> `getTemplatesByName` excluido — bug documentado en la API (retorna 404 server-side).

### 4.5 Recurso: SMTP (5 operaciones)

| Operación | Endpoint API | Parámetros principales |
|---|---|---|
| Send Email | `sendSingleEmail` | toEmail (req), subject (req), content (req), fromName, fromEmail, category |
| Send Batch | `sendEmails` | messages (JSON array req) |
| Send Certified | `sendCertifiedEmail` | toEmail (req), subject (req), content (req), fromName, fromEmail, ccEmail, bccEmail, category |
| Get Status | `getEmailStatus` | emailKey (req) |
| Get Credits | `getCreditsSMTP` | — |

> Requiere plan SMTP activado en la cuenta Acumbamail. El nodo muestra una nota informativa en la UI.

### 4.6 Recurso: Webhook (4 operaciones)

| Operación | Endpoint API | Parámetros principales |
|---|---|---|
| Get SMTP Config | `getSMTPWebhook` | — |
| Set SMTP Config | `configSMTPWebhook` | callbackUrl (req), delivered, hardBounce, softBounce, complain, opens, click, active |
| Get List Config | `getListWebhook` | listId (req) |
| Set List Config | `configListWebhook` | listId (req), callbackUrl (req), subscribes, unsubscribes, hardBounce, softBounce, complain, opens, click, active |

---

## 5. Nodo Trigger — AcumbamailTrigger.node.ts

Recibe eventos de Acumbamail vía webhook. El usuario copia la URL generada por n8n y la pega en su configuración de Acumbamail.

**`webhookMethods`:** `checkExists`, `create` y `delete` retornan `true` — Acumbamail no tiene API de registro automático de webhooks.

### Configuración del trigger

**Webhook Type** (dropdown):
- `list` — eventos de una lista específica (requiere `listId`)
- `smtp` — eventos de emails transaccionales

**Eventos disponibles según tipo:**

| Evento | List | SMTP |
|---|---|---|
| subscribes | ✅ | — |
| unsubscribes | ✅ | — |
| hard_bounce | ✅ | ✅ |
| soft_bounce | ✅ | ✅ |
| complain | ✅ | ✅ |
| opens | ✅ | ✅ |
| click | ✅ | ✅ |
| delivered | — | ✅ |

**Output:** el payload recibido se pasa sin transformación al flujo n8n.

---

## 6. Testing

### Tests unitarios (`__tests__/unit/`)

- `GenericFunctions.test.ts` — verifica inyección de token en body, construcción de URL, y manejo de errores HTTP (401, 429, 500).
- `*Description.test.ts` (uno por recurso) — verifica que todos los campos `name`, `displayOptions` y `type` están correctamente definidos, que no hay referencias a operaciones inexistentes, y que los campos requeridos tienen `required: true`.

**Objetivo de cobertura:** ≥80%.

### Tests de integración (`__tests__/integration/`)

- Se saltan si `ACUMBAMAIL_TOKEN` no está en las variables de entorno.
- Flujo completo: crear lista → añadir suscriptor → verificar suscriptor → crear campaña → consultar stats → limpiar (eliminar lista).
- Cubre los 6 recursos en orden de dependencia.

---

## 7. package.json — campos clave

```json
{
  "name": "n8n-nodes-acumbamail",
  "version": "0.1.0",
  "keywords": ["n8n-community-node-package", "acumbamail", "email-marketing", "newsletter"],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": ["dist/credentials/AcumbamailApi.credentials.js"],
    "nodes": [
      "dist/nodes/Acumbamail/Acumbamail.node.js",
      "dist/nodes/AcumbamailTrigger/AcumbamailTrigger.node.js"
    ]
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/cr0hn/n8n-nodes-acumbamail"
  }
}
```

---

## 8. Operaciones excluidas (bugs conocidos)

| Operación | Motivo |
|---|---|
| `batchDeleteSubscribers` | Retorna siempre HTTP 500 (bug servidor Acumbamail) |
| `getTemplatesByName` | Retorna 404 server-side (endpoint deprecado) |

Estas operaciones pueden incorporarse en versiones futuras si Acumbamail corrige los bugs.

---

## 9. Decisiones de diseño

- **Auth en body, no en header:** Acumbamail requiere `auth_token` como parámetro de body en todos los endpoints. `GenericFunctions.ts` lo gestiona de forma centralizada.
- **Rate limiting:** 10 req/min por endpoint. Los errores 429 se propagan para que el usuario configure retries en n8n si lo necesita.
- **`skipLibCheck: true`** en tsconfig es obligatorio por las dependencias transitivas de n8n-workflow.
- **Trigger manual:** Acumbamail no tiene API de registro de webhooks, por lo que el usuario configura la URL manualmente en su dashboard.
- **SVG compartido:** ambos nodos usan el mismo `acumbamail.svg` (copiado a ambas carpetas de dist vía gulp).
