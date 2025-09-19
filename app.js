// Telegram Mini App: EcliptVPN
const app = document.getElementById('app');
const startBtn = document.getElementById('startBtn');

// Screens
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Welcome screen logic
if (startBtn) {
  startBtn.addEventListener('click', () => {
    // Telegram WebApp init
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.expand();
      // Авторизация через Telegram
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      if (user) {
        // Показать экран тарифов
        loadTariffs(user);
      } else {
        alert('Ошибка авторизации через Telegram.');
      }
    } else {
      alert('Откройте приложение через Telegram.');
    }
  });
}

// Динамическая загрузка тарифов
function loadTariffs(user) {
  // ...создание экрана тарифов...
  const tariffsScreen = document.createElement('section');
  tariffsScreen.id = 'tariffs';
  tariffsScreen.className = 'screen active';
  tariffsScreen.innerHTML = `
    <h2>Тарифы EcliptVPN</h2>
    <div class="tariff-list">
      <div class="tariff-card">
        <img src="assets/vpn1.svg" class="tariff-img" />
        <h3>Базовый</h3>
        <p>1 месяц — 299₽</p>
        <button class="main-btn buy-btn" data-plan="basic">Купить</button>
      </div>
      <div class="tariff-card">
        <img src="assets/vpn2.svg" class="tariff-img" />
        <h3>Премиум</h3>
        <p>6 месяцев — 1499₽</p>
        <button class="main-btn buy-btn" data-plan="premium">Купить</button>
      </div>
      <div class="tariff-card">
        <img src="assets/vpn3.svg" class="tariff-img" />
        <h3>Годовой</h3>
        <p>12 месяцев — 2499₽</p>
        <button class="main-btn buy-btn" data-plan="year">Купить</button>
      </div>
    </div>
    <button class="main-btn" id="profileBtn">Личный кабинет</button>
  `;
  app.innerHTML = '';
  app.appendChild(tariffsScreen);

  // Кнопки покупки
  tariffsScreen.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const plan = btn.getAttribute('data-plan');
      showPaymentModal(plan, user);
    });
  });

  // Переход в личный кабинет
  tariffsScreen.querySelector('#profileBtn').onclick = () => {
    loadProfile(user);
  };
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
  document.body.appendChild(modal);
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
        // Передавайте Telegram initData для проверки подписи на сервере
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
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}
