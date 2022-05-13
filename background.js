chrome.runtime.onInstalled.addListener(() => {
    readRoot("0");
})

const tree = []

const readFolder = (queryFolderId, prevFolderId, qArr) => {
    console.log(tree)
    chrome.bookmarks.getChildren(queryFolderId).then(async parents => {

        const { bookmarks, folders } = await readChildren(parents)

        for (const bookmark of bookmarks) {
            if (tree.find(f => f.id === prevFolderId).content
                .find(f => f.id === queryFolderId).content.find(p => p.id === bookmark.id)) continue

            tree.find(f => f.id === prevFolderId).content
                .find(f => f.id === queryFolderId).content
                .push({ type: "bookmark", id: bookmark.id, title: bookmark.title, url: bookmark.url })
        }

        for (const folder of folders) {
            if (tree.find(f => f.id === prevFolderId).content
            .find(f => f.id === queryFolderId).content.find(p => p.id === folder.id)) continue

            tree.find(f => f.id === prevFolderId).content
                .find(f => f.id === queryFolderId).content
                .push({ type: "folder", id: folder.id, title: folder.title, content: [] })
            readFolder(folder.id, queryFolderId, qArr.push(queryFolderId))
        }

    })
}

const readRoot = async folderId => {
    chrome.bookmarks.getChildren(folderId).then(parents => {
        parents.forEach(p => {
            if (!tree.find(f => f.id === p.id)) { tree.push({ id: p.id, title: p.title, content: [] }) }
            chrome.bookmarks.getChildren(p.id).then(async children => {
                const { bookmarks, folders } = await readChildren(children)
                bookmarks.forEach(b => {
                    tree.find(f => f.id === p.id).content.push({ type: "bookmark", id: b.id, title: b.title, url: b.url })
                    // console.log(b.title)
                })
                folders.forEach(f => {
                    tree.find(f => f.id === p.id).content.push({ type: "folder", id: f.id, title: f.title, content: [] })
                    // console.log(f.title)
                    readFolder(f.id, p.id, [p.id])
                })
            })
        })
    })
}


const readChildren = async (children) => {
    const bookmarks = await children.filter(c => c.url)
    const folders = await children.filter(c => !c.url)

    return { bookmarks, folders }
}