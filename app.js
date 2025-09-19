// Главный экран меню
async function showMainMenu(user) {
  app.innerHTML = '';
  const mainMenu = document.createElement('section');
  mainMenu.id = 'mainMenu';
  mainMenu.className = 'screen active';
  mainMenu.innerHTML = `<h2>Главное меню</h2><p>Добро пожаловать, <b>${user?.first_name || 'Гость'}</b>!</p><button class="main-btn" id="profileBtn">Профиль</button>`;
  app.appendChild(mainMenu);
  // Пример перехода в профиль
  mainMenu.querySelector('#profileBtn').onclick = () => loadProfile(user);
}
// Telegram Mini App: EcliptVPN
const app = document.getElementById('app');
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.onclick = async () => {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.expand();
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        if (user) {
          await showMainMenu(user);
        } else {
          alert('Ошибка авторизации через Telegram.');
        }
      } else {
        alert('Откройте приложение через Telegram.');
      }
    };
  }
});
const overlays = document.getElementById('ui-overlays');

async function loadProfile(user) {
  app.innerHTML = '';
  const profileScreen = document.createElement('section');
  profileScreen.id = 'profile';
  profileScreen.className = 'screen active';
  profileScreen.innerHTML = `<h2>Личный кабинет</h2><div class="profile-info"><img src="assets/user.svg" class="profile-img" /><p><b>${user.first_name || ''} ${user.last_name || ''}</b></p><p>ID: ${user.id}</p><p>Статус подписки: <span class="sub-status">Активна</span></p><button class="main-btn" id="backToTariffs">Назад к тарифам</button></div><div class="orders-history"><h3>История заказов</h3><ul></ul></div>`;
  app.appendChild(profileScreen);
  profileScreen.querySelector('#backToTariffs').onclick = () => loadTariffs(user);
  // Всплывающая подсказка для инфо-иконки
  const infoIcon = profileScreen.querySelector('.info-icon');
  if (infoIcon) {
    infoIcon.addEventListener('mouseenter', () => showTooltip(infoIcon, 'В профиле отображается статус подписки и история заказов.'));
    infoIcon.addEventListener('mouseleave', hideTooltip);
    infoIcon.addEventListener('touchstart', () => showTooltip(infoIcon, 'В профиле отображается статус подписки и история заказов.'));
    infoIcon.addEventListener('touchend', hideTooltip);
  }
  // Получение профиля и истории заказов из API
  try {
    const res = await fetch('https://your-bot-backend/api/profile?user_id=' + user.id, {
      headers: { 'X-Telegram-InitData': window.Telegram.WebApp.initData || '' }
    });
    const data = await res.json();
    if (data.subscription) {
      profileScreen.querySelector('.sub-status').textContent = data.subscription.status;
    }
    if (Array.isArray(data.orders)) {
      const ul = profileScreen.querySelector('.orders-history ul');
      ul.innerHTML = data.orders.map(o => `<li>${o.date} — ${o.plan} — ${o.price}₽ — ${o.status}</li>`).join('');
    }
  } catch (e) {
    profileScreen.querySelector('.orders-history ul').innerHTML = '<li>Ошибка загрузки истории заказов.</li>';
  }
    infoIcon.addEventListener('touchend', hideTooltip);
  }
  // Получение тарифов из API
  try {
    const res = await fetch('https://your-bot-backend/api/plans?user_id=' + user.id, {
      headers: { 'X-Telegram-InitData': window.Telegram.WebApp.initData || '' }
    });
    const data = await res.json();
    const list = tariffsScreen.querySelector('.tariff-list');
    if (Array.isArray(data.plans)) {
      data.plans.forEach((plan, idx) => {
        const card = document.createElement('div');
        card.className = 'tariff-card';
        card.innerHTML = `
          <img src="assets/vpn${(idx%3)+1}.svg" class="tariff-img" />
          <h3>${plan.name}</h3>
          <p>${plan.duration} мес — ${plan.price}₽</p>
          <button class="main-btn buy-btn" data-plan="${plan.id}">Купить</button>
        `;
        card.querySelector('.buy-btn').onclick = () => showPaymentModal(plan.id, user);
        list.appendChild(card);
      });
    } else {
      list.innerHTML = '<p>Не удалось загрузить тарифы. Попробуйте позже.</p>';
    }
  } catch (e) {
    tariffsScreen.querySelector('.tariff-list').innerHTML = '<p>Ошибка загрузки тарифов.</p>';
  }
  // Переход в личный кабинет
  tariffsScreen.querySelector('#profileBtn').onclick = () => {
    loadProfile(user);
  };
