var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

// run this command to parse jsx files:
// npx babel --watch src --out-dir . --presets react-app/prod
window._objectDestructuringEmpty = function () {};
function Navitem(_ref) {
    var children = _ref.children;

    return React.createElement(
        "li",
        null,
        React.createElement(
            "span",
            null,
            children
        )
    );
}

function Navbar(_ref2) {
    _objectDestructuringEmpty(_ref2);

    return React.createElement(
        "nav",
        null,
        React.createElement(
            "ul",
            null,
            React.createElement(
                Navitem,
                null,
                "test"
            )
        )
    );
}
function BookmarkletRow(_ref3) {
    var name = _ref3.name,
        key = _ref3.key,
        guid = _ref3.guid;

    return React.createElement(
        "tr",
        { key: key },
        React.createElement(
            "td",
            null,
            name
        ),
        React.createElement(
            "td",
            null,
            React.createElement(
                "a",
                { href: "editor.html?id=" + guid },
                "Edit"
            )
        )
    );
}
function BookmarkletTable(_ref4) {
    _objectDestructuringEmpty(_ref4);

    var key = 0;

    var _React$useState = React.useState([]),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        bookmarklets = _React$useState2[0],
        setBookmarklets = _React$useState2[1];
    // await chrome.storage.local.get("")


    React.useEffect(function () {
        chrome.storage.local.get(null, function (data) {
            var bookmarklets = Object.entries(data).filter(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    key = _ref6[0],
                    value = _ref6[1];

                return key.match(/^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/);
            }).map(function (_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2),
                    key = _ref8[0],
                    value = _ref8[1];

                return Object.assign({}, value, { guid: key });
            });
            console.log("bookmarklets", bookmarklets);
            setBookmarklets(bookmarklets);
        });
        // new Promise(function (resolve) {
        //     setTimeout(function () {
        //         resolve([{ name: "test" }]);
        //     }, 1000);
        // }).then(e => setBookmarklets(e));
    }, []);
    return React.createElement(
        "table",
        null,
        React.createElement(
            "tr",
            null,
            React.createElement(
                "td",
                null,
                "name"
            )
        ),
        bookmarklets.length == 0 ? React.createElement(
            "div",
            null,
            "Loading Bookmarklets..."
        ) : bookmarklets.map(function (bookmarklet) {
            return React.createElement(BookmarkletRow, { key: key++, name: bookmarklet.name, guid: bookmarklet.guid });
        })
    );
}

function dashboardRoot(_ref9) {
    _objectDestructuringEmpty(_ref9);

    return React.createElement(
        "div",
        { id: "app" },
        React.createElement(Navbar, null),
        React.createElement(BookmarkletTable, null)
    );
}

var domContainer = document.querySelector('#root');
var root = ReactDOM.createRoot(domContainer);
root.render(dashboardRoot({}));