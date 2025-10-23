export function sseHeaders() {
    return new Headers({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel_Buffering": "no",
    });
}

export function sseChunk(event: string, data: unknown) {
    return 'event: ${event}\ndata: ${JSON.stringify(data)}\n\n';
}