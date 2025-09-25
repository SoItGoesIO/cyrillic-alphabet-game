import { ensureAuthed, onAuth } from './auth/session.js';
import { listItems, createItem } from './db/items.js';
import { fetchProfile } from './db/profiles.js';
import { completeItemAndAwardXP } from './gamification/xp.js';
import { toast } from './ui/render.js';

async function renderHeader() {
  const header = document.querySelector('#xp-badge');
  if (!header) return;
  
  try {
    const p = await fetchProfile();
    header.textContent = `Level ${p.level} • ${p.total_xp} XP`;
    header.className = 'inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold';
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
    
    ul.innerHTML = (data || []).map(i => `
      <li class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border ${i.status === 'done' ? 'opacity-60' : ''}">
        <div>
          <span class="font-medium ${i.status === 'done' ? 'line-through text-gray-500' : 'text-gray-800'}">${i.title}</span>
          ${i.description ? `<div class="text-sm text-gray-600">${i.description}</div>` : ''}
        </div>
        <button 
          data-complete="${i.id}" 
          ${i.status === 'done' ? 'disabled' : ''}
          class="px-3 py-1 text-sm rounded font-medium transition-colors ${
            i.status === 'done' 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }"
        >
          ${i.status === 'done' ? 'Done' : `Complete (+${i.xp_reward} XP)`}
        </button>
      </li>
    `).join('');
  } catch (error) {
    console.error('Failed to load todos:', error);
    ul.innerHTML = '<li class="text-red-500">Failed to load tasks</li>';
  }
}

// Event handlers
document.addEventListener('click', async (e) => {
  if (e.target.matches('[data-complete]')) {
    const id = e.target.dataset.complete;
    e.target.disabled = true;
    e.target.textContent = 'Completing...';
    
    try {
      const res = await completeItemAndAwardXP(id);
      toast(`+${res.totalXP - (await fetchProfile()).total_xp + 10} XP!`);
      await renderHeader();
      await renderTodos();
    } catch (error) {
      console.error('Failed to complete item:', error);
      toast('Failed to complete task');
      e.target.disabled = false;
      // Restore button text
      const { data } = await listItems();
      const item = data?.find(i => i.id === id);
      e.target.textContent = item ? `Complete (+${item.xp_reward} XP)` : 'Complete';
    }
  }
});

document.addEventListener('submit', async (e) => {
  if (e.target.matches('#new-task-form')) {
    e.preventDefault();
    const title = e.target.title.value.trim();
    if (!title) return;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';
    
    try {
      await createItem({ 
        title, 
        status: 'open', 
        xp_reward: 10,
        description: e.target.description?.value?.trim() || null
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
  }
});

// Show/hide UI based on auth status
function updateAuthUI(session) {
  const authPanel = document.getElementById('supabase-test');
  const appContent = document.getElementById('app-content');
  
  if (session) {
    if (authPanel) authPanel.style.display = 'none';
    if (appContent) appContent.style.display = 'block';
  } else {
    if (authPanel) authPanel.style.display = 'block';
    if (appContent) appContent.style.display = 'none';
  }
}

export async function boot() {
  const session = await ensureAuthed();
  updateAuthUI(session);
  
  // Listen for auth changes
  onAuth((session) => {
    updateAuthUI(session);
    if (session) {
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