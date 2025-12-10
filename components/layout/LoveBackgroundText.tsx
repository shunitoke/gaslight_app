'use client';

import React from 'react';
import { useLanguage } from '@/features/i18n';
import type { SupportedLocale } from '@/features/i18n/types';
import { useAnimation } from '@/contexts/AnimationContext';
import { cn } from '@/lib/utils';

type CloudItem = {
  id: string;
  text: string;
  left: number;
  top: number;
  size: number;
  opacity: number;
  weight: number;
  blur: number;
  highlight: boolean;
  depth: number;
  floatX: number;
  floatY: number;
  floatDuration: number;
  floatDelay: number;
  driftX: number;
  driftY: number;
  driftXPx: number;
  driftYPx: number;
  driftDuration: number;
  driftDelay: number;
  fading?: boolean;
  appearing?: boolean;
};

const PHRASES_BY_LOCALE: Record<SupportedLocale, string[]> = {
  en: [
    'you’re too sensitive',
    'I never said that',
    'you’re imagining things',
    'why can’t you take a joke',
    'you always overreact',
    'no one else thinks that',
    'you owe me after all I did',
    'if you loved me, you would',
    'don’t make me the bad guy',
    'stop being dramatic',
    'you’re remembering it wrong',
    'this is why no one trusts you',
    'you made me do this',
    'everyone agrees with me',
    'I’m the only one who cares',
    'you’re lucky I’m here',
    'don’t twist my words',
    'that never happened',
    'I was just joking',
    'you’re the problem',
    'prove you’re not lying',
    'you’re overthinking again',
    'you always ruin everything',
    'why can’t you be grateful',
    'you’re making a scene',
    'maybe you should calm down',
    'you’re being paranoid',
    'I guess I’m the villain now',
    'you don’t get how hard this is for me',
    'fine, I won’t say anything anymore',
    'look what you made me do',
    'you can’t remember right',
    'don’t make things up',
    'stop twisting reality',
    'you’re imagining a fight',
    'this is all in your head',
    'you never listen',
    'everyone says you’re difficult',
    'you’re impossible to please',
    'you don’t appreciate me',
    'why are you so paranoid',
    'it was just harmless',
    'don’t overthink this',
    'I never promised that',
    'you said yes before',
    'you’re so dramatic',
    'that’s not what happened',
    'you misheard me',
    'stop acting like a victim',
    'you should be thankful',
    'you’re imagining problems',
    'it’s not a big deal',
    'you’re taking this too far',
    'you made me raise my voice',
    'you started this',
    'I was only joking',
    'you always twist my words',
    'you’re making this up',
    'you don’t remember correctly',
    'prove I said that',
    'you keep changing the story',
    'no one would believe you'
  ],
  ru: [
    'ты слишком чувствительный',
    'я этого не говорил',
    'ты всё выдумываешь',
    'почему не можешь понять шутку',
    'ты всегда перегибаешь',
    'никто больше так не думает',
    'ты мне должна за всё, что я сделал',
    'если бы любил, ты бы сделал',
    'не делай из меня злодея',
    'хватит драматизировать',
    'ты неправильно помнишь',
    'вот почему тебе никто не доверяет',
    'это ты заставил меня так поступить',
    'все со мной согласны',
    'тебе повезло, что я здесь',
    'не перекручивай мои слова',
    'этого не было',
    'я просто шутил',
    'проблема в тебе',
    'докажи, что не врёшь',
    'ты снова всё надумываешь',
    'ты всё портишь',
    'почему ты не благодарен',
    'ты устраиваешь сцену',
    'может, успокоишься',
    'ты просто параноик',
    'ну конечно, я теперь злодей',
    'ты не понимаешь, как мне тяжело',
    'ладно, я больше ничего не скажу',
    'посмотри, до чего ты меня довёл',
    'ты неверно всё понял',
    'не выдумывай',
    'хватит искажать реальность',
    'ты опять придумываешь конфликт',
    'это всё у тебя в голове',
    'ты никогда не слушаешь',
    'все говорят, что с тобой тяжело',
    'тебя невозможно удовлетворить',
    'ты меня не ценишь',
    'зачем ты такой подозрительный',
    'ничего страшного не было',
    'не накручивай себя',
    'я этого не обещал',
    'ты раньше соглашался',
    'ты опять драматизируешь',
    'всё было не так',
    'ты меня неправильно услышал',
    'перестань играть жертву',
    'тебе стоит быть благодарным',
    'ты придумываешь проблемы',
    'ничего серьёзного нет',
    'ты заходишь слишком далеко',
    'ты заставил меня повысить голос',
    'это ты начал',
    'я всего лишь пошутил',
    'ты всегда искажаешь мои слова',
    'ты это выдумал',
    'ты неправильно помнишь',
    'докажи, что я так говорил',
    'ты всё время меняешь историю',
    'тебе никто не поверит'
  ],
  es: [
    'eres demasiado sensible',
    'yo nunca dije eso',
    'te lo estás imaginando',
    'por qué no puedes tomarlo con humor',
    'siempre exageras',
    'nadie más piensa eso',
    'me lo debes después de todo lo que hice',
    'si me quisieras, lo harías',
    'no me hagas el villano',
    'deja el drama',
    'lo recuerdas mal',
    'por eso nadie confía en ti',
    'tú me obligaste a hacerlo',
    'todos están de mi lado',
    'tienes suerte de que esté aquí',
    'no tergiverses mis palabras',
    'eso nunca pasó',
    'solo estaba bromeando',
    'el problema eres tú',
    'demuestra que no mientes',
    'estás dándole demasiadas vueltas',
    'siempre lo arruinas todo',
    'por qué no agradeces',
    'estás montando una escena',
    'cálmate un poco',
    'estás paranoico',
    'supongo que ahora soy el villano',
    'no entiendes lo difícil que es para mí',
    'vale, no diré nada más',
    'mira lo que me hiciste hacer',
    'no lo recuerdas bien',
    'no inventes cosas',
    'deja de retorcer la realidad',
    'estás imaginando una pelea',
    'todo está en tu cabeza',
    'nunca escuchas',
    'todos dicen que eres difícil',
    'es imposible complacerte',
    'no me valoras',
    'por qué eres tan desconfiado',
    'no fue para tanto',
    'no le des tantas vueltas',
    'nunca prometí eso',
    'antes dijiste que sí',
    'qué dramático eres',
    'no fue así',
    'me oíste mal',
    'deja de hacerte la víctima',
    'deberías estar agradecido',
    'estás inventando problemas',
    'no es gran cosa',
    'estás yendo demasiado lejos',
    'me hiciste alzar la voz',
    'tú empezaste esto',
    'solo estaba bromeando',
    'siempre retuerces mis palabras',
    'lo estás inventando',
    'no lo recuerdas correctamente',
    'prueba que lo dije',
    'siempre cambias la historia',
    'nadie te creería'
  ],
  fr: [
    'tu es trop sensible',
    'je n’ai jamais dit ça',
    'tu imagines des choses',
    'pourquoi tu ne peux pas prendre une blague',
    'tu exagères toujours',
    'personne d’autre ne pense ça',
    'tu me dois après tout ce que j’ai fait',
    'si tu m’aimais, tu le ferais',
    'ne fais pas de moi le méchant',
    'arrête le drama',
    'tu te souviens mal',
    'c’est pour ça que personne ne te fait confiance',
    'c’est toi qui m’as poussé à faire ça',
    'tout le monde est d’accord avec moi',
    'tu as de la chance que je sois là',
    'ne déforme pas mes mots',
    'ça n’est jamais arrivé',
    'je plaisantais seulement',
    'le problème, c’est toi',
    'prouve que tu ne mens pas',
    'tu réfléchis trop encore',
    'tu gâches toujours tout',
    'pourquoi tu ne peux pas être reconnaissant',
    'tu fais une scène',
    'calme-toi un peu',
    'tu es parano',
    'je suis donc le méchant maintenant',
    'tu ne comprends pas comme c’est dur pour moi',
    'ok, je ne dirai plus rien',
    'regarde ce que tu m’as fait faire',
    'tu ne te souviens pas bien',
    'n’invente pas',
    'arrête de tordre la réalité',
    'tu imagines une dispute',
    'tout est dans ta tête',
    'tu n’écoutes jamais',
    'tout le monde dit que tu es difficile',
    'on ne peut jamais te satisfaire',
    'tu ne m’apprécies pas',
    'pourquoi es-tu si méfiant',
    'ce n’était rien de grave',
    'arrête de trop y penser',
    'je ne l’ai jamais promis',
    'tu avais dit oui avant',
    'tu es tellement dramatique',
    'ce n’est pas ce qui s’est passé',
    'tu as mal entendu',
    'arrête de jouer la victime',
    'tu devrais être reconnaissant',
    'tu inventes des problèmes',
    'ce n’est pas grand-chose',
    'tu vas trop loin',
    'tu m’as fait hausser la voix',
    'c’est toi qui as commencé',
    'je plaisantais seulement',
    'tu déformes toujours mes mots',
    'tu inventes ça',
    'tu ne te souviens pas correctement',
    'prouve que j’ai dit ça',
    'tu changes toujours l’histoire',
    'personne ne te croira'
  ],
  de: [
    'du bist zu sensibel',
    'das habe ich nie gesagt',
    'du bildest dir das ein',
    'warum verstehst du keinen Witz',
    'du übertreibst immer',
    'niemand sonst denkt das',
    'du schuldest mir was nach allem',
    'wenn du mich lieben würdest, würdest du es tun',
    'mach mich nicht zum Bösewicht',
    'hör auf mit dem Drama',
    'du erinnerst dich falsch',
    'deshalb vertraut dir niemand',
    'du hast mich dazu gebracht',
    'alle sind meiner Meinung',
    'du hast Glück, dass ich da bin',
    'verdreh nicht meine Worte',
    'das ist nie passiert',
    'ich habe nur gescherzt',
    'du bist das Problem',
    'beweise, dass du nicht lügst',
    'du denkst schon wieder zu viel',
    'du machst immer alles kaputt',
    'warum bist du nicht dankbar',
    'du machst eine Szene',
    'beruhig dich mal',
    'du bist paranoid',
    'jetzt bin ich wohl der Böse',
    'du verstehst nicht, wie schwer das für mich ist',
    'okay, ich sag nichts mehr',
    'sieh, wozu du mich gebracht hast',
    'du erinnerst dich nicht richtig',
    'denk dir nichts aus',
    'hör auf, die Realität zu verdrehen',
    'du fantasierst einen Streit',
    'das ist alles in deinem Kopf',
    'du hörst nie zu',
    'alle sagen, dass du schwierig bist',
    'man kann es dir nie recht machen',
    'du schätzt mich nicht',
    'warum bist du so misstrauisch',
    'es war nichts Schlimmes',
    'denk nicht so viel darüber nach',
    'das habe ich nie versprochen',
    'vorher hast du ja gesagt',
    'du bist so dramatisch',
    'so ist es nicht passiert',
    'du hast mich falsch verstanden',
    'hör auf, das Opfer zu spielen',
    'du solltest dankbar sein',
    'du erfindest Probleme',
    'es ist nichts Großes',
    'du gehst zu weit',
    'du hast mich laut werden lassen',
    'du hast damit angefangen',
    'ich habe nur Spaß gemacht',
    'du verdrehst immer meine Worte',
    'du erfindest das',
    'du erinnerst dich nicht richtig',
    'beweise, dass ich das sagte',
    'du änderst die Geschichte ständig',
    'niemand würde dir glauben'
  ],
  pt: [
    'você é sensível demais',
    'eu nunca disse isso',
    'você está imaginando coisas',
    'por que não leva na brincadeira',
    'você sempre exagera',
    'ninguém mais pensa isso',
    'você me deve depois de tudo que fiz',
    'se me amasse, faria',
    'não me faça de vilão',
    'para de drama',
    'você lembra errado',
    'por isso ninguém confia em você',
    'você me fez fazer isso',
    'todo mundo concorda comigo',
    'você tem sorte de eu estar aqui',
    'não distorça minhas palavras',
    'isso nunca aconteceu',
    'eu só estava brincando',
    'o problema é você',
    'prove que não está mentindo',
    'você está pensando demais de novo',
    'você sempre estraga tudo',
    'por que não é grato',
    'você está fazendo cena',
    'talvez se acalme',
    'você está paranoico',
    'então eu sou o vilão agora',
    'você não entende como é difícil pra mim',
    'ok, não vou falar mais nada',
    'olha o que você me fez fazer',
    'você não lembra direito',
    'não inventa coisas',
    'para de torcer a realidade',
    'você está imaginando uma briga',
    'isso é tudo da sua cabeça',
    'você nunca escuta',
    'todo mundo diz que você é difícil',
    'é impossível te agradar',
    'você não me valoriza',
    'por que tanta desconfiança',
    'não foi nada demais',
    'não fica remoendo isso',
    'eu nunca prometi isso',
    'antes você tinha concordado',
    'que drama',
    'não foi assim',
    'você me ouviu mal',
    'para de se fazer de vítima',
    'você devia ser grato',
    'você está inventando problemas',
    'não é grande coisa',
    'você está indo longe demais',
    'você me fez levantar a voz',
    'foi você quem começou',
    'eu só estava brincando',
    'você sempre distorce minhas palavras',
    'você está inventando',
    'você não lembra direito',
    'prove que eu disse isso',
    'você sempre muda a história',
    'ninguém acreditaria em você'
  ]
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function makeItem(idx: number, phrases: string[], highlight?: boolean): CloudItem {
  const isHighlight = highlight ?? Math.random() < 0.24;
  const opacity = isHighlight ? randomBetween(0.14, 0.24) : randomBetween(0.06, 0.12);
  const size = isHighlight ? randomBetween(16, 30) : randomBetween(12, 26);
  const blur = isHighlight ? randomBetween(0.9, 2.2) : randomBetween(1.2, 3.0);
  const weight = isHighlight ? 650 : Math.random() > 0.5 ? 500 : 600;
  const depth = randomBetween(0.015, 0.06); // parallax factor
  const floatX = randomBetween(-10, 10);
  const floatY = randomBetween(-8, 8);
  const floatDuration = randomBetween(16, 28);
  const floatDelay = randomBetween(-6, 4);
  const driftX = randomBetween(-6, 8);
  const driftY = randomBetween(-5, 7);
  const driftXPx = randomBetween(-120, 140);
  const driftYPx = randomBetween(-90, 110);
  const driftDuration = randomBetween(46, 78);
  const driftDelay = randomBetween(-12, 10);

  return {
    id: `love-cloud-${idx}-${Math.random().toString(36).slice(2, 8)}`,
    text: phrases[Math.floor(Math.random() * phrases.length)],
    left: randomBetween(-5, 95),
    top: randomBetween(-5, 95),
    size,
    opacity,
    weight,
    blur,
    highlight: isHighlight,
    depth,
    floatX,
    floatY,
    floatDuration,
    floatDelay,
    driftX,
    driftY,
    driftDuration,
    driftDelay,
    driftXPx,
    driftYPx,
    fading: false,
    appearing: true
  };
}

function buildCloud(count = 42, phrases: string[]): CloudItem[] {
  return Array.from({ length: count }).map((_, idx) => makeItem(idx, phrases));
}

function pickCloudCount(prefersLowMotion: boolean) {
  if (prefersLowMotion) return 10;
  if (typeof window === 'undefined') return 28;
  const w = window.innerWidth;
  if (w < 640) return 12;
  if (w < 900) return 16;
  if (w < 1200) return 22;
  if (w < 1600) return 28;
  return 34;
}

export function LoveBackgroundText() {
  const [cloud, setCloud] = React.useState<CloudItem[]>([]);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [cloudCount, setCloudCount] = React.useState(42);
  const [scrollY, setScrollY] = React.useState(0);
  const spotlightRef = React.useRef<HTMLDivElement | null>(null);

  const { locale } = useLanguage();
  const phrases = React.useMemo(() => PHRASES_BY_LOCALE[locale] ?? PHRASES_BY_LOCALE.en, [locale]);
  const { isPageVisible, prefersReducedMotion: ctxPrefersReducedMotion } = useAnimation();
  // Keep background active even during processing/import; only pause for user preference or tab visibility.
  const effectiveReduceMotion = reduceMotion || ctxPrefersReducedMotion || !isPageVisible;

  const randomPhrase = React.useCallback(() => {
    const idx = Math.floor(Math.random() * phrases.length);
    return phrases[idx];
  }, [phrases]);

  React.useEffect(() => {
    const initialCount = pickCloudCount(effectiveReduceMotion);
    setCloudCount(initialCount);
    setCloud(initialCount ? buildCloud(initialCount, phrases) : []);

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (ev: MediaQueryListEvent) => setReduceMotion(ev.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [phrases, effectiveReduceMotion]);

  // Recompute density on resize and motion changes.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      const next = pickCloudCount(effectiveReduceMotion);
      setCloudCount((prev) => (prev === next ? prev : next));
    };
    const handle = () => {
      window.requestAnimationFrame(update);
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [effectiveReduceMotion]);

  // Rebuild cloud when density or phrases change (or when motion is re-enabled).
  React.useEffect(() => {
    if (effectiveReduceMotion) {
      setCloud([]);
      return;
    }
    setCloud(buildCloud(cloudCount, phrases));
  }, [cloudCount, phrases, effectiveReduceMotion]);

  // Parallax on scroll (rAF throttled); disabled when motion is off or tab hidden.
  React.useEffect(() => {
    if (effectiveReduceMotion || !isPageVisible) return;
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrollY(window.scrollY || 0);
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [effectiveReduceMotion, isPageVisible]);

  // Clear initial appearing flags after mount to let fade-in run once.
  React.useEffect(() => {
    if (!cloud.some((c) => c.appearing)) return;
    const t = window.setTimeout(() => {
      setCloud((prev) => prev.map((item) => ({ ...item, appearing: false })));
    }, 120);
    return () => window.clearTimeout(t);
  }, [cloud]);

  // Text rotation with fade/blur and new positions; paused when motion/visibility is off.
  React.useEffect(() => {
    if (effectiveReduceMotion || !isPageVisible) return;
    const fadeMs = 1200;
    let intervalId: number | null = null;
    const timeoutIds: number[] = [];

    const clearTimers = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      while (timeoutIds.length) {
        const id = timeoutIds.pop();
        if (id !== undefined) window.clearTimeout(id);
      }
    };

    intervalId = window.setInterval(() => {
      setCloud((prev) => {
        if (!prev.length) return prev;
        const count = Math.max(3, Math.min(6, Math.floor(prev.length * 0.12)));
        const indices = new Set<number>();
        while (indices.size < count) {
          indices.add(Math.floor(Math.random() * prev.length));
        }
        return prev.map((item, idx) =>
          indices.has(idx) ? { ...item, fading: true } : item
        );
      });

      const timeout = window.setTimeout(() => {
        setCloud((prev) =>
          prev.map((item) => {
            if (!item.fading) return item;
            let nextText = randomPhrase();
            if (nextText === item.text) {
              nextText = randomPhrase();
            }
            const replacement = makeItem(Math.floor(Math.random() * 1000), phrases);
            return {
              ...item,
              text: nextText,
              left: replacement.left,
              top: replacement.top,
              size: replacement.size,
              opacity: replacement.opacity,
              weight: replacement.weight,
              blur: replacement.blur,
              highlight: replacement.highlight,
              depth: replacement.depth,
              fading: false,
              appearing: true
            };
          })
        );
        const t2 = window.setTimeout(() => {
          setCloud((prev) =>
            prev.map((item) => (item.appearing ? { ...item, appearing: false } : item))
          );
        }, fadeMs);
        timeoutIds.push(t2);
      }, fadeMs);

      timeoutIds.push(timeout);
    }, 5200);

    return clearTimers;
  }, [effectiveReduceMotion, randomPhrase, phrases, isPageVisible]);

  if (!cloud.length) return null;

  const showMask = !effectiveReduceMotion;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      {showMask && <div className="absolute inset-[-20%] love-spotlight-mask" />}
      <div className="absolute inset-[-10%]">
        {cloud.map((item) => (
          <div
            key={item.id}
            className="love-cloud-wrapper"
            style={{
              '--love-left-start': `${item.left}%`,
              '--love-top-start': `${item.top}%`,
              '--love-drift-x': effectiveReduceMotion ? '0%' : `${item.driftX}%`,
              '--love-drift-y': effectiveReduceMotion ? '0%' : `${item.driftY}%`,
              '--love-drift-x-px': effectiveReduceMotion ? '0px' : `${item.driftXPx}px`,
              '--love-drift-y-px': effectiveReduceMotion ? '0px' : `${item.driftYPx}px`,
              '--love-drift-duration': `${item.driftDuration}s`,
              '--love-drift-delay': `${item.driftDelay}s`,
              '--love-parallax-y': effectiveReduceMotion ? '0px' : `${-(scrollY * item.depth)}px`,
              willChange: effectiveReduceMotion ? undefined : 'transform',
              animationPlayState: effectiveReduceMotion ? 'paused' : 'running'
            } as React.CSSProperties}
          >
            <span
              className={cn(
                'select-none text-foreground/70 love-cloud-item',
                item.fading ? 'love-fading' : '',
                item.appearing ? 'love-appearing' : ''
              )}
              style={{
                fontSize: `${item.size}px`,
                fontWeight: item.weight,
                textShadow: item.highlight ? '0 0 14px rgba(255,255,255,0.08)' : undefined,
                '--love-opacity': item.opacity,
                '--love-blur': `${item.blur}px`,
                '--love-blur-soft': `${(item.blur * 0.85).toFixed(2)}px`,
                '--love-blur-strong': `${(item.blur * 1.35).toFixed(2)}px`,
                '--love-float-x': effectiveReduceMotion ? '0px' : `${item.floatX}px`,
                '--love-float-y': effectiveReduceMotion ? '0px' : `${item.floatY}px`,
                '--love-float-duration': `${item.floatDuration}s`,
                '--love-float-delay': `${item.floatDelay}s`,
                animationPlayState: effectiveReduceMotion ? 'paused' : 'running'
              } as React.CSSProperties}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoveBackgroundText;


