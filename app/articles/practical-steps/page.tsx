import type { Metadata } from 'next';

import { ArticlePageClient, type ArticleContentByLocale } from '../components/ArticlePageClient';

export const metadata: Metadata = {
  title: 'Практические шаги, пока отношения еще продолжаются',
  description:
    'Опоры на реальность, восстановление границ, план безопасности и забота о теле без прямых столкновений.'
};

const content: ArticleContentByLocale = {
  ru: {
    badge: 'Практика',
    title: 'Практические шаги, пока отношения еще продолжаются',
    intro:
      'Осознание проблемы не всегда ведет к немедленному разрыву. Эти шаги помогают удерживать опору на факты, восстанавливать границы и готовить безопасность, пока ситуация оценивается.',
    appHeading: 'Как помогает приложение',
    appPoints: [
      'Фиксирует хронологию и интенсивность конфликтов по датам, чтобы видеть динамику, а не единичные эпизоды.',
      'Показывает, где появляются паттерны обесценивания или контроля, и чем отличаются периоды «тепла» и «холода».',
      'Отмечает, какие формулировки границ вызывают эскалацию, а какие проходят мягче — для выбора безопасной стратегии.'
    ],
    appCta: 'Открыть приложение',
    sections: [
      {
        heading: 'Этап 1. Опора на факты',
        items: [
          'Ведение дневника событий: дата, что произошло, дословные реплики, собственное самочувствие.',
          'Периодическая проверка реальности с нейтральным человеком: короткое описание ситуации и взгляд со стороны.',
          'Список личных ценностей и стандартов отношений — напоминание, что считается нормой.'
        ]
      },
      {
        heading: 'Этап 2. Пробные границы',
        items: [
          'Небольшие «нет» в повседневных просьбах и наблюдение за реакцией.',
          'Возврат коротких встреч с друзьями и родственниками как способ вернуть социальную опору.',
          'Фиксация санкций за границы (молчание, обида, давление) — данные о реальном уровне уважения.'
        ]
      },
      {
        heading: 'Этап 3. План безопасности',
        items: [
          'Финансовая подушка: отдельный счет или сбережения, даже небольшие.',
          'Список документов и контактов (психолог, кризисные линии, друзья), сохраненный в защищенном месте.',
          'Проработка сценариев «что если»: физическая агрессия, изоляция, угрозы — кому и куда обращаться.'
        ]
      },
      {
        heading: 'Этап 4. Забота о теле',
        items: [
          'Движение без соревнований: прогулки, йога, плавание — снижение мышечного зажима.',
          'Дыхательные циклы 4-4-4-4 для стабилизации нервной системы перед сложными разговорами.',
          'Режим сна и минимальные ритуалы восстановления: душ, регулярное питание, короткие паузы.'
        ]
      },
      {
        heading: 'Этап 5. Психологическая поддержка',
        items: [
          'Специалисты по травме или абьюзу, если доступно.',
          'Группы поддержки и онлайн-сообщества с модерацией для безопасного обмена опытом.',
          'Переписывание внутреннего нарратива: отделение собственной ответственности от чужой.'
        ]
      },
      {
        heading: 'Сигналы для немедленной помощи',
        items: [
          'Угрозы или физическое насилие.',
          'Попытки изоляции, удержания документов или блокировки доступа к деньгам.',
          'Запугивание саморазрушением или угрозами окружающим.'
        ]
      }
    ]
  },
  en: {
    badge: 'Practice',
    title: 'Practical steps while the relationship is still ongoing',
    intro:
      'Seeing the problem doesn’t always mean an immediate breakup. These steps keep you anchored in facts, restore boundaries, and prepare safety while you assess.',
    appHeading: 'How the app helps',
    appPoints: [
      'Logs chronology and intensity of conflicts by date to show dynamics, not one-off fights.',
      'Shows where devaluation or control patterns appear, and how “warm” and “cold” periods differ.',
      'Notes which boundary phrases escalate and which land softer — to pick a safer strategy.'
    ],
    appCta: 'Open the app',
    sections: [
      {
        heading: 'Step 1. Anchor to facts',
        items: [
          'Keep an event log: date, what happened, verbatim lines, your state.',
          'Periodic reality checks with a neutral person: short description and outside view.',
          'List of personal values and relationship standards — a reminder of what “normal” means.'
        ]
      },
      {
        heading: 'Step 2. Trial boundaries',
        items: [
          'Small “no” in everyday requests and observe the reaction.',
          'Short meetups with friends/family to rebuild social support.',
          'Record sanctions for boundaries (silence, sulking, pressure) — real data on respect level.'
        ]
      },
      {
        heading: 'Step 3. Safety plan',
        items: [
          'Financial cushion: separate account or savings, even small.',
          'List of documents and contacts (therapist, hotlines, friends) stored safely.',
          'Plan “what if”: physical aggression, isolation, threats — who to call and where to go.'
        ]
      },
      {
        heading: 'Step 4. Body care',
        items: [
          'Non-competitive movement: walks, yoga, swimming to release tension.',
          '4-4-4-4 breathing cycles to calm the nervous system before hard talks.',
          'Sleep routine and minimal recovery rituals: shower, regular meals, short breaks.'
        ]
      },
      {
        heading: 'Step 5. Psychological support',
        items: [
          'Trauma/abuse-informed professionals if available.',
          'Support groups and moderated communities for safe sharing.',
          'Rewrite the inner narrative: separate your responsibility from others’.'
        ]
      },
      {
        heading: 'Signals for immediate help',
        items: [
          'Threats or physical violence.',
          'Attempts to isolate, hold documents, or block money access.',
          'Intimidation with self-harm or threats to others.'
        ]
      }
    ]
  },
  fr: {
    badge: 'Pratique',
    title: 'Étapes pratiques tant que la relation continue',
    intro:
      'Voir le problème ne mène pas toujours à une rupture immédiate. Ces étapes aident à rester sur les faits, restaurer les limites et préparer la sécurité pendant l’évaluation.',
    appHeading: "Comment l’app aide",
    appPoints: [
      'Consigne la chronologie et l’intensité des conflits pour voir la dynamique, pas des épisodes isolés.',
      'Montre où apparaissent dévalorisation ou contrôle et comment diffèrent les phases « chaud/froid ».',
      'Note quelles formulations de limites escaladent ou passent mieux — pour choisir une stratégie sûre.'
    ],
    appCta: "Ouvrir l'application",
    sections: [
      {
        heading: 'Étape 1. Ancrage aux faits',
        items: [
          'Journal des événements : date, faits, répliques exactes, état interne.',
          'Vérifications de réalité avec une personne neutre : bref récit et regard extérieur.',
          'Liste de valeurs et standards relationnels — rappel de ce qui est « normal ».'
        ]
      },
      {
        heading: 'Étape 2. Limites à l’essai',
        items: [
          'Petits « non » au quotidien et observation de la réaction.',
          'Retrouver brièvement amis/famille pour recréer du soutien social.',
          'Noter les sanctions aux limites (silence, bouderie, pression) — données sur le respect réel.'
        ]
      },
      {
        heading: 'Étape 3. Plan de sécurité',
        items: [
          'Coussin financier : compte séparé ou épargne, même modeste.',
          'Liste de documents et contacts (thérapeute, lignes d’aide, amis) stockée en lieu sûr.',
          'Scénarios « et si » : agression physique, isolement, menaces — qui appeler, où aller.'
        ]
      },
      {
        heading: 'Étape 4. Soin du corps',
        items: [
          'Mouvement sans compétition : marche, yoga, natation pour détendre.',
          'Respiration 4-4-4-4 pour stabiliser avant les discussions difficiles.',
          'Routine de sommeil et rituels minimum : douche, repas réguliers, petites pauses.'
        ]
      },
      {
        heading: 'Étape 5. Soutien psychologique',
        items: [
          'Professionnels formés au trauma/abus si disponibles.',
          'Groupes de soutien et communautés modérées pour partager en sécurité.',
          'Réécrire le récit interne : séparer sa responsabilité de celle des autres.'
        ]
      },
      {
        heading: 'Signaux pour une aide urgente',
        items: [
          'Menaces ou violence physique.',
          'Tentatives d’isolement, rétention de documents ou blocage d’argent.',
          'Intimidation avec auto-agression ou menaces envers autrui.'
        ]
      }
    ]
  },
  de: {
    badge: 'Praxis',
    title: 'Praktische Schritte, solange die Beziehung noch läuft',
    intro:
      'Probleme zu erkennen führt nicht immer sofort zur Trennung. Diese Schritte halten dich bei den Fakten, stellen Grenzen wieder her und bereiten Sicherheit vor, während du prüfst.',
    appHeading: 'Wie die App hilft',
    appPoints: [
      'Erfasst Chronologie und Intensität von Konflikten nach Datum, um Dynamik zu sehen statt Einzelstreits.',
      'Zeigt, wo Abwertung oder Kontrolle auftauchen und wie sich „warm“/„kalt“-Phasen unterscheiden.',
      'Vermerkt, welche Grenzformulierungen eskalieren oder sanfter wirken — für eine sichere Strategie.'
    ],
    appCta: 'App öffnen',
    sections: [
      {
        heading: 'Schritt 1. Faktenanker',
        items: [
          'Ereignisprotokoll: Datum, was geschah, wörtliche Sätze, eigener Zustand.',
          'Regelmäßiger Realitätscheck mit neutraler Person: kurze Beschreibung und Außenblick.',
          'Liste persönlicher Werte und Beziehungsstandards — Erinnerung, was „normal“ ist.'
        ]
      },
      {
        heading: 'Schritt 2. Test-Grenzen',
        items: [
          'Kleine „Nein“ im Alltag und Reaktion beobachten.',
          'Kurze Treffen mit Freunden/Familie, um soziale Stütze zurückzuholen.',
          'Sanktionen auf Grenzen notieren (Schweigen, Groll, Druck) — Daten über Respekt.'
        ]
      },
      {
        heading: 'Schritt 3. Sicherheitsplan',
        items: [
          'Finanzpolster: separates Konto oder Ersparnis, auch klein.',
          'Liste von Dokumenten und Kontakten (Therapeut, Hotlines, Freunde) sicher ablegen.',
          '„Was-wäre-wenn“-Szenarien: physische Aggression, Isolation, Drohungen — wen anrufen, wohin gehen.'
        ]
      },
      {
        heading: 'Schritt 4. Körperpflege',
        items: [
          'Bewegung ohne Wettkampf: Spaziergänge, Yoga, Schwimmen zum Lösen von Anspannung.',
          '4-4-4-4-Atmung zur Beruhigung des Nervensystems vor schwierigen Gesprächen.',
          'Schlafroutine und minimale Erholungsrituale: Dusche, regelmäßige Mahlzeiten, kurze Pausen.'
        ]
      },
      {
        heading: 'Schritt 5. Psychologische Unterstützung',
        items: [
          'Trauma-/Missbrauchserfahrene Fachleute, falls verfügbar.',
          'Selbsthilfegruppen und moderierte Communities für sicheren Austausch.',
          'Inneres Narrativ neu schreiben: eigene Verantwortung von fremder trennen.'
        ]
      },
      {
        heading: 'Warnsignale für sofortige Hilfe',
        items: [
          'Drohungen oder körperliche Gewalt.',
          'Versuche der Isolation, Festhalten von Dokumenten oder Geldblockade.',
          'Einschüchtern mit Selbstverletzung oder Drohungen gegen andere.'
        ]
      }
    ]
  },
  es: {
    badge: 'Práctica',
    title: 'Pasos prácticos mientras la relación sigue',
    intro:
      'Ver el problema no siempre lleva a cortar de inmediato. Estos pasos te mantienen en los hechos, restauran límites y preparan seguridad mientras evalúas.',
    appHeading: 'Cómo ayuda la app',
    appPoints: [
      'Registra cronología e intensidad de conflictos por fecha para ver la dinámica, no peleas aisladas.',
      'Muestra dónde aparecen patrones de desvalorización o control y cómo se diferencian las fases “calor/frío”.',
      'Anota qué frases de límites escalan y cuáles pasan más suave — para elegir estrategia segura.'
    ],
    appCta: 'Abrir la app',
    sections: [
      {
        heading: 'Paso 1. Anclaje a los hechos',
        items: [
          'Lleva un diario de eventos: fecha, qué pasó, frases textuales, tu estado.',
          'Chequeos de realidad con alguien neutral: breve descripción y mirada externa.',
          'Lista de valores y estándares de relación — recordatorio de qué es “normal”.'
        ]
      },
      {
        heading: 'Paso 2. Límites de prueba',
        items: [
          'Pequeños “no” en pedidos diarios y observar la reacción.',
          'Retomar breves encuentros con amistades/familia para recuperar apoyo social.',
          'Registrar sanciones ante límites (silencio, enojo, presión) — datos reales sobre respeto.'
        ]
      },
      {
        heading: 'Paso 3. Plan de seguridad',
        items: [
          'Colchón financiero: cuenta separada o ahorros, aunque sean pequeños.',
          'Lista de documentos y contactos (terapeuta, líneas de ayuda, amistades) guardada a salvo.',
          'Plan “qué hago si”: agresión física, aislamiento, amenazas — a quién llamar y adónde ir.'
        ]
      },
      {
        heading: 'Paso 4. Cuidado del cuerpo',
        items: [
          'Movimiento sin competir: caminar, yoga, nadar para soltar tensión.',
          'Respiración 4-4-4-4 para calmar el sistema nervioso antes de conversaciones difíciles.',
          'Rutina de sueño y rituales mínimos de recuperación: ducha, comidas regulares, pausas cortas.'
        ]
      },
      {
        heading: 'Paso 5. Apoyo psicológico',
        items: [
          'Profesionales con enfoque en trauma/abuso si es posible.',
          'Grupos de apoyo y comunidades moderadas para compartir con seguridad.',
          'Reescribir la narrativa interna: separar tu responsabilidad de la ajena.'
        ]
      },
      {
        heading: 'Señales para ayuda inmediata',
        items: [
          'Amenazas o violencia física.',
          'Intentos de aislar, retener documentos o bloquear dinero.',
          'Intimidación con autolesión o amenazas a terceros.'
        ]
      }
    ]
  },
  pt: {
    badge: 'Prática',
    title: 'Passos práticos enquanto o relacionamento continua',
    intro:
      'Perceber o problema nem sempre leva a terminar já. Estes passos mantêm você nos fatos, restauram limites e preparam segurança enquanto avalia.',
    appHeading: 'Como o app ajuda',
    appPoints: [
      'Registra cronologia e intensidade dos conflitos por data para ver a dinâmica, não brigas isoladas.',
      'Mostra onde surgem padrões de desvalorização ou controle e como diferem fases de “calor/frio”.',
      'Anota quais frases de limites escalam e quais passam melhor — para escolher estratégia segura.'
    ],
    appCta: 'Abrir o app',
    sections: [
      {
        heading: 'Passo 1. Apoio nos fatos',
        items: [
          'Diário de eventos: data, o que ocorreu, falas literais, seu estado.',
          'Checagens de realidade com pessoa neutra: breve descrição e visão externa.',
          'Lista de valores e padrões de relacionamento — lembrete do que é “normal”.'
        ]
      },
      {
        heading: 'Passo 2. Limites de teste',
        items: [
          'Pequenos “não” em pedidos cotidianos e observar a reação.',
          'Retomar encontros curtos com amigos/família para recuperar apoio social.',
          'Registrar sanções aos limites (silêncio, mágoa, pressão) — dados reais sobre respeito.'
        ]
      },
      {
        heading: 'Passo 3. Plano de segurança',
        items: [
          'Reserva financeira: conta separada ou poupança, mesmo pequena.',
          'Lista de documentos e contatos (terapeuta, linhas de ajuda, amigos) guardada em local seguro.',
          'Planos “e se”: agressão física, isolamento, ameaças — quem chamar e para onde ir.'
        ]
      },
      {
        heading: 'Passo 4. Cuidado do corpo',
        items: [
          'Movimento sem competição: caminhadas, yoga, natação para aliviar tensão.',
          'Respiração 4-4-4-4 para acalmar antes de conversas difíceis.',
          'Rotina de sono e rituais mínimos de recuperação: banho, refeições regulares, pausas curtas.'
        ]
      },
      {
        heading: 'Passo 5. Apoio psicológico',
        items: [
          'Profissionais com experiência em trauma/abuso, se possível.',
          'Grupos de apoio e comunidades moderadas para compartilhar com segurança.',
          'Reescrever a narrativa interna: separar sua responsabilidade da dos outros.'
        ]
      },
      {
        heading: 'Sinais para ajuda imediata',
        items: [
          'Ameaças ou violência física.',
          'Tentativas de isolamento, retenção de documentos ou bloqueio de dinheiro.',
          'Intimidação com autoagressão ou ameaças a terceiros.'
        ]
      }
    ]
  }
};

export default function PracticalStepsPage() {
  return <ArticlePageClient content={content} />;
}

