import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const pages = ['Reset Default', 'Load Preset', 'Load Ancient'];

function ResponsiveAppBar(props) {
  var callbacks = {
    'Reset Default': props.reset_default,
  }

  return (
    <Box sx={{width: '100%', height: 100, background: 'lightblue'}}>
      {pages.map((page) => (
        <Button
          variant='outlined'
          key={page}
          onClick={() => {console.log("test"); props.reset_default();}}
          sx={{ margin:1, color:'black', background: 'white' }}
        >
          {page}
        </Button>
      ))}
    </Box>
  );
}
export default ResponsiveAppBar;
