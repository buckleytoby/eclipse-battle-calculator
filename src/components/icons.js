import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import {Typography} from '@mui/material';
import * as Icons from './icons_index'
import explosion from '../assets/explosion_lowres.png'
import Tooltip from '@mui/material/Tooltip';
import CasinoIcon from '@mui/icons-material/Casino';
import ShieldMoonIcon from '@mui/icons-material/ShieldMoon';
import { ShieldMoon } from '@mui/icons-material';


export function Icon(props){
    // default Icon class
    return (
        <Tooltip title={props.description}>
        <Paper 
            sx={{bgcolor: props.bgcolor,
                 width: 75,
                 height: 75,
                 margin: 2,
                 display: 'flex',
                 flexWrap: 'wrap',
                 flexDirection: 'column',
                 justifyContent: 'flex-end',
                 alignContent: 'center',
                 alignItems: 'center',
                 borderRadius: 5,
                 ...props.sx
            }} 
            style={{
                backgroundImage: `url('${props.bg_url}')` ,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                ...props.style,
            }}
            // {...props} // put at end so it can overwrite if needed
        > <Typography variant='h4' style={props.style}> {props.content}
          </Typography>
        </Paper>
        </Tooltip>
    )
}

//// Cannons ////
export function YellowCannon(props){
    return (
        <Icon bgcolor='yellow' {...props} bg_url={Icons.yl} description="Yellow Cannon"/>
    )
}
export function OrangeCannon(props){
    return (
        <Icon bgcolor='orange' {...props} bg_url={Icons.oj} description="Orange Cannon"/>
    )
}
export function BlueCannon(props){
    return (
        <Icon bgcolor='blue' {...props} bg_url={Icons.bl} />
    )
}
export function RedCannon(props){
    return (
        <Icon bgcolor='red' {...props} bg_url={Icons.rd} />
    )
}
//// Missiles ////
export function YellowMissile(props){
    return (
        <Icon bgcolor='yellow' {...props} bg_url={Icons.yl_ms} />
    )
}
export function OrangeMissile(props){
    return (
        <Icon bgcolor='orange' {...props} bg_url={Icons.oj_ms} />
    )
}
//// Ship Blueprint Items ////
export function Ships(props){
    return (
        <Icon bgcolor='background.Paper' {...props} bg_url={Icons.ships} description="Number of Ships"/>
    )
}
export function Computers(props){
    return (
        <Icon bgcolor='background.Paper' {...props} content={`+${props.content}`} bg_url={Icons.ships} description="Number of Computers"/>
    )
}
export function Shields(props){
    return (
        <Icon bgcolor='black'  {...props} style={{display: 'flex', flexFlow: 'column', alignSelf: 'center', alignItems: 'center', justifyContent:'center'}}  content={<><ShieldMoon color="primary" style={{display: 'flex', alignSelf: 'center'}} /><b style={{display: 'flex', alignSelf: 'center', color: 'white'}}>{props.content}</b></>} bg_url='' description="Number of Shields"/>
    )
}
export function Hulls(props){
    return (
        <Icon bgcolor='background.Paper' {...props} bg_url={Icons.hull} description="Number of Hulls"/>
    )
}
export function Initiative(props){
    return (
        <Icon bgcolor='background.Paper' {...props} bg_url={Icons.init} description="Number of Initiative"/>
    )
}
//// Ship Icons ////
function Interceptor(props){
    return (
        <Icon bgcolor='black' sx={{borderRadius: 1}} {...props} bg_url={Icons.Interceptor} description="Interceptor"/>
    )
}
function Cruiser(props){
    return (
        <Icon bgcolor='black' sx={{borderRadius: 1}} {...props} bg_url={Icons.Cruiser} description="Cruiser"/>
    )
}
function Dreadnought(props){
    return (
        <Icon bgcolor='black' sx={{borderRadius: 1}} {...props} bg_url={Icons.Dreadnought} description="Dreadnought"/>
    )
}
function Starbase(props){
    return (
        <Icon bgcolor='black' sx={{borderRadius: 1}} {...props} bg_url={Icons.Starbase} description="Starbase"/>
    )
}
//// make dictionary
export const ShipIcons = {'Interceptor': Interceptor,
               'Cruiser': Cruiser,
               'Dreadnought': Dreadnought,
               'Starbase': Starbase
              }
//// MISC ////
export function Damage(props){
    return (
        <Icon bgcolor='#880808'  {...props} style={{display: 'flex', flexFlow: 'column', alignSelf: 'center', alignItems: 'center', justifyContent:'center'}} content={<><img width={25} height={25} src={explosion} alt="explosion" /><b>{props.content}</b></>} bg_url='' description="Damage Taken"/>
    )
}
export function DamageGiven(props){
    return (
        <Icon bgcolor='lightgrey'  {...props} style={{display: 'flex', flexFlow: 'column', alignSelf: 'center', alignItems: 'center', justifyContent:'center'}} content={<><img style={{display: 'flex', alignSelf: 'center'}} width={25} height={25} src={explosion} alt="explosion" /><b style={{display: 'flex', alignSelf: 'center'}}>{props.content}</b></>} bg_url='' description="Damage Given"/>
    )
}
export function Dice(props){
    return (
        <Icon bgcolor=''  {...props} style={{display: 'flex', flexFlow: 'column', alignSelf: 'center', alignItems: 'center', justifyContent:'center'}}  content={<><CasinoIcon style={{display: 'flex', alignSelf: 'center'}} /><b style={{display: 'flex', alignSelf: 'center'}}>{props.content}</b></>} bg_url='' description="Roll Value"/>
    )
}