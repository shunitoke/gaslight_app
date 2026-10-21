import type { LocaleBundle } from '../types';

export const ruBundle: LocaleBundle = {
  locale: 'ru',
  displayName: 'Русский',
  messages: {
    appName: 'Переписки с бывшим®',
    appTagline: 'Что происходило в отношениях — по переписке.',
    hero_tagline: 'ИИ читает переписку и показывает, что в ней происходило.',
    hero_tagline_alt1: 'Паттерны, оценки и цитаты — по вашим сообщениям.',
    hero_tagline_alt2: 'Поведение, привязанность и конфликты — разобраны ИИ по полочкам.',
    hero_tagline_alt3: 'Полностью анонимно и конфиденциально.',
    hero_cta: 'Проанализировать переписку с ИИ',
    hero_copy: 'Загрузите экспорт чата: получите разбор паттернов с цитатами и оценками.',
    hero_confidential: 'Полностью конфиденциально.',
    footer_disclaimer: 'Не терапия и не сплетни — разбор вашей переписки.',
    footer_visitors_label: 'Уникальные посетители',
    footer_visitors_loading: 'Считаем посетителей...',
    footer_analyses_label: 'Проведено анализов',
    footer_analyses_loading: 'Считаем анализы...',
    footer_report_bug: 'Сообщить об ошибке',
    language_label: 'Язык',
    uploadExport: 'Загрузить переписку',
    uploadExportDescription: 'Разбираем многолетние переписки.',
    confirmImportPrompt: 'Импортировать файл «{file}»? Убедитесь, что в экспорте нет лишних данных.',
    uploadingFile: 'Загрузка файла...',
    importSuccessful: 'Импорт успешен',
    importFailed: 'Импорт не удался',
    analysisFailed: 'Анализ не удался',
    failedToStartAnalysis: 'Не удалось запустить анализ',
    failedToUploadFile: 'Не удалось загрузить файл в хранилище',
    errorOccurred: 'Произошла ошибка',
    analyzing: 'ИИ анализирует переписку...',
    progress_starting: 'Инициализация ИИ-анализа...',
    progress_parsing: 'Парсинг переписки...',
    progress_analyzing: 'ИИ анализирует паттерны переписки...',
    progress_media: 'ИИ анализирует медиа-контент...',
    progress_chunking: 'Обработка частей переписки...',
    progress_finalizing: 'ИИ собирает финальный отчёт...',
    progress_completed: 'ИИ-анализ завершен!',
    progress_error: 'ИИ-анализ не удался',
    progress_analyzing_hint: 'ИИ анализирует паттерны, стили общения и динамику отношений...',
    progress_media_hint: 'Анализ изображений, стикеров и медиа-контента с помощью ИИ-моделей зрения...',
    progress_finalizing_hint:
      'Собираем секции и графики. Обычно это меньше минуты.',
    progress_chunk_label: 'Часть {current} из {total}',
    progress_disclaimer: 'Пожалуйста, не закрывайте это окно во время анализа.',
    backToHome: 'Вернуться на главную',
    noAnalysisFound: 'Анализ не найден. Пожалуйста, сначала загрузите переписку.',
    noAnalysisFound_help:
      'Вернитесь на главную, загрузите экспорт и дождитесь конца анализа.',
    analysisReport: 'Отчет ИИ-анализа',
    gaslightingRisk: 'Риск газлайтинга',
    conflictIntensity: 'Интенсивность конфликтов',
    supportiveness: 'Поддерживающее поведение',
    apologyFrequency: 'Процент разрешённых конфликтов',
    evidence: 'Доказательства',
    scientificAnalysis: 'Научный анализ',
    plainLanguage: 'Простыми словами',
    score: 'Оценка',
    section_gaslighting: 'Риск газлайтинга',
    section_conflictIntensity: 'Интенсивность конфликтов',
    section_supportiveness: 'Поддерживающее поведение',
    section_apologyFrequency: 'Процент разрешённых конфликтов',
    section_redFlags: 'Красные флаги',
    section_conflict: 'Интенсивность конфликтов',
    section_support: 'Поддерживающее поведение',
    section_apology: 'Частота извинений',
    imported: 'Импортировано',
    messages: 'сообщений',
    privacyNote: 'Ваши данные обрабатываются временно и никогда не хранятся постоянно.',
    fileUploadHelp: 'Форматы: .json, .txt, .zip. Файлы до 25 МБ.',
    premium_badge: 'Премиум',
    free_badge: 'Бесплатно',
    premium_hint:
      'В премиуме: полный отчёт с цитатами, профилями участников, графиками и экспортом.',
    free_hint:
      'Бесплатно — только краткий обзор. Цитаты, разборы и экспорт — в премиуме.',
    premium_progress_hint:
      'Выполняется детальный анализ: обрабатываем текст и доступные медиа.',
    free_progress_hint:
      'Выполняется базовый анализ: сейчас только текст, медиа добавим чуть позже.',
    progress_premium_features_profiles: 'Анализ участников по сообщениям',
    progress_premium_features_replies: '',
    progress_premium_features_activity: 'Построение графика активности по дням',
    selectPlatform: 'Выберите платформу',
    platform_auto: 'Автоопределение',
    platform_telegram: 'Telegram',
    platform_whatsapp: 'WhatsApp',
    platform_signal: 'Signal',
    platform_discord: 'Discord',
    platform_messenger: 'Facebook Messenger',
    platform_imessage: 'iMessage',
    platform_viber: 'Viber',
    platform_generic: 'TXT / SMS / другая платформа',
    recommended: 'Рекомендуется',
    selectFile: 'Выберите файл',
    clickToSelectFile: 'Нажмите, чтобы выбрать файл',
    dragDropHint: 'Перетащите экспорт сюда или нажмите, чтобы выбрать файл.',
    ready: 'Готово',
    uploadAndAnalyze: 'Загрузить и проанализировать',
    inputMode_upload: 'Загрузить экспорт',
    inputMode_paste: 'Вставить текст',
    inputMode_media: 'Медиа / голос',
    upload_media_title: 'Загрузить изображение или аудио',
    upload_media_hint:
      'Поддерживаются изображения (png, jpg, jpeg, webp, gif) и аудио (mp3, wav, ogg, opus, m4a, webm). Макс 25 МБ.',
    choose_file: 'Выбрать файл',
    record_voice_title: 'Записать голосовое',
    record_voice_hint: 'До {{seconds}} секунд. Мы автоматически сделаем расшифровку.',
    start_recording: 'Начать запись',
    stop_recording: 'Стоп ({{seconds}}с)',
    recording: 'Идёт запись...',
    mic_permission_error: 'Нет доступа к микрофону. Разрешите доступ и попробуйте снова.',
    progress_media_voice: 'Анализируем голосовую запись...',
    voice_coming_soon: 'Голосовая расшифровка появится в следующей версии.',
    pasteLabel: 'Вставьте небольшой отрывок переписки',
    pastePlaceholder: 'Вставьте сюда сообщения (небольшой фрагмент, а не многолетнюю переписку)...',
    pasteHelp:
      'Лучше всего работает с небольшими фрагментами. Для длинных историй используйте экспорт чата.',
    analyzePasted: 'Проанализировать текст',
    paste_error_empty: 'Сначала вставьте текст переписки.',
    paste_error_too_long:
      'Слишком длинно. Вставьте фрагмент до 8000 символов.',
    paste_error_not_conversation:
      'Это не похоже на переписку. Вставьте фрагмент реального диалога.',
    error_invalid_format: 'Файл не того формата. Проверьте, что это экспорт выбранной платформы.',
    exportTXT: 'Экспорт TXT',
    exportJSON: 'Экспорт JSON',
    exportPDF: 'Экспорт PDF',
    exportReportTitle: 'Отчет анализа',
    exportGeneratedBy: 'Создано с помощью "Texts With my Ex" - AI Gaslight Detection App',
    exportDate: 'Дата',
    exportOverview: '🔍 Обзор',
    exportScores: '📊 Оценки',
    exportPatterns: '📌 Паттерны',
    exportEvidence: '🧾 Доказательства',
    analysisDefaultOverview: 'Анализ готов. Подробности — в разделах ниже.',
    analysisDefaultNoPatterns: 'Анализ готов. В этом фрагменте явных паттернов не нашлось.',
    analysisDefaultTitle: 'Анализ',
    analysisParseError: 'Анализ завершен с частичными результатами из-за ошибки парсинга.',
    analysisEmptySummary: 'Анализ готов. В этом разделе явных паттернов не нашлось.',
    analysisGenericWarningTitle: 'Похоже, ИИ вернул только общий текст без конкретных примеров.',
    analysisGenericWarningBody:
      'Пожалуйста, попробуйте запустить анализ ещё раз. Если проблема повторяется, разделите переписку на более короткие фрагменты.',
    showDetails: 'Показать детали',
    hideDetails: 'Скрыть детали',

    // Подсказки по экспорту чатов
    exportHelpTitle: 'Как экспортировать переписку',
    exportHelpTelegram:
      'Telegram (десктоп): откройте нужный чат → меню → «Экспорт истории чата» → выберите JSON или текст и загрузите полученный файл сюда.',
    exportHelpWhatsApp:
      'WhatsApp (телефон): откройте чат → меню → «Экспорт чата» → выберите Без медиа (быстрее) или С медиа, отправьте файл себе и загрузите его сюда.',
    exportHelpOther:
      'Для Signal, Discord, Facebook Messenger, iMessage/SMS или Viber экспортируйте чат в файл (текст/JSON или ZIP) через само приложение или надежный экспортёр, а затем загрузите этот файл.',

    // Как это работает
    howItWorks: 'Как это работает',
    step1_title: 'Загрузите переписку',
    step1_description: 'Экспортируйте вашу переписку из Telegram или WhatsApp и загрузите её здесь. Ваши данные обрабатываются безопасно и никогда не сохраняются.',
    step2_title: 'Анализ ИИ',
    step2_description: 'ИИ разбирает, как вы говорите друг с другом: где газлайтинг, где давление, как менялась динамика.',
    step3_title: 'Прочитайте отчёт',
    step3_description: 'Оценки по разделам и цитаты из переписки — видно, на чём основан каждый вывод.',
    howItWorks_subtitle: 'Три шага. Дальше — анализ.',
    recentAnalysesTitle: 'Последние анализы',
    recentAnalysesEmpty: 'История появится после того, как будет готов первый отчёт.',
    recentAnalysesClear: 'Очистить список',
    recentAnalysesRetention:
      'Хранится локально ~24 часа на этом устройстве. Можно очистить кнопкой или удалить cookies/localStorage.',
    recentAnalysesOverviewMissing: 'Анализ завершён, но краткое резюме пустое.',
    recentAnalysesClear_confirm:
      'Очистить список последних анализов на этом устройстве? Все локальные данные (localStorage/cookies) будут удалены, восстановить нельзя.',
    recentAnalyses_media: 'Загрузка медиа',
    recentAnalyses_voice: 'Голосовая заметка',
    recentAnalyses_paste: 'Вставленный текст',

    // Статьи
    articles_label: 'Статьи и гиды',
    articles_title: 'Гайды о газлайтинге, манипуляциях и восстановлении',
    articles_subtitle:
      'Гайды: как узнавать паттерны, выйти безопасно, пережить горе и не повторять сценарий.',
    articles_cta: 'Читать статью',
    articles_read_time_short: '5 мин чтения',
    articles_tag_awareness: 'Осознанность',
    articles_tag_howto: 'Инструкция',
    articles_tag_product: 'Как работает ИИ',
    articles_tag_practice: 'Практика',
    articles_tag_support: 'Поддержка',
    articles_gaslighting_title: 'Газлайтинг: типичные паттерны и что отвечать',
    articles_gaslighting_description:
      'Примеры искажений реальности, перекладывания вины и фраз, которые чаще всего замечает детектор.',
    articles_export_title: 'Как безопасно экспортировать переписку из Telegram и WhatsApp',
    articles_export_description:
      'Как выгрузить чат, какие форматы подходят и что лишнее лучше не отдавать.',
    articles_method_title: 'Как наш ИИ анализирует сообщения',
    articles_method_description:
      'Как считаются оценки, откуда берутся цитаты и почему переписки не хранятся.',
    articles_toxic_title: 'Как распознать токсичный сценарий отношений',
    articles_toxic_description:
      'Критика, контроль, изоляция, эмоциональные качели — по каким фразам это видно.',
    articles_steps_title: 'Практические шаги, пока отношения еще продолжаются',
    articles_steps_description:
      'Как опираться на факты, пробовать границы и собрать план безопасности.',
    articles_grief_title: 'Как прожить горе после трудных отношений',
    articles_grief_description:
      'Горе после токсичных отношений идёт не по стадиям. Что помогает вернуть опору.',
    articles_manipulation_title: 'Ключевые виды манипуляций в отношениях',
    articles_manipulation_description:
      'Шантаж, газлайтинг, изоляция, нарушенные границы — и как это замечать.',
    articles_covert_title: 'Скрытый нарциссизм: опасность под маской уязвимости',
    articles_covert_description:
      'Как тихая обида, позиция жертвы и «добро с условием» превращаются в контроль.',
    articles_letgo_title: 'Как отпустить травматическую привязку',
    articles_letgo_description:
      'Почему сложно уйти, как подготовиться и удерживать границы в период отмены контакта.',
    articles_consequences_title: 'Психологические последствия токсичных связей',
    articles_consequences_description:
      'Тревога, диссоциация, симптомы, похожие на ПТСР: почему восстановление требует времени.',
    articles_chances_title: 'Есть ли шанс у отношений?',
    articles_chances_description:
      'Когда изменения реальны, какие красные флаги закрывают вопрос и как решать без спешки.',
    articles_healthy_title: 'Здоровые отношения не идеальны (и это нормально)',
    articles_healthy_description:
      'Признаки отношений, которые работают, — без мифа о безупречной гармонии.',

    // Бейджи и превью в хиро-блоке
    hero_badge_patterns: 'Глубокий разбор паттернов',
    hero_badge_boundaries: 'Фокус на границах',
    hero_badge_multilang: 'Переписки на разных языках',
    hero_preview_title: 'ИИ‑скан переписки',
    hero_preview_subtitle: 'Пример того, какие фрагменты выделяет детектор (фиктивный чат).',
    hero_preview_live: 'Живой предпросмотр',
    hero_preview_flag_title: 'Обнаружен паттерн газлайтинга',
    hero_preview_flag_subtitle:
      'Искажение реальности · Обесценивание опыта · Перекладывание вины',
    hero_preview_score_label: 'Индекс эмоциональной безопасности',
    hero_preview_score_low: 'Низкий',
    emotional_safety_medium: 'Средний',
    emotional_safety_high: 'Высокий',
    relationship_health_title: 'Обзор здоровья отношений',
    relationship_health_summary: 'Общая динамика отношений',
    hero_preview_typing: 'ИИ ещё дочитывает…',

    // Чипы приватности
    privacy_chip_no_sharing: 'Ничего не публикуется',
    privacy_chip_local_session: 'Только в рамках этой сессии',
    privacy_chip_control: 'Контроль остаётся за вами',
    demo_metrics_banner:
      'Демо-метрики по скриншоту. Загрузите экспорт переписки для точных данных.',
    activity_wave_by_day: 'По дням',
    activity_wave_by_week: 'По неделям',

    // Примерные сообщения в превью-чате
    // left = более обесценивающая/отрицающая сторона в данном фрагменте, right = более уязвимая сторона
    hero_preview_msg1_left: 'Ты опять преувеличиваешь, всё было не так уж плохо.',
    hero_preview_msg1_right: 'Я помню это совсем по‑другому. Ты всегда всё перекручиваешь.',
    hero_preview_msg2_left: 'Если бы ты правда меня любила, ты бы не сомневалась столько.',
    hero_preview_msg2_right: 'Я просто хочу, чтобы мы честно поговорили о том, что произошло.',
    hero_preview_msg3_left: 'Я такого не говорил, ты снова всё выдумываешь.',
    hero_preview_msg3_right: 'У меня сохранены сообщения. Почему ты всегда всё отрицаешь?',
    hero_preview_msg4_left: 'Может, проблема в том, что ты слишком чувствительна?',
    hero_preview_msg4_right: 'Дело не в чувствительности, а в том, что ты сказал.',
    hero_preview_msg5_left: 'Все остальные считают, что со мной всё ок — только ты недовольна.',
    hero_preview_msg5_right: 'Я не хочу ссориться, я просто хочу понять.',

    // Короткий FAQ / зачем и кому
    faq_why:
      'Этот сервис помогает увидеть паттерны общения в ваших переписках — не чтобы назначить виноватых, а чтобы лучше понять, что происходило между вами.',
    faq_forWhom:
      'Он для людей, которые чувствуют путаницу в отношениях, подозревают манипуляции или газлайтинг, или просто хотят получить нейтральный взгляд со стороны на свой стиль общения.',
    faq_notSides:
      'Анализ не встает ни на чью сторону и не говорит, кто «прав» или «виноват» — он описывает паттерны и приводит примеры с обеих сторон.',
    faq_notTherapy:
      'Это не психотерапия, не диагноз и не юридическая консультация. Это один ИИ‑взгляд на ваши сообщения.',
    faq_goal:
      'Главная цель — поддержать рефлексию и взаимопонимание, а не спровоцировать новые конфликты или дать «оружие» для ссор.',
    help_tooltip_label: 'Помощь и информация о сервисе',
    help_tooltip_title: 'О сервисе',
    help_tooltip_close: 'Закрыть',
    report_disclaimer_main:
      'Этот отчет сгенерирован ИИ только на основе загруженных вами сообщений. Он может не видеть контекст и должен восприниматься как одна из точек зрения, а не окончательная истина.',
    report_disclaimer_safety:
      'Если ситуация связана с насилием, самоповреждением или вы чувствуете себя небезопасно, не полагайтесь только на это приложение — обратитесь к близким людям или за профессиональной помощью.',

    // График активности по дням
    activity_chart_title: 'Активность переписки по дням',
    activity_chart_description:
      'Показывает, в какие дни было больше сообщений. Частые пики могут совпадать с периодами напряжения.',
    activity_chart_messages_label: 'Сообщения',
    activity_chart_color_hint:
      'Красное ≈ дни с жёсткими конфликтами или манипуляциями.',

    // Рекомендуемые ответы (отключено)
    recommended_replies_toggle_show: '',
    recommended_replies_toggle_hide: '',
    recommended_replies_gaslighting_1: '',
    recommended_replies_gaslighting_2: '',
    recommended_replies_gaslighting_3: '',
    recommended_replies_conflict_1: '',
    recommended_replies_conflict_2: '',
    recommended_replies_conflict_3: '',
    recommended_replies_support_1: '',
    recommended_replies_support_2: '',
    recommended_replies_support_3: '',

    // Dashboard
    dashboard_title: 'Хронология',
    heatmap_title: 'Тепловая карта активности',
    heatmap_description:
      'Интенсивность переписки по неделям. Красным цветом выделены периоды с конфликтами или значимыми событиями.',
    heatmap_color_hint:
      'Зелёное ≈ ниже интенсивность, красное ≈ недели с жёсткими конфликтами или газлайтингом.',
    calendar_title: 'Календарь переписки',
    calendar_description:
      'Важные даты выделены красным цветом. Наведите курсор на дату для просмотра деталей.',
    important_dates_label: '🗓️ Важные даты',
    important_date: 'Важная дата',
    important_dates_list_title: 'Важные даты',
    message_intensity_label: 'Интенсивность сообщений',
    more_dates: 'других дат',
    verdict_problematic: 'Проблемные',
    participant_profiles_title: '👥 Профили участников',
    participant_profiles_description: 'Краткие профили общения для каждого участника.',
    reality_check_title: '✅ Проверка реальности',
    reality_check_right: 'В чём были правы',
    reality_check_wrong: 'В чём ошибались',
    reality_check_whose: 'Чьё восприятие было точным',
    hard_truth_title: '⚡ Неприятная правда',
    hard_truth_verdict: 'Вердикт',
    hard_truth_abusive: 'Абьюзивные поведения',
    hard_truth_abusive_label: 'Абьюзивные',
    hard_truth_toxic_label: 'Токсичные',
    hard_truth_needs_work_label: 'Требует работы',
    hard_truth_healthy_label: 'Здоровые',
    what_you_should_know_title: '💡 Что нужно знать',
    wysk_could_have_done: 'Что можно было сделать иначе',
    wysk_comm_tools: 'Инструменты общения',
    wysk_could_be_saved: 'Можно ли было спасти отношения',
    wysk_why_not_fault: 'Почему это не целиком ваша вина',
    wysk_what_made_vulnerable: 'Что сделало уязвимым',
    wysk_patterns_to_watch: 'Паттерны, на которые стоит смотреть',
    wysk_resources: 'Ресурсы',
    wysk_red_flags_next: 'Красные флаги на будущее',
    whats_next_kicker: 'План действий',
    whats_next_title: 'Что дальше?',
    whats_next_subtitle: 'Практические шаги по итогам анализа.',
    whats_next_actions: 'Шаги',
    whats_next_boundaries: 'Границы',
    whats_next_support: 'Поддержка и ресурсы',

    // Отзывы (фиктивные)
    testimonials_label: 'ИСТОРИИ ЛЮДЕЙ, КОТОРЫМ СТАЛО ЯСНЕЕ',
    testimonials_title: 'Те, кому этот сервис помог разобраться в переписках',
    testimonial_anna_name: '«Аня», 28 лет',
    testimonial_anna_role: 'После долгих отношений',
    testimonial_anna_quote:
      'У меня были скриншоты и мнения друзей, но только здесь я впервые увидела всю переписку спокойно и целиком. Перестала зацикливаться на одном скандале и увидела общий паттерн.',
    testimonial_marco_name: '«Марк», 34 года',
    testimonial_marco_role: 'В новых отношениях',
    testimonial_marco_quote:
      'Я использовал сервис не чтобы что‑то доказать партнёрше, а чтобы посмотреть на свои реакции. Отчет показал, где я сам разгоняю конфликт или закрываюсь — неприятно, но полезно.',
    testimonial_lea_name: '«Лена», 31 год',
    testimonial_lea_role: 'Сомневалась, был ли газлайтинг',
    testimonial_lea_quote:
      'Боялась, что меня или бывшего тут «осудят». В итоге это оказалось как нейтральное зеркало. Сервис не сказал, что делать, но дал слова, чтобы описать, что я чувствовала.',
    testimonial_sara_name: '«Сара», 29 лет',
    testimonial_sara_role: 'После токсичных отношений',
    testimonial_sara_quote:
      'Наконец-то у меня было доказательство, что я не сошла с ума. Паттерны были очевидны — постоянные противоречия, перекладывание вины. Это дало мне уверенность двигаться дальше.',
    testimonial_david_name: '«Давид», 35 лет',
    testimonial_david_role: 'Хотел стать лучше',
    testimonial_david_quote:
      'Я хотел понять, почему мои отношения постоянно рушились. Анализ показал мои паттерны общения — защитная позиция, пренебрежение. Неприятно слышать, но необходимо.',
    testimonial_yuki_name: '«Юки», 27 лет',
    testimonial_yuki_role: 'Дальние отношения',
    testimonial_yuki_quote:
      'Мы постоянно ссорились в переписке. Это помогло мне увидеть, что большинство конфликтов начинались с недопонимания, а не со зла. Нам обоим нужно было лучше общаться.',
    testimonial_sofia_name: '«София», 32 года',
    testimonial_sofia_role: 'Ясность после развода',
    testimonial_sofia_quote:
      'Мне нужна была ясность. Читать годы переписки было слишком, но ИИ-анализ выделил ключевые паттерны. Дело было не в вине — дело было в понимании.',
    testimonial_mia_name: '«Миа», 26 лет',
    testimonial_mia_role: 'После месяцев переживаний о расставании',
    testimonial_mia_quote:
      'Я постоянно переписывала историю в голове. Лента с пиками сделала всё менее драматичным и более фактологичным. Я наконец смогла закрыть вкладку и уснуть.',
    testimonial_lucas_name: '«Лукас», 29 лет',
    testimonial_lucas_role: 'Взял отчёт на терапию',
    testimonial_lucas_quote:
      'Терапевт просил конкретику. В отчёте видно, как я каждый раз уходил в сарказм. Неловко, но это ускорило сессию.',
    testimonial_priya_name: '«Прия», 33 года',
    testimonial_priya_role: 'Сообщения о совместном родительстве',
    testimonial_priya_quote:
      'У нас общий малыш, эмоции вспыхивают. Сервис подсветил, где проскальзывает обвинение. Это помогло договориться о более спокойных фразах перед встречами.',
    testimonial_noah_name: '«Ноа», 31 год',
    testimonial_noah_role: 'Заметил свою защиту',
    testimonial_noah_quote:
      'Я повторял «я лишь уточняю», но паттерн — я перебиваю и уменьшаю. Теперь тренируюсь отвечать по очереди.',
    testimonial_amira_name: '«Амира», 30 лет',
    testimonial_amira_role: 'Недопонимания на расстоянии',
    testimonial_amira_quote:
      'Мы постоянно промахивались с тоном. Непрерывная лента показала: тишина чаще от стресса, а не от злобы. Паники стало меньше.',
    testimonial_elena_name: '«Елена», 34 года',
    testimonial_elena_role: 'Разобрать годы голосовых',
    testimonial_elena_quote:
      'Боялась переслушивать часы аудио. В виде расшифровок по порядку стало видно паттерны, без повторного проживания.',
    testimonial_tom_name: '«Том», 30 лет',
    testimonial_tom_role: 'Разобрать цикл конфликтов',
    testimonial_tom_quote:
      'Я думал, что «просто логичен». Отчёт показал цикл: сарказм → защита → стена. Назвать его помогло его разорвать.',
    testimonial_zahra_name: '«Зара», 28 лет',
    testimonial_zahra_role: 'Ссоры из-за визы',
    testimonial_zahra_quote:
      'Мы выгорели от документов. Таймлайн показал: каждый всплеск был после писем из консульства. Стало легче сказать «давай паузу» в следующий раз.',
    testimonial_pedro_name: '«Педро», 37 лет',
    testimonial_pedro_role: 'Возвращая доверие',
    testimonial_pedro_quote:
      'Хотел доказательств, что меняюсь. Видеть, как месяц за месяцем меньше перекладывания вины, — впервые почувствовал прогресс.',
    testimonial_lina_name: '«Лина», 25 лет',
    testimonial_lina_role: 'Первый серьёзный разрыв',
    testimonial_lina_quote:
      'Ночами перечитывала старые чаты. Краткое резюме дало закрытие быстрее, чем листать всё.',
    testimonial_chen_name: '«Чэнь», 33 года',
    testimonial_chen_role: 'Рабочий тон дома',
    testimonial_chen_quote:
      'Партнёр говорил, что я приношу офисный тон. Анализ показал, как часто я отвечал «потом». Мелочь, но накапливается.',
    testimonial_jasmine_name: '«Жасмин», 29 лет',
    testimonial_jasmine_role: 'Переезд вдвоём',
    testimonial_jasmine_quote:
      'Каждая ссора совпадала со стрессом переезда. На графике стало проще сказать «мы перегружены, не враги».',
    testimonial_omar_name: '«Омар», 36 лет',
    testimonial_omar_role: 'Ночные переживания',
    testimonial_omar_quote:
      'Я открывал старые чаты в два ночи. Краткое резюме дало то закрытие, которого не давал скролл.',
    testimonial_julia_name: '«Юля», 27 лет',
    testimonial_julia_role: 'Замечая лавли-бомбинг',
    testimonial_julia_quote:
      'Паттерн «большие обещания — исчезновения» сразу бросался в глаза. Это было не в моей голове.',
    testimonial_mateo_name: '«Матео», 31 год',
    testimonial_mateo_role: 'Учусь извиняться',
    testimonial_mateo_quote:
      'Думал, «жаль, что ты так чувствуешь» — норм. Отмеченные моменты заставили практиковать настоящие извинения.',

    // Условия использования (с учетом российского законодательства)
    terms_title: 'Условия использования',
    privacy_title: 'Политика конфиденциальности',
    refund_title: 'Политика возвратов',
    pricing_title: 'Цены',
    paddle_buy_label: 'Купить 10 анализов',
    paddle_status_loading: 'Загружаем оплату…',
    paddle_status_verifying: 'Проверяем оплату…',
    paddle_status_opening: 'Открываем защищённый чек-аут…',
    paddle_status_unlocked: 'Пакет разблокирован!',
    paddle_error_missing_token: 'Не хватает клиентского токена Paddle',
    paddle_error_token_missing: 'В ответе нет токена',
    paddle_error_unlock: 'Не удалось разблокировать премиум',
    paddle_error_not_ready: 'Paddle ещё не готов',
    paddle_error_start: 'Не удалось начать оплату',
    paddle_error_txn_missing: 'Нет ID транзакции',
    duplicate_analysis_warning:
      'Вы анализируете ту же переписку снова. Результат, скорее всего, будет таким же. Продолжить?',
    terms_intro:
      'Настоящие Условия использования ("Условия") регулируют использование вами веб-приложения "Переписки с бывшим" ("Сервис"). Получая доступ к Сервису или используя его, вы соглашаетесь соблюдать эти Условия.',
    terms_operator_title: 'Оператор и юридическое наименование',
    terms_operator_content:
      'Юридическое наименование: Texts with My Ex. Контактный email: spinnermining@gmail.com.',
    terms_section1_title: '1. Описание сервиса',
    terms_section1_content:
      'Переписки с бывшим — это анонимный инструмент анализа на основе ИИ, который позволяет загружать экспорты чатов (например, из Telegram или WhatsApp) и получать автоматизированный отчет о паттернах общения. Это не психотерапия, не юридическая консультация и не служба кризисной поддержки.',
    terms_section2_title: '2. Право на использование',
    terms_section2_content:
      'Вы можете использовать Сервис только если вам исполнилось 18 лет и вы имеете законное право заключать данные Условия. Вы несете ответственность за обеспечение того, что у вас есть право загружать и обрабатывать переписки, которые вы отправляете в Сервис.',
    terms_section3_title: '3. Обработка данных и конфиденциальность',
    terms_section3_content:
      'Мы принимаем переписки по HTTPS, но для работы ИИ они расшифровываются на сервере, поэтому сквозного шифрования пока нет. Доступ к данным ограничен служебными процессами и подрядчиками моделей. Хранение короткое: прогресс задач держится до ~2 часов, кэш отчёта — до ~24 часов, временные файлы удаляются при очистке. Локальная история последних анализов (id + краткий обзор) хранится на вашем устройстве до ~24 часов в localStorage/куках и очищается кнопкой или удалением localStorage/cookies. Данные не используются для обучения сторонних моделей. Конфиденциальность соблюдаем по 152‑ФЗ; детали — в политике конфиденциальности.',
    terms_section4_title: '4. Платежи и подписки',
    terms_section4_content:
      'Некоторые функции могут предлагаться на платной основе (например, премиум-анализ или анализ медиа). Платежи обрабатываются через нашу платежную систему. Цены, интервалы выставления счетов и правила возврата средств указаны при оформлении заказа и могут время от времени обновляться.',
    terms_section5_title: '5. Отсутствие гарантий',
    terms_section5_content:
      'Анализ генерируется большими языковыми моделями и может быть неполным, неточным или отражать присущие этим моделям предвзятости. Мы не гарантируем точность, полноту или пригодность любого анализа для вашей конкретной ситуации.',
    terms_section6_title: '6. Запрещенное использование',
    terms_section6_content:
      'Вы соглашаетесь не использовать Сервис в незаконных целях, не нарушать права других лиц и не загружать контент, который нарушает интеллектуальную собственность, конфиденциальность или другие права третьих лиц.',
    terms_section7_title: '7. Ограничение ответственности',
    terms_section7_content:
      'В максимальной степени, разрешенной законом, "Переписки с бывшим" и его операторы не несут ответственности за любые косвенные, случайные, особые, последующие или штрафные ущербы, возникающие в связи с использованием вами Сервиса или связанные с ним.',
    terms_section8_title: '8. Изменения в Условиях',
    terms_section8_content:
      'Мы можем время от времени обновлять эти Условия. Дата "последнего обновления" в верхней части этой страницы укажет, когда изменения вступят в силу. Ваше дальнейшее использование Сервиса после любых изменений означает, что вы принимаете обновленные Условия.',
    terms_section9_title: '9. Контакты',
    terms_section9_content:
      'Если у вас есть вопросы об этих Условиях или Сервисе, свяжитесь с нами по адресу spinnermining@gmail.com.',
    legal_label: 'Правовая информация',
    legal_last_updated: 'Последнее обновление:',
    privacy_intro:
      'Texts with My Ex создан для краткосрочного анонимного анализа. Мы обрабатываем только данные, которые вы загружаете, чтобы выдать отчёт, и быстро их удаляем. Мы не создаём учетных записей.',
    privacy_collect_title: 'Что мы собираем',
    privacy_collect_item1: 'Экспорты переписок и необязательные медиа, которые вы загружаете для анализа.',
    privacy_collect_item2: 'Метаданные прогресса (например, статус задачи), которые временно хранятся для завершения отчёта.',
    privacy_collect_item3: 'Базовая аналитика и сигналы для ограничения частоты (IP, user agent), чтобы держать сервис стабильным.',
    privacy_use_title: 'Как мы используем данные',
    privacy_use_item1: 'Чтобы запустить ИИ-анализ и сформировать ваш отчёт.',
    privacy_use_item2: 'Чтобы устранять ошибки и защищаться от злоупотреблений.',
    privacy_use_item3: 'Никогда не для обучения сторонних моделей или создания рекламных профилей.',
    privacy_retention_title: 'Хранение',
    privacy_retention_text:
      'Задачи анализа и кешированные данные живут недолго (обычно менее 24 часов) и удаляются автоматически при очистке. Загруженные файлы в blob-хранилище регулярно очищаются. Мы не храним долгосрочную копию ваших переписок.',
    privacy_payment_title: 'Платёжные данные',
    privacy_payment_text:
      'Платежи обрабатывает Paddle. Мы не храним данные карты. Paddle может собирать сигналы биллинга и antifraud согласно своей политике конфиденциальности.',
    privacy_choices_title: 'Ваш выбор',
    privacy_choices_item1: 'Вы можете удалить данные, закрыв страницу; сохранённые артефакты истекают автоматически.',
    privacy_choices_item2: 'Не загружайте контент, который вы не имеете права передавать.',
    privacy_choices_item3: 'Используйте приватный режим браузера, если не хотите локального хранения токенов.',
    privacy_contact_title: 'Контакты',
    privacy_contact_text_prefix: 'Вопросы по приватности? Напишите на',
    privacy_contact_text_suffix: '.',
    refund_intro:
      'Возвраты обрабатываются Paddle (наш merchant of record). Вы можете запросить возврат в течение 14 дней с момента покупки.',
    refund_no_refunds_title: 'Срок возврата',
    refund_no_refunds_item1: 'Запрос на возврат нужно отправить в течение 14 дней с момента покупки.',
    refund_no_refunds_item2: 'Возвраты обрабатываются Paddle.',
    refund_no_refunds_item3: 'При обращении укажите ID транзакции Paddle.',
    refund_issue_title: 'Нужна помощь?',
    refund_issue_item1: 'Если возникла проблема с доступом или доставкой, обратитесь в поддержку Paddle.',
    refund_issue_item2: 'Paddle может попросить ID транзакции и детали покупки.',
    refund_issue_item3: 'Если Paddle запросит дополнительную информацию о продукте, вы также можете написать нам: spinnermining@gmail.com.',
    refund_contact_title: 'Как запросить возврат',
    refund_contact_text_prefix: 'Отправьте запрос на возврат через',
    refund_contact_text_suffix: 'и укажите ID транзакции Paddle.',
    pricing_badge_text: 'Разовые пакеты',
    pricing_description:
      'Запустите бесплатный предпросмотр, чтобы увидеть оценки и обзор. Затем разблокируйте полный отчёт разовой оплатой через Paddle.',
    pricing_overlay_title: 'Сейчас бесплатно',
    pricing_overlay_description:
      'Тарифы временно скрыты и весь доступ открыт бесплатно. Загляните позже за обновлением.',
    pricing_overlay_cta: 'На главную',
    pricing_free_label: 'Предпросмотр',
    pricing_free_price_label: 'Бесплатно',
    pricing_free_badge: 'Начните здесь',
    pricing_free_description:
      'Посмотрите основные оценки и краткий обзор до оплаты. Подходит для быстрого чека.',
    pricing_free_item1: 'Загрузите и обработайте переписку',
    pricing_free_item2: 'Увидьте ключевые оценки и короткий обзор',
    pricing_free_item3: 'Базовая лента активности',
    pricing_free_cta: 'Запустить бесплатный предпросмотр',
    pricing_premium_label: 'Пакет 5 отчётов (любой размер переписки)',
    pricing_price_unit: 'разово',
    pricing_premium_description:
      'Включает 5 полных отчётов на этом устройстве. Без подписки. Без регулярных списаний.',
    pricing_premium_item1: 'Полный разбор доказательств и паттернов',
    pricing_premium_item2: 'Профили участников, разбор по разделам и итог',
    pricing_premium_item3: 'Экспорт в TXT / JSON / PDF',
    pricing_premium_item4: 'Включено 5 полных отчётов',
    pricing_premium_cta: 'Купить 5 отчётов',
    pricing_any_chat_size_badge: 'Любой размер переписки',
    pricing_media_label: 'Медиа-тариф (в следующей версии)',
    pricing_media_badge: 'Скоро',
    pricing_media_description:
      'Планируется: анализ фото/голосовых + 10 отчётов. Пока недоступно.',
    pricing_media_item1: 'Включено 10 полных отчётов',
    pricing_media_item2: 'Медиа-анализ (изображения/аудио) в отчёте',
    pricing_media_item3: 'Лучше всего для Telegram экспортa с фото/голосовыми',
    pricing_media_item4: 'Ранний доступ сразу после выхода обновления',
    pricing_media_cta: 'В следующей версии',
    pricing_media_note:
      'Этот тариф пока нельзя купить. Мы включим оплату после релиза медиа-обновления.',
    pricing_checkout_note:
      'Оплата проходит через Paddle. Итоговая цена и валюта подтверждаются перед платежом.',
    pricing_what_you_get_title: 'Что вы получаете',
    pricing_what_evidence_title: 'Полные доказательства',
    pricing_what_evidence_text:
      'Конкретные фрагменты переписки, объяснения паттернов и графики ежедневной активности.',
    pricing_what_exports_title: 'Экспорты',
    pricing_what_exports_text:
      'Скачайте отчёт в TXT, JSON или PDF для офлайн-использования и обмена.',
    pricing_what_onetime_title: 'Доступ навсегда',
    pricing_what_onetime_text:
      'Без подписки. Покупка открывает пакет полных отчётов на этом устройстве.',
    pricing_help_text_prefix: 'Нужна помощь с оплатой? Пишите на',
    pricing_help_text_suffix: '.',
    donation_beta_label: 'Бета',
    donation_title: 'Поддержать разработчика',
    donation_text: 'Если этот отчёт помог, буду благодарен за небольшой донат. Спасибо за поддержку!',
    donation_crypto_only: 'Только крипто',
    donation_show_qr: 'Показать QR',
    donation_qr_for_wallet: 'QR для кошелька',
    donation_close: 'Закрыть',
    pdf_safety_concern_title: '🛟 Проблема безопасности',
    pdf_safety_concern_intro: 'Что выходит за рамки токсичного:',
    pdf_safety_resources: 'Ресурсы',
    pdf_closure_title: '🎯 Завершение',
    pdf_closure_right: 'В чём был прав(а)',
    pdf_closure_deserved: 'Что было заслужено',
    pdf_closure_got: 'Что было получено',
    pdf_closure_permission: 'Разрешение двигаться дальше',
    pdf_closure_end: 'Финальное утверждение',
    install_app: 'Установить приложение',
    install_app_instructions: 'Чтобы установить это приложение:',
    install_app_chrome: 'Chrome/Edge: Нажмите на иконку установки в адресной строке или перейдите в Меню → Установить приложение',
    install_app_safari: 'Safari (iOS): Нажмите Поделиться → Добавить на главный экран',
    install_app_firefox: 'Firefox: Пока не поддерживается'
  }
};

