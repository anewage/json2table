// Assuming the array including all JSON objects is given in argument #1

if (process.argv.length < 3) {
    console.log("Please specify your filename as an argument to your script: $$ npm run convert file.json")
    throw new Error("Input File not specified.")
}

else {
    var fs = require("fs")
    const { Parser } = require("json2csv")
    var filename = process.argv[2]
    var outputFilename = process.argv[3] || 'output.csv'

    var dataset = []
    
    // Read objects from an array
    var jsonObjects = JSON.parse(fs.readFileSync(filename))
    var objectsSize = jsonObjects.length-1
    for (var objInd in jsonObjects) {
        console.log(">  Processing object " + objInd + "/" + objectsSize + " ...")
        var obj = jsonObjects[objInd]
        var datapointsSize = obj._embedded['stash:datasets'].length-1
        for (var datapInd in obj._embedded['stash:datasets']) {
            console.log(" >>  Processing data point " + datapInd + "/" + datapointsSize + " (from object #" + objInd + ") ...")
            var datapoint = obj._embedded['stash:datasets'][datapInd]
            // Build basic fields for the row from the objects
            var row = {
                meta_count: obj.count,
                meta_total: obj.total,
                meta_links_self: obj._links.self.href,
                meta_links_first: obj._links.first.href,
                meta_links_last: obj._links.last.href,
                meta_links_next: obj._links.next.href,
                links_self: datapoint._links.self.href,
                links_stash_versions: datapoint._links['stash:versions'].href,
                links_stash_version: datapoint._links['stash:version'].href,
                links_stash_download: datapoint._links['stash:download'].href,
                identifier: datapoint.identifier,
                id: datapoint.id,
                storageSize: datapoint.storageSize,
                relatedPublicationISSN: datapoint.relatedPublicationISSN,
                title: datapoint.title,
                abstract: datapoint.abstract,
                usageNotes: datapoint.usageNotes,
                versionNumber: datapoint.versionNumber,
                versionStatus: datapoint.versionStatus,
                curationStatus: datapoint.curationStatus,
                publicationDate: datapoint.publicationDate,
                lastModificationDate: datapoint.lastModificationDate,
                visibility: datapoint.visibility,
                sharingLink: datapoint.sharingLink,
                userId: datapoint.userId,
                license: datapoint.license,
            }

            // Add other fields that are in array format
            row['links_curies'] = JSON.stringify(datapoint._links.curies)
            row['authors'] = JSON.stringify(datapoint.authors)
            row['keywords'] = JSON.stringify(datapoint.keywords)
            row['locations'] = JSON.stringify(datapoint.locations)
            row['relatedWorks'] = JSON.stringify(datapoint.relatedWorks)
            dataset.push(row)
            console.log("  >>  Done with datapoint #" + datapInd + "\n")
        }
        console.log(" >  Done with object #" + objInd + "\n\n")
    }
    console.log("> Writing the output to " + outputFilename + "\n")
    try {
        const opts = { fields: Object.keys(dataset[0]) }
        console.log(opts)
        const parser = new Parser(opts)
        const csv = parser.parse(dataset)
        fs.writeFile(outputFilename, csv, function (err) {
            if (err) return console.log(err);
            console.log('> Done! Please see ' + outputFilename);
          });
    } catch (err) {
        console.log(err)
    }
}