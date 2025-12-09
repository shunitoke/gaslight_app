import type { Metadata } from 'next';

import { ArticlePageClient, type ArticleContentByLocale } from '../components/ArticlePageClient';

export const metadata: Metadata = {
  title: 'Как отпустить травматическую привязку',
  description: 'Почему сложно уйти, как подготовиться и удерживать границы в период отмены контакта.'
};

const content: ArticleContentByLocale = {
  ru: {
    badge: 'Поддержка',
    title: 'Как отпустить травматическую привязку',
    intro:
      'Отпустить травматическую связь непросто: циклы боли и «наград» усиливают зависимость. Подготовка и структура помогают пройти период отмены контакта безопаснее.',
    appHeading: 'Как помогает приложение',
    appPoints: [
      'Фиксирует болезненные паттерны в переписке, напоминая, почему разрыв необходим.',
      'Отмечает, с каких тем начинается повторный контакт и какие сообщения запускают откаты.',
      'Позволяет отметить, какие попытки держать дистанцию срабатывают, а какие снова тянут в контакт.'
    ],
    appCta: 'Открыть приложение',
    sections: [
      {
        heading: 'Почему сложно отпускать',
        items: [
          'Травматическая привязка: чередование боли и редкого тепла формирует зависимость.',
          'Ложная надежда на изменение сценария удерживает в связке.',
          'Идентичность сплетена с отношениями, разрыв требует собрать себя заново.',
          'Страх неизвестности сильнее знакомой боли.'
        ]
      },
      {
        heading: 'Ключевые этапы',
        ordered: true,
        items: [
          'Осознание и фиксация решения: записать факты, которые привели к решению.',
          'Подготовка: план жилья, документы, безопасные контакты, финансовая подушка.',
          'Момент разрыва: сценарий безопасного выхода, опора на поддержку.',
          'Первые недели без контакта: структура дня, движение, исключение триггеров.',
          'Возврат к жизни: новые маршруты, занятия, социальные связи.'
        ]
      },
      {
        heading: 'Инструменты удержания границ',
        items: [
          'Письмо, которое не отправляется, для выражения накопленных эмоций.',
          'Ритуал отпускания (разрыв/сжигание напоминаний, символическое завершение).',
          'Полный no-contact или четкий low-contact, если есть совместные дела или дети.',
          'Дневник «почему я ухожу» — для чтения в моменты сомнений.'
        ]
      }
    ]
  },
  en: {
    badge: 'Support',
    title: 'Letting go of a traumatic bond',
    intro:
      'Letting go is hard: cycles of pain and “rewards” create dependence. Preparation and structure make the no-contact phase safer.',
    appHeading: 'How the app helps',
    appPoints: [
      'Logs painful patterns in chats to remind why the break is needed.',
      'Shows which topics reopen contact and which messages trigger relapses.',
      'Tracks which distance attempts work and which pull you back.'
    ],
    appCta: 'Open the app',
    sections: [
      {
        heading: 'Why it’s hard to let go',
        items: [
          'Trauma bond: alternating pain and rare warmth forms dependence.',
          'False hope of changing the script keeps you attached.',
          'Identity intertwined with the relationship; rupture means rebuilding self.',
          'Fear of the unknown outweighs familiar pain.'
        ]
      },
      {
        heading: 'Key stages',
        ordered: true,
        items: [
          'Decision and facts: write what led to the choice.',
          'Preparation: housing plan, documents, safe contacts, financial cushion.',
          'Break moment: safe exit script, leaning on support.',
          'First weeks no-contact: daily structure, movement, removing triggers.',
          'Re-entry: new routes, activities, social ties.'
        ]
      },
      {
        heading: 'Boundary tools',
        items: [
          'Unsent letter to express stored emotions.',
          'Letting-go ritual (tearing/burning reminders, symbolic closure).',
          'Full no-contact or clear low-contact if shared duties/children.',
          '“Why I’m leaving” diary for doubt moments.'
        ]
      }
    ]
  },
  fr: {
    badge: 'Soutien',
    title: 'Se détacher d’un lien traumatique',
    intro:
      'Se détacher est difficile : alternance de douleur et de rares « récompenses » crée la dépendance. La préparation et la structure rendent la période sans contact plus sûre.',
    appHeading: 'Comment l’app aide',
    appPoints: [
      'Consigne les schémas douloureux dans les messages pour rappeler pourquoi la rupture est nécessaire.',
      'Montre quels sujets rouvrent le contact et quels messages déclenchent les rechutes.',
      'Sert à noter quelles tentatives de distance fonctionnent et lesquelles ramènent en arrière.'
    ],
    appCta: "Ouvrir l'application",
    sections: [
      {
        heading: 'Pourquoi c’est difficile',
        items: [
          'Lien traumatique : alternance douleur/chaleur crée la dépendance.',
          'Faux espoir de changer le scénario maintient l’attache.',
          'Identité entremêlée à la relation; rupture = se reconstruire.',
          'La peur de l’inconnu est plus forte que la douleur familière.'
        ]
      },
      {
        heading: 'Étapes clés',
        ordered: true,
        items: [
          'Décision et faits : noter ce qui a mené au choix.',
          'Préparation : logement, documents, contacts sûrs, matelas financier.',
          'Moment de rupture : scénario de sortie sécurisée, appui sur le soutien.',
          'Premières semaines sans contact : structure du jour, mouvement, retrait des déclencheurs.',
          'Reprise : nouveaux trajets, activités, liens sociaux.'
        ]
      },
      {
        heading: 'Outils pour garder les limites',
        items: [
          'Lettre non envoyée pour exprimer les émotions accumulées.',
          'Rituel de lâcher-prise (déchirer/brûler des rappels, clôture symbolique).',
          'No-contact complet ou low-contact clair s’il y a des obligations ou des enfants.',
          'Journal « pourquoi je pars » pour les moments de doute.'
        ]
      }
    ]
  },
  de: {
    badge: 'Unterstützung',
    title: 'Eine traumatische Bindung lösen',
    intro:
      'Loslassen ist schwer: Wechsel aus Schmerz und seltenem „Wärme“-Gefühl schafft Abhängigkeit. Vorbereitung und Struktur machen die No-Contact-Phase sicherer.',
    appHeading: 'Wie die App hilft',
    appPoints: [
      'Hält schmerzhafte Muster in Chats fest, um zu erinnern, warum der Bruch nötig ist.',
      'Zeigt, welche Themen Kontakt neu öffnen und welche Nachrichten Rückfälle auslösen.',
      'Notiert, welche Distanz-Versuche funktionieren und welche zurückziehen.'
    ],
    appCta: 'App öffnen',
    sections: [
      {
        heading: 'Warum Loslassen schwer ist',
        items: [
          'Traumabindung: Wechsel von Schmerz und seltener Wärme schafft Abhängigkeit.',
          'Falsche Hoffnung, das Drehbuch zu ändern, hält fest.',
          'Identität ist mit der Beziehung verflochten; Bruch heißt sich neu aufbauen.',
          'Angst vor dem Unbekannten wiegt schwerer als vertrauter Schmerz.'
        ]
      },
      {
        heading: 'Schlüsselphasen',
        ordered: true,
        items: [
          'Entscheidung und Fakten notieren: was zum Entschluss führte.',
          'Vorbereitung: Wohnplan, Dokumente, sichere Kontakte, finanzielle Reserve.',
          'Moment des Bruchs: sicheres Ausstiegsszenario, auf Unterstützung stützen.',
          'Erste Wochen ohne Kontakt: Tagesstruktur, Bewegung, Trigger entfernen.',
          'Rückkehr ins Leben: neue Wege, Aktivitäten, soziale Kontakte.'
        ]
      },
      {
        heading: 'Werkzeuge für Grenzen',
        items: [
          'Nicht versandter Brief, um angestaute Emotionen auszudrücken.',
          'Loslass-Ritual (Erinnerungen zerreißen/verbrennen, symbolischer Abschluss).',
          'Vollständiger No-Contact oder klarer Low-Contact bei gemeinsamen Pflichten/Kinder.',
          'Tagebuch „warum ich gehe“ für Zweifel-Momente.'
        ]
      }
    ]
  },
  es: {
    badge: 'Apoyo',
    title: 'Cómo soltar un vínculo traumático',
    intro:
      'Soltar es difícil: ciclos de dolor y “recompensas” generan dependencia. Preparación y estructura hacen más seguro el periodo sin contacto.',
    appHeading: 'Cómo ayuda la app',
    appPoints: [
      'Registra patrones dolorosos en los chats para recordar por qué es necesario el corte.',
      'Muestra qué temas reabren contacto y qué mensajes disparan recaídas.',
      'Anota qué intentos de distancia funcionan y cuáles tiran de vuelta.'
    ],
    appCta: 'Abrir la app',
    sections: [
      {
        heading: 'Por qué cuesta soltar',
        items: [
          'Vínculo traumático: alternancia de dolor y calor crea dependencia.',
          'Falsa esperanza de cambiar el guion mantiene el lazo.',
          'Identidad entrelazada con la relación; romper es reconstruirse.',
          'El miedo a lo desconocido pesa más que el dolor conocido.'
        ]
      },
      {
        heading: 'Etapas clave',
        ordered: true,
        items: [
          'Decisión y hechos: escribir qué llevó a la elección.',
          'Preparación: plan de vivienda, documentos, contactos seguros, colchón financiero.',
          'Momento del corte: guion de salida segura, apoyo cercano.',
          'Primeras semanas sin contacto: estructura diaria, movimiento, quitar disparadores.',
          'Regreso a la vida: nuevas rutas, actividades, lazos sociales.'
        ]
      },
      {
        heading: 'Herramientas para sostener límites',
        items: [
          'Carta no enviada para expresar emociones acumuladas.',
          'Ritual de soltar (romper/quemar recordatorios, cierre simbólico).',
          'No-contact total o low-contact claro si hay obligaciones o hijos.',
          'Diario “por qué me voy” para los momentos de duda.'
        ]
      }
    ]
  },
  pt: {
    badge: 'Apoio',
    title: 'Como deixar um vínculo traumático',
    intro:
      'Sair é difícil: ciclos de dor e “recompensas” criam dependência. Preparação e estrutura tornam o período sem contato mais seguro.',
    appHeading: 'Como o app ajuda',
    appPoints: [
      'Registra padrões dolorosos nos chats para lembrar por que o corte é necessário.',
      'Mostra quais temas reabrem contato e quais mensagens disparam recaídas.',
      'Anota quais tentativas de distância funcionam e quais puxam de volta.'
    ],
    appCta: 'Abrir o app',
    sections: [
      {
        heading: 'Por que é difícil deixar',
        items: [
          'Vínculo traumático: alternância de dor e raros “calores” cria dependência.',
          'Falsa esperança de mudar o roteiro mantém a ligação.',
          'Identidade entrelaçada à relação; romper é se reconstruir.',
          'Medo do desconhecido pesa mais que a dor conhecida.'
        ]
      },
      {
        heading: 'Etapas-chave',
        ordered: true,
        items: [
          'Decisão e fatos: escrever o que levou à escolha.',
          'Preparação: plano de moradia, documentos, contatos seguros, reserva financeira.',
          'Momento do corte: roteiro de saída segura, apoio por perto.',
          'Primeiras semanas sem contato: estrutura diária, movimento, remover gatilhos.',
          'Retorno à vida: novas rotas, atividades, laços sociais.'
        ]
      },
      {
        heading: 'Ferramentas para segurar limites',
        items: [
          'Carta não enviada para expressar emoções acumuladas.',
          'Ritual de soltar (rasgar/queimar lembranças, fechamento simbólico).',
          'No-contact total ou low-contact claro se houver obrigações ou filhos.',
          'Diário “por que estou saindo” para momentos de dúvida.'
        ]
      }
    ]
  }
};

export default function LettingGoPage() {
  return <ArticlePageClient content={content} />;
}

