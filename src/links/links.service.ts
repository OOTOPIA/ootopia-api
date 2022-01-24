import { Injectable } from '@nestjs/common';

interface LinkForShared {
    title?: string;
    description?: string;
    imageUrl?: string;
    type?: string;
}

@Injectable()
export class LinksService {
    linkForShared(content : LinkForShared) {
        return  content ? `
            <!DOCTYPE html>
            <html>
            <head>
                <title><strong>${content.title}</strong></title>

                <meta property="og:site_name" content="OOTOPIA">
                <meta property="description" content="${content.description}\r\nDownload OOTOPIA">
                <meta property="og:image" itemprop="image" content="${content.imageUrl}">
                <meta property="og:type" content="website">

                <script>
                    function detectMob() {
                        const toMatch = [
                            /Android/i,
                            /webOS/i,
                            /iPhone/i,
                            /iPad/i,
                            /iPod/i,
                            /BlackBerry/i,
                            /Windows Phone/i
                        ];
                        
                        return toMatch.find((toMatchItem) => {
                            return navigator.userAgent.match(toMatchItem);
                        });
                    }
    
                    let platform = detectMob();
                    if(platform == '/Android/i') {
                        window.location.href = "https://play.google.com/store/apps/details?id=org.ootopia.beta";
                    } else if(['/webOS/i','/iPhone/i','/iPad/i','/iPod/i'].find( _platform => _platform == platform)) {
                        window.location.href = "https://testflight.apple.com/join/6uVd4CNC"; 
                    }
                </script>
            </head>
            <body>
            </body>
            </html>
            `: null;
    }
}
