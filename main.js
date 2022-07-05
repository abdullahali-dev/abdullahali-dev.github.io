function Init() {
  $("#NewGameBtn").popover({
    content: "اضغط هنا للبدء",
    trigger: "manual",
  });

  let gameInfo = localStorage.getItem("gameInfo");
  if (gameInfo != null) {
    gameInfo = JSON.parse(gameInfo);
    window.gameInfo = gameInfo;
    PopulatePlayersTable();
  } else {
    document.getElementById("PlayersTable").style.display = "none";
    document.getElementById("NewGameBtn").focus();
    $("#NewGameBtn").popover("show");
    setTimeout(function () {
      $("#NewGameBtn").popover("hide");
    }, 3000);
  }
}

function NewGame(askConfirm = true) {
  if (askConfirm && window.gameInfo != undefined) {
    let confirm = window.confirm("هل انت متأكد !");
    if (!confirm) {
      return;
    }
  }
  let maxScore = window.prompt("الحد الأعلى للنقاط");
  if (maxScore == null || !maxScore.match("^[0-9]+$")) {
    alert("يجب ادخال رقم صحيح");
    return;
  }
  let gameInfo = localStorage.getItem("gameInfo");
  let players = [];
  if (gameInfo != null) {
    gameInfo = JSON.parse(gameInfo);
    players = gameInfo.players;
    players.forEach((player) => {
      player.Score = 0;
    });
  }
  let currentDate = new Date();
  gameInfo = {
    gameId: Date.now(),
    gameDate: currentDate.toISOString().split("T")[0],
    maxScore: parseInt(maxScore),
    players: players,
  };
  localStorage.setItem("gameInfo", JSON.stringify(gameInfo));
  window.gameInfo = gameInfo;
  PopulatePlayersTable();
  document.getElementById("PlayersTable").style.display = "table";
}

function UpdateCurrentGame() {
  let gameInfo = localStorage.getItem("gameInfo");
  gameInfo = JSON.parse(gameInfo);
  gameInfo.players = window.gameInfo.players;
  localStorage.setItem("gameInfo", JSON.stringify(gameInfo));
}

function AddPlayer() {
  let id = window.gameInfo.players.length + 1;
  let name = document.getElementById("PlayerNameInput");
  if (name.value == "") {
    name.style.borderColor = "red";
    name.focus();
    return;
  } else {
    name.style.borderColor = "#ced4da";
  }
  window.gameInfo.players.push({
    ID: Date.now(),
    Name: name.value,
    Score: 0,
  });
  name.value = "";
  PopulatePlayersTable();
}

function InitAction(actionType) {
  window.gameInfo.players = window.gameInfo.players.sort((x, y) => x.ID - y.ID);
  if (localStorage.getItem("gameInfo") == null) {
    document.getElementById("NewGameBtn").focus();
    $("#NewGameBtn").popover("show");
    setTimeout(function () {
      $("#NewGameBtn").popover("hide");
    }, 3000);
    return;
  }
  let multipleBy = 1;
  let isHandType = false;
  let arActionName = "";
  switch (actionType) {
    case "Hand":
      multipleBy = 1;
      isHandType = true;
      arActionName = "هند";
      break;
    case "SuperHand":
      multipleBy = 2;
      isHandType = true;
      arActionName = "سوبر هند";
      break;
    case "FullHand":
      multipleBy = 3;
      isHandType = true;
      arActionName = "فل هند";
      break;
    case "Finished":
      multipleBy = 1;
      isHandType = false;
      arActionName = "خالص";
      break;
  }
  let loserNum = isHandType == true ? 200 : 100;
  let winnerNum = isHandType == true ? -60 : -30;
  let actionScore = loserNum * multipleBy;

  let tbody = document.getElementById("PlayersInputTbody");
  tbody.innerHTML = "";
  for (let i = 0; i < window.gameInfo.players.length; i++) {
    //tr
    let tr = document.createElement("tr");
    tr.id = "input-tr-" + window.gameInfo.players[i].ID;

    //Name
    let tdName = document.createElement("td");
    tdName.innerText = window.gameInfo.players[i].Name;
    tr.appendChild(tdName);

    //Score
    let tdScore = document.createElement("td");
    inputScore = document.createElement("input");
    let inputId = "input-box-" + window.gameInfo.players[i].ID;
    inputScore.id = inputId;
    inputScore.value = actionScore;
    inputScore.type = "tel";
    inputScore.addEventListener("click", function (e) {
      e.target.value = "";
    });
    tdScore.appendChild(inputScore);
    tr.appendChild(tdScore);

    let tdActions = document.createElement("td");

    //Plus Btn
    let plus50Id = "plus-btn-" + window.gameInfo.players[i].ID;
    if (isHandType) {
      let plus50 = document.createElement("button");
      plus50.id = plus50Id;
      plus50.addEventListener("click", function (e) {
        document.getElementById(inputId).value = 50 * multipleBy + actionScore;
        let plusBtns = document.getElementsByClassName("plus-btn");
        for (let i = 0; i < plusBtns.length; i++) {
          plusBtns[i].disabled = true;
          plusBtns[i].classList = ["btn btn-secondary mx-1 plus-btn"];
        }
      });
      plus50.classList = ["btn btn-primary mx-1 plus-btn"];
      plus50.innerText = "+" + 50 * multipleBy;
      tdActions.appendChild(plus50);
    }

    // Action Btn
    let actionBtn = document.createElement("button");
    actionBtn.addEventListener("click", function (e) {
      document.getElementById(inputId).value = winnerNum * multipleBy;
      if (isHandType) {
        document.getElementById(plus50Id).disabled = true;
        document.getElementById(plus50Id).classList = ["btn btn-secondary mx-1 plus-btn"];
      }
      let actionBtns = document.getElementsByClassName("action-btn");
      for (let i = 0; i < actionBtns.length; i++) {
        actionBtns[i].disabled = true;
        actionBtns[i].classList = ["btn btn-secondary action-btn"];
      }
    });
    actionBtn.classList = ["btn btn-success action-btn"];
    actionBtn.innerText = arActionName;
    tdActions.appendChild(actionBtn);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  }
  $("#PlayersInputModal").modal("toggle");
}

