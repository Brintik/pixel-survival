export const images = {};

export function loadImage(name, src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            images[name] = img;
            resolve(img);
        };
        img.onerror = reject;
        img.src = src;
    });
}

export function loadAllImages(imageDict) {
    const promises = [];
    for (const [name, src] of Object.entries(imageDict)) {
        promises.push(loadImage(name, src));
    }
    return Promise.all(promises);
}