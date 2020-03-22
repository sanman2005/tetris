import * as React from 'react';
import cn from 'classnames';

interface IGridProps {
  className?: string;
  children?: any;
  title?: string;
}

interface IContainerProps {
  autosize?: boolean;
  centerContent?: boolean;
  isContent?: boolean;
  fill?: boolean;
  wide?: boolean;
}

export interface ColumnProps {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
}

type TRef = React.RefObject<HTMLDivElement>;

// tslint:disable-next-line:variable-name
export const Container = React.forwardRef<
  HTMLDivElement,
  IGridProps & IContainerProps
>((props: IGridProps & IContainerProps, ref: TRef) => {
  const {
    autosize,
    centerContent,
    children,
    className,
    title,
    wide,
    isContent,
    fill,
  } = props;
  const elements = (
    <>
      {title && <h2 className='title'>{title}</h2>}
      {children}
    </>
  );
  const containerClass = cn('container', {
    content: isContent,
    'container--top': !centerContent,
    'container--fill': fill,
    'container--autosize': autosize,
  });
  const sectionClass = cn(className, { [containerClass]: !wide });

  return (
    <>
      <section className={sectionClass} ref={ref}>
        {wide ? <div className={containerClass}>{elements}</div> : elements}
      </section>
    </>
  );
});

export const content = React.forwardRef<
  HTMLDivElement,
  IGridProps & IContainerProps
>((props: IGridProps & IContainerProps, ref: TRef) => (
  <Container {...props} isContent ref={ref} />
));

export const row = (props: IGridProps) => (
  <div className={cn('row', props.className)}>{props.children}</div>
);

export const column = (props: ColumnProps & IGridProps) => (
  <div className={cn('column', getColClasses(props), props.className)}>
    {props.children}
  </div>
);

export const getColClasses = ({ xs, sm, md, lg }: ColumnProps) => ({
  [`column--xs-${xs}`]: xs,
  [`column--sm-${sm}`]: sm,
  [`column--md-${md}`]: md,
  [`column--lg-${lg}`]: lg,
});
