export async function handlerReadiness(req, res) {
    // Set headers
    res.set('Content-Type', 'text/plain; charset=utf-8');
    // Send response - this sends it to the client
    res.send('OK');
    // No return statement needed!
}
