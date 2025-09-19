// Telegram Mini App: EcliptVPN
const app = document.getElementById('app');
const startBtn = document.getElementById('startBtn');
const overlays = document.getElementById('ui-overlays');

async function loadProfile(user) {
  app.innerHTML = '';
  const profileScreen = document.createElement('section');
  profileScreen.id = 'profile';
  profileScreen.className = 'screen active';
  profileScreen.innerHTML = `<h2>Личный кабинет <span class="info-icon" title="О профиле">ℹ️</span></h2><div class="profile-info"><img src="assets/user.svg" class="profile-img" /><p><b>${user.first_name || ''} ${user.last_name || ''}</b></p><p>ID: ${user.id}</p><p>Статус подписки: <span class="sub-status">...</span></p><button class="main-btn" id="backToTariffs">Назад к тарифам</button></div><div class="orders-history"><h3>История заказов</h3><ul></ul></div>`;
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
