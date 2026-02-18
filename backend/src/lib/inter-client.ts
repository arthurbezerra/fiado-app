import axios, { AxiosInstance } from 'axios';
import https from 'https';
import fs from 'fs';
import qs from 'qs';

// ─── mTLS Agent ───────────────────────────────────────────────────────────────
// O Banco Inter exige mTLS: toda requisição precisa apresentar o certificado
// do cliente (.crt) e a chave privada (.key) emitidos pelo próprio Inter.
// Suporta dois modos: caminho de arquivo (local) ou Base64 (produção/secrets).

function buildHttpsAgent(): https.Agent {
  let cert: Buffer;
  let key: Buffer;

  if (process.env.INTER_CERT_PATH && process.env.INTER_KEY_PATH) {
    cert = fs.readFileSync(process.env.INTER_CERT_PATH);
    key = fs.readFileSync(process.env.INTER_KEY_PATH);
  } else if (process.env.INTER_CERT_B64 && process.env.INTER_KEY_B64) {
    cert = Buffer.from(process.env.INTER_CERT_B64, 'base64');
    key = Buffer.from(process.env.INTER_KEY_B64, 'base64');
  } else {
    throw new Error(
      'Certificados mTLS não configurados. ' +
      'Defina INTER_CERT_PATH + INTER_KEY_PATH ou INTER_CERT_B64 + INTER_KEY_B64.'
    );
  }

  return new https.Agent({
    cert,
    key,
    // Rejeita certificados inválidos em produção
    rejectUnauthorized: process.env.NODE_ENV !== 'development',
  });
}

// Singleton: o agent é criado uma vez e reutilizado em todas as requisições
let _httpsAgent: https.Agent | null = null;

function getHttpsAgent(): https.Agent {
  if (!_httpsAgent) {
    _httpsAgent = buildHttpsAgent();
  }
  return _httpsAgent;
}

// ─── OAuth2 — Client Credentials ─────────────────────────────────────────────
// O Inter usa OAuth2 com grant_type=client_credentials.
// O token tem validade de 3600s. Mantemos em cache e renovamos 60s antes de expirar.

interface TokenCache {
  accessToken: string;
  expiresAt: number; // Unix timestamp em ms
}

let tokenCache: TokenCache | null = null;

async function fetchNewToken(): Promise<TokenCache> {
  const BASE_URL = process.env.INTER_BASE_URL!;

  const response = await axios.post(
    `${BASE_URL}/oauth/v2/token`,
    qs.stringify({
      client_id: process.env.INTER_CLIENT_ID!,
      client_secret: process.env.INTER_CLIENT_SECRET!,
      grant_type: 'client_credentials',
      // Todos os scopes necessários: cobranças, leitura Pix, repasse e webhook
      scope: 'cob.write cob.read pix.read pix.write pagamento-pix.write webhook.write webhook.read',
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      httpsAgent: getHttpsAgent(),
    }
  );

  return {
    accessToken: response.data.access_token,
    expiresAt: Date.now() + response.data.expires_in * 1_000,
  };
}

async function getAccessToken(): Promise<string> {
  const REFRESH_BEFORE_MS = 60_000; // Renova 60s antes de expirar

  if (tokenCache && tokenCache.expiresAt > Date.now() + REFRESH_BEFORE_MS) {
    return tokenCache.accessToken;
  }

  tokenCache = await fetchNewToken();
  return tokenCache.accessToken;
}

// ─── Factory: Axios com mTLS + Bearer Token ───────────────────────────────────
// Use esta função para obter um cliente já autenticado e configurado.

export async function createInterClient(): Promise<AxiosInstance> {
  const token = await getAccessToken();

  const client = axios.create({
    baseURL: process.env.INTER_BASE_URL,
    httpsAgent: getHttpsAgent(),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 30_000,
  });

  // Interceptor: loga erros de API com detalhes da resposta Inter
  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response) {
        const { status, data } = err.response;
        err.message = `Inter API ${status}: ${JSON.stringify(data)}`;
      }
      return Promise.reject(err);
    }
  );

  return client;
}
