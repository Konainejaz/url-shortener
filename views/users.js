const getSharedHead = (title) => `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | User Management</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Inter', sans-serif; }
      .glass {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }
      .dark .glass {
        background: rgba(17, 24, 39, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .animate-in {
        animation: fadeIn 0.5s ease-out forwards;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 10px;
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #334155;
      }
    </style>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              primary: {
                50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
              }
            }
          }
        }
      }
    </script>
`;

const getSharedScripts = () => `
    <script>
      // Initialize Lucide icons
      lucide.createIcons();

      // Theme Management
      function toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        showToast('Theme switched to ' + (isDark ? 'Dark' : 'Light'), 'info');
      }

      function initTheme() {
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      // Toast Notification System
      function showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'toast-container';
          container.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 w-full max-w-sm px-4 pointer-events-none';
          document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = 'pointer-events-auto flex items-center w-full p-4 text-white rounded-2xl shadow-2xl animate-in glass-toast';
        
        const colors = {
          success: 'bg-emerald-500/90 dark:bg-emerald-600/90',
          error: 'bg-rose-500/90 dark:bg-rose-600/90',
          warning: 'bg-amber-500/90 dark:bg-amber-600/90',
          info: 'bg-primary-500/90 dark:bg-primary-600/90'
        };
        
        toast.classList.add(...colors[type].split(' '));
        toast.style.backdropFilter = 'blur(10px)';
        
        toast.innerHTML = \`
          <div class="inline-flex items-center justify-center flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl">
            <i data-lucide="\${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : type === 'warning' ? 'alert-triangle' : 'info'}" class="w-6 h-6"></i>
          </div>
          <div class="ml-4 text-sm font-bold tracking-wide">\${message}</div>
          <button type="button" class="ml-auto -mx-1.5 -my-1.5 bg-white/10 text-white hover:bg-white/20 rounded-xl p-2 inline-flex items-center justify-center transition-colors" onclick="this.parentElement.remove()">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        \`;
        
        container.appendChild(toast);
        lucide.createIcons({ node: toast });
        
        setTimeout(() => {
          toast.classList.add('opacity-0', '-translate-y-4', 'transition-all', 'duration-500');
          setTimeout(() => toast.remove(), 500);
        }, 4000);
      }

      // Search Functionality
      function initSearch() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
          const term = e.target.value.toLowerCase();
          const rows = document.querySelectorAll('tbody tr');
          let foundCount = 0;

          rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(term)) {
              row.classList.remove('hidden');
              foundCount++;
            } else {
              row.classList.add('hidden');
            }
          });

          const emptyState = document.getElementById('empty-state');
          if (foundCount === 0 && rows.length > 0) {
            emptyState?.classList.remove('hidden');
          } else {
            emptyState?.classList.add('hidden');
          }
        });
      }

      // Initialize everything
      initTheme();
      document.addEventListener('DOMContentLoaded', () => {
        initSearch();
        
        // Handle URL messages
        const params = new URLSearchParams(window.location.search);
        if (params.has('message')) {
          showToast(decodeURIComponent(params.get('message')), params.get('type') || 'info');
        }
      });
    </script>
`;

