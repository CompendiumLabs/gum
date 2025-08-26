//
// rendering
//

// for server side rendering
let resvg = null
if (typeof window == 'undefined') {
    resvg = await import('@resvg/resvg-js')
} else {
    resvg = window.resvg
    await resvg.initWasm(fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'))
}

// render svg to png
function renderSvg(svg, { size = 500, fonts = null }) {
    const fontsArgs = (typeof window == 'undefined') ? {
        fontFiles: fonts ?? [
            './lib/fonts/IBMPlexSans-Regular.ttf',
            './lib/fonts/IBMPlexMono-Regular.ttf',
        ]
    } : {
        fontBuffers: fonts
    }

    const resvgjs = new resvg.Resvg(svg, {
        background: '#ffffff',
        fitTo: {
            mode: 'width',
            width: size,
        },
        font: {
            loadSystemFonts: false,
            ...fontsArgs,
        },
    })

    const data = resvgjs.render()
    return data.asPng()
}

export { renderSvg }
