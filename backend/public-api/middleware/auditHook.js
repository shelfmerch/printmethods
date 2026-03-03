/**
 * Audit Hook Middleware
 * Logs security-relevant events for the public API.
 * In production this would emit to a dedicated audit log store.
 */
function auditHook(eventType) {
    return (req, res, next) => {
        // Hook into response finish to log the audit event
        res.on('finish', () => {
            const auditEntry = {
                timestamp: new Date().toISOString(),
                eventType,
                requestId: req.requestId,
                userId: req.apiAuth ? req.apiAuth.userId : null,
                credentialType: req.apiAuth ? req.apiAuth.credentialType : null,
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
            };

            // Structured log output
            console.log(`[Audit] ${JSON.stringify(auditEntry)}`);
        });

        next();
    };
}

module.exports = { auditHook };
