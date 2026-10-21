/**
 * GigaChat (Sber) transport — replaces the former OpenRouter client.
 *
 * GigaChat speaks an OpenAI-compatible /chat/completions dialect, with three
 * differences that matter here:
 *   1. Auth is OAuth2: the cabinet "authorization key" (Basic) is exchanged for
 *      a bearer token that lives ~30 minutes, so the token is cached in-process.
 *   2. TLS is served by the Russian Trusted Root CA chain (NUC Minicifry), which
 *      is not in Node's trust store — hence node:https with an explicit CA list.
 *   3. There is no server-side `models` array: fallbacks are attempted
 *      sequentially here, which is what callLLM() feeds via `models`.
 */
import { randomUUID } from 'node:crypto';
import https from 'node:https';

import { getConfig } from './config';
import { logError, logInfo, logWarn } from './telemetry';

export type GigaChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  /** Uploaded file ids (see uploadGigaChatFile) — used for image/OCR input. */
  attachments?: string[];
};

export type GigaChatRequest = {
  model?: string;
  /** Ordered fallback list; the first entry is the primary model. */
  models?: string[];
  messages: GigaChatMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
};

export type GigaChatResponse = {
  id: string;
  model?: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason?: string;
  }>;
  usage?: Record<string, unknown>;
};

// Russian Trusted Root CA + Sub CA (public certificates, gu-st.ru). Committed as
// literals so serverless bundles never depend on file tracing.
const RUSSIAN_TRUSTED_ROOT_CA = `-----BEGIN CERTIFICATE-----
MIIFwjCCA6qgAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwcDELMAkGA1UEBhMCUlUx
PzA9BgNVBAoMNlRoZSBNaW5pc3RyeSBvZiBEaWdpdGFsIERldmVsb3BtZW50IGFu
ZCBDb21tdW5pY2F0aW9uczEgMB4GA1UEAwwXUnVzc2lhbiBUcnVzdGVkIFJvb3Qg
Q0EwHhcNMjIwMzAxMjEwNDE1WhcNMzIwMjI3MjEwNDE1WjBwMQswCQYDVQQGEwJS
VTE/MD0GA1UECgw2VGhlIE1pbmlzdHJ5IG9mIERpZ2l0YWwgRGV2ZWxvcG1lbnQg
YW5kIENvbW11bmljYXRpb25zMSAwHgYDVQQDDBdSdXNzaWFuIFRydXN0ZWQgUm9v
dCBDQTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAMfFOZ8pUAL3+r2n
qqE0Zp52selXsKGFYoG0GM5bwz1bSFtCt+AZQMhkWQheI3poZAToYJu69pHLKS6Q
XBiwBC1cvzYmUYKMYZC7jE5YhEU2bSL0mX7NaMxMDmH2/NwuOVRj8OImVa5s1F4U
zn4Kv3PFlDBjjSjXKVY9kmjUBsXQrIHeaqmUIsPIlNWUnimXS0I0abExqkbdrXbX
YwCOXhOO2pDUx3ckmJlCMUGacUTnylyQW2VsJIyIGA8V0xzdaeUXg0VZ6ZmNUr5Y
Ber/EAOLPb8NYpsAhJe2mXjMB/J9HNsoFMBFJ0lLOT/+dQvjbdRZoOT8eqJpWnVD
U+QL/qEZnz57N88OWM3rabJkRNdU/Z7x5SFIM9FrqtN8xewsiBWBI0K6XFuOBOTD
4V08o4TzJ8+Ccq5XlCUW2L48pZNCYuBDfBh7FxkB7qDgGDiaftEkZZfApRg2E+M9
G8wkNKTPLDc4wH0FDTijhgxR3Y4PiS1HL2Zhw7bD3CbslmEGgfnnZojNkJtcLeBH
BLa52/dSwNU4WWLubaYSiAmA9IUMX1/RpfpxOxd4Ykmhz97oFbUaDJFipIggx5sX
ePAlkTdWnv+RWBxlJwMQ25oEHmRguNYf4Zr/Rxr9cS93Y+mdXIZaBEE0KS2iLRqa
OiWBki9IMQU4phqPOBAaG7A+eP8PAgMBAAGjZjBkMB0GA1UdDgQWBBTh0YHlzlpf
BKrS6badZrHF+qwshzAfBgNVHSMEGDAWgBTh0YHlzlpfBKrS6badZrHF+qwshzAS
BgNVHRMBAf8ECDAGAQH/AgEEMA4GA1UdDwEB/wQEAwIBhjANBgkqhkiG9w0BAQsF
AAOCAgEAALIY1wkilt/urfEVM5vKzr6utOeDWCUczmWX/RX4ljpRdgF+5fAIS4vH
tmXkqpSCOVeWUrJV9QvZn6L227ZwuE15cWi8DCDal3Ue90WgAJJZMfTshN4OI8cq
W9E4EG9wglbEtMnObHlms8F3CHmrw3k6KmUkWGoa+/ENmcVl68u/cMRl1JbW2bM+
/3A+SAg2c6iPDlehczKx2oa95QW0SkPPWGuNA/CE8CpyANIhu9XFrj3RQ3EqeRcS
AQQod1RNuHpfETLU/A2gMmvn/w/sx7TB3W5BPs6rprOA37tutPq9u6FTZOcG1Oqj
C/B7yTqgI7rbyvox7DEXoX7rIiEqyNNUguTk/u3SZ4VXE2kmxdmSh3TQvybfbnXV
4JbCZVaqiZraqc7oZMnRoWrXRG3ztbnbes/9qhRGI7PqXqeKJBztxRTEVj8ONs1d
WN5szTwaPIvhkhO3CO5ErU2rVdUr89wKpNXbBODFKRtgxUT70YpmJ46VVaqdAhOZ
D9EUUn4YaeLaS8AjSF/h7UkjOibNc4qVDiPP+rkehFWM66PVnP1Msh93tc+taIfC
EYVMxjh8zNbFuoc7fzvvrFILLe7ifvEIUqSVIC/AzplM/Jxw7buXFeGP1qVCBEHq
391d/9RAfaZ12zkwFsl+IKwE/OZxW8AHa9i1p4GO0YSNuczzEm4=
-----END CERTIFICATE-----`;

