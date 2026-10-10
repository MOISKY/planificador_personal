import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="100 640 720 720"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Círculo azul de fondo */}
            <circle cx="460.82" cy="1000" r="310.6" fill="#009fe3" />
            {/* N. en blanco */}
            <path
                fill="#fff"
                d="M490.7,1157.31L401.53,948.48l-47.32,208.83H280.32L352,851.83l87.18.39,75.51,173.17,40.25-173.17h71.89l-69.12,305.09Z"
            />
            <path
                fill="#fff"
                d="M635,1096.57c-18.54,0-33.34,14.35-33.34,32.35c0,18.34,14.8,32.74,33.34,32.74c18.74,0,33.14-14.4,33.14-32.56C668.14,1110.97,653.74,1096.57,635,1096.57Z"
            />
        </svg>
    );
}
