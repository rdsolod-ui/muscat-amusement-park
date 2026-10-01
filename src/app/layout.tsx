import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'منتزه مسقط الترفيهي والمائي | Muscat Family Park',description:'وجهة عائلية مقترحة في السيب، مسقط. A proposed family destination in Seeb, Muscat.',robots:{index:false,follow:false}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ar" dir="rtl"><body>{children}</body></html>;}
