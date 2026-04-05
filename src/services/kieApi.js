const API_ROOT = 'https://api.kie.ai/api/v1';

const PROVIDERS = {
  sora: {
    key: 'sora',
    label: 'Sora Jobs API',
    createPath: '/jobs/createTask',
    statusPath: '/jobs/recordInfo',
    models: ['sora-2-text-to-video'],
    defaultModel: 'sora-2-text-to-video',
  },
  runway: {
    key: 'runway',
    label: 'Runway Generate API',
    createPath: '/runway/generate',
    statusPath: '/runway/record-detail',
    models: ['runway-duration-5-generate'],
    defaultModel: 'runway-duration-5-generate',
  },
};

export const PROVIDER_OPTIONS = Object.values(PROVIDERS).map(({ key, label }) => ({ key, label }));

export const MODEL_OPTIONS = Object.fromEntries(
  Object.values(PROVIDERS).map(({ key, models }) => [key, models]),
);

const getProvider = (providerKey) => PROVIDERS[providerKey] || PROVIDERS.sora;

const getApiKey = () => {
  const key = import.meta.env.VITE_KIE_API_KEY;
  if (!key) {
    throw new Error('Missing API key. Set VITE_KIE_API_KEY in your .env file.');
  }
  return key;
};

const parseApiError = async (response) => {
  let message = `Request failed with status ${response.status}`;
  try {
    const data = await response.json();
    message = data?.message || data?.msg || message;
  } catch {
    // keep default message
  }
  if (response.status === 401 || response.status === 403) {
    return 'Invalid or unauthorized API key. Check VITE_KIE_API_KEY.';
  }
  return message;
};

const normalizeState = (state) => {
  if (!state) return null;
  const normalized = String(state).toLowerCase();
  if (['success', 'succeed', 'succeeded', 'completed'].includes(normalized)) return 'success';
  if (['failed', 'fail', 'error', 'cancelled', 'canceled'].includes(normalized)) return 'failed';
  if (['wait', 'waiting', 'queue', 'queued', 'processing', 'pending', 'running'].includes(normalized)) {
    return 'processing';
  }
  return normalized;
};

const createSoraPayload = (prompt, config, model) => ({
  model,
  input: {
    prompt: prompt.trim(),
    aspect_ratio: config.aspectRatio,
    n_frames: String(config.nFrames),
    remove_watermark: config.removeWatermark,
    upload_method: 's3',
  },
});

const createRunwayPayload = (prompt, config, model) => {
  const payload = {
    prompt: prompt.trim(),
    model,
  };

  if (config.imageUrl?.trim()) payload.imageUrl = config.imageUrl.trim();
  if (config.waterMark?.trim()) payload.waterMark = config.waterMark.trim();
  if (config.callBackUrl?.trim()) payload.callBackUrl = config.callBackUrl.trim();

  return payload;
};

export const createTask = async (prompt, config) => {
  if (!prompt?.trim()) {
    throw new Error('Prompt is required.');
  }

  const provider = getProvider(config.provider);
  const model = config.model || provider.defaultModel;
  const payload =
    provider.key === 'runway'
      ? createRunwayPayload(prompt, config, model)
      : createSoraPayload(prompt, config, model);

  const response = await fetch(`${API_ROOT}${provider.createPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = await response.json();
  const taskId = data?.data?.taskId;
  if (!taskId) {
    throw new Error('Task creation succeeded but no taskId was returned.');
  }

  return taskId;
};

const extractVideoUrlFromSora = (raw) => {
  const resultJson = raw?.data?.resultJson;
  if (!resultJson) {
    throw new Error('Task marked as success but resultJson was empty.');
  }

  let parsed;
  try {
    parsed = JSON.parse(resultJson);
  } catch {
    throw new Error('Could not parse resultJson from API response.');
  }

  const videoUrl = parsed?.resultUrls?.[0] || null;
  if (!videoUrl) {
    throw new Error('Task succeeded but no video URL was found in resultUrls.');
  }

  return videoUrl;
};

const extractVideoUrlFromRunway = (raw) => {
  const videoUrl = raw?.data?.videoInfo?.videoUrl || null;
  if (!videoUrl) {
    throw new Error('Task succeeded but no video URL was found in videoInfo.videoUrl.');
  }
  return videoUrl;
};

export const getTaskStatus = async (taskId, providerKey = 'sora') => {
  if (!taskId?.trim()) {
    throw new Error('Task ID is required.');
  }

  const provider = getProvider(providerKey);

  const response = await fetch(
    `${API_ROOT}${provider.statusPath}?taskId=${encodeURIComponent(taskId.trim())}`,
    {
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = await response.json();
  const state = normalizeState(data?.data?.state);
  if (!state) {
    throw new Error('Invalid response: missing task state.');
  }

  let videoUrl = null;
  if (state === 'success') {
    videoUrl = provider.key === 'runway' ? extractVideoUrlFromRunway(data) : extractVideoUrlFromSora(data);
  }

  return {
    state,
    videoUrl,
    raw: data,
  };
};
