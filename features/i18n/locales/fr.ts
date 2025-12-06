import type { LocaleBundle } from '../types';

export const frBundle: LocaleBundle = {
  locale: 'fr',
  displayName: 'Français',
  messages: {
    appName: 'Textes avec mon ex',
    appTagline: "Un regard honnête sur ce qui s'est passé.",
    hero_tagline: "Un regard honnête de l'IA sur ce qui s'est passé.",
    hero_tagline_alt1: 'Sous le capot : IA et science, pas drama.',
    hero_tagline_alt2: 'Données de comportement, attachement et conflits — décodés par IA pour vous.',
    hero_cta: 'Analyser la conversation avec IA',
    hero_copy: 'Téléchargez vos conversations pour obtenir une analyse impartiale des relations alimentée par IA.',
    hero_confidential: 'Totalement confidentiel.',
    footer_disclaimer: 'Pas de thérapie, pas de commérages — juste de la clarté IA.',
    language_label: 'Langue',
    uploadExport: "Télécharger l'export de chat",
    uploadExportDescription: 'Sélectionnez votre fichier d\'export de chat pour commencer l\'analyse',
    uploadingFile: 'Téléchargement du fichier...',
    importSuccessful: 'Importation réussie',
    importFailed: 'Échec de l\'importation',
    analysisFailed: 'Échec de l\'analyse',
    failedToStartAnalysis: 'Échec du démarrage de l\'analyse',
    failedToUploadFile: 'Échec du téléchargement du fichier vers le stockage',
    errorOccurred: 'Une erreur s\'est produite',
    analyzing: "L'IA analyse la conversation...",
    progress_starting: "Initialisation de l'analyse IA...",
    progress_parsing: 'Analyse de la conversation...',
    progress_analyzing: "L'IA analyse les modèles de conversation...",
    progress_media: "L'IA analyse le contenu multimédia...",
    progress_chunking: 'Traitement des segments de conversation...',
    progress_finalizing: "L'IA finalise le rapport...",
    progress_completed: "Analyse IA terminée !",
    progress_error: "L'analyse IA a échoué",
    progress_analyzing_hint: "L'IA analyse les modèles, les styles de communication et la dynamique relationnelle...",
    progress_media_hint: "Analyse des images, autocollants et contenus multimédias avec les modèles de vision IA...",
    progress_finalizing_hint:
      'Assemblage des sections, graphiques et réponses recommandées. Cette dernière étape peut prendre jusqu’à une minute — merci de patienter.',
    progress_chunk_label: 'Segment {current} sur {total}',
    progress_disclaimer: "Veuillez ne pas fermer cette fenêtre pendant l'analyse.",
    backToHome: "Retour à l'accueil",
    noAnalysisFound: "Aucune analyse trouvée. Veuillez d'abord télécharger une conversation.",
    noAnalysisFound_help:
      "Revenez à la page d'accueil, téléchargez l'export de votre conversation et attendez la fin de l'analyse pour voir le rapport.",
    analysisReport: "Rapport d'analyse IA",
    gaslightingRisk: 'Risque de manipulation',
    conflictIntensity: 'Intensité des conflits',
    supportiveness: 'Comportement de soutien',
    apologyFrequency: 'Taux de résolution des conflits',
    evidence: 'Preuves',
    scientificAnalysis: 'Analyse scientifique',
    plainLanguage: 'En langage simple',
    score: 'Score',
    section_gaslighting: 'Risque de manipulation',
    section_conflictIntensity: 'Intensité des conflits',
    section_supportiveness: 'Comportement de soutien',
    section_apologyFrequency: 'Taux de résolution des conflits',
    section_redFlags: 'Signaux d\'alarme',
    section_conflict: 'Intensité des conflits',
    section_support: 'Comportement de soutien',
    section_apology: 'Fréquence des excuses',
    imported: 'Importé',
    messages: 'messages',
    privacyNote: 'Vos données sont traitées de manière éphémère et ne sont jamais stockées de façon permanente.',
    fileUploadHelp:
      'La version actuelle fonctionne mieux avec de petits exports texte/json. Gratuit : uniquement .json et .txt. Premium : .zip avec analyse des médias arrivera dans la prochaine version.',
    premium_badge: 'Premium',
    free_badge: 'Gratuit',
    premium_hint:
      "Analyse premium avec des insights psychologiques plus profonds, davantage d'exemples de preuves et prise en compte des médias lorsque disponible.",
    free_hint:
      "Analyse gratuite — uniquement texte (jusqu'à 50k messages), sans analyse des médias ni mode d'analyse approfondie.",
    premium_progress_hint:
      "Analyse premium en cours : prompts plus profonds, traitement des médias, génération de profils participants et réponses recommandées.",
    free_progress_hint:
      "Analyse gratuite en cours : vue d'ensemble textuelle. Passez en premium pour les médias, profils participants, réponses recommandées et graphiques d'activité.",
    progress_premium_features_profiles: 'Génération de profils psychologiques des participants',
    progress_premium_features_replies: 'Création d\'exemples de réponses saines',
    progress_premium_features_activity: 'Construction du graphique d\'activité quotidienne',
    selectPlatform: 'Sélectionner la plateforme',
    platform_auto: 'Détection automatique',
    platform_telegram: 'Telegram',
    platform_whatsapp: 'WhatsApp',
    platform_signal: 'Signal',
    platform_discord: 'Discord',
    platform_messenger: 'Facebook Messenger',
    platform_imessage: 'iMessage',
    platform_viber: 'Viber',
    platform_generic: 'TXT libre / Autre',
    recommended: 'Recommandé',
    selectFile: 'Sélectionner le fichier',
    clickToSelectFile: 'Cliquez pour sélectionner un fichier',
    ready: 'Prêt',
    uploadAndAnalyze: 'Télécharger et analyser',
    inputMode_upload: "Télécharger l'export",
    inputMode_paste: 'Coller le texte',
    pasteLabel: 'Collez un court extrait de votre conversation',
    pastePlaceholder:
      'Collez ici des messages (court extrait uniquement, pas une conversation de plusieurs années)...',
    pasteHelp:
      "Fonctionne mieux avec de petits extraits. Pour des historiques longs, utilisez l'export de chat.",
    analyzePasted: 'Analyser le texte collé',
    paste_error_empty: "Veuillez d'abord coller un texte de conversation.",
    paste_error_too_long:
      "Le texte collé est trop long. Utilisez un extrait plus court (jusqu'à 8000 caractères).",
    paste_error_not_conversation:
      "Ce texte ne ressemble pas à une conversation mais à une suite aléatoire. Collez un véritable extrait de discussion.",
    exportTXT: 'Exporter TXT',
    exportJSON: 'Exporter JSON',
    exportPDF: 'Exporter PDF',
    exportReportTitle: "Rapport d'analyse",
    exportGeneratedBy: 'Créé avec "Texts With my Ex" - AI Gaslight Detection App',
    exportDate: 'Date',
    exportOverview: "🔍 Vue d'ensemble",
    exportScores: '📊 Scores',
    exportPatterns: '📌 Modèles',
    exportEvidence: '🧾 Preuves',
    analysisDefaultOverview: 'Analyse terminée. Consultez les sections pour des informations détaillées.',
    analysisDefaultNoPatterns: 'Analyse terminée. Aucun modèle spécifique détecté dans cet extrait.',
    analysisDefaultTitle: 'Analyse',
    analysisParseError: 'Analyse terminée avec des résultats partiels en raison d\'une erreur d\'analyse.',
    analysisEmptySummary: 'Analyse terminée. Aucun modèle spécifique détecté dans cette section.',
    analysisGenericWarningTitle:
      "Il semble que l’IA ait renvoyé uniquement un résumé générique sans exemples concrets.",
    analysisGenericWarningBody:
      'Veuillez relancer l’analyse. Si le problème persiste, essayez de diviser la conversation en extraits plus courts.',
    showDetails: 'Afficher les détails',
    hideDetails: 'Masquer les détails',

    // Aide à l'export de chats
    exportHelpTitle: "Comment exporter vos conversations",
    exportHelpTelegram:
      'Telegram (ordinateur) : ouvrez le chat → menu → « Exporter l’historique du chat » → choisissez JSON ou texte, puis importez le fichier ici.',
    exportHelpWhatsApp:
      'WhatsApp (téléphone) : ouvrez le chat → menu → « Exporter le chat » → choisissez Sans médias (plus rapide) ou Avec médias, envoyez‑vous le fichier puis importez‑le ici.',
    exportHelpOther:
      "Pour Signal, Discord, Facebook Messenger, iMessage/SMS ou Viber, exportez le chat en fichier texte/JSON (ou ZIP) via l'application ou un exporteur de confiance, puis importez ce fichier.",

    // Comment ça marche
    howItWorks: 'Comment ça marche',
    step1_title: 'Téléchargez votre conversation',
    step1_description: 'Exportez votre conversation depuis Telegram ou WhatsApp et téléchargez-la ici. Vos données sont traitées en toute sécurité et ne sont jamais stockées.',
    step2_title: 'Analyse IA',
    step2_description: 'Notre IA analyse les modèles de communication, détecte les comportements de gaslighting et identifie la dynamique relationnelle en utilisant des méthodes scientifiques.',
    step3_title: 'Obtenez des insights',
    step3_description: "Recevez un rapport complet avec des scores, des preuves et des explications pour vous aider à comprendre ce qui s'est vraiment passé.",
    howItWorks_subtitle: '3 étapes rapides, puis l\'IA fait le gros du travail pour vous.',

    // Badges et carte de prévisualisation dans le héros
    hero_badge_patterns: 'Analyse approfondie des schémas',
    hero_badge_boundaries: 'Les limites d’abord',
    hero_badge_multilang: 'Chats multilingues',
    hero_preview_title: 'Scan de conversation par IA',
    hero_preview_subtitle: 'Exemple fictif de ce que le détecteur met en avant.',
    hero_preview_live: 'Prévisualisation en direct',
    hero_preview_flag_title: 'Schéma de gaslighting détecté',
    hero_preview_flag_subtitle:
      'Distorsion de la réalité · Minimisation de l’expérience · Renversement de culpabilité',
    hero_preview_score_label: 'Indice de sécurité émotionnelle',
    hero_preview_score_low: 'Faible',
    emotional_safety_medium: 'Moyen',
    emotional_safety_high: 'Élevé',
    hero_preview_typing: "L’IA lit encore…",

    // Pastilles de confidentialité
    privacy_chip_no_sharing: 'Rien n’est publié en ligne',
    privacy_chip_local_session: 'Uniquement pour cette session',
    privacy_chip_control: 'Vous gardez le contrôle',

    // Messages d’exemple dans le chat de prévisualisation
    // left = abuseur, right = victime
    hero_preview_msg1_left: 'Tu dramatises encore, ce n’était pas si grave.',
    hero_preview_msg1_right: 'Je m’en souviens complètement autrement. Tu déformes toujours tout.',
    hero_preview_msg2_left: 'Si tu m’aimais vraiment, tu ne remettrais pas tout en question comme ça.',
    hero_preview_msg2_right: 'Je veux juste qu’on parle honnêtement de ce qui s’est passé.',
    hero_preview_msg3_left: 'Je n’ai jamais dit ça, tu inventes encore.',
    hero_preview_msg3_right: 'J’ai les messages sauvegardés. Pourquoi tu nies toujours tout ?',
    hero_preview_msg4_left: 'Peut‑être que le problème, c’est à quel point tu es sensible.',
    hero_preview_msg4_right: 'Ce n’est pas une question de sensibilité, c’est ce que tu as dit.',
    hero_preview_msg5_left: 'Tout le monde trouve que je suis raisonnable, il n’y a que toi qui te plains.',
    hero_preview_msg5_right: 'Je n’essaie pas de créer un conflit, je veux juste comprendre.',

    // Court FAQ : pourquoi et pour qui
    faq_why:
      "Cette application vous aide à voir les modèles de communication dans vos conversations — pas pour désigner un coupable, mais pour mieux comprendre ce qui s’est passé entre vous.",
    faq_forWhom:
      "Elle s’adresse aux personnes perdues après une relation, qui suspectent de la manipulation ou du gaslighting, ou qui veulent simplement un regard extérieur neutre sur leur façon de communiquer.",
    faq_notSides:
      "L’analyse ne prend pas parti et ne dit pas qui a « raison » ou « tort » — elle décrit des modèles et donne des exemples des deux côtés.",
    faq_notTherapy:
      "Ce n’est ni une thérapie, ni un diagnostic, ni un conseil juridique. C’est un point de vue basé sur l’IA à partir de vos messages.",
    faq_goal:
      "L'objectif principal est d'aider à la réflexion et à la compréhension mutuelle, pas de lancer de nouveaux conflits ni de servir d'arme dans les disputes.",
    help_tooltip_label: 'Aide et informations sur le service',
    help_tooltip_title: 'À propos du service',
    help_tooltip_close: 'Fermer',
    report_disclaimer_main:
      "Ce rapport est généré par IA uniquement à partir des messages que vous avez fournis. Il peut manquer de contexte et doit être vu comme une perspective parmi d’autres, pas comme une vérité absolue.",
    report_disclaimer_safety:
      "Si votre situation implique de la violence, de l'automutilation ou si vous ne vous sentez pas en sécurité, ne vous appuyez pas uniquement sur cette application — contactez des proches ou un soutien professionnel.",

    // Témoignages
    testimonials_label: 'VRAIES HISTOIRES, PERSPECTIVES CHANGÉES',
    testimonials_title: 'Des personnes qui ont utilisé ce service pour mieux comprendre leurs conversations',
    testimonial_anna_name: '« Anna », 28 ans',
    testimonial_anna_role: 'Après une longue rupture',
    testimonial_anna_quote:
      'J\'avais des captures d\'écran et des avis d\'amis, mais c\'est la première fois que j\'ai vu toute notre conversation posée calmement. Ça m\'a aidée à arrêter de m\'obséder sur une dispute et à voir le schéma plus large.',
    testimonial_marco_name: '« Marco », 34 ans',
    testimonial_marco_role: 'Dans une nouvelle relation',
    testimonial_marco_quote:
      'Je l\'ai utilisé non pas pour prouver quelque chose à ma partenaire, mais pour vérifier mes propres réactions. Le rapport a montré où j\'escaladais ou me fermais, ce qui était inconfortable — mais utile.',
    testimonial_lea_name: '« Lea », 31 ans',
    testimonial_lea_role: 'Questionnant la manipulation',
    testimonial_lea_quote:
      'J\'avais peur que ça me "juge" ou mon ex. Au lieu de ça, ça ressemblait à un miroir neutre. Ça ne m\'a pas dit quoi faire, mais ça m\'a donné les mots pour décrire ce que je ressentais.',
    testimonial_sara_name: '« Sara », 29 ans',
    testimonial_sara_role: 'Après une relation toxique',
    testimonial_sara_quote:
      'Enfin, j\'avais la preuve que je n\'étais pas folle. Les schémas étaient clairs — contradictions constantes, renversement de responsabilité. Ça m\'a donné la confiance pour avancer.',
    testimonial_david_name: '« David », 35 ans',
    testimonial_david_role: 'Essayant de s\'améliorer',
    testimonial_david_quote:
      'Je voulais comprendre pourquoi mes relations échouaient toujours. L\'analyse a montré mes schémas de communication — défensif, dédaigneux. Difficile à entendre, mais nécessaire.',
    // Dashboard
    dashboard_title: 'Tableau de bord d\'analyse',
    heatmap_title: 'Carte de chaleur d\'activité',
    heatmap_description:
      'Intensité de la conversation par semaine. Le rouge met en évidence les périodes avec conflits ou événements significatifs.',
    calendar_title: 'Calendrier de conversation',
    calendar_description:
      'Les dates importantes sont surlignées en rouge. Survolez les dates pour voir les détails.',
    verdict_problematic: 'Problématiques',
    // Graphique d'activité par jour
    activity_chart_title: 'Activité par jour',
    activity_chart_description:
      'Montre les jours avec plus de messages. Les pics peuvent coïncider avec des périodes de tension.',
    activity_chart_messages_label: 'Messages',
    activity_chart_color_hint:
      'Rouge ≈ jours liés à des conflits intenses ou à de la manipulation.',
    important_dates_label: '🗓️ Dates importantes',
    important_date: 'Date importante',
    important_dates_list_title: 'Dates importantes',
    message_intensity_label: 'Intensité des messages',
    more_dates: 'dates supplémentaires',
    verdict_problematic: 'Problématiques',
    participant_profiles_title: '👥 Profils des participants',
    participant_profiles_description: 'Profils de communication succincts pour chaque participant.',
    reality_check_title: '✅ Vérification de la réalité',
    reality_check_right: 'Ce qui était juste',
    reality_check_wrong: 'Ce qui était faux',
    reality_check_whose: 'Perception la plus exacte',
    hard_truth_title: '⚡ Vérité difficile',
    hard_truth_verdict: 'Verdict',
    hard_truth_abusive: 'Comportements abusifs',
    hard_truth_abusive_label: 'Abusifs',
    hard_truth_toxic_label: 'Toxiques',
    hard_truth_needs_work_label: 'À améliorer',
    hard_truth_healthy_label: 'Saines',
    what_you_should_know_title: '💡 Ce que vous devez savoir',
    wysk_could_have_done: 'Ce qui aurait pu être fait autrement',
    wysk_comm_tools: 'Outils de communication',
    wysk_could_be_saved: 'La relation pouvait-elle être sauvée',
    wysk_why_not_fault: 'Pourquoi ce n’est pas entièrement votre faute',
    wysk_what_made_vulnerable: 'Ce qui vous a rendu vulnérable',
    wysk_patterns_to_watch: 'Schémas à surveiller',
    wysk_resources: 'Ressources',
    wysk_red_flags_next: 'Signaux d’alerte pour la suite',

    testimonial_yuki_name: '« Yuki », 27 ans',
    testimonial_yuki_role: 'Relation à distance',
    testimonial_yuki_quote:
      'On se disputait constamment par texto. Ça m\'a aidé à voir que la plupart des conflits commençaient par des malentendus, pas de la malveillance. On avait tous les deux besoin de mieux communiquer.',
    testimonial_sofia_name: '« Sofia », 32 ans',
    testimonial_sofia_role: 'Clarté post-divorce',
    testimonial_sofia_quote:
      'J\'avais besoin de clôture. Lire des années de messages était accablant, mais l\'analyse IA a mis en évidence les schémas clés. Il ne s\'agissait pas de blâme — il s\'agissait de compréhension.',

    // Conditions d'utilisation
    terms_title: 'Conditions d\'utilisation',
    terms_intro:
      'Ces Conditions d\'utilisation ("Conditions") régissent votre utilisation de l\'application web Textes avec mon ex ("Service"). En accédant ou en utilisant le Service, vous acceptez d\'être lié par ces Conditions.',
    terms_section1_title: '1. Description du service',
    terms_section1_content:
      'Textes avec mon ex est un outil d\'analyse assisté par IA et anonyme qui vous permet de télécharger des exports de chats (par exemple, Telegram ou WhatsApp) et de recevoir un rapport automatisé sur les modèles de communication. Ce n\'est pas une thérapie, un conseil juridique ou un service de crise.',
    terms_section2_title: '2. Éligibilité et utilisation',
    terms_section2_content:
      'Vous ne pouvez utiliser le Service que si vous avez au moins 18 ans et êtes légalement en mesure de conclure ces Conditions. Vous êtes responsable de vous assurer que vous avez le droit de télécharger et de traiter les chats que vous soumettez au Service.',
    terms_section3_title: '3. Traitement des données et confidentialité',
    terms_section3_content:
      'Nous traitons vos chats téléchargés de manière éphémère dans le but de générer un rapport d\'analyse. Les données téléchargées et les rapports générés ne sont pas stockés plus longtemps que nécessaire pour fournir le Service et ne sont pas utilisés pour former des modèles tiers. Pour plus de détails, veuillez consulter notre Politique de confidentialité (lorsqu\'elle sera disponible).',
    terms_section4_title: '4. Paiements et abonnements',
    terms_section4_content:
      'Certaines fonctionnalités peuvent être proposées sur une base payante (par exemple, analyse premium ou analyse des médias). Les paiements sont traités via notre système de traitement des paiements. Les prix, les intervalles de facturation et les règles de remboursement sont indiqués à la caisse et peuvent être mis à jour de temps à autre.',
    terms_section5_title: '5. Aucune garantie',
    terms_section5_content:
      'L\'analyse est générée par de grands modèles de langage et peut être incomplète, inexacte ou refléter des biais inhérents à ces modèles. Nous ne garantissons pas l\'exactitude, l\'exhaustivité ou l\'adéquation de toute analyse pour votre situation particulière.',
    terms_section6_title: '6. Utilisation interdite',
    terms_section6_content:
      'Vous acceptez de ne pas utiliser le Service à des fins illégales, de violer les droits d\'autrui ou de télécharger du contenu qui porte atteinte à la propriété intellectuelle, à la vie privée ou à d\'autres droits de tiers.',
    terms_section7_title: '7. Limitation de responsabilité',
    terms_section7_content:
      'Dans la mesure maximale permise par la loi, Textes avec mon ex et ses opérateurs ne seront pas responsables de tout dommage indirect, accessoire, spécial, consécutif ou punitif découlant de ou lié à votre utilisation du Service.',
    terms_section8_title: '8. Modifications de ces conditions',
    terms_section8_content:
      'Nous pouvons mettre à jour ces Conditions de temps à autre. La date de "dernière mise à jour" en haut de cette page indiquera quand les modifications entrent en vigueur. Votre utilisation continue du Service après toute modification signifie que vous acceptez les Conditions mises à jour.',
    terms_section9_title: '9. Contact',
    terms_section9_content:
      'Si vous avez des questions concernant ces Conditions ou le Service, veuillez nous contacter en utilisant les coordonnées fournies sur le site principal ou dans l\'application.',
    donation_beta_label: 'Bêta',
    donation_title: 'Soutenir le développeur',
    donation_text: 'Si ce rapport vous a aidé, une petite donation serait appréciée. Merci pour votre soutien !',
    donation_crypto_only: 'Crypto uniquement',
    donation_show_qr: 'Afficher le QR',
    donation_qr_for_wallet: 'QR du portefeuille',
    donation_close: 'Fermer',
    pdf_safety_concern_title: '🛟 Préoccupation de sécurité',
    pdf_safety_concern_intro: 'Ce qui dépasse le toxique :',
    pdf_safety_resources: 'Ressources',
    pdf_closure_title: '🎯 Clôture',
    pdf_closure_right: 'Sur quoi il/elle avait raison',
    pdf_closure_deserved: 'Ce qui était mérité',
    pdf_closure_got: 'Ce qui a été obtenu',
    pdf_closure_permission: 'Permission d\'aller de l\'avant',
    pdf_closure_end: 'Déclaration finale',
    install_app: 'Installer l\'application',
    install_app_instructions: 'Pour installer cette application :',
    install_app_chrome: 'Chrome/Edge : Cliquez sur l\'icône d\'installation dans la barre d\'adresse, ou allez dans Menu → Installer l\'application',
    install_app_safari: 'Safari (iOS) : Appuyez sur Partager → Ajouter à l\'écran d\'accueil',
    install_app_firefox: 'Firefox : Pas encore pris en charge'
  }
};
