var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

import React from './js/react.js';

var editorRef = React.createRef();

var openlistRef = React.createRef();
var nameElRef = React.createRef();
var renamebtnRef = React.createRef();
var deletebtnRef = React.createRef();
var exportbtnRef = React.createRef();
var toastRef = React.createRef();
var exporta = document.getElementById("exporta");
var modal = document.getElementById("modal");
var dragCover = document.getElementById("dragcover");

var scripts = void 0,
    setScripts = void 0;

function editorRoot(_ref) {
    _objectDestructuringEmpty(_ref);

    var _React$useState = React.useState([]);

    var _React$useState2 = _slicedToArray(_React$useState, 2);

    scripts = _React$useState2[0];
    setScripts = _React$useState2[1];

    return React.createElement(
        "div",
        {
            id: "app",
            onDragOver: function onDragOver(event) {
                event.preventDefault();
                dragCover.classList.remove("hidden");
            },
            onDrop: function onDrop(event) {
                event.preventDefault();
                Array.from(event.dataTransfer.items).filter(function (e) {
                    return e.type == "text/plain";
                })[0].getAsString(function (text) {
                    if (text.match(/^javascript:/)) {
                        text = text.slice(11);
                        try {
                            text = decodeURIComponent(text); // decode bookmarklet if it's encoded
                        } catch (e) {}
                        window.model.pushEditOperations([], [{
                            range: window.model.getFullModelRange(),
                            text: text
                        }], null);
                    }
                });
                dragCover.classList.add("hidden");
            }
        },
        React.createElement(
            "div",
            { "class": "container" },
            React.createElement(
                "div",
                { "class": "titlebar" },
                React.createElement(
                    "strong",
                    { "class": "bookmarklet-name", ref: nameElRef },
                    "New Bookmarklet"
                ),
                React.createElement(
                    "ul",
                    null,
                    React.createElement(
                        "li",
                        null,
                        React.createElement(
                            "span",
                            null,
                            "File"
                        ),
                        React.createElement(
                            "ul",
                            null,
                            React.createElement(
                                "li",
                                null,
                                React.createElement(
                                    "span",
                                    { id: "newbtn", onClick: newScript },
                                    "New"
                                )
                            ),
                            React.createElement(
                                "li",
                                null,
                                React.createElement(
                                    "span",
                                    null,
                                    "Open"
                                ),
                                React.createElement(
                                    "ul",
                                    { id: "openlist", ref: openlistRef },
                                    scripts
                                )
                            ),
                            React.createElement(
                                "li",
                                null,
                                React.createElement(
                                    "span",
                                    { id: "savebtn", onClick: save },
                                    "Save"
                                )
                            ),
                            React.createElement(
                                "li",
                                null,
                                React.createElement(
                                    "span",
                                    { id: "renamebtn", onClick: rename, ref: renamebtnRef, "class": "disabled" },
                                    "Rename"
                                )
                            ),
                            React.createElement(
                                "li",
                                null,
                                React.createElement(
                                    "span",
                                    { id: "deletebtn", onClick: deleteScript, ref: deletebtnRef, "class": "disabled" },
                                    "Delete"
                                )
                            ),
                            React.createElement(
                                "li",
                                null,
                                React.createElement(
                                    "span",
                                    { id: "exportbtn", onClick: function onClick() {
                                            save(function () {
                                                var script = window.editor.getValue();
                                                var encoded = encodeURIComponent(script);
                                                var url = "javascript:" + encoded;
                                                exporta.href = url;
                                                exporta.innerHTML = nameElRef.current.innerHTML;
                                                modal.style.display = "block";
                                            });
                                        }, ref: exportbtnRef, "class": "disabled" },
                                    "Export"
                                )
                            )
                        )
                    )
                )
            ),
            React.createElement("div", { id: "editor", ref: editorRef, onKeyDown: function onKeyDown(event) {
                    if (event.key == "s" && event.ctrlKey) {
                        event.preventDefault();
                        save();
                    }
                } })
        ),
        React.createElement(
            "div",
            { id: "toast", ref: toastRef },
            "message"
        ),
        React.createElement(
            "div",
            { id: "modal" },
            React.createElement(
                "div",
                null,
                React.createElement(
                    "h1",
                    null,
                    "Export"
                ),
                React.createElement("a", { href: "", id: "exporta" }),
                React.createElement(
                    "span",
                    null,
                    "< Drag me to your bookmarks bar"
                ),
                React.createElement("br", null),
                React.createElement(
                    "button",
                    { id: "modalclose", onClick: function onClick() {
                            modal.style.display = "none";
                        } },
                    "Close"
                )
            )
        ),
        React.createElement("div", { id: "dragcover", onDragLeave: function onDragLeave(event) {
                if (event.target == dragCover) dragCover.classList.add("hidden");
            }, "class": "hidden" })
    );
}

