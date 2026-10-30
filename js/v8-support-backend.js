/* DigiYar public intake client. No privileged key is stored in this file. */
(function () {
  'use strict';
  const endpoint = 'https://qeuljjvjndqbwiqseqvl.supabase.co/functions/v1/digiyar-intake';
  const publishableKey = 'sb_publishable_bqx_jIKEbJnKOSOGO7u1jA_r88Pe3NY';

  async function submit(payload) {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': publishableKey
    };
    const session = window.DigiYarAuth?.getAccessToken?.();
    if (session) headers.Authorization = 'Bearer ' + session;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    let result = {};
    try { result = await response.json(); } catch (_) {}
    if (!response.ok || !result.ok) {
      const error = new Error(result.error || 'ارسال پیام به سرور انجام نشد.');
      error.status = response.status;
      throw error;
    }
    return result;
  }

  window.DigiYarSupportBackend = Object.freeze({ submit });
})();
