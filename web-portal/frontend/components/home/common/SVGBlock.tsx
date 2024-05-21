import * as React from "react";
import { SVGProps } from "react";
const SVGBlock = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height={450}
        width={340}
        fill="none"
        {...props}
    >
        <path
            fill="#F6EEE6"
            d="M17.5 371.5C9.873 365.646 0 367.251 0 367.251V20.938s9.31 1.317 17.069-6.147C24.828 7.327 24.31 0 24.31 0h248.276S271.207 8.036 280 15.5s17.931 5.438 17.931 5.438v346.124s-8.793-1.425-17.069 5.132c-8.276 6.557-8.276 15.944-8.276 15.944H24.656s.47-10.785-7.156-16.638Z"
        />
    </svg>
);
export default SVGBlock;
