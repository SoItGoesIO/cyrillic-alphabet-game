import { ensureAuthed, onAuth } from './auth/session.js';
import { supa } from './supa.js';
import { listItems, createItem } from './db/items.js';
import { fetchProfile } from './db/profiles.js';
import { completeItemAndAwardXP } from './gamification/xp.js';
import { toast } from './ui/render.js';

async function renderHeader() {
  const header = document.querySelector('#xp-badge');
  if (!header) return;

  try {
    const p = await fetchProfile();
    header.textContent = `Level ${p?.level ?? 1} • ${p?.total_xp ?? 0} XP`;
    header.className =
      'inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold';
  } catch (error) {
    console.error('Failed to load profile:', error);
    header.textContent = 'Level 1 • 0 XP';
  }
}

async function renderTodos() {
  const ul = document.querySelector('#todo-list');
  if (!ul) return;

  try {
    const { data, error } = await listItems();
    if (error) throw error;

    if (!data || data.length === 0) {
      ul.innerHTML = '<li class="text-gray-500 italic">No tasks yet. Add one above!</li>';
      return;
    }

    ul.innerHTML = (data || [])
      .map(
        (i) => `
      <li class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border ${
        i.status === 'completed' ? 'opacity-60' : ''
      }">
        <div>
          <span class="font-medium ${
            i.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'
          }">${i.title}</span>
          ${i.description ? `<div class="text-sm text-gray-600">${i.description}</div>` : ''}
        </div>
        <button 
          data-complete="${i.id}" 
          ${i.status === 'completed' ? 'disabled' : ''}
          class="px-3 py-1 text-sm rounded font-medium transition-colors ${
            i.status === 'completed'
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }"
        >
          ${i.status === 'completed' ? 'Done' : `Complete (+${i.xp_reward ?? 10} XP)`}
        </button>
      </li>
    `,
      )
      .join('');
  } catch (error) {
    console.error('Failed to load todos:', error);
    ul.innerHTML = '<li class="text-red-500">Failed to load tasks</li>';
  }
}

// Event handlers
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-complete]');
  if (!btn) return;

  const id = btn.dataset.complete;
  btn.disabled = true;
  btn.textContent = 'Completing...';

  try {
    const before = await fetchProfile();
    const res = await completeItemAndAwardXP(id); // { totalXP, level, reward }
    const gained = res.reward ?? Math.max(0, (res.totalXP ?? 0) - (before?.total_xp ?? 0));
    toast(`+${gained} XP`);
    await renderHeader();
    await renderTodos();
  } catch (error) {
    console.error('Failed to complete item:', error);
    toast('Failed to complete task');
    btn.disabled = false;
    btn.textContent = 'Complete';
  }
});

document.addEventListener('submit', async (e) => {
  if (!e.target.matches('#new-task-form')) return;
  e.preventDefault();

  const title = e.target.title.value.trim();
  if (!title) return;

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Adding...';

  try {
    const { data: u } = await supa.auth.getUser();
    if (!u?.user?.id) throw new Error('Not authenticated');

    await createItem({
      user_id: u.user.id,
      title,
      description: e.target.description?.value?.trim() || null,
      status: 'created', // enum: created | in_progress | completed
      xp_reward: 10,
    });

    e.target.reset();
    await renderTodos();
    toast('Task added!');
  } catch (error) {
    console.error('Failed to create item:', error);
    toast('Failed to add task');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Auth UI show/hide
function updateAuthUI(session) {
  const authPanel = document.getElementById('supabase-test');
  const appContent = document.getElementById('app-content');
  const authed = !!session;
  if (authPanel) authPanel.style.display = authed ? 'none' : 'block';
  if (appContent) appContent.style.display = authed ? 'block' : 'none';
}

export async function boot() {
  const session = await ensureAuthed();
  updateAuthUI(session);

  onAuth((s) => {
    updateAuthUI(s);
    if (s) {
      renderHeader();
      renderTodos();
    }
  });

  if (session) {
    await renderHeader();
    await renderTodos();
  }
}

// Auto-start the app
boot();
