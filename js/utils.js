
window.hashScript = async function (source) {
    async function hashText(buffer) {
        return await crypto.subtle.digest("SHA-256", buffer);
    }

    async function integrityMetadata(buffer) {
        const hashBuffer = await hashText(buffer);
        const base64string = btoa(
            String.fromCharCode(...new Uint8Array(hashBuffer))
        );

        return `sha256-${base64string}`;
    }

    async function hash(source) {
        const response = await fetch(source);
        const buffer = await response.arrayBuffer();
        const integrity = await integrityMetadata(buffer);
        return integrity;
    }
    return await hash(source);
}