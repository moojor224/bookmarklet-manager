chrome.userScripts.configureWorld({
    csp: "script-src 'self' 'unsafe-eval'; object-src 'self';",
}, function () {
    chrome.userScripts.register([{
        id: "userScriptBookmarkletHost",
        matches: ["*://*/*"],
        js: [{
            code: (function () {
                window.addEventListener("message", function (message) {
                    let { type, data } = message.data;
                    if (type == "EXECUTE_BOOKMARKLET") {
                        // eval(data);
                        console.log(data);
                    }
                });
            }).toString()() + "()"
        }]
    }]);
});