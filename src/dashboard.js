// run this command to parse jsx files:
// npx babel --watch src --out-dir . --presets react-app/prod
window._objectDestructuringEmpty = function () { }
function Navitem({ children }) {
    return (
        <li>
            <span>{children}</span>
        </li>
    );
}

function Navbar({ }) {
    return (
        <nav>
            <ul>
                <Navitem>test</Navitem>
            </ul>
        </nav>
    );
}
function BookmarkletRow({ name, key, guid }) {
    return (
        <tr key={key}>
            <td>{name}</td>
            <td><a href={`editor.html?id=${guid}`}>Edit</a></td>
        </tr>
    );
}
function BookmarkletTable({ }) {
    let key = 0;
    const [bookmarklets, setBookmarklets] = React.useState([]);
    // await chrome.storage.local.get("")
    React.useEffect(() => {
        chrome.storage.local.get(null, function (data) {
            let bookmarklets = Object.entries(data).filter(([key, value]) => key.match(/^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/)).map(([key, value]) => ({...value, guid: key}));
            console.log("bookmarklets", bookmarklets);
            setBookmarklets(bookmarklets);
        });
        // new Promise(function (resolve) {
        //     setTimeout(function () {
        //         resolve([{ name: "test" }]);
        //     }, 1000);
        // }).then(e => setBookmarklets(e));
    }, []);
    return (
        <table>
            <tr>
                <td>name</td>
            </tr>
            {bookmarklets.length == 0 ? <div>Loading Bookmarklets...</div> : bookmarklets.map(bookmarklet => <BookmarkletRow key={key++} name={bookmarklet.name} guid={bookmarklet.guid} />)}
        </table>
    );
}

function dashboardRoot({ }) {
    return (
        <div id="app">
            <Navbar />
            <BookmarkletTable />
        </div>
    );
}

const domContainer = document.querySelector('#root');
const root = ReactDOM.createRoot(domContainer);
root.render(dashboardRoot({}));