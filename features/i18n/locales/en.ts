import type { LocaleBundle } from '../types';

export const enBundle: LocaleBundle = {
  locale: 'en',
  displayName: 'English',
  messages: {
    appName: 'Texts with my Ex®',
    appTagline: 'Unbiased insight into what really happened.',
    hero_tagline: 'Unbiased AI insight into what really happened.',
    hero_tagline_alt1: 'Not vibes, not gossip — AI science under the hood.',
    hero_tagline_alt2: 'Behavioral patterns, attachment, and conflict — AI analyzed for you.',
    hero_tagline_alt3: 'Fully anonymous and confidential.',
    hero_cta: 'Analyze your conversation with AI',
    hero_copy:
      'Upload chats to get an impartial, AI-powered relationship analysis.',
    hero_confidential: 'Completely confidential.',
    footer_disclaimer: 'Not therapy. Not gossip. Just AI clarity.',
    footer_visitors_label: 'Unique visitors',
    footer_visitors_loading: 'Counting visitors...',
    footer_analyses_label: 'Analyses completed',
    footer_analyses_loading: 'Counting analyses...',
    footer_report_bug: 'Report a bug',
    language_label: 'Language',
    uploadExport: 'Upload Conversation',
    uploadExportDescription: 'We unpack years-long conversations.',
    confirmImportPrompt:
      'Import "{file}"? Make sure the export only contains the conversation you want analyzed.',
    uploadingFile: 'Uploading file...',
    importSuccessful: 'Import Successful',
    importFailed: 'Import failed',
    analysisFailed: 'Analysis failed',
    failedToStartAnalysis: 'Failed to start analysis',
    failedToUploadFile: 'Failed to upload file to Blob storage',
    errorOccurred: 'An error occurred',
    analyzing: 'AI analyzing conversation...',
    progress_starting: 'Initializing AI analysis...',
    progress_parsing: 'Parsing conversation...',
    progress_analyzing: 'AI analyzing conversation patterns...',
    progress_media: 'AI analyzing media content...',
    progress_chunking: 'Processing conversation chunks...',
    progress_finalizing: 'AI wrapping up the final report...',
    progress_completed: 'AI analysis complete!',
    progress_error: 'AI analysis failed',
    progress_analyzing_hint: 'AI is analyzing patterns, communication styles, and relationship dynamics...',
    progress_media_hint: 'Analyzing images, stickers, and media content with AI vision models...',
    progress_finalizing_hint:
      'Combining all sections and charts. This last step can take up to a minute — thanks for waiting.',
    progress_chunk_label: 'Chunk {current} of {total}',
    progress_disclaimer: 'Please do not close this window while analysis is in progress.',
    backToHome: 'Back to Home',
    noAnalysisFound: 'No analysis found. Please upload a conversation first.',
    noAnalysisFound_help:
      'Go back to the home page, upload a chat export, and wait for the analysis to finish to see your report.',
    analysisReport: 'AI Analysis Report',
    gaslightingRisk: 'Gaslighting Risk',
    conflictIntensity: 'Conflict Intensity',
    supportiveness: 'Supportiveness',
    apologyFrequency: 'Conflict Resolution Rate',
    evidence: 'Evidence',
    scientificAnalysis: 'Scientific Analysis',
    plainLanguage: 'In Plain Language',
    score: 'Score',
    section_gaslighting: 'Gaslighting Risk',
    section_conflictIntensity: 'Conflict Intensity',
    section_supportiveness: 'Supportiveness',
    section_apologyFrequency: 'Conflict Resolution Rate',
    section_redFlags: 'Red Flags',
    section_conflict: 'Conflict Intensity',
    section_support: 'Supportiveness',
    section_apology: 'Apology Frequency',
    imported: 'Imported',
    messages: 'messages',
    privacyNote: 'Your data is processed ephemerally and never stored permanently.',
    fileUploadHelp: 'Formats: .json, .txt, .zip. Files up to 25MB.',
    premium_badge: 'Premium',
    free_badge: 'Free',
    premium_hint:
      'Premium analysis: full report with detailed insights, evidence examples, and exports.',
    free_hint:
      'Free preview: overview only. Unlock full report, evidence, and exports.',
    premium_progress_hint:
      'Running detailed analysis: processing text and available media.',
    free_progress_hint:
      'Running basic analysis: text only for now; media coming soon.',
    progress_premium_features_profiles: 'Participant insights from messages',
    progress_premium_features_replies: '',
    progress_premium_features_activity: 'Building daily activity chart',
    selectPlatform: 'Select Platform',
    platform_auto: 'Auto-detect',
    platform_telegram: 'Telegram',
    platform_whatsapp: 'WhatsApp',
    platform_signal: 'Signal',
    platform_discord: 'Discord',
    platform_messenger: 'Facebook Messenger',
    platform_imessage: 'iMessage',
    platform_viber: 'Viber',
    platform_generic: 'TXT / SMS / Other',
    recommended: 'Recommended',
    selectFile: 'Select File',
    clickToSelectFile: 'Click to select file',
    dragDropHint: 'Drag & drop your export here or click to choose a file.',
    ready: 'Ready',
    uploadAndAnalyze: 'Upload & Analyze',
    inputMode_upload: 'Upload export',
    inputMode_paste: 'Paste text',
    inputMode_media: 'Media / voice',
    upload_media_title: 'Upload image or audio',
    upload_media_hint:
      'Supported: images (png, jpg, jpeg, webp, gif) and audio (mp3, wav, ogg, opus, m4a, webm). Max 25MB.',
    choose_file: 'Choose file',
    record_voice_title: 'Record a voice note',
    record_voice_hint: 'Up to {{seconds}} seconds. We’ll transcribe automatically.',
    start_recording: 'Start recording',
    stop_recording: 'Stop ({{seconds}}s)',
    recording: 'Recording...',
    mic_permission_error: 'Could not access microphone. Please allow mic permissions and try again.',
    progress_media_voice: 'Analyzing voice recording...',
    voice_coming_soon: 'Voice transcription will arrive in the next version.',
    pasteLabel: 'Paste a short excerpt of your conversation',
    pastePlaceholder: 'Paste messages here (small excerpt only, not a full multi-year chat)...',
    pasteHelp: 'Works best for small excerpts. For long histories, please use chat export import.',
    analyzePasted: 'Analyze pasted text',
    paste_error_empty: 'Please paste some conversation text first.',
    paste_error_too_long: 'Pasted text is too long. Please use a smaller excerpt (up to 8000 characters).',
    paste_error_not_conversation:
      "This text doesn't look like a conversation. Please paste real messages, not random characters.",
    error_invalid_format: 'Invalid file format. Please check that the file matches the export format of the selected platform.',
    exportTXT: 'Export TXT',
    exportJSON: 'Export JSON',
    exportPDF: 'Export PDF',
    exportReportTitle: 'Analysis Report',
    exportGeneratedBy: 'Created with "Texts With my Ex" - AI Gaslight Detection App',
    exportDate: 'Date',
    exportOverview: '🔍 Overview',
    exportScores: '📊 Scores',
    exportPatterns: '📌 Patterns',
    exportEvidence: '🧾 Evidence',
    analysisDefaultOverview: 'Analysis completed. Review sections for detailed insights.',
    analysisDefaultNoPatterns: 'Analysis completed. No specific patterns detected in this excerpt.',
    analysisDefaultTitle: 'Analysis',
    analysisParseError: 'Analysis completed with partial results due to parsing error.',
    analysisEmptySummary: 'Analysis completed. No specific patterns detected in this section.',
    analysisGenericWarningTitle: 'It looks like the AI only returned a generic summary without concrete examples.',
    analysisGenericWarningBody:
      'Please try running the analysis again. If this keeps happening, try splitting your conversation into shorter chunks.',
    showDetails: 'Show details',
    hideDetails: 'Hide details',

    // Export help (how to export chats)
    exportHelpTitle: 'How to export your chats',
    exportHelpTelegram:
      'Telegram (desktop): open the chat → menu → "Export chat history" → choose JSON or text, then upload the file here.',
    exportHelpWhatsApp:
      'WhatsApp (phone): open the chat → menu → "Export chat" → choose Without media (faster) or With media, send the file to yourself and upload it here.',
    exportHelpOther:
      'For Signal, Discord, Facebook Messenger, iMessage/SMS or Viber, export the chat as a text/JSON file (or ZIP) using the app or a trusted exporter, then upload that file.',

    // How it works section
    howItWorks: 'How It Works',
    step1_title: 'Upload Your Chat',
    step1_description: 'Export your conversation from Telegram or WhatsApp and upload it here. Your data is processed securely and never stored.',
    step2_title: 'AI Analysis',
    step2_description: 'Our AI analyzes communication patterns, detects gaslighting behaviors, and identifies relationship dynamics using scientific methods.',
    step3_title: 'Get Insights',
    step3_description: 'Receive a comprehensive report with scores, evidence, and explanations to help you understand what really happened.',
    howItWorks_subtitle: '3 quick steps, then the AI does the heavy lifting for you.',
    recentAnalysesTitle: 'Recent analyses',
    recentAnalysesEmpty: 'Your history will appear here after the first report is ready.',
    recentAnalysesClear: 'Clear list',
    recentAnalysesRetention:
      'Stored locally for ~24 hours on this device. Use "Clear list" or wipe cookies/localStorage.',
    recentAnalysesOverviewMissing: 'Analysis completed but overview is empty.',
    recentAnalysesClear_confirm:
      'Clear recent analyses on this device? All local data (localStorage/cookies) will be deleted and cannot be restored.',
    recentAnalyses_media: 'Media upload',
    recentAnalyses_voice: 'Voice note',
    recentAnalyses_paste: 'Pasted conversation',

    // Articles
    articles_label: 'Articles & guides',
    articles_title: 'Guides on gaslighting, manipulation, and recovery',
    articles_subtitle:
      'Short reads on spotting patterns, exiting safely, processing grief, and moving toward healthier dynamics.',
    articles_cta: 'Read article',
    articles_read_time_short: '5 min read',
    articles_tag_awareness: 'Awareness',
    articles_tag_howto: 'How-to',
    articles_tag_product: 'Behind the AI',
    articles_tag_practice: 'Practice',
    articles_tag_support: 'Support',
    articles_gaslighting_title: 'Gaslighting: common patterns and how to respond',
    articles_gaslighting_description:
      'Examples of reality distortion, blame shifting, and language cues the detector flags most often.',
    articles_export_title: 'How to export chats safely from Telegram & WhatsApp',
    articles_export_description:
      'Step-by-step export tips, file formats we accept, and how to keep sensitive data private.',
    articles_method_title: 'How our AI analyzes your messages',
    articles_method_description:
      'A plain-language walkthrough of scoring, evidence extraction, and why your chats are never stored permanently.',
    articles_toxic_title: 'How to recognize toxic relationship patterns',
    articles_toxic_description:
      'Key signals of criticism, control, isolation, and emotional whiplash that erode safety.',
    articles_steps_title: 'Practical steps while the relationship is ongoing',
    articles_steps_description:
      'Grounding actions: reality checks, boundary practice, safety planning, and body care.',
    articles_grief_title: 'How to grieve the end of a difficult relationship',
    articles_grief_description:
      'Non-linear stages of grief after toxic dynamics and ways to regain meaning and stability.',
    articles_manipulation_title: 'Key types of manipulation in relationships',
    articles_manipulation_description:
      'Emotional blackmail, gaslighting, isolation, boundary violations, and how to spot the patterns.',
    articles_covert_title: 'Covert narcissism: danger behind vulnerability',
    articles_covert_description:
      'How quiet entitlement, victim stance, and weaponized kindness keep control in disguise.',
    articles_letgo_title: 'Letting go of traumatic attachment',
    articles_letgo_description:
      'Why leaving is hard, how to prepare, and what helps hold no-contact through withdrawal.',
    articles_consequences_title: 'Psychological consequences of toxic bonds',
    articles_consequences_description:
      'PTSD-like symptoms, anxiety, dissociation, and why body and mind both need recovery.',
    articles_chances_title: 'Is there a chance for these relationships?',
    articles_chances_description:
      'When change is realistic, red flags that end the discussion, and how to decide safely.',
    articles_healthy_title: 'Healthy relationships are not perfect (and that is fine)',
    articles_healthy_description:
      'Realistic traits of workable relationships versus myths of flawless harmony.',

    // Hero badges & preview card
    hero_badge_patterns: 'Deep pattern analysis',
    hero_badge_boundaries: 'Boundaries first',
    hero_badge_multilang: 'Multi-language chats',
    hero_preview_title: 'AI conversation scan',
    hero_preview_subtitle: 'A fictional example of what the detector highlights.',
    hero_preview_live: 'Live preview',
    hero_preview_flag_title: 'Gaslighting pattern detected',
    hero_preview_flag_subtitle:
      'Reality distortion · Minimizing experience · Blame shifting',
    hero_preview_score_label: 'Emotional safety score',
    hero_preview_score_low: 'Low',
    emotional_safety_medium: 'Medium',
    emotional_safety_high: 'High',
    relationship_health_title: 'Relationship Health Overview',
    relationship_health_summary: 'Overall relationship dynamics',
    hero_preview_typing: 'AI is still reading…',

    // Privacy chips
    privacy_chip_no_sharing: 'No public sharing',
    privacy_chip_local_session: 'Local session only',
    privacy_chip_control: 'You stay in control',
    demo_metrics_banner: 'Demo metrics from screenshot only. Upload the full chat export for accurate scores.',
    activity_wave_by_day: 'By day',
    activity_wave_by_week: 'By week',

    // Hero preview sample messages
    // left = abuser, right = victim
    hero_preview_msg1_left: 'You’re overreacting, it wasn’t that bad.',
    hero_preview_msg1_right: 'I remember it completely differently. You always twist things.',
    hero_preview_msg2_left: 'If you really loved me, you wouldn’t question this so much.',
    hero_preview_msg2_right: 'I just want us to talk about what happened honestly.',
    hero_preview_msg3_left: 'I never said that, you’re making it up again.',
    hero_preview_msg3_right: 'I have the messages saved. Why do you always deny it?',
    hero_preview_msg4_left: 'Maybe the problem is how sensitive you are.',
    hero_preview_msg4_right: 'This isn’t about being sensitive, it’s about what you said.',
    hero_preview_msg5_left: 'Everyone else thinks I’m reasonable, only you complain.',
    hero_preview_msg5_right: 'I’m not trying to start a fight, I just want to understand.',

    // Short FAQ / purpose & disclaimers
    faq_why:
      'This app helps you see communication patterns in your chats — not to assign guilt, but to understand what was happening between you.',
    faq_forWhom:
      'It is for people who feel confused about a relationship, suspect manipulation or gaslighting, or simply want a neutral outside view on their own communication style.',
    faq_notSides:
      'The analysis does not take sides and does not say who is "right" or "wrong" — it describes patterns and gives examples from both sides.',
    faq_notTherapy:
      'This is not therapy, not a diagnosis and not legal advice. It is one AI-based perspective on your messages.',
    faq_goal:
      'The main goal is to support reflection and mutual understanding, not to start new conflicts or to be used as a weapon in arguments.',
    help_tooltip_label: 'Help and service information',
    help_tooltip_title: 'About the service',
    help_tooltip_close: 'Close',
    report_disclaimer_main:
      'This report is generated by AI based only on the messages you uploaded. It can miss context and should be treated as one perspective, not the final truth.',
    report_disclaimer_safety:
      'If your situation involves violence, self-harm or feels unsafe, please do not rely on this app alone — reach out to trusted people or professional support.',

    // Daily activity chart
    activity_chart_title: 'Daily conversation activity',
    activity_chart_description:
      'Shows on which days more messages were exchanged. Spikes may coincide with periods of tension.',
    activity_chart_messages_label: 'Messages',
    activity_chart_color_hint:
      'Red ≈ days linked to intense conflict or manipulation.',

    // Recommended replies (disabled)
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
    dashboard_title: 'Timeline',
    heatmap_title: 'Activity Heatmap',
    heatmap_description:
      'Conversation intensity by week. Red highlights periods with conflicts or significant events.',
    heatmap_color_hint:
      'Green ≈ lower message intensity, red ≈ weeks with severe conflicts or gaslighting.',
    calendar_title: 'Conversation Calendar',
    calendar_description:
      'Important dates are highlighted in red. Hover over dates to view details.',
    verdict_problematic: 'Problematic',
    important_dates_label: '🗓️ Important Dates',
    important_date: 'Important Date',
    important_dates_list_title: 'Important Dates',
    message_intensity_label: 'Message Intensity',
    more_dates: 'more dates',
    participant_profiles_title: '👥 Participant profiles',
    participant_profiles_description: 'Brief communication profiles for each participant.',
    reality_check_title: '✅ Reality check',
    reality_check_right: 'What was right',
    reality_check_wrong: 'What was wrong',
    reality_check_whose: 'Whose perception was accurate',
    hard_truth_title: '⚡ Hard truth',
    hard_truth_verdict: 'Verdict',
    hard_truth_abusive: 'Abusive behaviors',
    hard_truth_abusive_label: 'Abusive',
    hard_truth_toxic_label: 'Toxic',
    hard_truth_needs_work_label: 'Needs work',
    hard_truth_healthy_label: 'Healthy',
    what_you_should_know_title: '💡 What you should know',
    wysk_could_have_done: 'Could have done differently',
    wysk_comm_tools: 'Communication tools',
    wysk_could_be_saved: 'Could the relationship be saved',
    wysk_why_not_fault: 'Why it is not your fault',
    wysk_what_made_vulnerable: 'What made you vulnerable',
    wysk_patterns_to_watch: 'Patterns to watch',
    wysk_resources: 'Resources',
    wysk_red_flags_next: 'Red flags for next time',
    whats_next_kicker: 'Action plan',
    whats_next_title: "What's next?",
    whats_next_subtitle: 'Practical next steps based on this analysis.',
    whats_next_actions: 'Actionable steps',
    whats_next_boundaries: 'Boundaries to practice',
    whats_next_support: 'Support & resources',

    // Testimonials
    testimonials_label: 'REAL STORIES, CHANGED PERSPECTIVES',
    testimonials_title: 'People who used this to understand their chats better',
    testimonial_anna_name: '“Anna”, 28',
    testimonial_anna_role: 'After a long breakup',
    testimonial_anna_quote:
      'I had screenshots and opinions from friends, but this was the first time I saw our whole conversation laid out calmly. It helped me stop obsessing over one fight and see the longer pattern.',
    testimonial_marco_name: '“Marco”, 34',
    testimonial_marco_role: 'In a new relationship',
    testimonial_marco_quote:
      'I used it not to prove anything to my partner, but to check my own reactions. The report showed where I escalated or shut down, which was uncomfortable — but useful.',
    testimonial_lea_name: '“Lea”, 31',
    testimonial_lea_role: 'Questioning gaslighting',
    testimonial_lea_quote:
      'I was scared it would "judge" me or my ex. Instead it felt like a neutral mirror. It didn\'t tell me what to do, but it gave me language to describe what I was feeling.',
    testimonial_sara_name: '“Sara”, 29',
    testimonial_sara_role: 'After toxic relationship',
    testimonial_sara_quote:
      'Finally, I had proof that I wasn\'t crazy. The patterns were clear — constant contradictions, blame-shifting. It gave me the confidence to move on.',
    testimonial_david_name: '“David”, 35',
    testimonial_david_role: 'Trying to improve',
    testimonial_david_quote:
      'I wanted to understand why my relationships kept failing. The analysis showed my communication patterns — defensive, dismissive. Hard to hear, but necessary.',
    testimonial_yuki_name: '“Yuki”, 27',
    testimonial_yuki_role: 'Long-distance relationship',
    testimonial_yuki_quote:
      'We were fighting over text constantly. This helped me see that most conflicts started with misunderstandings, not malice. We both needed to communicate better.',
    testimonial_sofia_name: '“Sofia”, 32',
    testimonial_sofia_role: 'Post-divorce clarity',
    testimonial_sofia_quote:
      'I needed closure. Reading through years of messages was overwhelming, but the AI analysis highlighted the key patterns. It wasn\'t about blame — it was about understanding.',
    testimonial_mia_name: '“Mia”, 26',
    testimonial_mia_role: 'After months of breakup spiral',
    testimonial_mia_quote:
      'I kept rewriting the story in my head. The timeline and spikes made it less dramatic and more factual. I could finally close the tab and sleep.',
    testimonial_lucas_name: '“Lucas”, 29',
    testimonial_lucas_role: 'Brought to therapy',
    testimonial_lucas_quote:
      'My therapist asked for concrete examples. The report showed every time I deflected with sarcasm. Seeing it in one place was uncomfortable, but it sped up the session.',
    testimonial_priya_name: '“Priya”, 33',
    testimonial_priya_role: 'Co-parenting messages',
    testimonial_priya_quote:
      'We share a toddler and emotions run hot. The tool highlighted where blame crept in. It helped us agree on a calmer script before pickups.',
    testimonial_noah_name: '“Noah”, 31',
    testimonial_noah_role: 'Catching my defensiveness',
    testimonial_noah_quote:
      'I always said “I’m just clarifying,” but the pattern was me interrupting and minimizing. Now I practice one response at a time.',
    testimonial_amira_name: '“Amira”, 30',
    testimonial_amira_role: 'Long-distance misreads',
    testimonial_amira_quote:
      'We kept missing each other’s tone. The nonstop view made it clear that silence was usually stress, not malice. It lowered the panic.',
    testimonial_elena_name: '“Elena”, 34',
    testimonial_elena_role: 'Sorting years of voice notes',
    testimonial_elena_quote:
      'I dreaded re-listening to hours of audio. Seeing transcripts lined up let me skim patterns instead of reliving everything.',
    testimonial_tom_name: '“Tom”, 30',
    testimonial_tom_role: 'Figuring out conflict loops',
    testimonial_tom_quote:
      'I thought I was being “logical.” The report showed a loop: sarcasm → defensiveness → stonewall. Naming it helped me break it.',
    testimonial_zahra_name: '“Zahra”, 28',
    testimonial_zahra_role: 'Visa-stress arguments',
    testimonial_zahra_quote:
      'We were exhausted by paperwork. The timeline highlighted every spike was after embassy emails. It made it easier to say “let’s pause” next time.',
    testimonial_pedro_name: '“Pedro”, 37',
    testimonial_pedro_role: 'Rebuilding trust',
    testimonial_pedro_quote:
      'I wanted proof I was improving. Seeing fewer blame-shifts month over month was the first time it felt measurable.',
    testimonial_lina_name: '“Lina”, 25',
    testimonial_lina_role: 'First serious breakup',
    testimonial_lina_quote:
      'I kept scrolling old chats at night. The summary gave me closure faster than rereading everything.',
    testimonial_chen_name: '“Chen”, 33',
    testimonial_chen_role: 'Work-life spillover',
    testimonial_chen_quote:
      'My partner said I brought office tone home. The analysis showed how often I replied with “not now.” Small, but it added up.',
    testimonial_jasmine_name: '“Jasmine”, 29',
    testimonial_jasmine_role: 'Moving cities together',
    testimonial_jasmine_quote:
      'Every fight mapped to moving stress. Seeing it plotted made it easier to say “we’re overwhelmed, not enemies.”',
    testimonial_omar_name: '“Omar”, 36',
    testimonial_omar_role: 'Late-night overthinker',
    testimonial_omar_quote:
      'I kept reopening old chats at 2 a.m. The summary gave me the closure my scrolling never did.',
    testimonial_julia_name: '“Julia”, 27',
    testimonial_julia_role: 'Calling out love-bombing',
    testimonial_julia_quote:
      'The pattern of big promises then disappearances jumped off the page. It wasn’t in my head.',
    testimonial_mateo_name: '“Mateo”, 31',
    testimonial_mateo_role: 'Learning to apologize',
    testimonial_mateo_quote:
      'I thought “sorry you feel that way” was fine. Seeing it flagged made me practice real apologies.',

    // Terms & Conditions
    terms_title: 'Terms & Conditions',
    privacy_title: 'Privacy Policy',
    refund_title: 'Refund Policy',
    pricing_title: 'Pricing',
    paddle_buy_label: 'Buy 10 analyses',
    paddle_status_loading: 'Loading checkout…',
    paddle_status_verifying: 'Verifying payment…',
    paddle_status_opening: 'Opening secure checkout…',
    paddle_status_unlocked: 'Pack unlocked!',
    paddle_error_missing_token: 'Paddle client token is missing',
    paddle_error_token_missing: 'Token missing from response',
    paddle_error_unlock: 'Unable to unlock premium',
    paddle_error_not_ready: 'Paddle not ready yet',
    paddle_error_start: 'Failed to start checkout',
    paddle_error_txn_missing: 'Transaction id missing',
    duplicate_analysis_warning:
      'You are analyzing the same conversation again. The result will likely be identical. Continue?',
    terms_intro:
      'These Terms & Conditions ("Terms") govern your use of the Texts with My Ex web application ("Service"). By accessing or using the Service, you agree to be bound by these Terms.',
    terms_operator_title: 'Operator & Legal business name',
    terms_operator_content:
      'Legal business name: Texts with My Ex. Contact email: spinnermining@gmail.com.',
    terms_section1_title: '1. Service Description',
    terms_section1_content:
      'Texts with My Ex is an anonymous, AI-assisted analysis tool that allows you to upload chat exports (for example, Telegram or WhatsApp) and receive an automated report about communication patterns. It is not therapy, legal advice, or a crisis service.',
    terms_section2_title: '2. Eligibility & Use',
    terms_section2_content:
      'You may use the Service only if you are at least 18 years old and legally able to enter into these Terms. You are responsible for ensuring that you have the right to upload and process the chats you submit to the Service.',
    terms_section3_title: '3. Data Handling & Privacy',
    terms_section3_content:
      'Chats travel over HTTPS and are decrypted server-side so the AI can generate a report; end-to-end encryption is not provided. Access is restricted to service processes and model providers. Storage is short-lived: progress/jobs stay up to ~2 hours, cached analyses up to ~24 hours, and temporary files are removed during cleanup. Your local “recent analyses” list (id + short overview) lives on your device for ~24 hours in localStorage/cookies and can be cleared via the button or by deleting cookies/localStorage. Data is not used to train third-party models. See the Privacy Policy for details.',
    terms_section4_title: '4. Payments & Subscriptions',
    terms_section4_content:
      'Certain features may be offered on a paid basis (for example, premium analysis or media analysis). Payments are processed through our payment processing system. Prices, billing intervals, and refund rules are shown at checkout and may be updated from time to time.',
    terms_section5_title: '5. No Guarantees',
    terms_section5_content:
      'The analysis is generated by large language models and may be incomplete, inaccurate, or reflect biases inherent in those models. We do not guarantee the accuracy, completeness, or suitability of any analysis for your particular situation.',
    terms_section6_title: '6. Prohibited Use',
    terms_section6_content:
      'You agree not to use the Service for any unlawful purposes, to violate the rights of others, or to upload content that infringes the intellectual property, privacy, or other rights of third parties.',
    terms_section7_title: '7. Limitation of Liability',
    terms_section7_content:
      'To the maximum extent permitted by law, Texts with My Ex and its operators will not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service.',
    terms_section8_title: '8. Changes to These Terms',
    terms_section8_content:
      'We may update these Terms from time to time. The "last updated" date at the top of this page will indicate when changes become effective. Your continued use of the Service after any changes means you accept the updated Terms.',
    terms_section9_title: '9. Contact',
    terms_section9_content:
      'If you have questions about these Terms or the Service, please contact us at spinnermining@gmail.com.',
    legal_label: 'Legal',
    legal_last_updated: 'Last updated:',
    privacy_intro:
      'Texts with My Ex is built for short-lived, anonymous analysis. We only process the data you upload to deliver your report and then expire it quickly. We do not create user accounts.',
    privacy_collect_title: 'What we collect',
    privacy_collect_item1: 'Chat exports and optional media you upload for analysis.',
    privacy_collect_item2: 'Progress metadata (e.g., job status) stored temporarily to complete your report.',
    privacy_collect_item3: 'Basic analytics and rate-limiting signals (IP, user agent) to keep the service stable.',
    privacy_use_title: 'How we use your data',
    privacy_use_item1: 'To run AI analysis and generate your report.',
    privacy_use_item2: 'To troubleshoot errors and guard against abuse.',
    privacy_use_item3: 'Never to train third-party models or build advertising profiles.',
    privacy_retention_title: 'Retention',
    privacy_retention_text:
      'Analysis jobs and cached data are short-lived (typically under 24 hours) and are automatically removed during cleanup. Uploaded files in blob storage are pruned regularly. We do not keep a long-term copy of your conversations.',
    privacy_payment_title: 'Payment data',
    privacy_payment_text:
      'Payments are processed by Paddle. We do not store card details. Paddle may collect billing and fraud-prevention signals according to their own privacy policy.',
    privacy_choices_title: 'Your choices',
    privacy_choices_item1: 'You can delete your data by closing the page; stored artifacts expire automatically.',
    privacy_choices_item2: 'Do not upload content you are not authorized to share.',
    privacy_choices_item3: 'Use a privacy-friendly browser session if you do not want local storage of tokens.',
    privacy_contact_title: 'Contact',
    privacy_contact_text_prefix: 'Questions about privacy? Email',
    privacy_contact_text_suffix: '.',
    refund_intro:
      'Refunds are handled by Paddle (our merchant of record). You can request a refund within 14 days of purchase.',
    refund_no_refunds_title: 'Refund window',
    refund_no_refunds_item1: 'Refund requests must be submitted within 14 days of purchase.',
    refund_no_refunds_item2: 'Refunds are processed by Paddle.',
    refund_no_refunds_item3: 'Please include your Paddle transaction ID when submitting a request.',
    refund_issue_title: 'Need help?',
    refund_issue_item1: 'If you experience an issue with access or delivery, please contact Paddle support.',
    refund_issue_item2: 'Paddle may ask for your transaction ID and purchase details.',
    refund_issue_item3: 'If Paddle requests additional information about the product, you can also reach us at spinnermining@gmail.com.',
    refund_contact_title: 'How to request a refund',
    refund_contact_text_prefix: 'Submit your refund request via',
    refund_contact_text_suffix: 'and include your Paddle transaction ID.',
    pricing_badge_text: 'One-time packs',
    pricing_description:
      'Run a free preview to see your scores and overview. Then unlock full reports with a one-time Paddle checkout.',
    pricing_overlay_title: 'Currently free',
    pricing_overlay_description:
      'Pricing is temporarily hidden and all access is open for free. Check back later for updates.',
    pricing_overlay_cta: 'Back to home',
    pricing_free_label: 'Preview',
    pricing_free_price_label: 'Free',
    pricing_free_badge: 'Start here',
    pricing_free_description:
      'See top-level scores and an overview before paying. Good for a quick gut check.',
    pricing_free_item1: 'Upload and process a conversation',
    pricing_free_item2: 'See headline scores and a short overview',
    pricing_free_item3: 'Basic activity timeline',
    pricing_free_cta: 'Start a free preview',
    pricing_premium_label: '5 Reports Pack (Any chat size)',
    pricing_price_unit: 'one-time',
    pricing_premium_description:
      'Includes 5 full reports on this device. No subscription. No recurring billing.',
    pricing_premium_item1: 'Full evidence and pattern breakdowns',
    pricing_premium_item2: 'Participant profiles, insights, and closure section',
    pricing_premium_item3: 'Export to TXT / JSON / PDF',
    pricing_premium_item4: '5 full reports included',
    pricing_premium_cta: 'Buy 5 reports',
    pricing_any_chat_size_badge: 'Any chat size',
    pricing_media_label: 'Media Pack (Coming next version)',
    pricing_media_badge: 'Coming soon',
    pricing_media_description:
      'Planned: analyze photos/voice notes and unlock 10 reports. Not available yet.',
    pricing_media_item1: '10 full reports included',
    pricing_media_item2: 'Media (images/audio) analysis in the report',
    pricing_media_item3: 'Best for Telegram exports with photos/voice notes',
    pricing_media_item4: 'Early access as soon as the update ships',
    pricing_media_cta: 'Coming next version',
    pricing_media_note:
      'This plan is not purchasable yet. We will enable checkout after the media update is released.',
    pricing_checkout_note:
      'Checkout is handled by Paddle. Final price and currency are confirmed before payment.',
    pricing_what_you_get_title: 'What you get',
    pricing_what_evidence_title: 'Full evidence',
    pricing_what_evidence_text:
      'Concrete message excerpts, pattern explanations, and daily activity charts.',
    pricing_what_exports_title: 'Exports',
    pricing_what_exports_text:
      'Download your report to TXT, JSON, or PDF for offline use and sharing.',
    pricing_what_onetime_title: 'Lifetime access',
    pricing_what_onetime_text:
      'No subscription. Your purchase unlocks a bundle of full reports for this device.',
    pricing_help_text_prefix: 'Need help with billing? Email',
    pricing_help_text_suffix: '.',
    donation_beta_label: 'Beta',
    donation_title: 'Support the developer',
    donation_text: 'If this report helped, consider a small donation. Thank you for your support!',
    donation_crypto_only: 'Crypto only',
    donation_show_qr: 'Show QR',
    donation_qr_for_wallet: 'QR for wallet',
    donation_close: 'Close',
    pdf_safety_concern_title: '🛟 Safety concern',
    pdf_safety_concern_intro: 'What goes beyond toxic:',
    pdf_safety_resources: 'Resources',
    pdf_closure_title: '🎯 Closure',
    pdf_closure_right: 'What they were right about',
    pdf_closure_deserved: 'What was deserved',
    pdf_closure_got: 'What was received',
    pdf_closure_permission: 'Permission to move on',
    pdf_closure_end: 'Final statement',
    install_app: 'Install App',
    install_app_instructions: 'To install this app:',
    install_app_chrome: 'Chrome/Edge: Click the install icon in the address bar, or go to Menu → Install app',
    install_app_safari: 'Safari (iOS): Tap Share → Add to Home Screen',
    install_app_firefox: 'Firefox: Not supported yet'
  }
};