const RUSSIAN_TRUSTED_SUB_CA = `-----BEGIN CERTIFICATE-----
MIIHQjCCBSqgAwIBAgICEAIwDQYJKoZIhvcNAQELBQAwcDELMAkGA1UEBhMCUlUx
PzA9BgNVBAoMNlRoZSBNaW5pc3RyeSBvZiBEaWdpdGFsIERldmVsb3BtZW50IGFu
ZCBDb21tdW5pY2F0aW9uczEgMB4GA1UEAwwXUnVzc2lhbiBUcnVzdGVkIFJvb3Qg
Q0EwHhcNMjIwMzAyMTEyNTE5WhcNMjcwMzA2MTEyNTE5WjBvMQswCQYDVQQGEwJS
VTE/MD0GA1UECgw2VGhlIE1pbmlzdHJ5IG9mIERpZ2l0YWwgRGV2ZWxvcG1lbnQg
YW5kIENvbW11bmljYXRpb25zMR8wHQYDVQQDDBZSdXNzaWFuIFRydXN0ZWQgU3Vi
IENBMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA9YPqBKOk19NFymrE
wehzrhBEgT2atLezpduB24mQ7CiOa/HVpFCDRZzdxqlh8drku408/tTmWzlNH/br
HuQhZ/miWKOf35lpKzjyBd6TPM23uAfJvEOQ2/dnKGGJbsUo1/udKSvxQwVHpVv3
S80OlluKfhWPDEXQpgyFqIzPoxIQTLZ0deirZwMVHarZ5u8HqHetRuAtmO2ZDGQn
vVOJYAjls+Hiueq7Lj7Oce7CQsTwVZeP+XQx28PAaEZ3y6sQEt6rL06ddpSdoTMp
BnCqTbxW+eWMyjkIn6t9GBtUV45yB1EkHNnj2Ex4GwCiN9T84QQjKSr+8f0psGrZ
vPbCbQAwNFJjisLixnjlGPLKa5vOmNwIh/LAyUW5DjpkCx004LPDuqPpFsKXNKpa
L2Dm6uc0x4Jo5m+gUTVORB6hOSzWnWDj2GWfomLzzyjG81DRGFBpco/O93zecsIN
3SL2Ysjpq1zdoS01CMYxie//9zWvYwzI25/OZigtnpCIrcd2j1Y6dMUFQAzAtHE+
qsXflSL8HIS+IJEFIQobLlYhHkoE3avgNx5jlu+OLYe0dF0Ykx1PGNjbwqvTX37R
Cn32NMjlotW2QcGEZhDKj+3urZizp5xdTPZitA+aEjZM/Ni71VOdiOP0igbw6asZ
2fxdozZ1TnSSYNYvNATwthNmZysCAwEAAaOCAeUwggHhMBIGA1UdEwEB/wQIMAYB
Af8CAQAwDgYDVR0PAQH/BAQDAgGGMB0GA1UdDgQWBBTR4XENCy2BTm6KSo9MI7NM
XqtpCzAfBgNVHSMEGDAWgBTh0YHlzlpfBKrS6badZrHF+qwshzCBxwYIKwYBBQUH
AQEEgbowgbcwOwYIKwYBBQUHMAKGL2h0dHA6Ly9yb3N0ZWxlY29tLnJ1L2NkcC9y
b290Y2Ffc3NsX3JzYTIwMjIuY3J0MDsGCCsGAQUFBzAChi9odHRwOi8vY29tcGFu
eS5ydC5ydS9jZHAvcm9vdGNhX3NzbF9yc2EyMDIyLmNydDA7BggrBgEFBQcwAoYv
aHR0cDovL3JlZXN0ci1wa2kucnUvY2RwL3Jvb3RjYV9zc2xfcnNhMjAyMi5jcnQw
gbAGA1UdHwSBqDCBpTA1oDOgMYYvaHR0cDovL3Jvc3RlbGVjb20ucnUvY2RwL3Jv
b3RjYV9zc2xfcnNhMjAyMi5jcmwwNaAzoDGGL2h0dHA6Ly9jb21wYW55LnJ0LnJ1
L2NkcC9yb290Y2Ffc3NsX3JzYTIwMjIuY3JsMDWgM6Axhi9odHRwOi8vcmVlc3Ry
LXBraS5ydS9jZHAvcm9vdGNhX3NzbF9yc2EyMDIyLmNybDANBgkqhkiG9w0BAQsF
AAOCAgEARBVzZls79AdiSCpar15dA5Hr/rrT4WbrOfzlpI+xrLeRPrUG6eUWIW4v
Sui1yx3iqGLCjPcKb+HOTwoRMbI6ytP/ndp3TlYua2advYBEhSvjs+4vDZNwXr/D
anbwIWdurZmViQRBDFebpkvnIvru/RpWud/5r624Wp8voZMRtj/cm6aI9LtvBfT9
cfzhOaexI/99c14dyiuk1+6QhdwKaCRTc1mdfNQmnfWNRbfWhWBlK3h4GGE9JK33
Gk8ZS8DMrkdAh0xby4xAQ/mSWAfWrBmfzlOqGyoB1U47WTOeqNbWkkoAP2ys94+s
Jg4NTkiDVtXRF6nr6fYi0bSOvOFg0IQrMXO2Y8gyg9ARdPJwKtvWX8VPADCYMiWH
h4n8bZokIrImVKLDQKHY4jCsND2HHdJfnrdL2YJw1qFskNO4cSNmZydw0Wkgjv9k
F+KxqrDKlB8MZu2Hclph6v/CZ0fQ9YuE8/lsHZ0Qc2HyiSMnvjgK5fDc3TD4fa8F
E8gMNurM+kV8PT8LNIM+4Zs+LKEV8nqRWBaxkIVJGekkVKO8xDBOG/aN62AZKHOe
GcyIdu7yNMMRihGVZCYr8rYiJoKiOzDqOkPkLOPdhtVlgnhowzHDxMHND/E2WA5p
ZHuNM/m0TXt2wTTPL7JH2YC0gPz/BvvSzjksgzU5rLbRyUKQkgU=
-----END CERTIFICATE-----`;

