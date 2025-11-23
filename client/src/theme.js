import { createTheme } from '@mui/material'
import { orange, grey, amber } from '@mui/material/colors'

const white = 'white'
const fontSize = '0.875rem'
const borderRadius = '0.75rem'
const palette = {
  light: { main: white, contrastText: '#000' },
  secondary: { main: orange[500], dark: orange[700] },
}

const muiTheme = createTheme({ palette })

const theme = createTheme({
  palette,

  typography: {
    body1: {
      fontSize,
    },

    h6: {
      fontSize: '1rem',
      lineHeight: '1.2',
      color: grey[600],
      fontWeight: 'bold',
    },

    accent: {
      color: muiTheme.palette.secondary.main,
    },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          '&.container': {
            [muiTheme.breakpoints.up('md')]: {
              padding: '3em',
              borderRadius,
              margin: '0 1.25rem',
            },
            [muiTheme.breakpoints.down('md')]: {
              padding: '1.5em',
              borderRadius,
              margin: '0 1.25rem',
            },
          },
          '&.login': {
            padding: '3em',
            borderTopRightRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
            borderBottomLeftRadius: borderRadius,
            borderTopLeftRadius: 0,
            marginLeft: '0.15rem',
          },
          '&.navigation': {
            padding: '20px',
            borderRadius,
            margin: '0 1.25rem 1.25rem',
            position: 'fixed',
            width: '13%'
          },
          '&.navigation-mobile': {
            borderRadius,
            margin: '0 1.25rem 0.75rem',
          },
          '&.thin': {
            borderRadius,
            margin: '0 1.25rem 0.75rem',
          },
          '&.construction': {
            fontFamily: 'consolas',
            padding: muiTheme.spacing(4),
            textAlign: 'center',
            backgroundColor: amber[200],
            margin: '1rem 0',
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius,
        },
      },
    },

    MuiListItem: {
      styleOverrides: {
        root: {
          backgroundColor: grey[100],
          margin: `${muiTheme.spacing(1.5)} 0`,
          boxShadow: muiTheme.shadows[1],
          borderRadius: '10px',
          border: `1px solid ${grey[300]}`,
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: grey[100],
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          color: white,
          backgroundColor: muiTheme.palette.primary.main,
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .Mui-disabled': { backgroundColor: grey[200] },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .Mui-disabled': { backgroundColor: grey[200] },
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          '&.login': {
            marginTop: '0.75rem',
            marginLeft: '0.15rem',
            borderBottom: 'none',

            '&.Mui-selected': {
              backgroundColor: 'white',
              borderTopLeftRadius: '0.75rem',
              borderTopRightRadius: '0.75rem',
              boxShadow: muiTheme.shadows[1],
            },
          },
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.thin': {
            padding: 0,
          },
        },
      },
    },
  },
})

export default theme
