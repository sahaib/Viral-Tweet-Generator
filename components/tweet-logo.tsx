import React from "react";
import { Feather } from "lucide-react";

export const TweetLogo = ({ size = 24, ...props }) => (
  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
    <Feather className="text-primary" size={size} {...props} />
  </div>
);

export default TweetLogo;
