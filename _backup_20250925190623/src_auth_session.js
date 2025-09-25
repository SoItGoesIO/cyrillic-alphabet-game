import { supa } from '../supa.js';

export async function getSession() {
  const { data } = await supa.auth.getSession();
  return data.session;
}

export function onAuth(cb) {
  return supa.auth.onAuthStateChange((_e, s) => cb(s));
}

export async function ensureAuthed() {
  const s = await getSession();
  if (!s) document.body.classList.add('needs-auth');
  else document.body.classList.remove('needs-auth');
  return !!s;
}