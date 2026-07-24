// Supabase共有ランキング（REST API版）
(function () {
  'use strict';

  const SUPABASE_URL = 'https://qqwdgsanojynhimodgyz.supabase.co';
  // ブラウザ公開用のanonキー。service_role / secret keyは使用しない。
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxd2Rnc2Fub2p5bmhpbW9kZ3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMzYwOTUsImV4cCI6MjA5OTgxMjA5NX0.Rip29YLG3Ck-LEMtPVxBsuE8p1vnarmMdU_FoYDbOfU';
  const TABLE_NAME = 'shooting_scores';
  const MAX_RANKING = 10;

  let pendingScore = 0;
  let pendingResult = 'gameover';
  let submittedThisResult = false;

  function normalizeName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ').slice(0, 10);
  }

  function normalizeScore(score) {
    return Math.max(0, Math.floor(Number(score) || 0));
  }

  function setStatus(message, isError) {
    const status = document.getElementById('ranking-status');
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('is-error', Boolean(isError));
  }

  async function request(path, options) {
    const response = await fetch(SUPABASE_URL + '/rest/v1/' + path, {
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
      try {
        body = JSON.parse(text);
      } catch (_) {
        body = text;
      }
    }

    if (!response.ok) {
      const detail = body && typeof body === 'object'
        ? (body.message || body.details || body.hint || JSON.stringify(body))
        : (body || response.statusText);
      throw new Error('HTTP ' + response.status + ': ' + detail);
    }

    return body;
  }

  async function loadRanking() {
    const query = [
      'select=player_name,score,created_at',
      'order=score.desc,created_at.asc',
      'limit=' + MAX_RANKING
    ].join('&');

    const data = await request(TABLE_NAME + '?' + query, { method: 'GET' });
    return Array.isArray(data) ? data : [];
  }

  async function addScore(playerName, score) {
    await request(TABLE_NAME, {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        player_name: normalizeName(playerName),
        score: normalizeScore(score)
      })
    });
  }

  function renderRanking(ranking) {
    const list = document.getElementById('ranking-list');
    if (!list) return;
    list.textContent = '';

    if (!ranking.length) {
      const empty = document.createElement('li');
      empty.textContent = 'まだ記録がありません';
      list.appendChild(empty);
      return;
    }

    ranking.forEach(function (record, index) {
      const item = document.createElement('li');
      item.textContent =
        (index + 1) + '位  ' +
        normalizeName(record.player_name) + '  ' +
        normalizeScore(record.score) + '点';
      list.appendChild(item);
    });
  }

  async function refreshRanking(showSuccessMessage) {
    const list = document.getElementById('ranking-list');
    if (list) {
      list.textContent = '';
      const loading = document.createElement('li');
      loading.textContent = 'ランキングを読み込み中...';
      list.appendChild(loading);
    }

    try {
      const ranking = await loadRanking();
      renderRanking(ranking);
      if (showSuccessMessage) {
        setStatus('共有ランキングに登録しました。');
      } else {
        setStatus('');
      }
    } catch (error) {
      console.error('ランキングの取得に失敗しました', error);
      renderRanking([]);
      setStatus('ランキング取得エラー：' + error.message, true);
    }
  }

  window.showRankingScreen = function (finalScore, resultType) {
    pendingScore = normalizeScore(finalScore);
    pendingResult = resultType === 'clear' ? 'clear' : 'gameover';
    submittedThisResult = false;

    const modal = document.getElementById('ranking-modal');
    const title = document.getElementById('ranking-result-title');
    const score = document.getElementById('ranking-final-score');
    const input = document.getElementById('ranking-player-name');
    const submit = document.getElementById('ranking-submit-button');

    if (title) title.textContent = pendingResult === 'clear' ? 'GAME CLEAR！' : 'GAME OVER';
    if (score) score.textContent = pendingScore;
    if (input) {
      input.value = localStorage.getItem('dinosaurShootingPlayerName') || '';
      input.disabled = false;
    }
    if (submit) {
      submit.disabled = false;
      submit.textContent = 'ランキングに登録';
    }

    setStatus('');
    if (modal) modal.hidden = false;
    refreshRanking(false);
  };

  window.hideRankingScreen = function () {
    const modal = document.getElementById('ranking-modal');
    if (modal) modal.hidden = true;
  };

  document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('ranking-modal');
    const input = document.getElementById('ranking-player-name');
    const submit = document.getElementById('ranking-submit-button');
    const retry = document.getElementById('ranking-retry-button');

    if (modal) {
      ['touchstart', 'touchmove', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click'].forEach(function (type) {
        modal.addEventListener(type, function (event) {
          event.stopPropagation();
        }, { passive: false });
      });
    }

    if (submit) {
      submit.addEventListener('click', async function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (submittedThisResult) return;

        const name = normalizeName(input ? input.value : '');
        if (!name) {
          setStatus('名前を入力してください。', true);
          if (input) input.focus();
          return;
        }

        submit.disabled = true;
        submit.textContent = '登録中...';
        setStatus('スコアを登録しています...');

        try {
          await addScore(name, pendingScore);
          submittedThisResult = true;
          localStorage.setItem('dinosaurShootingPlayerName', name);

          if (input) input.disabled = true;
          submit.textContent = '登録しました';
          await refreshRanking(true);
        } catch (error) {
          console.error('ランキング登録に失敗しました', error);
          submit.disabled = false;
          submit.textContent = 'ランキングに登録';
          setStatus('登録エラー：' + error.message, true);
        }
      });
    }

    if (retry) {
      retry.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        window.hideRankingScreen();
        if (typeof resetGame === 'function') resetGame();
      });
    }
  });
})();
