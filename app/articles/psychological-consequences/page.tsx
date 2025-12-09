import type { Metadata } from 'next';

import { ArticlePageClient, type ArticleContentByLocale } from '../components/ArticlePageClient';

export const metadata: Metadata = {
  title: 'Психологические последствия токсичных связей',
  description:
    'ПТСР-подобные симптомы, тревога, диссоциация, влияние на мозг и тело, и что помогает восстановлению.'
};

const content: ArticleContentByLocale = {
  ru: {
    badge: 'Осознанность',
    title: 'Психологические последствия токсичных связей',
    intro:
      'Эмоциональный абьюз оставляет следы в нервной системе: ПТСР-подобные симптомы, тревожность, изменения внимания и памяти. Понимание механизмов помогает строить план восстановления.',
    appHeading: 'Как помогает приложение',
    appPoints: [
      'Дает объективный срез переписки, снижая сомнения в реальности произошедшего.',
      'Помогает увидеть частоту триггерных эпизодов и динамику, чтобы планировать восстановление.',
      'Маркирует повторяющиеся темы конфликтов и нарушения границ, чтобы обсуждать конкретику.'
    ],
    appCta: 'Открыть приложение',
    sections: [
      {
        heading: 'Частые проявления',
        items: [
          'Навязчивые мысли и флэшбеки, усиленные триггерами звуков, слов, мест.',
          'Гипервозбуждение: тревожность, невозможность расслабиться, постоянный поиск угроз.',
          'Избегание: сужение привычек, контактов и мест, чтобы не сталкиваться с триггерами.',
          'Эмоциональное оцепенение, потеря интереса и удовольствия.',
          'Вина и стыд за участие в отношениях, самокритика.'
        ]
      },
      {
        heading: 'Что происходит в мозге и теле',
        items: [
          'Гиперактивность миндалевидного тела и снижение активности префронтальной коры.',
          'Нарушения сна, пищеварения, мышечное напряжение, снижение иммунитета.',
          'Диссоциация как защита: ощущение «не в своем теле» или провалы в памяти.'
        ]
      },
      {
        heading: 'Подходы к восстановлению',
        items: [
          'Безопасность и опора: физическая и эмоциональная среда без угроз.',
          'Психотерапия: trauma-informed, EMDR, КБТ, соматические методы.',
          'Структура дня, движение и дыхательные практики для стабилизации нервной системы.',
          'Поддержка окружения без обесценивания опыта.'
        ]
      },
      {
        heading: 'Когда нужна срочная помощь',
        items: [
          'Мысли о саморазрушении или суициде.',
          'Панические атаки, мешающие базовому функционированию.',
          'Полная утрата сна или аппетита более недели.'
        ]
      }
    ]
  },
  en: {
    badge: 'Awareness',
    title: 'Psychological consequences of toxic bonds',
    intro:
      'Emotional abuse leaves marks on the nervous system: PTSD-like symptoms, anxiety, attention and memory shifts. Knowing the mechanisms helps plan recovery.',
    appHeading: 'How the app helps',
    appPoints: [
      'Gives an objective slice of chats, reducing doubt about what happened.',
      'Shows frequency of triggering episodes and dynamics to plan recovery.',
      'Flags recurring conflict themes and boundary breaks to discuss specifics.'
    ],
    appCta: 'Open the app',
    sections: [
      {
        heading: 'Common manifestations',
        items: [
          'Intrusive thoughts and flashbacks, amplified by sounds, words, places.',
          'Hyperarousal: anxiety, inability to relax, scanning for threats.',
          'Avoidance: narrowing habits, contacts, and places to dodge triggers.',
          'Emotional numbness, loss of interest and pleasure.',
          'Guilt and shame for staying, self-criticism.'
        ]
      },
      {
        heading: 'What happens in brain and body',
        items: [
          'Hyperactive amygdala and reduced prefrontal activity.',
          'Sleep and digestion issues, muscle tension, lowered immunity.',
          'Dissociation as protection: “out of body” feelings or memory gaps.'
        ]
      },
      {
        heading: 'Recovery approaches',
        items: [
          'Safety and support: physical and emotional space without threats.',
          'Therapy: trauma-informed, EMDR, CBT, somatic methods.',
          'Daily structure, movement, and breathing to stabilize the nervous system.',
          'Supportive environment that does not invalidate experience.'
        ]
      },
      {
        heading: 'When urgent help is needed',
        items: [
          'Self-harm or suicidal thoughts.',
          'Panic attacks that block basic functioning.',
          'Complete loss of sleep or appetite for more than a week.'
        ]
      }
    ]
  },
  fr: {
    badge: 'Conscience',
    title: 'Conséquences psychologiques des liens toxiques',
    intro:
      'L’abus émotionnel marque le système nerveux : symptômes proches du PTSD, anxiété, attention et mémoire altérées. Comprendre les mécanismes aide à planifier la récupération.',
    appHeading: 'Comment l’app aide',
    appPoints: [
      'Donne une lecture objective des échanges, pour réduire le doute sur ce qui s’est passé.',
      'Montre la fréquence des épisodes déclencheurs et la dynamique pour planifier la récupération.',
      'Repère les thèmes récurrents et les violations de limites pour en parler concrètement.'
    ],
    appCta: "Ouvrir l'application",
    sections: [
      {
        heading: 'Manifestations courantes',
        items: [
          'Pensées intrusives et flashbacks, amplifiés par sons, mots, lieux.',
          'Hyperactivation : anxiété, impossibilité de se détendre, vigilance aux menaces.',
          'Évitement : réduction des habitudes, contacts et lieux pour esquiver les déclencheurs.',
          'Engourdissement émotionnel, perte d’intérêt et de plaisir.',
          'Culpabilité et honte d’être resté, autocritique.'
        ]
      },
      {
        heading: 'Ce qui se passe dans le cerveau et le corps',
        items: [
          'Amygdale hyperactive et activité préfrontale réduite.',
          'Troubles du sommeil, de la digestion, tensions musculaires, immunité affaiblie.',
          'Dissociation comme protection : sensation de ne pas être dans son corps ou trous de mémoire.'
        ]
      },
      {
        heading: 'Approches de récupération',
        items: [
          'Sécurité et soutien : espace physique et émotionnel sans menace.',
          'Thérapies : trauma-informed, EMDR, TCC, méthodes somatiques.',
          'Structure du quotidien, mouvement et respiration pour stabiliser le système nerveux.',
          'Environnement de soutien qui ne minimise pas l’expérience.'
        ]
      },
      {
        heading: 'Quand chercher une aide urgente',
        items: [
          'Idées d’autodestruction ou suicidaires.',
          'Crises de panique empêchant le fonctionnement de base.',
          'Perte totale de sommeil ou d’appétit pendant plus d’une semaine.'
        ]
      }
    ]
  },
  de: {
    badge: 'Bewusstsein',
    title: 'Psychologische Folgen toxischer Bindungen',
    intro:
      'Emotionaler Missbrauch hinterlässt Spuren im Nervensystem: PTSD-ähnliche Symptome, Angst, Aufmerksamkeits- und Gedächtnisveränderungen. Verständnis hilft bei der Planung der Erholung.',
    appHeading: 'Wie die App hilft',
    appPoints: [
      'Gibt einen objektiven Ausschnitt der Chats, verringert Zweifel am Geschehenen.',
      'Zeigt Häufigkeit von Trigger-Episoden und Dynamik, um Erholung zu planen.',
      'Markiert wiederkehrende Konfliktthemen und Grenzverletzungen für konkrete Gespräche.'
    ],
    appCta: 'App öffnen',
    sections: [
      {
        heading: 'Häufige Erscheinungen',
        items: [
          'Aufdringliche Gedanken und Flashbacks, verstärkt durch Geräusche, Worte, Orte.',
          'Hyperarousal: Angst, Unfähigkeit sich zu entspannen, ständiges Scannen nach Bedrohungen.',
          'Vermeidung: Gewohnheiten, Kontakte und Orte werden eingeschränkt, um Trigger zu meiden.',
          'Emotionale Taubheit, Verlust von Interesse und Freude.',
          'Schuld und Scham, geblieben zu sein, Selbstkritik.'
        ]
      },
      {
        heading: 'Was im Gehirn und Körper passiert',
        items: [
          'Hyperaktive Amygdala und reduzierte präfrontale Aktivität.',
          'Schlaf- und Verdauungsstörungen, Muskelanspannung, geschwächte Immunität.',
          'Dissoziation als Schutz: Gefühl, nicht im eigenen Körper zu sein, oder Erinnerungslücken.'
        ]
      },
      {
        heading: 'Wege zur Erholung',
        items: [
          'Sicherheit und Halt: physischer und emotionaler Raum ohne Bedrohungen.',
          'Therapie: trauma-informed, EMDR, KVT, somatische Methoden.',
          'Tagesstruktur, Bewegung und Atmung zur Stabilisierung des Nervensystems.',
          'Unterstützendes Umfeld, das die Erfahrung nicht abwertet.'
        ]
      },
      {
        heading: 'Wann dringend Hilfe nötig ist',
        items: [
          'Gedanken an Selbstverletzung oder Suizid.',
          'Panikattacken, die Grundfunktionen blockieren.',
          'Völliger Verlust von Schlaf oder Appetit länger als eine Woche.'
        ]
      }
    ]
  },
  es: {
    badge: 'Conciencia',
    title: 'Consecuencias psicológicas de vínculos tóxicos',
    intro:
      'El abuso emocional deja marcas en el sistema nervioso: síntomas tipo TEPT, ansiedad, cambios en atención y memoria. Entenderlo ayuda a planificar la recuperación.',
    appHeading: 'Cómo ayuda la app',
    appPoints: [
      'Da una visión objetiva de los chats, reduciendo la duda sobre lo que ocurrió.',
      'Muestra la frecuencia de episodios detonantes y la dinámica para planificar recuperación.',
      'Marca temas de conflicto y violaciones de límites recurrentes para hablar en concreto.'
    ],
    appCta: 'Abrir la app',
    sections: [
      {
        heading: 'Manifestaciones frecuentes',
        items: [
          'Pensamientos intrusivos y flashbacks, amplificados por sonidos, palabras, lugares.',
          'Hiperactivación: ansiedad, incapacidad de relajarse, búsqueda de amenazas.',
          'Evitación: reducir hábitos, contactos y lugares para esquivar detonantes.',
          'Entumecimiento emocional, pérdida de interés y placer.',
          'Culpa y vergüenza por haber permanecido, autocrítica.'
        ]
      },
      {
        heading: 'Qué pasa en cerebro y cuerpo',
        items: [
          'Amígdala hiperactiva y menor actividad prefrontal.',
          'Problemas de sueño y digestión, tensión muscular, inmunidad baja.',
          'Disociación como defensa: sentirse “fuera del cuerpo” o tener lagunas de memoria.'
        ]
      },
      {
        heading: 'Enfoques de recuperación',
        items: [
          'Seguridad y apoyo: entorno físico y emocional sin amenazas.',
          'Terapia: trauma-informed, EMDR, CBT, métodos somáticos.',
          'Estructura diaria, movimiento y respiración para estabilizar el sistema nervioso.',
          'Apoyo que no invalida la experiencia.'
        ]
      },
      {
        heading: 'Cuándo se necesita ayuda urgente',
        items: [
          'Ideas de autolesión o suicidio.',
          'Ataques de pánico que bloquean el funcionamiento básico.',
          'Pérdida total de sueño o apetito por más de una semana.'
        ]
      }
    ]
  },
  pt: {
    badge: 'Consciência',
    title: 'Consequências psicológicas de vínculos tóxicos',
    intro:
      'O abuso emocional marca o sistema nervoso: sintomas tipo TEPT, ansiedade, alterações de atenção e memória. Entender os mecanismos ajuda a planejar a recuperação.',
    appHeading: 'Como o app ajuda',
    appPoints: [
      'Dá um recorte objetivo dos chats, reduzindo a dúvida sobre o que aconteceu.',
      'Mostra a frequência de episódios gatilho e a dinâmica para planejar a recuperação.',
      'Marca temas recorrentes de conflito e violações de limites para discutir o concreto.'
    ],
    appCta: 'Abrir o app',
    sections: [
      {
        heading: 'Manifestações comuns',
        items: [
          'Pensamentos intrusivos e flashbacks, amplificados por sons, palavras, lugares.',
          'Hiperativação: ansiedade, incapacidade de relaxar, busca de ameaças.',
          'Evitamento: reduzir hábitos, contatos e lugares para driblar gatilhos.',
          'Entorpecimento emocional, perda de interesse e prazer.',
          'Culpa e vergonha por ter ficado, autocrítica.'
        ]
      },
      {
        heading: 'O que ocorre no cérebro e no corpo',
        items: [
          'Amígdala hiperativa e menor atividade do córtex pré-frontal.',
          'Problemas de sono e digestão, tensão muscular, imunidade baixa.',
          'Dissociação como defesa: sensação de “fora do corpo” ou falhas de memória.'
        ]
      },
      {
        heading: 'Caminhos de recuperação',
        items: [
          'Segurança e apoio: ambiente físico e emocional sem ameaças.',
          'Terapia: trauma-informed, EMDR, TCC, métodos somáticos.',
          'Estrutura diária, movimento e respiração para estabilizar o sistema nervoso.',
          'Ambiente de apoio que não invalide a experiência.'
        ]
      },
      {
        heading: 'Quando é necessária ajuda urgente',
        items: [
          'Ideias de autoagressão ou suicídio.',
          'Ataques de pânico que bloqueiam o funcionamento básico.',
          'Perda total de sono ou apetite por mais de uma semana.'
        ]
      }
    ]
  }
};

export default function PsychologicalConsequencesPage() {
  return <ArticlePageClient content={content} />;
}

