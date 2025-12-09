import type { Metadata } from 'next';

import { ArticlePageClient, type ArticleContentByLocale } from '../components/ArticlePageClient';

export const metadata: Metadata = {
  title: 'Как прожить горе после трудных отношений',
  description:
    'Нелинейные стадии горя после токсичной динамики и способы вернуть устойчивость, смысл и опору на себя.'
};

const content: ArticleContentByLocale = {
  ru: {
    badge: 'Поддержка',
    title: 'Как прожить горе после трудных отношений',
    intro:
      'Завершение токсичной связи приносит одновременно облегчение и пустоту. Горе идет волнами и редко движется линейно — важны терпение к себе и простые ритуалы восстановления.',
    appHeading: 'Как помогает приложение',
    appPoints: [
      'Дает объективный срез переписки, чтобы увидеть реальность, а не идеализированные воспоминания.',
      'Отмечает эпизоды газлайтинга и обесценивания, разделяя фантазию о партнере и факты.',
      'Показывает, какие темы особенно триггерят откат, чтобы готовиться заранее.'
    ],
    appCta: 'Открыть приложение',
    sections: [
      {
        heading: 'Пять стадий, которые смешиваются',
        items: [
          'Отрицание — оцепенение, автоматические действия, попытка убедить себя, что разрыв временный.',
          'Гнев — энергия к партнеру, себе или обстоятельствам; помогает увидеть границы.',
          'Торг и вина — попытки придумать сценарий, где прошлое можно исправить.',
          'Печаль — апатия, усталость, снижение мотивации; важны структура и забота о себе.',
          'Принятие — признание факта разрыва, спад триггеров, планирование будущего.'
        ]
      },
      {
        heading: 'Особенности горя после токсичной динамики',
        items: [
          'Скорбь по образу партнера, которого не было, а не по реальным поступкам.',
          'Травматическая привязка: зависимость от чередования боли и «наград».',
          'Вина за облегчение после разрыва — нормальная реакция нервной системы на снижение стресса.'
        ]
      },
      {
        heading: 'Практические этапы',
        items: [
          'Первые недели (выживание): сон, еда, базовые дела; слезы или пустота допустимы; люди рядом снижают изоляцию.',
          'Первые месяцы (волны боли): дневник фактов вместо прокрутки; меньше триггеров и соцсетей; структура дня и движение.',
          'Дальше (медленное восстановление): новые маршруты и хобби, план будущего без привязки к партнеру, терапия при затяжных симптомах.'
        ]
      },
      {
        heading: 'Триггеры, о которых полезно знать',
        items: [
          'Музыка, места и даты пиковых моментов отношений.',
          'Фразы газлайтинга или обесценивания: «ты слишком чувствительна», «ты всё придумала».',
          'Соцсети и общие знакомые, напоминающие старый сценарий.'
        ]
      },
      {
        heading: 'Ритуалы восстановления',
        items: [
          'Режим сна и питания как фундамент, даже без аппетита и сил.',
          'Заземление: дыхание, растяжка, контрастный душ, прогулки.',
          'Мини-планы на неделю: 1–2 встречи или небольшие дела без связи с прошлым.',
          'Дневник «что реально было» с фактами, а не фантазиями.'
        ]
      },
      {
        heading: 'Когда нужна дополнительная помощь',
        items: [
          'Навязчивые мысли о саморазрушении или нет сил на базовые действия.',
          'Симптомы ПТСР: флэшбеки, панические атаки, сильные нарушения сна.',
          'Откаты в вредящий контакт, хотя понятно, что он разрушает.'
        ]
      }
    ]
  },
  en: {
    badge: 'Support',
    title: 'How to process grief after a hard relationship',
    intro:
      'Ending a toxic bond brings both relief and emptiness. Grief comes in waves, not straight lines — patience and simple rituals matter.',
    appHeading: 'How the app helps',
    appPoints: [
      'Gives an objective slice of chats instead of idealized memories.',
      'Flags gaslighting and devaluation to separate fantasy from facts.',
      'Shows which topics trigger relapses so you can prepare.'
    ],
    appCta: 'Open the app',
    sections: [
      {
        heading: 'Five stages that blend',
        items: [
          'Denial — numbness, autopilot, convincing yourself it is temporary.',
          'Anger — energy at partner, self, or circumstances; highlights boundaries.',
          'Bargaining & guilt — inventing ways to undo the past.',
          'Sadness — apathy, fatigue, low motivation; structure and self-care are key.',
          'Acceptance — acknowledging the breakup, fewer triggers, planning a future.'
        ]
      },
      {
        heading: 'Specifics after toxic dynamics',
        items: [
          'Grief for the imagined partner, not the real behavior.',
          'Trauma bond: dependence on alternating pain and “rewards.”',
          'Guilt for feeling relief — a normal nervous-system response to less stress.'
        ]
      },
      {
        heading: 'Practical phases',
        items: [
          'First weeks (survival): sleep, food, basics; tears or emptiness are okay; people nearby reduce isolation.',
          'First months (waves): fact diary instead of rumination; reduce triggers/social media; daily structure and movement.',
          'Later (slow recovery): new routes and hobbies, future plans without the ex, therapy if symptoms persist.'
        ]
      },
      {
        heading: 'Triggers to expect',
        items: [
          'Music, places, and dates tied to peak moments.',
          'Gaslighting/devaluation phrases: “you’re too sensitive,” “you made it up.”',
          'Social media and mutual acquaintances that pull you back to the script.'
        ]
      },
      {
        heading: 'Restoration rituals',
        items: [
          'Sleep and food routine as a base, even with low appetite or energy.',
          'Grounding: breathing, stretching, contrast showers, walks.',
          'Mini weekly plans: 1–2 small meetups or tasks not linked to the past.',
          '“What really happened” journal with facts, not fantasies.'
        ]
      },
      {
        heading: 'When to seek extra help',
        items: [
          'Intrusive self-harm thoughts or no energy for basics.',
          'PTSD-like symptoms: flashbacks, panic attacks, severe sleep issues.',
          'Slipping back into harmful contact you already know hurts.'
        ]
      }
    ]
  },
  fr: {
    badge: 'Soutien',
    title: 'Vivre le deuil après une relation difficile',
    intro:
      'Mettre fin à un lien toxique apporte à la fois soulagement et vide. Le deuil va par vagues — patience et rituels simples aident.',
    appHeading: "Comment l’app aide",
    appPoints: [
      'Offre une lecture objective des échanges plutôt que des souvenirs idéalisés.',
      'Repère gaslighting et dévalorisation pour distinguer fantasme et réalité.',
      'Montre quels sujets déclenchent des retours douloureux pour s’y préparer.'
    ],
    appCta: "Ouvrir l'application",
    sections: [
      {
        heading: 'Cinq étapes qui se mélangent',
        items: [
          'Déni — engourdissement, pilote automatique, se convaincre que c’est temporaire.',
          'Colère — énergie vers l’autre, soi ou le contexte; rend les limites visibles.',
          'Marchandage & culpabilité — imaginer des scénarios pour corriger le passé.',
          'Tristesse — apathie, fatigue, faible motivation; structure et self-care essentiels.',
          'Acceptation — reconnaître la rupture, moins de déclencheurs, planifier l’avenir.'
        ]
      },
      {
        heading: 'Spécificités après une dynamique toxique',
        items: [
          'Deuil de l’image idéalisée plutôt que des actes réels.',
          'Lien traumatique : dépendance à l’alternance douleur/« récompenses ».',
          'Culpabilité du soulagement — réponse normale du système nerveux à moins de stress.'
        ]
      },
      {
        heading: 'Étapes pratiques',
        items: [
          'Premières semaines (survie) : sommeil, nourriture, bases; larmes ou vide ok; présence d’autrui réduit l’isolement.',
          'Premiers mois (vagues) : journal factuel plutôt que ruminations; moins de déclencheurs/réseaux; structure quotidienne et mouvement.',
          'Après (reconstruction lente) : nouveaux trajets/loisirs, projet d’avenir sans l’ex, thérapie si symptômes persistent.'
        ]
      },
      {
        heading: 'Déclencheurs probables',
        items: [
          'Musique, lieux et dates des moments forts.',
          'Phrases de gaslighting/dévalorisation : « tu es trop sensible », « tu as inventé ».',
          'Réseaux sociaux et connaissances communes ramenant à l’ancien scénario.'
        ]
      },
      {
        heading: 'Rituels de restauration',
        items: [
          'Routine sommeil/alimentation comme base, même sans appétit/énergie.',
          'Ancrage corporel : respiration, étirements, douches contrastées, marches.',
          'Mini-plans hebdo : 1–2 petites rencontres ou tâches sans lien avec le passé.',
          'Journal « ce qui s’est vraiment passé » avec des faits.'
        ]
      },
      {
        heading: 'Quand chercher plus d’aide',
        items: [
          'Pensées intrusives d’auto-agression ou pas d’énergie pour le quotidien.',
          'Symptômes type PTSD : flashbacks, panique, gros troubles du sommeil.',
          'Retour vers un contact nuisible que l’on sait destructeur.'
        ]
      }
    ]
  },
  de: {
    badge: 'Unterstützung',
    title: 'Trauer nach einer schwierigen Beziehung verarbeiten',
    intro:
      'Das Ende einer toxischen Bindung bringt Erleichterung und Leere. Trauer verläuft in Wellen — Geduld und einfache Rituale helfen.',
    appHeading: 'Wie die App hilft',
    appPoints: [
      'Gibt einen objektiven Blick auf Chats statt idealisierter Erinnerungen.',
      'Markiert Gaslighting- und Abwertungs-Episoden, trennt Fantasie von Fakten.',
      'Zeigt Themen, die Rückfälle auslösen, damit man vorbereitet ist.'
    ],
    appCta: 'App öffnen',
    sections: [
      {
        heading: 'Fünf Phasen, die sich mischen',
        items: [
          'Verleugnung — Erstarrung, Autopilot, sich einreden, es sei nur vorübergehend.',
          'Wut — Energie auf Partner, sich selbst oder Umstände; macht Grenzen sichtbar.',
          'Verhandeln & Schuld — Szenarien ersinnen, um die Vergangenheit zu ändern.',
          'Traurigkeit — Apathie, Müdigkeit, wenig Antrieb; Struktur und Selbstfürsorge sind wichtig.',
          'Akzeptanz — Trennung anerkennen, weniger Trigger, Zukunft planen.'
        ]
      },
      {
        heading: 'Besonderheiten nach toxischer Dynamik',
        items: [
          'Trauer um das idealisierte Bild statt um tatsächliches Verhalten.',
          'Traumabindung: Abhängigkeit vom Wechsel aus Schmerz und „Belohnung“.',
          'Schuld über Erleichterung – normale Reaktion des Nervensystems auf weniger Stress.'
        ]
      },
      {
        heading: 'Praktische Phasen',
        items: [
          'Erste Wochen (Überleben): Schlaf, Essen, Basis; Tränen oder Leere okay; Menschen in der Nähe mindern Isolation.',
          'Erste Monate (Wellen): Faktentagebuch statt Grübeln; Trigger/SoMe reduzieren; Tagesstruktur und Bewegung.',
          'Später (langsamer Aufbau): neue Wege/Hobbys, Zukunft ohne Ex planen, Therapie bei anhaltenden Symptomen.'
        ]
      },
      {
        heading: 'Mögliche Trigger',
        items: [
          'Musik, Orte, Daten von Höhepunkten.',
          'Gaslighting-/Abwertungs-Sätze: „du bist zu sensibel“, „du hast dir das ausgedacht“.',
          'Soziale Medien und gemeinsame Bekannte, die ans alte Drehbuch erinnern.'
        ]
      },
      {
        heading: 'Rituale zur Erholung',
        items: [
          'Schlaf- und Essroutine als Basis, auch bei wenig Appetit/Energie.',
          'Erdung: Atmung, Dehnen, Wechselduschen, Spaziergänge.',
          'Mini-Wochenpläne: 1–2 kleine Treffen/Aufgaben ohne Bezug zur Vergangenheit.',
          'Tagebuch „was wirklich war“ mit Fakten statt Fantasie.'
        ]
      },
      {
        heading: 'Wann zusätzliche Hilfe nötig ist',
        items: [
          'Aufdringliche Selbstschadensgedanken oder keine Kraft für Grundtätigkeiten.',
          'PTSD-ähnliche Symptome: Flashbacks, Panikattacken, starker Schlafmangel.',
          'Rückfälle in schädlichen Kontakt, obwohl klar ist, dass er schadet.'
        ]
      }
    ]
  },
  es: {
    badge: 'Apoyo',
    title: 'Cómo transitar el duelo tras una relación difícil',
    intro:
      'Cerrar un vínculo tóxico trae alivio y vacío. El duelo viene en olas — se necesitan paciencia y rituales simples de recuperación.',
    appHeading: 'Cómo ayuda la app',
    appPoints: [
      'Entrega un corte objetivo de los chats en lugar de recuerdos idealizados.',
      'Marca episodios de gaslighting y desvalorización para separar fantasía de hechos.',
      'Muestra qué temas disparan recaídas en recuerdos para anticiparte.'
    ],
    appCta: 'Abrir la app',
    sections: [
      {
        heading: 'Cinco etapas que se mezclan',
        items: [
          'Negación — entumecimiento, piloto automático, convencerte de que es temporal.',
          'Ira — energía hacia pareja, uno mismo o contexto; ayuda a ver límites.',
          'Negociación y culpa — inventar formas de deshacer el pasado.',
          'Tristeza — apatía, cansancio, baja motivación; estructura y autocuidado importan.',
          'Aceptación — reconocer la ruptura, menos disparadores, planear el futuro.'
        ]
      },
      {
        heading: 'Particularidades tras dinámica tóxica',
        items: [
          'Duelo por la imagen idealizada, no por los actos reales.',
          'Vínculo traumático: dependencia de la alternancia dolor/“recompensa”.',
          'Culpa por sentir alivio — respuesta normal del sistema nervioso a menos estrés.'
        ]
      },
      {
        heading: 'Fases prácticas',
        items: [
          'Primeras semanas (supervivencia): sueño, comida, básicos; llanto o vacío están bien; gente cerca reduce aislamiento.',
          'Primeros meses (olas): diario de hechos en vez de rumiación; menos disparadores/redes; estructura diaria y movimiento.',
          'Después (recuperación lenta): nuevas rutas y hobbies, plan de futuro sin la ex pareja, terapia si síntomas siguen.'
        ]
      },
      {
        heading: 'Disparadores probables',
        items: [
          'Música, lugares y fechas de momentos pico.',
          'Frases de gaslighting/desvalorización: “eres muy sensible”, “lo inventaste”.',
          'Redes y conocidos comunes que devuelven al guion.'
        ]
      },
      {
        heading: 'Rituales de restauración',
        items: [
          'Rutina de sueño y comida como base, incluso con poco аппетито o energía.',
          'Enraizamiento: respiración, estiramientos, duchas alternadas, caminatas.',
          'Mini planes semanales: 1–2 reuniones o tareas pequeñas sin vínculo con el pasado.',
          'Diario de “qué pasó en realidad” con hechos, no fantasías.'
        ]
      },
      {
        heading: 'Cuándo buscar ayuda extra',
        items: [
          'Ideas intrusivas de autolesión o sin energía para lo básico.',
          'Síntomas tipo TEPT: flashbacks, pánico, insomnio fuerte.',
          'Recaídas en un contacto dañino que ya sabes que hace mal.'
        ]
      }
    ]
  },
  pt: {
    badge: 'Apoio',
    title: 'Como viver o luto após um relacionamento difícil',
    intro:
      'Encerrar um vínculo tóxico traz alívio e vazio. O luto vem em ondas — paciência e rituais simples ajudam.',
    appHeading: 'Como o app ajuda',
    appPoints: [
      'Entrega um recorte objetivo das conversas em vez de memórias idealizadas.',
      'Marca episódios de gaslighting e desvalorização para separar fantasia de fatos.',
      'Mostra quais temas disparam recaídas em lembranças para se preparar.'
    ],
    appCta: 'Abrir o app',
    sections: [
      {
        heading: 'Cinco etapas que se misturam',
        items: [
          'Negação — entорpecimento, piloto automático, convencer-se de que é temporário.',
          'Raiva — energia voltada ao parceiro, a si ou ao contexto; evidencia limites.',
          'Barganha e culpa — inventar modos de desfazer o passado.',
          'Tristeza — апатия, cansaço, pouca motivação; estrutura e autocuidado importam.',
          'Aceitação — reconhecer a separação, menos gatilhos, planejar o futuro.'
        ]
      },
      {
        heading: 'Específico após dinâmica tóxica',
        items: [
          'Luto pela imagem idealizada, не pelos atos reais.',
          'Vínculo traumático: dependência da alternância dor/“recompensa”.',
          'Culpa por sentir alívio — resposta normal do sistema nervoso à queda do estresse.'
        ]
      },
      {
        heading: 'Fases práticas',
        items: [
          'Primeiras semanas (sobrevivência): sono, comida, básico; choro ou vazio são ok; pessoas por perto reduzem isolamento.',
          'Primeiros meses (ondas): diário de fatos em vez de ruminação; menos gatilhos/redes; rotina diária e movimento.',
          'Depois (recuperação lenta): novos caminhos e hobbies, plano de futuro sem o ex, terapia se sintomas persistirem.'
        ]
      },
      {
        heading: 'Gatilhos comuns',
        items: [
          'Músicas, lugares e datas de momentos marcantes.',
          'Frases de gaslighting/desvalorização: “você é sensível demais”, “você inventou isso”.',
          'Redes sociais e conhecidos em comum que puxam para o roteiro antigo.'
        ]
      },
      {
        heading: 'Rituais de restauração',
        items: [
          'Rotина de sono e alimentação como base, mesmo com pouco аппetite ou energia.',
          'Aterramento: respiração, alongamento, banho alternado, caminhadas.',
          'Mini planos semanais: 1–2 encontros ou tarefas pequenas sem ligação com o passado.',
          'Diário “o que realmente houve” com fatos, não fantasias.'
        ]
      },
      {
        heading: 'Quando buscar ajuda extra',
        items: [
          'Pensamentos intrusivos de autoagressão ou sem energia para o básico.',
          'Sintomas tipo TEPT: flashbacks, pânico, insônia forte.',
          'Retornos a um contato tóxico que você já sabe que faz mal.'
        ]
      }
    ]
  }
};

export default function GriefGuidePage() {
  return <ArticlePageClient content={content} />;
}




