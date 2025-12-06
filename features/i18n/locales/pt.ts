import type { LocaleBundle } from '../types';

export const ptBundle: LocaleBundle = {
  locale: 'pt',
  displayName: 'Português',
  messages: {
    appName: 'Textos com meu ex',
    appTagline: 'Um olhar honesto sobre o que aconteceu.',
    hero_tagline: 'Um olhar honesto de IA sobre o que aconteceu.',
    hero_tagline_alt1: 'Por baixo do capô: IA e ciência, não drama.',
    hero_tagline_alt2: 'Comportamento, apego e conflito — analisados por IA para você.',
    hero_cta: 'Analisar conversa com IA',
    hero_copy: 'Carregue suas conversas para obter uma análise imparcial de relacionamentos alimentada por IA.',
    hero_confidential: 'Totalmente confidencial.',
    footer_disclaimer: 'Não é terapia, não é fofoca — apenas clareza IA.',
    footer_visitors_label: 'Visitantes únicos',
    footer_visitors_loading: 'Contando visitantes...',
    footer_analyses_label: 'Análises concluídas',
    footer_analyses_loading: 'Contando análises...',
    language_label: 'Idioma',
    uploadExport: 'Carregar exportação de chat',
    uploadExportDescription: 'Selecione seu arquivo de exportação de chat para começar a análise',
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
    fileUploadHelp:
      'A versão atual funciona melhor com exports pequenos de texto/json. Grátis: apenas arquivos .json e .txt. Premium: .zip com análise de mídia chegará na próxima versão.',
    premium_badge: 'Premium',
    free_badge: 'Gratuito',
    premium_hint:
      'Análise premium com insights psicológicos mais profundos, mais exemplos de evidência e mídia quando disponível.',
    free_hint:
      'Análise gratuita — apenas texto (até 50k mensagens), sem análise de mídia ou modo de análise aprofundada.',
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
    ready: 'Pronto',
    uploadAndAnalyze: 'Carregar e analisar',
    inputMode_upload: 'Carregar exportação',
    inputMode_paste: 'Colar texto',
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

    // Chips de privacidade
    privacy_chip_no_sharing: 'Nada é publicado em lugar nenhum',
    privacy_chip_local_session: 'Apenas nesta sessão',
    privacy_chip_control: 'Você continua no controle',

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
    dashboard_title: 'Painel de análise',
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

    testimonial_yuki_name: '«Yuki», 27',
    testimonial_yuki_role: 'Relacionamento à distância',
    testimonial_yuki_quote:
      'Estávamos brigando constantemente por texto. Isso me ajudou a ver que a maioria dos conflitos começava com mal-entendidos, não maldade. Ambos precisávamos nos comunicar melhor.',
    testimonial_sofia_name: '«Sofia», 32',
    testimonial_sofia_role: 'Clareza pós-divórcio',
    testimonial_sofia_quote:
      'Precisava de fechamento. Ler anos de mensagens era esmagador, mas a análise de IA destacou os padrões-chave. Não era sobre culpa — era sobre compreensão.',

    // Termos e Condições
    terms_title: 'Termos e Condições',
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
      'Processamos seus chats carregados de forma efêmera para gerar um relatório de análise. Os dados carregados e relatórios gerados não são armazenados por mais tempo do que o necessário para fornecer o Serviço e não são usados para treinar modelos de terceiros. Para mais detalhes, consulte nossa Política de Privacidade (quando disponível).',
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
      'Se você tiver perguntas sobre estes Termos ou o Serviço, entre em contato conosco usando os detalhes fornecidos no site principal ou dentro do aplicativo.',
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