const httpsAgent = new https.Agent({
  keepAlive: true,
  ca: [RUSSIAN_TRUSTED_ROOT_CA, RUSSIAN_TRUSTED_SUB_CA]
});

type HttpResponse = {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  text: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpRequest(
  url: string,
  options: {
    method: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: Buffer | string;
    timeoutMs?: number;
  }
): Promise<HttpResponse> {
  const timeoutMs = options.timeoutMs ?? 60000;
  const parsed = new URL(url);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: `${parsed.pathname}${parsed.search}`,
        method: options.method,
        headers: options.headers,
        agent: httpsAgent
      },
      res => {
        const chunks: Buffer[] = [];
        res.on('data', chunk => chunks.push(chunk as Buffer));
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers,
            text: Buffer.concat(chunks).toString('utf8')
          })
        );
        res.on('error', reject);
      }
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`GigaChat request timed out after ${timeoutMs}ms`));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// In-process throttling: keeps bursts from hammering the synchronous API.
// ---------------------------------------------------------------------------
let activeRequests = 0;
let lastFinishedAt = 0;

const MAX_CONCURRENT = Math.max(1, Number(process.env.GIGACHAT_MAX_CONCURRENCY ?? '4'));
const MIN_DELAY_MS = Math.max(0, Number(process.env.GIGACHAT_MIN_DELAY_MS ?? '100'));

