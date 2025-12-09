import type { Metadata } from 'next';

import { ArticlePageClient, type ArticleContentByLocale } from '../components/ArticlePageClient';

export const metadata: Metadata = {
  title: 'Скрытый нарциссизм: опасность под маской уязвимости',
  description:
    'Как тихая обида, позиция жертвы и «добро с условием» используют сочувствие для контроля и зависимости.'
};

const content: ArticleContentByLocale = {
  ru: {
    badge: 'Осознанность',
    title: 'Скрытый нарциссизм: опасность под маской уязвимости',
    intro:
      'Скрытые нарциссические паттерны маскируются ранимостью и просьбами о заботе, но приводят к контролю и обесцениванию окружающих.',
    appHeading: 'Как помогает приложение',
    appPoints: [
      'Показывает, где в переписке «уязвимость» используется как инструмент давления.',
      'Находит циклы молчаливых наказаний, упреков и обесценивания успехов.',
      'Отмечает, в каких темах появляются попытки вызвать вину и чем они заканчиваются — полезно для будущих границ.'
    ],
    appCta: 'Открыть приложение',
    sections: [
      {
        heading: 'Характерные черты',
        items: [
          'Гиперчувствительность к любой критике и быстрое уход в обиду.',
          'Позиция жертвы: ответственность за эмоциональное состояние перекладывается на окружающих.',
          'Тихая зависть к успехам других, обесценивание достижений партнера.',
          'Использование добрых жестов как долга: «после всего, что сделано, теперь нужно соответствовать».',
          'Проекции: обвинения в эгоизме или манипуляциях, которые на самом деле исходят от самого человека.'
        ]
      },
      {
        heading: 'Поведенческие паттерны',
        items: [
          'Молчаливое наказание и холодность вместо прямого разговора.',
          'Перевод любых тем к собственным трудностям, минимизация чужих проблем.',
          'Управление через чувство вины: «без поддержки наступит депрессия».',
          'Обвинение окружающих в тех же чертах, которые не принимаются в себе.'
        ]
      },
      {
        heading: 'Практический тест',
        ordered: true,
        items: [
          'Берется ли ответственность за собственные поступки или ищутся внешние причины?',
          'Есть ли эмпатия к проблемам других, без перевода разговора на себя?',
          'Сохраняются ли границы, когда звучит слово «нет», или включается обида и шантаж?',
          'Радуется ли человек успехам партнера, или они вызывают дистанцию и критику?'
        ]
      }
    ]
  },
  en: {
    badge: 'Awareness',
    title: 'Covert narcissism: danger behind a mask of vulnerability',
    intro:
      'Covert narcissistic patterns hide behind fragility and requests for care but end up controlling and devaluing others.',
    appHeading: 'How the app helps',
    appPoints: [
      'Shows where “vulnerability” in chats is used as leverage.',
      'Finds cycles of silent treatment, reproaches, and devaluing accomplishments.',
      'Highlights topics where guilt is evoked and how it ends — useful for setting future boundaries.'
    ],
    appCta: 'Open the app',
    sections: [
      {
        heading: 'Key traits',
        items: [
          'Hypersensitivity to any criticism and quick retreat into resentment.',
          'Victim stance: responsibility for emotional state is shifted onto others.',
          'Quiet envy of others’ successes and devaluing a partner’s achievements.',
          'Using kind gestures as debt: “after all that was done, now you must comply.”',
          'Projection: accusations of selfishness or manipulation that actually originate from the accuser.'
        ]
      },
      {
        heading: 'Behavioral patterns',
        items: [
          'Silent punishment and coldness instead of direct talk.',
          'Redirecting any topic to their own hardships, minimizing others’ problems.',
          'Control through guilt: “without support I’ll fall into depression.”',
          'Blaming others for the same traits they refuse to see in themselves.'
        ]
      },
      {
        heading: 'Practical check',
        ordered: true,
        items: [
          'Is ownership taken for actions, or are outside causes always blamed?',
          'Is there empathy for others’ problems without steering the talk back to self?',
          'Are boundaries respected when someone says “no,” or do resentment and pressure appear?',
          'Do they celebrate a partner’s success, or does it trigger distance and critique?'
        ]
      }
    ]
  },
  fr: {
    badge: 'Conscience',
    title: 'Narcissisme caché : danger derrière un masque de vulnérabilité',
    intro:
      'Les schémas narcissiques discrets se cachent derrière la fragilité et les demandes de soin, mais mènent au contrôle et à la dévalorisation des autres.',
    appHeading: 'Comment l’app aide',
    appPoints: [
      'Montre où la « vulnérabilité » est utilisée comme levier dans les messages.',
      'Repère les cycles de silence, de reproches et de dévalorisation des réussites.',
      'Met en évidence les thèmes où la culpabilité est provoquée et comment cela se termine — utile pour fixer des limites.'
    ],
    appCta: "Ouvrir l'application",
    sections: [
      {
        heading: 'Traits caractéristiques',
        items: [
          'Hypersensibilité à toute critique et repli rapide dans le ressentiment.',
          'Posture de victime : la responsabilité de l’état émotionnel est déplacée sur les autres.',
          'Jalousie discrète des réussites d’autrui, dévalorisation des succès du partenaire.',
          'Utilisation des gestes bienveillants comme dette : « après tout ce qui a été fait, tu dois être à la hauteur ». ',
          'Projection : accusations d’égoïsme ou de manipulation qui proviennent en réalité de la personne qui accuse.'
        ]
      },
      {
        heading: 'Schémas comportementaux',
        items: [
          'Punition silencieuse et froideur au lieu de parler franchement.',
          'Ramener toute conversation à ses propres difficultés, minimiser les problèmes des autres.',
          'Contrôle par la culpabilité : « sans soutien je vais sombrer dans la dépression ». ',
          'Accuser les autres des mêmes traits qu’on refuse de voir chez soi.'
        ]
      },
      {
        heading: 'Test pratique',
        ordered: true,
        items: [
          'Assume-t-on ses actes ou cherche-t-on toujours des causes extérieures ?',
          'Y a-t-il de l’empathie pour les problèmes des autres sans ramener la discussion à soi ?',
          'Les limites sont-elles respectées quand on dit « non », ou bien viennent rancœur et chantage ?',
          'Se réjouit-on des succès du partenaire ou déclenchent-ils distance et critique ?'
        ]
      }
    ]
  },
  de: {
    badge: 'Bewusstsein',
    title: 'Verdeckter Narzissmus: Gefahr hinter der Maske der Verletzlichkeit',
    intro:
      'Verdeckte narzisstische Muster verstecken sich hinter Verletzlichkeit und Bitte um Fürsorge, führen aber zu Kontrolle und Abwertung anderer.',
    appHeading: 'Wie die App hilft',
    appPoints: [
      'Zeigt, wo „Verletzlichkeit“ in Chats als Druckmittel genutzt wird.',
      'Findet Zyklen von Schweigen, Vorwürfen und Abwertung von Erfolgen.',
      'Hebt Themen hervor, in denen Schuld erzeugt wird und wie es endet – hilfreich für zukünftige Grenzen.'
    ],
    appCta: 'App öffnen',
    sections: [
      {
        heading: 'Typische Merkmale',
        items: [
          'Übersensible Reaktion auf jede Kritik und schneller Rückzug in Groll.',
          'Opferhaltung: Verantwortung für den emotionalen Zustand wird auf andere abgewälzt.',
          'Leiser Neid auf Erfolge anderer und Abwertung der Leistungen des Partners.',
          'Freundliche Gesten als Schuld nutzen: „nach allem, was getan wurde, musst du jetzt entsprechen“. ',
          'Projektion: Vorwürfe von Egoismus oder Manipulation, die eigentlich von der anklagenden Person selbst kommen.'
        ]
      },
      {
        heading: 'Verhaltensmuster',
        items: [
          'Schweigende Bestrafung und Kälte statt direkter Gespräche.',
          'Lenkt jedes Thema auf eigene Schwierigkeiten, minimiert Probleme anderer.',
          'Steuerung über Schuld: „ohne deine Unterstützung falle ich in eine Depression“. ',
          'Andere für dieselben Eigenschaften beschuldigen, die man bei sich nicht anerkennt.'
        ]
      },
      {
        heading: 'Praktischer Check',
        ordered: true,
        items: [
          'Wird Verantwortung übernommen oder werden stets äußere Gründe gesucht?',
          'Gibt es Empathie für Probleme anderer, ohne das Gespräch auf sich zu lenken?',
          'Werden Grenzen respektiert, wenn jemand „nein“ sagt, oder folgen Groll und Druck?',
          'Freut man sich über Erfolge des Partners oder lösen sie Distanz und Kritik aus?'
        ]
      }
    ]
  },
  es: {
    badge: 'Conciencia',
    title: 'Narcisismo encubierto: peligro tras la máscara de vulnerabilidad',
    intro:
      'Los patrones narcisistas encubiertos se esconden tras la fragilidad y las peticiones de cuidado, pero terminan en control y desvalorización de los demás.',
    appHeading: 'Cómo ayuda la app',
    appPoints: [
      'Muestra dónde la “vulnerabilidad” en los chats se usa como herramienta de presión.',
      'Detecta ciclos de silencio punitivo, reproches y devaluación de logros.',
      'Resalta temas donde se induce culpa y cómo terminan — útil para fijar límites futuros.'
    ],
    appCta: 'Abrir la app',
    sections: [
      {
        heading: 'Rasgos característicos',
        items: [
          'Hipersensibilidad a cualquier crítica y rápido refugio en el resentimiento.',
          'Postura de víctima: la responsabilidad del estado emocional se transfiere a otros.',
          'Envidia silenciosa de los éxitos ajenos y desvalorización de los logros de la pareja.',
          'Usar gestos amables como deuda: “después de todo lo que hice, ahora debes corresponder”.',
          'Proyección: acusaciones de egoísmo o manipulación que en realidad provienen de quien acusa.'
        ]
      },
      {
        heading: 'Patrones de comportamiento',
        items: [
          'Castigo silencioso y frialdad en lugar de conversación directa.',
          'Llevar cualquier tema a las propias dificultades, minimizando los problemas de otros.',
          'Control mediante culpa: “sin tu apoyo caeré en depresión”.',
          'Culpar a los demás de los mismos rasgos que no se aceptan en uno mismo.'
        ]
      },
      {
        heading: 'Prueba práctica',
        ordered: true,
        items: [
          '¿Se asume responsabilidad por los actos o siempre se buscan causas externas?',
          '¿Hay empatía hacia los problemas ajenos sin girar la charla hacia uno mismo?',
          '¿Se respetan los límites cuando alguien dice “no” o aparecen resentimiento y presión?',
          '¿Se celebran los éxitos de la pareja o provocan distancia y crítica?'
        ]
      }
    ]
  },
  pt: {
    badge: 'Consciência',
    title: 'Narcisismo encoberto: perigo atrás da máscara de vulnerabilidade',
    intro:
      'Padrões narcisistas encobertos se escondem atrás da fragilidade e de pedidos de cuidado, mas levam ao controle e à desvalorização dos outros.',
    appHeading: 'Como o app ajuda',
    appPoints: [
      'Mostra onde a “vulnerabilidade” nos chats é usada como alavanca.',
      'Encontra ciclos de punição silenciosa, cobranças e desvalorização de conquistas.',
      'Destaca temas onde se desperta culpa e como termina — útil para futuras fronteiras.'
    ],
    appCta: 'Abrir o app',
    sections: [
      {
        heading: 'Traços característicos',
        items: [
          'Hipersensibilidade a qualquer crítica e rápido refúgio no ressentimento.',
          'Postura de vítima: a responsabilidade pelo estado emocional é colocada nos outros.',
          'Inveja silenciosa dos sucessos alheios e desvalorização das conquistas do parceiro.',
          'Uso de gestos gentis como dívida: “depois de tudo que fiz, agora você deve corresponder”.',
          'Projeções: acusações de egoísmo ou manipulação que na verdade partem de quem acusa.'
        ]
      },
      {
        heading: 'Padrões de comportamento',
        items: [
          'Punição silenciosa e frieza em vez de conversa direta.',
          'Levar qualquer tema para as próprias dificuldades, minimizando problemas dos outros.',
          'Controle via culpa: “sem apoio vou cair em depressão”.',
          'Culpar os outros pelos mesmos traços que não se aceita em si.'
        ]
      },
      {
        heading: 'Teste prático',
        ordered: true,
        items: [
          'Assume-se responsabilidade pelos atos ou sempre se buscam causas externas?',
          'Há empatia pelos problemas dos outros sem puxar o assunto para si?',
          'Limites são respeitados quando alguém diz “não”, ou surgem ressentimento e pressão?',
          'Comemora-se o sucesso do parceiro ou isso gera distância e crítica?'
        ]
      }
    ]
  }
};

export default function CovertNarcissismPage() {
  return <ArticlePageClient content={content} />;
}

