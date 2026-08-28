import type { ICollapseOptions } from '@trimble-oss/moduswebcomponents'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'modus-wc-collapse': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          bordered?: boolean
          'chevron-position'?: 'left' | 'right'
          'collapse-id'?: string
          'custom-class'?: string
          expanded?: boolean
          options?: ICollapseOptions
          onExpandedChange?: (event: CustomEvent<{ expanded: boolean }>) => void
        },
        HTMLElement
      >
    }
  }
}

export {}
