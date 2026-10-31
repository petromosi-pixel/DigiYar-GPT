/* DigiYar email authentication + explicit, non-destructive profile migration. */
(function () {
  'use strict';
  const URL = 'https://qeuljjvjndqbwiqseqvl.supabase.co';
  const KEY = 'sb_publishable_bqx_jIKEbJnKOSOGO7u1jA_r88Pe3NY';
  const REDIRECT = 'https://digi-yar-core-git-main-digi-yar.vercel.app/';
  let client = null;
  let currentUser = null;
  let currentSession = null;
  let ready = null;

  function getClient() {
    if (client) return client;
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('کتابخانهٔ امن احراز هویت بارگذاری نشده است؛ صفحه را تازه‌سازی کن.');
    }
    client = window.supabase.createClient(URL, KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' }
    });
    client.auth.onAuthStateChange(function (event, session) {
      currentSession = session || null;
      currentUser = session && session.user ? session.user : null;
      try { window.dispatchEvent(new CustomEvent('digiyar:auth-change', { detail: { event: event, user: currentUser } })); } catch (_) {}
    });
    return client;
  }

  async function init() {
    if (!ready) ready = (async function () {
      const c = getClient();
      const result = await c.auth.getSession();
      if (result.error) throw result.error;
      currentSession = result.data.session || null;
      currentUser = currentSession ? currentSession.user : null;
      return currentUser;
    })();
    return ready;
  }

  function getUser() { return currentUser; }
  function getAccessToken() { return currentSession && currentSession.access_token ? currentSession.access_token : null; }

  async function requestEmailLink(email) {
    const clean = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw new Error('آدرس ایمیل را درست وارد کن.');
    await init();
    const { error } = await getClient().auth.signInWithOtp({
      email: clean,
      options: { shouldCreateUser: true, emailRedirectTo: REDIRECT }
    });
    if (error) throw error;
    return true;
  }

  async function signOut() {
    await init();
    const { error } = await getClient().auth.signOut();
    if (error) throw error;
    currentUser = null;
  }

  function localProfile() {
    const merged = {};
    ['digiyar-v5-profile', 'digiyar-account-profile-v1'].forEach(function (key) {
      try {
        const value = JSON.parse(localStorage.getItem(key) || 'null');
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.keys(value).forEach(function (field) {
            if (value[field] !== null && value[field] !== undefined && value[field] !== '') merged[field] = value[field];
          });
        }
      } catch (_) {}
    });
    return merged;
  }

  function toDb(profile) {
    const data = {};
    if (profile.name) data.display_name = String(profile.name).trim().slice(0, 120);
    if (profile.city) data.city = String(profile.city).trim().slice(0, 120);
    if (profile.phone) data.phone = String(profile.phone).trim().slice(0, 40);
    if (profile.birthDate) { data.birth_date_label = String(profile.birthDate).trim().slice(0, 32); if (/^\d{4}-\d{2}-\d{2}$/.test(String(profile.birthDate))) data.birth_date = profile.birthDate; }
    const gender = String(profile.gender || '').trim();
    if (gender === 'زن' || gender === 'female') data.gender = 'female';
    else if (gender === 'مرد' || gender === 'male') data.gender = 'male';
    else if (gender === 'دیگر' || gender === 'other') data.gender = 'other';
    else if (gender === 'ترجیح می‌دهم نگویم' || gender === 'prefer_not_to_say') data.gender = 'prefer_not_to_say';
    return data;
  }

  async function saveProfile(profile) {
    await init();
    if (!currentUser) return { saved: false, reason: 'signed_out' };
    const data = toDb(profile);
    if (!Object.keys(data).length) return { saved: true, skipped: true };
    const c = getClient();
    const { data: row, error } = await c.from('profiles').update(data).eq('id', currentUser.id).select('id').maybeSingle();
    if (error) throw error;
    if (!row) {
      const { error: insertError } = await c.from('profiles').insert({ id: currentUser.id, ...data });
      if (insertError) throw insertError;
    }
    return { saved: true };
  }

  async function migrateLocalProfile() {
    await init();
    if (!currentUser) throw new Error('ابتدا وارد حساب کاربری شو.');
    const c = getClient();
    const { data: remote, error } = await c.from('profiles').select('id,display_name,city,birth_date,birth_date_label,gender,phone').eq('id', currentUser.id).maybeSingle();
    if (error) throw error;
    const local = toDb(localProfile());
    const merged = {};
    Object.keys(local).forEach(function (key) {
      const existing = remote && remote[key];
      if (local[key] && (existing === null || existing === undefined || existing === '')) merged[key] = local[key];
    });
    if (remote) {
      if (Object.keys(merged).length) {
        const { error: updateError } = await c.from('profiles').update(merged).eq('id', currentUser.id);
        if (updateError) throw updateError;
      }
    } else if (Object.keys(local).length) {
      const { error: insertError } = await c.from('profiles').insert({ id: currentUser.id, ...local });
      if (insertError) throw insertError;
    }
    return { copied: Object.keys(merged).length || (!remote ? Object.keys(local).length : 0), keptRemote: Object.keys(local).length - Object.keys(merged).length };
  }

  function renderPanel(mount) {
    if (!mount || mount.querySelector('.dy-auth-panel')) return;
    const profile = localProfile();
    const wrap = document.createElement('section');
    wrap.className = 'dy-auth-panel';
    wrap.dir = 'rtl';
    wrap.innerHTML = '<div class="dy-auth-head"><strong>حساب کاربری دیجی‌یار</strong><span class="dy-auth-state" role="status">در حال بررسی وضعیت حساب…</span></div>' +
      '<label class="dy-auth-email-label">ایمیل<input class="dy-auth-email" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com"></label>' +
      '<button type="button" class="v6-support-primary dy-auth-send">ارسال لینک ورود / ثبت‌نام</button>' +
      '<p class="dy-auth-help">لینک امن ورود به ایمیل ارسال می‌شود. با باز کردن آن، حساب تأیید و وارد می‌شوی.</p>' +
      '<div class="dy-auth-actions" hidden><button type="button" class="v6-sheet-action dy-auth-migrate">انتقال امن اطلاعات این دستگاه به حساب</button><button type="button" class="v6-sheet-action dy-auth-signout">خروج از حساب</button></div>' +
      '<div class="dy-auth-result" aria-live="polite"></div>';
    const style = document.createElement('style');
    style.textContent = '.dy-auth-panel{display:grid;gap:9px;padding:12px;margin:0 0 12px;border:1px solid #dfe6f0;border-radius:12px}.dy-auth-head{display:grid;gap:4px}.dy-auth-head strong{font-size:14px}.dy-auth-state,.dy-auth-help,.dy-auth-result{font-size:11px;line-height:1.8;color:#68778d}.dy-auth-email-label{display:grid;gap:5px;font-size:12px;font-weight:700}.dy-auth-email{width:100%;box-sizing:border-box;border:1px solid #d6dfec;border-radius:9px;padding:10px;background:#fff;color:#24334c;font:inherit;font-size:13px;direction:ltr;text-align:left}.dy-auth-actions{display:grid;gap:7px}.dy-auth-actions[hidden]{display:none}.dy-auth-actions button{font:inherit;font-size:12px}body.v6-dark .dy-auth-panel{border-color:#39475c}body.v6-dark .dy-auth-email{background:#111b2b;border-color:#39475c;color:#e7edf7}';
    if (!document.getElementById('dy-auth-panel-style')) { style.id = 'dy-auth-panel-style'; document.head.appendChild(style); }
    wrap.querySelector('.dy-auth-email').value = profile.email || '';
    mount.prepend(wrap);
    const state = wrap.querySelector('.dy-auth-state');
    const result = wrap.querySelector('.dy-auth-result');
    const actions = wrap.querySelector('.dy-auth-actions');
    const send = wrap.querySelector('.dy-auth-send');
    const emailInput = wrap.querySelector('.dy-auth-email');
    const refresh = async function () {
      try {
        await init();
        if (currentUser) {
          state.textContent = 'وارد شده‌ای: ' + currentUser.email;
          send.hidden = true;
          emailInput.closest('label').hidden = true;
          wrap.querySelector('.dy-auth-help').hidden = true;
          actions.hidden = false;
        } else {
          state.textContent = 'هنوز وارد حساب نشده‌ای.';
          send.hidden = false;
          emailInput.closest('label').hidden = false;
          wrap.querySelector('.dy-auth-help').hidden = false;
          actions.hidden = true;
        }
      } catch (error) {
        state.textContent = error.message || 'اتصال احراز هویت برقرار نشد.';
      }
    };
    send.addEventListener('click', async function () {
      send.disabled = true; result.textContent = 'در حال ارسال لینک ورود…';
      try { await requestEmailLink(emailInput.value); result.textContent = 'درخواست ارسال شد. ایمیل را بررسی کن؛ اگر پیام نرسید پوشهٔ هرزنامه را هم ببین.'; }
      catch (error) { result.textContent = error.message || 'ارسال لینک ورود انجام نشد.'; }
      finally { send.disabled = false; }
    });
    wrap.querySelector('.dy-auth-migrate').addEventListener('click', async function () {
      const button = this; button.disabled = true; result.textContent = 'در حال بررسی و انتقال اطلاعات…';
      try {
        const stats = await migrateLocalProfile();
        result.textContent = 'انتقال انجام شد؛ ' + stats.copied + ' مورد منتقل شد و ' + stats.keptRemote + ' مورد موجود در حساب بدون تغییر باقی ماند. عکس پروفایل فعلاً فقط در همین دستگاه نگه داشته شده است.';
      } catch (error) { result.textContent = error.message || 'انتقال اطلاعات انجام نشد؛ اطلاعات محلی حفظ شده‌اند.'; }
      finally { button.disabled = false; }
    });
    wrap.querySelector('.dy-auth-signout').addEventListener('click', async function () {
      const button = this; button.disabled = true;
      try { await signOut(); result.textContent = 'از حساب خارج شدی.'; await refresh(); }
      catch (error) { result.textContent = error.message || 'خروج انجام نشد.'; }
      finally { button.disabled = false; }
    });
    window.addEventListener('digiyar:auth-change', refresh);
    refresh();
  }

  window.DigiYarAuth = Object.freeze({
    init: init,
    getUser: getUser,
    getAccessToken: getAccessToken,
    requestEmailLink: requestEmailLink,
    signOut: signOut,
    saveProfile: saveProfile,
    migrateLocalProfile: migrateLocalProfile,
    renderPanel: renderPanel
  });
  init().catch(function (error) { console.warn('DigiYar Auth initialization:', error); });
})();