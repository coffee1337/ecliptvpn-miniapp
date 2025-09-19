// EcliptVPN Mini App - Единое приложение с плавными переходами
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
    { id: 1, country: '🇳🇱 Нидерланды', city: 'Амстердам', ping: '12ms', load: 23, price: 299 },
    { id: 2, country: '🇺🇸 США', city: 'Нью-Йорк', ping: '45ms', load: 67, price: 399 },
    { id: 3, country: '🇩🇪 Германия', city: 'Берлин', ping: '25ms', load: 45, price: 299 },
    { id: 4, country: '🇬🇧 Великобритания', city: 'Лондон', ping: '18ms', load: 34, price: 349 },
    { id: 5, country: '🇯🇵 Япония', city: 'Токио', ping: '89ms', load: 12, price: 499 },
    { id: 6, country: '🇸🇬 Сингапур', city: 'Сингапур', ping: '156ms', load: 8, price: 449 },
    { id: 7, country: '🇨🇦 Канада', city: 'Торонто', ping: '78ms', load: 15, price: 399 },
    { id: 8, country: '🇦🇺 Австралия', city: 'Сидней', ping: '234ms', load: 5, price: 599 }
  ],
  periods: [
    { id: 1, name: '1 месяц', duration: 30, discount: 0, multiplier: 1 },
    { id: 2, name: '3 месяца', duration: 90, discount: 10, multiplier: 0.9 },
    { id: 3, name: '6 месяцев', duration: 180, discount: 20, multiplier: 0.8 },
    { id: 4, name: '1 год', duration: 365, discount: 30, multiplier: 0.7 }
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
let selectedPeriod = null;
let isTransitioning = false;
let purchaseStep = 'country'; // country, period, payment

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
  if (isTransitioning) return;
  isTransitioning = true;
  
  const currentScreenEl = app.querySelector('.screen.active');
  if (currentScreenEl) {
    // Анимация исчезновения текущего экрана
    currentScreenEl.style.opacity = '0';
    currentScreenEl.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
      currentScreen = screenName;
      callback();
      isTransitioning = false;
    }, 300);
  } else {
    currentScreen = screenName;
    callback();
    isTransitioning = false;
  }
}

// Инициализация приложения
function initApp() {
  app.innerHTML = `
    <div class="app-container">
      <!-- Экраны будут динамически загружаться -->
    </div>
  `;
  
  showWelcome();
}

