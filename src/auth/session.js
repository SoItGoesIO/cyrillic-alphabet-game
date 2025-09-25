import { supa } from '../supa.js';

export async function getSession() {
  const { data, error } = await supa.auth.getSession();
  return error ? null : data.session;
}

export function onAuth(cb) {
  const sub = supa.auth.onAuthStateChange((_e, s) => cb(s));
  return sub;
}

export async function ensureAuthed() {
  const s = await getSession();
  const authed = !!s;
  document.body.classList.toggle('needs-auth', !authed);
  document.body.classList.toggle('is-authed', authed);
  return authed;
}
