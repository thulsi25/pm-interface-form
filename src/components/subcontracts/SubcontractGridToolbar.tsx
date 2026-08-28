import {
  CaretButton,
  IconButton,
  LabeledButton,
  SplitButton,
  ToolbarDivider,
} from './SubcontractToolbarControls'

export interface SubcontractGridToolbarProps {
  canDelete: boolean
  canUndo: boolean
  onColumnProperties: () => void
  onCreate: () => void
  onDelete: () => void
  onDistribution: () => void
  onFieldProperties: () => void
  onFilter: () => void
  onUndo: () => void
}

export function SubcontractGridToolbar({
  canDelete,
  canUndo,
  onColumnProperties,
  onCreate,
  onDelete,
  onDistribution,
  onFieldProperties,
  onFilter,
  onUndo,
}: SubcontractGridToolbarProps) {
  return (
    <div className="sl-grid-toolbar" role="toolbar" aria-label="Subcontract grid actions">
      <div className="sl-grid-toolbar-group">
        <LabeledButton
          iconName="tune"
          label="Field Properties"
          variant="pill"
          onClick={onFieldProperties}
        />
        <ToolbarDivider />
        <IconButton
          ariaLabel="Customize columns"
          iconName="column_properties"
          onClick={onColumnProperties}
        />
        <IconButton ariaLabel="Filter" iconName="filter" onClick={onFilter} />
      </div>

      <div className="sl-grid-toolbar-group">
        <IconButton
          ariaLabel="Undo"
          disabled={!canUndo}
          iconName="undo"
          onClick={onUndo}
        />
        <ToolbarDivider />
        <IconButton
          ariaLabel="Delete"
          disabled={!canDelete}
          iconName="delete"
          tone="danger"
          onClick={onDelete}
        />
        <ToolbarDivider />
        <SplitButton>
          <IconButton
            ariaLabel="Distribution"
            iconName="people_group"
            onClick={onDistribution}
          />
          <CaretButton ariaLabel="Distribution options" onClick={onDistribution} />
        </SplitButton>
        <SplitButton>
          <IconButton ariaLabel="Send email" disabled iconName="envelope" />
          <CaretButton ariaLabel="Send email options" disabled />
        </SplitButton>
        <ToolbarDivider />
        <LabeledButton disabled iconName="link" label="Related Items" />
        <SplitButton>
          <LabeledButton iconName="file_new" label="Create" onClick={onCreate} />
          <CaretButton ariaLabel="Create options" onClick={onCreate} />
        </SplitButton>
      </div>
    </div>
  )
}