async function acquireSlot(): Promise<void> {
  while (activeRequests >= MAX_CONCURRENT) {
    await sleep(50);
  }
  const sinceLast = Date.now() - lastFinishedAt;
  if (sinceLast < MIN_DELAY_MS) {
    await sleep(MIN_DELAY_MS - sinceLast);
  }
  activeRequests += 1;
}

function releaseSlot(): void {
  activeRequests = Math.max(0, activeRequests - 1);
  lastFinishedAt = Date.now();
}

// ---------------------------------------------------------------------------
// OAuth token cache
// ---------------------------------------------------------------------------
let cachedToken: { token: string; expiresAt: number } | null = null;
let tokenInFlight: Promise<{ token: string; expiresAt: number }> | null = null;

function basicAuthKey(raw: string): string {
  const key = raw.trim();
  // The cabinet hands out client_id:client_secret already base64-encoded; a raw
  // "id:secret" pair is encoded here for convenience.
  return key.includes(':') ? Buffer.from(key, 'utf8').toString('base64') : key;
}

async function fetchToken(): Promise<{ token: string; expiresAt: number }> {
  const config = getConfig();
  const body = new URLSearchParams({ scope: config.gigachatScope }).toString();
  const res = await httpRequest(config.gigachatOauthUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      RqUID: randomUUID(),
      Authorization: `Basic ${basicAuthKey(config.gigachatAuthKey)}`,
      'Content-Length': String(Buffer.byteLength(body))
    },
    body,
    timeoutMs: 20000
  });

  if (res.status !== 200) {
    throw new Error(`GigaChat OAuth failed (${res.status}): ${res.text.slice(0, 200)}`);
  }

  let json: { access_token?: string; expires_at?: number };
  try {
    json = JSON.parse(res.text);
  } catch {
    throw new Error(`GigaChat OAuth returned non-JSON: ${res.text.slice(0, 120)}`);
  }
  if (!json.access_token) {
    throw new Error('GigaChat OAuth returned no access_token');
  }
  return {
    token: json.access_token,
    expiresAt: json.expires_at ?? Date.now() + 25 * 60 * 1000
  };
}

