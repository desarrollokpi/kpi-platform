import React from 'react'
import ReportGroupSectionsTable from '../sections/ReportGroupSectionsTable'
import ActiveIndicator from '../layout/ActiveIndicator'

import VisibilityIcon from '@mui/icons-material/Visibility'

import {
  Grid,
  IconButton,
  Collapse,
  ListItem,
  ListItemText,
  Typography,
  ListItemSecondaryAction,
  Checkbox,
} from '@mui/material'

import useResponsive from '../../hooks/useResponsive'
import useToggle from '../../hooks/useToggle'

const ManageUsersReportsGroupsItem = ({
  reportsGroup,
  toggleSelectedReportsGroup,
  selectedReportsGroups,
}) => {
  const matchMd = useResponsive('md')
  const [open, handleToggleCollapse] = useToggle()

  return (
    <>
      <ListItem dense>
        <Grid container alignItems='center' justifyContent='center'>
          <Grid item xs={3} md={1}>
            <ListItemText>
              <Checkbox
                className='thin'
                disableRipple
                checked={selectedReportsGroups.includes(reportsGroup.id)}
                onClick={toggleSelectedReportsGroup(reportsGroup.id)}
              />
            </ListItemText>
          </Grid>

          {matchMd && (
            <Grid item md={4}>
              <ListItemText>
                <Typography variant='body1'>{reportsGroup.code}</Typography>
              </ListItemText>
            </Grid>
          )}

          <Grid item xs={9} md={4}>
            <ListItemText>
              <Typography variant='body1'>{reportsGroup.name}</Typography>
            </ListItemText>
          </Grid>

          {matchMd && (
            <>
              <Grid item md={1}>
                <ListItemText>
                  <Typography variant='body1'>
                    {reportsGroup.sections.length}
                  </Typography>
                </ListItemText>
              </Grid>
              <Grid item md={1}>
                <ListItemText>
                  <ActiveIndicator active={reportsGroup.active} />
                </ListItemText>
              </Grid>
            </>
          )}

          <Grid item xs={2} md={1}>
            <ListItemSecondaryAction>
              <IconButton onClick={handleToggleCollapse}>
                <VisibilityIcon color='primary' />
              </IconButton>
            </ListItemSecondaryAction>
          </Grid>
        </Grid>
      </ListItem>

      <Collapse in={open} timeout='auto' unmountOnExit>
        <ReportGroupSectionsTable sections={reportsGroup.sections} />
      </Collapse>
    </>
  )
}

export default ManageUsersReportsGroupsItem
