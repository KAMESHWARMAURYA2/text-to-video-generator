const BASE_URL = 'https://api.kie.ai/api/v1/jobs';

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

export const createTask = async (prompt, config) => {
  if (!prompt?.trim()) {
    throw new Error('Prompt is required.');
  }

  const payload = {
    model: 'sora-2-text-to-video',
    input: {
      prompt: prompt.trim(),
      aspect_ratio: config.aspectRatio,
      n_frames: String(config.nFrames),
      remove_watermark: config.removeWatermark,
      upload_method: 's3',
    },
  };

  const response = await fetch(`${BASE_URL}/createTask`, {
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

export const getTaskStatus = async (taskId) => {
  if (!taskId?.trim()) {
    throw new Error('Task ID is required.');
  }

  const response = await fetch(
    `${BASE_URL}/recordInfo?taskId=${encodeURIComponent(taskId.trim())}`,
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
  const state = data?.data?.state;
  if (!state) {
    throw new Error('Invalid response: missing task state.');
  }

  let videoUrl = null;
  if (state === 'success') {
    const resultJson = data?.data?.resultJson;
    if (!resultJson) {
      throw new Error('Task marked as success but resultJson was empty.');
    }

    let parsed;
    try {
      parsed = JSON.parse(resultJson);
    } catch {
      throw new Error('Could not parse resultJson from API response.');
    }

    videoUrl = parsed?.resultUrls?.[0] || null;
    if (!videoUrl) {
      throw new Error('Task succeeded but no video URL was found in resultUrls.');
    }
  }

  return {
    state,
    videoUrl,
    raw: data,
  };
};
