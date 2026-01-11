import React from "react";
import { Spinner } from "zmp-ui";

function LoadingFallback(props) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Spinner logo="https://res.cloudinary.com/djiwsnmtq/image/upload/v1768034655/lqd_l8z0wh.jpg" />
        </div>
    );
}

export default LoadingFallback;
