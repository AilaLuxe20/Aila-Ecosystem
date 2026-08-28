const requests: unknown[] = [];

export function logRequest(request: unknown) {
    requests.push({
        timestamp: new Date().toISOString(),
        request
    });
}

export function getRequests() {
    return requests;
}
