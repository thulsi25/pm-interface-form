import {
  ModusWcAvatar,
  ModusWcNavbar,
  ModusWcSelect,
} from '@trimble-oss/moduswebcomponents-react'
import type { ISelectOption } from '@trimble-oss/moduswebcomponents'

const NAVBAR_VISIBILITY = {
  logo: false,
  mainMenu: true,
  apps: false,
  search: false,
  searchInput: false,
  notifications: false,
  help: false,
  user: false,
  ai: false,
} as const

const COMPANY_OPTIONS: ISelectOption[] = [
  { label: 'Sharon Construction Services', value: 'sharon' },
]

export function AppNavbar() {
  return (
    <ModusWcNavbar
      customClass="app-shell-navbar shrink-0"
      visibility={NAVBAR_VISIBILITY}
    >
      <div slot="start" className="pm-navbar-logo">
        <img
          alt="Viewpoint Construction Software"
          className="pm-navbar-logo-img"
          height={32}
          src="/viewpoint-construction-logo.png"
        />
      </div>
      <div slot="end" className="pm-navbar-end">
        <ModusWcSelect
          aria-label="Sharon Construction Services"
          bordered={false}
          customClass="pm-navbar-company-select"
          options={COMPANY_OPTIONS}
          size="md"
          value="sharon"
        />
        <ModusWcAvatar
          customClass="pm-navbar-avatar"
          initials="S"
          shape="circle"
          size="sm"
        />
      </div>
    </ModusWcNavbar>
  )
}
