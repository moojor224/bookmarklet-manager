addEventListener("message", function (e) {
    console.log("web worker got message");
    let { type, data } = e.data;
    if (type == "run") {
        let { script, tabId } = data;
        chrome.scripting.executeScript({
            target: { tabId },
            injectImmediately: true,
            func: new Function(atob(script)),
            // args: [atob(source)],
        }).catch(err => {
            console.error("caught error executing bookmarklet", err);
        });
    }
});