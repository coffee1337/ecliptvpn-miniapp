// Telegram Mini App: EcliptVPN
console.log('Инициализация приложения...');

// Глобальные переменные и инициализация
const app = document.getElementById('app');
const overlays = document.getElementById('ui-overlays');
const hasWebApp = Boolean(window.Telegram?.WebApp);

// Инициализация Telegram WebApp
if (hasWebApp) {
  window.Telegram.WebApp.ready();
  console.log('Telegram WebApp доступен');
}

// UI функции
function showToast(message, duration = 2500) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  overlays.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

function showTooltip(target, text) {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = text;
  overlays.appendChild(tooltip);
  
  const rect = target.getBoundingClientRect();
  tooltip.style.left = rect.left + window.scrollX + rect.width / 2 + 'px';
  tooltip.style.top = rect.top + window.scrollY - 32 + 'px';
  tooltip.classList.add('active');
  
  return tooltip;
}

function hideTooltip(tooltip) {
  if (tooltip?.classList?.contains('active')) {
    tooltip.classList.remove('active');
    setTimeout(() => tooltip.remove(), 200);
  }
}

// Анимация клика
function addClickAnimation(element) {
  element.style.transform = 'scale(0.95)';
  setTimeout(() => {
    element.style.transform = '';
  }, 150);
}

// Плавный переход между экранами
function transitionToScreen(callback) {
  const currentScreen = app.querySelector('.screen.active');
  if (currentScreen) {
    currentScreen.style.opacity = '0';
    currentScreen.style.transform = 'translateX(20px)';
    setTimeout(callback, 200);
  } else {
    callback();
  }
}

// Основные экраны
async function showMainMenu(user) {
  console.log('Открываем главное меню');
  app.innerHTML = '';
  
  const mainMenu = document.createElement('section');
  mainMenu.id = 'mainMenu';
  mainMenu.className = 'screen active';
  
  mainMenu.innerHTML = `
    <div class="header">
      <h2>EcliptVPN</h2>
      <p class="welcome-text">Добро пожаловать, <b>${user?.first_name || 'Гость'}</b>!</p>
    </div>
    <div class="menu-buttons">
      <button class="main-btn menu-btn" id="profileBtn">
        <span class="btn-icon">👤</span>
        <span>Профиль</span>
      </button>
      <button class="main-btn menu-btn" id="ordersBtn">
        <span class="btn-icon">🔒</span>
        <span>Мои VPN</span>
      </button>
      <button class="main-btn menu-btn" id="topupBtn">
        <span class="btn-icon">💳</span>
        <span>Пополнить</span>
      </button>
      <button class="main-btn menu-btn" id="promoBtn">
        <span class="btn-icon">🎁</span>
        <span>Промокод</span>
      </button>
    </div>
  `;
  
  app.appendChild(mainMenu);

  // Назначаем обработчики с анимацией
  mainMenu.querySelector('#profileBtn').onclick = () => {
    addClickAnimation(mainMenu.querySelector('#profileBtn'));
    setTimeout(() => showProfile(user), 150);
  };
  mainMenu.querySelector('#ordersBtn').onclick = () => {
    addClickAnimation(mainMenu.querySelector('#ordersBtn'));
    setTimeout(() => showOrders(user), 150);
  };
  mainMenu.querySelector('#topupBtn').onclick = () => {
    addClickAnimation(mainMenu.querySelector('#topupBtn'));
    setTimeout(() => showTopup(user), 150);
  };
  mainMenu.querySelector('#promoBtn').onclick = () => {
    addClickAnimation(mainMenu.querySelector('#promoBtn'));
    setTimeout(() => showPromo(user), 150);
  };
}