// Приветственный экран
function showWelcome() {
  app.innerHTML = `
    <div class="app-container">
      <div class="screen active welcome-screen">
        <div class="welcome-content">
          <div class="logo-anim">
            <div class="logo-icon">🔒</div>
            <h1 class="brand">EcliptVPN</h1>
            <p class="slogan">Безопасность. Свобода. Анонимность.</p>
          </div>
          <button class="main-btn start-btn" onclick="showMainMenu()">
            <span class="btn-icon">🚀</span>
            <span>Начать</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Главное меню
function showMainMenu() {
  transitionToScreen('main', () => {
    app.innerHTML = `
      <div class="app-container">
        <div class="screen active main-screen">
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
            <div class="nav-btn" onclick="showTopup()">
              <div class="nav-btn-icon">💰</div>
              <div class="nav-btn-text">Пополнить</div>
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
          <div class="nav-item" onclick="showTopup()">
            <div class="nav-item-icon">💰</div>
            <div class="nav-item-text">Пополнить</div>
          </div>
          <div class="nav-item" onclick="showProfile()">
            <div class="nav-item-icon">👤</div>
            <div class="nav-item-text">Профиль</div>
          </div>
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
      <div class="app-container">
        <div class="screen active profile-screen">
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
          <div class="nav-item" onclick="showTopup()">
            <div class="nav-item-icon">💰</div>
            <div class="nav-item-text">Пополнить</div>
          </div>
          <div class="nav-item active" onclick="showProfile()">
            <div class="nav-item-icon">👤</div>
            <div class="nav-item-text">Профиль</div>
          </div>
        </div>
      </div>
    `;
    
    updateBottomNav('profile');
  });
}

// Мои VPN / Покупка VPN
function showVPNs() {
  transitionToScreen('vpn', () => {
    if (purchaseStep === 'country') {
      showCountrySelection();
    } else if (purchaseStep === 'period') {
      showPeriodSelection();
    } else if (purchaseStep === 'payment') {
      showPaymentConfirmation();
    } else {
      showMyVPNs();
    }
  });
}

function showMyVPNs() {
  app.innerHTML = `
    <div class="app-container">
      <div class="screen active vpn-screen">
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
        
        <button class="main-btn purchase-btn" onclick="startVPNPurchase()">
          <span class="btn-icon">🛒</span>
          <span>Купить VPN</span>
        </button>
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
        <div class="nav-item" onclick="showTopup()">
          <div class="nav-item-icon">💰</div>
          <div class="nav-item-text">Пополнить</div>
        </div>
        <div class="nav-item" onclick="showProfile()">
          <div class="nav-item-icon">👤</div>
          <div class="nav-item-text">Профиль</div>
        </div>
      </div>
    </div>
  `;
  
  updateBottomNav('vpn');
}

function showCountrySelection() {
  app.innerHTML = `
    <div class="app-container">
      <div class="screen active vpn-screen">
        <div class="header">
          <div class="back-btn" onclick="resetVPNPurchase()">←</div>
          <h2>Выберите страну</h2>
        </div>
        
        <div class="card">
          <h3 style="margin-bottom: 16px; color: var(--primary);">🌍 Доступные серверы</h3>
          <div class="server-list">
            ${mockData.servers.map(server => `
              <div class="server-item" onclick="selectCountry(${server.id})">
                <div class="server-info">
                  <div class="server-country">${server.country}</div>
                  <div class="server-city">${server.city}</div>
                </div>
                <div class="server-stats">
                  <div class="server-ping">${server.ping}</div>
                  <div class="server-load">${server.load}%</div>
                </div>
                <div class="server-price">₽${server.price}/мес</div>
              </div>
            `).join('')}
          </div>
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
        <div class="nav-item" onclick="showTopup()">
          <div class="nav-item-icon">💰</div>
          <div class="nav-item-text">Пополнить</div>
        </div>
        <div class="nav-item" onclick="showProfile()">
          <div class="nav-item-icon">👤</div>
          <div class="nav-item-text">Профиль</div>
        </div>
      </div>
    </div>
  `;
  
  updateBottomNav('vpn');
}

function showPeriodSelection() {
  const totalPrice = Math.round(selectedServer.price * selectedPeriod.multiplier);
  const discount = selectedPeriod.discount;
  
  app.innerHTML = `
    <div class="app-container">
      <div class="screen active vpn-screen">
        <div class="header">
          <div class="back-btn" onclick="backToCountrySelection()">←</div>
          <h2>Выберите период</h2>
        </div>
        
        <div class="card">
          <h3 style="margin-bottom: 16px; color: var(--primary);">📅 Период подписки</h3>
          <div class="selected-server-info">
            <div class="server-country">${selectedServer.country}</div>
            <div class="server-city">${selectedServer.city} • ${selectedServer.ping}</div>
          </div>
        </div>
        
        <div class="periods-list">
          ${mockData.periods.map(period => {
            const price = Math.round(selectedServer.price * period.multiplier);
            const originalPrice = selectedServer.price;
            const isSelected = selectedPeriod?.id === period.id;
            
            return `
              <div class="period-card ${isSelected ? 'selected' : ''}" onclick="selectPeriod(${period.id})">
                <div class="period-info">
                  <div class="period-name">${period.name}</div>
                  <div class="period-duration">${period.duration} дней</div>
                </div>
                <div class="period-price">
                  <div class="price-current">₽${price}</div>
                  ${discount > 0 ? `<div class="price-original">₽${originalPrice}</div>` : ''}
                </div>
                ${discount > 0 ? `<div class="discount-badge">-${period.discount}%</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
        
        ${selectedPeriod ? `
          <div class="card">
            <h3 style="margin-bottom: 16px; color: var(--primary);">💰 Итого</h3>
            <div class="purchase-summary">
              <div class="summary-row">
                <span>Сервер:</span>
                <span>${selectedServer.country} - ${selectedServer.city}</span>
              </div>
              <div class="summary-row">
                <span>Период:</span>
                <span>${selectedPeriod.name}</span>
              </div>
              <div class="summary-row">
                <span>Цена за месяц:</span>
                <span>₽${selectedServer.price}</span>
              </div>
              ${discount > 0 ? `
                <div class="summary-row discount">
                  <span>Скидка ${discount}%:</span>
                  <span>-₽${Math.round(selectedServer.price * (1 - selectedPeriod.multiplier))}</span>
                </div>
              ` : ''}
              <div class="summary-row total">
                <span>К оплате:</span>
                <span>₽${totalPrice}</span>
              </div>
            </div>
          </div>
        ` : ''}
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
        <div class="nav-item" onclick="showTopup()">
          <div class="nav-item-icon">💰</div>
          <div class="nav-item-text">Пополнить</div>
        </div>
        <div class="nav-item" onclick="showProfile()">
          <div class="nav-item-icon">👤</div>
          <div class="nav-item-text">Профиль</div>
        </div>
      </div>
    </div>
  `;
  
  updateBottomNav('vpn');
}

function showPaymentConfirmation() {
  const totalPrice = Math.round(selectedServer.price * selectedPeriod.multiplier);
  
  app.innerHTML = `
    <div class="app-container">
      <div class="screen active vpn-screen">
        <div class="header">
          <div class="back-btn" onclick="backToPeriodSelection()">←</div>
          <h2>Подтверждение</h2>
        </div>
        
        <div class="card">
          <h3 style="margin-bottom: 16px; color: var(--primary);">💳 Подтверждение покупки</h3>
          <div class="purchase-details">
            <div class="purchase-item">
              <div class="purchase-label">Сервер:</div>
              <div class="purchase-value">${selectedServer.country} - ${selectedServer.city}</div>
            </div>
            <div class="purchase-item">
              <div class="purchase-label">Период:</div>
              <div class="purchase-value">${selectedPeriod.name}</div>
            </div>
            <div class="purchase-item">
              <div class="purchase-label">Стоимость:</div>
              <div class="purchase-value">₽${totalPrice}</div>
            </div>
            <div class="purchase-item">
              <div class="purchase-label">Ваш баланс:</div>
              <div class="purchase-value">₽${mockData.profile.balance}</div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <h3 style="margin-bottom: 16px; color: var(--primary);">💰 Способ оплаты</h3>
          <div class="payment-options">
            <div class="payment-option selected">
              <div class="payment-icon">💰</div>
              <div class="payment-name">Списать с баланса</div>
              <div class="payment-amount">₽${totalPrice}</div>
            </div>
          </div>
        </div>
        
        <button class="main-btn purchase-btn" onclick="confirmPurchase()" ${totalPrice > mockData.profile.balance ? 'disabled' : ''}>
          <span class="btn-icon">💳</span>
          <span>${totalPrice > mockData.profile.balance ? 'Недостаточно средств' : 'Подтвердить покупку'}</span>
        </button>
        
        ${totalPrice > mockData.profile.balance ? `
          <button class="main-btn secondary-btn" onclick="showTopup()">
            <span class="btn-icon">💰</span>
            <span>Пополнить баланс</span>
          </button>
        ` : ''}
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
        <div class="nav-item" onclick="showTopup()">
          <div class="nav-item-icon">💰</div>
          <div class="nav-item-text">Пополнить</div>
        </div>
        <div class="nav-item" onclick="showProfile()">
          <div class="nav-item-icon">👤</div>
          <div class="nav-item-text">Профиль</div>
        </div>
      </div>
    </div>
  `;
  
  updateBottomNav('vpn');
}

// Серверы
function showServers() {
  transitionToScreen('servers', () => {
    app.innerHTML = `
      <div class="app-container">
        <div class="screen active servers-screen">
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
          <div class="nav-item" onclick="showTopup()">
            <div class="nav-item-icon">💰</div>
            <div class="nav-item-text">Пополнить</div>
          </div>
          <div class="nav-item" onclick="showProfile()">
            <div class="nav-item-icon">👤</div>
            <div class="nav-item-text">Профиль</div>
          </div>
        </div>
      </div>
    `;
    
    updateBottomNav('servers');
  });
}

// Пополнение баланса
function showTopup() {
  transitionToScreen('topup', () => {
    app.innerHTML = `
      <div class="app-container">
        <div class="screen active topup-screen">
          <div class="header">
            <div class="back-btn" onclick="showMainMenu()">←</div>
            <h2>Пополнение</h2>
          </div>
          
          <div class="card">
            <div class="balance-display">
              <div class="balance-icon">💰</div>
              <div class="balance-info">
                <h3>Текущий баланс</h3>
                <div class="balance-amount">₽${mockData.profile.balance}</div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3 style="margin-bottom: 16px; color: var(--primary);">💳 Сумма пополнения</h3>
            <div class="quick-amounts">
              <button class="amount-btn" onclick="selectAmount(100)">₽100</button>
              <button class="amount-btn" onclick="selectAmount(500)">₽500</button>
              <button class="amount-btn" onclick="selectAmount(1000)">₽1000</button>
              <button class="amount-btn" onclick="selectAmount(2000)">₽2000</button>
            </div>
            
            <div class="form-group">
              <label class="form-label">Или введите свою сумму:</label>
              <input type="number" id="customAmount" class="form-input" placeholder="Введите сумму" min="10" max="50000">
            </div>
            
            <button class="main-btn" onclick="processPayment()" style="width: 100%; margin-top: 16px;">
              <span class="btn-icon">💳</span>
              <span>Пополнить баланс</span>
            </button>
          </div>
          
          <div class="card">
            <h3 style="margin-bottom: 16px; color: var(--primary);">💡 Способы оплаты</h3>
            <div class="payment-methods">
              <div class="payment-method">
                <div class="payment-icon">💳</div>
                <div class="payment-name">Банковская карта</div>
              </div>
              <div class="payment-method">
                <div class="payment-icon">📱</div>
                <div class="payment-name">СБП</div>
              </div>
              <div class="payment-method">
                <div class="payment-icon">🏦</div>
                <div class="payment-name">Банковский перевод</div>
              </div>
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
          <div class="nav-item active" onclick="showTopup()">
            <div class="nav-item-icon">💰</div>
            <div class="nav-item-text">Пополнить</div>
          </div>
          <div class="nav-item" onclick="showProfile()">
            <div class="nav-item-icon">👤</div>
            <div class="nav-item-text">Профиль</div>
          </div>
        </div>
      </div>
    `;
    
    updateBottomNav('topup');
  });
}

// Функции покупки VPN
function startVPNPurchase() {
  purchaseStep = 'country';
  selectedServer = null;
  selectedPeriod = null;
  showVPNs();
}

function selectCountry(serverId) {
  selectedServer = mockData.servers.find(s => s.id === serverId);
  purchaseStep = 'period';
  showVPNs();
  showToast(`Выбрана страна: ${selectedServer.country}`, 'success');
}

function selectPeriod(periodId) {
  selectedPeriod = mockData.periods.find(p => p.id === periodId);
  purchaseStep = 'payment';
  showVPNs();
  showToast(`Выбран период: ${selectedPeriod.name}`, 'success');
}

function backToCountrySelection() {
  purchaseStep = 'country';
  selectedServer = null;
  selectedPeriod = null;
  showVPNs();
}

function backToPeriodSelection() {
  purchaseStep = 'period';
  selectedPeriod = null;
  showVPNs();
}

function resetVPNPurchase() {
  purchaseStep = 'country';
  selectedServer = null;
  selectedPeriod = null;
  showMyVPNs();
}

function confirmPurchase() {
  const totalPrice = Math.round(selectedServer.price * selectedPeriod.multiplier);
  
  if (totalPrice > mockData.profile.balance) {
    showToast('Недостаточно средств на балансе', 'error');
    return;
  }
  
  showToast('Обработка покупки...', 'info');
  
  setTimeout(() => {
    // Списываем с баланса
    mockData.profile.balance -= totalPrice;
    
    // Добавляем новый VPN
    const newVPN = {
      id: mockData.vpns.length + 1,
      plan: 'Premium VPN',
      country: selectedServer.country,
      server: selectedServer.city + '-01',
      expiry: new Date(Date.now() + selectedPeriod.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      speed: '1000 Mbps',
      ping: selectedServer.ping,
      config: `vpn://config${mockData.vpns.length + 1}.example.com`
    };
    
    mockData.vpns.push(newVPN);
    mockData.profile.vpn_count = mockData.vpns.filter(v => v.status === 'active').length;
    
    // Сбрасываем покупку
    purchaseStep = 'country';
    selectedServer = null;
    selectedPeriod = null;
    
    showToast(`VPN успешно куплен! Баланс: ₽${mockData.profile.balance}`, 'success');
    showMyVPNs();
  }, 2000);
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

function selectAmount(amount) {
  // Убираем активный класс со всех кнопок
  document.querySelectorAll('.amount-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Добавляем активный класс к выбранной кнопке
  event.target.classList.add('active');
  
  // Устанавливаем значение в поле ввода
  const customAmountInput = document.getElementById('customAmount');
  if (customAmountInput) {
    customAmountInput.value = amount;
  }
  
  showToast(`Выбрана сумма: ₽${amount}`, 'info');
}

function processPayment() {
  const customAmountInput = document.getElementById('customAmount');
  const amount = customAmountInput ? customAmountInput.value : 0;
  
  if (!amount || amount < 10) {
    showToast('Введите сумму от 10 рублей', 'error');
    return;
  }
  
  showToast('Обработка платежа...', 'info');
  
  setTimeout(() => {
    // Обновляем баланс
    mockData.profile.balance += parseInt(amount);
    showToast(`Баланс пополнен на ₽${amount}!`, 'success');
    
    // Обновляем главное меню если оно открыто
    if (currentScreen === 'main') {
      showMainMenu();
    }
  }, 2000);
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

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM загружен');
  initApp();
});

// Глобальные функции
window.showMainMenu = showMainMenu;
window.showProfile = showProfile;
window.showVPNs = showVPNs;
window.showServers = showServers;
window.showTopup = showTopup;
window.selectServer = selectServer;
window.connectToServer = connectToServer;
window.selectAmount = selectAmount;
window.processPayment = processPayment;
window.copyConfig = copyConfig;
window.startVPNPurchase = startVPNPurchase;
window.selectCountry = selectCountry;
window.selectPeriod = selectPeriod;
window.backToCountrySelection = backToCountrySelection;
window.backToPeriodSelection = backToPeriodSelection;
window.resetVPNPurchase = resetVPNPurchase;
window.confirmPurchase = confirmPurchase;

console.log('✅ EcliptVPN Mini App готов к работе!');