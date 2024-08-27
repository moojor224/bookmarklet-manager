import React from './js/react.js';

let editorRef = React.createRef();

const openlistRef = React.createRef();
const nameElRef = React.createRef();
const renamebtnRef = React.createRef();
const deletebtnRef = React.createRef();
const exportbtnRef = React.createRef();
const toastRef = React.createRef();
const exporta = document.getElementById("exporta");
const modal = document.getElementById("modal");
const dragCover = document.getElementById("dragcover");

let scripts, setScripts;

function editorRoot({ }) {
    [scripts, setScripts] = React.useState([]);
    return (
        <div
            id="app"
            onDragOver={function (event) {
                event.preventDefault();
                dragCover.classList.remove("hidden");
            }}
            onDrop={function (event) {
                event.preventDefault();
                Array.from(event.dataTransfer.items).filter(e => e.type == "text/plain")[0].getAsString(function (text) {
                    if (text.match(/^javascript:/)) {
                        text = text.slice(11);
                        try {
                            text = decodeURIComponent(text); // decode bookmarklet if it's encoded
                        } catch (e) { }
                        window.model.pushEditOperations([], [{
                            range: window.model.getFullModelRange(),
                            text
                        }], null);
                    }
                });
                dragCover.classList.add("hidden");
            }}
        >
            <div class="container">
                <div class="titlebar">
                    <strong class="bookmarklet-name" ref={nameElRef}>New Bookmarklet</strong>
                    <ul>
                        <li>
                            <span>File</span>
                            <ul>
                                <li>
                                    <span id="newbtn" onClick={newScript}>New</span>
                                </li>
                                <li>
                                    <span>Open</span>
                                    <ul id="openlist" ref={openlistRef}>{scripts}</ul>
                                </li>
                                <li>
                                    <span id="savebtn" onClick={save}>Save</span>
                                </li>
                                <li>
                                    <span id="renamebtn" onClick={rename} ref={renamebtnRef} class="disabled">Rename</span>
                                </li>
                                <li>
                                    <span id="deletebtn" onClick={deleteScript} ref={deletebtnRef} class="disabled">Delete</span>
                                </li>
                                <li>
                                    <span id="exportbtn" onClick={function () {
                                        save(() => {
                                            let script = window.editor.getValue();
                                            let encoded = encodeURIComponent(script);
                                            let url = "javascript:" + encoded;
                                            exporta.href = url;
                                            exporta.innerHTML = nameElRef.current.innerHTML;
                                            modal.style.display = "block";
                                        });
                                    }} ref={exportbtnRef} class="disabled">Export</span>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div id="editor" ref={editorRef} onKeyDown={function (event) {
                    if (event.key == "s" && event.ctrlKey) {
                        event.preventDefault();
                        save();
                    }
                }}></div>
            </div>
            <div id="toast" ref={toastRef}>message</div>
            <div id="modal">
                <div>
                    <h1>Export</h1>
                    <a href="" id="exporta"></a><span>&lt; Drag me to your bookmarks bar</span><br />
                    <button id="modalclose" onClick={function () {
                        modal.style.display = "none";
                    }}>Close</button>
                </div>
            </div>
            <div id="dragcover" onDragLeave={function (event) {
                if (event.target == dragCover) dragCover.classList.add("hidden");
            }} class="hidden"></div>
        </div >
    );
}

const domContainer = document.querySelector('#root');
const root = ReactDOM.createRoot(domContainer);
root.render(editorRoot({}));
console.log(root);



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
        nameElRef.current.innerHTML = name;
        nameElRef.current.id = guid;
        scriptId = guid;
        chrome.storage.local.set({
            [guid]: {
                name,
                script
            }
        }).then(callback);
        renamebtnRef.current.classList.remove("disabled");
        exportbtnRef.current.classList.remove("disabled");
        deletebtnRef.current.classList.remove("disabled");
    } else {
        chrome.storage.local.set({
            [scriptId]: {
                name: nameElRef.current.innerHTML,
                script: btoa(window.model.getValue())
            }
        }).then(callback);
    }
    toastRef.current.innerHTML = "Saved";
    toastRef.current.classList.remove("show");
    setTimeout(toastRef.current.classList.add.bind(toastRef.current.classList), 1, "show");
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
        nameElRef.current.innerHTML = name;
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
            setScripts([<li style="filter:brightness(0.6);cursor:not-allowed"><span>No scripts saved</span></li>]);
        } else {
            let keyNum = 0;
            setScripts(scriptKeys.map(key => {
                let { name } = data[key];
                return (
                    <li key={keyNum++} onClick={function () {
                        window.location = `editor.html?id=${key}`;
                    }}><span>{name}</span></li>
                );
            }));
        }
    });

    (function () {
        let urlparams = new URLSearchParams(window.location.search);
        if (urlparams.has("id")) {
            let id = urlparams.get("id");
            chrome.storage.local.get(id, function (data) {
                if (data[id]) {
                    let { name, script } = data[id];
                    nameElRef.current.innerHTML = name;
                    scriptId = id;
                    window.model.setValue(atob(script));
                }
                model.onDidChangeContent(function (...args) {
                    curSave = saveTimeout;
                    window.addEventListener("beforeunload", unloadlistener);
                });
            });
            renamebtnRef.current.classList.remove("disabled");
            exportbtnRef.current.classList.remove("disabled");
            deletebtnRef.current.classList.remove("disabled");
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