import React from "react";
import { Spinner } from "zmp-ui";

function LoadingFallback(props) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Spinner />
        </div>
    );
}

export default LoadingFallback;
