import type { Metadata } from 'next';

import { ArticlePageClient, type ArticleContentByLocale } from '../components/ArticlePageClient';

export const metadata: Metadata = {
  title: 'Есть ли шанс у отношений?',
  description:
    'Когда изменения реалистичны, какие красные флаги закрывают попытки и как принимать решения безопасно.'
};

const content: ArticleContentByLocale = {
  ru: {
    badge: 'Инструкция',
    title: 'Есть ли шанс у отношений?',
    intro:
      'Изменение поведения возможно, но требует признания проблемы, готовности к помощи и длительной работы. Некоторые красные флаги закрывают попытки — их важно учитывать заранее.',
    appHeading: 'Как помогает приложение',
    appPoints: [
      'Фиксирует динамику критики, угроз и перемен, чтобы оценивать реальный прогресс, а не обещания.',
      'Показывает циклы «обещание — откат», чтобы не терять годы в повторении сценариев.',
      'Помогает видеть, где договорённости выполняются, а где возвращаются старые паттерны.'
    ],
    appCta: 'Открыть приложение',
    sections: [
      {
        heading: 'Когда шанс реалистичен',
        items: [
          'Осознание и признание нанесенного вреда без оправданий.',
          'Готовность к профессиональной помощи, а не только к обещаниям «сам изменюсь».',
          'Видимые изменения в поведении на горизонте месяцев, а не дней.',
          'Наличие у каждой стороны опоры и выхода: финансовой, социальной, эмоциональной.'
        ]
      },
      {
        heading: 'Красные флаги, которые закрывают попытки',
        items: [
          'Отрицание проблемы или перекладывание вины.',
          'Физическое насилие и угрозы — риск эскалации, а не платформа для изменений.',
          'Повторяющийся цикл обещаний и откатов без устойчивых сдвигов.',
          'Полная утрата собственной идентичности и ресурсов для безопасности.'
        ]
      },
      {
        heading: 'Практический чек-лист решения',
        ordered: true,
        items: [
          'Есть ли признание проблемы и ответственность со стороны инициатора вреда?',
          'Готов ли он/она к помощи и внешней поддержке, а не только к словам?',
          'Есть ли желание продолжать отношения по собственной воле, а не из страха?',
          'Улучшается ли самочувствие от текущей динамики или продолжается истощение?',
          'Есть ли реальный выход, если изменения остановятся?'
        ]
      }
    ]
  },
  en: {
    badge: 'Guide',
    title: 'Is there a chance for this relationship?',
    intro:
      'Behavior change is possible but requires admitting harm, seeking help, and sustained work. Some red flags shut attempts down — factor them early.',
    appHeading: 'How the app helps',
    appPoints: [
      'Captures the dynamics of criticism, threats, and shifts to judge real progress, not promises.',
      'Shows “promise → relapse” cycles so you don’t lose years repeating the pattern.',
      'Helps see where agreements hold and where old patterns return.'
    ],
    appCta: 'Open the app',
    sections: [
      {
        heading: 'When a chance is realistic',
        items: [
          'Acknowledging harm without excuses.',
          'Willingness to get professional help, not just “I’ll change on my own.”',
          'Visible behavior shifts over months, not days.',
          'Each side has support and exits: financial, social, emotional.'
        ]
      },
      {
        heading: 'Red flags that close the door',
        items: [
          'Denying the problem or shifting blame.',
          'Physical violence or threats — risk of escalation, not a change platform.',
          'Repeating promise–relapse cycles without sustained shifts.',
          'Total loss of self/identity and safety resources.'
        ]
      },
      {
        heading: 'Decision checklist',
        ordered: true,
        items: [
          'Is there admission of harm and responsibility from the one who caused it?',
          'Are they ready for help and external support, not only words?',
          'Do you want to continue by choice, not fear?',
          'Is your wellbeing improving, or does exhaustion persist?',
          'Is there a real exit if change stops?'
        ]
      }
    ]
  },
  fr: {
    badge: 'Guide',
    title: 'Y a-t-il une chance pour cette relation ?',
    intro:
      'Le changement est possible mais exige reconnaissance du tort, recours à de l’aide et travail durable. Certains signaux rouges ferment la porte — à considérer tôt.',
    appHeading: 'Comment l’app aide',
    appPoints: [
      'Capture la dynamique de critiques, menaces et changements pour juger le progrès réel, pas les promesses.',
      'Montre les cycles « promesse → rechute » pour ne pas perdre des années à répéter le scénario.',
      'Aide à voir où les accords tiennent et où les anciens schémas reviennent.'
    ],
    appCta: "Ouvrir l'application",
    sections: [
      {
        heading: 'Quand la chance est réaliste',
        items: [
          'Reconnaissance du tort sans excuses.',
          'Volonté d’obtenir de l’aide professionnelle, pas seulement « je changerai tout seul ». ',
          'Changements visibles du comportement sur des mois, pas des jours.',
          'Chaque partie a des appuis et des sorties : financiers, sociaux, émotionnels.'
        ]
      },
      {
        heading: 'Signaux rouges qui bloquent',
        items: [
          'Négation du problème ou renvoi de la faute.',
          'Violence ou menaces physiques — risque d’escalade, pas base de changement.',
          'Cycle répétitif promesse–rechute sans évolution durable.',
          'Perte totale d’identité et de ressources de sécurité.'
        ]
      },
      {
        heading: 'Checklist de décision',
        ordered: true,
        items: [
          'Y a-t-il reconnaissance du tort et responsabilité par la personne à l’origine ?',
          'Est-elle prête à l’aide et au soutien extérieur, pas seulement aux paroles ?',
          'Envie de continuer par choix, pas par peur ?',
          'Le bien-être s’améliore-t-il ou l’épuisement continue ?',
          'Existe-t-il une vraie sortie si le changement s’arrête ?'
        ]
      }
    ]
  },
  de: {
    badge: 'Anleitung',
    title: 'Gibt es eine Chance für diese Beziehung?',
    intro:
      'Veränderung ist möglich, braucht aber Eingeständnis von Schaden, Hilfe und dauerhafte Arbeit. Manche Warnsignale schließen Versuche früh.',
    appHeading: 'Wie die App hilft',
    appPoints: [
      'Erfasst Dynamik von Kritik, Drohungen und Veränderungen, um echten Fortschritt statt Versprechen zu bewerten.',
      'Zeigt „Versprechen → Rückfall“-Zyklen, damit du nicht Jahre im Muster verlierst.',
      'Hilft zu sehen, wo Absprachen halten und wo alte Muster zurückkehren.'
    ],
    appCta: 'App öffnen',
    sections: [
      {
        heading: 'Wann eine Chance realistisch ist',
        items: [
          'Eingeständnis des Schadens ohne Ausreden.',
          'Bereitschaft zu professioneller Hilfe, nicht nur „ich ändere mich allein“. ',
          'Sichtbare Verhaltensänderungen über Monate, nicht Tage.',
          'Beide Seiten haben Halt und Ausstieg: finanziell, sozial, emotional.'
        ]
      },
      {
        heading: 'Warnsignale, die es beenden',
        items: [
          'Leugnen des Problems oder Schuldverschiebung.',
          'Körperliche Gewalt oder Drohungen — Risiko der Eskalation, keine Basis für Veränderung.',
          'Wiederholter Zyklus aus Versprechen und Rückfall ohne nachhaltige Verschiebung.',
          'Völliger Verlust von Identität und Sicherheitsressourcen.'
        ]
      },
      {
        heading: 'Entscheidungs-Checkliste',
        ordered: true,
        items: [
          'Gibt es Eingeständnis des Problems und Verantwortung beim Verursacher?',
          'Ist Bereitschaft zu Hilfe und externer Unterstützung da, nicht nur Worte?',
          'Willst du weitermachen aus freier Wahl, nicht aus Angst?',
          'Verbessert sich dein Befinden oder bleibt Erschöpfung?',
          'Gibt es einen echten Ausstieg, falls Änderung stoppt?'
        ]
      }
    ]
  },
  es: {
    badge: 'Guía',
    title: '¿Hay una oportunidad para esta relación?',
    intro:
      'El cambio es posible, pero requiere admitir el daño, buscar ayuda y trabajo sostenido. Algunas banderas rojas cierran el intento — considérelas temprano.',
    appHeading: 'Cómo ayuda la app',
    appPoints: [
      'Registra la dinámica de crítica, amenazas y cambios para medir progreso real, no promesas.',
      'Muestra ciclos “promesa → retroceso” para no perder años repitiendo el patrón.',
      'Ayuda a ver dónde se cumplen acuerdos y dónde vuelven patrones antiguos.'
    ],
    appCta: 'Abrir la app',
    sections: [
      {
        heading: 'Cuándo la oportunidad es realista',
        items: [
          'Reconocer el daño sin excusas.',
          'Disposición a ayuda profesional, no solo “cambio yo solo”.',
          'Cambios visibles en meses, no días.',
          'Cada parte tiene apoyo y salida: financiera, social, emocional.'
        ]
      },
      {
        heading: 'Banderas rojas que cierran el intento',
        items: [
          'Negar el problema o echar la culpa.',
          'Violencia o amenazas físicas — riesgo de escalada, no base de cambio.',
          'Ciclo repetido promesa–retroceso sin cambios sostenidos.',
          'Pérdida total de identidad y de recursos de seguridad.'
        ]
      },
      {
        heading: 'Checklist de decisión',
        ordered: true,
        items: [
          '¿Hay reconocimiento del daño y responsabilidad de quien lo causó?',
          '¿Está dispuesto/a a ayuda y apoyo externo, no solo palabras?',
          '¿Quieres seguir por elección y no por miedo?',
          '¿Mejora tu bienestar o sigue el agotamiento?',
          '¿Hay una salida real si el cambio se detiene?'
        ]
      }
    ]
  },
  pt: {
    badge: 'Guia',
    title: 'Há chance para este relacionamento?',
    intro:
      'Mudança é possível, mas exige admitir o dano, buscar ajuda e trabalho contínuo. Alguns alertas fecham a tentativa — considere-os cedo.',
    appHeading: 'Como o app ajuda',
    appPoints: [
      'Registra a dinâmica de críticas, ameaças e mudanças para medir progresso real, não promessas.',
      'Mostra ciclos “promessa → recaída” para não perder anos repetindo o padrão.',
      'Ajuda a ver onde acordos se cumprem e onde padrões antigos voltam.'
    ],
    appCta: 'Abrir o app',
    sections: [
      {
        heading: 'Quando a chance é realista',
        items: [
          'Reconhecimento do dano sem desculpas.',
          'Disposição para ajuda profissional, não só “eu mudo sozinho”.',
          'Mudanças visíveis em meses, não em dias.',
          'Cada lado tem apoio e saída: financeira, social, emocional.'
        ]
      },
      {
        heading: 'Alertas que fecham a tentativa',
        items: [
          'Negar o problema ou jogar culpa.',
          'Violência ou ameaças físicas — risco de escalada, não base de mudança.',
          'Ciclo repetido de promessa e recaída sem mudança sustentada.',
          'Perda total de identidade e de recursos de segurança.'
        ]
      },
      {
        heading: 'Checklist de decisão',
        ordered: true,
        items: [
          'Há reconhecimento do problema e responsabilidade de quem causou?',
          'Há prontidão para ajuda e suporte externo, não só palavras?',
          'Quer continuar por escolha, não por medo?',
          'Seu bem-estar melhora ou o esgotamento continua?',
          'Há uma saída real se a mudança parar?'
        ]
      }
    ]
  }
};

export default function RelationshipChancesPage() {
  return <ArticlePageClient content={content} />;
}

