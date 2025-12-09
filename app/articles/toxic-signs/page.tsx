import type { Metadata } from 'next';

import { ArticlePageClient, type ArticleContentByLocale } from '../components/ArticlePageClient';

export const metadata: Metadata = {
  title: 'Как распознать токсичный сценарий отношений',
  description:
    'Ключевые сигналы критики, контроля, изоляции и эмоциональных качелей, разрушающих чувство безопасности.'
};

const content: ArticleContentByLocale = {
  ru: {
    badge: 'Осознанность',
    title: 'Как распознать токсичный сценарий отношений',
    intro:
      'Токсичность редко заметна в начале. Со временем критика, контроль и эмоциональные качели размывают ощущение реальности, а изоляция делает сложнее увидеть картину со стороны.',
    appHeading: 'Как помогает приложение',
    appPoints: [
      'Анализирует экспорт переписки и выделяет паттерны критики, контроля и газлайтинга.',
      'Показывает динамику по времени и примеры сообщений, чтобы увидеть системность, а не отдельные эпизоды.',
      'Выделяет участки переписки, которые стоит разобрать с терапевтом или поддержкой, чтобы не оставаться в цикле.'
    ],
    appCta: 'Открыть приложение',
    sections: [
      {
        heading: 'Ключевые сигналы',
        items: [
          'Постоянное обесценивание: замечания о личности вместо обсуждения действий, ярлыки и насмешки.',
          'Отсутствие поддержки: холодность или высмеивание эмоций в моменты уязвимости.',
          'Вина как инструмент: ответственность за общее благополучие перекладывается на одного человека.',
          'Контроль и ограничения: проверки, требования отчетов, скрытые запреты через ревность или молчаливые наказания.',
          'Чередование тепла и холода: забота сменяется отстранением, формируя зависимость от следующей «волны тепла».',
          'Сужение пространства: интересы, друзья и планы уступают место чужим ожиданиям.'
        ]
      },
      {
        heading: 'Как реагирует тело',
        items: [
          'Фоновая тревога и настороженность рядом с партнером.',
          'Нарушение сна, прокручивание конфликтов.',
          'Хроническая усталость и мышечное напряжение.',
          'Сбои аппетита и пищеварения, мигрени или боли в спине.'
        ]
      },
      {
        heading: 'Почему сложно заметить проблему',
        items: [
          'Эффект медленного «кипятка»: нормы смещаются постепенно.',
          'Love-bombing в начале делает последующие эпизоды похожими на исключения.',
          'Лояльность и желание сохранить образ отношений мешают признать насилие.',
          'Страх одиночества или потери привычной среды удерживает внутри сценария.'
        ]
      },
      {
        heading: 'Мини-чеклист самонаблюдения',
        items: [
          'Встречи с друзьями стали редкими или скрытыми.',
          'Есть ли доступ к собственным деньгам и время без отчетов?',
          'После общения чаще ощущается истощение, чем поддержка.',
          'Уверенность в собственном восприятии снизилась, решения принимаются с оглядкой на страх конфликта.'
        ]
      },
      {
        heading: 'Дополнительные ресурсы',
        items: [
          'Harvard Study of Adult Development — влияние качества отношений на здоровье.',
          'Harriet Lerner «Why Won’t You Apologize?» — об отказе брать ответственность.',
          'Исследования по психологии токсичных отношений (Bekhterev Review, 2024).'
        ]
      }
    ]
  },
  en: {
    badge: 'Awareness',
    title: 'How to recognize a toxic relationship pattern',
    intro:
      'Toxicity is rarely obvious at the start. Over time, criticism, control, and emotional whiplash erode reality, and isolation makes it harder to see the full picture.',
    appHeading: 'How the app helps',
    appPoints: [
      'Analyzes your chat export and highlights patterns of criticism, control, and gaslighting.',
      'Shows timeline dynamics and message examples to reveal systems, not one-off episodes.',
      'Flags chat segments worth reviewing with a therapist or support so you don’t stay stuck in the cycle.'
    ],
    appCta: 'Open the app',
    sections: [
      {
        heading: 'Key signs',
        items: [
          'Constant devaluation: remarks about character instead of actions, labels and mockery.',
          'Lack of support: coldness or ridicule of emotions in vulnerable moments.',
          'Guilt as a tool: one person is made responsible for the relationship’s wellbeing.',
          'Control and restrictions: checks, demands for reports, hidden bans via jealousy or silent treatment.',
          'Hot–cold cycles: care alternates with distance, building dependence on the next “warm phase.”',
          'Shrinking personal space: interests, friends, and plans give way to someone else’s expectations.'
        ]
      },
      {
        heading: 'How the body reacts',
        items: [
          'Background anxiety and hypervigilance around the partner.',
          'Sleep disruption, replaying conflicts.',
          'Chronic fatigue and muscle tension.',
          'Appetite/digestion issues, migraines or back pain.'
        ]
      },
      {
        heading: 'Why it’s hard to notice',
        items: [
          'Slow-boil effect: norms shift gradually.',
          'Early love-bombing makes later episodes feel like exceptions.',
          'Loyalty and the need to preserve the relationship image block admitting harm.',
          'Fear of loneliness or losing the familiar keeps you in the script.'
        ]
      },
      {
        heading: 'Mini self-checklist',
        items: [
          'Meetups with friends became rare or hidden.',
          'Do you have access to your own money and time without reporting?',
          'After conversations you feel drained more often than supported.',
          'Confidence in your perception dropped; choices are made to avoid conflict.'
        ]
      },
      {
        heading: 'Additional resources',
        items: [
          'Harvard Study of Adult Development — how relationship quality affects health.',
          'Harriet Lerner “Why Won’t You Apologize?” — on refusing accountability.',
          'Research on toxic relationship psychology (Bekhterev Review, 2024).'
        ]
      }
    ]
  },
  fr: {
    badge: 'Conscience',
    title: 'Reconnaître un schéma relationnel toxique',
    intro:
      'La toxicité est rarement évidente au début. Avec le temps, critiques, contrôle et montagnes russes émotionnelles brouillent la réalité, et l’isolement empêche de voir l’ensemble.',
    appHeading: 'Comment l’app aide',
    appPoints: [
      'Analyse l’export de chat et met en évidence les schémas de critique, de contrôle et de gaslighting.',
      'Montre la dynamique dans le temps et des exemples de messages pour révéler un système plutôt que des épisodes isolés.',
      'Signale les segments à examiner avec un thérapeute ou un soutien pour ne pas rester coincé dans le cycle.'
    ],
    appCta: "Ouvrir l'application",
    sections: [
      {
        heading: 'Signes clés',
        items: [
          'Dévalorisation constante : remarques sur la personne au lieu des actes, étiquettes et moqueries.',
          'Manque de soutien : froideur ou ridicule des émotions dans les moments vulnérables.',
          'Culpabilité comme outil : une personne devient responsable du bien-être commun.',
          'Contrôle et restrictions : vérifications, exigences de comptes rendus, interdits cachés via jalousie ou silence.',
          'Alternance chaud–froid : la sollicitude alterne avec la distance, créant une dépendance au prochain « moment chaleureux ». ',
          'Réduction de l’espace personnel : intérêts, amis et projets cèdent la place aux attentes de l’autre.'
        ]
      },
      {
        heading: 'Réactions du corps',
        items: [
          'Anxiété de fond et hypervigilance près du partenaire.',
          'Troubles du sommeil, relecture des conflits.',
          'Fatigue chronique et tensions musculaires.',
          'Troubles de l’appétit/digestion, migraines ou douleurs dorsales.'
        ]
      },
      {
        heading: 'Pourquoi c’est difficile à voir',
        items: [
          'Effet de « cuisson lente » : les normes se déplacent peu à peu.',
          'Le love-bombing initial fait passer les épisodes suivants pour des exceptions.',
          'La loyauté et l’envie de préserver l’image du couple freinent la reconnaissance de la violence.',
          'La peur de la solitude ou de perdre ses repères maintient dans le scénario.'
        ]
      },
      {
        heading: 'Mini check-list',
        items: [
          'Les rencontres avec des amis sont devenues rares ou cachées.',
          'As-tu accès à ton argent et à ton temps sans rendre de comptes ?',
          'Après les échanges, tu te sens plus souvent vidé que soutenu.',
          'La confiance dans ta perception a baissé; les décisions se prennent pour éviter le conflit.'
        ]
      },
      {
        heading: 'Ressources complémentaires',
        items: [
          'Harvard Study of Adult Development — impact de la qualité relationnelle sur la santé.',
          'Harriet Lerner « Why Won’t You Apologize? » — sur le refus d’assumer.',
          'Recherches sur la psychologie des relations toxiques (Bekhterev Review, 2024).'
        ]
      }
    ]
  },
  de: {
    badge: 'Bewusstsein',
    title: 'Toxische Beziehungsmuster erkennen',
    intro:
      'Toxizität ist selten von Anfang an sichtbar. Mit der Zeit verwischen Kritik, Kontrolle und emotionale Achterbahn das Realitätsgefühl, und Isolation erschwert den Blick aufs Ganze.',
    appHeading: 'Wie die App hilft',
    appPoints: [
      'Analysiert den Chat-Export und hebt Muster von Kritik, Kontrolle und Gaslighting hervor.',
      'Zeigt zeitliche Dynamiken und Nachrichtenbeispiele, um Systeme statt Einzelereignisse zu sehen.',
      'Hebt Chat-Abschnitte hervor, die man mit Therapie oder Support besprechen sollte, um nicht im Zyklus zu bleiben.'
    ],
    appCta: 'App öffnen',
    sections: [
      {
        heading: 'Zentrale Signale',
        items: [
          'Ständige Abwertung: Kommentare zur Person statt zu Taten, Etiketten und Spott.',
          'Fehlende Unterstützung: Kälte oder Lächerlichmachen von Emotionen in verletzlichen Momenten.',
          'Schuld als Werkzeug: eine Person trägt die Verantwortung fürs gemeinsame Wohl.',
          'Kontrolle und Einschränkungen: Kontrollen, Berichtspflichten, versteckte Verbote durch Eifersucht oder Schweigen.',
          'Wechsel zwischen warm und kalt: Fürsorge wechselt mit Distanz, erzeugt Abhängigkeit von der nächsten „Wärmephase“.',
          'Schrumpfender Raum: Interessen, Freunde und Pläne weichen den Erwartungen des anderen.'
        ]
      },
      {
        heading: 'Körperliche Reaktionen',
        items: [
          'Hintergrundangst und Wachsamkeit in der Nähe des Partners.',
          'Schlafstörungen, Wiedererleben von Konflikten.',
          'Chronische Müdigkeit und Muskelanspannung.',
          'Appetit-/Verdauungsprobleme, Migräne oder Rückenschmerzen.'
        ]
      },
      {
        heading: 'Warum es schwer zu erkennen ist',
        items: [
          'Langsam-koch-Effekt: Normen verschieben sich allmählich.',
          'Frühes Love-Bombing lässt spätere Episoden wie Ausnahmen wirken.',
          'Loyalität und der Wunsch, das Beziehungsbild zu bewahren, blockieren das Eingeständnis von Gewalt.',
          'Angst vor Einsamkeit oder Verlust des Gewohnten hält im Drehbuch.'
        ]
      },
      {
        heading: 'Mini-Selbstcheck',
        items: [
          'Treffen mit Freunden wurden selten oder heimlich.',
          'Hast du Zugang zu deinem Geld und Zeit ohne Berichtspflicht?',
          'Nach Gesprächen fühlst du dich öfter ausgelaugt als unterstützt.',
          'Vertrauen in die eigene Wahrnehmung sank; Entscheidungen werden aus Angst vor Konflikt getroffen.'
        ]
      },
      {
        heading: 'Zusätzliche Ressourcen',
        items: [
          'Harvard Study of Adult Development — Einfluss von Beziehungsqualität auf Gesundheit.',
          'Harriet Lerner „Why Won’t You Apologize?” — über verweigerte Verantwortung.',
          'Forschung zur Psychologie toxischer Beziehungen (Bekhterev Review, 2024).'
        ]
      }
    ]
  },
  es: {
    badge: 'Conciencia',
    title: 'Cómo reconocer un patrón de relación tóxica',
    intro:
      'La toxicidad rara vez es obvia al inicio. Con el tiempo, la crítica, el control y los vaivenes emocionales erosionan la realidad, y el aislamiento dificulta ver el panorama completo.',
    appHeading: 'Cómo ayuda la app',
    appPoints: [
      'Analiza tu chat exportado y resalta patrones de crítica, control y gaslighting.',
      'Muestra la dinámica en el tiempo y ejemplos de mensajes para ver sistemas, no episodios aislados.',
      'Señala segmentos del chat a revisar con terapia o apoyo para no quedar atrapado en el ciclo.'
    ],
    appCta: 'Abrir la app',
    sections: [
      {
        heading: 'Señales clave',
        items: [
          'Desvalorización constante: comentarios sobre la persona en vez de las acciones, etiquetas y burlas.',
          'Falta de apoyo: frialdad o burla de las emociones en momentos vulnerables.',
          'Culpa como herramienta: una persona es responsable del bienestar común.',
          'Control y restricciones: revisiones, exigencia de reportes, prohibiciones ocultas vía celos o silencio.',
          'Alternancia de calor y frío: cuidado seguido de distancia, generando dependencia de la próxima “fase cálida”.',
          'Reducción del espacio propio: intereses, amistades y planes ceden ante las expectativas ajenas.'
        ]
      },
      {
        heading: 'Cómo reacciona el cuerpo',
        items: [
          'Ansiedad de fondo e hipervigilancia cerca de la pareja.',
          'Alteraciones del sueño, repasar conflictos.',
          'Fatiga crónica y tensión muscular.',
          'Problemas de apetito/digestión, migrañas o dolor de espalda.'
        ]
      },
      {
        heading: 'Por qué cuesta verlo',
        items: [
          'Efecto “olla lenta”: las normas se desplazan poco a poco.',
          'El love-bombing inicial hace que los episodios posteriores parezcan excepciones.',
          'La lealtad y el deseo de preservar la imagen de la relación impiden reconocer el daño.',
          'El miedo a la soledad o a perder lo conocido mantiene dentro del guion.'
        ]
      },
      {
        heading: 'Mini checklist',
        items: [
          'Los encuentros con amistades se volvieron raros o se ocultan.',
          '¿Tienes acceso a tu dinero y a tu tiempo sin rendir cuentas?',
          'Después de hablar te sientes más agotado que acompañado.',
          'La confianza en tu percepción bajó; tomas decisiones evitando el conflicto.'
        ]
      },
      {
        heading: 'Recursos adicionales',
        items: [
          'Harvard Study of Adult Development — cómo la calidad de las relaciones afecta la salud.',
          'Harriet Lerner “Why Won’t You Apologize?” — sobre negarse a asumir responsabilidad.',
          'Investigación sobre psicología de relaciones tóxicas (Bekhterev Review, 2024).'
        ]
      }
    ]
  },
  pt: {
    badge: 'Consciência',
    title: 'Como reconhecer um padrão de relação tóxica',
    intro:
      'A toxicidade raramente é visível no começo. Com o tempo, crítica, controle e oscilações emocionais corroem a realidade, e o isolamento dificulta enxergar o quadro completo.',
    appHeading: 'Como o app ajuda',
    appPoints: [
      'Analisa o chat exportado e destaca padrões de crítica, controle e gaslighting.',
      'Mostra a dinâmica no tempo e exemplos de mensagens para ver sistemas, não episódios isolados.',
      'Aponta trechos do chat para discutir em terapia ou apoio, evitando ficar preso no ciclo.'
    ],
    appCta: 'Abrir o app',
    sections: [
      {
        heading: 'Sinais-chave',
        items: [
          'Desvalorização constante: comentários sobre a pessoa em vez das ações, rótulos e zombarias.',
          'Falta de apoio: frieza ou ridicularização das emoções em momentos vulneráveis.',
          'Culpa como ferramenta: uma pessoa fica responsável pelo bem-estar comum.',
          'Controle e restrições: checagens, cobranças de relatórios, proibições veladas via ciúme ou silêncio.',
          'Ciclos de calor e frio: cuidado seguido de distância, criando dependência da próxima “fase quente”.',
          'Encolhimento do espaço próprio: interesses, amigos e planos cedem às expectativas alheias.'
        ]
      },
      {
        heading: 'Como o corpo reage',
        items: [
          'Ansiedade de fundo e hipervigilância perto do parceiro.',
          'Sono perturbado, relembrando conflitos.',
          'Fadiga crônica e tensão muscular.',
          'Problemas de apetite/digestão, enxaquecas ou dor nas costas.'
        ]
      },
      {
        heading: 'Por que é difícil notar',
        items: [
          'Efeito panela lenta: as normas mudam aos poucos.',
          'O love-bombing inicial faz episódios posteriores parecerem exceções.',
          'Lealdade e vontade de manter a imagem do relacionamento impedem admitir o dano.',
          'Medo de solidão ou de perder o conhecido mantém dentro do roteiro.'
        ]
      },
      {
        heading: 'Mini checklist',
        items: [
          'Encontros com amigos ficaram raros ou escondidos.',
          'Você tem acesso ao seu dinheiro e tempo sem prestar contas?',
          'Depois das conversas sente-se mais exausto do que apoiado.',
          'A confiança na própria percepção caiu; decisões são tomadas para evitar conflito.'
        ]
      },
      {
        heading: 'Recursos adicionais',
        items: [
          'Harvard Study of Adult Development — como a qualidade das relações afeta a saúde.',
          'Harriet Lerner “Why Won’t You Apologize?” — sobre recusar responsabilidade.',
          'Pesquisa sobre psicologia de relações tóxicas (Bekhterev Review, 2024).'
        ]
      }
    ]
  }
};

export default function ToxicSignsPage() {
  return <ArticlePageClient content={content} />;
}

