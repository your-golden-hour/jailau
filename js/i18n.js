/* ============================================================
   Jailau — i18n (Russian / Kazakh)
   All UI text must come through I18N.t(key) or data-i18n attrs.
   ============================================================ */

(function () {
  "use strict";

  var DICT = {
    ru: {
      /* Global */
      app_name: "Жайлау",
      app_tagline: "Сёла и город — вместе в пути",
      brand_subtitle: "Поездки рядом",
      hero_eyebrow: "ШЫМКЕНТ · СЁЛА ТУРКЕСТАНСКОЙ ОБЛАСТИ",
      hero_title: "Ближе друг к другу. Ближе к дому.",
      hero_description: "Оставьте заявку на поездку — водитель вашего района увидит её. Договоритесь напрямую и оплатите наличными.",
      hero_step_one: "Выберите село",
      hero_step_two: "Расскажите о поездке",
      hero_step_three: "Свяжитесь с водителем",
      demo_choose_role: "Посмотреть сайт как",
      home_eyebrow: "ПОЕЗДКИ МЕЖДУ ГОРОДОМ И СЕЛОМ",
      home_ready: "Куда отправимся сегодня?",
      home_lead: "Выберите своё село, посмотрите водителей на линии или создайте заявку — это займёт пару минут.",
      home_step_one: "Выберите направление",
      home_step_two: "Укажите время и места",
      home_step_three: "Дождитесь водителя",
      home_how_title: "Как это работает",
      terms_link: "Условия и конфиденциальность",
      terms_title: "Условия и конфиденциальность",
      terms_updated: "Черновик для демонстрации. Перед запуском с реальными людьми необходима юридическая консультация.",
      terms_service: "«Жайлау» помогает пассажирам и водителям находить друг друга. Платформа не является перевозчиком и не выполняет поездки.",
      terms_payment: "Оплата поездки — наличными между пассажиром и водителем. Цена согласуется ими напрямую; платформа не принимает платежи.",
      terms_data: "Для работы нужны имя, номер телефона и выбранное село. В заявке также могут быть время, место посадки, количество мест и комментарий. Номера участников открываются друг другу только после принятия заявки.",
      terms_warning: "Не пишите номер телефона или другие личные данные в комментарии и месте посадки: эти поля видны водителям района до принятия заявки.",
      terms_demo: "Сейчас сайт работает в демонстрационном режиме: данные вымышленные и исчезают после обновления страницы.",
      err_public_phone: "Уберите номер телефона из открытого поля. Он появится у водителя после принятия заявки.",
      demo_badge: "ДЕМО РЕЖИМ",
      demo_banner_text: "Демонстрационные данные. Реальных поездок пока нет.",
      city_shymkent: "Шымкент",
      currency: "₸",
      km: "км",
      yes: "Да",
      no: "Нет",
      save: "Сохранить",
      cancel: "Отмена",
      close: "Закрыть",
      loading: "Загрузка…",
      error_generic: "Что-то пошло не так. Попробуйте ещё раз.",
      lang_switcher_aria: "Переключить язык",

      /* Nav */
      nav_home: "Главная",
      nav_new_request: "Создать",
      nav_my_requests: "Мои заявки",
      nav_feed: "Лента",
      nav_driver_requests: "Мои поездки",
      nav_admin: "Админ",
      nav_logout: "Выйти",

      /* Auth */
      login_title: "Вход",
      register_title: "Регистрация",
      tab_login: "Войти",
      tab_register: "Зарегистрироваться",
      field_name: "Имя",
      field_phone: "Телефон",
      field_phone_hint: "Формат: +7 7XX XXX XX XX. Другие не увидят ваш номер до принятия заявки.",
      field_plate: "Госномер авто",
      field_password: "Пароль",
      field_confirm_password: "Повторите пароль",
      field_role: "Кто вы?",
      role_passenger: "Пассажир",
      role_driver: "Водитель",
      role_admin: "Администратор",
      btn_login: "Войти",
      btn_register: "Создать аккаунт",
      err_name_required: "Введите имя",
      err_phone_invalid: "Введите корректный номер телефона",
      err_password_short: "Пароль минимум 6 символов",
      err_passwords_mismatch: "Пароли не совпадают",
      err_login_failed: "Неверный телефон или пароль",
      err_phone_exists: "Такой телефон уже зарегистрирован",
      auth_welcome: "Бесплатно. Без СМС. Без лишних данных.",
      demo_accounts_hint: "Демо-аккаунты (пароль у всех: demo1234):",
      demo_acc_passenger: "пассажир",
      demo_acc_driver: "водитель",
      demo_acc_admin: "админ",
      quick_login: "Быстрый вход:",

      /* Passenger home */
      ph_home_hello: "Здравствуйте, {name}!",
      ph_home_subtitle: "Найдите попутку между вашим селом и Шымкентом",
      ph_village_label: "Ваше село",
      ph_online_drivers: "Водители на линии в этом селе",
      ph_no_drivers: "Сейчас нет водителей на линии в этом селе.",
      ph_create_request_cta: "Создать заявку на поездку",
      ph_driver_card: "{brand} · {seats} мест",
      ph_driver_since: "На линии с {time}",
      ph_privacy_note: "Номера телефонов скрыты. Водитель увидит ваш номер только после принятия заявки — и наоборот.",

      /* New request */
      nr_title: "Новая заявка",
      nr_subtitle: "Опишите поездку — водители вашего района увидят её",
      nr_direction: "Направление",
      nr_dir_to_city: "Село → Шымкент",
      nr_dir_from_city: "Шымкент → Село",
      nr_village: "Село",
      nr_pickup: "Место посадки (необязательно)",
      nr_pickup_placeholder: "Например: у мечети, центральный магазин",
      nr_when: "Когда",
      nr_when_asap: "Как можно скорее",
      nr_when_scheduled: "По времени",
      nr_date: "Дата",
      nr_time: "Время",
      nr_seats: "Мест",
      nr_price_block: "Цена",
      nr_price_negotiable: "Договорная",
      nr_price_fixed: "Моя цена",
      nr_price_suggested: "Ориентир: {price}",
      nr_comment: "Комментарий (необязательно)",
      nr_comment_placeholder: "Багаж, дети, домашняя птица…",
      nr_submit: "Опубликовать заявку",
      nr_created: "Заявка опубликована! Водители увидят её в ленте.",
      err_village_required: "Выберите село",
      err_seats_range: "От 1 до 4 мест",
      err_datetime_required: "Укажите дату и время",
      err_price_invalid: "Укажите цену больше нуля или выберите «Договорная»",

      /* My requests (passenger) */
      mr_title: "Мои заявки",
      mr_empty: "Пока нет заявок. Создайте первую!",
      mr_status_open: "Открыта",
      mr_status_accepted: "Принята водителем",
      mr_status_done: "Выполнена",
      mr_status_cancelled: "Отменена",
      mr_driver_assigned: "Водитель: {name}",
      mr_driver_car: "Авто: {brand}, {plate}",
      mr_contact_revealed: "Телефон водителя: {phone}",
      mr_contact_hidden: "Телефон появится, когда водитель примет заявку",
      mr_btn_cancel: "Отменить заявку",
      mr_cancelled_msg: "Заявка отменена.",
      mr_cancel_not_possible: "Эту заявку уже нельзя отменить.",
      mr_created_at: "Создана: {datetime}",
      mr_seats_n: "{n} мест",
      mr_price_negotiable: "Договорная",

      /* Driver feed */
      df_title: "Лента заявок",
      df_subtitle: "Открытые заявки в вашей зоне: {zone}",
      df_auto_refresh: "Автообновление каждые {sec} сек (демо).",
      df_manual_refresh: "Обновить",
      df_empty: "Открытых заявок сейчас нет.",
      df_direction_to_city: "→ Шымкент",
      df_direction_from_city: "Из Шымкента",
      df_when_asap: "Как можно скорее",
      df_seats: "Мест: {n}",
      df_passenger: "Пассажир: {name}",
      df_phone_hidden: "Телефон скрыт до принятия заявки",
      df_phone_revealed: "Телефон пассажира: {phone}",
      df_price: "Цена: {price}",
      df_tariff_suggested: "Рекомендуемый тариф: {price}",
      df_calc_line: "Расчёт: {km} км × {coef} коэфф. × {fuel} л/100км × {fuelPrice} ₸/л ≈ {cost} ₸ топливо",
      df_accept: "Принять заявку",
      df_accepted_msg: "Заявка принята! Вы увидите телефон пассажира.",
      df_already_taken: "Эту заявку уже принял другой водитель.",
      df_release: "Освободить",
      df_confirm_done: "Поездка выполнена",
      df_trip_done_msg: "Поездка отмечена как выполненная.",
      df_online_toggle: "Я на линии",
      df_online_on: "Онлайн — видите заявки",
      df_online_off: "Оффлайн — новые заявки скрыты",
      df_must_be_online: "Станьте «на линии», чтобы видеть ленту.",
      df_zone_label: "Моя зона",
      df_need_approved: "Ваш аккаунт водителя ещё не подтверждён администратором. Лента будет доступна после подтверждения.",

      /* Driver my trips */
      dt_title: "Мои поездки",
      dt_active: "Активные",
      dt_history: "История",
      dt_empty: "У вас пока нет принятых заявок.",
      dt_route: "{from} → {to}",
      dt_payment_note: "Оплата наличными напрямую пассажиру. Жайлау не является перевозчиком.",

      /* Admin */
      ad_title: "Панель администратора",
      ad_tab_drivers: "Водители",
      ad_tab_zones: "Зоны и сёла",
      ad_tab_tariffs: "Тарифы",
      ad_tab_settings: "Настройки",
      ad_drivers_pending: "На проверке",
      ad_drivers_all: "Все водители",
      ad_col_name: "Имя",
      ad_col_phone: "Телефон",
      ad_col_car: "Авто",
      ad_col_seats: "Места",
      ad_col_zone: "Зона",
      ad_col_status: "Статус",
      ad_col_actions: "Действия",
      ad_approve: "Одобрить",
      ad_reject: "Отклонить",
      ad_block: "Заблокировать",
      ad_unblock: "Разблокировать",
      ad_driver_approved: "Водитель одобрен.",
      ad_driver_rejected: "Водитель отклонён.",
      ad_driver_blocked: "Водитель заблокирован.",
      ad_driver_unblocked: "Водитель разблокирован.",
      ad_no_drivers: "Водителей с таким статусом нет.",
      ad_status_pending: "На проверке",
      ad_status_active: "Одобрен",
      ad_status_rejected: "Отклонён",
      ad_status_blocked: "Заблокирован",
      ad_zone_name_ru: "Название зоны (рус)",
      ad_zone_name_kz: "Название зоны (каз)",
      ad_add_zone: "Добавить зону",
      ad_village_name_ru: "Село (рус)",
      ad_village_name_kz: "Село (каз)",
      ad_village_lat: "Широта",
      ad_village_lng: "Долгота",
      ad_village_km: "До Шымкента по прямой, км",
      ad_add_village: "Добавить село",
      ad_zone_col_names: "Названия",
      ad_villages_of_zone: "Сёла зоны «{zone}»",
      ad_tariff_for: "Рекомендуемая цена из села",
      ad_tariff_price: "Тариф, ₸",
      ad_save_tariff: "Сохранить тариф",
      ad_tariff_saved: "Тариф сохранён.",
      ad_setting_fuel_price: "Цена топлива, ₸/л",
      ad_setting_road_coef: "Дорожный коэффициент",
      ad_setting_fuel_default: "Расход по умолчанию, л/100км",
      ad_settings_saved: "Настройки сохранены.",
      ad_err_num: "Введите корректное число",
      ad_added: "Добавлено.",

      /* Footer / legal */
      legal_disclaimer: "Платформа «Жайлау» не является перевозчиком. Оплата наличными между пассажиром и водителем."
    },

    kz: {
      /* Global */
      app_name: "Жайлау",
      app_tagline: "Ауыл мен қала — жолда бірге",
      brand_subtitle: "Жақын сапарлар",
      hero_eyebrow: "ШЫМКЕНТ · ТҮРКІСТАН ОБЛЫСЫНЫҢ АУЫЛДАРЫ",
      hero_title: "Бір-бірімізге жақын. Үйге жақын.",
      hero_description: "Сапарға өтінім қалдырыңыз — оны өз ауданыңыздың жүргізушісі көреді. Тікелей келісіп, қолма-қол төлеңіз.",
      hero_step_one: "Ауылды таңдаңыз",
      hero_step_two: "Сапарды сипаттаңыз",
      hero_step_three: "Жүргізушімен байланысыңыз",
      demo_choose_role: "Сайтты кім ретінде көру",
      home_eyebrow: "ҚАЛА МЕН АУЫЛ АРАСЫНДАҒЫ САПАРЛАР",
      home_ready: "Бүгін қайда барамыз?",
      home_lead: "Ауылыңызды таңдаңыз, желідегі жүргізушілерді көріңіз немесе бірнеше минутта өтінім жасаңыз.",
      home_step_one: "Бағытты таңдаңыз",
      home_step_two: "Уақыт пен орынды көрсетіңіз",
      home_step_three: "Жүргізушіні күтіңіз",
      home_how_title: "Қалай жұмыс істейді",
      terms_link: "Шарттар және құпиялылық",
      terms_title: "Шарттар және құпиялылық",
      terms_updated: "Демонстрацияға арналған жоба. Нақты адамдармен іске қосар алдында заңгер кеңесі қажет.",
      terms_service: "«Жайлау» жолаушылар мен жүргізушілерге бір-бірін табуға көмектеседі. Платформа тасымалдаушы емес және сапарларды орындамайды.",
      terms_payment: "Сапар ақысы жолаушы мен жүргізуші арасында қолма-қол төленеді. Бағаны өздері келіседі; платформа төлем қабылдамайды.",
      terms_data: "Жұмыс үшін аты, телефон нөмірі және таңдалған ауыл қажет. Өтінімде уақыт, мінетін орын, орын саны және пікір болуы мүмкін. Нөмірлер өтінім қабылданғаннан кейін ғана ашылады.",
      terms_warning: "Пікірге немесе мінетін орынға телефон нөмірін не жеке деректерді жазбаңыз: бұл өрістер өтінім қабылданғанға дейін аудан жүргізушілеріне көрінеді.",
      terms_demo: "Қазір сайт демонстрациялық режимде: деректер ойдан шығарылған және бетті жаңартқанда өшеді.",
      err_public_phone: "Ашық өрістен телефон нөмірін алып тастаңыз. Өтінім қабылданғаннан кейін ғана ашылады.",
      demo_badge: "ДЕМО РЕЖИМ",
      demo_banner_text: "Демонстрация деректері. Нағыз сапарлар әзірге жоқ.",
      city_shymkent: "Шымкент",
      currency: "₸",
      km: "км",
      yes: "Иә",
      no: "Жоқ",
      save: "Сақтау",
      cancel: "Болдырмау",
      close: "Жабу",
      loading: "Жүктелуде…",
      error_generic: "Бірдеңе дұрыс болмады. Қайталап көріңіз.",
      lang_switcher_aria: "Тілді ауыстыру",

      /* Nav */
      nav_home: "Басты",
      nav_new_request: "Жасау",
      nav_my_requests: "Өтініштерім",
      nav_feed: "Таспа",
      nav_driver_requests: "Сапарларым",
      nav_admin: "Әкімші",
      nav_logout: "Шығу",

      /* Auth */
      login_title: "Кіру",
      register_title: "Тіркелу",
      tab_login: "Кіру",
      tab_register: "Тіркелу",
      field_name: "Аты",
      field_phone: "Телефон",
      field_phone_hint: "Формат: +7 7XX XXX XX XX. Өтініш қабылданғанша нөміріңіз ешкімге көрінбейді.",
      field_plate: "Көлік нөмірі",
      field_password: "Құпиясөз",
      field_confirm_password: "Құпиясөзді қайталаңыз",
      field_role: "Сіз кімсіз?",
      role_passenger: "Жолаушы",
      role_driver: "Жүргізуші",
      role_admin: "Әкімші",
      btn_login: "Кіру",
      btn_register: "Аккаунт ашу",
      err_name_required: "Атыңызды енгізіңіз",
      err_phone_invalid: "Жарамды телефон нөмірін енгізіңіз",
      err_password_short: "Құпиясөз кемінде 6 таңба",
      err_passwords_mismatch: "Құпиясөздер сәйкес емес",
      err_login_failed: "Телефон немесе құпиясөз қате",
      err_phone_exists: "Бұл телефон тіркелген",
      auth_welcome: "Тегін. СМС жоқ. Артық дерек жоқ.",
      demo_accounts_hint: "Демо-аккаунттар (барлығының құпиясөзі: demo1234):",
      demo_acc_passenger: "жолаушы",
      demo_acc_driver: "жүргізуші",
      demo_acc_admin: "әкімші",
      quick_login: "Жылдам кіру:",

      /* Passenger home */
      ph_home_hello: "Сәлеметсіз бе, {name}!",
      ph_home_subtitle: "Ауылыңыз бен Шымкент арасында көлік табыңыз",
      ph_village_label: "Сіздің ауылыңыз",
      ph_online_drivers: "Осы ауылда желідегі жүргізушілер",
      ph_no_drivers: "Қазір бұл ауылда желіде жүргізуші жоқ.",
      ph_create_request_cta: "Сапар өтінішін жасау",
      ph_driver_card: "{brand} · {seats} орын",
      ph_driver_since: "{time} бері желіде",
      ph_privacy_note: "Телефон нөмірлері жасырын. Жүргізуші сіздің нөміріңізді тек өтінішті қабылдағаннан кейін ғана көреді — және керісінше.",

      /* New request */
      nr_title: "Жаңа өтініш",
      nr_subtitle: "Сапарды сипаттаңыз — ауданыңыздың жүргізушілері көреді",
      nr_direction: "Бағыт",
      nr_dir_to_city: "Ауыл → Шымкент",
      nr_dir_from_city: "Шымкент → Ауыл",
      nr_village: "Ауыл",
      nr_pickup: "Мінетін жер (міндетті емес)",
      nr_pickup_placeholder: "Мысалы: мешіт алды, орталық дүкен",
      nr_when: "Қашан",
      nr_when_asap: "Мүмкіндігінше тез",
      nr_when_scheduled: "Уақыт бойынша",
      nr_date: "Күні",
      nr_time: "Уақыты",
      nr_seats: "Орындар",
      nr_price_block: "Бағасы",
      nr_price_negotiable: "Келіссөзбен",
      nr_price_fixed: "Менің бағам",
      nr_price_suggested: "Бағдар: {price}",
      nr_comment: "Пікір (міндетті емес)",
      nr_comment_placeholder: "Жүк, балалар, үй құсы…",
      nr_submit: "Өтінішті жариялау",
      nr_created: "Өтініш жарияланды! Жүргізушілер таспада көреді.",
      err_village_required: "Ауылды таңдаңыз",
      err_seats_range: "1 ден 4 ке дейін орын",
      err_datetime_required: "Күн мен уақытты көрсетіңіз",
      err_price_invalid: "Нөлден жоғары баға немесе «Келіссөзбен» таңдаңыз",

      /* My requests (passenger) */
      mr_title: "Менің өтініштерім",
      mr_empty: "Әзірге өтініш жоқ. Біріншісін жасаңыз!",
      mr_status_open: "Ашық",
      mr_status_accepted: "Жүргізуші қабылдады",
      mr_status_done: "Орындалды",
      mr_status_cancelled: "Болдырылмады",
      mr_driver_assigned: "Жүргізуші: {name}",
      mr_driver_car: "Көлік: {brand}, {plate}",
      mr_contact_revealed: "Жүргізуші телефоны: {phone}",
      mr_contact_hidden: "Жүргізуші өтінішті қабылдағанда телефон көрінеді",
      mr_btn_cancel: "Өтінішті болдырмау",
      mr_cancelled_msg: "Өтініш болдырылмады.",
      mr_cancel_not_possible: "Бұл өтінішті енді болдырмауға болмайды.",
      mr_created_at: "Жасалған: {datetime}",
      mr_seats_n: "{n} орын",
      mr_price_negotiable: "Келіссөзбен",

      /* Driver feed */
      df_title: "Өтініштер таспасы",
      df_subtitle: "Сіздің аймағыңыздағы ашық өтініштер: {zone}",
      df_auto_refresh: "Әр {sec} секунд сайын жаңарту (демо).",
      df_manual_refresh: "Жаңарту",
      df_empty: "Қазір ашық өтініш жоқ.",
      df_direction_to_city: "→ Шымкент",
      df_direction_from_city: "Шымкенттен",
      df_when_asap: "Мүмкіндігінше тез",
      df_seats: "Орын: {n}",
      df_passenger: "Жолаушы: {name}",
      df_phone_hidden: "Телефон қабылдағанға дейін жасырын",
      df_phone_revealed: "Жолаушы телефоны: {phone}",
      df_price: "Бағасы: {price}",
      df_tariff_suggested: "Ұсынылатын тариф: {price}",
      df_calc_line: "Есеп: {km} км × {coef} коэф. × {fuel} л/100км × {fuelPrice} ₸/л ≈ {cost} ₸ отын",
      df_accept: "Өтінішті қабылдау",
      df_accepted_msg: "Өтініш қабылданды! Жолаушының телефонын көресіз.",
      df_already_taken: "Бұл өтінішті басқа жүргізуші қабылдады.",
      df_release: "Босату",
      df_confirm_done: "Сапар орындалды",
      df_trip_done_msg: "Сапар орындалған деп белгіленді.",
      df_online_toggle: "Мен желідемін",
      df_online_on: "Онлайн — өтініштер көрінеді",
      df_online_off: "Оффлайн — жаңа өтініштер жасырын",
      df_must_be_online: "Таспаны көру үшін «желіге» шығыңыз.",
      df_zone_label: "Менің аймағым",
      df_need_approved: "Жүргізуші аккаунтыңыз әлі әкімші тарапынан расталмаған. Таспа расталғаннан кейін қолжетімді болады.",

      /* Driver my trips */
      dt_title: "Менің сапарларым",
      dt_active: "Белсенді",
      dt_history: "Тарих",
      dt_empty: "Сізде әлі қабылданған өтініш жоқ.",
      dt_route: "{from} → {to}",
      dt_payment_note: "Төлем жолаушымен қолма-қол ақшаға. Жайлау тасымалдаушы емес.",

      /* Admin */
      ad_title: "Әкімші панелі",
      ad_tab_drivers: "Жүргізушілер",
      ad_tab_zones: "Аймақтар мен ауылдар",
      ad_tab_tariffs: "Тарифтер",
      ad_tab_settings: "Баптаулар",
      ad_drivers_pending: "Тексеруде",
      ad_drivers_all: "Барлық жүргізушілер",
      ad_col_name: "Аты",
      ad_col_phone: "Телефон",
      ad_col_car: "Көлік",
      ad_col_seats: "Орын",
      ad_col_zone: "Аймақ",
      ad_col_status: "Күйі",
      ad_col_actions: "Әрекеттер",
      ad_approve: "Растау",
      ad_reject: "Бас тарту",
      ad_block: "Бұғаттау",
      ad_unblock: "Бұғаттан шығару",
      ad_driver_approved: "Жүргізуші расталды.",
      ad_driver_rejected: "Жүргізушіге бас тартылды.",
      ad_driver_blocked: "Жүргізуші бұғатталды.",
      ad_driver_unblocked: "Жүргізуші бұғаттан шығарылды.",
      ad_no_drivers: "Мұндай күйде жүргізуші жоқ.",
      ad_status_pending: "Тексеруде",
      ad_status_active: "Расталған",
      ad_status_rejected: "Бас тартылған",
      ad_status_blocked: "Бұғатталған",
      ad_zone_name_ru: "Аймақ атауы (орыс)",
      ad_zone_name_kz: "Аймақ атауы (қазақ)",
      ad_add_zone: "Аймақ қосу",
      ad_village_name_ru: "Ауыл (орыс)",
      ad_village_name_kz: "Ауыл (қазақ)",
      ad_village_lat: "Ендік",
      ad_village_lng: "Ұзындық",
      ad_village_km: "Шымкентке түзу сызықпен, км",
      ad_add_village: "Ауыл қосу",
      ad_zone_col_names: "Атаулары",
      ad_villages_of_zone: "«{zone}» аймағының ауылдары",
      ad_tariff_for: "Ауылдан ұсынылатын баға",
      ad_tariff_price: "Тариф, ₸",
      ad_save_tariff: "Тарифті сақтау",
      ad_tariff_saved: "Тариф сақталды.",
      ad_setting_fuel_price: "Отын бағасы, ₸/л",
      ad_setting_road_coef: "Жол коэффициенті",
      ad_setting_fuel_default: "Әдепкі шығын, л/100км",
      ad_settings_saved: "Баптаулар сақталды.",
      ad_err_num: "Жарамды сан енгізіңіз",
      ad_added: "Қосылды.",

      /* Footer / legal */
      legal_disclaimer: "«Жайлау» платформасы тасымалдаушы емес. Төлем жолаушы мен жүргізуші арасында қолма-қол ақшаға."
    }
  };

  var currentLang = window.JAILAU_CONFIG.DEFAULT_LANG;

  DICT.ru.trip_waiting_passenger = "Поездку подтверждает пассажир";
  DICT.kz.trip_waiting_passenger = "Сапарды жолаушы растайды";
  DICT.ru.driver_online = "На линии";
  DICT.kz.driver_online = "Желіде";
  DICT.ru.road_coefficient_hint = "1,3 означает прибавку 30% к расстоянию по прямой; это приблизительная оценка.";
  DICT.kz.road_coefficient_hint = "1,3 түзу қашықтыққа 30% қосады; бұл шамамен алынған есеп.";
  DICT.ru.main_navigation = "Основная навигация";
  DICT.kz.main_navigation = "Негізгі навигация";
  DICT.ru.switch_language = "Сменить язык";
  DICT.kz.switch_language = "Тілді ауыстыру";

  function t(key, params) {
    var table = DICT[currentLang] || DICT.ru;
    var str = table[key];
    if (str === undefined) {
      str = DICT.ru[key];
      if (str === undefined) return key;
    }
    if (params) {
      Object.keys(params).forEach(function (p) {
        str = str.split("{" + p + "}").join(String(params[p]));
      });
    }
    return str;
  }

  function setLang(lang) {
    if (DICT[lang]) currentLang = lang;
    document.documentElement.lang = currentLang === "kz" ? "kk" : "ru";
    applyI18nAttributes(document);
    var toggleBtn = document.getElementById("lang-toggle");
    if (toggleBtn) toggleBtn.textContent = currentLang === "ru" ? "KZ" : "RU";
    // Notify router/screens to re-render with new language
    window.dispatchEvent(new CustomEvent("jailau:langchange", { detail: { lang: currentLang } }));
  }

  function getLang() { return currentLang; }

  function toggleLang() {
    setLang(currentLang === "ru" ? "kz" : "ru");
  }

  /** Translate all elements with data-i18n / data-i18n-placeholder within root */
  function applyI18nAttributes(root) {
    root = root || document;
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    root.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
    root.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
  }

  /** Pick localized name from an object like {ru: "...", kz: "..."} */
  function localizedName(obj) {
    if (!obj) return "";
    return obj[currentLang] || obj.ru || obj.kz || "";
  }

  window.I18N = {
    t: t,
    setLang: setLang,
    getLang: getLang,
    toggleLang: toggleLang,
    applyAttributes: applyI18nAttributes,
    localizedName: localizedName
  };
})();
