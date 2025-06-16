export function cspConsoleReporting(reportUrl: string) {

    console.log('CSP Console Reporting initialized with report URL:', reportUrl);

    window.addEventListener('securitypolicyviolation', function (event) {
        const violationDetails = {
            blockedURI: event.blockedURI,
            violatedDirective: event.violatedDirective,
            sourceFile: event.sourceFile,
            lineNumber: event.lineNumber,
            columnNumber: event.columnNumber,
            statusCode: event.statusCode,
        };

        console.log('Reporting CSP violation from package:', violationDetails);

        fetch(reportUrl, {
            method: 'POST',
            body: JSON.stringify(violationDetails),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
            .then(data => {
                console.log('CSP violation report sent:', data);
            })
            .catch(error => {
                console.error('Error sending CSP violation report:', error);
            });
    });
}
