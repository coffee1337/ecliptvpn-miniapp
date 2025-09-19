// EcliptVPN Mini App
console.log('Инициализация приложения...');

// Глобальные переменные
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

// Вспомогательные функции
function addTooltipHandlers(element, text) {
  if (!element) return;
  
  let currentTooltip = null;
  
  element.addEventListener('mouseenter', () => {
    currentTooltip = showTooltip(element, text);
  });
  
  element.addEventListener('mouseleave', () => {
    hideTooltip(currentTooltip);
  });
  
  element.addEventListener('touchstart', (e) => {
    e.preventDefault();
    currentTooltip = showTooltip(element, text);
  });
  
  element.addEventListener('touchend', () => {
    hideTooltip(currentTooltip);
  });
}

// Основные экраны
async function showMainMenu(user) {
  console.log('Открываем главное меню для:', user);
  app.innerHTML = '';
  
  const mainMenu = document.createElement('section');
  mainMenu.id = 'mainMenu';
  mainMenu.className = 'screen active';
  
  mainMenu.innerHTML = `
    <h2>Главное меню</h2>
    <p>Добро пожаловать, <b>${user?.first_name || 'Гость'}</b>!</p>
    <div class="menu-buttons">
      <button class="main-btn" id="profileBtn">Профиль</button>
      <button class="main-btn" id="ordersBtn">Мои VPN</button>
      <button class="main-btn" id="topupBtn">Пополнить</button>
      <button class="main-btn" id="promoBtn">Промокод</button>
    </div>
  `;
  
  app.appendChild(mainMenu);

  // Назначаем обработчики
  mainMenu.querySelector('#profileBtn').onclick = () => showProfile(user);
  mainMenu.querySelector('#ordersBtn').onclick = () => showOrders(user);
  mainMenu.querySelector('#topupBtn').onclick = () => showTopup(user);
  mainMenu.querySelector('#promoBtn').onclick = () => showPromo(user);
}

async function showProfile(user) {
  app.innerHTML = '';
  const screen = document.createElement('section');
  screen.id = 'profile';
  screen.className = 'screen active';
  
  screen.innerHTML = `
    <h2>Профиль</h2>
    <div class="profile-info">
      <img src="assets/user.svg" class="profile-img" />
      <p><b>${user.first_name || ''} ${user.last_name || ''}</b></p>
      <p>ID: ${user.id}</p>
      <p>Статус: <span class="sub-status">Загрузка...</span></p>
      <div class="info-icon" title="Информация">ℹ️</div>
    </div>
    <div class="orders-history">
      <h3>История заказов</h3>
      <ul><li>Загрузка...</li></ul>
    </div>
    <button class="main-btn" id="backBtn">Назад</button>
  `;
  
  app.appendChild(screen);
  
  // Обработчики
  screen.querySelector('#backBtn').onclick = () => showMainMenu(user);
  addTooltipHandlers(
    screen.querySelector('.info-icon'),
    'В профиле отображается статус подписки и история заказов.'
  );
  
  // Загрузка данных
  try {
    const res = await fetch('https://your-bot-backend/api/profile?user_id=' + user.id, {
      headers: hasWebApp ? { 'X-Telegram-InitData': window.Telegram.WebApp.initData } : {}
    });
    
    const data = await res.json();
    if (data.subscription) {
      screen.querySelector('.sub-status').textContent = data.subscription.status;
    }
    
    if (Array.isArray(data.orders)) {
      const ul = screen.querySelector('.orders-history ul');
      ul.innerHTML = data.orders.map(o => 
        `<li>${o.date} — ${o.plan} — ${o.price}₽ — ${o.status}</li>`
      ).join('') || '<li>Нет заказов</li>';
    }
  } catch (e) {
    console.error('Ошибка загрузки профиля:', e);
    showToast('Ошибка загрузки данных профиля');
  }
}

