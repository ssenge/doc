// assets/js/header.js

// Utility: Get current user (async, returns null if not logged in)
async function getCurrentUser() {
  if (window.eDocAuth && typeof window.eDocAuth.getCurrentUser === 'function') {
    try {
      return await window.eDocAuth.getCurrentUser();
    } catch {
      return null;
    }
  }
  return null;
}

// Utility: Get user's first name (from profile or metadata)
function getUserFirstName(user) {
  if (!user) return null;
  if (user.user_metadata?.first_name) return user.user_metadata.first_name;
  if (user.app_metadata?.first_name) return user.app_metadata.first_name;
  if (window.userProfile?.first_name) return window.userProfile.first_name;
  return null;
}

// Utility: Get language selector HTML
function getLanguageSelectorHTML() {
  return `
    <div class="relative">
      <button id="languageDropdown" class="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center border border-gray-300 bg-white" type="button">
        <span id="currentFlag" class="mr-2">🇺🇸</span>
        <span id="currentLanguage" class="font-semibold">EN</span>
        <svg class="w-4 h-4 ml-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div id="languageMenu" class="z-50 hidden absolute right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-40 border border-gray-200">
        <ul class="py-2 text-sm text-gray-700">
          <li><a href="#" onclick="switchLanguage('en')" class="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-900 font-medium"><span class="mr-2">🇺🇸</span>English</a></li>
          <li><a href="#" onclick="switchLanguage('de')" class="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-900 font-medium"><span class="mr-2">🇩🇪</span>Deutsch</a></li>
        </ul>
      </div>
    </div>
  `;
}

// Utility: Get right controls HTML based on auth state
function getHeaderRightControlsHTML(user) {
  const firstName = getUserFirstName(user);
  let html = '';
  if (user) {
    // Welcome message
    if (firstName) {
      html += `<span class="text-sm text-gray-700" data-auth="user-info"><span data-en="Welcome," data-de="Willkommen,">Welcome,</span> <span id="userFirstName">${firstName}</span></span>`;
    }
    // Dashboard button
    html += `<a href="dashboard.html" class="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 border border-gray-300 bg-white" data-auth="dashboard"><span data-en="Dashboard" data-de="Dashboard">Dashboard</span></a>`;
    // Language selector
    html += getLanguageSelectorHTML();
    // Logout button
    html += `<button id="logoutBtn" class="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 border border-gray-300 bg-white" data-auth="logout"><span data-en="Logout" data-de="Abmelden">Logout</span></button>`;
  } else {
    // Language selector
    html += getLanguageSelectorHTML();
    // Login button
    html += `<button id="loginBtn" class="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 border border-gray-300 bg-white" data-auth="login"><span data-en="Login" data-de="Anmelden">Login</span></button>`;
  }
  return html;
}

// Load header.html and initialize dynamic logic
fetch('header.html')
  .then(response => response.text())
  .then(async html => {
    document.getElementById('header').innerHTML = html;
    // Set up dynamic right controls
    const rightControls = document.getElementById('header-right-controls');
    if (!rightControls) return;
    // Wait for auth system to be ready
    let user = await getCurrentUser();
    rightControls.innerHTML = getHeaderRightControlsHTML(user);
    // Set up event listeners
    if (user) {
      // Logout
      document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        if (window.eDocAuth) {
          await window.eDocAuth.signOut();
          window.location.href = 'index.html';
        }
      });
    } else {
      // Login
      document.getElementById('loginBtn')?.addEventListener('click', () => {
        window.location.href = 'login.html';
      });
    }
    // Language dropdown
    const dropdownButton = document.getElementById('languageDropdown');
    const dropdownMenu = document.getElementById('languageMenu');
    if (dropdownButton && dropdownMenu) {
      dropdownButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!dropdownButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
          dropdownMenu.classList.add('hidden');
        }
      });
      dropdownMenu.addEventListener('click', () => {
        dropdownMenu.classList.add('hidden');
      });
    }
  }); 