// src/data/useStore.js
// Стан додатку — дані тягнуться з Google Sheets через GAS
import { useState, useEffect, useCallback } from 'react';
import { ALL_CLASSES, CATEGORIES, CURRENT_YEAR } from './constants';
import { fetchAll, apiSaveStudent, apiDeleteStudent, apiUpdateSetting } from './api';

// Дефолтний стан поки дані завантажуються
function defaultState() {
  return {
    classes:       ALL_CLASSES.map(name => ({ name, active: true })),
    categories:    CATEGORIES.map(c => ({ ...c })),
    students:      [],
    years:         [CURRENT_YEAR],
    currentYear:   CURRENT_YEAR,
    adminPassword: '1221',
  };
}

export function useStore() {
  const [state,    setState]   = useState(defaultState);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState('');
  const [syncing,  setSyncing] = useState(false);

  // ---- Завантаження даних з Sheets ----
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAll();

      const students = (data.students || []).map(s => ({
        ...s,
        catId: s.catId ? parseInt(s.catId) : null,
        docs:  s.docs  ? parseInt(s.docs)  : 0,
      }));

      setState(prev => ({
        ...prev,
        students,
        years:         data.settings?.years       || [CURRENT_YEAR],
        currentYear:   data.settings?.currentYear || CURRENT_YEAR,
        adminPassword: String(data.settings?.adminPassword || '1221'),
      }));
    } catch(err) {
      setError('Не вдалось завантажити дані: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ---- Локальне оновлення без перезавантаження ----
  const updateLocal = (fn) => setState(prev => ({ ...prev, ...fn(prev) }));

  // ---- Учні ----
  const addStudent = async (studentData) => {
    setSyncing(true);
    try {
      const result = await apiSaveStudent(studentData);
      // Додаємо локально з даними що повернув сервер
      updateLocal(s => ({
        students: [...s.students, {
          ...studentData,
          id:        result.id,
          folderUrl: result.folderUrl || '',
          folderId:  result.folderId  || '',
          docs:      result.savedFiles || studentData.docs || 0,
          createdAt: result.createdAt,
        }]
      }));
    } finally {
      setSyncing(false);
    }
  };

  const deleteStudent = async (id, folderId) => {
    setSyncing(true);
    try {
      await apiDeleteStudent(id, folderId);
      updateLocal(s => ({ students: s.students.filter(st => st.id.toString() !== id.toString()) }));
    } finally {
      setSyncing(false);
    }
  };

  // ---- Класи (локально — не в Sheets) ----
  const setClassActive = (name, active) => updateLocal(s => ({
    classes: s.classes.map(c => c.name === name ? { ...c, active } : c)
  }));
  const deleteClass = (name) => updateLocal(s => ({
    classes: s.classes.filter(c => c.name !== name)
  }));
  const addClass = (name) => updateLocal(s => ({
    classes: [...s.classes, { name, active: true }]
  }));

  // ---- Категорії (локально) ----
  const addCategory    = (cat)      => updateLocal(s => ({ categories: [...s.categories, { ...cat, id: Date.now() }] }));
  const updateCategory = (id, data) => updateLocal(s => ({ categories: s.categories.map(c => c.id === id ? { ...c, ...data } : c) }));
  const deleteCategory = (id)       => updateLocal(s => ({ categories: s.categories.filter(c => c.id !== id) }));

  // ---- Роки ----
  const addYear = async (year) => {
    const newYears = [...state.years, year];
    updateLocal(() => ({ years: newYears, currentYear: year }));
    if (true) {
      await apiUpdateSetting('years', newYears.join(','));
      await apiUpdateSetting('currentYear', year);
    }
  };

  const setCurrentYear = async (year) => {
    updateLocal(() => ({ currentYear: year }));
    if (true) {
      await apiUpdateSetting('currentYear', year);
    }
  };

  const deleteYear = async (year) => {
    const newYears   = state.years.filter(y => y !== year);
    const newCurrent = state.currentYear === year
      ? (newYears[newYears.length - 1] || state.currentYear)
      : state.currentYear;
    updateLocal(() => ({ years: newYears, currentYear: newCurrent }));
    if (true) {
      await apiUpdateSetting('years', newYears.join(','));
      if (newCurrent !== state.currentYear) await apiUpdateSetting('currentYear', newCurrent);
    }
  };

  // ---- Пароль ----
  const setAdminPassword = async (pwd) => {
    updateLocal(() => ({ adminPassword: pwd }));
    if (true) {
      await apiUpdateSetting('adminPassword', pwd);
    }
  };

  return {
    state,
    loading,
    error,
    syncing,
    reload: loadData,
    addStudent, deleteStudent,
    setClassActive, deleteClass, addClass,
    addCategory, updateCategory, deleteCategory,
    addYear, setCurrentYear, deleteYear,
    setAdminPassword,
  };
}
