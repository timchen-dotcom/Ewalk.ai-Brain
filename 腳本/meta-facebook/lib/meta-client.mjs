export class MetaApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'MetaApiError';
    this.status = details.status;
    this.metaMessage = details.metaMessage;
    this.metaCode = details.metaCode;
    this.metaSubcode = details.metaSubcode;
    this.metaType = details.metaType;
    this.metaErrorData = details.metaErrorData;
    this.metaTraceId = details.metaTraceId;
    this.metaUserTitle = details.metaUserTitle;
    this.metaUserMessage = details.metaUserMessage;
  }
}

export async function graphGet(path, options = {}) {
  return requestGraph('GET', path, options);
}

export async function graphPost(path, options = {}) {
  return requestGraph('POST', path, options);
}

export async function graphPostMultipart(path, options = {}) {
  const {
    apiBase = 'https://graph.facebook.com',
    graphVersion = 'v25.0',
    fields = {},
    files = [],
    token,
  } = options;

  if (!token) {
    throw new Error('缺少 Page access token。請只放在本機環境變數，不要貼到聊天或文件。');
  }

  const endpoint = buildEndpoint(apiBase, graphVersion, path);
  const form = new FormData();

  for (const [key, value] of Object.entries(cleanParams(fields))) {
    form.set(key, value);
  }

  for (const file of files) {
    form.set(file.field, file.blob, file.filename);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });
  const body = await parseJson(response);

  if (!response.ok || body?.error) {
    const error = body?.error || {};
    throw new MetaApiError(error.message || `Meta API 呼叫失敗：POST ${path}`, {
      status: response.status,
      metaMessage: error.message,
      metaCode: error.code,
      metaSubcode: error.error_subcode,
      metaType: error.type,
      metaErrorData: error.error_data,
      metaTraceId: error.fbtrace_id,
      metaUserTitle: error.error_user_title,
      metaUserMessage: error.error_user_msg,
    });
  }

  return body;
}

async function requestGraph(method, graphPath, options) {
  const {
    apiBase = 'https://graph.facebook.com',
    graphVersion = 'v25.0',
    params = {},
    token,
  } = options;

  if (!token) {
    throw new Error('缺少 Page access token。請只放在本機環境變數，不要貼到聊天或文件。');
  }

  const endpoint = buildEndpoint(apiBase, graphVersion, graphPath);
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const requestOptions = {
    method,
    headers,
  };

  let url = endpoint;
  if (method === 'GET') {
    url = appendQuery(endpoint, params);
  } else {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    requestOptions.body = new URLSearchParams(cleanParams(params));
  }

  const response = await fetch(url, requestOptions);
  const body = await parseJson(response);

  if (!response.ok || body?.error) {
    const error = body?.error || {};
    throw new MetaApiError(error.message || `Meta API 呼叫失敗：${method} ${graphPath}`, {
      status: response.status,
      metaMessage: error.message,
      metaCode: error.code,
      metaSubcode: error.error_subcode,
      metaType: error.type,
      metaErrorData: error.error_data,
      metaTraceId: error.fbtrace_id,
      metaUserTitle: error.error_user_title,
      metaUserMessage: error.error_user_msg,
    });
  }

  return body;
}

function buildEndpoint(apiBase, graphVersion, graphPath) {
  const cleanPath = String(graphPath).replace(/^\/+/, '');
  return `${apiBase}/${graphVersion}/${cleanPath}`;
}

function appendQuery(endpoint, params) {
  const url = new URL(endpoint);

  for (const [key, value] of Object.entries(cleanParams(params))) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

async function parseJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new MetaApiError('Meta API 回傳不是 JSON，請稍後重試或檢查 Graph API 狀態。', {
      status: response.status,
    });
  }
}