const generateUserTable = (users, title = "Users") => {
  const userArray = Array.isArray(users) ? users : [users];
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      ${getSharedHead(title)}
    </head>
    <body class="bg-slate-50 dark:bg-slate-900 transition-colors duration-300 min-h-screen">
      <!-- Background Decorations -->
      <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">${title}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium">Manage and monitor your system users effortlessly.</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="toggleTheme()" class="p-3 glass rounded-2xl text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:scale-105 active:scale-95 shadow-sm">
              <i data-lucide="sun" class="w-6 h-6 dark:hidden"></i>
              <i data-lucide="moon" class="w-6 h-6 hidden dark:block"></i>
            </button>
            <a href="/users/create-user/form" class="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-semibold shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95">
              <i data-lucide="plus" class="w-5 h-5"></i>
              <span>Create User</span>
            </a>
          </div>
        </div>

        <!-- Controls Section -->
        <div class="glass rounded-3xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center shadow-xl">
          <div class="relative w-full md:w-96">
            <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
            <input type="text" id="search-input" placeholder="Search users by name, email, job..." 
              class="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white">
          </div>
          <div class="flex gap-2 ml-auto">
            <div class="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total: ${userArray.length}
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="glass rounded-3xl overflow-hidden shadow-2xl border border-white/20">
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-100/50 dark:bg-slate-800/50">
                  <th class="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">User</th>
                  <th class="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                  <th class="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider hidden lg:table-cell">Role</th>
                  <th class="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                ${userArray.length > 0 ? userArray.map(user => `
                <tr class="group hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors">
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                        ${user.first_name[0]}${user.last_name ? user.last_name[0] : ''}
                      </div>
                      <div>
                        <div class="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          ${user.first_name} ${user.last_name || ''}
                        </div>
                        <div class="text-sm text-slate-500 dark:text-slate-400 font-medium">ID: #${user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-5 hidden sm:table-cell">
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <i data-lucide="mail" class="w-4 h-4 text-slate-400"></i>
                        <span class="text-sm font-medium">${user.email}</span>
                      </div>
                      <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <i data-lucide="user" class="w-4 h-4 text-slate-400"></i>
                        <span class="text-sm font-medium">${user.gender || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-5 hidden lg:table-cell">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 ring-1 ring-inset ring-primary-600/20">
                      ${user.job_title || 'General User'}
                    </span>
                  </td>
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-2">
                      <a href="/users/${user.id}" class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/40 dark:hover:text-blue-400 transition-all shadow-sm" title="View Details">
                        <i data-lucide="eye" class="w-5 h-5"></i>
                      </a>
                      <a href="/users/${user.id}/edit" class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/40 dark:hover:text-amber-400 transition-all shadow-sm" title="Edit User">
                        <i data-lucide="edit-3" class="w-5 h-5"></i>
                      </a>
                      <button onclick="confirmDelete(${user.id}, '${user.first_name} ${user.last_name}')" class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400 transition-all shadow-sm" title="Delete User">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                `).join('') : `
                <tr>
                  <td colspan="4" class="px-6 py-20 text-center">
                    <div class="flex flex-col items-center gap-4">
                      <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                        <i data-lucide="users" class="w-10 h-10"></i>
                      </div>
                      <div class="text-xl font-bold text-slate-900 dark:text-white">No users found</div>
                      <p class="text-slate-500 dark:text-slate-400">Start by adding a new user to your system.</p>
                      <a href="/users/create-user/form" class="mt-2 text-primary-600 font-bold hover:underline underline-offset-4">Create your first user →</a>
                    </div>
                  </td>
                </tr>
                `}
              </tbody>
            </table>
          </div>
          
          <!-- Empty State for Search -->
          <div id="empty-state" class="hidden px-6 py-20 text-center">
            <div class="flex flex-col items-center gap-4">
              <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                <i data-lucide="search-x" class="w-10 h-10"></i>
              </div>
              <div class="text-xl font-bold text-slate-900 dark:text-white">No matching users</div>
              <p class="text-slate-500 dark:text-slate-400">Try adjusting your search terms.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal (Native Dialog or Custom) -->
      <div id="delete-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="closeDeleteModal()"></div>
        <div class="glass relative w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i data-lucide="alert-triangle" class="w-8 h-8"></i>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">Delete User?</h3>
          <p class="text-slate-500 dark:text-slate-400 text-center mb-8">Are you sure you want to remove <span id="delete-user-name" class="font-bold text-slate-900 dark:text-white"></span>? This action is permanent.</p>
          <div class="flex gap-4">
            <button onclick="closeDeleteModal()" class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            <form id="delete-form" method="POST" class="flex-1">
              <button type="submit" class="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95">Delete</button>
            </form>
          </div>
        </div>
      </div>

      ${getSharedScripts()}
      <script>
        function confirmDelete(id, name) {
          const modal = document.getElementById('delete-modal');
          const form = document.getElementById('delete-form');
          const nameSpan = document.getElementById('delete-user-name');
          
          nameSpan.textContent = name;
          form.action = \`/users/\${id}/delete\`;
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        }

        function closeDeleteModal() {
          const modal = document.getElementById('delete-modal');
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      </script>
    </body>
    </html>
  `;
};

const generateCreateUserForm = () => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      ${getSharedHead("Create New User")}
    </head>
    <body class="bg-slate-50 dark:bg-slate-900 transition-colors duration-300 min-h-screen flex items-center justify-center p-4">
      <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div class="w-full max-w-2xl animate-in">
        <div class="mb-8 flex items-center justify-between">
          <a href="/users" class="flex items-center gap-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 font-bold transition-colors">
            <i data-lucide="arrow-left" class="w-5 h-5"></i>
            <span>Back to Users</span>
          </a>
          <button onclick="toggleTheme()" class="p-2 glass rounded-xl text-slate-600 dark:text-slate-300">
            <i data-lucide="sun" class="w-5 h-5 dark:hidden"></i>
            <i data-lucide="moon" class="w-5 h-5 hidden dark:block"></i>
          </button>
        </div>

        <div class="glass rounded-[40px] p-8 md:p-12 shadow-2xl border border-white/20">
          <div class="mb-10 text-center">
            <div class="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <i data-lucide="user-plus" class="w-10 h-10"></i>
            </div>
            <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Create User</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium text-lg">Enter details to add a new member.</p>
          </div>

          <form method="POST" action="/users" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">First Name</label>
                <div class="relative">
                  <i data-lucide="user" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                  <input type="text" name="first_name" required placeholder="John"
                    class="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white font-medium">
                </div>
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Last Name</label>
                <div class="relative">
                  <i data-lucide="user" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                  <input type="text" name="last_name" placeholder="Doe"
                    class="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white font-medium">
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
              <div class="relative">
                <i data-lucide="mail" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                <input type="email" name="email" required placeholder="john.doe@example.com"
                  class="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white font-medium">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Gender</label>
                <div class="relative">
                  <i data-lucide="users" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10"></i>
                  <select name="gender" required
                    class="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white font-medium appearance-none relative">
                    <option value="" disabled selected>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <i data-lucide="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"></i>
                </div>
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Job Title</label>
                <div class="relative">
                  <i data-lucide="briefcase" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                  <input type="text" name="job_title" required placeholder="Software Engineer"
                    class="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white font-medium">
                </div>
              </div>
            </div>

            <button type="submit" 
              class="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-primary-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mt-8">
              <span>Create User Account</span>
              <i data-lucide="arrow-right" class="w-6 h-6"></i>
            </button>
          </form>
        </div>
      </div>

      ${getSharedScripts()}
    </body>
    </html>
  `;
};

const generateEditUserForm = (user) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      ${getSharedHead("Edit User")}
    </head>
    <body class="bg-slate-50 dark:bg-slate-900 transition-colors duration-300 min-h-screen flex items-center justify-center p-4">
      <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div class="w-full max-w-2xl animate-in">
        <div class="mb-8 flex items-center justify-between">
          <a href="/users" class="flex items-center gap-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 font-bold transition-colors">
            <i data-lucide="arrow-left" class="w-5 h-5"></i>
            <span>Back to Users</span>
          </a>
          <button onclick="toggleTheme()" class="p-2 glass rounded-xl text-slate-600 dark:text-slate-300">
            <i data-lucide="sun" class="w-5 h-5 dark:hidden"></i>
            <i data-lucide="moon" class="w-5 h-5 hidden dark:block"></i>
          </button>
        </div>

        <div class="glass rounded-[40px] p-8 md:p-12 shadow-2xl border border-white/20">
          <div class="mb-10 text-center">
            <div class="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <i data-lucide="user-cog" class="w-10 h-10"></i>
            </div>
            <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Edit User</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium text-lg">Update profile for ID: #${user.id}</p>
          </div>

          <form method="POST" action="/users/${user.id}" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">First Name</label>
                <div class="relative">
                  <i data-lucide="user" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                  <input type="text" name="first_name" required value="${user.first_name}"
                    class="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white font-medium">
                </div>
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Last Name</label>
                <div class="relative">
                  <i data-lucide="user" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                  <input type="text" name="last_name" value="${user.last_name || ''}"
                    class="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white font-medium">
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
              <div class="relative">
                <i data-lucide="mail" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                <input type="email" name="email" required value="${user.email}"
                  class="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white font-medium">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Gender</label>
                <div class="relative">
                  <i data-lucide="users" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10"></i>
                  <select name="gender" required
                    class="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white font-medium appearance-none relative">
                    <option value="Male" ${user.gender === "Male" ? "selected" : ""}>Male</option>
                    <option value="Female" ${user.gender === "Female" ? "selected" : ""}>Female</option>
                    <option value="Other" ${user.gender === "Other" ? "selected" : ""}>Other</option>
                  </select>
                  <i data-lucide="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"></i>
                </div>
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Job Title</label>
                <div class="relative">
                  <i data-lucide="briefcase" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                  <input type="text" name="job_title" required value="${user.job_title}"
                    class="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white font-medium">
                </div>
              </div>
            </div>

            <div class="flex gap-4 pt-6">
              <a href="/users" class="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-center font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                Cancel
              </a>
              <button type="submit" 
                class="flex-[2] py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                <i data-lucide="save" class="w-5 h-5"></i>
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      ${getSharedScripts()}
    </body>
    </html>
  `;
};

