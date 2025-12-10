import type { LocaleBundle } from '../types';

export const esBundle: LocaleBundle = {
  locale: 'es',
  displayName: 'Español',
  messages: {
    appName: 'Textos con mi ex®',
    appTagline: 'Una mirada honesta a lo que pasó.',
    hero_tagline: 'Una mirada honesta de IA a lo que pasó.',
    hero_tagline_alt1: 'Debajo del capó: IA y ciencia, no drama.',
    hero_tagline_alt2: 'Conducta, apego y conflicto — analizados por IA para ti.',
    hero_tagline_alt3: 'Totalmente anónimo y confidencial.',
    hero_cta: 'Analizar conversación con IA',
    hero_copy: 'Sube tus chats para obtener un análisis imparcial de relaciones impulsado por IA.',
    hero_confidential: 'Totalmente confidencial.',
    footer_disclaimer: 'No es terapia, no es chisme — solo claridad IA.',
    footer_visitors_label: 'Visitantes únicos',
    footer_visitors_loading: 'Contando visitantes...',
    footer_analyses_label: 'Análisis completados',
    footer_analyses_loading: 'Contando análisis...',
    footer_report_bug: 'Reportar un bug',
    language_label: 'Idioma',
    uploadExport: 'Subir exportación de chat',
    uploadExportDescription: 'Seleccione su archivo de exportación de chat para comenzar el análisis',
    confirmImportPrompt:
      '¿Importar “{file}”? Asegúrate de que la exportación solo contenga la conversación que quieres analizar.',
    uploadingFile: 'Subiendo archivo...',
    importSuccessful: 'Importación exitosa',
    importFailed: 'Importación fallida',
    analysisFailed: 'Análisis fallido',
    failedToStartAnalysis: 'Error al iniciar el análisis',
    failedToUploadFile: 'Error al subir el archivo al almacenamiento',
    errorOccurred: 'Ocurrió un error',
    analyzing: 'IA analizando conversación...',
    progress_starting: 'Inicializando análisis IA...',
    progress_parsing: 'Analizando conversación...',
    progress_analyzing: 'IA analizando patrones de conversación...',
    progress_media: 'IA analizando contenido multimedia...',
    progress_chunking: 'Procesando segmentos de conversación...',
    progress_finalizing: 'La IA está cerrando el informe final...',
    progress_completed: '¡Análisis IA completado!',
    progress_error: 'Análisis IA fallido',
    progress_analyzing_hint: 'La IA está analizando patrones, estilos de comunicación y dinámicas relacionales...',
    progress_media_hint: 'Analizando imágenes, stickers y contenido multimedia con modelos de visión IA...',
    progress_finalizing_hint:
      'Estamos uniendo secciones, gráficos y respuestas recomendadas. Este último paso puede tardar hasta un minuto — gracias por esperar.',
    progress_chunk_label: 'Segmento {current} de {total}',
    progress_disclaimer: 'Por favor, no cierre esta ventana mientras el análisis está en progreso.',
    backToHome: 'Volver al inicio',
    noAnalysisFound: 'No se encontró análisis. Por favor, sube una conversación primero.',
    noAnalysisFound_help:
      'Vuelve a la página de inicio, sube una exportación del chat y espera a que termine el análisis para ver tu informe.',
    analysisReport: 'Informe de análisis IA',
    gaslightingRisk: 'Riesgo de manipulación',
    conflictIntensity: 'Intensidad del conflicto',
    supportiveness: 'Comportamiento de apoyo',
    apologyFrequency: 'Tasa de resolución de conflictos',
    evidence: 'Evidencia',
    scientificAnalysis: 'Análisis científico',
    plainLanguage: 'En términos simples',
    score: 'Puntuación',
    section_gaslighting: 'Riesgo de manipulación',
    section_conflictIntensity: 'Intensidad del conflicto',
    section_supportiveness: 'Comportamiento de apoyo',
    section_apologyFrequency: 'Tasa de resolución de conflictos',
    section_redFlags: 'Señales de alerta',
    section_conflict: 'Intensidad del conflicto',
    section_support: 'Comportamiento de apoyo',
    section_apology: 'Frecuencia de disculpas',
    imported: 'Importado',
    messages: 'mensajes',
    privacyNote: 'Tus datos se procesan de forma efímera y nunca se almacenan permanentemente.',
    fileUploadHelp: 'Formatos: .json, .txt, .zip. Archivos hasta 25 MB.',
    premium_badge: 'Premium',
    free_badge: 'Gratis',
    premium_hint:
      'Análisis premium: informe completo con insights detallados, ejemplos de evidencia y exportaciones.',
    free_hint:
      'Vista previa gratuita: solo resumen. Desbloquea el informe completo, evidencia y exportaciones.',
    premium_progress_hint:
      'Ejecutando análisis premium: prompts más profundos, procesamiento de medios, generación de perfiles de participantes y respuestas recomendadas.',
    free_progress_hint:
      'Ejecutando análisis gratuito: visión general solo de texto. Pasa a premium para medios, perfiles de participantes, respuestas recomendadas y gráficos de actividad.',
    progress_premium_features_profiles: 'Generación de perfiles psicológicos de participantes',
    progress_premium_features_replies: 'Creación de ejemplos de respuestas saludables',
    progress_premium_features_activity: 'Construcción del gráfico de actividad diaria',
    selectPlatform: 'Seleccionar plataforma',
    platform_auto: 'Detección automática',
    platform_telegram: 'Telegram',
    platform_whatsapp: 'WhatsApp',
    platform_signal: 'Signal',
    platform_discord: 'Discord',
    platform_messenger: 'Facebook Messenger',
    platform_imessage: 'iMessage',
    platform_viber: 'Viber',
    platform_generic: 'TXT / SMS / otra plataforma',
    recommended: 'Recomendado',
    selectFile: 'Seleccionar archivo',
    clickToSelectFile: 'Haz clic para seleccionar archivo',
    dragDropHint: 'Arrastra tu export aquí o haz clic para elegir un archivo.',
    ready: 'Listo',
    uploadAndAnalyze: 'Subir y analizar',
    inputMode_upload: 'Subir exportación',
    inputMode_paste: 'Pegar texto',
    inputMode_media: 'Medios / voz',
    upload_media_title: 'Subir imagen o audio',
    upload_media_hint:
      'Compatible: imágenes (png, jpg, jpeg, webp, gif) y audio (mp3, wav, ogg, opus, m4a, webm). Máx. 25MB.',
    choose_file: 'Elegir archivo',
    record_voice_title: 'Grabar una nota de voz',
    record_voice_hint: 'Hasta {{seconds}} segundos. Transcribiremos automáticamente.',
    start_recording: 'Iniciar grabación',
    stop_recording: 'Detener ({{seconds}}s)',
    recording: 'Grabando...',
    mic_permission_error: 'No se pudo acceder al micrófono. Permite el acceso e inténtalo de nuevo.',
    progress_media_voice: 'Analizando la grabación de voz...',
    voice_coming_soon: 'La transcripción de voz llegará en la próxima versión.',
    pasteLabel: 'Pega un breve fragmento de tu conversación',
    pastePlaceholder:
      'Pega aquí los mensajes (solo un fragmento pequeño, no todo el chat de años)...',
    pasteHelp:
      'Funciona mejor con fragmentos pequeños. Para historiales largos, usa la exportación de chat.',
    analyzePasted: 'Analizar texto pegado',
    paste_error_empty: 'Primero pega el texto de la conversación.',
    paste_error_too_long:
      'El texto pegado es demasiado largo. Usa un fragmento más corto (hasta 8000 caracteres).',
    paste_error_not_conversation:
      'Parece que esto no es una conversación sino un texto aleatorio. Pega un fragmento real de chat.',
    exportTXT: 'Exportar TXT',
    exportJSON: 'Exportar JSON',
    exportPDF: 'Exportar PDF',
    exportReportTitle: 'Informe de análisis',
    exportGeneratedBy: 'Creado con "Texts With my Ex" - AI Gaslight Detection App',
    exportDate: 'Fecha',
    exportOverview: 'Resumen',
    exportScores: 'Puntuaciones',
    exportPatterns: 'Patrones',
    exportEvidence: 'Evidencia',
    analysisDefaultOverview: 'Análisis completado. Revise las secciones para obtener información detallada.',
    analysisDefaultNoPatterns: 'Análisis completado. No se detectaron patrones específicos en este extracto.',
    analysisDefaultTitle: 'Análisis',
    analysisParseError: 'Análisis completado con resultados parciales debido a un error de análisis.',
    analysisEmptySummary: 'Análisis completado. No se detectaron patrones específicos en esta sección.',
    analysisGenericWarningTitle:
      'Parece que la IA solo devolvió un resumen genérico sin ejemplos concretos.',
    analysisGenericWarningBody:
      'Vuelve a ejecutar el análisis. Si el problema continúa, intenta dividir la conversación en fragmentos más cortos.',
    showDetails: 'Mostrar detalles',
    hideDetails: 'Ocultar detalles',

    // Ayuda para exportar chats
    exportHelpTitle: 'Cómo exportar tus chats',
    exportHelpTelegram:
      'Telegram (ordenador): abre el chat → menú → "Exportar historial de chat" → elige JSON o texto y sube el archivo aquí.',
    exportHelpWhatsApp:
      'WhatsApp (móvil): abre el chat → menú → "Exportar chat" → elige Sin archivos multimedia (más rápido) o Con archivos multimedia, envía el archivo a ti mismo y súbelo aquí.',
    exportHelpOther:
      'Para Signal, Discord, Facebook Messenger, iMessage/SMS o Viber, exporta el chat a un archivo de texto/JSON (o ZIP) desde la app o con una herramienta de confianza y luego súbelo.',

    // Cómo funciona
    howItWorks: 'Cómo funciona',
    step1_title: 'Sube tu conversación',
    step1_description: 'Exporta tu conversación de Telegram o WhatsApp y súbela aquí. Tus datos se procesan de forma segura y nunca se almacenan.',
    step2_title: 'Análisis IA',
    step2_description: 'Nuestra IA analiza patrones de comunicación, detecta comportamientos de gaslighting e identifica dinámicas relacionales usando métodos científicos.',
    step3_title: 'Obtén insights',
    step3_description: 'Recibe un informe completo con puntuaciones, evidencia y explicaciones para ayudarte a entender lo que realmente sucedió.',
    howItWorks_subtitle: '3 pasos rápidos, luego la IA hace el trabajo pesado por ti.',

    // Articles
    articles_label: 'Artículos y guías',
    articles_title: 'Guías sobre gaslighting, manipulación y recuperación',
    articles_subtitle:
      'Lecturas breves para detectar patrones, salir con seguridad, procesar el duelo y avanzar hacia dinámicas más sanas.',
    articles_cta: 'Leer artículo',
    articles_read_time_short: '5 min de lectura',
    articles_tag_awareness: 'Conciencia',
    articles_tag_howto: 'Cómo hacer',
    articles_tag_product: 'Sobre el producto',
    articles_tag_practice: 'Práctica',
    articles_tag_support: 'Apoyo',
    articles_gaslighting_title: 'Gaslighting: patrones comunes y respuestas',
    articles_gaslighting_description:
      'Ejemplos de distorsión de la realidad, cambio de culpa y señales lingüísticas que suelen aparecer.',
    articles_export_title: 'Cómo exportar chats de forma segura (Telegram y WhatsApp)',
    articles_export_description:
      'Consejos paso a paso sobre formatos aceptados y cómo proteger datos sensibles.',
    articles_method_title: 'Cómo nuestra IA analiza tus mensajes',
    articles_method_description:
      'Explicación simple del puntaje, extracción de evidencias y por qué los chats no se almacenan permanentemente.',
    articles_toxic_title: 'Cómo reconocer patrones de relación tóxica',
    articles_toxic_description:
      'Señales de crítica, control, aislamiento y altibajos emocionales que erosionan la seguridad.',
    articles_steps_title: 'Pasos prácticos mientras la relación sigue en curso',
    articles_steps_description:
      'Chequeo de realidad, límites de prueba, plan de seguridad y cuidado del cuerpo sin escalar.',
    articles_grief_title: 'Cómo procesar el duelo tras una relación difícil',
    articles_grief_description:
      'Fases no lineales del duelo después de una dinámica tóxica y formas de recuperar estabilidad y sentido.',
    articles_manipulation_title: 'Tipos clave de manipulación en relaciones',
    articles_manipulation_description:
      'Chantaje emocional, gaslighting, aislamiento, violación de límites y cómo detectar los patrones.',
    articles_covert_title: 'Narcisismo encubierto: peligro tras la vulnerabilidad',
    articles_covert_description:
      'Cómo la victimización, la queja silenciosa y la “bondad con condiciones” mantienen el control.',
    articles_letgo_title: 'Soltar un apego traumático',
    articles_letgo_description:
      'Por qué es difícil irse, cómo prepararse y qué ayuda a evitar recaídas en el contacto.',
    articles_consequences_title: 'Consecuencias psicológicas de vínculos tóxicos',
    articles_consequences_description:
      'Síntomas tipo TEPT, ansiedad, disociación y por qué mente y cuerpo necesitan recuperación.',
    articles_chances_title: '¿Hay una oportunidad para esta relación?',
    articles_chances_description:
      'Cuándo el cambio es realista, qué banderas rojas cierran el intento y cómo decidir con seguridad.',
    articles_healthy_title: 'Las relaciones sanas no son perfectas (y está bien)',
    articles_healthy_description:
      'Rasgos realistas de relaciones que funcionan frente al mito de la armonía perfecta.',

    // Insignias y tarjeta de vista previa en el héroe
    hero_badge_patterns: 'Análisis profundo de patrones',
    hero_badge_boundaries: 'Límites primero',
    hero_badge_multilang: 'Chats en varios idiomas',
    hero_preview_title: 'Escaneo de conversación con IA',
    hero_preview_subtitle: 'Ejemplo ficticio de lo que resalta el detector.',
    hero_preview_live: 'Vista previa en vivo',
    hero_preview_flag_title: 'Patrón de gaslighting detectado',
    hero_preview_flag_subtitle:
      'Distorsión de la realidad · Minimizar la experiencia · Cambio de culpa',
    hero_preview_score_label: 'Índice de seguridad emocional',
    hero_preview_score_low: 'Bajo',
    emotional_safety_medium: 'Medio',
    emotional_safety_high: 'Alto',
    hero_preview_typing: 'La IA sigue leyendo…',
    relationship_health_title: 'Panorama de la relación',

    // Chips de privacidad
    privacy_chip_no_sharing: 'Nada se publica en ningún lado',
    privacy_chip_local_session: 'Solo en esta sesión',
    privacy_chip_control: 'Tú sigues teniendo el control',
    demo_metrics_banner:
      'Métricas demo solo del screenshot. Sube la exportación completa del chat para obtener datos precisos.',
    activity_wave_by_day: 'Por día',
    activity_wave_by_week: 'Por semana',

    // Mensajes de ejemplo en el chat de vista previa
    // left = abusador, right = víctima
    hero_preview_msg1_left: 'Estás exagerando otra vez, no fue para tanto.',
    hero_preview_msg1_right: 'Yo lo recuerdo totalmente distinto. Siempre tergiversas todo.',
    hero_preview_msg2_left: 'Si de verdad me amaras, no dudarías tanto de esto.',
    hero_preview_msg2_right: 'Solo quiero que hablemos honestamente sobre lo que pasó.',
    hero_preview_msg3_left: 'Nunca dije eso, te lo estás inventando otra vez.',
    hero_preview_msg3_right: 'Tengo los mensajes guardados. ¿Por qué siempre lo niegas?',
    hero_preview_msg4_left: 'A lo mejor el problema es lo sensible que eres.',
    hero_preview_msg4_right: 'No se trata de ser sensible, se trata de lo que dijiste.',
    hero_preview_msg5_left: 'Todo el mundo piensa que soy razonable, solo tú te quejas.',
    hero_preview_msg5_right: 'No estoy tratando de empezar una pelea, solo quiero entender.',

    // FAQ corto: por qué y para quién
    faq_why:
      'Esta app te ayuda a ver patrones de comunicación en tus conversaciones — no para señalar culpables, sino para entender mejor qué estaba pasando entre ustedes.',
    faq_forWhom:
      'Está pensada para personas que se sienten confundidas tras una relación, sospechan manipulación o gaslighting, o simplemente quieren una mirada externa neutral sobre su forma de comunicarse.',
    faq_notSides:
      'El análisis no toma partido ni dice quién tiene "razón" o "culpa" — describe patrones y da ejemplos de ambos lados.',
    faq_notTherapy:
      'Esto no es terapia, ni diagnóstico ni asesoría legal. Es una perspectiva basada en IA sobre tus mensajes.',
    faq_goal:
      'El objetivo principal es apoyar la reflexión y el entendimiento mutuo, no iniciar nuevos conflictos ni servir como arma en discusiones.',
    help_tooltip_label: 'Ayuda e información del servicio',
    help_tooltip_title: 'Acerca del servicio',
    help_tooltip_close: 'Cerrar',
    report_disclaimer_main:
      'Este informe está generado por IA solo a partir de los mensajes que subiste. Puede perder contexto y debe verse como una perspectiva más, no como la verdad absoluta.',
    report_disclaimer_safety:
      'Si tu situación implica violencia, autolesiones o te sientes en peligro, no confíes solo en esta app — busca apoyo de personas de confianza o de profesionales.',

    // Testimonios
    testimonials_label: 'HISTORIAS REALES, PERSPECTIVAS CAMBIADAS',
    testimonials_title: 'Personas que usaron esto para entender mejor sus conversaciones',
    testimonial_anna_name: '«Anna», 28',
    testimonial_anna_role: 'Después de una larga ruptura',
    testimonial_anna_quote:
      'Tenía capturas de pantalla y opiniones de amigos, pero esta fue la primera vez que vi toda nuestra conversación expuesta con calma. Me ayudó a dejar de obsesionarme con una pelea y ver el patrón más amplio.',
    testimonial_marco_name: '«Marco», 34',
    testimonial_marco_role: 'En una nueva relación',
    testimonial_marco_quote:
      'Lo usé no para probar nada a mi pareja, sino para revisar mis propias reacciones. El informe mostró dónde escalaba o me cerraba, lo cual era incómodo — pero útil.',
    testimonial_lea_name: '«Lea», 31',
    testimonial_lea_role: 'Cuestionando la manipulación',
    testimonial_lea_quote:
      'Tenía miedo de que me «juzgara» a mí o a mi ex. En cambio, se sintió como un espejo neutral. No me dijo qué hacer, pero me dio el lenguaje para describir lo que sentía.',
    testimonial_sara_name: '«Sara», 29',
    testimonial_sara_role: 'Después de relación tóxica',
    testimonial_sara_quote:
      'Finalmente, tenía prueba de que no estaba loca. Los patrones eran claros — contradicciones constantes, cambio de culpa. Me dio la confianza para seguir adelante.',
    testimonial_david_name: '«David», 35',
    testimonial_david_role: 'Intentando mejorar',
    testimonial_david_quote:
      'Quería entender por qué mis relaciones seguían fallando. El análisis mostró mis patrones de comunicación — defensivo, desdeñoso. Difícil de escuchar, pero necesario.',
    // Dashboard
    dashboard_title: 'Cronología',
    heatmap_title: 'Mapa de calor de actividad',
    heatmap_description:
      'Intensidad de conversación por semana. El rojo resalta períodos con conflictos o eventos significativos.',
    calendar_title: 'Calendario de conversación',
    calendar_description:
      'Las fechas importantes están resaltadas en rojo. Pase el mouse sobre las fechas para ver detalles.',
    // Gráfico de actividad por día
    activity_chart_title: 'Actividad por días',
    activity_chart_description:
      'Muestra en qué días hubo más mensajes. Los picos pueden coincidir con periodos de tensión.',
    activity_chart_messages_label: 'Mensajes',
    activity_chart_color_hint:
      'Rojo ≈ días ligados a conflictos intensos o manipulación.',
    important_dates_label: 'Fechas importantes',
    important_date: 'Fecha importante',
    important_dates_list_title: 'Fechas importantes',
    message_intensity_label: 'Intensidad de mensajes',
    more_dates: 'fechas adicionales',
    verdict_problematic: 'Problemática',
    participant_profiles_title: 'Perfiles de participantes',
    participant_profiles_description: 'Perfiles de comunicación breves para cada participante.',
    reality_check_title: 'Verificación de la realidad',
    reality_check_right: 'Qué estaba correcto',
    reality_check_wrong: 'Qué estaba incorrecto',
    reality_check_whose: 'Percepción más precisa',
    hard_truth_title: 'Verdad dura',
    hard_truth_verdict: 'Veredicto',
    hard_truth_abusive: 'Conductas abusivas',
    hard_truth_abusive_label: 'Abusivas',
    hard_truth_toxic_label: 'Tóxicas',
    hard_truth_needs_work_label: 'Requiere trabajo',
    hard_truth_healthy_label: 'Saludables',
    what_you_should_know_title: 'Lo que debes saber',
    wysk_could_have_done: 'Qué se pudo hacer diferente',
    wysk_comm_tools: 'Herramientas de comunicación',
    wysk_could_be_saved: '¿Podía salvarse la relación?',
    wysk_why_not_fault: 'Por qué no es totalmente tu culpa',
    wysk_what_made_vulnerable: 'Qué te hizo vulnerable',
    wysk_patterns_to_watch: 'Patrones a vigilar',
    wysk_resources: 'Recursos',
    wysk_red_flags_next: 'Alertas para la próxima vez',
    whats_next_kicker: 'Plan de acción',
    whats_next_title: '¿Qué sigue?',
    whats_next_subtitle: 'Pasos prácticos basados en este análisis.',
    whats_next_actions: 'Pasos accionables',
    whats_next_boundaries: 'Límites a practicar',
    whats_next_support: 'Apoyo y recursos',

    testimonial_yuki_name: '«Yuki», 27',
    testimonial_yuki_role: 'Relación a distancia',
    testimonial_yuki_quote:
      'Estábamos peleando constantemente por texto. Esto me ayudó a ver que la mayoría de los conflictos comenzaban con malentendidos, no con malicia. Ambos necesitábamos comunicarnos mejor.',
    testimonial_sofia_name: '«Sofia», 32',
    testimonial_sofia_role: 'Claridad post-divorcio',
    testimonial_sofia_quote:
      'Necesitaba cerrar. Leer años de mensajes era abrumador, pero el análisis de IA destacó los patrones clave. No se trataba de culpa — se trataba de comprensión.',
    testimonial_mia_name: '«Mia», 26',
    testimonial_mia_role: 'Meses después de la ruptura',
    testimonial_mia_quote:
      'Reescribía la historia en mi cabeza. La línea de tiempo con picos lo hizo menos dramático y más factual. Por fin pude cerrar la pestaña y dormir.',
    testimonial_lucas_name: '«Lucas», 29',
    testimonial_lucas_role: 'Llevado a terapia',
    testimonial_lucas_quote:
      'Mi terapeuta pidió ejemplos concretos. El informe mostró cada vez que desvié con sarcasmo. Incómodo, pero aceleró la sesión.',
    testimonial_priya_name: '«Priya», 33',
    testimonial_priya_role: 'Mensajes de coparentalidad',
    testimonial_priya_quote:
      'Compartimos una niña pequeña y las emociones suben. La herramienta resaltó dónde se colaba la culpa. Nos ayudó a acordar un guion más calmado antes de los intercambios.',
    testimonial_noah_name: '«Noah», 31',
    testimonial_noah_role: 'Detectar mi defensiva',
    testimonial_noah_quote:
      'Siempre decía “solo aclaro”, pero el patrón era interrumpir y minimizar. Ahora practico responder de uno en uno.',
    testimonial_amira_name: '«Amira», 30',
    testimonial_amira_role: 'Malos entendidos a distancia',
    testimonial_amira_quote:
      'Fallábamos con el tono. La vista continua mostró que el silencio era casi siempre estrés, no mala intención. Bajó la ansiedad.',
    testimonial_elena_name: '«Elena», 34',
    testimonial_elena_role: 'Ordenando años de audios',
    testimonial_elena_quote:
      'Temía volver a escuchar horas de notas de voz. Ver las transcripciones alineadas me dejó ver patrones sin revivirlo todo.',
    testimonial_tom_name: '«Tom», 30',
    testimonial_tom_role: 'Entender bucles de conflicto',
    testimonial_tom_quote:
      'Creía que era “lógico”. El informe mostró el bucle: sarcasmo → defensiva → muro. Nombrarlo ayudó a romperlo.',
    testimonial_zahra_name: '«Zahra», 28',
    testimonial_zahra_role: 'Peleas por estrés de visa',
    testimonial_zahra_quote:
      'Estábamos agotados por el papeleo. La línea de tiempo mostraba que cada pico era después de correos del consulado. Decir “pausa” fue más fácil después.',
    testimonial_pedro_name: '«Pedro», 37',
    testimonial_pedro_role: 'Reconstruyendo confianza',
    testimonial_pedro_quote:
      'Quería prueba de que mejoraba. Ver menos cambios de culpa mes a mes fue la primera señal medible.',
    testimonial_lina_name: '«Lina», 25',
    testimonial_lina_role: 'Primera ruptura seria',
    testimonial_lina_quote:
      'Releía chats de noche. El resumen me dio cierre más rápido que releer todo.',
    testimonial_chen_name: '«Chen», 33',
    testimonial_chen_role: 'Tono laboral en casa',
    testimonial_chen_quote:
      'Mi pareja decía que traía el tono de oficina. El análisis mostró cuántas veces respondía “ahora no”. Pequeño, pero se acumula.',
    testimonial_jasmine_name: '«Jasmine», 29',
    testimonial_jasmine_role: 'Mudándonos juntos',
    testimonial_jasmine_quote:
      'Cada pelea coincidía con estrés de la mudanza. Verlo trazado hizo más fácil decir “estamos saturados, no somos enemigos”.',
    testimonial_omar_name: '«Omar», 36',
    testimonial_omar_role: 'Pensador nocturno',
    testimonial_omar_quote:
      'Reabría chats a las 2 am. El resumen dio el cierre que el scroll nunca dio.',
    testimonial_julia_name: '«Julia», 27',
    testimonial_julia_role: 'Detectar love-bombing',
    testimonial_julia_quote:
      'El patrón de promesas grandes y luego desapariciones saltaba a la vista. No era imaginación.',
    testimonial_mateo_name: '«Mateo», 31',
    testimonial_mateo_role: 'Aprender a disculparse',
    testimonial_mateo_quote:
      'Pensaba que “perdón si te sientes así” bastaba. Verlo marcado me hizo practicar disculpas de verdad.',

    // Términos y condiciones
    terms_title: 'Términos y Condiciones',
    privacy_title: 'Política de Privacidad',
    refund_title: 'Política de Reembolso',
    pricing_title: 'Precios',
    paddle_buy_label: 'Comprar informe completo',
    paddle_status_loading: 'Cargando checkout…',
    paddle_status_verifying: 'Verificando pago…',
    paddle_status_opening: 'Abriendo checkout seguro…',
    paddle_status_unlocked: '¡Premium activado!',
    paddle_error_missing_token: 'Falta el token de cliente de Paddle',
    paddle_error_token_missing: 'Falta el token en la respuesta',
    paddle_error_unlock: 'No se pudo activar premium',
    paddle_error_not_ready: 'Paddle aún no está listo',
    paddle_error_start: 'No se pudo iniciar el checkout',
    paddle_error_txn_missing: 'Falta el ID de transacción',
    terms_intro:
      'Estos Términos y Condiciones ("Términos") rigen tu uso de la aplicación web Textos con mi ex ("Servicio"). Al acceder o usar el Servicio, aceptas estar sujeto a estos Términos.',
    terms_section1_title: '1. Descripción del servicio',
    terms_section1_content:
      'Textos con mi ex es una herramienta de análisis asistida por IA y anónima que te permite subir exportaciones de chats (por ejemplo, Telegram o WhatsApp) y recibir un informe automatizado sobre patrones de comunicación. No es terapia, asesoramiento legal ni un servicio de crisis.',
    terms_section2_title: '2. Elegibilidad y uso',
    terms_section2_content:
      'Solo puedes usar el Servicio si tienes al menos 18 años y eres legalmente capaz de celebrar estos Términos. Eres responsable de asegurarte de que tienes derecho a subir y procesar los chats que envías al Servicio.',
    terms_section3_title: '3. Manejo de datos y privacidad',
    terms_section3_content:
      'Los chats subidos se transmiten en texto claro a nuestros servidores y a proveedores externos de modelos de IA para generar tu informe. El transporte está protegido por HTTPS, pero no ofrecemos cifrado de extremo a extremo; el contenido podría ser técnicamente accesible para personal autorizado o proveedores, aunque el acceso esté restringido. El almacenamiento es breve: el progreso/las tareas viven hasta ~2 horas después de la entrega y los análisis en caché hasta 24 horas; los resultados grandes en blob se eliminan durante la limpieza. Los datos no se usan para entrenar modelos de terceros. Para más detalles, consulta nuestra Política de Privacidad (cuando esté disponible).',
    terms_section4_title: '4. Pagos y suscripciones',
    terms_section4_content:
      'Ciertas funciones pueden ofrecerse de forma de pago (por ejemplo, análisis premium o análisis de medios). Los pagos son procesados a través de nuestro sistema de procesamiento de pagos. Los precios, intervalos de facturación y reglas de reembolso se muestran en el checkout y pueden actualizarse de vez en cuando.',
    terms_section5_title: '5. Sin garantías',
    terms_section5_content:
      'El análisis es generado por grandes modelos de lenguaje y puede ser incompleto, inexacto o reflejar sesgos inherentes en esos modelos. No garantizamos la exactitud, integridad o idoneidad de ningún análisis para tu situación particular.',
    terms_section6_title: '6. Uso prohibido',
    terms_section6_content:
      'Aceptas no usar el Servicio para fines ilegales, violar los derechos de otros o subir contenido que infrinja la propiedad intelectual, privacidad u otros derechos de terceros.',
    terms_section7_title: '7. Limitación de responsabilidad',
    terms_section7_content:
      'En la máxima medida permitida por la ley, Textos con mi ex y sus operadores no serán responsables de ningún daño indirecto, incidental, especial, consecuente o punitivo que surja de o esté relacionado con tu uso del Servicio.',
    terms_section8_title: '8. Cambios a estos términos',
    terms_section8_content:
      'Podemos actualizar estos Términos de vez en cuando. La fecha de "última actualización" en la parte superior de esta página indicará cuándo los cambios se vuelven efectivos. Tu uso continuado del Servicio después de cualquier cambio significa que aceptas los Términos actualizados.',
    terms_section9_title: '9. Contacto',
    terms_section9_content:
      'Si tienes preguntas sobre estos Términos o el Servicio, contáctanos en spinnermining@gmail.com.',
    legal_label: 'Legal',
    legal_last_updated: 'Última actualización:',
    privacy_intro:
      'Texts with My Ex está pensado para análisis anónimos y de corta duración. Solo procesamos los datos que subes para entregar tu informe y luego los borramos rápidamente. No creamos cuentas de usuario.',
    privacy_collect_title: 'Qué recopilamos',
    privacy_collect_item1: 'Exportaciones de chats y medios opcionales que subes para el análisis.',
    privacy_collect_item2: 'Metadatos de progreso (p. ej., estado del trabajo) almacenados temporalmente para completar tu informe.',
    privacy_collect_item3: 'Analítica básica y señales de limitación de tasa (IP, user agent) para mantener el servicio estable.',
    privacy_use_title: 'Cómo usamos tus datos',
    privacy_use_item1: 'Para ejecutar el análisis de IA y generar tu informe.',
    privacy_use_item2: 'Para resolver errores y proteger contra abusos.',
    privacy_use_item3: 'Nunca para entrenar modelos de terceros ni crear perfiles publicitarios.',
    privacy_retention_title: 'Retención',
    privacy_retention_text:
      'Las tareas y datos en caché del análisis son de corta duración (normalmente menos de 24 horas) y se eliminan automáticamente durante la limpieza. Los archivos subidos al almacenamiento de blobs se depuran con regularidad. No conservamos una copia a largo plazo de tus conversaciones.',
    privacy_payment_title: 'Datos de pago',
    privacy_payment_text:
      'Los pagos son procesados por Paddle. No almacenamos los datos de la tarjeta. Paddle puede recopilar señales de facturación y prevención de fraude según su propia política de privacidad.',
    privacy_choices_title: 'Tus opciones',
    privacy_choices_item1: 'Puedes borrar tus datos cerrando la página; los artefactos almacenados caducan automáticamente.',
    privacy_choices_item2: 'No subas contenido que no estés autorizado a compartir.',
    privacy_choices_item3: 'Usa una sesión de navegador orientada a la privacidad si no quieres almacenamiento local de tokens.',
    privacy_contact_title: 'Contacto',
    privacy_contact_text_prefix: 'Preguntas sobre privacidad? Escribe a',
    privacy_contact_text_suffix: '.',
    refund_intro:
      'El acceso premium es una compra única para un informe completo. Como el informe se genera inmediatamente usando recursos de IA, todas las ventas son finales una vez completado el pago.',
    refund_no_refunds_title: 'Cuándo no hay reembolsos',
    refund_no_refunds_item1: 'Cambio de opinión después de entregar el informe.',
    refund_no_refunds_item2: 'No gustar el resultado de la IA (el servicio es de mejor esfuerzo y no es un consejo garantizado).',
    refund_no_refunds_item3: 'Intentar reutilizar la misma compra para varios análisis no relacionados.',
    refund_issue_title: 'Si algo sale mal',
    refund_issue_item1: 'Si el informe no se genera después del pago, contáctanos dentro de 7 días.',
    refund_issue_item2: 'Intentaremos volver a ejecutar el análisis; si no es posible, revisaremos un reembolso.',
    refund_issue_item3: 'Incluye tu ID de transacción de Paddle y el correo o metadatos mostrados en el checkout.',
    refund_contact_title: 'Cómo contactarnos',
    refund_contact_text_prefix: 'Escribe a',
    refund_contact_text_suffix: 'con tu ID de transacción y una breve descripción del problema. Respondemos lo antes posible.',
    pricing_badge_text: 'Pago único, sin suscripción',
    pricing_description:
      'Ejecuta una vista previa gratuita para ver tus puntuaciones y resumen. Desbloquea el informe completo y las exportaciones con un único pago seguro por Paddle.',
    pricing_overlay_title: 'Por ahora gratis',
    pricing_overlay_description:
      'Los precios están ocultos temporalmente y todo el acceso está abierto de forma gratuita. Vuelve más tarde para novedades.',
    pricing_overlay_cta: 'Volver al inicio',
    pricing_free_label: 'Vista previa',
    pricing_free_price_label: 'Gratis',
    pricing_free_badge: 'Empieza aquí',
    pricing_free_description:
      'Ve puntuaciones generales y un resumen antes de pagar. Útil para una comprobación rápida.',
    pricing_free_item1: 'Sube y procesa una conversación',
    pricing_free_item2: 'Ve puntuaciones principales y un breve resumen',
    pricing_free_item3: 'Línea de tiempo básica de actividad',
    pricing_free_cta: 'Iniciar vista previa gratuita',
    pricing_premium_label: 'Informe Premium',
    pricing_price_unit: 'pago único',
    pricing_premium_description:
      'Desbloquea el informe completo de IA, evidencias, perfiles de participantes y todas las opciones de exportación. Sin cobros recurrentes.',
    pricing_premium_item1: 'Desglose completo de evidencias y patrones',
    pricing_premium_item2: 'Perfiles de participantes, insights y sección de cierre',
    pricing_premium_item3: 'Exportar a TXT / JSON / PDF',
    pricing_premium_item4: 'Ajustes prioritarios de análisis cuando estén disponibles',
    pricing_premium_cta: 'Comprar informe completo',
    pricing_checkout_note:
      'El pago se gestiona con Paddle. El precio final y la moneda se confirman antes de pagar.',
    pricing_what_you_get_title: 'Lo que obtienes',
    pricing_what_evidence_title: 'Evidencia completa',
    pricing_what_evidence_text:
      'Fragmentos concretos de mensajes, explicaciones de patrones y gráficos de actividad diaria.',
    pricing_what_exports_title: 'Exportaciones',
    pricing_what_exports_text:
      'Descarga tu informe en TXT, JSON o PDF para uso sin conexión y para compartir.',
    pricing_what_onetime_title: 'Acceso único',
    pricing_what_onetime_text:
      'Sin suscripción. Cada compra premium desbloquea un informe completo para tu análisis actual.',
    pricing_help_text_prefix: '¿Necesitas ayuda con el pago? Escribe a',
    pricing_help_text_suffix: '.',
    donation_beta_label: 'Beta',
    donation_title: 'Apoyar al desarrollador',
    donation_text: 'Si este informe te ayudó, una pequeña donación sería de gran ayuda. ¡Gracias por tu apoyo!',
    donation_crypto_only: 'Solo cripto',
    donation_show_qr: 'Mostrar QR',
    donation_qr_for_wallet: 'QR de la billetera',
    donation_close: 'Cerrar',
    pdf_safety_concern_title: 'Preocupación de seguridad',
    pdf_safety_concern_intro: 'Lo que va más allá de lo tóxico:',
    pdf_safety_resources: 'Recursos',
    pdf_closure_title: 'Cierre',
    pdf_closure_right: 'En qué tenía razón',
    pdf_closure_deserved: 'Lo que se merecía',
    pdf_closure_got: 'Lo que se obtuvo',
    pdf_closure_permission: 'Permiso para seguir adelante',
    pdf_closure_end: 'Declaración final',
    install_app: 'Instalar aplicación',
    install_app_instructions: 'Para instalar esta aplicación:',
    install_app_chrome: 'Chrome/Edge: Haz clic en el icono de instalación en la barra de direcciones, o ve a Menú → Instalar aplicación',
    install_app_safari: 'Safari (iOS): Toca Compartir → Añadir a la pantalla de inicio',
    install_app_firefox: 'Firefox: Aún no compatible'
  }
};
