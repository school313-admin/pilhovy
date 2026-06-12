// src/data/api.js
// Всі запити через Cloudflare Worker — він проксує до GAS без CORS проблем

const WORKER_URL = 'https://pilhovy-proxy.artschool313.workers.dev';

async function request(body) {
  const response = await fetch(WORKER_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  const text = await response.text();

  if (!text || text.trim() === '')
    throw new Error('Worker повернув порожню відповідь');

  let result;
  try {
    result = JSON.parse(text);
  } catch(e) {
    throw new Error('Невалідна відповідь: ' + text.slice(0, 100));
  }

  if (!result.ok) throw new Error(result.error || 'Помилка сервера');
  return result;
}

// Надійна конвертація файлу в base64 через FileReader
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => {
      // reader.result = "data:mime/type;base64,XXXX" — беремо тільки base64 частину
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Помилка читання файлу'));
    reader.readAsDataURL(file);
  });
}

export async function fetchAll() {
  return request({ action: 'getAll' });
}

export async function apiSaveStudent(data) {
  const { files, ...meta } = data;

  // Крок 1: створюємо запис і папку на Drive
  const result = await request({
    action: 'saveStudent',
    ...meta,
    filesCount: files ? files.length : 0,
  });

  // Крок 2: завантажуємо файли по одному через Worker → GAS POST
  if (files && files.length > 0 && result.folderId) {
    for (const file of Array.from(files)) {
      try {
        const base64 = await fileToBase64(file);
        await request({
          action:   'uploadFile',
          folderId: result.folderId,
          name:     file.name,
          mimeType: file.type || 'application/octet-stream',
          data:     base64,
        });
      } catch(e) {
        console.warn('Файл не завантажився:', file.name, e.message);
      }
    }
  }

  return result;
}

export async function apiDeleteStudent(id, folderId) {
  return request({ action: 'deleteStudent', id, folderId });
}

export async function apiUpdateSetting(key, value) {
  return request({ action: 'updateSettings', key, value });
}
