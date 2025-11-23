import React from 'react'
import { TableCell, TableRow, Switch } from '@mui/material'
import { updateReportActiveStateByAdmin } from '../../state/reports/reportsActions'
import { useDispatch, useSelector } from 'react-redux'
import useResponsive from '@hooks/useResponsive'

const AccountReportsTableRow = ({ report }) => {
  const dispatch = useDispatch()
  const matchMd = useResponsive('md')
  const { loading } = useSelector(state => state.reports)
  const [checked, setChecked] = React.useState(report.active === 1)

  const handleChange = event => {
    setChecked(event.target.checked)

    const active = checked ? 0 : 1

    dispatch(
      updateReportActiveStateByAdmin(active, report.id, report.workspaceId)
    )
  }

  return (
    <TableRow>
      {matchMd && <TableCell align='center'>{report.workspaceName}</TableCell>}

      <TableCell align='center'>{report.name}</TableCell>
      <TableCell align='center'>
        <Switch checked={checked} onChange={handleChange} />
      </TableCell>
    </TableRow>
  )
}

export default AccountReportsTableRow