export async function getGigaChatToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedToken && cachedToken.expiresAt - 60000 > Date.now()) {
    return cachedToken.token;
  }
  if (!tokenInFlight) {
    tokenInFlight = fetchToken()
      .then(token => {
        cachedToken = token;
        return token;
      })
      .finally(() => {
        tokenInFlight = null;
      });
  }
  const token = await tokenInFlight;
  return token.token;
}

// ---------------------------------------------------------------------------
// Chat completions with sequential model fallback
// ---------------------------------------------------------------------------
/**
 * Call GigaChat /chat/completions.
 *
 * @param payload  Request payload; `models` is tried in order (primary first).
 * @param maxRetries  Retries per model for 429/5xx/network errors.
 * @param initialDelayMs  Base delay for exponential backoff.
 */
export async function callGigaChat(
  payload: GigaChatRequest,
  maxRetries: number = 2,
  initialDelayMs: number = 1000
): Promise<GigaChatResponse> {
  const config = getConfig();
  const url = `${config.llmBaseUrl}/chat/completions`;

  const models = (payload.models && payload.models.length > 0
    ? payload.models
    : [payload.model]
  ).filter((m): m is string => Boolean(m));

  if (models.length === 0) {
    throw new Error('GigaChat request failed (400): no model configured');
  }

  logInfo('gigachat_request_start', {
    models,
    messageCount: payload.messages.length,
    maxTokens: payload.max_tokens
  });

  let lastError: Error | null = null;

  for (const model of models) {
    let authRetried = false;
    let tryNextModel = false;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      await acquireSlot();
      try {
        const token = await getGigaChatToken();
        const body = JSON.stringify({
          model,
          messages: payload.messages,
          max_tokens: payload.max_tokens,
          temperature: payload.temperature,
          stream: false
        });

        const startedAt = Date.now();
        const res = await httpRequest(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Length': String(Buffer.byteLength(body))
          },
          body,
          timeoutMs: 60000
        });

        if (res.status === 200) {
          let json: GigaChatResponse;
          try {
            json = JSON.parse(res.text) as GigaChatResponse;
          } catch {
            throw new Error(`GigaChat returned malformed JSON: ${res.text.slice(0, 120)}`);
          }
          if (!json.choices?.length) {
            throw new Error(`GigaChat returned no choices: ${res.text.slice(0, 200)}`);
          }
          logInfo(model === models[0] ? 'gigachat_success' : 'gigachat_success_fallback', {
            model,
            usedModel: json.model,
            requestModels: models,
            durationMs: Date.now() - startedAt
          });
          return json;
        }

        const bodyText = res.text.slice(0, 400);

        // Unknown/unavailable model — fall through to the next fallback model
        // instead of failing the whole request.
        if (res.status === 404 || (res.status === 400 && /model/i.test(bodyText))) {
          lastError = new Error(`GigaChat model unavailable (${res.status}) on ${model}: ${bodyText}`);
          logWarn('gigachat_model_unavailable', { model, status: res.status, body: bodyText });
          tryNextModel = true;
          break;
        }

        // Expired / revoked token: refresh once and repeat this attempt.
        if (res.status === 401 && !authRetried) {
          authRetried = true;
          logWarn('gigachat_token_refresh', { model, body: bodyText });
          await getGigaChatToken(true);
          attempt -= 1;
          continue;
        }

        // Context too large for this model — try the next one, that is the whole
        // point of the fallback list.
        if (res.status === 413 || res.status === 402) {
          lastError = new Error(
            `GigaChat token limit exceeded (${res.status}) on ${model}: ${bodyText}`
          );
          logWarn('gigachat_token_limit', { model, status: res.status, body: bodyText });
          tryNextModel = true;
          break;
        }

        if (res.status === 429) {
          const retryAfter = res.headers['retry-after'];
          const retryAfterMs = Array.isArray(retryAfter)
            ? Number(retryAfter[0]) * 1000
            : retryAfter
              ? Number(retryAfter) * 1000
              : Number.NaN;
          const delayMs = Number.isFinite(retryAfterMs)
            ? retryAfterMs
            : initialDelayMs * Math.pow(2, attempt);
          if (attempt < maxRetries) {
            logWarn('gigachat_rate_limited', { model, attempt: attempt + 1, delayMs });
            await sleep(delayMs);
            continue;
          }
          throw new Error(`GigaChat rate limit exceeded (429) on ${model}: ${bodyText}`);
        }

        if (res.status >= 500) {
          if (attempt < maxRetries) {
            const delayMs = initialDelayMs * Math.pow(2, attempt);
            logWarn('gigachat_server_error_retry', { model, status: res.status, delayMs });
            await sleep(delayMs);
            continue;
          }
          throw new Error(`GigaChat request failed (${res.status}) on ${model}: ${bodyText}`);
        }

        throw new Error(`GigaChat request failed (${res.status}) on ${model}: ${bodyText}`);
      } catch (error) {
        lastError = error as Error;
        const message = (error as Error).message || 'Unknown error';
        const retryable = !/\(\d{3}\)/.test(message); // no HTTP status => network/timeout
        logError('gigachat_exception', {
          model,
          attempt: attempt + 1,
          message,
          retryable
        });
        if (retryable && attempt < maxRetries) {
          const delayMs = initialDelayMs * Math.pow(2, attempt);
          await sleep(delayMs);
          continue;
        }
        throw error;
      } finally {
        releaseSlot();
      }
    }

    if (tryNextModel) {
      continue;
    }
  }

  throw lastError || new Error('GigaChat request failed after all retries');
}

