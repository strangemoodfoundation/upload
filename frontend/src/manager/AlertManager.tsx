import React from 'react';
import toast from 'react-hot-toast';
import { Button, ThemeProvider, Typography } from '@mui/material';

// import { muiTheme } from 'src/styling';
// import { Linkify } from 'src/components/general';

/**
 * 
 */

class AlertManager {
  message(
    text: string,
    type: 'info' | 'success' | 'error' | 'warning' | 'debug'
  ) {
    switch (type) {
      case 'info':
        // TODO: customize this
        toast(text);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'production') break;
        // TODO: customize this
        toast(text);
        break;
      case 'success':
        toast.success(text);
        break;
      case 'error':
        toast.error(text);
        break;
      case 'warning':
        // TODO: customize this
        toast.error(text);
        break;
    }
  }

  announce(title: string, message?: string) {
    // https://react-hot-toast.com/
    // TODO: model this off of the TailwindCSS model
    toast(
      (t) => {
        return (
          <span>
            {/* <ThemeProvider theme={muiTheme}> */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                textAlign: 'right',
              }}>
              <Typography variant='overline'>{title}</Typography>
              {message && (
                //   <Linkify>
                <Typography style={{ marginTop: 10 }}>{message}</Typography>
                //   </Linkify>
              )}
              <Button
                onClick={() => toast.dismiss(t.id)}
                style={{ marginTop: 10 }}
                size='small'
                color='primary'>
                Dismiss
              </Button>
            </div>
            {/* </ThemeProvider> */}
          </span>
        );
      },
      { duration: 1000000, position: 'top-right' }
    );
  }
}

export default new AlertManager();
