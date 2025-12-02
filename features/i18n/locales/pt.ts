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
    footer_disclaimer: 'Não é terapia, não é fofoca — apenas clareza IA.',
    language_label: 'Idioma',
    uploadExport: 'Carregar exportação de chat',
    uploadExportDescription: 'Selecione seu arquivo de exportação de chat para começar a análise',
    analyzing: 'IA analisando conversa...',
    progress_starting: 'Inicializando análise IA...',
    progress_parsing: 'Analisando conversa...',
    progress_analyzing: 'IA analisando padrões de conversa...',
    progress_media: 'IA analisando conteúdo de mídia...',
    progress_chunking: 'Processando segmentos de conversa...',
    progress_completed: 'Análise IA concluída!',
    progress_error: 'Análise IA falhou',
    progress_analyzing_hint: 'A IA está analisando padrões, estilos de comunicação e dinâmicas relacionais...',
    progress_media_hint: 'Analisando imagens, stickers e conteúdo de mídia com modelos de visão IA...',
    progress_chunk_label: 'Segmento {current} de {total}',
    progress_disclaimer: 'Por favor, não feche esta janela enquanto a análise estiver em andamento.',
    backToHome: 'Voltar ao início',
    noAnalysisFound: 'Nenhuma análise encontrada. Por favor, carregue uma conversa primeiro.',
    analysisReport: 'Relatório de análise IA',
    gaslightingRisk: 'Risco de manipulação',
    conflictIntensity: 'Intensidade do conflito',
    supportiveness: 'Comportamento de apoio',
    apologyFrequency: 'Frequência de desculpas',
    evidence: 'Evidências',
    scientificAnalysis: 'Análise científica',
    plainLanguage: 'Em termos simples',
    score: 'Pontuação',
    section_gaslighting: 'Risco de manipulação',
    section_conflictIntensity: 'Intensidade do conflito',
    section_supportiveness: 'Comportamento de apoio',
    section_apologyFrequency: 'Frequência de desculpas',
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
      'Executando análise premium: prompts mais profundos e uso de mídia (quando disponível).',
    free_progress_hint:
      'Executando análise gratuita: visão geral apenas em texto. Faça upgrade para premium para mídia e insights mais profundos.',
    selectPlatform: 'Selecionar plataforma',
    platform_telegram: 'Telegram',
    platform_whatsapp: 'WhatsApp',
    platform_signal: 'Signal',
    platform_discord: 'Discord',
    platform_messenger: 'Facebook Messenger',
    platform_imessage: 'iMessage',
    platform_viber: 'Viber',
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
      'Certas funcionalidades podem ser oferecidas mediante pagamento (por exemplo, análise premium ou análise de mídia). Os pagamentos são processados por nosso provedor de pagamento, Paddle, atuando como comerciante. Preços, intervalos de faturamento e regras de reembolso são mostrados no checkout e podem ser atualizados de tempos em tempos.',
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
      'Se você tiver perguntas sobre estes Termos ou o Serviço, entre em contato conosco usando os detalhes fornecidos no site principal ou dentro do aplicativo.'
  }
};