const generateDeleteConfirmation = (user) => {
  // This is now integrated into the table via a modal, but keeping for standalone routes if needed
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      ${getSharedHead("Delete User")}
    </head>
    <body class="bg-slate-50 dark:bg-slate-900 flex items-center justify-center min-h-screen p-4">
      <div class="glass max-w-md w-full p-8 rounded-[40px] shadow-2xl text-center animate-in">
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <i data-lucide="alert-triangle" class="w-10 h-10"></i>
        </div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Delete User?</h1>
        <p class="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          You are about to delete <span class="font-bold text-slate-900 dark:text-white">${user.first_name} ${user.last_name}</span>. This action is irreversible.
        </p>
        
        <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-8 text-left border border-slate-200 dark:border-slate-700">
           <div class="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">User Details</div>
           <div class="text-slate-600 dark:text-slate-300 font-medium italic">${user.email}</div>
           <div class="text-slate-600 dark:text-slate-300 font-medium italic">${user.job_title}</div>
        </div>

        <div class="flex flex-col gap-3">
          <form method="POST" action="/users/${user.id}/delete">
            <button type="submit" class="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-red-500/20">
              Confirm Delete
            </button>
          </form>
          <a href="/users" class="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </a>
        </div>
      </div>
      ${getSharedScripts()}
    </body>
    </html>
  `;
};

const toastMessageView = (message, type = "info") => {
  const icons = {
    success: 'check-circle',
    error: 'alert-circle',
    warning: 'alert-triangle',
    info: 'info'
  };
  const colors = {
    success: 'from-green-400 to-emerald-600',
    error: 'from-red-400 to-rose-600',
    warning: 'from-amber-400 to-orange-600',
    info: 'from-blue-400 to-indigo-600'
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      ${getSharedHead(type.toUpperCase())}
    </head>
    <body class="bg-slate-50 dark:bg-slate-900 flex items-center justify-center min-h-screen p-4">
      <div class="glass max-w-sm w-full p-10 rounded-[40px] shadow-2xl text-center animate-in">
        <div class="w-24 h-24 bg-gradient-to-br ${colors[type]} text-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl">
          <i data-lucide="${icons[type]}" class="w-12 h-12"></i>
        </div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-3 capitalize">${type}</h1>
        <p class="text-slate-500 dark:text-slate-400 mb-10 text-lg font-medium leading-relaxed">${message}</p>
        
        <a href="javascript:history.back()" class="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl">
          <i data-lucide="arrow-left" class="w-5 h-5"></i>
          <span>Go Back</span>
        </a>
      </div>
      ${getSharedScripts()}
    </body>
    </html>
  `;
};

module.exports = {
  generateUserTable,
  generateCreateUserForm,
  generateEditUserForm,
  generateDeleteConfirmation,
  toastMessageView
};