async function showProfile(user) {
  transitionToScreen(() => {
    app.innerHTML = '';
    const screen = document.createElement('section');
    screen.id = 'profile';
    screen.className = 'screen active profile';
    
    screen.innerHTML = `
      <div class="header">
        <button class="back-btn" id="backBtn">←</button>
        <h2>Профиль</h2>
      </div>
      <div class="profile-card">
        <div class="profile-avatar">
          <div class="avatar-circle">
            <span class="avatar-text">${(user.first_name || 'Г').charAt(0).toUpperCase()}</span>
          </div>
        </div>
        <div class="profile-details">
          <h3 class="profile-name">${user.first_name || ''} ${user.last_name || ''}</h3>
          <p class="profile-id">ID: ${user.id}</p>
          <div class="status-container">
            <span class="status-label">Статус:</span>
            <span class="sub-status">Загрузка...</span>
          </div>
        </div>
      </div>
      <div class="profile-stats">
        <div class="stat-item">
          <span class="stat-value">0</span>
          <span class="stat-label">Активных VPN</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">₽0</span>
          <span class="stat-label">Баланс</span>
        </div>
      </div>
    `;
    
    app.appendChild(screen);
    screen.querySelector('#backBtn').onclick = () => {
      addClickAnimation(screen.querySelector('#backBtn'));
      setTimeout(() => showMainMenu(user), 150);
    };
  });
  
  try {
    const res = await fetch('https://your-bot-backend/api/profile?user_id=' + user.id, {
      headers: hasWebApp ? { 'X-Telegram-InitData': window.Telegram.WebApp.initData } : {}
    });
    
    const data = await res.json();
    if (data.subscription) {
      screen.querySelector('.sub-status').textContent = data.subscription.status;
    }
  } catch (e) {
    console.error('Ошибка загрузки профиля:', e);
    screen.querySelector('.sub-status').textContent = 'Ошибка загрузки';
  }
}

async function showOrders(user) {
  transitionToScreen(() => {
    app.innerHTML = '';
    const screen = document.createElement('section');
    screen.id = 'orders';
    screen.className = 'screen active orders';
    
    screen.innerHTML = `
      <div class="header">
        <button class="back-btn" id="backBtn">←</button>
        <h2>Мои VPN</h2>
      </div>
      <div class="orders-container">
        <div id="ordersList" class="loading">
          <div class="loading-spinner"></div>
          <p>Загрузка VPN...</p>
        </div>
      </div>
    `;
    
    app.appendChild(screen);
    screen.querySelector('#backBtn').onclick = () => {
      addClickAnimation(screen.querySelector('#backBtn'));
      setTimeout(() => showMainMenu(user), 150);
    };
  });
  
  try {
    const res = await fetch('https://your-bot-backend/api/orders?user_id=' + user.id, {
      headers: hasWebApp ? { 'X-Telegram-InitData': window.Telegram.WebApp.initData } : {}
    });
    
    const data = await res.json();
    const list = screen.querySelector('#ordersList');
    
    if (Array.isArray(data.orders) && data.orders.length) {
      list.className = 'vpn-list';
      list.innerHTML = data.orders.map(o => `
        <div class="vpn-card">
          <div class="vpn-header">
            <div class="vpn-icon">🔒</div>
            <div class="vpn-info">
              <h3 class="vpn-plan">${o.plan}</h3>
              <p class="vpn-country">${o.country}</p>
            </div>
            <div class="vpn-status active">Активен</div>
          </div>
          <div class="vpn-details">
            <div class="detail-item">
              <span class="detail-label">Действует до:</span>
              <span class="detail-value">${o.expiry}</span>
            </div>
          </div>
          <button class="main-btn copy-btn" data-config="${o.config}">
            <span class="btn-icon">📋</span>
            Скопировать конфиг
          </button>
        </div>
      `).join('');
      
      // Обработчики копирования
      list.querySelectorAll('.copy-btn').forEach(btn => {
        btn.onclick = () => {
          navigator.clipboard.writeText(btn.dataset.config)
            .then(() => showToast('Конфиг скопирован!'))
            .catch(() => showToast('Ошибка копирования'));
        };
      });
    } else {
      list.className = 'empty-state';
      list.innerHTML = `
        <div class="empty-icon">🔒</div>
        <h3>Нет активных VPN</h3>
        <p>У вас пока нет активных VPN подключений</p>
        <button class="main-btn" onclick="showTopup(${JSON.stringify(user).replace(/"/g, '&quot;')})">
          Купить VPN
        </button>
      `;
    }
  } catch (e) {
    console.error('Ошибка загрузки VPN:', e);
    screen.querySelector('#ordersList').className = 'error-state';
    screen.querySelector('#ordersList').innerHTML = `
      <div class="error-icon">⚠️</div>
      <h3>Ошибка загрузки</h3>
      <p>Не удалось загрузить список VPN</p>
    `;
  }
}