var domContainer = document.querySelector('#root');
var root = ReactDOM.createRoot(domContainer);
root.render(editorRoot({}));
console.log(root);

var scriptId = null;
var savedScripts = null;
function unloadlistener(e) {
    e.preventDefault();
}
function newScript() {
    window.location = "editor.html";
} // just reload the page and unset the scriptId
function save() {
    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (_) {
        return _;
    };

    window.removeEventListener("beforeunload", unloadlistener);
    if (scriptId == null) {
        var name = prompt("Enter a name for the bookmarklet") || "New Bookmarklet";
        var script = btoa(window.editor.getValue());
        var guid = crypto.randomUUID();
        nameElRef.current.innerHTML = name;
        nameElRef.current.id = guid;
        scriptId = guid;
        chrome.storage.local.set(_defineProperty({}, guid, {
            name: name,
            script: script
        })).then(callback);
        renamebtnRef.current.classList.remove("disabled");
        exportbtnRef.current.classList.remove("disabled");
        deletebtnRef.current.classList.remove("disabled");
    } else {
        chrome.storage.local.set(_defineProperty({}, scriptId, {
            name: nameElRef.current.innerHTML,
            script: btoa(window.model.getValue())
        })).then(callback);
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
    save(function () {
        var name = prompt("Enter a new name for the bookmarklet") || "New Bookmarklet";
        nameElRef.current.innerHTML = name;
        chrome.storage.local.get(scriptId, function (data) {
            var script = data[scriptId].script;

            chrome.storage.local.set(_defineProperty({}, scriptId, {
                name: name,
                script: script
            }));
        });
    });
}
var saveTimeout = 500;
var curSave = 0;
var saved = true;
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
        var scriptKeys = Object.keys(data).filter(function (key) {
            return key.match(/^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/);
        });
        console.log("scriptKeys", scriptKeys);
        if (scriptKeys.length == 0) {
            setScripts([React.createElement(
                "li",
                { style: "filter:brightness(0.6);cursor:not-allowed" },
                React.createElement(
                    "span",
                    null,
                    "No scripts saved"
                )
            )]);
        } else {
            var keyNum = 0;
            setScripts(scriptKeys.map(function (key) {
                var name = data[key].name;

                return React.createElement(
                    "li",
                    { key: keyNum++, onClick: function onClick() {
                            window.location = "editor.html?id=" + key;
                        } },
                    React.createElement(
                        "span",
                        null,
                        name
                    )
                );
            }));
        }
    });

    (function () {
        var urlparams = new URLSearchParams(window.location.search);
        if (urlparams.has("id")) {
            var id = urlparams.get("id");
            chrome.storage.local.get(id, function (data) {
                if (data[id]) {
                    var _data$id = data[id],
                        name = _data$id.name,
                        script = _data$id.script;

                    nameElRef.current.innerHTML = name;
                    scriptId = id;
                    window.model.setValue(atob(script));
                }
                model.onDidChangeContent(function () {
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
    var editor = monaco.editor.create(document.getElementById('editor'), {
        value: "// New Bookmarklet\n\n",
        language: 'javascript',
        theme: "vs-dark",
        automaticLayout: true,
        codeActionsOnSaveTimeout: 1000
    });
    window.editor = editor;
    window.model = editor.getModel();
    window.dispatchEvent(new Event("monaco-load"));
});