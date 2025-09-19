// EcliptVPN Mini App - Полная версия с моковыми данными
console.log('🚀 Инициализация EcliptVPN Mini App...');

// Глобальные переменные
const app = document.getElementById('app');
const overlays = document.getElementById('ui-overlays');
const hasWebApp = Boolean(window.Telegram?.WebApp);

// Моковые данные
const mockData = {
  user: {
    id: 12345,
    first_name: 'Алексей',
    last_name: 'Петров',
    username: 'alex_petrov'
  },
  profile: {
    balance: 2500,
    status: 'Premium',
    vpn_count: 3,
    join_date: '2024-01-15'
  },
  vpns: [
    {
      id: 1,
      plan: 'Premium VPN',
      country: '🇳🇱 Нидерланды',
      server: 'Amsterdam-01',
      expiry: '2024-12-31',
      status: 'active',
      speed: '1000 Mbps',
      ping: '12ms',
      config: 'vpn://config1.example.com'
    },
    {
      id: 2,
      plan: 'Standard VPN',
      country: '🇺🇸 США',
      server: 'New York-02',
      expiry: '2024-11-15',
      status: 'active',
      speed: '500 Mbps',
      ping: '45ms',
      config: 'vpn://config2.example.com'
    },
    {
      id: 3,
      plan: 'Basic VPN',
      country: '🇩🇪 Германия',
      server: 'Berlin-01',
      expiry: '2024-10-20',
      status: 'expired',
      speed: '100 Mbps',
      ping: '25ms',
      config: 'vpn://config3.example.com'
    }
  ],
  servers: [
    { id: 1, country: '🇳🇱 Нидерланды', city: 'Амстердам', ping: '12ms', load: 23 },
    { id: 2, country: '🇺🇸 США', city: 'Нью-Йорк', ping: '45ms', load: 67 },
    { id: 3, country: '🇩🇪 Германия', city: 'Берлин', ping: '25ms', load: 45 },
    { id: 4, country: '🇬🇧 Великобритания', city: 'Лондон', ping: '18ms', load: 34 },
    { id: 5, country: '🇯🇵 Япония', city: 'Токио', ping: '89ms', load: 12 },
    { id: 6, country: '🇸🇬 Сингапур', city: 'Сингапур', ping: '156ms', load: 8 }
  ],
  plans: [
    { id: 1, name: 'Basic', price: 299, duration: 'месяц', features: ['100 Mbps', '1 устройство', '5 стран'] },
    { id: 2, name: 'Standard', price: 599, duration: 'месяц', features: ['500 Mbps', '3 устройства', '15 стран'] },
    { id: 3, name: 'Premium', price: 999, duration: 'месяц', features: ['1000 Mbps', '5 устройств', '30 стран'] }
  ]
};

// Состояние приложения
let currentScreen = 'welcome';
let currentUser = null;
let selectedServer = null;

// Инициализация Telegram WebApp
if (hasWebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  currentUser = window.Telegram.WebApp.initDataUnsafe?.user || mockData.user;
  console.log('✅ Telegram WebApp инициализирован');
} else {
  currentUser = mockData.user;
  console.log('🔧 Режим разработки');
}

