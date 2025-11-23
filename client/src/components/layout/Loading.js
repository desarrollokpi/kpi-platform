import React from 'react'

import Skeleton from '@mui/material/Skeleton'

const Loading = ({ number, ...props }) => {
  return (
    <>
      {[...Array(number || 1).keys()].map(n => (
        <Skeleton {...props} key={n} animation='wave' />
      ))}
    </>
  )
}

export default Loading
