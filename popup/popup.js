browser.contextMenus.onClicked.addListener(function(info,tab) {
    switch (info.menuItemId) {
        case "getWb":
            document.getElementById("url").value = info.pageUrl;
            break;
    }
});

browser.contextMenus.create({
    id: "getWb",
    title: "Query Wayback",
    contexts: ["page"]
  }, onCreated);

function onCreated() {
    console.log("Context Menu Created")
}

function onError(error) {
    console.log(`This was an error ${error}`)
}

function createUrl() {
    query = [getLimit(),getMimetype(),getStatus(),getLength(),getKeyword()].filter(x=>!x=="");
    site = document.getElementById("url").value.replace(/^https?:\/\//,"");
    if (site !== "" && typeof(site)==="string") {
        return `http://web.archive.org/cdx/search/cdx?url=${site}*&output=json&collapse=urlkey&${query.join("&")}`
    }   else {
        return ""
    }
}

function getLimit() {
    limit = document.getElementById("limit").valueAsNumber
    if (!isNaN(limit)) {
        return `limit=${limit}`
    }
    else {
        return ""
    }
}

function getMimetype() {
    invert = document.getElementById("mimetypeCheck").checked ? "!" : "";
    reg = resStr = document.getElementById("mimetype").value;
    if (reg!=="") {
        return `filter=${invert}mimetype:${encodeURIComponent(reg)}`
    }
    else {
        return ""
    }
}

function getStatus() {
    invert = document.getElementById("statusCheck").checked ? "!" : "";
    reg = resStr = document.getElementById("status").value;
    if (reg!=="") {
        return `filter=${invert}statuscode:${encodeURIComponent(reg)}`
    }
    else {
        return ""
    }
}

function getLength() {
    invert = document.getElementById("lengthCheck").checked ? "!" : "";
    reg = resStr = document.getElementById("length").value;
    if (reg!=="") {
        return `filter=${invert}length:${encodeURIComponent(reg)}`
    }
    else {
        return ""
    }
}

function getKeyword() {
    invert = document.getElementById("keywordCheck").checked ? "!" : "";
    reg = resStr = document.getElementById("keyword").value;
    if (reg!=="") {
        return `filter=${invert}urlkey:${encodeURIComponent(reg)}`
    }
    else {
        return ""
    }
}

function processData(json) {
    if (json[0].includes("urlkey")) {
    json.shift()
    }
    return json.map(x=> {return { link:`${x[2]}`,wlink:`https://web.archive.org/web/${x[1]}${x[2].includes("image/")?"im_":""}/${x[3]}`}})
}

function createTab(info) {
    let creating = browser.tabs.create({url:"about:blank"});
    creating.then((tab)=>{
        console.log(`Tab created ${tab.id}`);
        browser.tabs.executeScript(tab.id,{code:`
        links=${info};
        links.forEach(x=>{
            e = document.createElement("a");
            e2 = document.createElement("a");
            e.href = x.link;
            e.innerText = x.link;
            e.setAttribute("style","padding: 20px");
            e1.href = x.wlink;
            e1.innerText = x.wlink;
            e1.setAttribute("style","padding: 20px");
            b = document.createElement("br");
            document.body.appendChild(e);
            document.body.appendChild(e2);
            document.body.appendChild(b);
        })
        `})

    }, onError)
}

function submit() {
    u = createUrl();
    fetch(u).then(
        (response) => response.json()
    ).then(
        (data) => {
            filtdata = processData(data);
            createTab(filtdata);
        }
    )
}