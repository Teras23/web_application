var poll;
var pollId;
var token;
var header;
var url;
var currentlyEditingQuestionId = null;
var locale;

$(document).ready(function () {
    pollId = $("#poll_id").attr("content");
    token = $('#_csrf').attr('content');
    header = $('#_csrf_header').attr('content');
    url = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

    $('#edit-modal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside
        opacity: .5, // Opacity of modal background
        inDuration: 300, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '4%', // Starting top style attribute
        endingTop: '10%', // Ending top style attribute
        ready: function (modal, trigger) {
        }, // Callback for Modal open. Modal and trigger parameters available.
        complete: function () { // Callback for Modal close
            resetModal();
        }
    });

    var add_button = document.getElementById("add-question-button");
    add_button.onclick = openAddModal;

    $("#save-poll-button").click(savePoll);

    $(document).keyup(function (event) {
        if ($("#poll_title_input").is(":focus") && event.key === "Enter") {
            finishEditTitle();
        }
    });

    getQuestions();
    resetModal();

    $("#correct-text").html($("#correct-text").html() + $("#correct-help-wrap").html());
    $("#answer-text").html($("#answer-text").html() + $("#answer-help-wrap").html());

    $(".correct-help-link").first().attr("data-tooltip", $("#correct-help-text").html());
    $(".answer-help-link").first().attr("data-tooltip", $("#answer-help-text").html());
    $("#delete-help-link").attr("data-tooltip", $("#delete-help-text").html());

    $(".tooltipped").tooltip();

    locale = $("html").attr("lang");

    if (window.File && window.FileReader && window.FileList && window.Blob) {
        $("#fileinput").change(readFile);
    }
    else {
        if (locale === "et") {
            alert('File APId ei ole selles brauseris toetatud.');
        }
        else {
            alert('The File APIs are not fully supported in this browser.');
        }
    }
});

function getQuestions() {
    $.getJSON(url + "/api/polls/" + pollId, function (data) {
        poll = data;
        //console.log(data);
        buildQuestions();
    })
}

function buildQuestions() {
    var $questions_wrapper = $("#questions-wrapper");
    $questions_wrapper.html("");

    for (var i = 0; i < poll["questions"].length; i++) {
        addQuestion(poll["questions"][i])
    }
}

var questionCount = 0;
var answerCount = 0;
var answerTotalCount = 0;

function addAnswer() {
    var $template = $("#question-edit-answer-template").clone();

    $template.attr("id", "answer_row_" + answerTotalCount);
    $template.find(".remove-button").attr("answer_id", answerTotalCount);
    $template.find(".remove-button").on('click', removeAnswer);

    $("#answers-wrapper").append($template);
    answerCount++;
    answerTotalCount++;
    if (answerCount >= 4) {
        $("#add_answer_button").hide();
    }
}

function removeAnswer(event) {
    var $target = $(event.target);
    var id = $target.attr("answer_id");
    $("#answer_row_" + id).remove();
    if (answerCount < 4) {
        $("#add_answer_button").hide();
    }
    answerCount--;
}

function resetModal() {
    $("#question").val("");
    $('#modal-close-button').prop('onclick', null).off('click');
    $("#answers-wrapper").html("");
    answerCount = 0;
    answerTotalCount = 0;
}

function createQuestion() {
    var id = questionCount;
    var question = $("#question").val();
    var questionData = {
        "htmlId": id,
        "question": question,
        "questionAnswers": []
    };

    $("#answers-wrapper").children().each(function () {
        var correct = $(this).find('input[type="checkbox"]').first().prop("checked");
        var answer = $(this).find('input[type="text"]').first().val();
        //console.log(answer);
        questionData.questionAnswers.push({
            "answer": answer,
            "correct": correct
        });
    });

    poll["questions"].push(questionData);
    addQuestion(questionData);
}

function addQuestion(questionData) {
    var $template = $("#questions-question-template").find("li").first().clone();

    if (questionData.htmlId === undefined) {
        questionData.htmlId = questionCount;
    }

    $template.attr("id", "question_row_" + questionData.htmlId);
    $template.find(".question-text").html(questionData.question);

    $template.find(".remove-button").attr("question_id", questionData.htmlId);
    $template.find(".remove-button").on('click', removeQuestion);
    $template.find(".edit-button").attr("question_id", questionData.htmlId);
    $template.find(".edit-button").on('click', openEditModal);

    $("#questions-wrapper").append($template);
    questionCount++;
}

