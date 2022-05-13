
const tree = []

const findFolder = (query) => {
    var folder = tree.find(f => f.id === query[0]).content
    if(!folder) return
    for (let i = 1; i < query.length; i++) {
    folder = folder.find(f => f.id === query[i]).content
    console.log(folder)
        if(!folder) return
    }
    return folder
}