async function showOrders(user) {
  app.innerHTML = '';
  const screen = document.createElement('section');
  screen.id = 'orders';
  screen.className = 'screen active';
  
  screen.innerHTML = `
    <h2>Мои VPN</h2>
    <div id="ordersList">Загрузка...</div>
    <button class="main-btn" id="backBtn">Назад</button>
  `;
  
  app.appendChild(screen);
  screen.querySelector('#backBtn').onclick = () => showMainMenu(user);
  
  try {
    const res = await fetch('https://your-bot-backend/api/orders?user_id=' + user.id, {
      headers: hasWebApp ? { 'X-Telegram-InitData': window.Telegram.WebApp.initData } : {}
    });
    
    const data = await res.json();
    const list = screen.querySelector('#ordersList');
    
    if (Array.isArray(data.orders) && data.orders.length) {
      list.innerHTML = data.orders.map(o => `
        <div class="vpn-card">
          <b>${o.plan}</b>
          <p>Страна: ${o.country}</p>
          <p>Действует до: ${o.expiry}</p>
          <button class="main-btn copy-btn" data-config="${o.config}">
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
      list.innerHTML = '<p>У вас нет активных VPN</p>';
    }
  } catch (e) {
    console.error('Ошибка загрузки VPN:', e);
    screen.querySelector('#ordersList').innerHTML = '<p>Ошибка загрузки VPN</p>';
  }
}

async function showTopup(user) {
  app.innerHTML = '';
  const screen = document.createElement('section');
  screen.id = 'topup';
  screen.className = 'screen active';
  
  screen.innerHTML = `
    <h2>Пополнение баланса</h2>
    <form id="topupForm">
      <label>
        Сумма (₽):
        <input type="number" min="10" max="10000" required id="amount" />
      </label>
      <button type="submit" class="main-btn">Оплатить</button>
    </form>
    <div id="topupResult"></div>
    <button class="main-btn" id="backBtn">Назад</button>
  `;
  
  app.appendChild(screen);
  
  // Обработчики
  screen.querySelector('#backBtn').onclick = () => showMainMenu(user);
  screen.querySelector('#topupForm').onsubmit = async (e) => {
    e.preventDefault();
    const amount = screen.querySelector('#amount').value;
    const result = screen.querySelector('#topupResult');
    
    result.textContent = 'Создание платежа...';
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
          <a href="${data.pay_url}" target="_blank" class="main-btn">
            Перейти к оплате
          </a>
        `;
      } else {
        result.textContent = 'Ошибка создания платежа';
      }
    } catch (e) {
      console.error('Ошибка пополнения:', e);
      result.textContent = 'Ошибка связи с сервером';
    }
  };
}

async function showPromo(user) {
  app.innerHTML = '';
  const screen = document.createElement('section');
  screen.id = 'promo';
  screen.className = 'screen active';
  
  screen.innerHTML = `
    <h2>Активация промокода</h2>
    <form id="promoForm">
      <label>
        Промокод:
        <input type="text" required id="code" pattern="[A-Za-z0-9]+" />
      </label>
      <button type="submit" class="main-btn">Активировать</button>
    </form>
    <div id="promoResult"></div>
    <button class="main-btn" id="backBtn">Назад</button>
  `;
  
  app.appendChild(screen);
  
  // Обработчики
  screen.querySelector('#backBtn').onclick = () => showMainMenu(user);
  screen.querySelector('#promoForm').onsubmit = async (e) => {
    e.preventDefault();
    const code = screen.querySelector('#code').value;
    const result = screen.querySelector('#promoResult');
    
    result.textContent = 'Проверка промокода...';
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
      result.textContent = data.success
        ? 'Промокод успешно активирован!'
        : 'Ошибка: ' + (data.error || 'Промокод не найден');
    } catch (e) {
      console.error('Ошибка активации промокода:', e);
      result.textContent = 'Ошибка связи с сервером';
    }
  };
}

// Обработчик кнопки "Начать"
function attachStartHandler() {
  const startBtn = document.getElementById('startBtn');
  if (!startBtn) {
    console.warn('Кнопка #startBtn не найдена');
    return false;
  }

  console.log('Нашли кнопку, привязываем обработчик...');
  
  // Новый обработчик
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