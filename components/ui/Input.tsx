import clsx from 'clsx';
import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={clsx(
        'w-full rounded-md border border-primary/30 bg-white/80 dark:bg-neutral-800/90 dark:border-primary/40 dark:text-text px-4 py-2 text-text shadow-sm placeholder:text-text/40 dark:placeholder:text-text/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30',
        className
      )}
      {...props}
    />
  );
});

