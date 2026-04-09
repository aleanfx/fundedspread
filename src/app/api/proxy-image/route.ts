import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    try {
        // Truco para Google Avatars: Aumentar la resolución cambiando =s96-c por =s400-c
        let fetchUrl = url;
        
        // --- Mejoras de calidad de imagen por proveedor ---
        
        // 1. Google Avatars: Cambiar =s96-c por =s400-c
        if (fetchUrl.includes('googleusercontent.com') && fetchUrl.includes('=s')) {
            fetchUrl = fetchUrl.replace(/=s\d+-c/, '=s400-c');
        }
        
        // 2. Discord Avatars: Asegurar tamaño de 512px
        if (fetchUrl.includes('cdn.discordapp.com/avatars/')) {
            if (fetchUrl.includes('size=')) {
                fetchUrl = fetchUrl.replace(/size=\d+/, 'size=512');
            } else {
                fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + 'size=512';
            }
        }
        
        // 3. GitHub Avatars: Asegurar tamaño de 400px
        if (fetchUrl.includes('avatars.githubusercontent.com')) {
            if (fetchUrl.includes('s=')) {
                fetchUrl = fetchUrl.replace(/s=\d+/, 's=400');
            } else {
                fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + 's=400';
            }
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) {
            return new NextResponse('Failed to fetch image', { status: response.status });
        }

        const arrayBuffer = await response.arrayBuffer();
        
        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': response.headers.get('content-type') || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
            },
        });
    } catch (error) {
        console.error('Error proxying image:', error);
        return new NextResponse('Internal error proxying image', { status: 500 });
    }
}