async function showTopup(user) {
  transitionToScreen(() => {
    app.innerHTML = '';
    const screen = document.createElement('section');
    screen.id = 'topup';
    screen.className = 'screen active';
  
  screen.innerHTML = `
    <div class="header">
      <button class="back-btn" id="backBtn">←</button>
      <h2>Пополнение</h2>
    </div>
    <div class="topup-container">
      <div class="balance-card">
        <div class="balance-icon">💰</div>
        <div class="balance-info">
          <h3>Текущий баланс</h3>
          <p class="balance-amount">₽0</p>
        </div>
      </div>
      
      <form id="topupForm" class="topup-form">
        <div class="form-group">
          <label for="amount" class="form-label">Сумма пополнения (₽)</label>
          <input type="number" min="10" max="10000" required id="amount" class="form-input" placeholder="Введите сумму" />
        </div>
        
        <div class="quick-amounts">
          <button type="button" class="amount-btn" data-amount="100">₽100</button>
          <button type="button" class="amount-btn" data-amount="500">₽500</button>
          <button type="button" class="amount-btn" data-amount="1000">₽1000</button>
          <button type="button" class="amount-btn" data-amount="2000">₽2000</button>
        </div>
        
        <button type="submit" class="main-btn submit-btn">
          <span class="btn-icon">💳</span>
          <span>Оплатить</span>
        </button>
      </form>
      
      <div id="topupResult" class="result-container"></div>
    </div>
  `;
    
    app.appendChild(screen);
    
    // Обработчики
    screen.querySelector('#backBtn').onclick = () => {
      addClickAnimation(screen.querySelector('#backBtn'));
      setTimeout(() => showMainMenu(user), 150);
    };
    
    // Быстрые суммы
  screen.querySelectorAll('.amount-btn').forEach(btn => {
    btn.onclick = () => {
      screen.querySelector('#amount').value = btn.dataset.amount;
    };
  });
  
  screen.querySelector('#topupForm').onsubmit = async (e) => {
    e.preventDefault();
    const amount = screen.querySelector('#amount').value;
    const result = screen.querySelector('#topupResult');
    
    result.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Создание платежа...</p>
      </div>
    `;
    
    try {
      const res = await fetch('https://your-bot-backend/api/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(hasWebApp ? { 'X-Telegram-InitData': window.Telegram.WebApp.initData } : {})
        },
        body: JSON.stringify({ user_id: user.id, amount })
      });
      
      const data = await res.json();
      if (data.success && data.pay_url) {
        result.innerHTML = `
          <div class="success-state">
            <div class="success-icon">✅</div>
            <h3>Платеж создан</h3>
            <p>Сумма: ₽${amount}</p>
            <a href="${data.pay_url}" target="_blank" class="main-btn">
              <span class="btn-icon">🔗</span>
              Перейти к оплате
            </a>
          </div>
        `;
      } else {
        result.innerHTML = `
          <div class="error-state">
            <div class="error-icon">❌</div>
            <h3>Ошибка</h3>
            <p>Не удалось создать платеж</p>
          </div>
        `;
      }
    } catch (e) {
      console.error('Ошибка пополнения:', e);
      result.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Ошибка связи</h3>
          <p>Проверьте подключение к интернету</p>
        </div>
      `;
    }
  };
  });
}

