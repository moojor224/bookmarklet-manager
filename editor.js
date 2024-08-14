const openlist = document.getElementById("openlist");
const nameEl = document.querySelector("strong.bookmarklet-name");
const savebtn = document.getElementById("savebtn");
const renamebtn = document.getElementById("renamebtn");
const newbtn = document.getElementById("newbtn");
const deletebtn = document.getElementById("deletebtn");
const exportbtn = document.getElementById("exportbtn");
const editorContainer = document.getElementById("editor");
const toast = document.getElementById("toast");
const exporta = document.getElementById("exporta");
const modal = document.getElementById("modal");
const modalclose = document.getElementById("modalclose");
editorContainer.addEventListener("keydown", function (event) {
    if (event.key == "s" && event.ctrlKey) {
        event.preventDefault();
        save();
    }
});
exportbtn.addEventListener("click", function () {
    save(() => {
        let script = window.editor.getValue();
        let encoded = encodeURIComponent(script);
        let url = "javascript:" + encoded;
        exporta.href = url;
        exporta.innerHTML = nameEl.innerHTML;
        modal.style.display = "block";
    });
});
modalclose.addEventListener("click", function () {
    modal.style.display = "none";
});
savebtn.addEventListener("click", save);
deletebtn.addEventListener("click", deleteScript);
renamebtn.addEventListener("click", rename);
newbtn.addEventListener("click", newScript);
let scriptId = null;
let savedScripts = null;
function unloadlistener(e) { e.preventDefault() }
function newScript() { window.location = "editor.html" } // just reload the page and unset the scriptId
function save(callback = _ => _) {
    window.removeEventListener("beforeunload", unloadlistener);
    if (scriptId == null) {
        let name = prompt("Enter a name for the bookmarklet") || "New Bookmarklet";
        let script = btoa(window.editor.getValue());
        let guid = crypto.randomUUID();
        nameEl.innerHTML = name;
        nameEl.id = guid;
        scriptId = guid;
        chrome.storage.local.set({
            [guid]: {
                name,
                script
            }
        }).then(callback);
        renamebtn.classList.remove("disabled");
        exportbtn.classList.remove("disabled");
        deletebtn.classList.remove("disabled");
    } else {
        chrome.storage.local.set({
            [scriptId]: {
                name: nameEl.innerHTML,
                script: btoa(window.model.getValue())
            }
        }).then(callback);
    }
    toast.innerHTML = "Saved";
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("show"), 1);
}
function deleteScript() {
    if (!scriptId) return;
    if (confirm("Are you sure you want to delete this script?")) {
        chrome.storage.local.remove(scriptId, function () {
            window.location = "editor.html";
        });
    }
}
function rename() {
    save(() => {
        let name = prompt("Enter a new name for the bookmarklet") || "New Bookmarklet";
        nameEl.innerHTML = name;
        chrome.storage.local.get(scriptId, function (data) {
            let { script } = data[scriptId];
            chrome.storage.local.set({
                [scriptId]: {
                    name,
                    script
                }
            });
        });
    });
}
let saveTimeout = 500;
let curSave = 0;
let saved = true;
setInterval(function () {
    if (curSave <= 0) {
        if (!saved) {
            // save();
            saved = true;
        }
        return;
    }
    saved = false;
    curSave -= 1;
}, 1);

window.addEventListener("monaco-load", function () {
    chrome.storage.local.get(null, function (data) {
        let scriptKeys = Object.keys(data).filter(key => key.match(/^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/));
        console.log("scriptKeys", scriptKeys);
        if (scriptKeys.length == 0) {
            let li = document.createElement("li");
            li.innerHTML = "<span>No scripts saved</span>";
            li.style = "filter:brightness(0.6);cursor:not-allowed;";
            openlist.appendChild(li);
        } else {
            scriptKeys.forEach(key => {
                let { name } = data[key];
                let li = document.createElement("li");
                li.innerHTML = `<span>${name}</span>`;
                li.addEventListener("click", function () {
                    window.location = `editor.html?id=${key}`;
                });
                openlist.appendChild(li);
            });
        }
    });

    (function () {
        let urlparams = new URLSearchParams(window.location.search);
        if (urlparams.has("id")) {
            let id = urlparams.get("id");
            chrome.storage.local.get(id, function (data) {
                if (data[id]) {
                    let { name, script } = data[id];
                    nameEl.innerHTML = name;
                    scriptId = id;
                    window.model.setValue(atob(script));
                }
                model.onDidChangeContent(function (...args) {
                    curSave = saveTimeout;
                    window.addEventListener("beforeunload", unloadlistener);
                });
            });
            renamebtn.classList.remove("disabled");
            exportbtn.classList.remove("disabled");
            deletebtn.classList.remove("disabled");
        }
    })();
});

require.config({ paths: { vs: "monaco/min/vs" } });
require(["vs/editor/editor.main"], function () {
    let editor = monaco.editor.create(document.getElementById('editor'), {
        value: "// New Bookmarklet\n\n",
        language: 'javascript',
        theme: "vs-dark",
        automaticLayout: true,
        codeActionsOnSaveTimeout: 1000,
    });
    window.editor = editor;
    window.model = editor.getModel();
    window.dispatchEvent(new Event("monaco-load"));
});