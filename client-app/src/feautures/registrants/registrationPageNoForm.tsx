import { observer } from "mobx-react-lite";
import React from 'react';
import bricksImage from  '../../banners/bricks.jpg'

export default observer(function RegistrationPageNoForm() {
    const bannerStyle: React.CSSProperties = {
        height: '24.5vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontSize: '100px'
    };

    const backgroundStyle: React.CSSProperties = {
        backgroundImage: `url(${bricksImage})`,
        backgroundSize: 'cover',
        opacity: 0.5,
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: -1,
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '24.5vh' }}>
            <div style={backgroundStyle}></div> {/* Background with opacity */}
            <div style={bannerStyle}>Hello From Registration Page No Form</div> {/* Text content */}
        </div>
    );
});