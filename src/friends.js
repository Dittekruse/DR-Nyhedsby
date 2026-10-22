
import { supabase } from './supabase.js';

const friendsPanel = document.getElementById('friends-panel');
const searchInput = document.getElementById('friend-search');
const searchButton = document.getElementById('friend-search-button');
const searchResults = document.getElementById('friend-search-results');
const requestsList = document.getElementById('friend-requests');
const friendsList = document.getElementById('friends-list');
const message = document.getElementById('friends-message');

let currentUserId = null;

function showMessage(text) {
  message.textContent = text;
}


async function getCurrentUser() {
  const { data, error } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (error || !user) {
    showMessage(
      'Login-sessionen kunne ikke findes. Prøv at logge ud og ind igen.'
    );
    console.error('Fejl ved hentning af login-session:', error);
    return null;
  }

  currentUserId = user.id;
  return user;
}


function createFriendRow(username, buttonText, onClick) {
  const row = document.createElement('div');
  row.className = 'friend';

  const name = document.createElement('strong');
  name.textContent = username;

  const button = document.createElement('button');
  button.textContent = buttonText;
  button.addEventListener('click', onClick);

  row.append(name, button);
  return row;
}

async function searchUsers() {
  const username = searchInput.value.trim();

  searchResults.replaceChildren();

  if (username.length < 3) {
    showMessage('Skriv mindst 3 tegn for at søge.');
    return;
  }

  const user = await getCurrentUser();
  if (!user) return;

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', `%${username}%`)
    .neq('id', currentUserId)
    .limit(10);

  if (error) {
    showMessage('Kunne ikke søge efter brugere. Tjek Supabase-politikkerne.');
    return;
  }

  if (!profiles.length) {
    showMessage('Ingen brugere fundet.');
    return;
  }

  showMessage(`Fandt ${profiles.length} bruger(e).`);

  for (const profile of profiles) {
    const row = createFriendRow(profile.username, 'Tilføj ven', async () => {
      const { error: requestError } = await supabase
        .from('friendships')
        .insert({
          requester_id: currentUserId,
          addressee_id: profile.id,
          status: 'pending'
        });

      if (requestError) {
        showMessage(
          requestError.code === '23505'
            ? 'Du har allerede sendt en anmodning, eller I er allerede venner.'
            : 'Kunne ikke sende anmodningen. Tjek tabellen friendships og dens politikker.'
        );
        return;
      }

      row.remove();
      showMessage(`Venneanmodning sendt til ${profile.username}.`);
      await loadFriends();
    });

    searchResults.appendChild(row);
  }
}

async function loadFriends() {
  const user = await getCurrentUser();
  if (!user) return;

  requestsList.replaceChildren();
  friendsList.replaceChildren();

  const { data: incoming, error: incomingError } = await supabase
    .from('friendships')
    .select('id, requester_id, profiles!friendships_requester_id_fkey(username)')
    .eq('addressee_id', currentUserId)
    .eq('status', 'pending');

  if (incomingError) {
    showMessage('Kunne ikke hente venneanmodninger. Tjek Supabase-politikkerne.');
    return;
  }

  for (const request of incoming || []) {
    const username = request.profiles?.username || 'Ukendt bruger';

    requestsList.appendChild(
      createFriendRow(username, 'Accepter', async () => {
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('id', request.id)
          .eq('addressee_id', currentUserId);

        if (error) {
          showMessage('Kunne ikke acceptere anmodningen. Tjek Supabase-politikkerne.');
          return;
        }

        showMessage(`Du er nu venner med ${username}.`);
        await loadFriends();
      })
    );
  }

  const { data: sent, error: sentError } = await supabase
    .from('friendships')
    .select('id, addressee_id, profiles!friendships_addressee_id_fkey(username)')
    .eq('requester_id', currentUserId)
    .eq('status', 'pending');

  if (sentError) {
    showMessage('Kunne ikke hente sendte anmodninger.');
    return;
  }

  const { data: accepted, error: acceptedError } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id, status')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

  if (acceptedError) {
    showMessage('Kunne ikke hente vennelisten. Tjek Supabase-politikkerne.');
    return;
  }

  for (const friendship of accepted || []) {
    const otherId = friendship.requester_id === currentUserId
      ? friendship.addressee_id
      : friendship.requester_id;

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', otherId)
      .maybeSingle();

    if (!profile) continue;

    friendsList.appendChild(
      createFriendRow(profile.username, 'Se by (kommer snart)', () => {
        showMessage(`Næste trin er at åbne ${profile.username}s by.`);
      })
    );
  }

  if (!requestsList.children.length) {
    requestsList.textContent = 'Ingen nye venneanmodninger.';
  }

  if (!friendsList.children.length) {
    friendsList.textContent = 'Du har ikke tilføjet nogen venner endnu.';
  }

  if (sent?.length) {
    showMessage(`Du har ${sent.length} ventende venneanmodning(er).`);
  }
}

searchButton.addEventListener('click', searchUsers);

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchUsers();
});

document.getElementById('open-friends-button').addEventListener('click', async () => {
  document.getElementById('home').classList.add('hidden');
  friendsPanel.classList.remove('hidden');
  showMessage('');
  await loadFriends();
});

document.getElementById('back-home-button').addEventListener('click', () => {
  friendsPanel.classList.add('hidden');
  document.getElementById('home').classList.remove('hidden');
});

supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    currentUserId = session.user.id;
  }
});