// ---------------------------------------------------------------------------
// Files (image/OCR input) and model listing
// ---------------------------------------------------------------------------
/**
 * Upload a binary to GigaChat storage and return its file id, suitable for the
 * `attachments` field of a message.
 */
export async function uploadGigaChatFile(
  data: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const config = getConfig();
  const token = await getGigaChatToken();
  const boundary = `----gigachat${randomUUID().replace(/-/g, '')}`;
  const head = Buffer.from(
    `--${boundary}\r\n` +
      'Content-Disposition: form-data; name="purpose"\r\n\r\n' +
      'general\r\n' +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: ${contentType}\r\n\r\n`,
    'utf8'
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
  const body = Buffer.concat([head, data, tail]);

  const res = await httpRequest(`${config.llmBaseUrl}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': String(body.length)
    },
    body,
    timeoutMs: 60000
  });

  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`GigaChat file upload failed (${res.status}): ${res.text.slice(0, 200)}`);
  }

  let json: { id?: string };
  try {
    json = JSON.parse(res.text);
  } catch {
    throw new Error(`GigaChat file upload returned non-JSON: ${res.text.slice(0, 120)}`);
  }
  if (!json.id) {
    throw new Error('GigaChat file upload returned no id');
  }
  return json.id;
}

/** List models available to the configured authorization key. */
export async function listGigaChatModels(): Promise<string[]> {
  const config = getConfig();
  const token = await getGigaChatToken();
  const res = await httpRequest(`${config.llmBaseUrl}/models`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    timeoutMs: 10000
  });
  if (res.status !== 200) {
    throw new Error(`Status ${res.status}: ${res.text.slice(0, 160)}`);
  }
  const json = JSON.parse(res.text) as { data?: Array<{ id?: string }> };
  return (json.data ?? []).map(m => m.id).filter((id): id is string => Boolean(id));
}
