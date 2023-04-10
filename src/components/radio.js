import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default function RadioAttackRetreat(props) {
  return (
    <FormControl>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        defaultValue="attack"
        value={props.value}
        onChange={props.onChange}
        name="radio-buttons-group"
      >
        <FormControlLabel value="attack" control={<Radio />} label="Attack" />
        <FormControlLabel value="retreat" control={<Radio />} label="Retreat" />
      </RadioGroup>
    </FormControl>
  );
}