import type { LocaleBundle } from '../types';

export const ptBundle: LocaleBundle = {
  locale: 'pt',
  displayName: 'Português',
  messages: {
    appName: 'Textos com meu ex®',
    appTagline: 'Um olhar honesto sobre o que aconteceu.',
    hero_tagline: 'Um olhar honesto de IA sobre o que aconteceu.',
    hero_tagline_alt1: 'Por baixo do capô: IA e ciência, não drama.',
    hero_tagline_alt2: 'Comportamento, apego e conflito — analisados por IA para você.',
    hero_tagline_alt3: 'Totalmente anônimo e confidencial.',
    hero_cta: 'Analisar conversa com IA',
    hero_copy: 'Carregue suas conversas para obter uma análise imparcial de relacionamentos alimentada por IA.',
    hero_confidential: 'Totalmente confidencial.',
    footer_disclaimer: 'Não é terapia, não é fofoca — apenas clareza IA.',
    footer_visitors_label: 'Visitantes únicos',
    footer_visitors_loading: 'Contando visitantes...',
    footer_analyses_label: 'Análises concluídas',
    footer_analyses_loading: 'Contando análises...',
    footer_report_bug: 'Reportar um bug',
    language_label: 'Idioma',
    uploadExport: 'Enviar conversa',
    uploadExportDescription: 'Analisamos conversas de muitos anos.',
    confirmImportPrompt:
      'Importar “{file}”? Confirme que a exportação contém apenas a conversa que deseja analisar.',
    uploadingFile: 'Carregando arquivo...',
    importSuccessful: 'Importação bem-sucedida',
    importFailed: 'Importação falhou',
    analysisFailed: 'Análise falhou',
    failedToStartAnalysis: 'Falha ao iniciar análise',
    failedToUploadFile: 'Falha ao carregar arquivo para armazenamento',
    errorOccurred: 'Ocorreu um erro',
    analyzing: 'IA analisando conversa...',
    progress_starting: 'Inicializando análise IA...',
    progress_parsing: 'Analisando conversa...',
    progress_analyzing: 'IA analisando padrões de conversa...',
    progress_media: 'IA analisando conteúdo de mídia...',
    progress_chunking: 'Processando segmentos de conversa...',
    progress_finalizing: 'A IA está finalizando o relatório...',
    progress_completed: 'Análise IA concluída!',
    progress_error: 'Análise IA falhou',
    progress_analyzing_hint: 'A IA está analisando padrões, estilos de comunicação e dinâmicas relacionais...',
    progress_media_hint: 'Analisando imagens, stickers e conteúdo de mídia com modelos de visão IA...',
    progress_finalizing_hint:
      'Estamos juntando seções, gráficos e respostas recomendadas. Esta etapa final pode levar até um minuto — obrigado por aguardar.',
    progress_chunk_label: 'Segmento {current} de {total}',
    progress_disclaimer: 'Por favor, não feche esta janela enquanto a análise estiver em andamento.',
    backToHome: 'Voltar ao início',
    noAnalysisFound: 'Nenhuma análise encontrada. Por favor, carregue uma conversa primeiro.',
    noAnalysisFound_help:
      'Volte para a página inicial, envie uma exportação do chat e aguarde o fim da análise para ver o relatório.',
    analysisReport: 'Relatório de análise IA',
    gaslightingRisk: 'Risco de manipulação',
    conflictIntensity: 'Intensidade do conflito',
    supportiveness: 'Comportamento de apoio',
    apologyFrequency: 'Taxa de resolução de conflitos',
    evidence: 'Evidências',
    scientificAnalysis: 'Análise científica',
    plainLanguage: 'Em termos simples',
    score: 'Pontuação',
    section_gaslighting: 'Risco de manipulação',
    section_conflictIntensity: 'Intensidade do conflito',
    section_supportiveness: 'Comportamento de apoio',
    section_apologyFrequency: 'Taxa de resolução de conflitos',
    section_redFlags: 'Sinais de alerta',
    section_conflict: 'Intensidade do conflito',
    section_support: 'Comportamento de apoio',
    section_apology: 'Frequência de desculpas',
    imported: 'Importado',
    messages: 'mensagens',
    privacyNote: 'Seus dados são processados de forma efémera e nunca são armazenados permanentemente.',
    fileUploadHelp: 'Formatos: .json, .txt, .zip. Arquivos até 25 MB.',
    premium_badge: 'Premium',
    free_badge: 'Gratuito',
    premium_hint:
      'Análise premium: relatório completo com insights detalhados, exemplos de evidências e exportações.',
    free_hint:
      'Prévia gratuita: apenas visão geral. Desbloqueie relatório completo, evidências e exportações.',
    premium_progress_hint:
      'Executando análise premium: prompts mais profundos, processamento de mídia, geração de perfis de participantes e respostas recomendadas.',
    free_progress_hint:
      'Executando análise gratuita: visão geral apenas em texto. Faça upgrade para premium para mídia, perfis de participantes, respostas recomendadas e gráficos de atividade.',
    progress_premium_features_profiles: 'Geração de perfis psicológicos dos participantes',
    progress_premium_features_replies: 'Criação de exemplos de respostas saudáveis',
    progress_premium_features_activity: 'Construção do gráfico de atividade diária',
    selectPlatform: 'Selecionar plataforma',
    platform_auto: 'Detecção automática',
    platform_telegram: 'Telegram',
    platform_whatsapp: 'WhatsApp',
    platform_signal: 'Signal',
    platform_discord: 'Discord',
    platform_messenger: 'Facebook Messenger',
    platform_imessage: 'iMessage',
    platform_viber: 'Viber',
    platform_generic: 'TXT / SMS / outra plataforma',
    recommended: 'Recomendado',
    selectFile: 'Selecionar arquivo',
    clickToSelectFile: 'Clique para selecionar arquivo',
    dragDropHint: 'Arraste seu export aqui ou clique para escolher um arquivo.',
    ready: 'Pronto',
    uploadAndAnalyze: 'Carregar e analisar',
    inputMode_upload: 'Carregar exportação',
    inputMode_paste: 'Colar texto',
    inputMode_media: 'Mídia / voz',
    upload_media_title: 'Enviar imagem ou áudio',
    upload_media_hint:
      'Suportado: imagens (png, jpg, jpeg, webp, gif) e áudio (mp3, wav, ogg, opus, m4a, webm). Máx. 25MB.',
    choose_file: 'Escolher arquivo',
    record_voice_title: 'Gravar uma mensagem de voz',
    record_voice_hint: 'Até {{seconds}} segundos. Vamos transcrever automaticamente.',
    start_recording: 'Iniciar gravação',
    stop_recording: 'Parar ({{seconds}}s)',
    recording: 'Gravando...',
    mic_permission_error: 'Não foi possível acessar o microfone. Permita o acesso e tente novamente.',
    progress_media_voice: 'Analisando a gravação de voz...',
    voice_coming_soon: 'A transcrição de voz chegará na próxima versão.',
    pasteLabel: 'Cole um pequeno trecho da sua conversa',
    pastePlaceholder:
      'Cole as mensagens aqui (apenas um trecho pequeno, não todo o histórico de anos)...',
    pasteHelp:
      'Funciona melhor com trechos pequenos. Para históricos longos, use a exportação do chat.',
    analyzePasted: 'Analisar texto colado',
    paste_error_empty: 'Cole primeiro um texto de conversa.',
    paste_error_too_long:
      'O texto colado é muito longo. Use um trecho menor (até 8000 caracteres).',
    paste_error_not_conversation:
      'Parece que isso não é uma conversa, mas um texto aleatório. Cole um trecho real de chat.',
    exportTXT: 'Exportar TXT',
    exportJSON: 'Exportar JSON',
    exportPDF: 'Exportar PDF',
    exportReportTitle: 'Relatório de análise',
    exportGeneratedBy: 'Criado com "Texts With my Ex" - AI Gaslight Detection App',
    exportDate: 'Data',
    exportOverview: 'Visão geral',
    exportScores: 'Pontuações',
    exportPatterns: 'Padrões',
    exportEvidence: 'Evidências',
    analysisDefaultOverview: 'Análise concluída. Revise as seções para obter insights detalhados.',
    analysisDefaultNoPatterns: 'Análise concluída. Nenhum padrão específico detectado neste trecho.',
    analysisDefaultTitle: 'Análise',
    analysisParseError: 'Análise concluída com resultados parciais devido a um erro de análise.',
    analysisEmptySummary: 'Análise concluída. Nenhum padrão específico detectado nesta seção.',
    analysisGenericWarningTitle:
      'Parece que a IA retornou apenas um resumo genérico sem exemplos concretos.',
    analysisGenericWarningBody:
      'Tente executar a análise novamente. Se isso continuar acontecendo, divida a conversa em trechos menores.',
    showDetails: 'Mostrar detalhes',
    hideDetails: 'Ocultar detalhes',

    // Ajuda para exportar chats
    exportHelpTitle: 'Como exportar suas conversas',
    exportHelpTelegram:
      'Telegram (computador): abra a conversa → menu → “Exportar histórico de chat” → escolha JSON ou texto e envie o arquivo para cá.',
    exportHelpWhatsApp:
      'WhatsApp (celular): abra a conversa → menu → “Exportar conversa” → escolha Sem mídia (mais rápido) ou Com mídia, envie o arquivo para você mesmo e faça o upload aqui.',
    exportHelpOther:
      'Para Signal, Discord, Facebook Messenger, iMessage/SMS ou Viber, exporte a conversa para um arquivo texto/JSON (ou ZIP) pelo app ou por uma ferramenta confiável e depois envie esse arquivo.',

    // Como funciona
    howItWorks: 'Como funciona',
    step1_title: 'Envie sua conversa',
    step1_description: 'Exporte sua conversa do Telegram ou WhatsApp e envie aqui. Seus dados são processados com segurança e nunca são armazenados.',
    step2_title: 'Análise IA',
    step2_description: 'Nossa IA analisa padrões de comunicação, detecta comportamentos de gaslighting e identifica dinâmicas relacionais usando métodos científicos.',
    step3_title: 'Obtenha insights',
    step3_description: 'Receba um relatório completo com pontuações, evidências e explicações para ajudá-lo a entender o que realmente aconteceu.',
    howItWorks_subtitle: '3 passos rápidos, então a IA faz o trabalho pesado para você.',
    recentAnalysesTitle: 'Análises recentes',
    recentAnalysesEmpty: 'Seu histórico aparece aqui após o primeiro relatório.',
    recentAnalysesClear: 'Limpar lista',
    recentAnalysesRetention:
      'Armazenado localmente por ~24 horas neste dispositivo. Limpe pelo botão ou apagando cookies/localStorage.',
    recentAnalysesOverviewMissing: 'Análise concluída, mas o resumo está vazio.',
    recentAnalysesClear_confirm:
      'Limpar análises recentes neste dispositivo? Todos os dados locais (localStorage/cookies) serão apagados e não poderão ser recuperados.',
    recentAnalyses_media: 'Envio de mídia',
    recentAnalyses_voice: 'Nota de voz',
    recentAnalyses_paste: 'Conversa colada',

    // Articles
    articles_label: 'Artigos e guias',
    articles_title: 'Guias sobre gaslighting, manipulação e recuperação',
    articles_subtitle:
      'Leituras rápidas para identificar padrões, sair com segurança, elaborar o luto e avançar para dinâmicas mais saudáveis.',
    articles_cta: 'Ler artigo',
    articles_read_time_short: '5 min de leitura',
    articles_tag_awareness: 'Consciência',
    articles_tag_howto: 'Como fazer',
    articles_tag_product: 'Sobre a IA',
    articles_tag_practice: 'Prática',
    articles_tag_support: 'Apoio',
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
    articles_manipulation_title: 'Principais tipos de manipulação em relacionamentos',
    articles_manipulation_description:
      'Chantagem emocional, gaslighting, isolamento, controle e como perceber os padrões.',
    articles_covert_title: 'Narcisismo encoberto: perigo atrás da vulnerabilidade',
    articles_covert_description:
      'Como a postura de vítima, o silêncio punitivo e a “gentileza com condição” mantêm o controle disfarçado.',
    articles_letgo_title: 'Como deixar um vínculo traumático',
    articles_letgo_description:
      'Por que sair é difícil, como preparar a segurança e manter o no-contact sem recaídas.',
    articles_consequences_title: 'Consequências psicológicas de vínculos tóxicos',
    articles_consequences_description:
      'Sintomas tipo TEPT, ansiedade, dissociação, impactos corpo-mente e caminhos de recuperação.',
    articles_chances_title: 'Há chance para este relacionamento?',
    articles_chances_description:
      'Quando a mudança é realista, quais alertas encerram a tentativa e como decidir com segurança.',
    articles_healthy_title: 'Relacionamentos saudáveis não são perfeitos (e tudo bem)',
    articles_healthy_description:
      'Sinais de dinâmica funcional, diferenças para a toxicidade e critérios para avaliar o dia a dia.',

    // Insígnias e cartão de pré-visualização no herói
    hero_badge_patterns: 'Análise profunda de padrões',
    hero_badge_boundaries: 'Limites em primeiro lugar',
    hero_badge_multilang: 'Chats em vários idiomas',
    hero_preview_title: 'Scanner de conversa com IA',
    hero_preview_subtitle: 'Exemplo fictício do que o detector destaca.',
    hero_preview_live: 'Pré-visualização ao vivo',
    hero_preview_flag_title: 'Padrão de gaslighting detectado',
    hero_preview_flag_subtitle:
      'Distorção da realidade · Minimização da experiência · Transferência de culpa',
    hero_preview_score_label: 'Índice de segurança emocional',
    hero_preview_score_low: 'Baixo',
    emotional_safety_medium: 'Médio',
    emotional_safety_high: 'Alto',
    hero_preview_typing: 'A IA ainda está lendo…',
    relationship_health_title: 'Visão geral da relação',

    // Chips de privacidade
    privacy_chip_no_sharing: 'Nada é publicado em lugar nenhum',
    privacy_chip_local_session: 'Apenas nesta sessão',
    privacy_chip_control: 'Você continua no controle',
    demo_metrics_banner:
      'Métricas de demonstração apenas do screenshot. Envie a exportação completa do chat para obter dados precisos.',
    activity_wave_by_day: 'Por dia',
    activity_wave_by_week: 'Por semana',

    // Mensagens de exemplo no chat de pré-visualização
    // left = abusador, right = vítima
    hero_preview_msg1_left: 'Você está exagerando de novo, não foi tão grave assim.',
    hero_preview_msg1_right: 'Eu me lembro disso de um jeito totalmente diferente. Você sempre distorce tudo.',
    hero_preview_msg2_left: 'Se você realmente me amasse, não questionaria tanto isso.',
    hero_preview_msg2_right: 'Eu só quero que a gente converse honestamente sobre o que aconteceu.',
    hero_preview_msg3_left: 'Eu nunca disse isso, você está inventando de novo.',
    hero_preview_msg3_right: 'Eu tenho as mensagens salvas. Por que você sempre nega?',
    hero_preview_msg4_left: 'Talvez o problema seja o quanto você é sensível.',
    hero_preview_msg4_right: 'Não é sobre ser sensível, é sobre o que você disse.',
    hero_preview_msg5_left: 'Todo mundo acha que eu sou razoável, só você reclama.',
    hero_preview_msg5_right: 'Eu não estou tentando começar uma briga, só quero entender.',

    // FAQ curto: por quê e para quem
    faq_why:
      'Este app ajuda você a enxergar padrões de comunicação nas suas conversas — não para apontar culpados, mas para entender melhor o que estava acontecendo entre vocês.',
    faq_forWhom:
      'Ele é para pessoas que se sentem confusas depois de uma relação, suspeitam de manipulação ou gaslighting, ou só querem um olhar externo e neutro sobre seu jeito de se comunicar.',
    faq_notSides:
      'A análise não toma partido e não diz quem está “certo” ou “errado” — ela descreve padrões e mostra exemplos dos dois lados.',
    faq_notTherapy:
      'Isto não é terapia, nem diagnóstico e nem aconselhamento jurídico. É uma perspectiva baseada em IA sobre suas mensagens.',
    faq_goal:
      'O objetivo principal é apoiar a reflexão e o entendimento mútuo, não criar novos conflitos nem servir de "arma" em brigas.',
    help_tooltip_label: 'Ajuda e informações do serviço',
    help_tooltip_title: 'Sobre o serviço',
    help_tooltip_close: 'Fechar',
    report_disclaimer_main:
      'Este relatório é gerado por IA apenas com base nas mensagens que você enviou. Ele pode perder contexto e deve ser visto como uma perspectiva, não como a verdade absoluta.',
    report_disclaimer_safety:
      'Se a sua situação envolve violência, autoagressão ou sensação de perigo, não confie apenas neste app — procure apoio de pessoas de confiança ou de profissionais.',

    // Depoimentos
    testimonials_label: 'HISTÓRIAS REAIS, PERSPECTIVAS MUDADAS',
    testimonials_title: 'Pessoas que usaram isso para entender melhor suas conversas',
    testimonial_anna_name: '«Anna», 28',
    testimonial_anna_role: 'Após término longo',
    testimonial_anna_quote:
      'Eu tinha prints e opiniões de amigos, mas foi a primeira vez que vi toda nossa conversa exposta com calma. Me ajudou a parar de me obsessar com uma briga e ver o padrão maior.',
    testimonial_marco_name: '«Marco», 34',
    testimonial_marco_role: 'Em novo relacionamento',
    testimonial_marco_quote:
      'Usei não para provar nada à minha parceira, mas para verificar minhas próprias reações. O relatório mostrou onde eu escalava ou me fechava, o que era desconfortável — mas útil.',
    testimonial_lea_name: '«Lea», 31',
    testimonial_lea_role: 'Questionando manipulação',
    testimonial_lea_quote:
      'Tinha medo de que me «julgasse» ou meu ex. Em vez disso, parecia um espelho neutro. Não me disse o que fazer, mas me deu palavras para descrever o que sentia.',
    testimonial_sara_name: '«Sara», 29',
    testimonial_sara_role: 'Após relacionamento tóxico',
    testimonial_sara_quote:
      'Finalmente, tinha prova de que não estava louca. Os padrões eram claros — contradições constantes, transferência de culpa. Me deu confiança para seguir em frente.',
    testimonial_david_name: '«David», 35',
    testimonial_david_role: 'Tentando melhorar',
    testimonial_david_quote:
      'Queria entender por que meus relacionamentos sempre falhavam. A análise mostrou meus padrões de comunicação — defensivo, desdenhoso. Difícil de ouvir, mas necessário.',
    // Dashboard
    dashboard_title: 'Cronologia',
    heatmap_title: 'Mapa de calor de atividade',
    heatmap_description:
      'Intensidade da conversa por semana. Vermelho destaca períodos com conflitos ou eventos significativos.',
    calendar_title: 'Calendário da conversa',
    calendar_description:
      'Datas importantes estão destacadas em vermelho. Passe o mouse sobre as datas para ver detalhes.',
    // Gráfico de atividade por dia
    activity_chart_title: 'Atividade por dia',
    activity_chart_description:
      'Mostra em quais dias houve mais mensagens. Picos podem coincidir com períodos de tensão.',
    activity_chart_messages_label: 'Mensagens',
    activity_chart_color_hint:
      'Vermelho ≈ dias ligados a conflitos intensos ou manipulação.',
    important_dates_label: 'Datas importantes',
    important_date: 'Data importante',
    important_dates_list_title: 'Datas importantes',
    message_intensity_label: 'Intensidade de mensagens',
    more_dates: 'mais datas',
    verdict_problematic: 'Problemática',
    participant_profiles_title: 'Perfis dos participantes',
    participant_profiles_description: 'Perfis breves de comunicação para cada participante.',
    reality_check_title: 'Checagem de realidade',
    reality_check_right: 'O que estava certo',
    reality_check_wrong: 'O que estava errado',
    reality_check_whose: 'Percepção mais precisa',
    hard_truth_title: 'Verdade dura',
    hard_truth_verdict: 'Veredito',
    hard_truth_abusive: 'Comportamentos abusivos',
    hard_truth_abusive_label: 'Abusivas',
    hard_truth_toxic_label: 'Tóxicas',
    hard_truth_needs_work_label: 'Precisa de trabalho',
    hard_truth_healthy_label: 'Saudáveis',
    what_you_should_know_title: 'O que você deve saber',
    wysk_could_have_done: 'O que poderia ter sido feito diferente',
    wysk_comm_tools: 'Ferramentas de comunicação',
    wysk_could_be_saved: 'O relacionamento podia ser salvo',
    wysk_why_not_fault: 'Por que não é totalmente sua culpa',
    wysk_what_made_vulnerable: 'O que te deixou vulnerável',
    wysk_patterns_to_watch: 'Padrões para observar',
    wysk_resources: 'Recursos',
    wysk_red_flags_next: 'Alertas para a próxima vez',
    whats_next_kicker: 'Plano de ação',
    whats_next_title: 'E agora?',
    whats_next_subtitle: 'Próximos passos práticos com base nesta análise.',
    whats_next_actions: 'Passos acionáveis',
    whats_next_boundaries: 'Limites para praticar',
    whats_next_support: 'Apoio e recursos',

    testimonial_yuki_name: '«Yuki», 27',
    testimonial_yuki_role: 'Relacionamento à distância',
    testimonial_yuki_quote:
      'Estávamos brigando constantemente por texto. Isso me ajudou a ver que a maioria dos conflitos começava com mal-entendidos, não maldade. Ambos precisávamos nos comunicar melhor.',
    testimonial_sofia_name: '«Sofia», 32',
    testimonial_sofia_role: 'Clareza pós-divórcio',
    testimonial_sofia_quote:
      'Precisava de fechamento. Ler anos de mensagens era esmagador, mas a análise de IA destacou os padrões-chave. Não era sobre culpa — era sobre compreensão.',
    testimonial_mia_name: '«Mia», 26',
    testimonial_mia_role: 'Meses depois do término',
    testimonial_mia_quote:
      'Eu reescrevia a história na cabeça. A linha do tempo com picos deixou tudo menos dramático e mais factual. Finalmente consegui fechar a aba e dormir.',
    testimonial_lucas_name: '«Lucas», 29',
    testimonial_lucas_role: 'Levei para a terapia',
    testimonial_lucas_quote:
      'Minha terapeuta pediu exemplos concretos. O relatório mostrou toda vez que eu desviava com sarcasmo. Desconfortável, mas acelerou a sessão.',
    testimonial_priya_name: '«Priya», 33',
    testimonial_priya_role: 'Mensagens de coparentalidade',
    testimonial_priya_quote:
      'Temos uma criança pequena e as emoções esquentam. A ferramenta destacou onde a culpa aparecia. Ajudou a combinar um roteiro mais calmo antes das entregas.',
    testimonial_noah_name: '«Noah», 31',
    testimonial_noah_role: 'Perceber minha defensiva',
    testimonial_noah_quote:
      'Eu dizia “só estou esclarecendo”, mas o padrão era interromper e minimizar. Agora pratico responder uma coisa de cada vez.',
    testimonial_amira_name: '«Amira», 30',
    testimonial_amira_role: 'Mal-entendidos à distância',
    testimonial_amira_quote:
      'A gente errava o tom o tempo todo. A visão contínua mostrou que o silêncio era quase sempre estresse, não má intenção. Isso reduziu a ansiedade.',
    testimonial_elena_name: '«Elena», 34',
    testimonial_elena_role: 'Organizando anos de áudios',
    testimonial_elena_quote:
      'Eu evitava ouvir horas de áudios de novo. Ver as transcrições alinhadas deixou visíveis os padrões sem reviver tudo.',
    testimonial_tom_name: '«Tom», 30',
    testimonial_tom_role: 'Entender ciclos de conflito',
    testimonial_tom_quote:
      'Eu achava que era “só lógico”. O relatório mostrou o ciclo: sarcasmo → defensiva → muro. Dar nome ajudou a quebrar.',
    testimonial_zahra_name: '«Zahra», 28',
    testimonial_zahra_role: 'Brigas por estresse de visto',
    testimonial_zahra_quote:
      'Estávamos exaustos com burocracia. A linha do tempo mostrava que cada pico vinha após e-mails do consulado. Ficou mais fácil dizer “pausa” na próxima.',
    testimonial_pedro_name: '«Pedro», 37',
    testimonial_pedro_role: 'Reconstruindo confiança',
    testimonial_pedro_quote:
      'Queria prova de que estava melhorando. Ver menos transferência de culpa mês a mês foi o primeiro sinal mensurável.',
    testimonial_lina_name: '«Lina», 25',
    testimonial_lina_role: 'Primeiro término sério',
    testimonial_lina_quote:
      'Eu relia os chats à noite. O resumo deu encerramento mais rápido do que reler tudo.',
    testimonial_chen_name: '«Chen», 33',
    testimonial_chen_role: 'Tom de trabalho em casa',
    testimonial_chen_quote:
      'Minha parceira dizia que eu trazia o tom do escritório. A análise mostrou quantas vezes eu respondia “agora não”. Pequeno, mas soma.',
    testimonial_jasmine_name: '«Jasmine», 29',
    testimonial_jasmine_role: 'Mudando de cidade juntos',
    testimonial_jasmine_quote:
      'Cada briga batia com o estresse da mudança. Ver isso no gráfico facilitou dizer “estamos sobrecarregados, não em guerra”.',
    testimonial_omar_name: '«Omar», 36',
    testimonial_omar_role: 'Pensando demais de madrugada',
    testimonial_omar_quote:
      'Eu reabria chats às 2h. O resumo deu o encerramento que o scroll nunca deu.',
    testimonial_julia_name: '«Julia», 27',
    testimonial_julia_role: 'Percebendo love-bombing',
    testimonial_julia_quote:
      'O padrão de promessas enormes e sumiços ficava óbvio. Não era coisa da minha cabeça.',
    testimonial_mateo_name: '«Mateo», 31',
    testimonial_mateo_role: 'Aprendendo a pedir desculpas',
    testimonial_mateo_quote:
      'Achava que “foi mal você se sentir assim” bastava. Ver marcado me fez praticar pedidos de desculpa de verdade.',

    // Termos e Condições
    terms_title: 'Termos e Condições',
    privacy_title: 'Política de Privacidade',
    refund_title: 'Política de Reembolso',
    pricing_title: 'Preços',
    paddle_buy_label: 'Comprar relatório completo',
    paddle_status_loading: 'Carregando checkout…',
    paddle_status_verifying: 'Verificando pagamento…',
    paddle_status_opening: 'Abrindo checkout seguro…',
    paddle_status_unlocked: 'Premium desbloqueado!',
    paddle_error_missing_token: 'Token de cliente Paddle ausente',
    paddle_error_token_missing: 'Token ausente na resposta',
    paddle_error_unlock: 'Não foi possível desbloquear o premium',
    paddle_error_not_ready: 'Paddle ainda não está pronto',
    paddle_error_start: 'Falha ao iniciar o checkout',
    paddle_error_txn_missing: 'Falta o ID da transação',
    terms_intro:
      'Estes Termos e Condições ("Termos") regem o seu uso do aplicativo web Textos com meu ex ("Serviço"). Ao acessar ou usar o Serviço, você concorda em estar vinculado a estes Termos.',
    terms_section1_title: '1. Descrição do serviço',
    terms_section1_content:
      'Textos com meu ex é uma ferramenta de análise assistida por IA e anônima que permite carregar exportações de chats (por exemplo, Telegram ou WhatsApp) e receber um relatório automatizado sobre padrões de comunicação. Não é terapia, aconselhamento jurídico ou serviço de crise.',
    terms_section2_title: '2. Elegibilidade e uso',
    terms_section2_content:
      'Você só pode usar o Serviço se tiver pelo menos 18 anos e for legalmente capaz de celebrar estes Termos. Você é responsável por garantir que tem o direito de carregar e processar os chats que envia ao Serviço.',
    terms_section3_title: '3. Tratamento de dados e privacidade',
    terms_section3_content:
      'Os chats passam por HTTPS e são descriptografados no servidor para que a IA gere o relatório; não há criptografia ponta a ponta. O acesso é restrito a processos do serviço e fornecedores de modelos. O armazenamento é curto: progresso/tarefas até ~2 horas, análises em cache até ~24 horas, arquivos temporários são removidos na limpeza. A lista local de “análises recentes” (id + breve resumo) fica no seu dispositivo ~24 horas em localStorage/cookies e pode ser apagada pelo botão ou limpando cookies/localStorage. Os dados não são usados para treinar modelos de terceiros. Veja a Política de Privacidade para detalhes.',
    terms_section4_title: '4. Pagamentos e assinaturas',
    terms_section4_content:
      'Certas funcionalidades podem ser oferecidas mediante pagamento (por exemplo, análise premium ou análise de mídia). Os pagamentos são processados através do nosso sistema de processamento de pagamentos. Preços, intervalos de faturamento e regras de reembolso são mostrados no checkout e podem ser atualizados de tempos em tempos.',
    terms_section5_title: '5. Sem garantias',
    terms_section5_content:
      'A análise é gerada por grandes modelos de linguagem e pode ser incompleta, imprecisa ou refletir vieses inerentes a esses modelos. Não garantimos a precisão, completude ou adequação de qualquer análise para sua situação particular.',
    terms_section6_title: '6. Uso proibido',
    terms_section6_content:
      'Você concorda em não usar o Serviço para fins ilegais, violar os direitos de outros ou carregar conteúdo que infrinja propriedade intelectual, privacidade ou outros direitos de terceiros.',
    terms_section7_title: '7. Limitação de responsabilidade',
    terms_section7_content:
      'Na máxima extensão permitida por lei, Textos com meu ex e seus operadores não serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos decorrentes ou relacionados ao seu uso do Serviço.',
    terms_section8_title: '8. Alterações nestes termos',
    terms_section8_content:
      'Podemos atualizar estes Termos de tempos em tempos. A data de "última atualização" no topo desta página indicará quando as alterações entram em vigor. Seu uso continuado do Serviço após quaisquer alterações significa que você aceita os Termos atualizados.',
    terms_section9_title: '9. Contato',
    terms_section9_content:
      'Se você tiver perguntas sobre estes Termos ou o Serviço, entre em contato conosco em spinnermining@gmail.com.',
    legal_label: 'Legal',
    legal_last_updated: 'Última atualização:',
    privacy_intro:
      'Texts with My Ex foi criado para análises anônimas e de curta duração. Processamos apenas os dados que você envia para entregar seu relatório e depois os apagamos rapidamente. Não criamos contas de usuário.',
    privacy_collect_title: 'O que coletamos',
    privacy_collect_item1: 'Exportações de chats e mídias opcionais que você envia para análise.',
    privacy_collect_item2: 'Metadados de progresso (ex.: status da tarefa) armazenados temporariamente para concluir seu relatório.',
    privacy_collect_item3: 'Analítica básica e sinais de rate limiting (IP, user agent) para manter o serviço estável.',
    privacy_use_title: 'Como usamos seus dados',
    privacy_use_item1: 'Para rodar a análise de IA e gerar seu relatório.',
    privacy_use_item2: 'Para solucionar erros e proteger contra abusos.',
    privacy_use_item3: 'Nunca para treinar modelos de terceiros ou criar perfis de publicidade.',
    privacy_retention_title: 'Retenção',
    privacy_retention_text:
      'As tarefas de análise e dados em cache são de curta duração (geralmente menos de 24 horas) e são removidos automaticamente durante a limpeza. Arquivos enviados ao armazenamento de blobs são limpos regularmente. Não mantemos uma cópia de longo prazo das suas conversas.',
    privacy_payment_title: 'Dados de pagamento',
    privacy_payment_text:
      'Pagamentos são processados pela Paddle. Não armazenamos dados de cartão. A Paddle pode coletar sinais de cobrança e prevenção de fraude conforme a política de privacidade deles.',
    privacy_choices_title: 'Suas escolhas',
    privacy_choices_item1: 'Você pode excluir seus dados fechando a página; artefatos armazenados expiram automaticamente.',
    privacy_choices_item2: 'Não envie conteúdo que você não esteja autorizado a compartilhar.',
    privacy_choices_item3: 'Use uma sessão de navegador focada em privacidade se não quiser armazenamento local de tokens.',
    privacy_contact_title: 'Contato',
    privacy_contact_text_prefix: 'Dúvidas sobre privacidade? Escreva para',
    privacy_contact_text_suffix: '.',
    refund_intro:
      'O acesso premium é uma compra única para um relatório completo. Como o relatório é gerado imediatamente usando recursos de IA, todas as vendas são finais após a conclusão do pagamento.',
    refund_no_refunds_title: 'Quando não há reembolso',
    refund_no_refunds_item1: 'Mudança de ideia depois que o relatório é entregue.',
    refund_no_refunds_item2: 'Não gostar do resultado da IA (o serviço é de melhor esforço e não é um conselho garantido).',
    refund_no_refunds_item3: 'Tentar reutilizar a mesma compra para várias análises não relacionadas.',
    refund_issue_title: 'Se algo der errado',
    refund_issue_item1: 'Se o relatório não gerar após o pagamento, fale conosco em até 7 dias.',
    refund_issue_item2: 'Tentaremos rodar a análise novamente; se não for possível, avaliaremos um reembolso.',
    refund_issue_item3: 'Inclua seu ID de transação Paddle e o e-mail ou metadados exibidos no checkout.',
    refund_contact_title: 'Como falar conosco',
    refund_contact_text_prefix: 'Envie um e-mail para',
    refund_contact_text_suffix: 'com seu ID de transação e uma breve descrição do problema. Respondemos o mais rápido possível.',
    pricing_badge_text: 'Pagamento único, sem assinatura',
    pricing_description:
      'Faça uma prévia gratuita para ver suas pontuações e visão geral. Desbloqueie o relatório completo e as exportações com um único checkout seguro via Paddle.',
    pricing_overlay_title: 'Por enquanto grátis',
    pricing_overlay_description:
      'Os preços estão temporariamente ocultos e todo o acesso está liberado gratuitamente. Volte mais tarde para novidades.',
    pricing_overlay_cta: 'Voltar ao início',
    pricing_free_label: 'Prévia',
    pricing_free_price_label: 'Grátis',
    pricing_free_badge: 'Comece aqui',
    pricing_free_description:
      'Veja pontuações principais e um breve resumo antes de pagar. Bom para um check rápido.',
    pricing_free_item1: 'Envie e processe uma conversa',
    pricing_free_item2: 'Veja pontuações principais e um breve panorama',
    pricing_free_item3: 'Linha do tempo básica de atividade',
    pricing_free_cta: 'Iniciar prévia gratuita',
    pricing_premium_label: 'Relatório Premium',
    pricing_price_unit: 'pagamento único',
    pricing_premium_description:
      'Desbloqueie o relatório completo de IA, evidências, perfis dos participantes e todas as opções de exportação. Sem cobranças recorrentes.',
    pricing_premium_item1: 'Quebra completa de evidências e padrões',
    pricing_premium_item2: 'Perfis dos participantes, insights e seção de fechamento',
    pricing_premium_item3: 'Exportar para TXT / JSON / PDF',
    pricing_premium_item4: 'Configurações prioritárias de análise quando disponíveis',
    pricing_premium_cta: 'Comprar relatório completo',
    pricing_checkout_note:
      'O checkout é feito pela Paddle. O preço final e a moeda são confirmados antes do pagamento.',
    pricing_what_you_get_title: 'O que você recebe',
    pricing_what_evidence_title: 'Evidências completas',
    pricing_what_evidence_text:
      'Trechos concretos de mensagens, explicações de padrões e gráficos de atividade diária.',
    pricing_what_exports_title: 'Exportações',
    pricing_what_exports_text:
      'Baixe seu relatório em TXT, JSON ou PDF para usar offline e compartilhar.',
    pricing_what_onetime_title: 'Acesso único',
    pricing_what_onetime_text:
      'Sem assinatura. Cada compra premium libera um relatório completo para a análise atual.',
    pricing_help_text_prefix: 'Precisa de ajuda com cobrança? Escreva para',
    pricing_help_text_suffix: '.',
    donation_beta_label: 'Beta',
    donation_title: 'Apoiar o desenvolvedor',
    donation_text: 'Se este relatório ajudou, uma pequena doação é muito bem-vinda. Obrigado pelo apoio!',
    donation_crypto_only: 'Apenas cripto',
    donation_show_qr: 'Mostrar QR',
    donation_qr_for_wallet: 'QR da carteira',
    donation_close: 'Fechar',
    pdf_safety_concern_title: 'Preocupação de segurança',
    pdf_safety_concern_intro: 'O que vai além do tóxico:',
    pdf_safety_resources: 'Recursos',
    pdf_closure_title: 'Fechamento',
    pdf_closure_right: 'No que ele/ela tinha razão',
    pdf_closure_deserved: 'O que foi merecido',
    pdf_closure_got: 'O que foi recebido',
    pdf_closure_permission: 'Permissão para seguir em frente',
    pdf_closure_end: 'Declaração final',
    install_app: 'Instalar aplicativo',
    install_app_instructions: 'Para instalar este aplicativo:',
    install_app_chrome: 'Chrome/Edge: Clique no ícone de instalação na barra de endereços ou vá em Menu → Instalar aplicativo',
    install_app_safari: 'Safari (iOS): Toque em Compartilhar → Adicionar à tela inicial',
    install_app_firefox: 'Firefox: Ainda não suportado'
  }
};

