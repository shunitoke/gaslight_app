import type { LocaleBundle } from '../types';

export const deBundle: LocaleBundle = {
  locale: 'de',
  displayName: 'Deutsch',
  messages: {
    appName: 'Texte mit meinem Ex®',
    appTagline: 'Ein ehrlicher Blick auf das, was passiert ist.',
    hero_tagline: 'Ein ehrlicher KI-Blick auf das, was passiert ist.',
    hero_tagline_alt1: 'Unter der Haube: KI und Wissenschaft statt Drama.',
    hero_tagline_alt2: 'Verhalten, Bindung und Konflikte — KI-analytisch ausgewertet.',
    hero_tagline_alt3: 'Völlig anonym und vertraulich.',
    hero_cta: 'Konversation mit KI analysieren',
    hero_copy: 'Laden Sie Ihre Chats hoch, um eine unparteiische, KI-gestützte Beziehungsanalyse zu erhalten.',
    hero_confidential: 'Vollständig vertraulich.',
    footer_disclaimer: 'Keine Therapie, kein Klatsch — nur KI-Klarheit.',
    footer_visitors_label: 'Eindeutige Besucher',
    footer_visitors_loading: 'Besucher werden gezählt...',
    footer_analyses_label: 'Durchgeführte Analysen',
    footer_analyses_loading: 'Analysen werden gezählt...',
    footer_report_bug: 'Fehler melden',
    language_label: 'Sprache',
    uploadExport: 'Konversation hochladen',
    uploadExportDescription: 'Wir analysieren langjährige Chats.',
    confirmImportPrompt:
      '„{file}“ jetzt importieren? Stelle sicher, dass der Export nur den gewünschten Chat enthält.',
    uploadingFile: 'Datei wird hochgeladen...',
    importSuccessful: 'Import erfolgreich',
    importFailed: 'Import fehlgeschlagen',
    analysisFailed: 'Analyse fehlgeschlagen',
    failedToStartAnalysis: 'Analyse konnte nicht gestartet werden',
    failedToUploadFile: 'Datei konnte nicht in den Speicher hochgeladen werden',
    errorOccurred: 'Ein Fehler ist aufgetreten',
    analyzing: 'KI analysiert Konversation...',
    progress_starting: 'KI-Analyse wird initialisiert...',
    progress_parsing: 'Konversation wird analysiert...',
    progress_analyzing: 'KI analysiert Konversationsmuster...',
    progress_media: 'KI analysiert Medieninhalte...',
    progress_chunking: 'Konversationsabschnitte werden verarbeitet...',
    progress_finalizing: 'KI fasst den Abschlussbericht zusammen...',
    progress_completed: 'KI-Analyse abgeschlossen!',
    progress_error: 'KI-Analyse fehlgeschlagen',
    progress_analyzing_hint: 'KI analysiert Muster, Kommunikationsstile und Beziehungsdynamiken...',
    progress_media_hint: 'Analyse von Bildern, Stickern und Medieninhalten mit KI-Visionsmodellen...',
    progress_finalizing_hint:
      'Wir führen alle Abschnitte und Diagramme zusammen. Dieser letzte Schritt kann bis zu einer Minute dauern – bitte etwas Geduld.',
    progress_chunk_label: 'Abschnitt {current} von {total}',
    progress_disclaimer: 'Bitte schließen Sie dieses Fenster während der Analyse nicht.',
    backToHome: 'Zurück zur Startseite',
    noAnalysisFound: 'Keine Analyse gefunden. Bitte laden Sie zuerst eine Konversation hoch.',
    noAnalysisFound_help:
      'Gehen Sie zurück zur Startseite, laden Sie einen Chat-Export hoch und warten Sie, bis die Analyse abgeschlossen ist, um den Bericht zu sehen.',
    analysisReport: 'KI-Analysebericht',
    gaslightingRisk: 'Manipulationsrisiko',
    conflictIntensity: 'Konfliktintensität',
    supportiveness: 'Unterstützendes Verhalten',
    apologyFrequency: 'Konfliktlösungsrate',
    evidence: 'Beweise',
    scientificAnalysis: 'Wissenschaftliche Analyse',
    plainLanguage: 'In einfachen Worten',
    score: 'Punktzahl',
    section_gaslighting: 'Manipulationsrisiko',
    section_conflictIntensity: 'Konfliktintensität',
    section_supportiveness: 'Unterstützendes Verhalten',
    section_apologyFrequency: 'Konfliktlösungsrate',
    section_redFlags: 'Warnsignale',
    section_conflict: 'Konfliktintensität',
    section_support: 'Unterstützendes Verhalten',
    section_apology: 'Häufigkeit der Entschuldigungen',
    imported: 'Importiert',
    messages: 'Nachrichten',
    privacyNote: 'Ihre Daten werden vorübergehend verarbeitet und niemals dauerhaft gespeichert.',
    fileUploadHelp: 'Formate: .json, .txt, .zip. Dateien bis 25 MB.',
    premium_badge: 'Premium',
    free_badge: 'Kostenlos',
    premium_hint:
      'Premium-Analyse: vollständiger Bericht mit detaillierten Insights, Belegen und Exporten.',
    free_hint:
      'Kostenlose Vorschau: nur Überblick. Schalte vollständigen Bericht, Belege und Exporte frei.',
    premium_progress_hint:
      'Detaillierte Analyse läuft: Wir verarbeiten Text und verfügbare Medien.',
    free_progress_hint:
      'Basisanalyse: derzeit nur Text; Medien folgen später.',
    progress_premium_features_profiles: 'Teilnehmer-Insights aus den Nachrichten',
    progress_premium_features_replies: '',
    progress_premium_features_activity: 'Aufbau des täglichen Aktivitätsdiagramms',
    selectPlatform: 'Plattform auswählen',
    platform_auto: 'Automatische Erkennung',
    platform_telegram: 'Telegram',
    platform_whatsapp: 'WhatsApp',
    platform_signal: 'Signal',
    platform_discord: 'Discord',
    platform_messenger: 'Facebook Messenger',
    platform_imessage: 'iMessage',
    platform_viber: 'Viber',
    platform_generic: 'TXT / SMS / andere Plattform',
    recommended: 'Empfohlen',
    selectFile: 'Datei auswählen',
    clickToSelectFile: 'Klicken Sie, um eine Datei auszuwählen',
    dragDropHint: 'Ziehen Sie den Export hierher oder klicken Sie, um eine Datei zu wählen.',
    ready: 'Bereit',
    uploadAndAnalyze: 'Hochladen & Analysieren',
    inputMode_upload: 'Export hochladen',
    inputMode_paste: 'Text einfügen',
    inputMode_media: 'Medien / Sprache',
    upload_media_title: 'Bild oder Audio hochladen',
    upload_media_hint:
      'Unterstützt: Bilder (png, jpg, jpeg, webp, gif) und Audio (mp3, wav, ogg, opus, m4a, webm). Max. 25MB.',
    choose_file: 'Datei auswählen',
    record_voice_title: 'Sprachnachricht aufnehmen',
    record_voice_hint: 'Bis zu {{seconds}} Sekunden. Wir transkribieren automatisch.',
    start_recording: 'Aufnahme starten',
    stop_recording: 'Stopp ({{seconds}}s)',
    recording: 'Aufnahme läuft...',
    mic_permission_error: 'Kein Mikrofonzugriff. Bitte Zugriff erlauben und erneut versuchen.',
    progress_media_voice: 'Sprachnachricht wird analysiert...',
    voice_coming_soon: 'Sprachtranskription kommt in der nächsten Version.',
    pasteLabel: 'Fügen Sie einen kurzen Auszug Ihrer Konversation ein',
    pastePlaceholder:
      'Fügen Sie hier Nachrichten ein (nur kurzer Ausschnitt, kein mehrjähriger Chat)...',
    pasteHelp:
      'Funktioniert am besten mit kurzen Ausschnitten. Für lange Verläufe bitte den Chat-Export nutzen.',
    analyzePasted: 'Eingefügten Text analysieren',
    paste_error_empty: 'Bitte fügen Sie zuerst einen Konversationstext ein.',
    paste_error_too_long:
      'Der eingefügte Text ist zu lang. Bitte verwenden Sie einen kürzeren Ausschnitt (bis zu 8000 Zeichen).',
    paste_error_not_conversation:
      'Das sieht nicht nach einem Chat aus, sondern nach zufälligen Zeichen. Bitte fügen Sie einen echten Konversationsausschnitt ein.',
    exportTXT: 'TXT exportieren',
    exportJSON: 'JSON exportieren',
    exportPDF: 'PDF exportieren',
    exportReportTitle: 'Analysebericht',
    exportGeneratedBy: 'Erstellt mit "Texts With my Ex" - AI Gaslight Detection App',
    exportDate: 'Datum',
    exportOverview: '🔍 Übersicht',
    exportScores: '📊 Punktzahlen',
    exportPatterns: '📌 Muster',
    exportEvidence: '🧾 Beweise',
    analysisDefaultOverview: 'Analyse abgeschlossen. Überprüfen Sie die Abschnitte für detaillierte Einblicke.',
    analysisDefaultNoPatterns: 'Analyse abgeschlossen. Keine spezifischen Muster in diesem Auszug erkannt.',
    analysisDefaultTitle: 'Analyse',
    analysisParseError: 'Analyse mit teilweisen Ergebnissen abgeschlossen aufgrund eines Parsing-Fehlers.',
    analysisEmptySummary: 'Analyse abgeschlossen. Keine spezifischen Muster in diesem Abschnitt erkannt.',
    analysisGenericWarningTitle:
      'Es sieht so aus, als hätte die KI nur eine allgemeine Zusammenfassung ohne konkrete Beispiele zurückgegeben.',
    analysisGenericWarningBody:
      'Bitte führen Sie die Analyse erneut aus. Wenn das weiterhin passiert, teilen Sie die Unterhaltung in kürzere Abschnitte auf.',
    showDetails: 'Details anzeigen',
    hideDetails: 'Details ausblenden',

    // Hilfe zum Export von Chats
    exportHelpTitle: 'So exportieren Sie Ihre Chats',
    exportHelpTelegram:
      'Telegram (Desktop): Chat öffnen → Menü → „Chatverlauf exportieren“ → JSON oder Text wählen und die Datei hier hochladen.',
    exportHelpWhatsApp:
      'WhatsApp (Handy): Chat öffnen → Menü → „Chat exportieren“ → Ohne Medien (schneller) oder Mit Medien wählen, sich die Datei selbst schicken und sie hier hochladen.',
    exportHelpOther:
      'Für Signal, Discord, Facebook Messenger, iMessage/SMS oder Viber den Chat in eine Text-/JSON-Datei (oder ZIP) aus der App oder mit einem vertrauenswürdigen Export-Tool exportieren und diese Datei hochladen.',

    // Wie es funktioniert
    howItWorks: 'Wie es funktioniert',
    step1_title: 'Chat hochladen',
    step1_description: 'Exportieren Sie Ihre Unterhaltung aus Telegram oder WhatsApp und laden Sie sie hier hoch. Ihre Daten werden sicher verarbeitet und niemals gespeichert.',
    step2_title: 'KI-Analyse',
    step2_description: 'Unsere KI analysiert Kommunikationsmuster, erkennt Gaslighting-Verhalten und identifiziert Beziehungsdynamiken mit wissenschaftlichen Methoden.',
    step3_title: 'Einblicke erhalten',
    step3_description: 'Erhalten Sie einen umfassenden Bericht mit Bewertungen, Beweisen und Erklärungen, um zu verstehen, was wirklich passiert ist.',
    howItWorks_subtitle: '3 schnelle Schritte, dann übernimmt die KI die schwere Arbeit für Sie.',
    recentAnalysesTitle: 'Neueste Analysen',
    recentAnalysesEmpty: 'Dein Verlauf erscheint hier nach dem ersten Bericht.',
    recentAnalysesClear: 'Liste löschen',
    recentAnalysesRetention:
      'Lokal ~24 Stunden auf diesem Gerät gespeichert. Über den Button oder durch Löschen von Cookies/localStorage entfernen.',
    recentAnalysesOverviewMissing: 'Analyse abgeschlossen, aber die Übersicht ist leer.',
    recentAnalysesClear_confirm:
      'Analysenverlauf auf diesem Gerät löschen? Alle lokalen Daten (localStorage/Cookies) werden entfernt und lassen sich nicht wiederherstellen.',
    recentAnalyses_media: 'Medien-Upload',
    recentAnalyses_voice: 'Sprachnotiz',
    recentAnalyses_paste: 'Eingefügte Unterhaltung',

    // Articles
    articles_label: 'Artikel & Guides',
    articles_title: 'Guides zu Gaslighting, Manipulation und Erholung',
    articles_subtitle:
      'Kurze Artikel, um Muster zu erkennen, sicher auszusteigen, Trauer zu verarbeiten und gesündere Dynamiken aufzubauen.',
    articles_cta: 'Artikel lesen',
    articles_read_time_short: '5 Min. Lesezeit',
    articles_tag_awareness: 'Bewusstsein',
    articles_tag_howto: 'Anleitung',
    articles_tag_product: 'Zum Produkt',
    articles_tag_practice: 'Praxis',
    articles_tag_support: 'Unterstützung',
    articles_gaslighting_title: 'Gaslighting: typische Muster und Reaktionen',
    articles_gaslighting_description:
      'Beispiele für Realitätsverdrehung, Schuldverschiebung und sprachliche Hinweise, die oft auffallen.',
    articles_export_title: 'Chats sicher exportieren (Telegram & WhatsApp)',
    articles_export_description:
      'Schritt-für-Schritt-Tipps zu Formaten und wie sensible Daten geschützt bleiben.',
    articles_method_title: 'Wie unsere KI deine Nachrichten analysiert',
    articles_method_description:
      'Einfacher Überblick zu Scoring, Evidenz und warum Chats nicht dauerhaft gespeichert werden.',
    articles_toxic_title: 'Toxische Beziehungsmuster erkennen',
    articles_toxic_description:
      'Signale für Kritik, Kontrolle, Isolation und emotionale Achterbahn, die Sicherheit untergraben.',
    articles_steps_title: 'Praktische Schritte, solange die Beziehung läuft',
    articles_steps_description:
      'Realitätscheck, Probe-Grenzen, Sicherheitsplan und Körperpflege ohne direkte Eskalation.',
    articles_grief_title: 'Wie man das Ende einer schwierigen Beziehung betrauert',
    articles_grief_description:
      'Nichtlineare Trauerphasen nach toxischer Dynamik und Wege zu Stabilität und Sinn.',
    articles_manipulation_title: 'Wichtige Manipulationsarten in Beziehungen',
    articles_manipulation_description:
      'Emotionaler Druck, Gaslighting, Isolation, Grenzverletzungen und wie man Muster erkennt.',
    articles_covert_title: 'Verdeckter Narzissmus: Gefahr hinter Verletzlichkeit',
    articles_covert_description:
      'Wie stille Kränkung, Opferrolle und „Güte mit Bedingungen“ Kontrolle aufrechterhalten.',
    articles_letgo_title: 'Traumatische Bindung loslassen',
    articles_letgo_description:
      'Warum der Abschied schwer ist, wie man sich vorbereitet und Rückfälle meidet.',
    articles_consequences_title: 'Psychologische Folgen toxischer Bindungen',
    articles_consequences_description:
      'PTBS-ähnliche Symptome, Angst, Dissoziation und warum Körper und Geist Erholung brauchen.',
    articles_chances_title: 'Gibt es eine Chance für diese Beziehung?',
    articles_chances_description:
      'Wann Veränderung realistisch ist, welche Red Flags alles beenden und wie man sicher entscheidet.',
    articles_healthy_title: 'Gesunde Beziehungen sind nicht perfekt (und das ist okay)',
    articles_healthy_description:
      'Realistische Merkmale funktionierender Beziehungen statt Mythen makelloser Harmonie.',

    // Badges und Vorschaukarte im Hero
    hero_badge_patterns: 'Tiefe Musteranalyse',
    hero_badge_boundaries: 'Grenzen im Fokus',
    hero_badge_multilang: 'Mehrsprachige Chats',
    hero_preview_title: 'KI‑Scan der Konversation',
    hero_preview_subtitle: 'Fiktives Beispiel dafür, was der Detektor hervorhebt.',
    hero_preview_live: 'Live‑Vorschau',
    hero_preview_flag_title: 'Gaslighting‑Muster erkannt',
    hero_preview_flag_subtitle:
      'Realitätsverzerrung · Abwertung der Erfahrung · Schuldverschiebung',
    hero_preview_score_label: 'Index emotionaler Sicherheit',
    hero_preview_score_low: 'Niedrig',
    emotional_safety_medium: 'Mittel',
    emotional_safety_high: 'Hoch',
    hero_preview_typing: 'KI liest noch…',
    relationship_health_title: 'Beziehungsübersicht',

    // Datenschutz-Chips
    privacy_chip_no_sharing: 'Keine Veröffentlichung nach außen',
    privacy_chip_local_session: 'Nur in dieser Sitzung',
    privacy_chip_control: 'Sie behalten die Kontrolle',
    demo_metrics_banner:
      'Demo-Metriken nur aus dem Screenshot. Lade den vollständigen Chat-Export hoch, um genaue Werte zu erhalten.',
    activity_wave_by_day: 'Pro Tag',
    activity_wave_by_week: 'Pro Woche',

    // Beispielnachrichten im Vorschaublock
    // left = Täter, right = Opfer
    hero_preview_msg1_left: 'Du übertreibst schon wieder, so schlimm war es nicht.',
    hero_preview_msg1_right: 'Ich erinnere mich ganz anders daran. Du verdrehst immer alles.',
    hero_preview_msg2_left: 'Wenn du mich wirklich lieben würdest, würdest du das nicht so infrage stellen.',
    hero_preview_msg2_right: 'Ich möchte nur, dass wir ehrlich über das sprechen, was passiert ist.',
    hero_preview_msg3_left: 'Das habe ich nie gesagt, das bildest du dir wieder ein.',
    hero_preview_msg3_right: 'Ich habe die Nachrichten gespeichert. Warum leugnest du das immer?',
    hero_preview_msg4_left: 'Vielleicht liegt das Problem daran, wie empfindlich du bist.',
    hero_preview_msg4_right: 'Es geht nicht um Empfindlichkeit, sondern darum, was du gesagt hast.',
    hero_preview_msg5_left: 'Alle anderen finden mich völlig vernünftig – nur du beschwerst dich.',
    hero_preview_msg5_right: 'Ich versuche nicht, einen Streit anzufangen, ich will nur verstehen.',

    // Kurzes FAQ: warum und für wen
    faq_why:
      'Diese App hilft Ihnen, Kommunikationsmuster in Ihren Chats zu erkennen – nicht um Schuld zuzuweisen, sondern um besser zu verstehen, was zwischen Ihnen passiert ist.',
    faq_forWhom:
      'Sie richtet sich an Menschen, die nach einer Beziehung verwirrt sind, Manipulation oder Gaslighting vermuten oder einfach einen neutralen Außenblick auf ihren Kommunikationsstil wünschen.',
    faq_notSides:
      'Die Analyse ergreift keine Partei und sagt nicht, wer „recht“ oder „schuld“ hat – sie beschreibt Muster und zeigt Beispiele von beiden Seiten.',
    faq_notTherapy:
      'Dies ist keine Therapie, keine Diagnose und keine Rechtsberatung. Es ist eine KI-basierte Perspektive auf Ihre Nachrichten.',
    faq_goal:
      'Das Hauptziel ist, Reflexion und gegenseitiges Verständnis zu unterstützen – nicht neue Konflikte zu schüren oder als „Waffe" in Streitigkeiten zu dienen.',
    help_tooltip_label: 'Hilfe und Service-Informationen',
    help_tooltip_title: 'Über den Service',
    help_tooltip_close: 'Schließen',
    report_disclaimer_main:
      'Dieser Bericht wird von KI ausschließlich anhand der hochgeladenen Nachrichten erzeugt. Kontext kann fehlen; er sollte als eine Sichtweise verstanden werden, nicht als absolute Wahrheit.',
    report_disclaimer_safety:
      'Wenn Ihre Situation Gewalt, Selbstverletzung oder ein Gefühl von Gefahr beinhaltet, sollten Sie sich nicht nur auf diese App verlassen – wenden Sie sich an vertraute Personen oder professionelle Hilfe.',

    // Testimonials
    testimonials_label: 'ECHTE GESCHICHTEN, VERÄNDERTE PERSPEKTIVEN',
    testimonials_title: 'Menschen, die dies nutzten, um ihre Chats besser zu verstehen',
    testimonial_anna_name: '„Anna", 28',
    testimonial_anna_role: 'Nach langer Trennung',
    testimonial_anna_quote:
      'Ich hatte Screenshots und Meinungen von Freunden, aber das war das erste Mal, dass ich unsere ganze Unterhaltung ruhig ausgebreitet sah. Es half mir, aufzuhören, mich auf einen Streit zu fixieren und das größere Muster zu sehen.',
    testimonial_marco_name: '„Marco", 34',
    testimonial_marco_role: 'In neuer Beziehung',
    testimonial_marco_quote:
      'Ich nutzte es nicht, um meiner Partnerin etwas zu beweisen, sondern um meine eigenen Reaktionen zu überprüfen. Der Bericht zeigte, wo ich eskalierte oder mich verschloss – unangenehm, aber nützlich.',
    testimonial_lea_name: '„Lea", 31',
    testimonial_lea_role: 'Fragte sich, ob Gaslighting vorlag',
    testimonial_lea_quote:
      'Ich hatte Angst, es würde mich oder meinen Ex „verurteilen". Stattdessen fühlte es sich wie ein neutraler Spiegel an. Es sagte mir nicht, was ich tun sollte, aber es gab mir die Worte, um zu beschreiben, was ich fühlte.',
    testimonial_sara_name: '„Sara", 29',
    testimonial_sara_role: 'Nach toxischer Beziehung',
    testimonial_sara_quote:
      'Endlich hatte ich den Beweis, dass ich nicht verrückt war. Die Muster waren klar – ständige Widersprüche, Schuldverschiebung. Es gab mir das Vertrauen, weiterzugehen.',
    testimonial_david_name: '„David", 35',
    testimonial_david_role: 'Versucht sich zu verbessern',
    testimonial_david_quote:
      'Ich wollte verstehen, warum meine Beziehungen immer scheiterten. Die Analyse zeigte meine Kommunikationsmuster – defensiv, abweisend. Schwer zu hören, aber notwendig.',
    // Dashboard
    dashboard_title: 'Chronologie',
    heatmap_title: 'Aktivitäts-Heatmap',
    heatmap_description:
      'Konversationsintensität pro Woche. Rot hebt Perioden mit Konflikten oder bedeutsamen Ereignissen hervor.',
    calendar_title: 'Konversationskalender',
    calendar_description:
      'Wichtige Daten sind rot hervorgehoben. Bewegen Sie die Maus über Daten, um Details anzuzeigen.',
    // Tages-Aktivitätsdiagramm
    activity_chart_title: 'Aktivität nach Tagen',
    activity_chart_description:
      'Zeigt, an welchen Tagen mehr Nachrichten geschrieben wurden. Spitzen können mit Phasen von Spannung zusammenfallen.',
    activity_chart_messages_label: 'Nachrichten',
    activity_chart_color_hint:
      'Rot ≈ Tage mit heftigen Konflikten oder Manipulation.',
    important_dates_label: '🗓️ Wichtige Daten',
    important_date: 'Wichtiges Datum',
    important_dates_list_title: 'Wichtige Daten',
    message_intensity_label: 'Nachrichtenintensität',
    more_dates: 'weitere Daten',
    verdict_problematic: 'Problematisch',
    participant_profiles_title: '👥 Teilnehmerprofile',
    participant_profiles_description: 'Kurze Kommunikationsprofile für jeden Teilnehmer.',
    reality_check_title: '✅ Realitätscheck',
    reality_check_right: 'Was stimmte',
    reality_check_wrong: 'Was nicht stimmte',
    reality_check_whose: 'Wessen Wahrnehmung war zutreffend',
    hard_truth_title: '⚡ Harte Wahrheit',
    hard_truth_verdict: 'Urteil',
    hard_truth_abusive: 'Missbräuchliche Verhaltensweisen',
    hard_truth_abusive_label: 'Missbräuchlich',
    hard_truth_toxic_label: 'Toxisch',
    hard_truth_needs_work_label: 'Verbesserungsbedürftig',
    hard_truth_healthy_label: 'Gesund',
    what_you_should_know_title: '💡 Was du wissen solltest',
    wysk_could_have_done: 'Was man anders hätte tun können',
    wysk_comm_tools: 'Kommunikationstools',
    wysk_could_be_saved: 'Konnte die Beziehung gerettet werden',
    wysk_why_not_fault: 'Warum es nicht ganz deine Schuld ist',
    wysk_what_made_vulnerable: 'Was dich verwundbar machte',
    wysk_patterns_to_watch: 'Muster, auf die du achten solltest',
    wysk_resources: 'Ressourcen',
    wysk_red_flags_next: 'Warnsignale fürs nächste Mal',
    whats_next_kicker: 'Aktionsplan',
    whats_next_title: 'Wie geht es weiter?',
    whats_next_subtitle: 'Konkrete nächste Schritte auf Basis dieser Analyse.',
    whats_next_actions: 'Konkrete Schritte',
    whats_next_boundaries: 'Grenzen üben',
    whats_next_support: 'Unterstützung & Ressourcen',

    testimonial_yuki_name: '„Yuki", 27',
    testimonial_yuki_role: 'Fernbeziehung',
    testimonial_yuki_quote:
      'Wir stritten ständig per Text. Das half mir zu sehen, dass die meisten Konflikte mit Missverständnissen begannen, nicht mit Bosheit. Wir beide mussten besser kommunizieren.',
    testimonial_sofia_name: '„Sofia", 32',
    testimonial_sofia_role: 'Klarheit nach Scheidung',
    testimonial_sofia_quote:
      'Ich brauchte Abschluss. Jahre von Nachrichten zu lesen war überwältigend, aber die KI-Analyse hob die Schlüsselmuster hervor. Es ging nicht um Schuld – es ging um Verständnis.',
    testimonial_mia_name: '„Mia“, 26',
    testimonial_mia_role: 'Nach Monaten Trennungsgrübeln',
    testimonial_mia_quote:
      'Ich schrieb die Geschichte im Kopf ständig um. Die Zeitleiste mit Spitzen machte es weniger dramatisch, mehr faktisch. Ich konnte den Tab endlich schließen und schlafen.',
    testimonial_lucas_name: '„Lucas“, 29',
    testimonial_lucas_role: 'Mit in die Therapie gebracht',
    testimonial_lucas_quote:
      'Meine Therapeutin wollte Beispiele. Der Bericht zeigte jedes Mal, wenn ich mit Sarkasmus auswich. Unangenehm, aber es beschleunigte die Sitzung.',
    testimonial_priya_name: '„Priya“, 33',
    testimonial_priya_role: 'Co-Parenting-Nachrichten',
    testimonial_priya_quote:
      'Wir haben ein Kleinkind und die Emotionen kochen hoch. Das Tool markierte, wo sich Schuldzuweisungen einschlichen. So konnten wir einen ruhigeren Ablauf vor Übergaben vereinbaren.',
    testimonial_noah_name: '„Noah“, 31',
    testimonial_noah_role: 'Meine Defensive erkennen',
    testimonial_noah_quote:
      'Ich sagte immer „ich kläre nur“, aber das Muster war: unterbrechen und kleinreden. Jetzt übe ich, eine Antwort nach der anderen zu geben.',
    testimonial_amira_name: '„Amira“, 30',
    testimonial_amira_role: 'Missverständnisse auf Distanz',
    testimonial_amira_quote:
      'Wir verpassten ständig den Ton. Der dauerhafte Lauf zeigte, dass Schweigen meist Stress war, nicht Bosheit. Das senkte die Panik.',
    testimonial_elena_name: '„Elena“, 34',
    testimonial_elena_role: 'Jahre an Sprachnachrichten sortieren',
    testimonial_elena_quote:
      'Ich scheute mich, Stunden Audio neu zu hören. In Transkripten hintereinander sah ich die Muster, ohne alles erneut zu fühlen.',
    testimonial_tom_name: '„Tom“, 30',
    testimonial_tom_role: 'Konflikt-Schleifen verstehen',
    testimonial_tom_quote:
      'Ich dachte, ich bin „nur logisch“. Der Bericht zeigte die Schleife: Sarkasmus → Defensive → Mauer. Sie zu benennen half, sie zu brechen.',
    testimonial_zahra_name: '„Zahra“, 28',
    testimonial_zahra_role: 'Visa-Stress-Streits',
    testimonial_zahra_quote:
      'Wir waren vom Papierkram erschöpft. Die Timeline zeigte, jeder Peak kam nach E-Mails der Botschaft. So war „lass kurz pausieren“ einfacher.',
    testimonial_pedro_name: '„Pedro“, 37',
    testimonial_pedro_role: 'Vertrauen neu aufbauen',
    testimonial_pedro_quote:
      'Ich wollte Belege für Fortschritt. Monat für Monat weniger Schuldverschiebung zu sehen, war das erste messbare Zeichen.',
    testimonial_lina_name: '„Lina“, 25',
    testimonial_lina_role: 'Erste ernste Trennung',
    testimonial_lina_quote:
      'Ich scrollte nachts alte Chats. Die Zusammenfassung gab mir schneller Abschluss als alles erneut zu lesen.',
    testimonial_chen_name: '„Chen“, 33',
    testimonial_chen_role: 'Arbeits-Ton zuhause',
    testimonial_chen_quote:
      'Meine Partnerin sagte, ich bringe den Büro-Ton mit. Die Analyse zeigte, wie oft ich „jetzt nicht“ schrieb. Klein, aber es summiert sich.',
    testimonial_jasmine_name: '„Jasmine“, 29',
    testimonial_jasmine_role: 'Gemeinsamer Umzug',
    testimonial_jasmine_quote:
      'Jeder Streit fiel auf Umzugsstress. Auf der Timeline wurde klar: überfordert, nicht gegeneinander.',
    testimonial_omar_name: '„Omar“, 36',
    testimonial_omar_role: 'Nachtgrübler',
    testimonial_omar_quote:
      'Ich öffnete alte Chats um 2 Uhr. Die Zusammenfassung gab den Abschluss, den Scrollen nie brachte.',
    testimonial_julia_name: '„Julia“, 27',
    testimonial_julia_role: 'Love-Bombing erkennen',
    testimonial_julia_quote:
      'Das Muster „große Versprechen, dann weg“ sprang ins Auge. Es war nicht eingebildet.',
    testimonial_mateo_name: '„Mateo“, 31',
    testimonial_mateo_role: 'Entschuldigen lernen',
    testimonial_mateo_quote:
      'Ich dachte, „sorry, dass du das so siehst“ reicht. Als es markiert wurde, habe ich echte Entschuldigungen geübt.',

    // Nutzungsbedingungen
    terms_title: 'Nutzungsbedingungen',
    privacy_title: 'Datenschutzrichtlinie',
    refund_title: 'Rückerstattungsrichtlinie',
    pricing_title: 'Preise',
    paddle_buy_label: 'Vollständigen Bericht kaufen',
    paddle_status_loading: 'Checkout wird geladen…',
    paddle_status_verifying: 'Zahlung wird geprüft…',
    paddle_status_opening: 'Sicherer Checkout wird geöffnet…',
    paddle_status_unlocked: 'Premium freigeschaltet!',
    paddle_error_missing_token: 'Paddle-Client-Token fehlt',
    paddle_error_token_missing: 'Token fehlt in der Antwort',
    paddle_error_unlock: 'Premium konnte nicht freigeschaltet werden',
    paddle_error_not_ready: 'Paddle noch nicht bereit',
    paddle_error_start: 'Checkout konnte nicht gestartet werden',
    paddle_error_txn_missing: 'Transaktions-ID fehlt',
    terms_intro:
      'Diese Nutzungsbedingungen ("Bedingungen") regeln Ihre Nutzung der Webanwendung Texte mit meinem Ex ("Service"). Durch den Zugriff auf oder die Nutzung des Service stimmen Sie zu, an diese Bedingungen gebunden zu sein.',
    terms_section1_title: '1. Servicebeschreibung',
    terms_section1_content:
      'Texte mit meinem Ex ist ein anonymes, KI-gestütztes Analysetool, das es Ihnen ermöglicht, Chat-Exporte (z. B. Telegram oder WhatsApp) hochzuladen und einen automatisierten Bericht über Kommunikationsmuster zu erhalten. Es ist keine Therapie, Rechtsberatung oder Krisendienst.',
    terms_section2_title: '2. Berechtigung und Nutzung',
    terms_section2_content:
      'Sie dürfen den Service nur nutzen, wenn Sie mindestens 18 Jahre alt sind und rechtlich in der Lage sind, diese Bedingungen einzugehen. Sie sind dafür verantwortlich sicherzustellen, dass Sie das Recht haben, die Chats, die Sie an den Service übermitteln, hochzuladen und zu verarbeiten.',
    terms_section3_title: '3. Datenverarbeitung und Datenschutz',
    terms_section3_content:
      'Chats laufen über HTTPS und werden serverseitig entschlüsselt, damit die KI den Bericht erzeugen kann; Ende-zu-Ende-Verschlüsselung gibt es nicht. Der Zugriff ist auf Serviceprozesse und Modellanbieter beschränkt. Aufbewahrung ist kurz: Progress/Jobs bis ~2 Stunden, gecachte Analysen bis ~24 Stunden, temporäre Dateien werden beim Aufräumen entfernt. Die lokale Liste „Letzte Analysen“ (id + kurze Zusammenfassung) liegt ~24 Stunden auf deinem Gerät in localStorage/Cookies und lässt sich über den Button oder durch Löschen von Cookies/localStorage entfernen. Daten werden nicht zum Training von Drittmodellen genutzt. Details stehen in der Datenschutzerklärung.',
    terms_section4_title: '4. Zahlungen und Abonnements',
    terms_section4_content:
      'Bestimmte Funktionen können gegen Gebühr angeboten werden (z. B. Premium-Analyse oder Medienanalyse). Zahlungen werden über unser Zahlungssystem verarbeitet. Preise, Abrechnungsintervalle und Rückerstattungsregeln werden an der Kasse angezeigt und können von Zeit zu Zeit aktualisiert werden.',
    terms_section5_title: '5. Keine Garantien',
    terms_section5_content:
      'Die Analyse wird von großen Sprachmodellen generiert und kann unvollständig, ungenau sein oder Vorurteile widerspiegeln, die diesen Modellen innewohnen. Wir garantieren nicht die Genauigkeit, Vollständigkeit oder Eignung einer Analyse für Ihre spezielle Situation.',
    terms_section6_title: '6. Verbotene Nutzung',
    terms_section6_content:
      'Sie stimmen zu, den Service nicht für rechtswidrige Zwecke zu nutzen, die Rechte anderer zu verletzen oder Inhalte hochzuladen, die geistiges Eigentum, Privatsphäre oder andere Rechte Dritter verletzen.',
    terms_section7_title: '7. Haftungsbeschränkung',
    terms_section7_content:
      'Im maximal zulässigen Umfang haften Texte mit meinem Ex und seine Betreiber nicht für indirekte, zufällige, besondere, Folgeschäden oder Strafschäden, die sich aus Ihrer Nutzung des Service ergeben oder damit zusammenhängen.',
    terms_section8_title: '8. Änderungen dieser Bedingungen',
    terms_section8_content:
      'Wir können diese Bedingungen von Zeit zu Zeit aktualisieren. Das Datum der "letzten Aktualisierung" oben auf dieser Seite zeigt an, wann Änderungen wirksam werden. Ihre fortgesetzte Nutzung des Service nach Änderungen bedeutet, dass Sie die aktualisierten Bedingungen akzeptieren.',
    terms_section9_title: '9. Kontakt',
    terms_section9_content:
      'Wenn Sie Fragen zu diesen Bedingungen oder dem Service haben, kontaktieren Sie uns bitte unter spinnermining@gmail.com.',
    legal_label: 'Rechtliches',
    legal_last_updated: 'Zuletzt aktualisiert:',
    privacy_intro:
      'Texts with My Ex ist für kurzlebige, anonyme Analysen gebaut. Wir verarbeiten nur die Daten, die du hochlädst, um deinen Bericht zu liefern, und löschen sie anschließend schnell. Wir erstellen keine Nutzerkonten.',
    privacy_collect_title: 'Was wir sammeln',
    privacy_collect_item1: 'Chat-Exporte und optionale Medien, die du für die Analyse hochlädst.',
    privacy_collect_item2: 'Fortschritts-Metadaten (z. B. Job-Status), die vorübergehend gespeichert werden, um deinen Bericht abzuschließen.',
    privacy_collect_item3: 'Einfache Analytik und Rate-Limit-Signale (IP, User Agent), um den Dienst stabil zu halten.',
    privacy_use_title: 'Wie wir deine Daten nutzen',
    privacy_use_item1: 'Um die KI-Analyse auszuführen und deinen Bericht zu erstellen.',
    privacy_use_item2: 'Um Fehler zu beheben und Missbrauch zu verhindern.',
    privacy_use_item3: 'Niemals, um Drittmodelle zu trainieren oder Werbeprofile zu erstellen.',
    privacy_retention_title: 'Aufbewahrung',
    privacy_retention_text:
      'Analysejobs und zwischengespeicherte Daten sind kurzlebig (in der Regel unter 24 Stunden) und werden bei der Bereinigung automatisch entfernt. Hochgeladene Dateien im Blob-Speicher werden regelmäßig bereinigt. Wir behalten keine langfristige Kopie deiner Unterhaltungen.',
    privacy_payment_title: 'Zahlungsdaten',
    privacy_payment_text:
      'Zahlungen werden von Paddle verarbeitet. Wir speichern keine Kartendaten. Paddle kann Abrechnungs- und Betrugspräventionssignale gemäß deren Datenschutzrichtlinie erfassen.',
    privacy_choices_title: 'Deine Optionen',
    privacy_choices_item1: 'Du kannst deine Daten löschen, indem du die Seite schließt; gespeicherte Artefakte laufen automatisch ab.',
    privacy_choices_item2: 'Lade keine Inhalte hoch, zu deren Weitergabe du nicht berechtigt bist.',
    privacy_choices_item3: 'Nutze eine datenschutzfreundliche Browsersitzung, wenn du keine lokale Token-Speicherung möchtest.',
    privacy_contact_title: 'Kontakt',
    privacy_contact_text_prefix: 'Fragen zum Datenschutz? Schreib an',
    privacy_contact_text_suffix: '.',
    refund_intro:
      'Premium-Zugang ist ein einmaliger Kauf für einen vollständigen Analysebericht. Da der Bericht sofort mit KI-Ressourcen erzeugt wird, sind alle Verkäufe endgültig, sobald die Zahlung abgeschlossen ist.',
    refund_no_refunds_title: 'Wann keine Rückerstattung möglich ist',
    refund_no_refunds_item1: 'Meinungsänderung nach Lieferung des Berichts.',
    refund_no_refunds_item2: 'Unzufriedenheit mit dem KI-Ergebnis (der Service erfolgt nach bestem Bemühen und ist keine garantierte Beratung).',
    refund_no_refunds_item3: 'Versuch, denselben Kauf für mehrere unabhängige Analysen zu verwenden.',
    refund_issue_title: 'Wenn etwas schiefgeht',
    refund_issue_item1: 'Falls der Bericht nach der Zahlung nicht generiert wird, kontaktiere uns innerhalb von 7 Tagen.',
    refund_issue_item2: 'Wir versuchen, die Analyse erneut auszuführen; falls das nicht möglich ist, prüfen wir eine Rückerstattung.',
    refund_issue_item3: 'Bitte gib deine Paddle-Transaktions-ID und die beim Checkout angezeigte E-Mail oder Metadaten an.',
    refund_contact_title: 'So kontaktierst du uns',
    refund_contact_text_prefix: 'Schreib an',
    refund_contact_text_suffix: 'mit deiner Transaktions-ID und einer kurzen Problembeschreibung. Wir antworten so schnell wie möglich.',
    pricing_badge_text: 'Einmalzahlung, kein Abo',
    pricing_description:
      'Starte eine kostenlose Vorschau, um deine Scores und die Übersicht zu sehen. Schalte den vollständigen Bericht und Exporte mit einem einzigen, sicheren Paddle-Checkout frei.',
    pricing_overlay_title: 'Aktuell kostenlos',
    pricing_overlay_description:
      'Die Preise sind vorübergehend ausgeblendet und der gesamte Zugang ist kostenlos. Schau später noch einmal vorbei.',
    pricing_overlay_cta: 'Zurück zur Startseite',
    pricing_free_label: 'Vorschau',
    pricing_free_price_label: 'Kostenlos',
    pricing_free_badge: 'Hier starten',
    pricing_free_description:
      'Sieh dir Spitzenwerte und eine kurze Übersicht an, bevor du zahlst. Gut für einen schnellen Eindruck.',
    pricing_free_item1: 'Lade eine Unterhaltung hoch und verarbeite sie',
    pricing_free_item2: 'Sieh Haupt-Scores und eine kurze Zusammenfassung',
    pricing_free_item3: 'Einfache Aktivitäts-Timeline',
    pricing_free_cta: 'Kostenlose Vorschau starten',
    pricing_premium_label: 'Premium-Bericht',
    pricing_price_unit: 'einmalig',
    pricing_premium_description:
      'Schalte den vollständigen KI-Bericht, Beweise, Teilnehmerprofile und alle Exportoptionen frei. Keine wiederkehrenden Kosten.',
    pricing_premium_item1: 'Vollständige Beweis- und Musterauflistung',
    pricing_premium_item2: 'Profile, Insights und Abschlussbereich für Teilnehmer',
    pricing_premium_item3: 'Export als TXT / JSON / PDF',
    pricing_premium_item4: 'Priorisierte Analyse-Einstellungen, wo verfügbar',
    pricing_premium_cta: 'Vollständigen Bericht kaufen',
    pricing_checkout_note:
      'Der Checkout läuft über Paddle. Endpreis und Währung werden vor der Zahlung bestätigt.',
    pricing_what_you_get_title: 'Was du bekommst',
    pricing_what_evidence_title: 'Volle Beweise',
    pricing_what_evidence_text:
      'Konkrete Nachrichtenauszüge, Mustererklärungen und tägliche Aktivitätsdiagramme.',
    pricing_what_exports_title: 'Exporte',
    pricing_what_exports_text:
      'Lade deinen Bericht als TXT, JSON oder PDF für Offline-Nutzung und Teilen herunter.',
    pricing_what_onetime_title: 'Einmaliger Zugang',
    pricing_what_onetime_text:
      'Kein Abo. Jeder Premium-Kauf schaltet einen vollständigen Bericht für deine aktuelle Analyse frei.',
    pricing_help_text_prefix: 'Brauchst du Hilfe bei der Abrechnung? Schreib an',
    pricing_help_text_suffix: '.',
    donation_beta_label: 'Beta',
    donation_title: 'Entwickler unterstützen',
    donation_text: 'Wenn dir dieser Bericht geholfen hat, freue ich mich über eine kleine Spende. Danke für deine Unterstützung!',
    donation_crypto_only: 'Nur Krypto',
    donation_show_qr: 'QR anzeigen',
    donation_qr_for_wallet: 'QR für Wallet',
    donation_close: 'Schließen',
    pdf_safety_concern_title: '🛟 Sicherheitsproblem',
    pdf_safety_concern_intro: 'Was über toxisch hinausgeht:',
    pdf_safety_resources: 'Ressourcen',
    pdf_closure_title: '🎯 Abschluss',
    pdf_closure_right: 'Worin er/sie recht hatte',
    pdf_closure_deserved: 'Was verdient war',
    pdf_closure_got: 'Was erhalten wurde',
    pdf_closure_permission: 'Erlaubnis, weiterzugehen',
    pdf_closure_end: 'Abschließende Aussage',
    install_app: 'App installieren',
    install_app_instructions: 'So installieren Sie diese App:',
    install_app_chrome: 'Chrome/Edge: Klicken Sie auf das Installationssymbol in der Adressleiste oder gehen Sie zu Menü → App installieren',
    install_app_safari: 'Safari (iOS): Tippen Sie auf Teilen → Zum Home-Bildschirm hinzufügen',
    install_app_firefox: 'Firefox: Noch nicht unterstützt'
  }
};
