import type { LocaleBundle } from '../types';

export const deBundle: LocaleBundle = {
  locale: 'de',
  displayName: 'Deutsch',
  messages: {
    appName: 'Texte mit meinem Ex',
    appTagline: 'Ein ehrlicher Blick auf das, was passiert ist.',
    hero_tagline: 'Ein ehrlicher KI-Blick auf das, was passiert ist.',
    hero_tagline_alt1: 'Unter der Haube: KI und Wissenschaft statt Drama.',
    hero_tagline_alt2: 'Verhalten, Bindung und Konflikte — KI-analytisch ausgewertet.',
    hero_cta: 'Konversation mit KI analysieren',
    hero_copy: 'Laden Sie Ihre Chats hoch, um eine unparteiische, KI-gestützte Beziehungsanalyse zu erhalten.',
    footer_disclaimer: 'Keine Therapie, kein Klatsch — nur KI-Klarheit.',
    language_label: 'Sprache',
    uploadExport: 'Chat-Export hochladen',
    uploadExportDescription: 'Wählen Sie Ihre Chat-Exportdatei aus, um mit der Analyse zu beginnen',
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
      'Wir führen alle Abschnitte, Diagramme und Antwortempfehlungen zusammen. Dieser letzte Schritt kann bis zu einer Minute dauern – bitte etwas Geduld.',
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
    fileUploadHelp:
      'Aktuelle Version funktioniert am besten mit kleinen Text-/JSON-Exports. Kostenlos: nur .json und .txt. Premium: .zip mit Medienanalyse folgt in der nächsten Version.',
    premium_badge: 'Premium',
    free_badge: 'Kostenlos',
    premium_hint:
      'Premium-Analyse mit tieferen psychologischen Einsichten, mehr Beweisbeispielen und Medien, wo verfügbar.',
    free_hint:
      'Kostenlose Analyse — nur Text (bis 50k Nachrichten), ohne Medienanalyse oder erweiterten Deep-Dive-Modus.',
    premium_progress_hint:
      'Premium-Analyse läuft: tiefere Prompts, Medienverarbeitung, Generierung von Teilnehmerprofilen und empfohlenen Antworten.',
    free_progress_hint:
      'Kostenlose Analyse läuft: reine Textübersicht. Für Medien, Teilnehmerprofile, empfohlene Antworten und Aktivitätsdiagramme auf Premium upgraden.',
    progress_premium_features_profiles: 'Generierung psychologischer Teilnehmerprofile',
    progress_premium_features_replies: 'Erstellung von Beispielen gesunder Antworten',
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
    platform_generic: 'TXT / andere Quelle',
    recommended: 'Empfohlen',
    selectFile: 'Datei auswählen',
    clickToSelectFile: 'Klicken Sie, um eine Datei auszuwählen',
    ready: 'Bereit',
    uploadAndAnalyze: 'Hochladen & Analysieren',
    inputMode_upload: 'Export hochladen',
    inputMode_paste: 'Text einfügen',
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
    exportOverview: 'Übersicht',
    exportScores: 'Punktzahlen',
    exportPatterns: 'Muster',
    exportEvidence: 'Beweise',
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

    // Datenschutz-Chips
    privacy_chip_no_sharing: 'Keine Veröffentlichung nach außen',
    privacy_chip_local_session: 'Nur in dieser Sitzung',
    privacy_chip_control: 'Sie behalten die Kontrolle',

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
    dashboard_title: 'Analyse-Dashboard',
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
    important_dates_label: 'Wichtige Daten',
    important_date: 'Wichtiges Datum',
    important_dates_list_title: 'Wichtige Daten',
    message_intensity_label: 'Nachrichtenintensität',
    more_dates: 'weitere Daten',

    testimonial_yuki_name: '„Yuki", 27',
    testimonial_yuki_role: 'Fernbeziehung',
    testimonial_yuki_quote:
      'Wir stritten ständig per Text. Das half mir zu sehen, dass die meisten Konflikte mit Missverständnissen begannen, nicht mit Bosheit. Wir beide mussten besser kommunizieren.',
    testimonial_sofia_name: '„Sofia", 32',
    testimonial_sofia_role: 'Klarheit nach Scheidung',
    testimonial_sofia_quote:
      'Ich brauchte Abschluss. Jahre von Nachrichten zu lesen war überwältigend, aber die KI-Analyse hob die Schlüsselmuster hervor. Es ging nicht um Schuld – es ging um Verständnis.',

    // Nutzungsbedingungen
    terms_title: 'Nutzungsbedingungen',
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
      'Wir verarbeiten Ihre hochgeladenen Chats vorübergehend zum Zweck der Generierung eines Analyseberichts. Hochgeladene Daten und generierte Berichte werden nicht länger gespeichert, als es zur Bereitstellung des Service erforderlich ist, und werden nicht zum Training von Drittmodellen verwendet. Weitere Details finden Sie in unserer Datenschutzerklärung (wenn verfügbar).',
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
      'Wenn Sie Fragen zu diesen Bedingungen oder dem Service haben, kontaktieren Sie uns bitte über die auf der Hauptseite oder in der App angegebenen Kontaktdaten.',
    donation_beta_label: 'Beta',
    donation_title: 'Entwickler unterstützen',
    donation_text: 'Wenn dir dieser Bericht geholfen hat, freue ich mich über eine kleine Spende. Danke für deine Unterstützung!',
    donation_crypto_only: 'Nur Krypto',
    donation_show_qr: 'QR anzeigen',
    donation_qr_for_wallet: 'QR für Wallet',
    donation_close: 'Schließen',
    install_app: 'App installieren',
    install_app_instructions: 'So installieren Sie diese App:',
    install_app_chrome: 'Chrome/Edge: Klicken Sie auf das Installationssymbol in der Adressleiste oder gehen Sie zu Menü → App installieren',
    install_app_safari: 'Safari (iOS): Tippen Sie auf Teilen → Zum Home-Bildschirm hinzufügen',
    install_app_firefox: 'Firefox: Noch nicht unterstützt'
  }
};
