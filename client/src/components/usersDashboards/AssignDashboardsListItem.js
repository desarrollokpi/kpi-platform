import React from 'react'
import ActiveIndicator from '../layout/ActiveIndicator'

import {
  Grid,
  ListItem,
  ListItemText,
  Typography,
  Checkbox,
} from '@mui/material'

import useResponsive from '../../hooks/useResponsive'

const AssignDashboardsListItem = ({
  dashboard,
  toggleSelectedDashboard,
  selectedDashboards,
}) => {
  const matchMd = useResponsive('md')

  return (
    <ListItem dense>
      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={2} md={1}>
          <ListItemText>
            <Checkbox
              className='thin'
              disableRipple
              checked={selectedDashboards.includes(dashboard.id)}
              onClick={toggleSelectedDashboard(dashboard.id)}
            />
          </ListItemText>
        </Grid>

        <Grid item xs={7} md={3}>
          <ListItemText>
            <Typography variant='body1'>{dashboard.name}</Typography>
          </ListItemText>
        </Grid>

        {matchMd && (
          <>
            <Grid item md={2}>
              <ListItemText>
                <Typography variant='body2' color='textSecondary'>
                  {dashboard.instanceId || 'N/A'}
                </Typography>
              </ListItemText>
            </Grid>
            <Grid item md={4}>
              <ListItemText>
                <Typography variant='body2' color='textSecondary'>
                  {dashboard.description || 'Sin descripción'}
                </Typography>
              </ListItemText>
            </Grid>
          </>
        )}

        <Grid item xs={3} md={1}>
          <ListItemText>
            <ActiveIndicator active={dashboard.active} />
          </ListItemText>
        </Grid>
      </Grid>
    </ListItem>
  )
}

export default AssignDashboardsListItem
