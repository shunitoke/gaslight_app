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
    footer_disclaimer: 'Not therapy. Not gossip. Just AI clarity.',
    language_label: 'Language',
    uploadExport: 'Upload Chat Export',
    uploadExportDescription: 'Select your chat export file to begin analysis.',
    analyzing: 'AI analyzing conversation...',
    progress_starting: 'Initializing AI analysis...',
    progress_parsing: 'Parsing conversation...',
    progress_analyzing: 'AI analyzing conversation patterns...',
    progress_media: 'AI analyzing media content...',
    progress_chunking: 'Processing conversation chunks...',
    progress_completed: 'AI analysis complete!',
    progress_error: 'AI analysis failed',
    progress_analyzing_hint: 'AI is analyzing patterns, communication styles, and relationship dynamics...',
    progress_media_hint: 'Analyzing images, stickers, and media content with AI vision models...',
    progress_chunk_label: 'Chunk {current} of {total}',
    progress_disclaimer: 'Please do not close this window while analysis is in progress.',
    backToHome: 'Back to Home',
    noAnalysisFound: 'No analysis found. Please upload a conversation first.',
    analysisReport: 'AI Analysis Report',
    gaslightingRisk: 'Gaslighting Risk',
    conflictIntensity: 'Conflict Intensity',
    supportiveness: 'Supportiveness',
    apologyFrequency: 'Apology Frequency',
    evidence: 'Evidence',
    scientificAnalysis: 'Scientific Analysis',
    plainLanguage: 'In Plain Language',
    score: 'Score',
    section_gaslighting: 'Gaslighting Risk',
    section_conflictIntensity: 'Conflict Intensity',
    section_supportiveness: 'Supportiveness',
    section_apologyFrequency: 'Apology Frequency',
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
      'Running premium analysis: using deeper prompts and media (where available).',
    free_progress_hint:
      'Running free analysis: text-only overview. Upgrade to premium for media and deeper insights.',
    selectPlatform: 'Select Platform',
    platform_telegram: 'Telegram',
    platform_whatsapp: 'WhatsApp',
    platform_signal: 'Signal',
    platform_discord: 'Discord',
    platform_messenger: 'Facebook Messenger',
    platform_imessage: 'iMessage',
    platform_viber: 'Viber',
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
    exportTXT: 'Export TXT',
    exportJSON: 'Export JSON',
    exportPDF: 'Export PDF',
    exportReportTitle: 'Analysis Report',
    exportGeneratedBy: 'Created with "Texts With my Ex" - AI Gaslight Detection App',
    exportDate: 'Date',
    exportOverview: 'Overview',
    exportScores: 'Scores',
    exportPatterns: 'Patterns',
    exportEvidence: 'Evidence',

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
      'Certain features may be offered on a paid basis (for example, premium analysis or media analysis). Payments are processed by our payment provider, Paddle, acting as merchant of record. Prices, billing intervals, and refund rules are shown at checkout and may be updated from time to time.',
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
      'If you have questions about these Terms or the Service, please contact us using the details provided on the main site or within the app.'
  }
};