// конец функции loadProfile
      // Всплывающая подсказка для инфо-иконки
      const infoIcon = tariffsScreen.querySelector('.info-icon');
      if (infoIcon) {
        infoIcon.addEventListener('mouseenter', () => showTooltip(infoIcon, 'Тарифы включают доступ к VPN, поддержку и безопасность.')); 
        infoIcon.addEventListener('mouseleave', hideTooltip);
        infoIcon.addEventListener('touchstart', () => showTooltip(infoIcon, 'Тарифы включают доступ к VPN, поддержку и безопасность.'));
        infoIcon.addEventListener('touchend', hideTooltip);
      }

// Модальное окно оплаты
function showPaymentModal(plan, user) {
  // ...создание модального окна...
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Оплата тарифа</h3>
      <p>Вы выбрали: <b>${plan}</b></p>
      <button class="main-btn" id="payBtn">Оплатить</button>
      <button class="main-btn" id="closeModal">Отмена</button>
    </div>
  `;
  overlays.appendChild(modal);
  document.getElementById('closeModal').onclick = () => modal.remove();
  document.getElementById('payBtn').onclick = () => {
    // Анимация успешной оплаты
    modal.querySelector('.modal-content').innerHTML = '<h3>Оплата успешна!</h3><div class="success-anim"></div>';
    setTimeout(() => {
      modal.remove();
      loadProfile(user);
    }, 1500);
    // Пример безопасного запроса к вашему боту
    fetch('https://your-bot-backend/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
  // overlays.appendChild(modal); // уже добавлено выше
        'X-Telegram-InitData': window.Telegram.WebApp.initData || ''
      },
      body: JSON.stringify({ user_id: user.id, plan })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('Оплата прошла успешно!');
      } else {
        showToast('Ошибка оплаты: ' + (data.error || '')); 
      }
    })
    .catch(() => showToast('Ошибка связи с сервером!'));
  };
}

// Экран личного кабинета
function loadProfile(user) {
  // ...создание экрана профиля...
  const profileScreen = document.createElement('section');
  profileScreen.id = 'profile';
  profileScreen.className = 'screen active';
  profileScreen.innerHTML = `
    <h2>Личный кабинет</h2>
    <div class="profile-info">
      <img src="assets/user.svg" class="profile-img" />
      <p><b>${user.first_name || ''} ${user.last_name || ''}</b></p>
      <p>ID: ${user.id}</p>
      <p>Статус подписки: <span class="sub-status">Активна</span></p>
      <button class="main-btn" id="backToTariffs">Назад к тарифам</button>
    </div>
    <div class="orders-history">
      <h3>История заказов</h3>
      <ul>
        <li>01.09.2025 — Годовой — 2499₽ — Активен</li>
        <li>01.03.2025 — Базовый — 299₽ — Истек</li>
      </ul>
    </div>
  `;
  app.innerHTML = '';
  app.appendChild(profileScreen);
  profileScreen.querySelector('#backToTariffs').onclick = () => loadTariffs(user);
  // Пример получения статуса подписки и истории заказов
  fetch('https://your-bot-backend/profile?user_id=' + user.id, {
    headers: {
      'X-Telegram-InitData': window.Telegram.WebApp.initData || ''
    }
  })
    .then(res => res.json())
    .then(data => {
      // Обновить статус подписки и историю заказов
      if (data.subscription) {
        profileScreen.querySelector('.sub-status').textContent = data.subscription.status;
      }
      if (data.orders) {
        const ul = profileScreen.querySelector('.orders-history ul');
      // Всплывающая подсказка для инфо-иконки
      const infoIcon = profileScreen.querySelector('.info-icon');
      if (infoIcon) {
        infoIcon.addEventListener('mouseenter', () => showTooltip(infoIcon, 'В профиле отображается статус подписки и история заказов.'));
        infoIcon.addEventListener('mouseleave', hideTooltip);
        infoIcon.addEventListener('touchstart', () => showTooltip(infoIcon, 'В профиле отображается статус подписки и история заказов.'));
        infoIcon.addEventListener('touchend', hideTooltip);
      }
        ul.innerHTML = data.orders.map(o => `<li>${o.date} — ${o.plan} — ${o.price}₽ — ${o.status}</li>`).join('');
      }
    });
}

// Пополнение баланса
async function showTopup(user) {
  app.innerHTML = '';
  const topupScreen = document.createElement('section');
  topupScreen.className = 'screen active';
  topupScreen.innerHTML = `
    <h2>Пополнение баланса</h2>
    <form id="topupForm">
      <label>Сумма (₽): <input type="number" min="10" max="10000" required id="topupAmount" /></label>
      <button class="main-btn" type="submit">Оплатить</button>
    </form>
    <div id="topupResult"></div>
    <button class="main-btn" id="backBtn">Назад</button>
  `;
  app.appendChild(topupScreen);
  topupScreen.querySelector('#backBtn').onclick = () => showMainMenu(user);
  topupScreen.querySelector('#topupForm').onsubmit = async (e) => {
    e.preventDefault();
    const amount = topupScreen.querySelector('#topupAmount').value;
    const result = topupScreen.querySelector('#topupResult');
    result.textContent = 'Создание платежа...';
    try {
      // Пример запроса к API для создания платежа
      const res = await fetch('https://your-bot-backend/api/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Telegram-InitData': window.Telegram.WebApp.initData || '' },
        body: JSON.stringify({ user_id: user.id, amount })
      });
      const data = await res.json();
      if (data.success && data.pay_url) {
        result.innerHTML = `<a href="${data.pay_url}" target="_blank" class="main-btn">Перейти к оплате</a>`;
      } else {
        result.textContent = 'Ошибка создания платежа.';
      }
    } catch {
      result.textContent = 'Ошибка связи с сервером.';
    }
  };
}

// Активация промокода
async function showPromo(user) {
  app.innerHTML = '';
  const promoScreen = document.createElement('section');
  promoScreen.className = 'screen active';
  promoScreen.innerHTML = `
    <h2>Активация промокода</h2>
    <form id="promoForm">
      <label>Промокод: <input type="text" required id="promoCode" /></label>
      <button class="main-btn" type="submit">Активировать</button>
    </form>
    <div id="promoResult"></div>
    <button class="main-btn" id="backBtn">Назад</button>
  `;
  app.appendChild(promoScreen);
  promoScreen.querySelector('#backBtn').onclick = () => showMainMenu(user);
  promoScreen.querySelector('#promoForm').onsubmit = async (e) => {
    e.preventDefault();
    const code = promoScreen.querySelector('#promoCode').value;
    const result = promoScreen.querySelector('#promoResult');
    result.textContent = 'Проверка промокода...';
    try {
      const res = await fetch('https://your-bot-backend/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Telegram-InitData': window.Telegram.WebApp.initData || '' },
        body: JSON.stringify({ user_id: user.id, code })
      });
      const data = await res.json();
      if (data.success) {
        result.textContent = 'Промокод успешно активирован!';
      } else {
        result.textContent = 'Ошибка: ' + (data.error || 'Промокод не найден');
      }
    } catch {
      result.textContent = 'Ошибка связи с сервером.';
    }
  };
}

// Всплывающие подсказки, уведомления, анимации и безопасность передачи данных реализуются в следующих шагах.

// Всплывающее уведомление
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  overlays.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Всплывающая подсказка
function showTooltip(target, text) {
  let tooltip = document.querySelector('.tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    overlays.appendChild(tooltip);
  }
  tooltip.textContent = text;
  const rect = target.getBoundingClientRect();
  tooltip.style.left = rect.left + window.scrollX + rect.width / 2 + 'px';
  tooltip.style.top = rect.top + window.scrollY - 32 + 'px';
  tooltip.classList.add('active');
}
function hideTooltip() {
  const tooltip = document.querySelector('.tooltip');
  if (tooltip) tooltip.classList.remove('active');
}

// Мои VPN
async function showOrders(user) {
  app.innerHTML = '';
  const ordersScreen = document.createElement('section');
  ordersScreen.className = 'screen active';
  ordersScreen.innerHTML = `<h2>Мои VPN</h2><div id="ordersList">Загрузка...</div><button class="main-btn" id="backBtn">Назад</button>`;
  app.appendChild(ordersScreen);
  ordersScreen.querySelector('#backBtn').onclick = () => showMainMenu(user);
  try {
    const res = await fetch('https://your-bot-backend/api/orders?user_id=' + user.id, {
      headers: { 'X-Telegram-InitData': window.Telegram.WebApp.initData || '' }
    });
    const data = await res.json();
    const list = ordersScreen.querySelector('#ordersList');
    if (Array.isArray(data.orders) && data.orders.length) {
      list.innerHTML = data.orders.map(o => `<div class="vpn-card"><b>${o.plan}</b><br>Страна: ${o.country}<br>Действует до: ${o.expiry}<br><button class="main-btn" onclick="navigator.clipboard.writeText('${o.config}');showToast('Конфиг скопирован!')">Скопировать конфиг</button></div>`).join('');
    } else {
      list.textContent = 'У вас нет активных VPN.';
    }
  } catch {
    ordersScreen.querySelector('#ordersList').textContent = 'Ошибка загрузки VPN.';
  }
}

// История платежей
async function showPayments(user) {
  app.innerHTML = '';
  const paymentsScreen = document.createElement('section');
  paymentsScreen.className = 'screen active';
  paymentsScreen.innerHTML = `<h2>История платежей</h2><ul id="paymentsList">Загрузка...</ul><button class="main-btn" id="backBtn">Назад</button>`;
  app.appendChild(paymentsScreen);
  paymentsScreen.querySelector('#backBtn').onclick = () => showMainMenu(user);
  try {
    const res = await fetch('https://your-bot-backend/api/payments?user_id=' + user.id, {
      headers: { 'X-Telegram-InitData': window.Telegram.WebApp.initData || '' }
    });
    const data = await res.json();
    const list = paymentsScreen.querySelector('#paymentsList');
    if (Array.isArray(data.payments) && data.payments.length) {
      list.innerHTML = data.payments.map(p => `<li>${p.date} — ${p.amount}₽ — ${p.status}</li>`).join('');
    } else {
      list.textContent = 'Нет платежей.';
    }
  } catch {
    paymentsScreen.querySelector('#paymentsList').textContent = 'Ошибка загрузки платежей.';
  }
}

// Помощь
function showHelp(user) {
  app.innerHTML = '';
  const helpScreen = document.createElement('section');
  helpScreen.className = 'screen active';
  helpScreen.innerHTML = `<h2>Помощь</h2><div><b>FAQ:</b><ul><li>Как купить VPN?</li><li>Как пополнить баланс?</li><li>Как активировать промокод?</li></ul><p>Техподдержка: <a href="https://t.me/EcliptVPN" target="_blank">@EcliptVPN</a></p></div><button class="main-btn" id="backBtn">Назад</button>`;
  app.appendChild(helpScreen);
  helpScreen.querySelector('#backBtn').onclick = () => showMainMenu(user);
}

// Админ-панель
async function showAdmin(user) {
  app.innerHTML = '';
  const adminScreen = document.createElement('section');
  adminScreen.className = 'screen active';
  adminScreen.innerHTML = `<h2>Админ-панель</h2><div id="adminPanel">Загрузка...</div><button class="main-btn" id="backBtn">Назад</button>`;
  app.appendChild(adminScreen);
  adminScreen.querySelector('#backBtn').onclick = () => showMainMenu(user);
  try {
    const res = await fetch('https://your-bot-backend/api/admin?user_id=' + user.id, {
      headers: { 'X-Telegram-InitData': window.Telegram.WebApp.initData || '' }
    });
    const data = await res.json();
    const panel = adminScreen.querySelector('#adminPanel');
    panel.innerHTML = `<b>Пользователей:</b> ${data.users}<br><b>Активных VPN:</b> ${data.vpn}<br><b>Платежей:</b> ${data.payments}`;
  } catch {
    adminScreen.querySelector('#adminPanel').textContent = 'Ошибка загрузки данных.';
  }
}
