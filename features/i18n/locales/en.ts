import type { LocaleBundle } from '../types';

export const enBundle: LocaleBundle = {
  locale: 'en',
  displayName: 'English',
  messages: {
    appName: 'Texts with my Ex',
    appTagline: 'Unbiased insight into what really happened.',
    hero_tagline: 'Unbiased AI insight into what really happened.',
    hero_tagline_alt1: 'Not vibes, not gossip — AI science under the hood.',
    hero_tagline_alt2: 'Behavioral patterns, attachment, and conflict — AI analyzed for you.',
    hero_cta: 'Analyze your conversation with AI',
    hero_copy:
      'Upload chats to get an impartial, AI-powered relationship analysis.',
    hero_confidential: 'Completely confidential.',
    footer_disclaimer: 'Not therapy. Not gossip. Just AI clarity.',
    footer_visitors_label: 'Unique visitors',
    footer_visitors_loading: 'Counting visitors...',
    language_label: 'Language',
    uploadExport: 'Upload Chat Export',
    uploadExportDescription: 'Select your chat export file to begin analysis.',
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
      'Combining all sections, dashboards, and recommended replies. This last step can take up to a minute — thanks for waiting.',
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
    fileUploadHelp: 'Current version works best with small text/json exports. Free tier: .json and .txt only. Premium: .zip with media analysis will arrive in the next version.',
    premium_badge: 'Premium',
    free_badge: 'Free',
    premium_hint:
      'Premium analysis with deeper psychological insights, more evidence examples, and media where available.',
    free_hint:
      'Free tier analysis — text-only (up to 50k messages), without media analysis or enhanced deep-dive mode.',
    premium_progress_hint:
      'Running premium analysis: using deeper prompts, media processing, generating participant profiles and recommended replies.',
    free_progress_hint:
      'Running free analysis: text-only overview. Upgrade to premium for media, participant profiles, recommended replies, and activity charts.',
    progress_premium_features_profiles: 'Generating participant psychological profiles',
    progress_premium_features_replies: 'Creating example healthy replies',
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
    ready: 'Ready',
    uploadAndAnalyze: 'Upload & Analyze',
    inputMode_upload: 'Upload export',
    inputMode_paste: 'Paste text',
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

    // Recommended replies
    recommended_replies_toggle_show: 'Show example healthy replies',
    recommended_replies_toggle_hide: 'Hide example replies',
    recommended_replies_gaslighting_1:
      "When you say I'm exaggerating or 'making things up', I feel dismissed. It's important for me that my feelings are acknowledged, even if you see the situation differently.",
    recommended_replies_gaslighting_2:
      "It's hard for me when my words or memories are completely denied. Can we try to talk about what each of us remembers without labels like 'you're crazy / you invented this'?",
    recommended_replies_gaslighting_3:
      "If you disagree, it would help me to hear something like 'I remember it differently, let's figure it out' instead of 'you always twist everything'.",
    recommended_replies_conflict_1:
      'Right now this is turning into a win/lose argument, and I feel exhausted. Can we pause and come back when we can talk more calmly?',
    recommended_replies_conflict_2:
      "I don't want to win this fight, I want to understand what's happening between us. Can we try to speak one at a time and not interrupt?",
    recommended_replies_conflict_3:
      'When voices get raised, I stop hearing the meaning. Can we try to discuss this more calmly or move the conversation to another time?',
    recommended_replies_support_1:
      'When you support me in difficult moments, I feel safer with you. I want to be able to do the same for you.',
    recommended_replies_support_2:
      "It matters to me to know how I can be there for you when you're struggling. Can you tell me what helps you most?",
    recommended_replies_support_3:
      'I see that this was hard for you, and I appreciate that you still stayed in contact. That feels like care to me.',

    // Dashboard
    dashboard_title: 'Analysis Dashboard',
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

    // Terms & Conditions
    terms_title: 'Terms & Conditions',
    terms_intro:
      'These Terms & Conditions ("Terms") govern your use of the Texts with My Ex web application ("Service"). By accessing or using the Service, you agree to be bound by these Terms.',
    terms_section1_title: '1. Service Description',
    terms_section1_content:
      'Texts with My Ex is an anonymous, AI-assisted analysis tool that allows you to upload chat exports (for example, Telegram or WhatsApp) and receive an automated report about communication patterns. It is not therapy, legal advice, or a crisis service.',
    terms_section2_title: '2. Eligibility & Use',
    terms_section2_content:
      'You may use the Service only if you are at least 18 years old and legally able to enter into these Terms. You are responsible for ensuring that you have the right to upload and process the chats you submit to the Service.',
    terms_section3_title: '3. Data Handling & Privacy',
    terms_section3_content:
      'We process your uploaded chats ephemerally for the purpose of generating an analysis report. Uploaded data and generated reports are not stored longer than necessary to provide the Service, and are not used for training third-party models. For more details, please refer to our Privacy Policy (when available).',
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
      'If you have questions about these Terms or the Service, please contact us using the details provided on the main site or within the app.',
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

