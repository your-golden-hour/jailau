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
      home_eyebrow: "ПОЕЗДКИ МЕЖДУ ГОРОДОМ И СЕЛОМ",
      home_ready: "Куда отправимся сегодня?",
      home_lead: "Выберите своё село, посмотрите водителей на линии или создайте заявку — это займёт пару минут.",
      home_step_one: "Выберите направление",
      home_step_two: "Укажите время и места",
      home_step_three: "Дождитесь водителя",
      home_how_title: "Как это работает",
      no_villages_yet: "Сёла пока не добавлены. Администратор проверит список и скоро откроет заявки.",
      terms_link: "Условия и конфиденциальность",
      terms_title: "Условия и конфиденциальность",
      terms_updated: "Черновик для демонстрации. Перед запуском с реальными людьми необходима юридическая консультация.",
      terms_service: "«Жайлау» помогает пассажирам и водителям находить друг друга. Платформа не является перевозчиком и не выполняет поездки.",
      terms_payment: "Оплата поездки — наличными между пассажиром и водителем. Цена согласуется ими напрямую; платформа не принимает платежи.",
      terms_data: "Для работы нужны имя, номер телефона и выбранное село. В заявке также могут быть время, место посадки, количество мест и комментарий. Номера участников открываются друг другу только после принятия заявки.",
      terms_warning: "Не пишите номер телефона или другие личные данные в комментарии и месте посадки: эти поля видны водителям района до принятия заявки.",
      err_public_phone: "Уберите номер телефона из открытого поля. Он появится у водителя после принятия заявки.",
      terms_unverified: "Без SMS мы не проверяем, кому принадлежит номер. Не используйте чужой номер: другой человек может занять ваш номер первым. Самостоятельного восстановления пароля по телефону пока нет.",
      err_config: "Подключение к базе не настроено. Проверьте только публичный URL и publishable key в конфигурации.",
      err_backend_unavailable: "Не удалось подключиться к базе. Демо-данные не включаются автоматически. Попробуйте позже.",
      err_phone_confirmation_required: "Регистрация по номеру пока недоступна: в настройках Supabase требуется подтверждение телефона.",
      profile_incomplete: "Аккаунт создан, но анкета не закончена. Заполните её, чтобы продолжить.",
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
      err_password_short: "Пароль минимум 8 символов",
      err_passwords_mismatch: "Пароли не совпадают",
      err_login_failed: "Неверный телефон или пароль",
      err_phone_exists: "Такой телефон уже зарегистрирован",
      auth_welcome: "Бесплатно. Без СМС. Без лишних данных.",
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
      home_eyebrow: "ҚАЛА МЕН АУЫЛ АРАСЫНДАҒЫ САПАРЛАР",
      home_ready: "Бүгін қайда барамыз?",
      home_lead: "Ауылыңызды таңдаңыз, желідегі жүргізушілерді көріңіз немесе бірнеше минутта өтінім жасаңыз.",
      home_step_one: "Бағытты таңдаңыз",
      home_step_two: "Уақыт пен орынды көрсетіңіз",
      home_step_three: "Жүргізушіні күтіңіз",
      home_how_title: "Қалай жұмыс істейді",
      no_villages_yet: "Ауылдар әлі қосылмаған. Әкімші тізімді тексеріп, өтінімдерді жақында ашады.",
      terms_link: "Шарттар және құпиялылық",
      terms_title: "Шарттар және құпиялылық",
      terms_updated: "Демонстрацияға арналған жоба. Нақты адамдармен іске қосар алдында заңгер кеңесі қажет.",
      terms_service: "«Жайлау» жолаушылар мен жүргізушілерге бір-бірін табуға көмектеседі. Платформа тасымалдаушы емес және сапарларды орындамайды.",
      terms_payment: "Сапар ақысы жолаушы мен жүргізуші арасында қолма-қол төленеді. Бағаны өздері келіседі; платформа төлем қабылдамайды.",
      terms_data: "Жұмыс үшін аты, телефон нөмірі және таңдалған ауыл қажет. Өтінімде уақыт, мінетін орын, орын саны және пікір болуы мүмкін. Нөмірлер өтінім қабылданғаннан кейін ғана ашылады.",
      terms_warning: "Пікірге немесе мінетін орынға телефон нөмірін не жеке деректерді жазбаңыз: бұл өрістер өтінім қабылданғанға дейін аудан жүргізушілеріне көрінеді.",
      err_public_phone: "Ашық өрістен телефон нөмірін алып тастаңыз. Өтінім қабылданғаннан кейін ғана ашылады.",
      terms_unverified: "SMS болмаса, нөмірдің иесін тексере алмаймыз. Өзгенің нөмірін қолданбаңыз: біреу сіздің нөміріңізді бірінші тіркей алады. Телефон арқылы құпиясөзді өз бетіңізше қалпына келтіру әзірге жоқ.",
      err_config: "Дерекқорға қосылу бапталмаған. Конфигурациядағы тек жария URL мен publishable key мәнін тексеріңіз.",
      err_backend_unavailable: "Дерекқорға қосылу мүмкін болмады. Демо деректер автоматты түрде қосылмайды. Кейінірек қайталаңыз.",
      err_phone_confirmation_required: "Нөмірмен тіркелу әзірге қолжетімсіз: Supabase баптауында телефонды растау қажет.",
      profile_incomplete: "Аккаунт жасалды, бірақ анкета аяқталмады. Жалғастыру үшін толтырыңыз.",
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
      err_password_short: "Құпиясөз кемінде 8 таңба",
      err_passwords_mismatch: "Құпиясөздер сәйкес емес",
      err_login_failed: "Телефон немесе құпиясөз қате",
      err_phone_exists: "Бұл телефон тіркелген",
      auth_welcome: "Тегін. СМС жоқ. Артық дерек жоқ.",
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

  Object.assign(DICT.ru, {
    field_email: "Электронная почта", auth_simple_title: "Поездки между Шымкентом и сёлами",
    auth_simple_subtitle: "Найдите попутную машину или пассажиров.", auth_or: "или",
    auth_google: "Google — скоро", email_check_note: "Мы пришлём ссылку для подтверждения. Пароль создадите после перехода по ней.",
    email_sent: "Проверьте почту и перейдите по ссылке. Затем создайте пароль и заполните профиль.",
    email_confirmation_required: "Сначала подтвердите почту.", google_unavailable: "Вход через Google пока не настроен.",
    profile_title: "Профиль", profile_finish: "Заполните профиль", profile_google: "Аккаунт Google",
    profile_email: "Вход по почте", profile_phone_note: "Номер нужен для связи после принятия заявки. Он не подтверждён SMS.",
    phone_confirm: "Вы правильно указали номер {phone}?", profile_save: "Сохранить",
    profile_saved: "Профиль сохранён", profile_password: "Пароль", profile_new_password: "Новый пароль",
    profile_create_password: "Придумайте пароль (от 8 символов)",
    profile_change_password: "Изменить пароль", profile_password_saved: "Пароль изменён",
    profile_support: "Поддержка", profile_feedback: "Оставить отзыв", profile_coming_soon: "Скоро появится",
    profile_driver_required: "Укажите зону, автомобиль и номер машины.", nav_profile: "Профиль",
    home_your_phone: "Ваш номер: {phone}", home_route_to_city: "Село → Шымкент",
    home_route_from_city: "Шымкент → село", home_request_short: "Создать заявку",
    df_no_seats: "На это время свободных мест уже нет.", trip_too_early: "Подтвердить поездку можно через час после принятия или начала.",
    trip_confirm_after: "Подтверждение доступно после {time}"
  });
  Object.assign(DICT.kz, {
    field_email: "Электрондық пошта", auth_simple_title: "Шымкент пен ауылдар арасындағы сапарлар",
    auth_simple_subtitle: "Көлік немесе жолаушы табыңыз.", auth_or: "немесе",
    auth_google: "Google — жақында", email_check_note: "Растау сілтемесін жібереміз. Құпиясөзді сілтемеге өткен соң қоясыз.",
    email_sent: "Поштаңызды тексеріп, сілтемеге өтіңіз. Содан кейін құпиясөз қойып, профильді толтырыңыз.",
    email_confirmation_required: "Алдымен поштаңызды растаңыз.", google_unavailable: "Google арқылы кіру әлі бапталмаған.",
    profile_title: "Профиль", profile_finish: "Профильді толтырыңыз", profile_google: "Google аккаунты",
    profile_email: "Пошта арқылы кіру", profile_phone_note: "Нөмір тапсырыс қабылданғаннан кейін байланысу үшін керек. Ол SMS арқылы расталмаған.",
    phone_confirm: "{phone} нөмірін дұрыс енгіздіңіз бе?", profile_save: "Сақтау",
    profile_saved: "Профиль сақталды", profile_password: "Құпиясөз", profile_new_password: "Жаңа құпиясөз",
    profile_create_password: "Құпиясөз ойлап табыңыз (кемінде 8 таңба)",
    profile_change_password: "Құпиясөзді өзгерту", profile_password_saved: "Құпиясөз өзгертілді",
    profile_support: "Қолдау", profile_feedback: "Пікір қалдыру", profile_coming_soon: "Жақында пайда болады",
    profile_driver_required: "Аймақты, көлікті және оның нөмірін көрсетіңіз.", nav_profile: "Профиль",
    home_your_phone: "Сіздің нөміріңіз: {phone}", home_route_to_city: "Ауыл → Шымкент",
    home_route_from_city: "Шымкент → ауыл", home_request_short: "Тапсырыс беру",
    df_no_seats: "Осы уақытта бос орын жоқ.", trip_too_early: "Сапарды қабылданғаннан немесе басталғаннан бір сағат өткен соң растауға болады.",
    trip_confirm_after: "Растау {time} кейін қолжетімді"
  });

  Object.assign(DICT.ru, {
    df_auto_refresh: "Обновляется каждые {sec} секунд",
    df_no_seats: "В салоне не хватает мест для этой заявки в выбранное время.",
    df_offer: "Предложить поездку", df_offered_msg: "Предложение отправлено пассажиру.",
    df_line_village: "Я в селе", df_line_city: "Я в Шымкенте",
    df_line_remaining: "На линии ещё {minutes} мин", df_line_expired: "10 минут прошли. Включите линию снова.",
    df_online_counts: "На линии в районе: село {village} · город {city}",
    df_upgrade_required: "Обновление базы данных ещё не применено. Линия и предложения пока недоступны.",
    line_location_required: "Выберите, где вы сейчас: в селе или в городе.",
    dt_offered: "Ждут ответа пассажира", dt_waiting_offer: "Телефон появится после согласия пассажира",
    mr_status_offered: "Водитель предложил поездку", mr_accept_offer: "Подтвердить поездку",
    mr_decline_offer: "Отказаться", mr_offer_accepted: "Поездка согласована. Теперь доступны контакты.",
    mr_offer_declined: "Предложение отклонено. Заявка снова открыта.",
    offer_not_available: "Предложение уже недоступно. Обновите заявки.",
    profile_driver_zone: "Мой район", profile_zone_reapproval: "При смене района линия выключится. Администратор должен одобрить новый район.",
    profile_request_zone: "Сменить район", profile_zone_confirm: "Сменить район на «{zone}»? Линия выключится, потребуется новое одобрение администратора.",
    profile_zone_pending: "Новый район ожидает одобрения администратора.",
    zone_not_found: "Такой район не найден. Обновите страницу.",
    ph_online_village: "Водители в селе", ph_online_city: "Водители в Шымкенте",
    beta_version: "Бета-версия {version}", driver_completed_trips: "Поездок: {n}",
    profile_name_required: "Укажите имя.", profile_no_changes: "Изменений нет.",
    profile_password_hidden: "будет установлен", profile_password_confirm: "Изменить пароль? После сохранения используйте новый пароль для входа.",
    profile_confirm_changes: "Сохранить изменения?\n\n{changes}\n\nОтмена вернёт вас к редактированию."
  });
  Object.assign(DICT.kz, {
    df_auto_refresh: "Әр {sec} секунд сайын жаңартылады",
    df_no_seats: "Осы уақытта бұл тапсырысқа көлікте орын жетпейді.",
    df_offer: "Сапар ұсыну", df_offered_msg: "Ұсыныс жолаушыға жіберілді.",
    df_line_village: "Мен ауылдамын", df_line_city: "Мен Шымкенттемін",
    df_line_remaining: "Желіде тағы {minutes} мин", df_line_expired: "10 минут өтті. Желіні қайта қосыңыз.",
    df_online_counts: "Ауданда желіде: ауыл {village} · қала {city}",
    df_upgrade_required: "Дерекқор жаңартуы әлі қолданылмады. Желі мен ұсыныстар әзірге қолжетімсіз.",
    line_location_required: "Қазір ауылдасыз ба, қаладасыз ба — таңдаңыз.",
    dt_offered: "Жолаушы жауабын күтуде", dt_waiting_offer: "Телефон жолаушы келіскен соң көрінеді",
    mr_status_offered: "Жүргізуші сапар ұсынды", mr_accept_offer: "Сапарды растау",
    mr_decline_offer: "Бас тарту", mr_offer_accepted: "Сапар келісілді. Енді байланыс деректері қолжетімді.",
    mr_offer_declined: "Ұсыныс қабылданбады. Өтініш қайта ашылды.",
    offer_not_available: "Ұсыныс қолжетімсіз. Өтініштерді жаңартыңыз.",
    profile_driver_zone: "Менің ауданым", profile_zone_reapproval: "Ауданды ауыстырсаңыз, желі өшеді. Жаңа ауданды әкімші мақұлдауы керек.",
    profile_request_zone: "Ауданды ауыстыру", profile_zone_confirm: "Ауданды «{zone}» деп өзгертесіз бе? Желі өшеді, әкімшінің қайта мақұлдауы қажет.",
    profile_zone_pending: "Жаңа аудан әкімшінің мақұлдауын күтуде.",
    zone_not_found: "Мұндай аудан табылмады. Бетті жаңартыңыз.",
    ph_online_village: "Ауылдағы жүргізушілер", ph_online_city: "Шымкенттегі жүргізушілер",
    beta_version: "Бета-нұсқа {version}", driver_completed_trips: "Сапар саны: {n}",
    profile_name_required: "Атыңызды енгізіңіз.", profile_no_changes: "Өзгеріс жоқ.",
    profile_password_hidden: "орнатылады", profile_password_confirm: "Құпиясөзді өзгертесіз бе? Сақтағаннан кейін кіру үшін жаңа құпиясөзді пайдаланыңыз.",
    profile_confirm_changes: "Өзгерістерді сақтайсыз ба?\n\n{changes}\n\nБас тартсаңыз, өңдеуге ораласыз."
  });

  DICT.ru.dt_completed_at = "Выполнена {time}";
  DICT.kz.dt_completed_at = "{time} орындалды";
  DICT.ru.trip_check_question = "Поездка состоялась?";
  DICT.kz.trip_check_question = "Сапар орындалды ма?";
  DICT.ru.trip_check_yes = "Да, состоялась";
  DICT.kz.trip_check_yes = "Иә, орындалды";
  DICT.ru.trip_check_no = "Нет, не состоялась";
  DICT.kz.trip_check_no = "Жоқ, орындалмады";
  DICT.ru.trip_check_no_note = "Заявка остаётся активной. Вы сможете подтвердить поездку позже.";
  DICT.kz.trip_check_no_note = "Өтініш белсенді күйде қалады. Сапарды кейінірек растай аласыз.";

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
