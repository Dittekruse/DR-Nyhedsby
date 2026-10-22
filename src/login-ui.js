
import { supabase } from './supabase.js';
import { usernameAuth } from './auth.js';

const loginPanel = document.getElementById('login-panel');
const home = document.getElementById('home');
const message = document.getElementById('login-message');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

function showHome(username) {
  loginPanel.classList.add('hidden');
  home.classList.remove('hidden');

  let greeting = document.getElementById('login-greeting');

  if (!greeting) {
    greeting = document.createElement('p');
    greeting.id = 'login-greeting';
    home.prepend(greeting);
  }

  greeting.textContent = `Du er logget ind som ${username}.`;

  let logoutButton = document.getElementById('logout-button');

  if (!logoutButton) {
    logoutButton = document.createElement('button');
    logoutButton.id = 'logout-button';
    logoutButton.textContent = 'Log ud';
    logoutButton.style.marginTop = '12px';

    logoutButton.addEventListener('click', async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        message.textContent = 'Du kunne ikke logge ud. Prøv igen.';
        return;
      }

      home.classList.add('hidden');
      loginPanel.classList.remove('hidden');
      message.textContent = 'Du er logget ud.';
      passwordInput.value = '';
      logoutButton.remove();
      greeting.remove();
    });

    home.prepend(logoutButton);
  }
}

async function handleAuth(action) {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  message.textContent = 'Vent lidt...';

  try {
    const user = await usernameAuth(action, username, password);
    showHome(user.username);
    message.textContent = '';
  } catch (error) {
    message.textContent = error.message || 'Noget gik galt.';
  }
}

document.getElementById('login-button').addEventListener('click', () => {
  handleAuth('login');
});

document.getElementById('signup-button').addEventListener('click', () => {
  handleAuth('signup');
});

passwordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleAuth('login');
  }
});

const { data } = await supabase.auth.getSession();

if (data.session) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', data.session.user.id)
    .maybeSingle();

  if (profile?.username) {
    showHome(profile.username);
  }
}
