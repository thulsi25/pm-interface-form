import { useEffect, type RefObject } from 'react'

function createFilterIcon(): HTMLElement {
  const icon = document.createElement('modus-wc-icon')
  icon.setAttribute('name', 'search')
  icon.setAttribute('size', 'xs')
  icon.setAttribute('variant', 'outlined')
  icon.setAttribute('decorative', '')
  return icon
}

export function useTableColumnFilterRow(
  tableHostRef: RefObject<HTMLDivElement | null>,
  dependencyKey: string,
) {
  useEffect(() => {
    const host = tableHostRef.current
    if (!host) return

    const table = host.querySelector('modus-wc-table table.modus-wc-table')
    const thead = table?.querySelector('thead')
    const headerRow = thead?.querySelector('tr')
    if (!thead || !headerRow) return

    thead.querySelector('.pm-column-filter-row')?.remove()

    const filterRow = document.createElement('tr')
    filterRow.className = 'pm-column-filter-row'

    headerRow.querySelectorAll('th').forEach((th, index) => {
      const cell = document.createElement('th')
      cell.scope = 'col'

      if (index > 0) {
        cell.appendChild(createFilterIcon())
      }

      if (th.classList.contains('pm-table-col-numeric')) {
        cell.classList.add('pm-table-col-numeric')
      }

      if (th.style.width) {
        cell.style.width = th.style.width
      }

      filterRow.appendChild(cell)
    })

    thead.appendChild(filterRow)
  }, [tableHostRef, dependencyKey])
}