// Утилиты
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span>${message}</span>
    </div>
  `;
  overlays.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function addClickAnimation(element) {
  element.style.transform = 'scale(0.95)';
  setTimeout(() => {
    element.style.transform = '';
  }, 150);
}

function transitionToScreen(screenName, callback) {
  const currentScreenEl = app.querySelector('.screen.active');
  if (currentScreenEl) {
    currentScreenEl.style.opacity = '0';
    currentScreenEl.style.transform = 'translateY(20px) scale(0.95)';
    setTimeout(() => {
      currentScreen = screenName;
      callback();
    }, 200);
  } else {
    currentScreen = screenName;
    callback();
  }
}

// Главное меню
function showMainMenu() {
  transitionToScreen('main', () => {
    app.innerHTML = `
      <div class="screen active">
        <div class="header">
          <h1>EcliptVPN</h1>
        </div>
        
        <div class="welcome-section">
          <div class="welcome-text">Добро пожаловать,</div>
          <div class="user-name">${currentUser.first_name}!</div>
        </div>
        
        <div class="nav-buttons">
          <div class="nav-btn" onclick="showProfile()">
            <div class="nav-btn-icon">👤</div>
            <div class="nav-btn-text">Профиль</div>
          </div>
          <div class="nav-btn" onclick="showVPNs()">
            <div class="nav-btn-icon">🔒</div>
            <div class="nav-btn-text">Мои VPN</div>
          </div>
          <div class="nav-btn" onclick="showServers()">
            <div class="nav-btn-icon">🌍</div>
            <div class="nav-btn-text">Серверы</div>
          </div>
          <div class="nav-btn" onclick="showPlans()">
            <div class="nav-btn-icon">💳</div>
            <div class="nav-btn-text">Тарифы</div>
          </div>
        </div>
        
        <div class="card">
          <h3 style="margin-bottom: 16px; color: var(--primary);">📊 Статистика</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${mockData.profile.vpn_count}</div>
              <div class="stat-label">Активных VPN</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">₽${mockData.profile.balance}</div>
              <div class="stat-label">Баланс</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bottom-nav">
        <div class="nav-item active" onclick="showMainMenu()">
          <div class="nav-item-icon">🏠</div>
          <div class="nav-item-text">Главная</div>
        </div>
        <div class="nav-item" onclick="showVPNs()">
          <div class="nav-item-icon">🔒</div>
          <div class="nav-item-text">VPN</div>
        </div>
        <div class="nav-item" onclick="showServers()">
          <div class="nav-item-icon">🌍</div>
          <div class="nav-item-text">Серверы</div>
        </div>
        <div class="nav-item" onclick="showProfile()">
          <div class="nav-item-icon">👤</div>
          <div class="nav-item-text">Профиль</div>
        </div>
      </div>
    `;
    
    updateBottomNav('main');
  });
}

// Профиль
function showProfile() {
  transitionToScreen('profile', () => {
    app.innerHTML = `
      <div class="screen active profile">
        <div class="header">
          <div class="back-btn" onclick="showMainMenu()">←</div>
          <h2>Профиль</h2>
        </div>
        
        <div class="profile-card">
          <div class="profile-avatar">
            ${currentUser.first_name.charAt(0)}
          </div>
          <div class="profile-info">
            <h3>${currentUser.first_name} ${currentUser.last_name}</h3>
            <p class="profile-id">ID: ${currentUser.id}</p>
            <div class="status-badge">${mockData.profile.status}</div>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">₽${mockData.profile.balance}</div>
            <div class="stat-label">Баланс</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${mockData.profile.vpn_count}</div>
            <div class="stat-label">VPN</div>
          </div>
        </div>
        
        <div class="card">
          <h3 style="margin-bottom: 16px; color: var(--primary);">📈 Активность</h3>
          <div class="detail-row">
            <span class="detail-label">Дата регистрации:</span>
            <span class="detail-value">${mockData.profile.join_date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Статус:</span>
            <span class="detail-value">${mockData.profile.status}</span>
          </div>
        </div>
        
        <div class="card">
          <h3 style="margin-bottom: 16px; color: var(--primary);">⚙️ Настройки</h3>
          <button class="main-btn" onclick="showToast('Функция в разработке', 'info')">
            <span class="btn-icon">⚙️</span>
            <span>Настройки</span>
          </button>
        </div>
      </div>
      
      <div class="bottom-nav">
        <div class="nav-item" onclick="showMainMenu()">
          <div class="nav-item-icon">🏠</div>
          <div class="nav-item-text">Главная</div>
        </div>
        <div class="nav-item" onclick="showVPNs()">
          <div class="nav-item-icon">🔒</div>
          <div class="nav-item-text">VPN</div>
        </div>
        <div class="nav-item" onclick="showServers()">
          <div class="nav-item-icon">🌍</div>
          <div class="nav-item-text">Серверы</div>
        </div>
        <div class="nav-item active" onclick="showProfile()">
          <div class="nav-item-icon">👤</div>
          <div class="nav-item-text">Профиль</div>
        </div>
      </div>
    `;
    
    updateBottomNav('profile');
  });
}

// Мои VPN
function showVPNs() {
  transitionToScreen('orders', () => {
    app.innerHTML = `
      <div class="screen active orders">
        <div class="header">
          <div class="back-btn" onclick="showMainMenu()">←</div>
          <h2>Мои VPN</h2>
        </div>
        
        <div class="vpn-list">
          ${mockData.vpns.map(vpn => `
            <div class="vpn-card ${vpn.status}">
              <div class="vpn-header">
                <div class="vpn-icon">🔒</div>
                <div class="vpn-info">
                  <div class="vpn-plan">${vpn.plan}</div>
                  <div class="vpn-country">${vpn.country}</div>
                </div>
                <div class="vpn-status">${vpn.status === 'active' ? 'Активен' : 'Истек'}</div>
              </div>
              <div class="vpn-details">
                <div class="detail-row">
                  <span class="detail-label">Сервер:</span>
                  <span class="detail-value">${vpn.server}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Скорость:</span>
                  <span class="detail-value">${vpn.speed}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Пинг:</span>
                  <span class="detail-value">${vpn.ping}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Действует до:</span>
                  <span class="detail-value">${vpn.expiry}</span>
                </div>
              </div>
              <button class="main-btn" onclick="copyConfig('${vpn.config}')">
                <span class="btn-icon">📋</span>
                <span>Скопировать конфиг</span>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="bottom-nav">
        <div class="nav-item" onclick="showMainMenu()">
          <div class="nav-item-icon">🏠</div>
          <div class="nav-item-text">Главная</div>
        </div>
        <div class="nav-item active" onclick="showVPNs()">
          <div class="nav-item-icon">🔒</div>
          <div class="nav-item-text">VPN</div>
        </div>
        <div class="nav-item" onclick="showServers()">
          <div class="nav-item-icon">🌍</div>
          <div class="nav-item-text">Серверы</div>
        </div>
        <div class="nav-item" onclick="showProfile()">
          <div class="nav-item-icon">👤</div>
          <div class="nav-item-text">Профиль</div>
        </div>
      </div>
    `;
    
    updateBottomNav('vpn');
  });
}

