// src/components/GooglePicker.jsx
// Google Drive File Picker — завантаження файлів напряму в Drive
import { useState, useEffect, useCallback } from 'react';

const CLIENT_ID = '672418587506-sjjtj5ca3l2hug2j9pqq4v2j88ni9rls.apps.googleusercontent.com';
const API_KEY   = 'AIzaSyB8Kaj60LFh9kaYLgtso_kuX8m29T-nVd8';
const SCOPES    = 'https://www.googleapis.com/auth/drive.file';

export function useGooglePicker() {
  const [gapiReady,  setGapiReady]  = useState(false);
  const [token,      setToken]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  // Завантажуємо Google API
  useEffect(() => {
    if (window.gapi) { setGapiReady(true); return; }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('picker', () => setGapiReady(true));
    };
    document.head.appendChild(script);
  }, []);

  // Авторизація через Google
  const authorize = useCallback(() => {
    return new Promise((resolve, reject) => {
      const client = window.google?.accounts?.oauth2?.initTokenClient({
        client_id: CLIENT_ID,
        scope:     SCOPES,
        callback:  (response) => {
          if (response.error) { reject(new Error(response.error)); return; }
          setToken(response.access_token);
          resolve(response.access_token);
        },
      });
      if (!client) { reject(new Error('Google Identity Services не завантажено')); return; }
      client.requestAccessToken();
    });
  }, []);

  // Завантажити файл напряму в папку Drive
  const uploadFileToDrive = useCallback(async (file, folderId, accessToken) => {
    const metadata = {
      name:    file.name,
      parents: [folderId],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method:  'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body:    form,
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Помилка завантаження на Drive');
    }

    return await response.json();
  }, []);

  // Головна функція — авторизація + завантаження файлів
  const uploadFiles = useCallback(async (files, folderId) => {
    if (!files || files.length === 0) return { ok: true, count: 0 };

    setLoading(true);
    setError('');

    try {
      // Отримуємо токен (або використовуємо існуючий)
      let accessToken = token;
      if (!accessToken) {
        accessToken = await authorize();
      }

      // Завантажуємо файли по одному
      const results = [];
      for (const file of Array.from(files)) {
        const result = await uploadFileToDrive(file, folderId, accessToken);
        results.push(result);
      }

      return { ok: true, count: results.length, files: results };
    } catch(err) {
      // Якщо токен протух — авторизуємось знову
      if (err.message?.includes('401') || err.message?.includes('invalid_token')) {
        setToken(null);
        const newToken = await authorize();
        const results = [];
        for (const file of Array.from(files)) {
          const result = await uploadFileToDrive(file, folderId, newToken);
          results.push(result);
        }
        return { ok: true, count: results.length, files: results };
      }
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [token, authorize, uploadFileToDrive]);

  return { gapiReady, loading, error, uploadFiles, isAuthorized: !!token };
}