function removeQuestion(event) {
    var $target = $(event.target);
    var id = Number($target.attr("question_id"));
    $("#question_row_" + id).remove();

    for (var i = 0; i < poll["questions"].length; i++) {
        if (poll["questions"][i].htmlId === id) {
            poll["questions"].splice(i, 1);
            break;
        }
    }
}

function openAddModal() {
    resetModal();
    $("#modal-close-button").click(createQuestion);
    $('#edit-modal').modal('open');
}

function openEditModal(event) {
    resetModal();

    var $target = $(event.target);
    var id = Number($target.attr("question_id"));
    currentlyEditingQuestionId = id;

    var questionData;
    for (var i = 0; i < poll["questions"].length; i++) {
        if (poll["questions"][i].htmlId === id) {
            questionData = poll["questions"][i];
            break;
        }
    }
    if (questionData === null || questionData === undefined) {
        console.log("questionData not found");
    }

    $("#question").val(questionData.question);

    for (var j = 0; j < questionData["questionAnswers"].length; j++) {
        var correct = questionData["questionAnswers"][j].correct;
        var answer = questionData["questionAnswers"][j].answer;

        //console.log(questionData["questionAnswers"][j]);

        addAnswer();
        // answerCount has been reset, every addQuestion adds
        // a question with id-s starting from 0 again
        var answerRow = $("#answer_row_" + j.toString());
        answerRow.find('input[type="checkbox"]').prop("checked", correct);
        answerRow.find('input[type="text"]').val(answer);
    }

    $("#modal-close-button").click(editQuestion);
    $('#edit-modal').modal('open');
}

function editQuestion() {
    var id = currentlyEditingQuestionId;
    var previousData;

    for (var i = 0; i < poll["questions"].length; i++) {
        if (poll["questions"][i].htmlId === id) {
            previousData = poll["questions"][i];
            poll["questions"].splice(i, 1);
            break;
        }
    }
    if (previousData === null || previousData === undefined) {
        console.log("previousData not found");
    }

    $("#question_row_" + id).remove();

    createQuestion();

    currentlyEditingQuestionId = null;
}

function toggleEditTitle() {
    $("#title_edit_div").show();
    $("#title_div").hide();

    $("#poll_title_input").val($("#poll_title").text());
}

function finishEditTitle() {
    cancelEditTitle();
    var $poll_title = $("#poll_title");
    var poll_title = $("#poll_title_input").val();
    $poll_title.text(poll_title);
    poll["title"] = poll_title;
}

function cancelEditTitle() {
    $("#title_edit_div").hide();
    $("#title_div").show();
}

function savePoll() {
    //console.log(poll);

    $.ajax({
            url: url + "/api/polls/" + pollId,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(poll)
            ,
            beforeSend: function (xhr) {
                xhr.setRequestHeader(header, token);
            },
            type: "POST",
            success: function (msg) {
                window.location.replace("/polls");
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest);
            }
        }
    );
}

function readFile() {
    var file = this.files[0];
    if (file.type !== "text/plain" && file.type !== "application/json") {
        if (locale === "et") {
            alert("Fail on ebasobivas formaadis, soovitatud on .json!");
        }
        else {
            alert("File is not in sa supported format, we recommend .json!");
        }
        return;
    }

    var reader = new FileReader();
    reader.onload = addQuestionsFromText;
    reader.readAsText(file);
}

function addQuestionsFromText(e) {
    var text = e.target.result;
    text = text.replace(new RegExp("<", "g"), "&lt")
        .replace(new RegExp(">", "g"), "&gt");

    try {
        var data = JSON.parse(text)["questions"];
    } catch (error) {
        if (locale === "et") {
            alert("Viga JSON parsimisel: " + error.message);
        }
        else {
            alert("Error parsing JSON: " + error.message);
        }
        return;
    }

    for (var i = 0; i < data.length; i++) {
        poll["questions"].push(data[i]);
    }

    buildQuestions();

    if (locale === "et") {
        alert("Küsimuste sisselugemine õnnestus!");
    }
    else {
        alert("Reading in questions successful!");
    }
}