function DoAction() {
  let gameInfo = localStorage.getItem("gameInfo");
  gameInfo = JSON.parse(gameInfo);
  localStorage.setItem("gameInfoBackup", JSON.stringify(gameInfo));
  for (let i = 0; i < window.gameInfo.players.length; i++) {
    let playerID = window.gameInfo.players[i].ID;
    let input = document.getElementById("input-box-" + playerID);
    if (input.value.match("^-?[0-9]+$")) {
      window.gameInfo.players[i].Score += parseInt(input.value);
    }
  }
  window.gameInfo.players = window.gameInfo.players.filter((player) => player.Score < window.gameInfo.maxScore);
  UpdateCurrentGame();
  PopulatePlayersTable();

  $("#PlayersInputModal").modal("toggle");
}
function Undo() {
  let gameBackup = localStorage.getItem("gameInfoBackup");
  if (gameBackup != null) {
    gameBackup = JSON.parse(gameBackup);
    window.gameInfo.players = gameBackup.players;
    UpdateCurrentGame();
    PopulatePlayersTable();
  }
}

function PopulatePlayersTable() {
  window.gameInfo.players = window.gameInfo.players.sort((x, y) => Number(x.Score) - Number(y.Score));
  let tbody = document.getElementById("PlayersTbody");
  tbody.innerHTML = "";
  for (let i = 0; i < window.gameInfo.players.length; i++) {
    let playerID = window.gameInfo.players[i].ID;

    let tr = document.createElement("tr");
    tr.id = playerID;

    let tdSort = document.createElement("td");
    tdSort.innerText = i + 1;
    tdSort.style.width = "10px";

    let tdName = document.createElement("td");
    tdName.innerText = window.gameInfo.players[i].Name;

    let tdScore = document.createElement("td");
    tdScore.innerText = window.gameInfo.players[i].Score;

    let btnDel = document.createElement("button");
    btnDel.innerText = "X";
    btnDel.classList = ["btn-colse text-danger float-left d-inline"];
    btnDel.dataset.id = playerID;
    btnDel.addEventListener("click", function (e) {
      if (confirm("هل انت متأكد ؟")) {
        window.gameInfo.players = window.gameInfo.players.filter((player) => player.ID != e.currentTarget.dataset.id);
        UpdateCurrentGame();
        PopulatePlayersTable();
      }
    });

    let tdDel = document.createElement("td");
    tdDel.appendChild(btnDel);
    if (window.gameInfo.players.length > 1 && window.gameInfo.players.filter((x) => x.Score != 0).length > 0) {
      if (i == window.gameInfo.players.length - 2) {
        let span = document.createElement("span");
        span.classList = ["badge badge-warning float-right"];
        span.style.verticalAlign = "middle";
        span.innerText = "يجرش";
        tdDel.appendChild(span);
      }
      if (i == window.gameInfo.players.length - 1) {
        let span = document.createElement("span");
        span.classList = ["badge badge-warning float-right"];
        span.style.verticalAlign = "middle";
        span.innerText = "يوزع";
        tdDel.appendChild(span);
      }
    }

    tr.appendChild(tdSort);
    tr.appendChild(tdName);
    tr.appendChild(tdScore);
    tr.appendChild(tdDel);
    tbody.appendChild(tr);
  }

  UpdateCurrentGame();
}
