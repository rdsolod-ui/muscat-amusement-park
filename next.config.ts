import type { NextConfig } from "next";
const basePath="/muscat-amusement-park";
const config:NextConfig={output:"export",basePath,trailingSlash:true,images:{unoptimized:true},poweredByHeader:false,devIndicators:false,reactStrictMode:true};
export default config;
