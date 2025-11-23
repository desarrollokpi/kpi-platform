import React from 'react'
import Skeleton from '@mui/material/Skeleton'

const Image = ({ src, alt, ...props }) => {
  if (!src)
    return (
      <Skeleton
        sx={{ marginTop: '1rem', marginBottom: '1rem' }}
        variant='rectangular'
        height={70}
        width={200}
      />
    )
  return <img src={`data:image;base64,${src}`} alt={alt} {...props} />
}

export default Image
