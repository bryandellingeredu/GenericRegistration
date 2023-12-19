interface Props {
    size: string
    textColor: string
    outerStarColor: string
    innerStarColor: string
    content: string
}

export default function ArmyLogo ({size,  textColor,  outerStarColor,  innerStarColor, content} : Props) {
  
        const logoStyle: React.CSSProperties = {
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          color: textColor,
          fontSize: size,
          position: 'relative',
          paddingLeft: `calc(${size} + 10px)`,
        };

        const outerStarStyle: React.CSSProperties = {
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            background: outerStarColor,
            display: 'inline-block',
            width: `calc(${size} + 5px)`,
            height: `calc(${size} + 5px)`,
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 0,
          };

          const innerStarStyle : React.CSSProperties = {
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            background: innerStarColor,
            position: 'absolute',
            width: `calc(0.6 * ${size} + 3px)`,
            height: `calc(0.6 * ${size} + 3px)`,
            top: '50%',
            left: `calc(0.17 * ${size} + 2px)`,
            transform: 'translateY(-50%)',
            zIndex: 1,
          };

          return (
            <span style={logoStyle}>
              {content}
              <span style={outerStarStyle} />
              <span style={innerStarStyle} />
            </span>
          );
}