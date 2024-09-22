Dropzone.autoDiscover = false;

function init() {
  let dz = new Dropzone("#dropzone", {
    url: "/",
    maxFiles: 1,
    addRemoveLinks: true,
    dictDefaultMessage: "Drop an image here to upload",
    autoProcessQueue: false,
  });

  dz.on("addedfile", function () {
    if (dz.files.length > 1) {
      dz.removeFile(dz.files[0]); // Keep only the most recent file
    }
  });

  dz.on("complete", function (file) {
    // Ensure file has a dataURL
    if (!file.dataURL) return;

    let url = "http://127.0.0.1:5000/classify_image";

    $.post(
      url,
      {
        image_data: file.dataURL,
      },
      function (data, status) {
        console.log(data);
        if (!data || data.length === 0) {
          $("#resultHolder").hide();
          $("#divClassTable").hide();
          $("#error").show();
          return;
        }

        let bestMatch = getBestMatch(data);
        if (bestMatch) {
          $("#error").hide();
          $("#resultHolder").show();
          $("#divClassTable").show();
          $("#resultHolder").html(
            $(`[data-player="${bestMatch.class}"]`).html()
          );
          updateProbabilities(bestMatch);
        }
      }
    );
  });

  $("#submitBtn").on("click", function () {
    dz.processQueue();
  });
}

function getBestMatch(data) {
  let bestScore = -1;
  let match = null;

  for (let i = 0; i < data.length; ++i) {
    let maxScoreForThisClass = Math.max(...data[i].class_probability);
    if (maxScoreForThisClass > bestScore) {
      match = data[i];
      bestScore = maxScoreForThisClass;
    }
  }

  return match;
}

function updateProbabilities(match) {
  let classDictionary = match.class_dictionary;

  for (let personName in classDictionary) {
    let index = classDictionary[personName];
    let probabilityScore = match.class_probability[index];
    let elementName = "#score_" + personName;
    $(elementName).html(probabilityScore);
  }
}

$(document).ready(function () {
  console.log("ready!");
  $("#error").hide();
  $("#resultHolder").hide();
  $("#divClassTable").hide();
  init();
});
