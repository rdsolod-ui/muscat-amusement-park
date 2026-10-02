import type { Metadata } from 'next';
import './globals.css';
import './tv-presentation.css';
import './masterplan-v4.css';
export const metadata: Metadata = {title:'منتزه مسقط للألعاب | Muscat Amusement Park (MAP)',description:'وجهة عائلية مقترحة في السيب، مسقط. A proposed family destination in Seeb, Muscat.',robots:{index:false,follow:false}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ar" dir="rtl"><body>{children}</body></html>;}
