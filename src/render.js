//
// rendering
//

async function svgToPng(svgData, size, blob=false) {
    // make svg blob URL
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'})
    const svgUrl = URL.createObjectURL(svgBlob)

    // create canvas and context
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    // return promise
    return new Promise((resolve, reject) => {
        img.onload = () => {
            const pixelRatio = window.devicePixelRatio
            const [width, height] = size
            canvas.width = width * pixelRatio
            canvas.height = height * pixelRatio
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            if (blob) {
                canvas.toBlob(b => {
                    const url = URL.createObjectURL(b)
                    resolve(url)
                })
            } else {
                const pngData = canvas.toDataURL('image/png')
                resolve(pngData)
            }
        }

        // handle errors
        img.onerror = (error) => {
            console.error('svgToPng error', error)
            reject(new Error(`SVG parsing error: ${error}`))
        }

        // set image source to SVG URL
        img.src = svgUrl
    })
}

// convert a url blob (data:abcd-1234) to a data url (data:image/png;base64,...)
async function urlToData(url) {
    // get image blob and assert type
    const response = await fetch(url)
    const blob = await response.blob()

    // return promise for data url
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
            const data = event.target.result
            resolve(data)
        }
        reader.onerror = (error) => {
            console.error('blobToData error', error)
            reject(new Error(`Blob to data error: ${error}`))
        }
        reader.readAsDataURL(blob)
    })
}

export { svgToPng, urlToData }