// Серверы
function showServers() {
  transitionToScreen('servers', () => {
    app.innerHTML = `
      <div class="screen active servers">
        <div class="header">
          <div class="back-btn" onclick="showMainMenu()">←</div>
          <h2>Серверы</h2>
        </div>
        
        <div class="card">
          <h3 style="margin-bottom: 16px; color: var(--primary);">🌍 Выберите сервер</h3>
          <div class="server-list">
            ${mockData.servers.map(server => `
              <div class="server-item ${selectedServer?.id === server.id ? 'selected' : ''}" 
                   onclick="selectServer(${server.id})">
                <div class="server-info">
                  <div class="server-country">${server.country}</div>
                  <div class="server-city">${server.city}</div>
                </div>
                <div class="server-stats">
                  <div class="server-ping">${server.ping}</div>
                  <div class="server-load">${server.load}%</div>
                </div>
                <div class="server-status">
                  ${selectedServer?.id === server.id ? '✅' : '⚪'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        ${selectedServer ? `
          <div class="card">
            <h3 style="margin-bottom: 16px; color: var(--primary);">🚀 Подключение</h3>
            <div class="connection-info">
              <div class="detail-row">
                <span class="detail-label">Выбранный сервер:</span>
                <span class="detail-value">${selectedServer.country} - ${selectedServer.city}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Пинг:</span>
                <span class="detail-value">${selectedServer.ping}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Нагрузка:</span>
                <span class="detail-value">${selectedServer.load}%</span>
              </div>
            </div>
            <button class="main-btn" onclick="connectToServer()">
              <span class="btn-icon">🔗</span>
              <span>Подключиться</span>
            </button>
          </div>
        ` : ''}
      </div>
      
      <div class="bottom-nav">
        <div class="nav-item" onclick="showMainMenu()">
          <div class="nav-item-icon">🏠</div>
          <div class="nav-item-text">Главная</div>
        </div>
        <div class="nav-item" onclick="showVPNs()">
          <div class="nav-item-icon">🔒</div>
          <div class="nav-item-text">VPN</div>
        </div>
        <div class="nav-item active" onclick="showServers()">
          <div class="nav-item-icon">🌍</div>
          <div class="nav-item-text">Серверы</div>
        </div>
        <div class="nav-item" onclick="showProfile()">
          <div class="nav-item-icon">👤</div>
          <div class="nav-item-text">Профиль</div>
        </div>
      </div>
    `;
    
    updateBottomNav('servers');
  });
}

// Тарифы
function showPlans() {
  transitionToScreen('plans', () => {
    app.innerHTML = `
      <div class="screen active plans">
        <div class="header">
          <div class="back-btn" onclick="showMainMenu()">←</div>
          <h2>Тарифы</h2>
        </div>
        
        <div class="plans-list">
          ${mockData.plans.map(plan => `
            <div class="plan-card ${plan.name === 'Premium' ? 'featured' : ''}">
              ${plan.name === 'Premium' ? '<div class="plan-badge">Популярный</div>' : ''}
              <div class="plan-header">
                <div class="plan-name">${plan.name}</div>
                <div class="plan-price">₽${plan.price}<span class="plan-period">/${plan.duration}</span></div>
              </div>
              <div class="plan-features">
                ${plan.features.map(feature => `
                  <div class="plan-feature">✅ ${feature}</div>
                `).join('')}
              </div>
              <button class="main-btn" onclick="selectPlan(${plan.id})">
                <span class="btn-icon">💳</span>
                <span>Выбрать план</span>
              </button>
            </div>
          `).join('')}
        </div>
        
        <div class="card">
          <h3 style="margin-bottom: 16px; color: var(--primary);">💡 Преимущества</h3>
          <div class="benefits-list">
            <div class="benefit-item">🔒 256-bit шифрование</div>
            <div class="benefit-item">🚀 Высокая скорость</div>
            <div class="benefit-item">🌍 30+ стран</div>
            <div class="benefit-item">📱 Все устройства</div>
            <div class="benefit-item">🛡️ Без логов</div>
          </div>
        </div>
      </div>
      
      <div class="bottom-nav">
        <div class="nav-item" onclick="showMainMenu()">
          <div class="nav-item-icon">🏠</div>
          <div class="nav-item-text">Главная</div>
        </div>
        <div class="nav-item" onclick="showVPNs()">
          <div class="nav-item-icon">🔒</div>
          <div class="nav-item-text">VPN</div>
        </div>
        <div class="nav-item" onclick="showServers()">
          <div class="nav-item-icon">🌍</div>
          <div class="nav-item-text">Серверы</div>
        </div>
        <div class="nav-item" onclick="showProfile()">
          <div class="nav-item-icon">👤</div>
          <div class="nav-item-text">Профиль</div>
        </div>
      </div>
    `;
    
    updateBottomNav('plans');
  });
}

// Функции
function selectServer(serverId) {
  selectedServer = mockData.servers.find(s => s.id === serverId);
  showServers();
  showToast(`Выбран сервер: ${selectedServer.country}`, 'success');
}

function connectToServer() {
  if (!selectedServer) {
    showToast('Выберите сервер', 'error');
    return;
  }
  
  showToast('Подключение к серверу...', 'info');
  
  setTimeout(() => {
    showToast(`Подключено к ${selectedServer.country}!`, 'success');
  }, 2000);
}

function selectPlan(planId) {
  const plan = mockData.plans.find(p => p.id === planId);
  showToast(`Выбран план: ${plan.name}`, 'success');
  
  // Здесь была бы интеграция с платежной системой
  setTimeout(() => {
    showToast('Платеж успешно обработан!', 'success');
  }, 1500);
}

function copyConfig(config) {
  navigator.clipboard.writeText(config).then(() => {
    showToast('Конфигурация скопирована!', 'success');
  }).catch(() => {
    showToast('Ошибка копирования', 'error');
  });
}

function updateBottomNav(activeItem) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeNavItem = document.querySelector(`[onclick*="${activeItem}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }
}

// Приветственный экран
function showWelcome() {
  app.innerHTML = `
    <div class="screen active">
      <div class="welcome-section" style="text-align: center; margin-top: 20vh;">
        <div class="logo-anim">
          <div style="font-size: 4rem; margin-bottom: 20px;">🔒</div>
          <h1 style="font-size: 2.5rem; margin-bottom: 10px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">EcliptVPN</h1>
          <p style="color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 40px;">Безопасность. Свобода. Анонимность.</p>
        </div>
        <button class="main-btn" onclick="showMainMenu()" style="font-size: 1.1rem; padding: 16px 32px;">
          <span class="btn-icon">🚀</span>
          <span>Начать</span>
        </button>
      </div>
    </div>
  `;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM загружен');
  showWelcome();
});

// Обработка кнопки "Начать"
window.showMainMenu = showMainMenu;
window.showProfile = showProfile;
window.showVPNs = showVPNs;
window.showServers = showServers;
window.showPlans = showPlans;
window.selectServer = selectServer;
window.connectToServer = connectToServer;
window.selectPlan = selectPlan;
window.copyConfig = copyConfig;

console.log('✅ EcliptVPN Mini App готов к работе!');