async function showPromo(user) {
  transitionToScreen(() => {
    app.innerHTML = '';
    const screen = document.createElement('section');
    screen.id = 'promo';
    screen.className = 'screen active';
  
  screen.innerHTML = `
    <div class="header">
      <button class="back-btn" id="backBtn">←</button>
      <h2>Промокод</h2>
    </div>
    <div class="promo-container">
      <div class="promo-card">
        <div class="promo-icon">🎁</div>
        <h3>Активация промокода</h3>
        <p>Введите промокод для получения бонусов</p>
      </div>
      
      <form id="promoForm" class="promo-form">
        <div class="form-group">
          <label for="code" class="form-label">Промокод</label>
          <input type="text" required id="code" class="form-input" pattern="[A-Za-z0-9]+" placeholder="Введите промокод" />
        </div>
        
        <button type="submit" class="main-btn submit-btn">
          <span class="btn-icon">✨</span>
          <span>Активировать</span>
        </button>
      </form>
      
      <div id="promoResult" class="result-container"></div>
      
      <div class="promo-info">
        <h4>Как получить промокод?</h4>
        <ul>
          <li>Подпишитесь на наш канал</li>
          <li>Участвуйте в акциях</li>
          <li>Приглашайте друзей</li>
        </ul>
      </div>
    </div>
  `;
  
    app.appendChild(screen);
    
    // Обработчики
    screen.querySelector('#backBtn').onclick = () => {
      addClickAnimation(screen.querySelector('#backBtn'));
      setTimeout(() => showMainMenu(user), 150);
    };
  screen.querySelector('#promoForm').onsubmit = async (e) => {
    e.preventDefault();
    const code = screen.querySelector('#code').value;
    const result = screen.querySelector('#promoResult');
    
    result.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Проверка промокода...</p>
      </div>
    `;
    
    try {
      const res = await fetch('https://your-bot-backend/api/promo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(hasWebApp ? { 'X-Telegram-InitData': window.Telegram.WebApp.initData } : {})
        },
        body: JSON.stringify({ user_id: user.id, code })
      });
      
      const data = await res.json();
      if (data.success) {
        result.innerHTML = `
          <div class="success-state">
            <div class="success-icon">🎉</div>
            <h3>Промокод активирован!</h3>
            <p>${data.message || 'Бонус добавлен на ваш баланс'}</p>
          </div>
        `;
        screen.querySelector('#code').value = '';
      } else {
        result.innerHTML = `
          <div class="error-state">
            <div class="error-icon">❌</div>
            <h3>Ошибка</h3>
            <p>${data.error || 'Промокод не найден или уже использован'}</p>
          </div>
        `;
      }
    } catch (e) {
      console.error('Ошибка активации промокода:', e);
      result.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Ошибка связи</h3>
          <p>Проверьте подключение к интернету</p>
        </div>
      `;
    }
  };
  });
}

// Обработчик кнопки "Начать"
function attachStartHandler() {
  const startBtn = document.getElementById('startBtn');
  if (!startBtn) {
    console.warn('Кнопка #startBtn не найдена');
    return false;
  }

  console.log('Нашли кнопку, привязываем обработчик...');
  
  // Назначаем обработчик
  startBtn.onclick = async () => {
    console.log('Кнопка "Начать" нажата');
    try {
      if (hasWebApp) {
        window.Telegram.WebApp.expand();
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
          await showMainMenu(user);
        } else {
          console.log('Нет данных пользователя, показываем тестовый режим');
          await showMainMenu({ first_name: 'Тест', id: 0 });
        }
      } else {
        console.log('Режим разработки');
        await showMainMenu({ first_name: 'Гость', id: 0 });
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showToast('Не удалось загрузить меню');
    }
  };

  console.log('Обработчик успешно установлен');
  return true;
}

// Инициализация
console.log('Пытаемся прикрепить обработчик при загрузке...');

// Пробуем сразу
if (!attachStartHandler()) {
  console.log('Кнопка не найдена, ждём загрузку DOM...');
  
  // Пробуем после загрузки страницы
  window.addEventListener('load', () => {
    console.log('Страница загружена, пробуем снова...');
    if (!attachStartHandler()) {
      console.log('Кнопка всё ещё не найдена, запускаем наблюдатель...');
      
      // Наблюдаем за изменениями DOM
      const observer = new MutationObserver((mutations, obs) => {
        if (attachStartHandler()) {
          console.log('Кнопка найдена через MutationObserver');
          obs.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Сообщим, если кнопка так и не появится
      setTimeout(() => {
        if (!document.getElementById('startBtn')) {
          console.warn('Кнопка #startBtn не найдена даже после 5 секунд ожидания');
        }
      }, 5000);
    }
  });
}