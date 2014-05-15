var fs = require("fs");
var request = require("request");
var sax = require("sax");
var saxpath = require("saxpath");
var xml2js = require("xml2js");
var _ = require("underscore");


module.exports = {
  scaleRequest: function (increment, parameters, callback) {
    var counter = 0,
      total;

    http.get(parameters).on("response", function (response) {
      var xml = new xmlStream(response, "utf-8");
      xml.on("endElement: csw:SearchResults", function (results) {
        total = results.$.numberOfRecordsMatched
        while (counter < total) {
          counter += increment;
        }
    
        var placeHolder = (counter-increment),
        lastRecord = ((increment-(counter-total))+placeHolder);

        if (typeof callback === "function") {
        callback({
            "increment": increment,
            "placeHolder": placeHolder,
            "lastRecord": lastRecord,
          })
        }
      })
    }).end();
  },
  parseCsw: function (parameters, callback) {
    var saxParser = sax.createStream(true, {lowercasetags: true, trim: true});
    var streamer = new saxpath.SaXPath(saxParser, "//gmd:MD_Metadata");
    var url = "http://" + parameters.host + parameters.path;
    
    request(url).pipe(saxParser);
    streamer.on("match", function (xml) {
      callback(xml);
    })
  },
  xmlToJson: function (xml, callback) {
    var parser = xml2js.parseString;
    parser(xml, function (error, result) {
      if (error) callback(error);
      if (result.hasOwnProperty("gmd:MD_Metadata")) {
        var fileId = result["gmd:MD_Metadata"]["gmd:fileIdentifier"][0]
                     ["gco:CharacterString"][0];
        var dists = result["gmd:MD_Metadata"]["gmd:distributionInfo"][0]
                    ['gmd:MD_Distribution'][0]["gmd:transferOptions"];
        callback(fileId);        
      }
      callback(fileId);
    })
  },
  writeLocalFile: function (response) {
    var outputFile = "./outputs/" + response.id + ".json",
      data = JSON.stringify(response.record);

    fs.writeFile(outputFile, data, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("File saved: " + outputFile);
      }
    })
  },
  pingUrl: function (outputFile, response) {
    var dist = response.dist[0]["gmd:transferOptions"],
      wstream = fs.createWriteStream(outputFile);

    if (dist) {
      var link = dist["gmd:MD_DigitalTransferOptions"]["gmd:onLine"]
        ["gmd:CI_OnlineResource"]["gmd:linkage"]["gmd:URL"];
      
      request(link, function (error, response) {
        if (!error && response.statusCode == 200) {
          console.log("GOOD " + link);
        } else {
          console.log("BAD " + link);
//          wstream.write(link);
        }
      })
    }
  },
  buildDirectory: function () {
  }
};