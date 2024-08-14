const table = document.getElementById("scripts");

function bookmarklet(source, name, id) {
    let row = document.createElement('tr');
    let nameCell = document.createElement('td');
    let runCell = document.createElement('td');
    let editCell = document.createElement('td');
    let deleteCell = document.createElement('td');
    let runButton = document.createElement('button');
    let editButton = document.createElement('button');
    let deleteButton = document.createElement('button');
    nameCell.textContent = name;
    runButton.textContent = 'Run';
    editButton.textContent = 'Edit';
    deleteButton.textContent = 'Delete';
    runButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
            // console.log("current tab", tab);
            if (!tab) return;
            // navigator.serviceWorker.getRegistration().then(reg => {
            //     console.log("reg", reg);
            //     reg.active.postMessage({
            //         type: "run",
            //         data: {
            //             script: source,
            //             tabId: tab.id
            //         }
            //     });
            // });
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                injectImmediately: true,
                // func: new Function(atob(script)),
                args: [atob(source)],
                func: newEval,
            }).catch(err => {
                console.log("caught error executing bookmarklet", err);
            });
            let worker = chrome.extension.getBackgroundPage();
            // console.log("worker", worker);
            // worker.postMessage({
            //     type: "run",
            //     data: {
            //         script: source,
            //         tabId: tab.id
            //     }
            // });
        });
    });
    editButton.addEventListener('click', () => {
        openEditor(id);
    });
    deleteButton.addEventListener('click', () => {
        if (confirm("Are you sure you want to delete this script?")) {
            chrome.storage.local.remove(id).then(() => {
                window.location.reload();
            });
        }
    });
    runCell.appendChild(runButton);
    editCell.appendChild(editButton);
    deleteCell.appendChild(deleteButton);
    row.appendChild(nameCell);
    row.appendChild(runCell);
    row.appendChild(editCell);
    row.appendChild(deleteCell);
    return row;
}

chrome.storage.local.get("editorTab", function (data) {
    if (!data.editorTab) {
        chrome.storage.local.set({
            editorTab: 0
        });
    }
});

const editorUrl = chrome.runtime.getURL('editor.html');

function newTab(url = editorUrl) {
    chrome.tabs.create({
        url
    }).then(tab => {
        chrome.storage.local.set({
            editorTab: tab.id
        });
    });
}

function openEditor(scriptId) {
    let url = editorUrl;
    if (scriptId) {
        url += `?id=${scriptId}`;
    }
    chrome.storage.local.get("editorTab", function (id) {
        console.log(id);
        chrome.tabs.get(id.editorTab).then(tab => {
            if (tab) {
                let opts = { active: true };
                if (url != editorUrl) {
                    opts.url = url;
                }
                chrome.windows.update(tab.windowId, { focused: true }); // focus window that has editor tab
                chrome.tabs.update(id.editorTab, opts); // focus editor tab
                window.close(); // close popup
            } else {
                newTab(url); // create new editor tab
            }
        }).catch(err => {
            newTab(url);
        });
    });
}

document.getElementById("editor").addEventListener("click", function () {
    openEditor();
});

chrome.storage.local.get(null, function (data) {
    let scriptKeys = Object.keys(data).filter(key => key.match(/^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/));
    console.log("scriptKeys", scriptKeys);
    if (scriptKeys.length == 0) {
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        td.innerHTML = "No scripts saved";
        tr.appendChild(td);
        table.appendChild(tr);
    } else {
        scriptKeys.forEach(key => {
            let script = data[key];
            let tr = bookmarklet(script.script, script.name, key);
            table.appendChild(tr);
            console.log(script, tr);
        });
    }
});