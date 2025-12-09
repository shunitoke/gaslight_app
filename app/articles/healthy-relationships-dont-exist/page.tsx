import type { Metadata } from 'next';

import { ArticlePageClient, type ArticleContentByLocale } from '../components/ArticlePageClient';

export const metadata: Metadata = {
  title: 'Здоровые отношения не идеальны (и это нормально)',
  description:
    'Реалистичные признаки работоспособных отношений и отличие от мифа о безупречной гармонии.'
};

const content: ArticleContentByLocale = {
  ru: {
    badge: 'Продукт',
    title: 'Здоровые отношения не идеальны (и это нормально)',
    intro:
      'Реалистичные отношения включают конфликты и периоды дистанции. Отличие от токсичности — в уважении границ, готовности к восстановлению и отсутствии контроля.',
    appHeading: 'Как помогает приложение',
    appPoints: [
      'Помогает отличить рабочие конфликты от токсичных паттернов, опираясь на примеры из переписки.',
      'Показывает частоту и тон ссор, чтобы понимать, где начинается обесценивание или контроль.',
      'Показывает, есть ли примирение после конфликтов или разговоры остаются незавершёнными — важный индикатор здоровья общения.'
    ],
    appCta: 'Открыть приложение',
    sections: [
      {
        heading: 'Что присутствует в рабочих отношениях',
        items: [
          'Ссоры о конкретных действиях, а не атака личности.',
          'Готовность к восстановлению после конфликта и извинения без условий.',
          'Свое пространство: друзья, интересы, время наедине.',
          'Критика направлена на поведение, а не на ценность человека.',
          'Уязвимость без наказания и без использования как рычага.'
        ]
      },
      {
        heading: 'Чего быть не должно',
        items: [
          'Контроль, угрозы, изоляция и любое физическое или психологическое насилие.',
          'Манипуляции через вину, молчаливые наказания, обесценивание достижений.',
          'Системное нарушение границ и требования отчетов за личную жизнь.'
        ]
      },
      {
        heading: 'Практический тест',
        ordered: true,
        items: [
          'Можно ли говорить о чувствах без страха последствий?',
          'Сохраняется ли уважение при конфликте или появляется унижение?',
          'Есть ли поддержка в личном росте, а не уменьшение ценности?',
          'Возможен ли отказ, не ведущий к наказанию?'
        ]
      }
    ]
  },
  en: {
    badge: 'Product',
    title: 'Healthy relationships aren’t perfect (and that’s okay)',
    intro:
      'Realistic relationships include conflict and distance. The difference from toxicity is respect for boundaries, willingness to repair, and absence of control.',
    appHeading: 'How the app helps',
    appPoints: [
      'Helps tell workable conflict from toxic patterns using your chat examples.',
      'Shows frequency and tone of arguments to spot where devaluation or control begins.',
      'Highlights whether repair happens after conflicts or conversations stay unfinished — a key health indicator.'
    ],
    appCta: 'Open the app',
    sections: [
      {
        heading: 'What healthy dynamics include',
        items: [
          'Fights about actions, not attacks on the person.',
          'Willingness to repair after conflict and unconditional apologies.',
          'Personal space: friends, interests, time alone.',
          'Critique aimed at behavior, not worth as a person.',
          'Vulnerability without punishment or using it as leverage.'
        ]
      },
      {
        heading: 'What should not be present',
        items: [
          'Control, threats, isolation, and any physical or psychological abuse.',
          'Manipulation via guilt, silent treatment, devaluing achievements.',
          'Systematic boundary violations and demands to report on personal life.'
        ]
      },
      {
        heading: 'Practical check',
        ordered: true,
        items: [
          'Can feelings be discussed without fear of consequences?',
          'Is respect kept during conflict or does humiliation appear?',
          'Is personal growth supported rather than diminished?',
          'Is “no” possible without leading to punishment?'
        ]
      }
    ]
  },
  fr: {
    badge: 'Produit',
    title: 'Des relations saines ne sont pas parfaites (et c’est normal)',
    intro:
      'Les relations réalistes incluent conflits et distance. La différence avec la toxicité : respect des limites, volonté de réparer, absence de contrôle.',
    appHeading: 'Comment l’app aide',
    appPoints: [
      'Aide à distinguer conflits gérables et schémas toxiques à partir de vos messages.',
      'Montre fréquence et ton des disputes pour repérer où commencent dévalorisation ou contrôle.',
      'Indique s’il y a réparation après conflit ou si tout reste en suspens — un indicateur clé de santé.'
    ],
    appCta: "Ouvrir l'application",
    sections: [
      {
        heading: 'Ce qu’on trouve dans une relation fonctionnelle',
        items: [
          'Des conflits sur les actes, pas des attaques sur la personne.',
          'Volonté de réparer après le conflit et excuses sans conditions.',
          'Espace personnel : amis, centres d’intérêt, temps seul.',
          'Critique tournée vers le comportement, pas la valeur de la personne.',
          'Vulnérabilité sans punition ni usage comme levier.'
        ]
      },
      {
        heading: 'Ce qui ne doit pas être présent',
        items: [
          'Contrôle, menaces, isolement et toute violence physique ou psychologique.',
          'Manipulation par la culpabilité, silence punitif, dévalorisation des réussites.',
          'Violations systématiques des limites et demandes de comptes sur la vie privée.'
        ]
      },
      {
        heading: 'Test pratique',
        ordered: true,
        items: [
          'Peut-on parler des émotions sans craindre des conséquences ?',
          'Le respect demeure-t-il en conflit ou l’humiliation apparaît-elle ?',
          'La croissance personnelle est-elle soutenue plutôt que diminuée ?',
          'Un refus est-il possible sans entraîner de punition ?'
        ]
      }
    ]
  },
  de: {
    badge: 'Produkt',
    title: 'Gesunde Beziehungen sind nicht perfekt (und das ist okay)',
    intro:
      'Realistische Beziehungen enthalten Konflikte und Distanz. Der Unterschied zur Toxizität: Respekt vor Grenzen, Bereitschaft zur Reparatur, kein Kontrollverhalten.',
    appHeading: 'Wie die App hilft',
    appPoints: [
      'Hilft, arbeitsfähige Konflikte von toxischen Mustern zu unterscheiden, anhand deiner Chats.',
      'Zeigt Häufigkeit und Ton von Streit, um zu sehen, wo Abwertung oder Kontrolle beginnt.',
      'Hebt hervor, ob nach Konflikten repariert wird oder Gespräche offen bleiben — ein wichtiger Gesundheitsindikator.'
    ],
    appCta: 'App öffnen',
    sections: [
      {
        heading: 'Was in funktionalen Beziehungen vorkommt',
        items: [
          'Streit über Handlungen, keine Angriffe auf die Person.',
          'Bereitschaft zur Reparatur nach Konflikt und Entschuldigungen ohne Bedingungen.',
          'Eigenraum: Freunde, Interessen, Zeit für sich.',
          'Kritik zielt auf Verhalten, nicht auf den Wert der Person.',
          'Verletzlichkeit ohne Strafe oder Einsatz als Hebel.'
        ]
      },
      {
        heading: 'Was nicht vorkommen sollte',
        items: [
          'Kontrolle, Drohungen, Isolation und jede Form von physischer oder psychischer Gewalt.',
          'Manipulation durch Schuld, Schweigen als Strafe, Abwertung von Leistungen.',
          'Systematische Grenzverletzungen und Forderung nach Berichten über das Privatleben.'
        ]
      },
      {
        heading: 'Praktischer Check',
        ordered: true,
        items: [
          'Kann man über Gefühle sprechen, ohne Konsequenzen zu fürchten?',
          'Bleibt Respekt im Konflikt oder taucht Demütigung auf?',
          'Wird persönliches Wachstum unterstützt statt geschmälert?',
          'Ist ein „Nein“ möglich, ohne bestraft zu werden?'
        ]
      }
    ]
  },
  es: {
    badge: 'Producto',
    title: 'Las relaciones sanas no son perfectas (y está bien)',
    intro:
      'Las relaciones realistas incluyen conflicto y distancia. La diferencia con la toxicidad es el respeto a los límites, la disposición a reparar y la ausencia de control.',
    appHeading: 'Cómo ayuda la app',
    appPoints: [
      'Ayuda a diferenciar conflictos manejables de patrones tóxicos usando tus chats.',
      'Muestra frecuencia y tono de discusiones para ver dónde empieza la desvalorización o el control.',
      'Destaca si hay reparación tras los conflictos o si las conversaciones quedan abiertas — indicador clave de salud.'
    ],
    appCta: 'Abrir la app',
    sections: [
      {
        heading: 'Lo que sí está en relaciones funcionales',
        items: [
          'Discusiones sobre acciones, no ataques a la persona.',
          'Voluntad de reparar tras el conflicto y disculpas sin condiciones.',
          'Espacio propio: amigos, intereses, tiempo a solas.',
          'Crítica dirigida a la conducta, no al valor personal.',
          'Vulnerabilidad sin castigo ni uso como palanca.'
        ]
      },
      {
        heading: 'Lo que no debería estar',
        items: [
          'Control, amenazas, aislamiento y cualquier violencia física o psicológica.',
          'Manipulación con culpa, castigos silenciosos, desvalorización de logros.',
          'Violaciones sistemáticas de límites y exigencia de reportes sobre la vida privada.'
        ]
      },
      {
        heading: 'Prueba práctica',
        ordered: true,
        items: [
          '¿Se pueden hablar las emociones sin miedo a consecuencias?',
          '¿Se mantiene el respeto en el conflicto o aparece humillación?',
          '¿Se apoya el crecimiento personal en vez de reducirlo?',
          '¿Es posible decir “no” sin que lleve a castigo?'
        ]
      }
    ]
  },
  pt: {
    badge: 'Produto',
    title: 'Relacionamentos saudáveis não são perfeitos (e está tudo bem)',
    intro:
      'Relacionamentos realistas incluem conflito e distância. A diferença da toxicidade é o respeito aos limites, a prontidão para reparar e a ausência de controle.',
    appHeading: 'Como o app ajuda',
    appPoints: [
      'Ajuda a diferenciar conflitos manejáveis de padrões tóxicos usando seus chats.',
      'Mostra frequência e tom das discussões para ver onde começa desvalorização ou controle.',
      'Indica se há reparação após conflitos ou se as conversas ficam abertas — um indicador-chave de saúde.'
    ],
    appCta: 'Abrir o app',
    sections: [
      {
        heading: 'O que existe em relações funcionais',
        items: [
          'Discussões sobre ações, não ataques à pessoa.',
          'Disposição para reparar após conflito e pedidos de desculpas sem condições.',
          'Espaço próprio: amigos, interesses, tempo a sós.',
          'Crítica voltada ao comportamento, não ao valor pessoal.',
          'Vulnerabilidade sem punição nem uso como alavanca.'
        ]
      },
      {
        heading: 'O que não deve existir',
        items: [
          'Controle, ameaças, isolamento e qualquer violência física ou psicológica.',
          'Manipulação via culpa, silêncio punitivo, desvalorização de conquistas.',
          'Violações sistemáticas de limites e exigência de relatórios sobre a vida pessoal.'
        ]
      },
      {
        heading: 'Checklist prático',
        ordered: true,
        items: [
          'É possível falar de sentimentos sem medo de consequências?',
          'O respeito se mantém no conflito ou surge humilhação?',
          'Há apoio ao crescimento pessoal em vez de reduzi-lo?',
          'Um “não” é possível sem levar a punição?'
        ]
      }
    ]
  }
};

export default function HealthyRelationshipsMythPage() {
  return <ArticlePageClient content={content} />;
}

