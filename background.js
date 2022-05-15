// Sync when first installed and when bookmarks are updated
// Also clear the tree on every update

var tree = []

chrome.runtime.onInstalled.addListener(() => {
    syncTree()
})

chrome.bookmarks.onChanged.addListener(() => {
    syncTree()
})

function syncTree()
{
    tree = []
    readRoot()
}

function findInTree(path)
{
    var folder
    path.forEach(q => {
        if(!folder) folder = tree.find(f => f.id === q)
        else folder = folder.content.find(f => f.id === q)
        if(!folder) return false
    })
    return folder
}

function readFolder(queryFolderId, path) // query is the folder to query, path leads to the query's parent 
{
    console.log(tree)
    chrome.bookmarks.getChildren(queryFolderId).then(async children => { // gtes an array of children
        // everything here belongs to queryFolder
        const { cBookmarks, cFolders } = await readChildren(children)
        
        const parentFolder = findInTree(path)
        const folder = parentFolder.content.find(f => f.id === queryFolderId)

        cFolders.forEach(f => {
            folder.content.push({ title: f.title, id: f.id, parentId: queryFolderId, type: "folder" , content: [] })
            path.push(queryFolderId)
            readFolder(f.id, path) // this folder belongs to queryFolder
        })

        cBookmarks.forEach(b => {
            folder.content.push({ title: b.title, id: b.id, parentId: queryFolderId, type: "bookmark" , url: b.url })
        })
    
    })
}

function readRoot(){
    chrome.bookmarks.getChildren('0').then(roots => { // this reads the folders at root, parented byt 0, like the bookmarks bar, other and mobile
        // everything in here belongs to root (0)
        roots.forEach(p => {
            if (!tree.find(f => f.id === p.id)) { tree.push({ title: p.title, id: p.id, parentId: 0, type: "folder" , content: [] }) }
            chrome.bookmarks.getChildren(p.id).then(async children => {
                // everything in here belongs to p

                const { cBookmarks, cFolders } = await readChildren(children)


                cFolders.forEach(f => {
                    tree.find(f => f.id === p.id).content.push({ title: f.title, id: f.id, parentId: p.id, type: "folder" , content: [] }) // need to get the path to this folder
                    readFolder(f.id, ['0', p.id]) // the path to the folder is 0, f.id. f.id is to use the api. path is for tree.
                })

                cBookmarks.forEach(b => {
                    tree.find(f => f.id === p.id).content.push({ title: b.title, id: b.id, parentId: p.id, type: "bookmark" , url: b.url })
                })
    
            })
        })
    })
}

const readChildren = async (children) => {
    const cBookmarks = await children.filter(c => c.url)
    const cFolders = await children.filter(c => !c.url)

    return { cBookmarks, cFolders }
}