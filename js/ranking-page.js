(function () {
  'use strict';

  const SUPABASE_URL = 'https://qqwdgsanojynhimodgyz.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxd2Rnc2Fub2p5bmhpbW9kZ3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMzYwOTUsImV4cCI6MjA5OTgxMjA5NX0.Rip29YLG3Ck-LEMtPVxBsuE8p1vnarmMdU_FoYDbOfU';
  const MAX_RANKING = 100;

  function setStatus(message, isError) {
    const status = document.getElementById('ranking-page-status');
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('is-error', Boolean(isError));
  }

  async function supabaseRequest(path, options) {
    const response = await fetch(SUPABASE_URL + path, {
      ...options,
      cache: 'no-store',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        ...(options && options.headers ? options.headers : {})
      }
    });

    const text = await response.text();
    let body = null;
    if (text) {
      try { body = JSON.parse(text); } catch (_) { body = text; }
    }

    if (!response.ok) {
      const detail = body && typeof body === 'object'
        ? (body.message || body.details || body.hint || JSON.stringify(body))
        : (body || response.statusText);
      throw new Error('HTTP ' + response.status + ': ' + detail);
    }
    return body;
  }

  function renderRows(records) {
    const tbody = document.getElementById('ranking-page-body');
    if (!tbody) return;
    tbody.textContent = '';

    if (!records.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = 'まだ記録がありません';
      row.appendChild(cell);
      tbody.appendChild(row);
      return;
    }

    records.forEach(function (record, index) {
      const row = document.createElement('tr');
      const rank = document.createElement('td');
      const name = document.createElement('td');
      const score = document.createElement('td');
      rank.textContent = String(index + 1);
      name.textContent = String(record.player_name || '').slice(0, 10);
      score.textContent = Math.max(0, Math.floor(Number(record.score) || 0)).toLocaleString('ja-JP') + '点';
      row.append(rank, name, score);
      tbody.appendChild(row);
    });
  }

  async function loadRanking() {
    // 前回表示したランキングを先に消し、取得結果が0件なら必ず空表示に更新する。
    renderRows([]);
    setStatus('ランキングを読み込んでいます...');
    try {
      const query = '?select=player_name,score,created_at&order=score.desc,created_at.asc&limit=' + MAX_RANKING;
      const data = await supabaseRequest('/rest/v1/shooting_scores' + query, { method: 'GET' });
      renderRows(Array.isArray(data) ? data : []);
      setStatus(data.length ? '最新のランキングを表示しています。' : '現在、ランキング記録はありません。');
    } catch (error) {
      console.error(error);
      renderRows([]);
      setStatus('ランキング取得エラー：' + error.message, true);
    }
  }

  async function resetRanking() {
    const input = document.getElementById('ranking-reset-password');
    const button = document.getElementById('ranking-reset-button');
    const password = input ? input.value : '';

    if (!password) {
      setStatus('管理者パスワードを入力してください。', true);
      if (input) input.focus();
      return;
    }

    if (!window.confirm('ランキングを全件削除します。本当に実行しますか？')) return;

    button.disabled = true;
    setStatus('ランキングをリセットしています...');

    try {
      const result = await supabaseRequest('/rest/v1/rpc/reset_shooting_ranking', {
        method: 'POST',
        body: JSON.stringify({ admin_password: password })
      });
      if (input) input.value = '';
      const deleted = Number(result) || 0;
      await loadRanking();
      setStatus(deleted + '件の記録を削除しました。');
    } catch (error) {
      console.error(error);
      setStatus('リセットエラー：パスワードまたはSupabase設定を確認してください。' + '（' + error.message + '）', true);
    } finally {
      button.disabled = false;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const reload = document.getElementById('ranking-page-reload');
    const reset = document.getElementById('ranking-reset-button');
    if (reload) reload.addEventListener('click', loadRanking);
    if (reset) reset.addEventListener('click', resetRanking);
    loadRanking();
  });
})();
