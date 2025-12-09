import type { Metadata } from 'next';

import { ArticlePageClient, type ArticleContentByLocale } from '../components/ArticlePageClient';

export const metadata: Metadata = {
  title: 'Ключевые виды манипуляций в отношениях',
  description:
    'Эмоциональный шантаж, газлайтинг, изоляция, нарушение границ и как замечать повторяющиеся паттерны.'
};

const content: ArticleContentByLocale = {
  ru: {
    badge: 'Осознанность',
    title: 'Ключевые виды манипуляций в отношениях',
    intro:
      'Манипуляции подменяют реальность, вызывая чувство вины и зависимость. Важно замечать повторяющиеся приемы, а не только отдельные эпизоды.',
    appHeading: 'Как помогает приложение',
    appPoints: [
      'Подсвечивает газлайтинг, шантаж и обесценивание в переписках и привязывает их к датам.',
      'Показывает, какие темы сопровождаются изоляцией или контролем, чтобы увидеть систему, а не единичные фразы.',
      'Помогает видеть, где нарушаются границы, и фиксировать формулировки, которые работают или нет.'
    ],
    appCta: 'Открыть приложение',
    sections: [
      {
        heading: 'Частые паттерны',
        items: [
          'Эмоциональный шантаж: «Если любишь — сделай», угрозы страданием или саморазрушением.',
          'Газлайтинг: отрицание фактов, подмена воспоминаний, сомнение в адекватности восприятия.',
          'Изоляция: явные запреты или скрытые обиды и ревность, ведущие к разрыву социальных связей.',
          'Контроль и нарушение границ: проверки телефонов, запреты, требования отчетов.',
          'Роль жертвы: использование собственной уязвимости для получения уступок.',
          'Непредсказуемость («кнут/пряник»): чередование холодности и тепла, создающее зависимость.',
          'Финансовое давление: контроль денег, ограничение заработка, зависимость от партнера.'
        ]
      },
      {
        heading: 'Как распознавать в моменте',
        items: [
          'Решения принимаются из страха реакции, а не из собственных желаний.',
          'После разговора остается растерянность или вина, а не ясность.',
          'Важные события вспоминаются иначе, чем их описывает собеседник.',
          'Контакты с друзьями и семьей становятся редкими или скрытыми.'
        ]
      },
      {
        heading: 'Упражнение: разбор последнего конфликта',
        ordered: true,
        items: [
          'Отметить, какой прием применялся (шантаж, газлайтинг, контроль и т.д.).',
          'Зафиксировать результат для манипулятора и состояние после разговора.',
          'Определить, какая граница была нарушена и как ее вернуть.'
        ]
      }
    ]
  },
  en: {
    badge: 'Awareness',
    title: 'Key types of manipulation in relationships',
    intro:
      'Manipulation swaps reality with guilt and dependency. Spotting repeating tactics matters more than isolated episodes.',
    appHeading: 'How the app helps',
    appPoints: [
      'Highlights gaslighting, blackmail, and devaluation in chats and ties them to dates.',
      'Shows which topics come with isolation or control so you see the system, not single phrases.',
      'Helps track where boundaries are violated and which phrasing works or not.'
    ],
    appCta: 'Open the app',
    sections: [
      {
        heading: 'Common patterns',
        items: [
          'Emotional blackmail: “If you love me—do it,” threats of suffering or self-harm.',
          'Gaslighting: denying facts, swapping memories, making you doubt your perception.',
          'Isolation: explicit bans or covert sulking/jealousy that cuts social ties.',
          'Control and boundary violations: phone checks, bans, demands for reports.',
          'Victim stance: using fragility to obtain concessions.',
          'Unpredictability (hot–cold): alternating coldness and warmth that builds dependency.',
          'Financial pressure: money control, limiting earnings, creating dependence.'
        ]
      },
      {
        heading: 'How to notice in the moment',
        items: [
          'Decisions are made from fear of reaction, not personal choice.',
          'Conversations leave confusion or guilt, not clarity.',
          'Key events are recalled differently than you remember them.',
          'Contacts with friends/family become rare or hidden.'
        ]
      },
      {
        heading: 'Exercise: unpack the last conflict',
        ordered: true,
        items: [
          'Mark which tactic was used (blackmail, gaslighting, control, etc.).',
          'Log the outcome for the manipulator and how you felt after.',
          'Name which boundary was violated and how to restore it.'
        ]
      }
    ]
  },
  fr: {
    badge: 'Conscience',
    title: 'Principales formes de manipulation dans les relations',
    intro:
      'La manipulation remplace la réalité par la culpabilité et la dépendance. Mieux vaut repérer les schémas répétés que les épisodes isolés.',
    appHeading: "Comment l’app aide",
    appPoints: [
      'Met en évidence le gaslighting, le chantage et la dévalorisation dans les messages, avec les dates.',
      'Montre quels sujets s’accompagnent d’isolement ou de contrôle pour voir le système, pas une phrase isolée.',
      'Aide à voir où les limites sont violées et quelles formulations fonctionnent ou non.'
    ],
    appCta: "Ouvrir l'application",
    sections: [
      {
        heading: 'Schémas fréquents',
        items: [
          'Chantage émotionnel : « si tu m’aimes — fais-le », menaces de souffrance ou d’autodestruction.',
          'Gaslighting : nier les faits, remplacer les souvenirs, semer le doute sur sa perception.',
          'Isolement : interdictions explicites ou bouderies/jalousie qui coupent des liens sociaux.',
          'Contrôle et atteintes aux limites : vérification de téléphone, interdictions, exigence de comptes.',
          'Posture de victime : utiliser sa vulnérabilité pour obtenir des concessions.',
          'Imprévisibilité (chaud–froid) : alternance de froideur et de chaleur créant une dépendance.',
          'Pression financière : contrôle de l’argent, limitation des revenus, dépendance.'
        ]
      },
      {
        heading: 'Comment repérer sur le moment',
        items: [
          'Les décisions se prennent par peur de la réaction, pas par choix personnel.',
          'Les échanges laissent confusion ou culpabilité, pas de clarté.',
          'Les faits marquants sont racontés différemment de vos souvenirs.',
          'Les contacts avec proches deviennent rares ou cachés.'
        ]
      },
      {
        heading: 'Exercice : décortiquer le dernier conflit',
        ordered: true,
        items: [
          'Noter quelle tactique était utilisée (chantage, gaslighting, contrôle, etc.).',
          'Consigner le résultat pour le manipulateur et votre état après.',
          'Identifier quelle limite a été violée et comment la rétablir.'
        ]
      }
    ]
  },
  de: {
    badge: 'Bewusstsein',
    title: 'Zentrale Manipulationstypen in Beziehungen',
    intro:
      'Manipulation ersetzt Realität durch Schuld und Abhängigkeit. Wiederkehrende Taktiken zu erkennen ist wichtiger als Einzelfälle.',
    appHeading: 'Wie die App hilft',
    appPoints: [
      'Hebt Gaslighting, Erpressung und Abwertung in Chats hervor und verknüpft sie mit Daten.',
      'Zeigt, welche Themen mit Isolation oder Kontrolle einhergehen, um das System zu sehen, nicht nur einzelne Sätze.',
      'Hilft zu erkennen, wo Grenzen verletzt werden und welche Formulierungen wirken oder nicht.'
    ],
    appCta: 'App öffnen',
    sections: [
      {
        heading: 'Häufige Muster',
        items: [
          'Emotionaler Druck/Erpressung: „Wenn du mich liebst – mach es“, Drohungen mit Leid oder Selbstschaden.',
          'Gaslighting: Leugnen von Fakten, Austausch von Erinnerungen, Zweifel an der Wahrnehmung säen.',
          'Isolation: offene Verbote oder verdecktes Schmollen/Eifersucht, die soziale Bindungen kappen.',
          'Kontrolle und Grenzverletzung: Telefonchecks, Verbote, Berichtspflichten.',
          'Opferhaltung: eigene Verletzlichkeit als Hebel für Zugeständnisse.',
          'Unberechenbarkeit (heiß–kalt): Wechsel von Kälte und Wärme, der Abhängigkeit erzeugt.',
          'Finanzieller Druck: Geldkontrolle, Einschränkung des Einkommens, Abhängigkeit.'
        ]
      },
      {
        heading: 'Im Moment erkennen',
        items: [
          'Entscheidungen werden aus Angst vor Reaktionen getroffen, nicht aus eigenen Wünschen.',
          'Gespräche hinterlassen Verwirrung oder Schuld statt Klarheit.',
          'Wichtige Ereignisse werden anders erzählt als man sie erinnert.',
          'Kontakte zu Freunden/Familie werden selten oder versteckt.'
        ]
      },
      {
        heading: 'Übung: letzten Konflikt aufdröseln',
        ordered: true,
        items: [
          'Notieren, welche Taktik eingesetzt wurde (Erpressung, Gaslighting, Kontrolle usw.).',
          'Ergebnis für den Manipulator und eigenes Befinden danach festhalten.',
          'Grenze benennen, die verletzt wurde, und wie man sie zurücksetzt.'
        ]
      }
    ]
  },
  es: {
    badge: 'Conciencia',
    title: 'Tipos clave de manipulación en las relaciones',
    intro:
      'La manipulación reemplaza la realidad por culpa y dependencia. Importa más ver los patrones repetidos que episodios sueltos.',
    appHeading: 'Cómo ayuda la app',
    appPoints: [
      'Resalta gaslighting, chantaje y desvalorización en los chats y los vincula a fechas.',
      'Muestra qué temas vienen con aislamiento o control para ver el sistema, no frases sueltas.',
      'Ayuda a ver dónde se violan límites y qué frases funcionan o no.'
    ],
    appCta: 'Abrir la app',
    sections: [
      {
        heading: 'Patrones frecuentes',
        items: [
          'Chantaje emocional: “Si me quieres, hazlo”, amenazas de sufrimiento o autodaño.',
          'Gaslighting: negar hechos, cambiar recuerdos, hacer dudar de la propia percepción.',
          'Aislamiento: prohibiciones explícitas o enfado/celos que rompen lazos sociales.',
          'Control y violación de límites: revisar teléfonos, prohibiciones, exigencia de reportes.',
          'Rol de víctima: usar la vulnerabilidad para obtener concesiones.',
          'Impredictibilidad (frío–calor): alternar frialdad y calidez generando dependencia.',
          'Presión financiera: controlar dinero, limitar ingresos, crear dependencia.'
        ]
      },
      {
        heading: 'Cómo notarlo en el momento',
        items: [
          'Las decisiones se toman por miedo a la reacción, no por elección propia.',
          'Las conversaciones dejan confusión o culpa, no claridad.',
          'Los hechos clave se recuerdan distinto a como los narra la otra persona.',
          'Los contactos con amistades/familia se vuelven raros o se ocultan.'
        ]
      },
      {
        heading: 'Ejercicio: analiza el último conflicto',
        ordered: true,
        items: [
          'Marca qué táctica se usó (chantaje, gaslighting, control, etc.).',
          'Registra el resultado para el manipulador y tu estado después.',
          'Define qué límite se violó y cómo lo recuperarás.'
        ]
      }
    ]
  },
  pt: {
    badge: 'Consciência',
    title: 'Principais tipos de manipulação em relacionamentos',
    intro:
      'A manipulação troca a realidade por culpa e dependência. Importa mais ver as táticas repetidas do que episódios isolados.',
    appHeading: 'Como o app ajuda',
    appPoints: [
      'Destaca gaslighting, chantagem e desvalorização nas conversas e liga aos dias.',
      'Mostra quais temas vêm com isolamento ou controle para enxergar o sistema, não frases soltas.',
      'Ajuda a ver onde limites são violados e quais falas funcionam ou não.'
    ],
    appCta: 'Abrir o app',
    sections: [
      {
        heading: 'Padrões frequentes',
        items: [
          'Chantagem emocional: “Se me ama, faça”, ameaças de sofrimento ou autoagressão.',
          'Gaslighting: negar fatos, trocar memórias, fazer duvidar da percepção.',
          'Isolamento: proibições explícitas ou mau humor/ciúme que cortam laços sociais.',
          'Controle e violação de limites: checar telefone, proibições, exigência de relatórios.',
          'Papel de vítima: usar fragilidade para obter concessões.',
          'Imprevisibilidade (frio–calor): alternar frieza e calor gerando dependência.',
          'Pressão financeira: controle do dinheiro, limitar ganhos, criar dependência.'
        ]
      },
      {
        heading: 'Como perceber na hora',
        items: [
          'Decisões são tomadas por medo da reação, não por vontade própria.',
          'Conversas deixam confusão ou culpa, não clareza.',
          'Fatos importantes são lembrados diferente do relato do outro.',
          'Contatos com amigos/família ficam raros ou escondidos.'
        ]
      },
      {
        heading: 'Exercício: destrinche o último conflito',
        ordered: true,
        items: [
          'Marque qual tática foi usada (chantagem, gaslighting, controle etc.).',
          'Registre o resultado para o manipulador e seu estado depois.',
          'Defina qual limite foi violado e como vai recuperá-lo.'
        ]
      }
    ]
  }
};

export default function ManipulationTypesPage() {
  return <ArticlePageClient content={content} />;
}

